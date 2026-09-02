import type { StravaConnection } from "@/lib/types";
import { disconnectStrava, syncStravaRuns } from "@/lib/actions";
import { SubmitButton } from "./submit-button";

type StravaConnectProps = {
  connection: StravaConnection | null;
  configured: boolean;
};

export function StravaConnect({ connection, configured }: StravaConnectProps) {
  if (!configured) {
    return null;
  }

  if (!connection) {
    return (
      <a
        href="/api/strava/connect"
        className="inline-flex items-center gap-2 rounded-full border border-orange-400/40 bg-orange-500/10 px-3 py-1 text-sm text-orange-200 transition hover:border-orange-300 hover:text-orange-100"
      >
        Connect Strava
      </a>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
      <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-orange-200">
        Connected to Strava{connection.athleteName ? ` as ${connection.athleteName}` : ""}
      </span>
      <span className="text-xs text-white/60">{formatLastSynced(connection.lastSyncedAt)}</span>
      <form action={syncStravaRuns}>
        <SubmitButton label="Sync now" pendingLabel="Syncing..." />
      </form>
      <form action={disconnectStrava}>
        <SubmitButton label="Disconnect" pendingLabel="Disconnecting..." />
      </form>
    </div>
  );
}

function formatLastSynced(lastSyncedAt?: string) {
  if (!lastSyncedAt) {
    return "Never synced";
  }
  const diffMs = Date.now() - new Date(lastSyncedAt).getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes < 1) {
    return "Synced just now";
  }
  if (diffMinutes < 60) {
    return `Synced ${diffMinutes}m ago`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `Synced ${diffHours}h ago`;
  }
  const diffDays = Math.round(diffHours / 24);
  return `Synced ${diffDays}d ago`;
}
