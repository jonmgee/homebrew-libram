-- "Saved for the Table" bookmark flag on entries.
--
-- Deliberately separate from `rating`: a rating says how good something is,
-- a bookmark says "I need this at Saturday's session". A five-star item you
-- aren't running this week shouldn't clutter the table list, and a scrappy
-- two-star NPC you're about to use should.
--
-- A boolean column rather than a join table because entries are single-owner
-- (RLS restricts every row to auth.uid() = user_id), so there is no second
-- user who could bookmark the same row. The existing select/update policies
-- cover this column with no further grants.
ALTER TABLE public.entries
  ADD COLUMN IF NOT EXISTS bookmarked boolean NOT NULL DEFAULT false;

-- Partial index: the table list is a small, frequently-read subset of a
-- library that only grows.
CREATE INDEX IF NOT EXISTS entries_bookmarked_idx
  ON public.entries (user_id)
  WHERE bookmarked;
