import { randomUUID } from "node:crypto";

import { type NextRequest, NextResponse } from "next/server";

import { buildAuthorizeUrl } from "@/lib/strava";
import { getSession } from "@/lib/session";

export const STRAVA_OAUTH_STATE_COOKIE = "strava_oauth_state";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const state = randomUUID();
  const response = NextResponse.redirect(buildAuthorizeUrl(state));

  response.cookies.set(STRAVA_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600, // 10 minutes — only needs to survive the round trip to Strava and back
  });

  return response;
}
