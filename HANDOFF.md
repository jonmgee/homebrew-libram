# Handoff: Homebrew Libram

## Current task — infrastructure scaffold

- [x] Create project folder at `~/homebrew-libram/`
- [x] README.md, .gitignore, memory/, HANDOFF.md
- [x] Initialise git repo + initial commit
- [x] Create public GitHub repo: **https://github.com/jonmgee/homebrew-libram**
- [x] Push local repo to GitHub (main branch)
- [x] Deploy placeholder page to **https://homebrew-libram.vercel.app** (200 OK)
- [x] **Supabase:** project created, credentials stored in `.env` and Vercel env vars, connection confirmed
- [x] **Vercel env vars:** VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set for production, preview, and development
- [ ] **Vercel Git integration** — `vercel git connect` failed (Vercel needs GitHub app installed on the repo). Manual step required.

## Next steps

### Vercel Git integration (auto-deploy on push)
Link the repo in the Vercel dashboard:
1. Go to https://vercel.com/jon-mg-ee-s-projects/homebrew-libram/settings
2. Click "Connect Git Repository" → select `jonmgee/homebrew-libram`
3. Done — every push will auto-deploy

### App code
Awaiting brief from Jon.