import type { Race, Run } from "./types";

export type RunStats = {
  totalDistance: number;
  totalDuration: number;
  averagePace: number | null;
  biggestWeekDistance: number;
  longestRun: Run | null;
  nextRace: Race | null;
};

export function buildRunStats(runs: Run[], races: Race[]): RunStats {
  if (!runs.length) {
    return {
      totalDistance: 0,
      totalDuration: 0,
      averagePace: null,
      biggestWeekDistance: 0,
      longestRun: null,
      nextRace: getNextRace(races),
    };
  }

  const totalDistance = runs.reduce((sum, run) => sum + run.distanceKm, 0);
  const totalDuration = runs.reduce((sum, run) => sum + run.durationMinutes, 0);
  const averagePace = totalDistance > 0 ? totalDuration / totalDistance : null;
  const longestRun = runs.reduce((prev, curr) =>
    prev.distanceKm > curr.distanceKm ? prev : curr
  );

  const biggestWeekDistance = getBestWeek(runs);

  return {
    totalDistance,
    totalDuration,
    averagePace,
    biggestWeekDistance,
    longestRun,
    nextRace: getNextRace(races),
  };
}

function getBestWeek(runs: Run[]) {
  const byWeek = new Map<string, number>();
  runs.forEach((run) => {
    const date = new Date(run.date);
    const year = date.getUTCFullYear();
    const firstJan = new Date(Date.UTC(year, 0, 1));
    const weekNumber =
      Math.floor((date.getTime() - firstJan.getTime()) / (7 * 86400000)) + 1;
    const key = `${year}-W${weekNumber}`;
    byWeek.set(key, (byWeek.get(key) || 0) + run.distanceKm);
  });

  return Math.max(0, ...byWeek.values());
}

function getNextRace(races: Race[]): Race | null {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = races
    .filter((race) => race.raceDate >= today)
    .sort((a, b) => a.raceDate.localeCompare(b.raceDate));
  return upcoming[0] ?? null;
}

export function formatPace(minutesPerKm: number | null) {
  if (!minutesPerKm || Number.isNaN(minutesPerKm)) {
    return "—";
  }
  const wholeMinutes = Math.floor(minutesPerKm);
  const seconds = Math.round((minutesPerKm - wholeMinutes) * 60);
  return `${wholeMinutes}:${seconds.toString().padStart(2, "0")} /km`;
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (!hours) {
    return `${mins}m`;
  }
  return `${hours}h ${mins.toString().padStart(2, "0")}m`;
}

export function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(options ?? {}),
  }).format(new Date(date));
}
