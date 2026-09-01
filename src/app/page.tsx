import { RaceForm } from "@/components/race-form";
import { RacesList } from "@/components/races-list";
import { RunForm } from "@/components/run-form";
import { RunsList } from "@/components/runs-list";
import { StatsGrid } from "@/components/stats-grid";
import { StravaConnect } from "@/components/strava-connect";
import { couchConfigured, getRaces, getRuns, getStravaConnection } from "@/lib/couchdb";
import { logoutAction } from "@/lib/auth-actions";
import { getSession } from "@/lib/session";
import { stravaConfigured } from "@/lib/strava";
import { buildRunStats } from "@/lib/stats";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const [runs, races, stravaConnection] = await Promise.all([
    getRuns(),
    getRaces(),
    getStravaConnection(session.userId),
  ]);
  const stats = buildRunStats(runs, races);
  const writerEnabled = couchConfigured;
  const userDisplayName = session.email ?? session.userId;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
        <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden>
          <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-emerald-500/30 blur-3xl" />
          <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <p className="text-sm uppercase tracking-[0.4em] text-emerald-200">Trackstar</p>
            <span className="text-sm text-white/70">
              Signed in as <span className="font-semibold text-white">{userDisplayName}</span>
            </span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Own every block. Log runs, plan races, and keep every detail synced.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            A runner-first dashboard built with Next.js, React, and Tailwind CSS. Form data pushes
            straight into CouchDB so you keep complete control of your training data.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/80">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
              {writerEnabled ? "Live CouchDB connection" : "Demo data — connect CouchDB to go live"}
            </span>
            <StravaConnect connection={stravaConnection} configured={stravaConfigured} />
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-sm text-white/80 transition hover:border-white hover:text-white"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
        <StatsGrid stats={stats} />
        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <RunsList runs={runs} />
          <RunForm enabled={writerEnabled} />
        </section>
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <RacesList races={races} />
          <RaceForm enabled={writerEnabled} />
        </section>
      </main>
    </div>
  );
}
