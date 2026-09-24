import { supabase } from "./supabase";

/**
 * The entry page shows an image at 300px tall at most, so anything much
 * beyond this is storage spent on pixels nobody sees. Phone screenshots
 * were arriving as 1–7 MB PNGs; at this size as WebP they're ~50 KB.
 */
const MAX_STORED_DIMENSION = 1200;

/**
 * Shrink and re-encode an image for storage: longest side 1200px, WebP
 * where the browser can write it (Chrome, Firefox, recent Safari), JPEG
 * otherwise. Anything undecodable, or not a raster we know, goes up as-is
 * rather than blocking the save.
 */
export async function compressForStorage(file: File): Promise<File> {
  if (!/^image\/(png|jpeg|webp|avif|heic|heif)$/i.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_STORED_DIMENSION / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();

    const toBlob = (type: string, q: number) =>
      new Promise<Blob | null>((r) => canvas.toBlob(r, type, q));

    let blob = await toBlob("image/webp", 0.8);
    if (!blob || blob.type !== "image/webp") {
      // No WebP encoder here. JPEG has no alpha: flatten onto white first.
      const flat = document.createElement("canvas");
      flat.width = w;
      flat.height = h;
      const fctx = flat.getContext("2d");
      if (!fctx) return file;
      fctx.fillStyle = "#fff";
      fctx.fillRect(0, 0, w, h);
      fctx.drawImage(canvas, 0, 0);
      blob = await new Promise<Blob | null>((r) => flat.toBlob(r, "image/jpeg", 0.85));
      if (!blob) return file;
    }
    // Never make a file bigger: a tiny original stays as it was.
    if (blob.size >= file.size) return file;
    const ext = blob.type === "image/webp" ? "webp" : "jpg";
    const stem = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${stem}.${ext}`, { type: blob.type });
  } catch {
    return file;
  }
}

/**
 * Upload an image to the entry-images bucket with a traceable filename.
 * Returns the public URL or null if upload failed.
 */
export async function uploadEntryImage(
  entryId: string,
  original: File,
): Promise<string | null> {
  const file = await compressForStorage(original);
  const ext = file.name.split(".").pop() ?? "png";
  const filename = `${entryId}_${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("entry-images")
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
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
