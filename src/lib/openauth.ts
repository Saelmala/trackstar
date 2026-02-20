import "server-only";

import { Buffer } from "node:buffer";

type PasswordLoginArgs = {
  identifier: string;
  password: string;
};

export type OpenAuthPasswordResponse = {
  userId?: string;
  email?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  [key: string]: unknown;
};

const openAuthUrl = process.env.OPENAUTH_PASSWORD_URL;
const openAuthAppId = process.env.OPENAUTH_APP_ID;
const openAuthAppSecret = process.env.OPENAUTH_APP_SECRET;

function requireOpenAuthConfig() {
  if (!openAuthUrl) {
    throw new Error("OPENAUTH_PASSWORD_URL is not configured.");
  }
  if (!openAuthAppId || !openAuthAppSecret) {
    throw new Error("OPENAUTH_APP_ID and OPENAUTH_APP_SECRET must be configured.");
  }
}

export async function passwordLogin({
  identifier,
  password,
}: PasswordLoginArgs): Promise<OpenAuthPasswordResponse> {
  requireOpenAuthConfig();

  const headers = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Basic ${Buffer.from(`${openAuthAppId}:${openAuthAppSecret}`, "utf-8").toString(
      "base64"
    )}`,
  });

  const payload: Record<string, string> = {
    identifier,
    username: identifier,
    password,
  };
  if (identifier.includes("@")) {
    payload.email = identifier;
  }

  const res = await fetch(openAuthUrl!, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `OpenAuth request failed (${res.status} ${res.statusText})`;
    try {
      const errorBody = await res.json();
      if (errorBody && typeof errorBody === "object") {
        const candidate =
          (errorBody as Record<string, string>).error ??
          (errorBody as Record<string, string>).message ??
          (errorBody as Record<string, string>).reason;
        if (candidate) {
          message = candidate;
        }
      }
    } catch {
      const fallback = await res.text();
      if (fallback) {
        message = fallback;
      }
    }
    throw new Error(message);
  }

  try {
    const data = (await res.json()) as OpenAuthPasswordResponse;
    return data;
  } catch {
    return {};
  }
}
