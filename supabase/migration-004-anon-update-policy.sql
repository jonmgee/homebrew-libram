-- Migration 004: Grant anon UPDATE on entries table
-- Required for the image upload pipeline — after inserting an entry and
-- uploading the image to storage, we update the entry's properties JSONB
-- to include the image_url. The anon key needs UPDATE permission for this.

GRANT UPDATE ON public.entries TO anon;

CREATE POLICY "Anyone can update entries (for image_url writeback)"
  ON public.entries
  FOR UPDATE
  USING (true)
  WITH CHECK (true);