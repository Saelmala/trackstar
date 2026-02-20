import "server-only";

import { Buffer } from "node:buffer";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";

export type SessionData = {
  sessionId: string;
  userId: string;
  email?: string;
  token?: string;
  issuedAt: number;
};

const SESSION_COOKIE = "trackstar_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function requireSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured.");
  }
  return secret;
}

function signPayload(payload: string) {
  const secret = requireSessionSecret();
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function encodeSession(session: SessionData) {
  const payload = Buffer.from(JSON.stringify(session), "utf-8").toString("base64url");
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

function decodeSession(value: string): SessionData | null {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload);
  const signatureBuffer = Buffer.from(signature, "base64url");
  const expectedBuffer = Buffer.from(expectedSignature, "base64url");
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const json = Buffer.from(payload, "base64url").toString("utf-8");
    return JSON.parse(json) as SessionData;
  } catch {
    return null;
  }
}

function readSessionCookie(): string | null {
  try {
    const store = cookies();
    const rawCookie = typeof store?.get === "function" ? store.get(SESSION_COOKIE) : undefined;
    if (rawCookie?.value) {
      return rawCookie.value;
    }
  } catch {
    // ignore and fall back to headers parsing
  }

  try {
    const headerStore = headers();
    const cookieHeader =
      typeof headerStore?.get === "function" ? headerStore.get("cookie") : undefined;
    if (!cookieHeader) {
      return null;
    }
    const match = cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
    if (!match) {
      return null;
    }
    const [, value = ""] = match.split("=", 2);
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export function getSession(): SessionData | null {
  const rawValue = readSessionCookie();
  if (!rawValue) {
    return null;
  }

  try {
    return decodeSession(rawValue);
  } catch {
    return null;
  }
}

export function requireSession(): SessionData {
  const session = getSession();
  if (!session) {
    throw new Error("User is not authenticated.");
  }
  return session;
}

export function createSession(payload: { userId: string; email?: string; token?: string }) {
  const session: SessionData = {
    sessionId: randomUUID(),
    issuedAt: Date.now(),
    ...payload,
  };

  cookies().set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return session;
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE);
}
