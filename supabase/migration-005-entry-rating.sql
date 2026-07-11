-- Personal star rating on entries (1–5, null = unrated)
ALTER TABLE public.entries
  ADD COLUMN IF NOT EXISTS rating smallint
  CHECK (rating IS NULL OR rating BETWEEN 1 AND 5);

-- Helps rating-ordered queries as the libram grows
CREATE INDEX IF NOT EXISTS entries_rating_idx
  ON public.entries (rating DESC NULLS LAST);
