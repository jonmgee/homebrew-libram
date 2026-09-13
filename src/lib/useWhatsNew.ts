import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useAuth } from "../context/AuthContext";
import { CHANGELOG, type ChangelogEntry } from "./changelog";

/**
 * What this reader hasn't been shown yet. A port of PC on Parchment's hook.
 *
 * The marker lives on the account, in auth user metadata, rather than on the
 * device: a device opened rarely would otherwise greet someone with features
 * they've been using for weeks. No table, no migration. The key is namespaced
 * because the same account signs in to PC on Parchment, whose marker is
 * `pcp_changelog_seen`.
 */

const SEEN_KEY = "libram_changelog_seen";

/** Two gates: newer than the last entry they were shown, and newer than the
 *  account itself — a new reader wants their Libram, not its history. */
function unseenFor(lastSeenId: string | undefined, createdAt: string | undefined): ChangelogEntry[] {
  const since = (createdAt ?? "").slice(0, 10);
  const newerThanSignup = (e: ChangelogEntry) => (since ? e.date > since : true);

  if (!lastSeenId) return CHANGELOG.filter(newerThanSignup);

  const idx = CHANGELOG.findIndex((e) => e.id === lastSeenId);
  // An unknown id means the entry was removed or the metadata came from a
  // newer build. Show nothing: re-showing old news is the worse failure.
  if (idx === -1) return [];
  return CHANGELOG.slice(0, idx).filter(newerThanSignup);
}

export function useWhatsNew(): { entries: ChangelogEntry[]; dismiss: () => void } {
  const { user, loading } = useAuth();
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [done, setDone] = useState(false);

  const lastSeen = user?.user_metadata?.[SEEN_KEY] as string | undefined;

  useEffect(() => {
    if (loading || !user || done) return;

    const missed = unseenFor(lastSeen, user.created_at);
    if (missed.length === 0) {
      // Nothing to say, but stamp the marker so this account starts from here
      // rather than being offered the back catalogue at the next release.
      if (!lastSeen && CHANGELOG[0]) {
        void supabase.auth.updateUser({ data: { [SEEN_KEY]: CHANGELOG[0].id } });
      }
      setDone(true);
      return;
    }
    setEntries(missed);
  }, [loading, user, lastSeen, done]);

  const dismiss = useCallback(() => {
    setEntries([]);
    setDone(true);
    if (CHANGELOG[0]) {
      // Not awaited: closing shouldn't wait on the network. If the write fails
      // they see it once more, which is the harmless direction.
      void supabase.auth.updateUser({ data: { [SEEN_KEY]: CHANGELOG[0].id } });
    }
  }, []);

  return { entries, dismiss };
}
