import "server-only";

import type { NewRun } from "./types";

const STRAVA_AUTHORIZE_URL = "https://www.strava.com/oauth/authorize";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_DEAUTHORIZE_URL = "https://www.strava.com/oauth/deauthorize";
const STRAVA_API_BASE = "https://www.strava.com/api/v3";

const stravaClientId = process.env.STRAVA_CLIENT_ID;
const stravaClientSecret = process.env.STRAVA_CLIENT_SECRET;
const stravaRedirectUri = process.env.STRAVA_REDIRECT_URI;

export const stravaConfigured =
  Boolean(stravaClientId) && Boolean(stravaClientSecret) && Boolean(stravaRedirectUri);

function requireStravaConfig() {
  if (!stravaClientId || !stravaClientSecret) {
    throw new Error("STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET must be configured.");
  }
  if (!stravaRedirectUri) {
    throw new Error("STRAVA_REDIRECT_URI is not configured.");
  }
}

export type StravaTokenResponse = {
  token_type?: string;
  expires_at: number;
  expires_in?: number;
  refresh_token: string;
  access_token: string;
  athlete?: {
    id: number;
    firstname?: string;
    lastname?: string;
  };
  [key: string]: unknown;
};

export type StravaActivity = {
  id: number;
  name: string;
  type: string;
  sport_type?: string;
  start_date_local: string;
  distance: number; // meters
  moving_time: number; // seconds
  average_temp?: number | null;
  workout_type?: number | null;
  [key: string]: unknown;
};

function buildAuthHeaders() {
  return new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
  });
}

async function parseErrorMessage(res: Response, fallbackPrefix: string) {
  let message = `${fallbackPrefix} (${res.status} ${res.statusText})`;
  try {
    const errorBody = await res.json();
    if (errorBody && typeof errorBody === "object") {
      const candidate =
        (errorBody as Record<string, unknown>).message ??
        (errorBody as Record<string, unknown>).error;
      if (candidate) {
        message = String(candidate);
      }
    }
  } catch {
    const fallback = await res.text();
    if (fallback) {
      message = fallback;
    }
  }
  return message;
}

export function buildAuthorizeUrl(state: string) {
  requireStravaConfig();

  const params = new URLSearchParams({
    client_id: stravaClientId!,
    redirect_uri: stravaRedirectUri!,
    response_type: "code",
    approval_prompt: "auto",
    scope: "activity:read_all",
    state,
  });

  return `${STRAVA_AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<StravaTokenResponse> {
  requireStravaConfig();

  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      client_id: stravaClientId,
      client_secret: stravaClientSecret,
      code,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Strava token exchange failed"));
  }

  return (await res.json()) as StravaTokenResponse;
}

export async function refreshAccessToken(refreshToken: string): Promise<StravaTokenResponse> {
  requireStravaConfig();

  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      client_id: stravaClientId,
      client_secret: stravaClientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Strava token refresh failed"));
  }

  return (await res.json()) as StravaTokenResponse;
}

export async function deauthorize(accessToken: string): Promise<void> {
  const res = await fetch(STRAVA_DEAUTHORIZE_URL, {
    method: "POST",
    headers: new Headers({
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    // Best-effort — the caller disconnects locally regardless of this result.
    throw new Error(await parseErrorMessage(res, "Strava deauthorize failed"));
  }
}

export async function listActivities(
  accessToken: string,
  afterEpochSeconds?: number
): Promise<StravaActivity[]> {
  const params = new URLSearchParams({ per_page: "100" });
  if (afterEpochSeconds) {
    params.set("after", String(afterEpochSeconds));
  }

  const res = await fetch(`${STRAVA_API_BASE}/athlete/activities?${params.toString()}`, {
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Strava activities request failed"));
  }

  const activities = (await res.json()) as StravaActivity[];
  if (activities.length === 100) {
    console.warn(
      "Strava sync fetched a full page of 100 activities — there may be more since the last sync that were not imported this run."
    );
  }
  return activities;
}

const RUNNING_TYPES = new Set(["Run", "TrailRun", "VirtualRun"]);

export function isRunningActivity(activity: StravaActivity) {
  return RUNNING_TYPES.has(activity.sport_type ?? activity.type);
}

export function mapActivityToRun(
  activity: StravaActivity
): NewRun & { stravaActivityId: number } {
  return {
    date: activity.start_date_local.slice(0, 10),
    route: activity.name || "Strava activity",
    distanceKm: Number((activity.distance / 1000).toFixed(2)),
    durationMinutes: Number((activity.moving_time / 60).toFixed(2)),
    weather:
      typeof activity.average_temp === "number" ? `${activity.average_temp}°C` : undefined,
    source: "strava",
    stravaActivityId: activity.id,
  };
}
