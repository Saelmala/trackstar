export type Run = {
  _id?: string;
  _rev?: string;
  type: "run";
  date: string; // ISO date (yyyy-mm-dd)
  route: string;
  distanceKm: number;
  durationMinutes: number;
  terrain?: string;
  effort?: "easy" | "steady" | "tempo" | "intervals" | "long" | string;
  weather?: string;
  notes?: string;
  createdAt: string;
  source?: "manual" | "strava";
  stravaActivityId?: number; // dedup key, only set when source === "strava"
};

export type Race = {
  _id?: string;
  _rev?: string;
  type: "race";
  name: string;
  city: string;
  raceDate: string; // ISO date
  distanceKm: number;
  goalTime?: string;
  website?: string;
  notes?: string;
  createdAt: string;
};

export type NewRun = Omit<Run, "_id" | "_rev" | "type" | "createdAt">;
export type NewRace = Omit<Race, "_id" | "_rev" | "type" | "createdAt">;

export type StravaConnection = {
  _id?: string;
  _rev?: string;
  type: "stravaConnection";
  userId: string; // session.userId, one connection per user
  athleteId: number;
  athleteName?: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: number; // epoch seconds
  scope: string;
  connectedAt: string;
  lastSyncedAt?: string; // ISO timestamp of last successful sync, used as the `after` cursor
};
