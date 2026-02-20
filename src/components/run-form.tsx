import { addRun } from "@/lib/actions";
import { SubmitButton } from "./submit-button";

type RunFormProps = {
  enabled: boolean;
};

export function RunForm({ enabled }: RunFormProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-emerald-500/5 backdrop-blur">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Log a run</p>
          <h3 className="text-2xl font-semibold text-white">Capture the effort</h3>
          <p className="text-sm text-white/70">
            Runs are persisted in your OSC CouchDB instance so you can sync data anywhere.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            enabled ? "bg-emerald-400/20 text-emerald-200" : "bg-orange-500/10 text-orange-200"
          }`}
        >
          {enabled ? "Live OSC data" : "Demo mode"}
        </span>
      </div>
      <form action={enabled ? addRun : undefined} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-white/80">
            Date
            <input
              type="date"
              name="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-emerald-300/70"
              disabled={!enabled}
            />
          </label>
          <label className="text-sm text-white/80">
            Route / Title
            <input
              type="text"
              name="route"
              placeholder="Sunrise tempo"
              required
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-emerald-300/70"
              disabled={!enabled}
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm text-white/80">
            Distance (km)
            <input
              type="number"
              name="distance"
              min="0"
              step="0.1"
              placeholder="12.5"
              required
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-emerald-300/70"
              disabled={!enabled}
            />
          </label>
          <label className="text-sm text-white/80">
            Duration (hh:mm)
            <input
              type="text"
              name="duration"
              placeholder="01:32"
              required
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-emerald-300/70"
              disabled={!enabled}
            />
          </label>
          <label className="text-sm text-white/80">
            Terrain
            <input
              type="text"
              name="terrain"
              placeholder="Hilly roads"
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-emerald-300/70"
              disabled={!enabled}
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-white/80">
            Effort
            <select
              name="effort"
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-300/70"
              disabled={!enabled}
              defaultValue="easy"
            >
              <option value="easy">Easy</option>
              <option value="steady">Steady</option>
              <option value="tempo">Tempo</option>
              <option value="intervals">Intervals</option>
              <option value="long">Long Run</option>
            </select>
          </label>
          <label className="text-sm text-white/80">
            Weather / Conditions
            <input
              type="text"
              name="weather"
              placeholder="7°C, drizzle"
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-emerald-300/70"
              disabled={!enabled}
            />
          </label>
        </div>
        <label className="text-sm text-white/80">
          Notes
          <textarea
            name="notes"
            placeholder="Key takeaways, fueling, how it felt..."
            rows={3}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-emerald-300/70"
            disabled={!enabled}
          />
        </label>
        <SubmitButton
          label="Save run to CouchDB"
          pendingLabel="Saving run..."
          disabled={!enabled}
        />
      </form>
      {!enabled && (
        <p className="mt-3 text-xs text-white/70">
          Configure the OSC CouchDB credentials in <code>.env.local</code> to enable logging.
        </p>
      )}
    </div>
  );
}
