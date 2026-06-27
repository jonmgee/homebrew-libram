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
  tags: string[];
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
): Promise<void> {
  if (editId) {
    // ── EDIT MODE ──
    // 1. If a new image was uploaded, upload it and get a URL
    let imageUrl: string | null | undefined = existingImageUrl;

    if (imageFile) {
      imageUrl = await uploadEntryImage(editId, imageFile);
    }

    // 2. Build properties with the resolved image URL
    const properties = {
      ...data.properties,
      ...(imageUrl ? { image_url: imageUrl } : {}),
      // If we had an existing image but it was explicitly removed (imageFile is null AND existingImageUrl was set but we want to clear it)
      // Actually: if no imageFile and no existingImageUrl, don't set image_url
    };

    // If image was removed (user hit Remove), don't pass image_url at all
    if (!imageFile && !existingImageUrl) {
      delete properties.image_url;
    }

    // 3. Update the record
    const { error: updateError } = await supabase
      .from("entries")
      .update({
        name: data.name,
        description: data.description,
        tags: data.tags,
        properties,
      })
      .eq("id", editId);

    if (updateError) throw updateError;

    // 4. Navigate to detail page with updated banner
    navigate(`/entry/${editId}?updated=1`);
  } else {
    // ── CREATE MODE ──
    // 1. Insert first (no image yet)
    const { data: inserted, error: insertError } = await supabase
      .from("entries")
      .insert(data)
      .select("id")
      .single();

    if (insertError) throw insertError;

    // 2. Upload image after insert so we can use the entry ID
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

    // 3. Navigate to detail page
    navigate(`/entry/${inserted.id}?saved=1`);
  }
}