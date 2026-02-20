import { RaceForm } from "@/components/race-form";
import { RacesList } from "@/components/races-list";
import { RunForm } from "@/components/run-form";
import { RunsList } from "@/components/runs-list";
import { StatsGrid } from "@/components/stats-grid";
import { couchConfigured, getRaces, getRuns } from "@/lib/couchdb";
import { buildRunStats } from "@/lib/stats";

export default async function Home() {
  const [runs, races] = await Promise.all([getRuns(), getRaces()]);
  const stats = buildRunStats(runs, races);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
        <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden>
          <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-emerald-500/30 blur-3xl" />
          <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-16">
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-200">Trackstar</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Own every block. Log runs, plan races, and sync it all via{" "}
            <span className="text-emerald-200">Open Source Cloud</span>.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            A runner-first dashboard built with Next.js, React, and Tailwind CSS. Form data pushes
            straight into CouchDB running on OSC so you keep complete control of your training data.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/80">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
              {couchConfigured
                ? "Live OSC CouchDB connection"
                : "Demo data — connect OSC CouchDB to go live"}
            </span>
            <a
              href="https://app.osaas.io/browse/apache-couchdb"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-emerald-200 underline decoration-dotted underline-offset-4 hover:text-emerald-100"
            >
              Explore OSC components
              <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
        <StatsGrid stats={stats} />
        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <RunsList runs={runs} />
          <RunForm enabled={couchConfigured} />
        </section>
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <RacesList races={races} />
          <RaceForm enabled={couchConfigured} />
        </section>
      </main>
    </div>
  );
}
