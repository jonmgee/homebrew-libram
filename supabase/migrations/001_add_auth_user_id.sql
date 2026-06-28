-- Migration: Add user_id to entries table + replace anon RLS with user-scoped policies
--
-- NOTE: user_id is nullable for now to handle existing entries.
-- After signing in for the first time, run the following to claim existing entries:
--
--   UPDATE entries SET user_id = 'your-uuid-here' WHERE user_id IS NULL;
--
-- Then optionally: ALTER TABLE entries ALTER COLUMN user_id SET NOT NULL;

-- ── 1. Add user_id column with FK reference to auth.users ──
ALTER TABLE entries
  ADD COLUMN user_id uuid REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries (user_id);

-- ── 2. Drop all existing permissive anon policies on entries ──
DROP POLICY IF EXISTS "Allow anon insert" ON entries;
DROP POLICY IF EXISTS "Allow anon select" ON entries;
DROP POLICY IF EXISTS "Allow anon update" ON entries;
DROP POLICY IF EXISTS "Allow anon delete" ON entries;

-- Also drop any other generic policies that might exist
DROP POLICY IF EXISTS "Allow anon all" ON entries;
DROP POLICY IF EXISTS "Enable insert for anon" ON entries;
DROP POLICY IF EXISTS "Enable select for anon" ON entries;
DROP POLICY IF EXISTS "Enable update for anon" ON entries;
DROP POLICY IF EXISTS "Enable delete for anon" ON entries;
DROP POLICY IF EXISTS "Allow authenticated all" ON entries;

-- ── 3. Create user-scoped policies ──

-- INSERT: user must be authenticated and the row must belong to them
CREATE POLICY "Users can insert own entries" ON entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- SELECT: user can only see their own entries
CREATE POLICY "Users can select own entries" ON entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- UPDATE: user can only update their own entries
CREATE POLICY "Users can update own entries" ON entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: user can only delete their own entries
CREATE POLICY "Users can delete own entries" ON entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
