import { supabase } from "./supabase";

/**
 * Upload an image to the entry-images bucket with a traceable filename.
 * Returns the public URL or null if upload failed.
 */
export async function uploadEntryImage(
  entryId: string,
  file: File,
): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "png";
  const filename = `${entryId}_${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("entry-images")
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Image upload failed:", error);
    return null;
  }

  const { data } = supabase.storage
    .from("entry-images")
    .getPublicUrl(filename);

  return data.publicUrl;
}

type SaveData = {
  name: string;
  type: string;
  description: string;
  properties: Record<string, unknown>;
};

/**
 * Create a new entry or update an existing one.
 * If editId is provided, updates the existing record instead of inserting.
 * existingImageUrl is kept when no new imageFile is provided (edit mode).
 */
export async function saveEntryWithImage(
  data: SaveData,
  imageFile: File | null,
  navigate: (path: string) => void,
  editId?: string,
  existingImageUrl?: string | null,
  /**
   * Set only when the user has actually asked for an entry's properties to go
   * — turning the NPC stat-block toggle off by hand, say. The guard in edit
   * mode below explains why the default has to be false.
   */
  allowPropertyClear = false,
): Promise<void> {
  if (editId) {
    // ── EDIT MODE ──
    let imageUrl: string | null | undefined = existingImageUrl;

    if (imageFile) {
      imageUrl = await uploadEntryImage(editId, imageFile);
    }

    let properties: Record<string, unknown> = {
      ...data.properties,
      ...(imageUrl ? { image_url: imageUrl } : {}),
    };

    if (!imageFile && !existingImageUrl) {
      delete properties.image_url;
    }

    /**
     * Refuse to blank a populated `properties` by accident.
     *
     * A form builds this object from its own state, so any field it forgets
     * to load on edit is a field it then writes away. That is precisely what
     * happened to NPC stat blocks: the edit form never read them back, the
     * toggle therefore showed off, and saving an unrelated typo would have
     * destroyed the lot. This database keeps no row history, so the cost of
     * that mistake is total and silent.
     *
     * A form that genuinely means it passes allowPropertyClear. Otherwise
     * anything the form sent nothing for is left alone.
     */
    if (!allowPropertyClear) {
      const meaningful = (o: Record<string, unknown>) =>
        Object.keys(o).filter((k) => k !== "image_url");

      if (meaningful(properties).length === 0) {
        const { data: current } = await supabase
          .from("entries")
          .select("properties")
          .eq("id", editId)
          .single();
        const existing = (current?.properties as Record<string, unknown>) ?? {};

        if (meaningful(existing).length > 0) {
          console.warn(
            `Keeping ${meaningful(existing).length} properties on entry ${editId}: ` +
              "the form sent none and did not ask for them to be cleared.",
          );
          properties = { ...existing, ...properties };
        }
      }
    }

    const { error: updateError } = await supabase
      .from("entries")
      // tags is deliberately absent: the feature was withdrawn from the UI but
      // the existing strings stay in the column, and an edit shouldn't wipe them.
      .update({
        name: data.name,
        description: data.description,
        properties,
      })
      .eq("id", editId);

    if (updateError) throw updateError;

    navigate(`/entry/${editId}?updated=1`);
  } else {
    // ── CREATE MODE ──
    // 1. Get current session user
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("You must be signed in to create entries");
    }

    // 2. Insert with user_id
    const { data: inserted, error: insertError } = await supabase
      .from("entries")
      .insert({ ...data, user_id: userId })
      .select("id")
      .single();

    if (insertError) throw insertError;

    // 3. Upload image after insert so we can use the entry ID
    if (imageFile) {
      const url = await uploadEntryImage(inserted.id, imageFile);
      if (url) {
        const { data: current } = await supabase
          .from("entries")
          .select("properties")
          .eq("id", inserted.id)
          .single();

        const props = {
          ...(current?.properties as Record<string, unknown> ?? {}),
          image_url: url,
        };

        await supabase
          .from("entries")
          .update({ properties: props })
          .eq("id", inserted.id);
      }
    }

    // 4. Navigate to detail page
    navigate(`/entry/${inserted.id}?saved=1`);
  }
}
