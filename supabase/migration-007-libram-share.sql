-- Whole-libram share links.
-- One row per user who has sharing on; the token grants read access to all
-- their non-DM-only entries via get_shared_libram(). Revoking = deleting the
-- row; re-sharing mints a fresh token so old links die.

CREATE TABLE IF NOT EXISTS public.libram_shares (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.libram_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own libram share"
  ON public.libram_shares
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SECURITY DEFINER: exact-token lookup only; DM-only entries never leave home.
CREATE OR REPLACE FUNCTION public.get_shared_libram(p_token uuid)
RETURNS SETOF public.entries
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT e.*
  FROM public.entries e
  JOIN public.libram_shares s ON s.user_id = e.user_id
  WHERE s.token = p_token
    AND e.dm_only = false
  ORDER BY e.name;
$$;

REVOKE ALL ON FUNCTION public.get_shared_libram(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_shared_libram(uuid) TO anon, authenticated;
