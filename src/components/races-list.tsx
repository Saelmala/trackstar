import type { Race } from "@/lib/types";
import { formatDate } from "@/lib/stats";

type RacesListProps = {
  races: Race[];
};

export function RacesList({ races }: RacesListProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-lg shadow-black/30">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">Race calendar</p>
          <h2 className="text-3xl font-semibold text-white">Upcoming races</h2>
        </div>
        <span className="text-sm text-white/60">
          {races.length} {races.length === 1 ? "race" : "races"}
        </span>
      </div>
      <div className="mt-6 space-y-4">
        {races.length === 0 && (
          <p className="text-sm text-white/70">
            No races synced yet. Add one on the right to set your next target.
          </p>
        )}
        {races.map((race) => (
          <article
            key={race._id ?? `${race.name}-${race.raceDate}`}
            className="rounded-2xl border border-white/5 bg-white/5 p-4 shadow-inner shadow-black/30"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  {formatDate(race.raceDate, { month: "long", day: "numeric", year: "numeric" })}
                </p>
                <h3 className="text-xl font-semibold text-white">{race.name}</h3>
                <p className="text-sm text-white/70">{race.city}</p>
                {race.website && (
                  <a
                    href={race.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-indigo-200 underline decoration-dotted hover:text-indigo-100"
                  >
                    Official site
                  </a>
                )}
              </div>
              <div className="text-right font-mono text-sm text-white">
                <p className="text-2xl font-bold">
                  {race.distanceKm.toFixed(1)}
                  <span className="ml-1 text-sm font-normal text-white/70">km</span>
                </p>
                {race.goalTime && <p className="text-white/70">Goal: {race.goalTime}</p>}
              </div>
            </div>
            {race.notes && <p className="mt-3 text-sm text-white/80">{race.notes}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
