-- Migration 001: Create entries table
-- Homebrew Libram — flexible schema using shared fields + JSONB properties

CREATE TABLE public.entries (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  type        text        NOT NULL,
  description text        DEFAULT ''::text,
  source      text        DEFAULT ''::text,
  dm_only     boolean     DEFAULT false,
  tags        text[]      DEFAULT '{}'::text[],
  campaign    text        DEFAULT ''::text,
  created_at  timestamptz DEFAULT now(),
  properties  jsonb       DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.entries IS 'Homebrew Libram — typed content entries with flexible JSONB properties';

-- Full-text search index (name + description)
CREATE INDEX idx_entries_fts
  ON public.entries
  USING GIN (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));

-- GIN index for tag array queries
CREATE INDEX idx_entries_tags
  ON public.entries
  USING GIN (tags);

-- GIN index for JSONB property queries
CREATE INDEX idx_entries_properties
  ON public.entries
  USING GIN (properties);

-- B-tree indexes for common filters
CREATE INDEX idx_entries_type
  ON public.entries (type);

CREATE INDEX idx_entries_campaign
  ON public.entries (campaign);

CREATE INDEX idx_entries_dm_only
  ON public.entries (dm_only);

CREATE INDEX idx_entries_created_at
  ON public.entries (created_at DESC);

-- Enable Row Level Security (default secure)
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Grant access for the anon key (read-only) and authenticated (full CRUD)
GRANT SELECT ON public.entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entries TO authenticated;

-- Allow all users to read, authenticated users to write
CREATE POLICY "Entries are publicly readable"
  ON public.entries
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert entries"
  ON public.entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update entries"
  ON public.entries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete entries"
  ON public.entries
  FOR DELETE
  TO authenticated
  USING (true);