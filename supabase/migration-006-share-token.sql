-- Per-entry public share links.
-- share_token is a UUID the owner mints; anyone holding the exact token can
-- read that one entry via get_shared_entry(). RLS on the table is unchanged,
-- so shared rows never leak into other users' queries.

ALTER TABLE public.entries
  ADD COLUMN IF NOT EXISTS share_token uuid;

CREATE UNIQUE INDEX IF NOT EXISTS entries_share_token_idx
  ON public.entries (share_token)
  WHERE share_token IS NOT NULL;

-- SECURITY DEFINER so it can bypass RLS, but only for an exact token match.
CREATE OR REPLACE FUNCTION public.get_shared_entry(p_token uuid)
RETURNS SETOF public.entries
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT * FROM public.entries WHERE share_token = p_token;
$$;

REVOKE ALL ON FUNCTION public.get_shared_entry(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_shared_entry(uuid) TO anon, authenticated;
