import { addRace } from "@/lib/actions";
import { SubmitButton } from "./submit-button";

type RaceFormProps = {
  enabled: boolean;
};

export function RaceForm({ enabled }: RaceFormProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-slate-900/60 p-6 shadow-xl shadow-indigo-500/10 backdrop-blur">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Plan ahead</p>
        <h3 className="text-2xl font-semibold text-white">Upcoming race</h3>
        <p className="text-sm text-white/70">
          Keep race goals synced with the same OSC CouchDB instance for your team.
        </p>
      </div>
      <form action={enabled ? addRace : undefined} className="space-y-4">
        <label className="text-sm text-white/80">
          Race name
          <input
            type="text"
            name="name"
            placeholder="Stockholm Marathon"
            required
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-indigo-300/70"
            disabled={!enabled}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-white/80">
            Date
            <input
              type="date"
              name="raceDate"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-300/70"
              disabled={!enabled}
            />
          </label>
          <label className="text-sm text-white/80">
            City
            <input
              type="text"
              name="city"
              placeholder="Stockholm, Sweden"
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-indigo-300/70"
              disabled={!enabled}
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-white/80">
            Distance (km)
            <input
              type="number"
              name="raceDistance"
              step="0.1"
              min="0"
              placeholder="42.2"
              required
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-300/70"
              disabled={!enabled}
            />
          </label>
          <label className="text-sm text-white/80">
            Goal time
            <input
              type="text"
              name="goalTime"
              placeholder="3:05:00"
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-indigo-300/70"
              disabled={!enabled}
            />
          </label>
        </div>
        <label className="text-sm text-white/80">
          Website
          <input
            type="url"
            name="website"
            placeholder="https://www.stockholm.se/marathon"
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-indigo-300/70"
            disabled={!enabled}
          />
        </label>
        <label className="text-sm text-white/80">
          Notes
          <textarea
            name="raceNotes"
            rows={3}
            placeholder="Course intel, pacing cues, fueling strategy…"
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-indigo-300/70"
            disabled={!enabled}
          />
        </label>
        <SubmitButton
          label="Save race plan"
          pendingLabel="Saving race..."
          disabled={!enabled}
        />
      </form>
      {!enabled && (
        <p className="mt-3 text-xs text-white/70">
          Add your OSC CouchDB credentials in <code>.env.local</code> to make this form live.
        </p>
      )}
    </div>
  );
}
