import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildRunStats, formatDate, formatDuration, formatPace } from "./stats";
import type { Race, Run } from "./types";

function run(date: string, distanceKm: number, durationMinutes: number): Run {
  return {
    type: "run",
    date,
    route: `Run on ${date}`,
    distanceKm,
    durationMinutes,
    createdAt: "2024-01-01T00:00:00.000Z",
  };
}

function race(name: string, raceDate: string): Race {
  return {
    type: "race",
    name,
    city: "Stockholm",
    raceDate,
    distanceKm: 21.1,
    createdAt: "2024-01-01T00:00:00.000Z",
  };
}

describe("buildRunStats", () => {
  it("returns zeroed stats when there are no runs", () => {
    expect(buildRunStats([], [])).toEqual({
      totalDistance: 0,
      totalDuration: 0,
      averagePace: null,
      biggestWeekDistance: 0,
      longestRun: null,
      nextRace: null,
    });
  });

  it("totals distance and duration and derives average pace", () => {
    const stats = buildRunStats(
      [run("2024-01-01", 10, 50), run("2024-01-03", 5, 30)],
      []
    );

    expect(stats.totalDistance).toBe(15);
    expect(stats.totalDuration).toBe(80);
    expect(stats.averagePace).toBeCloseTo(80 / 15);
  });

  it("picks the longest run", () => {
    const longest = run("2024-01-03", 21, 120);
    const stats = buildRunStats([run("2024-01-01", 10, 50), longest], []);

    expect(stats.longestRun).toBe(longest);
  });

  it("keeps the later run when distances tie", () => {
    const last = run("2024-01-03", 10, 55);
    const stats = buildRunStats([run("2024-01-01", 10, 50), last], []);

    expect(stats.longestRun).toBe(last);
  });

  it("sums the biggest 7-day bucket, counted from Jan 1", () => {
    const stats = buildRunStats(
      [
        run("2024-01-01", 10, 50),
        run("2024-01-05", 5, 25),
        run("2024-01-08", 8, 40),
      ],
      []
    );

    expect(stats.biggestWeekDistance).toBe(15);
  });

  it("finds the earliest race that has not happened yet", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-05-04T12:00:00Z"));

    const stats = buildRunStats(
      [run("2024-05-01", 10, 50)],
      [
        race("Autumn 10k", "2024-09-01"),
        race("Past race", "2024-01-01"),
        race("Spring half", "2024-06-01"),
      ]
    );

    expect(stats.nextRace?.name).toBe("Spring half");
    vi.useRealTimers();
  });

  it("treats a race happening today as upcoming", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-01T09:00:00Z"));

    const stats = buildRunStats([], [race("Today", "2024-06-01")]);

    expect(stats.nextRace?.name).toBe("Today");
    vi.useRealTimers();
  });

  it("returns no next race when every race is in the past", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-01T09:00:00Z"));

    expect(buildRunStats([], [race("Past", "2024-01-01")]).nextRace).toBeNull();
    vi.useRealTimers();
  });
});

describe("formatPace", () => {
  it("formats minutes per kilometre", () => {
    expect(formatPace(5.5)).toBe("5:30 /km");
    expect(formatPace(4)).toBe("4:00 /km");
    expect(formatPace(6.25)).toBe("6:15 /km");
  });

  it("zero-pads seconds", () => {
    expect(formatPace(5.05)).toBe("5:03 /km");
  });

  it("carries a rounded 60 into the next minute", () => {
    expect(formatPace(4.999)).toBe("5:00 /km");
  });

  it.each([null, 0, NaN])("renders a dash for %o", (value) => {
    expect(formatPace(value)).toBe("—");
  });
});

describe("formatDuration", () => {
  it("shows minutes only under an hour", () => {
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(0)).toBe("0m");
  });

  it("shows hours and zero-padded minutes", () => {
    expect(formatDuration(90)).toBe("1h 30m");
    expect(formatDuration(125.6)).toBe("2h 06m");
  });

  it("carries a rounded 60 into the next hour", () => {
    expect(formatDuration(119.7)).toBe("2h 00m");
    expect(formatDuration(59.7)).toBe("1h 00m");
  });
});

describe("formatDate", () => {
  const originalTz = process.env.TZ;

  beforeEach(() => {
    process.env.TZ = "UTC";
  });

  afterEach(() => {
    process.env.TZ = originalTz;
  });

  it("formats an ISO date as month and day", () => {
    expect(formatDate("2024-03-15")).toBe("Mar 15");
  });

  it("honours caller-supplied options", () => {
    expect(formatDate("2024-03-15", { year: "numeric" })).toBe("Mar 15, 2024");
    expect(formatDate("2024-03-15", { weekday: "short" })).toBe("Fri, Mar 15");
  });
});
