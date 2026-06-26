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

/**
 * After inserting an entry, upload the image (if present) and attach
 * image_url to the entry's properties. Returns the entry id.
 */
export async function saveEntryWithImage(
  data: {
    name: string;
    type: string;
    description: string;
    tags: string[];
    properties: Record<string, unknown>;
  },
  imageFile: File | null,
  navigate: (path: string) => void,
): Promise<void> {
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
      // 3. Update entry properties with image_url
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