import { supabase } from "./supabase";
import type { DbEntry } from "../types";

/**
 * Clone a shared entry into the signed-in user's own libram.
 * Rating and share state are personal, so they don't copy across.
 * Returns the new entry's id.
 */
export async function copyEntryToMyLibram(entry: DbEntry): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) throw new Error("You must be signed in to copy entries");

  const { data, error } = await supabase
    .from("entries")
    .insert({
      user_id: userId,
      name: entry.name,
      type: entry.type,
      description: entry.description,
      source: entry.source,
      dm_only: entry.dm_only,
      tags: entry.tags,
      campaign: entry.campaign,
      properties: entry.properties,
    })
    .select("id")
    .single();

  if (error) throw error;
  return (data as { id: string }).id;
}
