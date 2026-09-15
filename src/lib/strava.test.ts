import { afterEach, describe, expect, it, vi } from "vitest";

import { isRunningActivity, mapActivityToRun, type StravaActivity } from "./strava";

function activity(overrides: Partial<StravaActivity> = {}): StravaActivity {
  return {
    id: 123,
    name: "Morning Run",
    type: "Run",
    start_date_local: "2024-05-04T07:30:00Z",
    distance: 10000,
    moving_time: 3000,
    ...overrides,
  };
}

describe("isRunningActivity", () => {
  it.each(["Run", "TrailRun", "VirtualRun"])("accepts %s", (type) => {
    expect(isRunningActivity(activity({ type }))).toBe(true);
  });

  it.each(["Ride", "Swim", "Walk", "Hike"])("rejects %s", (type) => {
    expect(isRunningActivity(activity({ type }))).toBe(false);
  });

  it("prefers sport_type over type when both are present", () => {
    expect(isRunningActivity(activity({ type: "Ride", sport_type: "TrailRun" }))).toBe(
      true
    );
    expect(isRunningActivity(activity({ type: "Run", sport_type: "Ride" }))).toBe(false);
  });

  it("falls back to type when sport_type is absent", () => {
    expect(isRunningActivity(activity({ type: "Run", sport_type: undefined }))).toBe(
      true
    );
  });
});

describe("mapActivityToRun", () => {
  it("converts metres to kilometres and seconds to minutes", () => {
    const mapped = mapActivityToRun(activity());

    expect(mapped.distanceKm).toBe(10);
    expect(mapped.durationMinutes).toBe(50);
  });

  it("rounds to two decimals", () => {
    const mapped = mapActivityToRun(
      activity({ distance: 5432.1, moving_time: 1337 })
    );

    expect(mapped.distanceKm).toBe(5.43);
    expect(mapped.durationMinutes).toBe(22.28);
  });

  it("takes the calendar date from the local start date", () => {
    expect(mapActivityToRun(activity()).date).toBe("2024-05-04");
  });

  it("tags the run as imported and keeps the dedup key", () => {
    const mapped = mapActivityToRun(activity({ id: 987 }));

    expect(mapped.source).toBe("strava");
    expect(mapped.stravaActivityId).toBe(987);
  });

  it("uses the activity name as the route", () => {
    expect(mapActivityToRun(activity({ name: "Hill repeats" })).route).toBe(
      "Hill repeats"
    );
  });

  it("falls back to a placeholder route when the name is empty", () => {
    expect(mapActivityToRun(activity({ name: "" })).route).toBe("Strava activity");
  });

  it("records temperature as weather when Strava reports it", () => {
    expect(mapActivityToRun(activity({ average_temp: 12 })).weather).toBe("12°C");
    expect(mapActivityToRun(activity({ average_temp: 0 })).weather).toBe("0°C");
  });

  it("leaves weather undefined when temperature is missing", () => {
    expect(mapActivityToRun(activity({ average_temp: null })).weather).toBeUndefined();
    expect(
      mapActivityToRun(activity({ average_temp: undefined })).weather
    ).toBeUndefined();
  });
});

describe("buildAuthorizeUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function importWithEnv(env: Record<string, string | undefined>) {
    vi.resetModules();
    Object.entries(env).forEach(([key, value]) => vi.stubEnv(key, value));
    return import("./strava");
  }

  it("builds an authorize URL carrying the client id, redirect and state", async () => {
    const { buildAuthorizeUrl } = await importWithEnv({
      STRAVA_CLIENT_ID: "12345",
      STRAVA_CLIENT_SECRET: "shhh",
      STRAVA_REDIRECT_URI: "http://localhost:3000/api/strava/callback",
    });

    const url = new URL(buildAuthorizeUrl("csrf-token"));

    expect(url.origin + url.pathname).toBe("https://www.strava.com/oauth/authorize");
    expect(url.searchParams.get("client_id")).toBe("12345");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3000/api/strava/callback"
    );
    expect(url.searchParams.get("state")).toBe("csrf-token");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("scope")).toBe("activity:read_all");
  });

  it("never leaks the client secret into the URL", async () => {
    const { buildAuthorizeUrl } = await importWithEnv({
      STRAVA_CLIENT_ID: "12345",
      STRAVA_CLIENT_SECRET: "super-secret",
      STRAVA_REDIRECT_URI: "http://localhost:3000/api/strava/callback",
    });

    expect(buildAuthorizeUrl("state")).not.toContain("super-secret");
  });

  it("reports Strava as unconfigured when variables are missing", async () => {
    const { stravaConfigured, buildAuthorizeUrl } = await importWithEnv({
      STRAVA_CLIENT_ID: undefined,
      STRAVA_CLIENT_SECRET: undefined,
      STRAVA_REDIRECT_URI: undefined,
    });

    expect(stravaConfigured).toBe(false);
    expect(() => buildAuthorizeUrl("state")).toThrow(/STRAVA_CLIENT_ID/);
  });

  it("throws when the redirect URI alone is missing", async () => {
    const { buildAuthorizeUrl } = await importWithEnv({
      STRAVA_CLIENT_ID: "12345",
      STRAVA_CLIENT_SECRET: "shhh",
      STRAVA_REDIRECT_URI: undefined,
    });

    expect(() => buildAuthorizeUrl("state")).toThrow(/STRAVA_REDIRECT_URI/);
  });
});
