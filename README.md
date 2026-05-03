# عيسى للتدريب — Eisa Coaching Platform

Next.js 14 coaching platform — browser-based deployment via GitHub.com + Vercel.com

---

## ⚠️ SECURITY — Read before uploading

**The `.env.local` file is NOT included in this zip intentionally.**
It contains your secret API keys and must NEVER be uploaded to GitHub.

**What to do:**
1. After uploading to GitHub, find `.env.local.example` in your repo
2. Open it, copy the contents
3. In Vercel → Settings → Environment Variables, paste each value with its real key
4. You never need to create `.env.local` on GitHub — only in Vercel's dashboard

The `.gitignore` file in this project blocks `.env.local` from being committed.
All other config happens inside Vercel and the admin panel at `/admin/settings`.

---

## STEP 1 — Upload to GitHub (browser only, no desktop app)

### A. Create the repository
1. Go to **github.com** → click **+** (top right) → **New repository**
2. Name: `eisa-platform`  |  Visibility: **Private**  |  Leave everything else empty
3. Click **Create repository**

### B. Upload files via browser
1. On the empty repo page, click **"uploading an existing file"**
2. Unzip this file on your computer
3. Open the `eisa-platform/` folder — **select everything inside it** (not the folder itself)
4. Drag all selected files and folders into the GitHub browser window
5. Scroll down → type commit message: `initial: eisa coaching platform`
6. Click **Commit changes**

> **If the browser uploader rejects subfolders:** Press the `.` key while on your empty repo — this opens VS Code in the browser (github.dev). Drag the files from your computer into the left sidebar Explorer panel, then click the Source Control icon → Commit & Push.

---

## STEP 2 — Deploy on Vercel (browser only)

1. Go to **vercel.com** → sign in with GitHub
2. Click **Add New → Project**
3. Select `eisa-platform` → click **Import**
4. Open **Environment Variables** section and add these 5 variables:

### Variable 1
**Name:** `NEXT_PUBLIC_SUPABASE_URL`
**Value:** `https://rgejagiyxllrpdbpehxa.supabase.co`

### Variable 2
**Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**Value:** Get from → supabase.com → eisa-coaching-prod → Settings → API → `anon public`

### Variable 3
**Name:** `SUPABASE_SERVICE_ROLE_KEY`
**Value:** Get from → supabase.com → eisa-coaching-prod → Settings → API → `service_role` (keep secret)

### Variable 4
**Name:** `MASTER_ENCRYPTION_KEY`
**Value:** Go to **generate-secret.vercel.app** → copy the generated 64-character hex string

### Variable 5
**Name:** `NEXT_PUBLIC_APP_URL`
**Value:** `https://coach.eisaprod.com` (or your Vercel URL for now)

5. Click **Deploy** — Vercel builds automatically (~2 min)

---

## STEP 3 — Connect your domain (optional now)

1. Vercel → your project → **Settings → Domains**
2. Add `coach.eisaprod.com`
3. Add the DNS records Vercel shows you at your domain registrar

---

## STEP 4 — Create your first Admin user

1. **supabase.com** → project **eisa-coaching-prod** → **Authentication → Users → Invite user**
2. Enter your email → check your inbox → click the invite link → set a password
3. Back in Supabase → **Table Editor → profiles** → find your row
4. Edit: set `role = admin` and `is_active = true` → Save
5. Go to your Vercel URL → `/login` → sign in

---

## STEP 5 — Configure the platform

Everything is configured from the admin UI — no files to edit:

1. Go to `/admin/settings`
2. **Email tab** → add Resend API key + from address
3. **Payments tab** → add Stripe keys when ready
4. **Platform tab** → update name, colors, logo URLs

---

## Security model

| File | In GitHub? | Why |
|------|-----------|-----|
| `.env.local` | ❌ Never | Contains secret API keys — blocked by `.gitignore` |
| `.env.local.example` | ✅ Yes | Safe template — no real values, just placeholders |
| `.gitignore` | ✅ Yes | Tells GitHub what to ignore |
| All source code | ✅ Yes | No secrets in any `.tsx` or `.ts` file |

Secret keys live in **Vercel Environment Variables** only — never in code.

---

## Project structure

```
app/               → All pages (Next.js App Router)
  (auth)/          → Login + magic link verify
  (platform)/      → Protected admin / coach / client pages
  api/             → Stripe webhook + Google OAuth callback
features/          → Business logic by domain
  admin/           → Settings, Users, Transfers, Pricing
  client-portal/   → Weekly update form (3-color + pressure mode)
  coach-dashboard/ → Coach reply form
components/layout/ → Sidebar (role-aware: admin / coach / client)
lib/supabase/      → Browser + server Supabase clients
lib/types/         → Full TypeScript database schema
styles/tokens.css  → All design tokens (colors, spacing, fonts)
middleware.ts      → Auth guard + role-based routing
.gitignore         → Blocks secrets and build files from GitHub
.env.local.example → Template for environment variables (safe to share)
```

---

## Supabase project

- **Name:** eisa-coaching-prod
- **Project ID:** rgejagiyxllrpdbpehxa
- **Region:** ap-southeast-1 (Singapore)
- **Status:** Fully migrated — 15 tables, RLS policies, seed data, 4 views
