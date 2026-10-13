-- Every Homebrew Libram policy asks "who is signed in?" once per query.
--
-- Supabase's performance advisor (auth_rls_initplan): a bare auth.uid() in a
-- policy is re-run for every row a query looks at; (select auth.uid()) is run
-- once per query. The rules are otherwise identical. ALTER POLICY changes only
-- the USING / WITH CHECK text, so each policy keeps its command, roles and
-- permissive setting.
--
-- Applied 13 Oct 2026 from the guild session as one database migration,
-- guild_rls_select_wrap, together with the PC on Parchment (4) and Plot and
-- Weave (20) policies: 31 in one transaction. These are the Libram's 7
-- (ai_usage is shared with Plot and Weave's recaps, but the Libram's AI
-- import came first).

alter policy ai_usage_insert_own on public.ai_usage
  with check (((select auth.uid()) = user_id));

alter policy ai_usage_select_own on public.ai_usage
  using (((select auth.uid()) = user_id));

alter policy "Users can delete own entries" on public.entries
  using (((select auth.uid()) = user_id));

alter policy "Users can insert own entries" on public.entries
  with check (((select auth.uid()) = user_id));

alter policy "Users can select own entries" on public.entries
  using (((select auth.uid()) = user_id));

alter policy "Users can update own entries" on public.entries
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

alter policy "Owners manage own libram share" on public.libram_shares
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));
