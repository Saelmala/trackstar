'use server';

import { revalidatePath } from "next/cache";

import { createRaceDoc, createRunDoc, type NewRace, type NewRun } from "./couchdb";

export async function addRun(formData: FormData) {
  const payload = mapRunPayload(formData);
  if (!payload) {
    console.warn("Run payload missing required fields");
    return;
  }

  await createRunDoc(payload);
  revalidatePath("/");
}

export async function addRace(formData: FormData) {
  const payload = mapRacePayload(formData);
  if (!payload) {
    console.warn("Race payload missing required fields");
    return;
  }

  await createRaceDoc(payload);
  revalidatePath("/");
}

function mapRunPayload(formData: FormData): NewRun | null {
  const date = String(formData.get("date") ?? "");
  const route = (formData.get("route")?.toString() ?? "").trim();
  const distance = Number(formData.get("distance"));
  const durationInput = (formData.get("duration")?.toString() ?? "").trim();

  if (!date || !route || Number.isNaN(distance) || distance <= 0 || !durationInput) {
    return null;
  }

  const durationMinutes = parseDuration(durationInput);
  if (!durationMinutes) {
    return null;
  }

  return {
    date,
    route,
    distanceKm: Number(distance.toFixed(2)),
    durationMinutes: Number(durationMinutes.toFixed(2)),
    terrain: optionalValue(formData, "terrain"),
    effort: optionalValue(formData, "effort") as NewRun["effort"],
    weather: optionalValue(formData, "weather"),
    notes: optionalValue(formData, "notes"),
  };
}

function mapRacePayload(formData: FormData): NewRace | null {
  const name = optionalValue(formData, "name");
  const city = optionalValue(formData, "city") ?? "TBD";
  const raceDate = optionalValue(formData, "raceDate");
  const distance = Number(formData.get("raceDistance"));

  if (!name || !raceDate || Number.isNaN(distance) || distance <= 0) {
    return null;
  }

  return {
    name,
    city,
    raceDate,
    distanceKm: Number(distance.toFixed(1)),
    goalTime: optionalValue(formData, "goalTime"),
    website: optionalValue(formData, "website"),
    notes: optionalValue(formData, "raceNotes"),
  };
}

function optionalValue(formData: FormData, field: string) {
  const value = formData.get(field);
  if (!value) {
    return undefined;
  }
  const text = value.toString().trim();
  return text.length ? text : undefined;
}

function parseDuration(value: string) {
  const trimmed = value.trim();
  if (!trimmed.length) {
    return null;
  }

  if (!trimmed.includes(":")) {
    const minutes = Number(trimmed);
    return Number.isNaN(minutes) || minutes <= 0 ? null : minutes;
  }

  const parts = trimmed.split(":").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  if (parts.length === 2) {
    const [hours, minutes] = parts;
    return hours * 60 + minutes;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 60 + minutes + seconds / 60;
  }

  return null;
}
