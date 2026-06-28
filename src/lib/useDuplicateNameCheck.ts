import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

/**
 * Checks for an existing entry with the same name (case-insensitive, trimmed).
 * Only fires for new entries (skips when initialData is provided).
 * Clears the warning when the name field changes.
 */
export function useDuplicateNameCheck(
  name: string,
  initialData?: { id: string } | null,
): string | null {
  const [warning, setWarning] = useState<string | null>(null);
  const latestNameRef = useRef(name);

  // Track latest name and reset warning immediately on change
  useEffect(() => {
    latestNameRef.current = name;
    if (warning) setWarning(null);
  }, [name]);

  useEffect(() => {
    // Skip for edits
    if (initialData) return;
    // Skip empty names
    const trimmed = name.trim();
    if (!trimmed) return;

    // Debounce: wait 500ms after the last keystroke
    const timer = setTimeout(async () => {
      // Make sure name hasn't changed during debounce
      if (latestNameRef.current.trim().toLowerCase() !== trimmed.toLowerCase()) return;

      const { data, error } = await supabase
        .from("entries")
        .select("name")
        .ilike("name", trimmed)
        .limit(1);

      if (error) {
        console.warn("Duplicate name check failed:", error.message);
        return;
      }

      if (data && data.length > 0) {
        setWarning(`You already have an entry called "${trimmed}"`);
      } else {
        setWarning(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [name, initialData]);

  return warning;
}
