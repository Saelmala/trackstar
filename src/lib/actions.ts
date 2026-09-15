'use server';

import { revalidatePath } from "next/cache";

import {
  createRaceDoc,
  createRunDoc,
  deleteStravaConnection,
  findRunByStravaActivityId,
  getStravaConnection,
  upsertStravaConnection,
} from "./couchdb";
import { mapRacePayload, mapRunPayload } from "./parse";
import { requireSession } from "./session";
import {
  deauthorize,
  isRunningActivity,
  listActivities,
  mapActivityToRun,
  refreshAccessToken,
} from "./strava";

export async function addRun(formData: FormData) {
  await requireSession();
  const payload = mapRunPayload(formData);
  if (!payload) {
    console.warn("Run payload missing required fields");
    return;
  }

  await createRunDoc(payload);
  revalidatePath("/");
}

export async function addRace(formData: FormData) {
  await requireSession();
  const payload = mapRacePayload(formData);
  if (!payload) {
    console.warn("Race payload missing required fields");
    return;
  }

  await createRaceDoc(payload);
  revalidatePath("/");
}

export async function syncStravaRuns() {
  const session = await requireSession();

  const connection = await getStravaConnection(session.userId);
  if (!connection) {
    return;
  }

  let accessToken = connection.accessToken;
  let refreshToken = connection.refreshToken;
  let tokenExpiresAt = connection.tokenExpiresAt;

  const nowEpochSeconds = Math.floor(Date.now() / 1000);
  if (tokenExpiresAt - nowEpochSeconds < 300) {
    const refreshed = await refreshAccessToken(refreshToken);
    accessToken = refreshed.access_token;
    refreshToken = refreshed.refresh_token;
    tokenExpiresAt = refreshed.expires_at;
  }

  const afterEpochSeconds = connection.lastSyncedAt
    ? Math.floor(new Date(connection.lastSyncedAt).getTime() / 1000)
    : undefined;

  const activities = await listActivities(accessToken, afterEpochSeconds);
  const runningActivities = activities.filter(isRunningActivity);

  for (const activity of runningActivities) {
    const mapped = mapActivityToRun(activity);
    const existing = await findRunByStravaActivityId(mapped.stravaActivityId);
    if (existing) {
      continue;
    }
    await createRunDoc(mapped);
  }

  await upsertStravaConnection({
    ...connection,
    accessToken,
    refreshToken,
    tokenExpiresAt,
    lastSyncedAt: new Date().toISOString(),
  });

  revalidatePath("/");
}

export async function disconnectStrava() {
  const session = await requireSession();

  const connection = await getStravaConnection(session.userId);
  if (connection) {
    try {
      await deauthorize(connection.accessToken);
    } catch (error) {
      console.warn("Strava deauthorize call failed (disconnecting locally anyway):", error);
    }
  }

  await deleteStravaConnection(session.userId);
  revalidatePath("/");
}
