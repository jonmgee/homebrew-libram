import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createMockClient } from "./mockSupabase";

const previewMode = import.meta.env.VITE_PREVIEW_MODE === "1";

function createRealClient(): SupabaseClient {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment",
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Preview mode (VITE_PREVIEW_MODE=1) swaps in an in-memory mock so the
// whole app can be exercised with fixture data — no network, no auth.
export const supabase = (previewMode
  ? createMockClient()
  : createRealClient()) as SupabaseClient;

if (previewMode) {
  console.info("[preview] Running with mock data — no database connected");
}
