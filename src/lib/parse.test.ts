import { describe, expect, it } from "vitest";

import { mapRacePayload, mapRunPayload, optionalValue, parseDuration } from "./parse";

function formOf(fields: Record<string, string>) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

const validRunFields = {
  date: "2024-05-04",
  route: "Riverside loop",
  distance: "10",
  duration: "50",
};

const validRaceFields = {
  name: "Stockholm Marathon",
  city: "Stockholm",
  raceDate: "2024-06-01",
  raceDistance: "42.195",
};

describe("parseDuration", () => {
  it("reads a plain minutes value", () => {
    expect(parseDuration("45")).toBe(45);
    expect(parseDuration("  45  ")).toBe(45);
    expect(parseDuration("7.5")).toBe(7.5);
  });

  it("reads h:mm", () => {
    expect(parseDuration("1:30")).toBe(90);
    expect(parseDuration("0:45")).toBe(45);
    expect(parseDuration("2:00")).toBe(120);
  });

  it("reads h:mm:ss", () => {
    expect(parseDuration("1:30:45")).toBe(90.75);
    expect(parseDuration("0:00:30")).toBe(0.5);
  });

  it.each(["", "   ", "abc", "1:abc", "1:2:3:4"])(
    "rejects unparseable input %o",
    (input) => {
      expect(parseDuration(input)).toBeNull();
    }
  );

  it("rejects a non-positive plain value", () => {
    expect(parseDuration("0")).toBeNull();
    expect(parseDuration("-5")).toBeNull();
  });

  it("returns zero rather than null for a zeroed clock value", () => {
    expect(parseDuration("0:00")).toBe(0);
  });
});

describe("optionalValue", () => {
  it("trims and returns a present value", () => {
    expect(optionalValue(formOf({ notes: "  felt strong  " }), "notes")).toBe(
      "felt strong"
    );
  });

  it("returns undefined for missing, empty, or whitespace-only fields", () => {
    expect(optionalValue(formOf({}), "notes")).toBeUndefined();
    expect(optionalValue(formOf({ notes: "" }), "notes")).toBeUndefined();
    expect(optionalValue(formOf({ notes: "   " }), "notes")).toBeUndefined();
  });
});

describe("mapRunPayload", () => {
  it("maps a complete form", () => {
    const payload = mapRunPayload(
      formOf({
        ...validRunFields,
        terrain: "trail",
        effort: "steady",
        weather: "12°C",
        notes: "  negative split  ",
      })
    );

    expect(payload).toEqual({
      date: "2024-05-04",
      route: "Riverside loop",
      distanceKm: 10,
      durationMinutes: 50,
      terrain: "trail",
      effort: "steady",
      weather: "12°C",
      notes: "negative split",
    });
  });

  it("leaves optional fields undefined when absent", () => {
    const payload = mapRunPayload(formOf(validRunFields));

    expect(payload).toMatchObject({ route: "Riverside loop" });
    expect(payload?.terrain).toBeUndefined();
    expect(payload?.effort).toBeUndefined();
    expect(payload?.weather).toBeUndefined();
    expect(payload?.notes).toBeUndefined();
  });

  it("trims the route", () => {
    expect(mapRunPayload(formOf({ ...validRunFields, route: "  Loop  " }))?.route).toBe(
      "Loop"
    );
  });

  it("rounds distance and duration to two decimals", () => {
    const payload = mapRunPayload(
      formOf({ ...validRunFields, distance: "10.567", duration: "1:30:45" })
    );

    expect(payload?.distanceKm).toBe(10.57);
    expect(payload?.durationMinutes).toBe(90.75);
  });

  it("accepts a clock-style duration", () => {
    expect(
      mapRunPayload(formOf({ ...validRunFields, duration: "1:30" }))?.durationMinutes
    ).toBe(90);
  });

  it.each([
    ["missing date", { date: "" }],
    ["blank route", { route: "   " }],
    ["zero distance", { distance: "0" }],
    ["negative distance", { distance: "-4" }],
    ["non-numeric distance", { distance: "abc" }],
    ["missing duration", { duration: "" }],
    ["unparseable duration", { duration: "abc" }],
    ["zeroed duration", { duration: "0:00" }],
  ])("returns null for %s", (_label, override) => {
    expect(mapRunPayload(formOf({ ...validRunFields, ...override }))).toBeNull();
  });
});

describe("mapRacePayload", () => {
  it("maps a complete form", () => {
    const payload = mapRacePayload(
      formOf({
        ...validRaceFields,
        goalTime: "3:30:00",
        website: "https://example.com",
        raceNotes: "goal race",
      })
    );

    expect(payload).toEqual({
      name: "Stockholm Marathon",
      city: "Stockholm",
      raceDate: "2024-06-01",
      distanceKm: 42.2,
      goalTime: "3:30:00",
      website: "https://example.com",
      notes: "goal race",
    });
  });

  it("defaults city to TBD when omitted", () => {
    const { city, ...withoutCity } = validRaceFields;
    void city;
    expect(mapRacePayload(formOf(withoutCity))?.city).toBe("TBD");
  });

  it("rounds distance to one decimal", () => {
    expect(
      mapRacePayload(formOf({ ...validRaceFields, raceDistance: "21.0975" }))?.distanceKm
    ).toBe(21.1);
  });

  it.each([
    ["missing name", { name: "" }],
    ["whitespace-only name", { name: "   " }],
    ["missing race date", { raceDate: "" }],
    ["zero distance", { raceDistance: "0" }],
    ["non-numeric distance", { raceDistance: "abc" }],
  ])("returns null for %s", (_label, override) => {
    expect(mapRacePayload(formOf({ ...validRaceFields, ...override }))).toBeNull();
  });
});
