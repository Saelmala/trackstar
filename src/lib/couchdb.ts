import "server-only";

import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";

import type { NewRace, NewRun, Race, Run, StravaConnection } from "./types";

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

type MangoIndexField = string | Record<string, "asc" | "desc">;

type MangoIndexDefinition = {
  name: string;
  fields: MangoIndexField[];
};

const mangoIndexes: MangoIndexDefinition[] = [
  {
    name: "idx_runs_type_date_desc",
    fields: [{ type: "desc" }, { date: "desc" }],
  },
  {
    name: "idx_races_type_raceDate_asc",
    fields: [{ type: "asc" }, { raceDate: "asc" }],
  },
  {
    name: "idx_stravaConnection_type_userId",
    fields: [{ type: "asc" }, { userId: "asc" }],
  },
  {
    name: "idx_runs_stravaActivityId",
    fields: [{ stravaActivityId: "asc" }],
  },
];

let ensuredIndexesPromise: Promise<void> | null = null;

async function ensureIndexes() {
  if (!couchConfigured || !couchDb) {
    return;
  }

  if (!ensuredIndexesPromise) {
    ensuredIndexesPromise = (async () => {
      await Promise.all(
        mangoIndexes.map((index) =>
          couchFetch(`${couchDb}/_index`, {
            method: "POST",
            body: JSON.stringify({
              name: index.name,
              type: "json",
              index: { fields: index.fields },
            }),
          })
        )
      );
    })().catch((error) => {
      ensuredIndexesPromise = null;
      throw error;
    });
  }

  return ensuredIndexesPromise;
}

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

  await ensureIndexes();

  const res = await couchFetch(`${couchDb}/_find`, {
    method: "POST",
    body: JSON.stringify({
      selector: { type: "run" },
      sort: [{ type: "desc" }, { date: "desc" }],
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

  await ensureIndexes();

  const res = await couchFetch(`${couchDb}/_find`, {
    method: "POST",
    body: JSON.stringify({
      selector: { type: "race" },
      sort: [{ type: "asc" }, { raceDate: "asc" }],
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

  const id = `run:${randomUUID()}`;
  const doc: Run = {
    _id: id,
    type: "run",
    createdAt: new Date().toISOString(),
    ...payload,
  };

  const res = await couchFetch(`${couchDb}/${encodeURIComponent(id)}`, {
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

  const id = `race:${randomUUID()}`;
  const doc: Race = {
    _id: id,
    type: "race",
    createdAt: new Date().toISOString(),
    ...payload,
  };

  const res = await couchFetch(`${couchDb}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(doc),
  });
  const data: CouchPostResponse = await res.json();
  return data;
}

export async function getStravaConnection(userId: string): Promise<StravaConnection | null> {
  if (!couchConfigured || !couchDb) {
    return null;
  }

  await ensureIndexes();

  const res = await couchFetch(`${couchDb}/_find`, {
    method: "POST",
    body: JSON.stringify({
      selector: { type: "stravaConnection", userId },
      limit: 1,
    }),
  });
  const data: MangoResponse<StravaConnection> = await res.json();
  return data.docs[0] ?? null;
}

export async function upsertStravaConnection(
  connection: Omit<StravaConnection, "_id" | "_rev" | "type">
) {
  if (!couchConfigured || !couchDb) {
    throw new Error("CouchDB is not configured for writes.");
  }

  const existing = await getStravaConnection(connection.userId);

  const doc: StravaConnection = {
    ...connection,
    _id: existing?._id ?? `stravaConnection:${randomUUID()}`,
    _rev: existing?._rev,
    type: "stravaConnection",
  };

  const res = await couchFetch(`${couchDb}/${encodeURIComponent(doc._id!)}`, {
    method: "PUT",
    body: JSON.stringify(doc),
  });
  const data: CouchPostResponse = await res.json();
  return data;
}

export async function deleteStravaConnection(userId: string) {
  if (!couchConfigured || !couchDb) {
    throw new Error("CouchDB is not configured for writes.");
  }

  const existing = await getStravaConnection(userId);
  if (!existing?._id || !existing?._rev) {
    return;
  }

  await couchFetch(
    `${couchDb}/${encodeURIComponent(existing._id)}?rev=${encodeURIComponent(existing._rev)}`,
    { method: "DELETE" }
  );
}

export async function findRunByStravaActivityId(stravaActivityId: number): Promise<Run | null> {
  if (!couchConfigured || !couchDb) {
    return null;
  }

  await ensureIndexes();

  const res = await couchFetch(`${couchDb}/_find`, {
    method: "POST",
    body: JSON.stringify({
      selector: { type: "run", stravaActivityId },
      limit: 1,
    }),
  });
  const data: MangoResponse<Run> = await res.json();
  return data.docs[0] ?? null;
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
