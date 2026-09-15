import type { Race } from "@/lib/types";
import { formatDate, formatPace, type RunStats } from "@/lib/stats";

type StatsGridProps = {
  stats: RunStats;
};

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <section className="grid gap-4 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-slate-900/70 p-6 shadow-lg shadow-emerald-500/5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Volume (km)" value={stats.totalDistance.toFixed(1)} detail="Last 100 runs" />
      <StatCard
        label="Average pace"
        value={formatPace(stats.averagePace)}
        detail="Across all logged runs"
      />
      <StatCard
        label="Longest run"
        value={stats.longestRun ? `${stats.longestRun.distanceKm.toFixed(1)} km` : "—"}
        detail={stats.longestRun ? stats.longestRun.route : "Log a long run"}
      />
      <NextRaceCard race={stats.nextRace} />
    </section>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <article className="rounded-2xl border border-white/5 bg-white/5 p-4 shadow-inner shadow-black/30">
      <p className="text-xs uppercase tracking-[0.3em] text-white/60">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      {detail && <p className="text-sm text-white/70">{detail}</p>}
    </article>
  );
}

function NextRaceCard({ race }: { race: Race | null }) {
  if (!race) {
    return (
      <article className="rounded-2xl border border-white/5 bg-white/5 p-4 shadow-inner shadow-black/30">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Next race</p>
        <p className="mt-2 text-3xl font-semibold text-white">Choose target</p>
        <p className="text-sm text-white/70">Add a race to focus your block.</p>
      </article>
    );
  }

  const daysAway = differenceInDays(race.raceDate);

  return (
    <article className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 shadow-inner shadow-emerald-500/30">
      <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Next race</p>
      <p className="mt-2 text-3xl font-semibold text-white">{race.name}</p>
      <p className="text-sm text-white/80">
        {race.city} • {formatDate(race.raceDate, { month: "long", day: "numeric", year: "numeric" })}
      </p>
      <p className="text-sm text-emerald-200">
        {daysAway > 0 ? `${daysAway} days out` : "Race week!"}
      </p>
      {race.goalTime && <p className="text-xs text-white/70">Goal {race.goalTime}</p>}
    </article>
  );
}

function differenceInDays(targetDate: string) {
  const date = new Date(targetDate);
  const today = new Date();
  const diffMs = date.getTime() - today.getTime();
  return Math.max(0, Math.round(diffMs / 86400000));
}
