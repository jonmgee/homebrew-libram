-- Migration 002: Allow anon key to delete entries
-- The anon key currently has SELECT only. This adds DELETE
-- access so the browse page can remove entries without auth.

GRANT DELETE ON public.entries TO anon;

CREATE POLICY "Anyone can delete entries"
  ON public.entries
  FOR DELETE
  USING (true);