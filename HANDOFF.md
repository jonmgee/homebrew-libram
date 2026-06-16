# Handoff: Homebrew Libram

## Current task — infrastructure scaffold

- [x] Create project folder at `~/homebrew-libram/`
- [x] README.md, .gitignore, memory/, HANDOFF.md
- [x] Initialise git repo + initial commit
- [x] Create public GitHub repo: **https://github.com/jonmgee/homebrew-libram**
- [x] Push local repo to GitHub (main branch)
- [x] Deploy placeholder page to **https://homebrew-libram.vercel.app** (200 OK)
- [ ] **Vercel Git integration** — `vercel git connect` failed (Vercel needs GitHub app to be installed on the repo). See next steps.
- [ ] **Supabase project** — needs to be created manually or via PAT. See next steps.

## Next steps

### Vercel Git integration (auto-deploy on push)
Option A — Link in Vercel dashboard:
1. Go to https://vercel.com/jon-mg-ee-s-projects/homebrew-libram/settings
2. Click "Connect Git Repository" → select jonmgee/homebrew-libram
3. It'll start auto-deploying on every push

Option B — Install Vercel GitHub app:
1. Go to https://github.com/apps/vercel
2. Install on the jonmgee organisation or account
3. Then run `vercel git connect https://github.com/jonmgee/homebrew-libram.git` again

### Supabase project
Option A — Create via CLI (requires PAT):
1. Go to https://supabase.com/dashboard/account/tokens
2. Create a new token (name: `homebrew-libram-setup`)
3. Run: `echo "<token>" | supabase login --token-stdin`
4. Then: `supabase projects create homebrew-libram --org-id <org-id>`

Option B — Manual:
1. Go to https://supabase.com/dashboard/projects
2. Click "New project"
3. Name: homebrew-libram
4. Database password: (generate/store securely)
5. Region: Europe West (or closest)
6. Wait for creation
7. Go to Settings → API
8. Copy Project URL and anon/public key
9. I'll wire up env files and connection test