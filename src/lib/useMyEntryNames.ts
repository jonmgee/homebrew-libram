import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useAuth } from "../context/AuthContext";

/**
 * The names already in the signed-in user's own libram, lowercased and
 * trimmed, for spotting duplicates before copying someone else's entries in.
 *
 * Matched on name alone, not name plus type. Two people writing the same item
 * will rarely file it under the same type — the whole reason the Move control
 * exists is that a weapon can arrive as a magic item — so keying on the pair
 * would wave through exactly the duplicates most worth catching. A collision
 * between genuinely different things sharing a name is possible, which is why
 * nothing here blocks a copy: it only says so.
 *
 * Returns null while loading, or when signed out (nothing to compare against).
 * RLS scopes the query to the caller's own rows.
 */
export function nameKey(name: string): string {
  return name.trim().toLowerCase();
}

export function useMyEntryNames(): Set<string> | null {
  const { user } = useAuth();
  const [names, setNames] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!user) { setNames(null); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from("entries").select("name");
      if (cancelled) return;
      if (error) {
        // Advisory only — a failed lookup must not stop anyone copying.
        console.warn("Duplicate lookup failed:", error.message);
        setNames(null);
        return;
      }
      setNames(new Set((data ?? []).map((r) => nameKey((r as { name: string }).name))));
    })();
    return () => { cancelled = true; };
  }, [user]);

  return names;
}
