import { type NextRequest, NextResponse } from "next/server";

import { exchangeCodeForToken } from "@/lib/strava";
import { upsertStravaConnection } from "@/lib/couchdb";
import { getSession } from "@/lib/session";
import { STRAVA_OAUTH_STATE_COOKIE } from "../connect/route";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get(STRAVA_OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    const response = NextResponse.redirect(new URL("/?error=strava_state_mismatch", request.url));
    response.cookies.delete(STRAVA_OAUTH_STATE_COOKIE);
    return response;
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.delete(STRAVA_OAUTH_STATE_COOKIE);

  try {
    const tokenResponse = await exchangeCodeForToken(code);
    if (!tokenResponse.athlete?.id) {
      throw new Error("Strava token response did not include an athlete id.");
    }

    await upsertStravaConnection({
      userId: session.userId,
      athleteId: tokenResponse.athlete.id,
      athleteName:
        [tokenResponse.athlete.firstname, tokenResponse.athlete.lastname]
          .filter(Boolean)
          .join(" ") || undefined,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenExpiresAt: tokenResponse.expires_at,
      scope: "activity:read_all",
      connectedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Strava connect failed:", error);
    const failureResponse = NextResponse.redirect(
      new URL("/?error=strava_connect_failed", request.url)
    );
    failureResponse.cookies.delete(STRAVA_OAUTH_STATE_COOKIE);
    return failureResponse;
  }

  return response;
}
