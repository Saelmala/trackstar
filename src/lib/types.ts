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
