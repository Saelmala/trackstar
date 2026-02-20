import type { Run } from "@/lib/types";
import { formatDate, formatDuration } from "@/lib/stats";

type RunsListProps = {
  runs: Run[];
};

export function RunsList({ runs }: RunsListProps) {
  if (!runs.length) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
        <h3 className="text-xl font-semibold text-white">No runs yet</h3>
        <p className="mt-2 text-sm">
          Start logging workouts and they will show up here instantly from CouchDB.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-lg shadow-black/30">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">Run log</p>
          <h2 className="text-3xl font-semibold text-white">Recent workouts</h2>
        </div>
        <span className="text-sm text-white/60">
          {runs.length} {runs.length === 1 ? "entry" : "entries"}
        </span>
      </div>
      <div className="mt-6 space-y-4">
        {runs.map((run) => (
          <article
            key={run._id ?? `${run.date}-${run.route}`}
            className="rounded-2xl border border-white/5 bg-white/5 p-4 shadow-inner shadow-black/30"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  {formatDate(run.date, { month: "long", day: "numeric" })}
                </p>
                <h3 className="text-xl font-semibold text-white">{run.route}</h3>
                <p className="text-sm text-white/70">{run.terrain ?? "Mixed terrain"}</p>
              </div>
              <div className="text-right font-mono text-sm text-white">
                <p className="text-2xl font-bold">
                  {run.distanceKm.toFixed(1)}
                  <span className="ml-1 text-sm font-normal text-white/70">km</span>
                </p>
                <p className="text-white/70">{formatDuration(run.durationMinutes)}</p>
                {run.effort && <p className="text-xs uppercase tracking-widest text-emerald-200">{run.effort}</p>}
              </div>
            </div>
            {(run.notes || run.weather) && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/70">
                {run.weather && (
                  <span className="rounded-full bg-white/10 px-3 py-1">{run.weather}</span>
                )}
                {run.notes && <p className="text-sm text-white/80">{run.notes}</p>}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
