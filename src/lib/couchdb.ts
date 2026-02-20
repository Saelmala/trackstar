import "server-only";

import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";

import type { NewRace, NewRun, Race, Run } from "./types";

type MangoResponse<T> = {
  docs: T[];
};

type CouchPostResponse = {
  ok: boolean;
  id: string;
  rev: string;
};

const couchUrl = process.env.COUCHDB_URL?.replace(/\/$/, "");
const couchDb = process.env.COUCHDB_DB;
const couchUser = process.env.COUCHDB_USERNAME;
const couchPass = process.env.COUCHDB_PASSWORD;

export const couchConfigured =
  Boolean(couchUrl) && Boolean(couchDb) && Boolean(couchUser) && Boolean(couchPass);

const authHeader = couchConfigured
  ? `Basic ${Buffer.from(`${couchUser}:${couchPass}`, "utf-8").toString("base64")}`
  : undefined;

async function couchFetch(path: string, init?: RequestInit) {
  if (!couchConfigured || !couchUrl) {
    throw new Error("CouchDB is not configured. Provide credentials in .env.local");
  }

  const sanitizedPath = path.replace(/^\/+/, "");
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (authHeader) {
    headers.set("Authorization", authHeader);
  }

  const res = await fetch(`${couchUrl}/${sanitizedPath}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const details = await res.text();
    throw new Error(
      `CouchDB request failed (${res.status} ${res.statusText}): ${details || "No response body"}`
    );
  }

  return res;
}

export async function getRuns(): Promise<Run[]> {
  if (!couchConfigured || !couchDb) {
    return demoRuns;
  }

  const res = await couchFetch(`${couchDb}/_find`, {
    method: "POST",
    body: JSON.stringify({
      selector: { type: "run" },
      sort: [{ date: "desc" }],
      limit: 100,
    }),
  });
  const data: MangoResponse<Run> = await res.json();
  return data.docs;
}

export async function getRaces(): Promise<Race[]> {
  if (!couchConfigured || !couchDb) {
    return demoRaces;
  }

  const res = await couchFetch(`${couchDb}/_find`, {
    method: "POST",
    body: JSON.stringify({
      selector: { type: "race" },
      sort: [{ raceDate: "asc" }],
      limit: 50,
    }),
  });
  const data: MangoResponse<Race> = await res.json();
  return data.docs;
}

export async function createRunDoc(payload: NewRun) {
  if (!couchConfigured || !couchDb) {
    throw new Error("CouchDB is not configured for writes.");
  }

  const doc: Run = {
    _id: `run:${randomUUID()}`,
    type: "run",
    createdAt: new Date().toISOString(),
    ...payload,
  };

  const res = await couchFetch(`${couchDb}/${encodeURIComponent(doc._id)}`, {
    method: "PUT",
    body: JSON.stringify(doc),
  });
  const data: CouchPostResponse = await res.json();
  return data;
}

export async function createRaceDoc(payload: NewRace) {
  if (!couchConfigured || !couchDb) {
    throw new Error("CouchDB is not configured for writes.");
  }

  const doc: Race = {
    _id: `race:${randomUUID()}`,
    type: "race",
    createdAt: new Date().toISOString(),
    ...payload,
  };

  const res = await couchFetch(`${couchDb}/${encodeURIComponent(doc._id)}`, {
    method: "PUT",
    body: JSON.stringify(doc),
  });
  const data: CouchPostResponse = await res.json();
  return data;
}

const demoRuns: Run[] = [
  {
    _id: "demo-run-1",
    type: "run",
    date: new Date().toISOString().slice(0, 10),
    route: "Morning Tempo",
    distanceKm: 12.6,
    durationMinutes: 61,
    terrain: "City streets",
    effort: "tempo",
    weather: "7°C, cloudy",
    notes: "Progression run with final 3 km at 4:10/km.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-run-2",
    type: "run",
    date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    route: "Sunset Shakeout",
    distanceKm: 6.2,
    durationMinutes: 32,
    terrain: "Gravel path",
    effort: "easy",
    weather: "11°C, breezy",
    notes: "Kept cadence high and focused on relaxed form.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-run-3",
    type: "run",
    date: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10),
    route: "Long Run North Loop",
    distanceKm: 24.1,
    durationMinutes: 130,
    terrain: "Rolling hills",
    effort: "long",
    weather: "4°C, sunny",
    notes: "Fuelled every 30 minutes. Strong finish uphill.",
    createdAt: new Date().toISOString(),
  },
];

const demoRaces: Race[] = [
  {
    _id: "demo-race-1",
    type: "race",
    name: "Oslo Spring Half",
    city: "Oslo, Norway",
    raceDate: new Date(Date.now() + 28 * 86400000).toISOString().slice(0, 10),
    distanceKm: 21.1,
    goalTime: "1:28:00",
    website: "https://example.org/oslo-half",
    notes: "Aim for strong negative split. Practice fueling every 25 minutes.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-race-2",
    type: "race",
    name: "Göteborgsvarvet",
    city: "Gothenburg, Sweden",
    raceDate: new Date(Date.now() + 68 * 86400000).toISOString().slice(0, 10),
    distanceKm: 21.1,
    goalTime: "1:26:30",
    website: "https://www.goteborgsvarvet.se",
    notes: "Lock into marathon effort until Älvsborg Bridge, surge from km 16.",
    createdAt: new Date().toISOString(),
  },
];

export type { NewRace, NewRun } from "./types";
