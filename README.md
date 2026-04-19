
# Track the Thesis

> **We keep receipts.**
> A public thesis journal where every position is stated plainly, every receipt is logged, and time is left to grade the work.

---

## ⚡ TL;DR — Making posts visible across all devices

By default, this app stores everything in `localStorage`. That means posts and hearts are **only visible in the browser that created them**. To make content global (visible to everyone, on every device, without anyone signing up):

1. Create a free [Supabase](https://supabase.com) project.
2. Run `supabase/schema.sql` in Supabase → SQL Editor.
3. Set three env vars on Vercel (Settings → Environment Variables):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OWNER_WRITE_KEY` (a long random secret you invent)
4. Paste the **same** `VITE_OWNER_WRITE_KEY` value into `supabase/schema.sql` (replace `replace-with-a-long-random-secret` in **both** policy blocks), then re-run the SQL.
5. Redeploy on Vercel.

Done — posts and hearts now sync across every visitor, on every device. See [Global sync setup](#-global-sync-setup-supabase) below for the full walkthrough.

---

## 🚀 Deploying to Vercel — Which preset?

**Use the `Vite` framework preset. Do NOT use Create React App (CRA).**

| Setting | Value |
|---|---|
| **Framework Preset** | **Vite** ✅ |
| **Build Command** | `npm run build` (auto-filled) |
| **Output Directory** | `dist` (auto-filled) |
| **Install Command** | `npm install` (auto-filled) |
| **Root Directory** | `./` (leave as default) |
| **Node.js Version** | 18.x or 20.x |

### One-click deploy flow

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import it.
3. Framework Preset → `Vite` (should auto-detect).
4. (Optional but recommended) Add the Supabase env vars below.
5. Click **Deploy**.

---

## 🌍 Global sync setup (Supabase)

Without this step, posts you create only exist on **your** browser. This section wires up a shared Postgres database that every visitor reads from — and only you (the owner) can write to — with **zero accounts required** for readers.

### Why Supabase?

- **Free tier** is generous (500 MB DB, 50k monthly active users).
- **PostgREST** exposes your tables as a REST API automatically.
- **Row Level Security (RLS)** lets public readers see posts and add hearts, but locks post creation/editing to the owner.
- No SDK needed — we hit the REST endpoint with plain `fetch()`, zero extra bundle weight.

### Step 1 — Create the project

1. Go to [supabase.com](https://supabase.com), create a free account, create a new project.
2. Wait ~1 minute for the database to spin up.

### Step 2 — Run the schema

1. Open **SQL Editor** in the Supabase dashboard.
2. Open `supabase/schema.sql` from this repo.
3. **Important:** generate a strong random secret. On macOS/Linux:
   ```bash
   openssl rand -hex 32
   ```
   or in the browser console:
   ```js
   crypto.randomUUID() + crypto.randomUUID()
   ```
4. In `supabase/schema.sql`, find the two lines that contain:
   ```
   'replace-with-a-long-random-secret'
   ```
   and replace **both** with your secret (keep the surrounding quotes).
5. Paste the edited SQL into the Supabase SQL editor and click **Run**.

### Step 3 — Copy your credentials

In Supabase → **Settings → API**, copy:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon / public** key → `VITE_SUPABASE_ANON_KEY`

### Step 4 — Set env vars on Vercel

Go to your Vercel project → **Settings → Environment Variables** and add:

| Name | Value | Environments |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` (the anon key) | Production, Preview, Development |
| `VITE_OWNER_WRITE_KEY` | The **same secret** you put in `schema.sql` | Production, Preview, Development |

Then **redeploy** (Deployments → ⋯ → Redeploy) so the new env vars take effect.

### Step 5 — Test it

1. Visit your Vercel URL in Chrome → sign in → create a post.
2. Open the same URL in Firefox, Brave, or incognito — the new post should be there.
3. Heart a post in Firefox → reload in Chrome → the count reflects it.

If something's wrong, open DevTools → Network tab and look for failed calls to `supabase.co`. Common issues:
- **401 Unauthorized** on write → your `VITE_OWNER_WRITE_KEY` doesn't match the one in `schema.sql`. Update one to match the other.
- **404 Not found** → the tables weren't created. Re-run `schema.sql`.
- **Yellow "Local-only mode" banner in Studio** → the env vars didn't reach the build. Redeploy after setting them.

### Local development with Supabase

Copy `.env.example` to `.env` and fill in the same three values. Then:

```bash
npm install
npm run dev
```

Vite exposes any var prefixed with `VITE_` to the client.

### What's safe to expose?

- `VITE_SUPABASE_ANON_KEY` — **safe.** It's designed to be public; RLS policies are the real security boundary.
- `VITE_OWNER_WRITE_KEY` — **ships to the browser**, so treat it as a *moderate* secret. It only matters for write access to `posts`. Anyone who inspects the JS bundle of your site can find it — which is fine if your threat model is "I don't want randoms spamming my blog" but not fine for high-stakes apps. If you want true secrecy, upgrade to Supabase Auth and sign in as an admin user on the server side. For a personal publishing site, the current setup is a reasonable balance.

### Falling back to local mode

If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing at build time, the app silently falls back to `localStorage` — exactly the old behavior. A yellow banner appears in the Studio so you know you're in local mode.

---

## What this is

**Track the Thesis** is a single-author publishing platform for long-horizon investors, builders, and thinkers. Every post is structured around two headers:

1. **The Thesis** — the argument. Why this, why now, why you.
2. **The Receipt** — the commitment. Entry price, position size, horizon, and a conviction score on a 0–100 scale.

The archive is chronologically honest. Misses are not deleted.

---

## 🧑‍💻 Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build to ./dist
npm run preview    # preview the production build locally
```

**Requirements:** Node.js 18+ and npm.

---

## 📁 Deployment files

| File | Purpose |
|---|---|
| `package.json` | Dependencies and npm scripts. |
| `vite.config.ts` | Vite + React plugin config. Outputs to `dist/`. |
| `tsconfig.json` | TypeScript config. |
| `vercel.json` | Vercel framework preset + SPA rewrites. |
| `index.html` | Entry HTML. |
| `public/favicon.svg` | Site favicon. |
| `supabase/schema.sql` | Database schema + RLS policies. |
| `.env.example` | Env var template. Copy to `.env` for local dev. |
| `.gitignore` / `.vercelignore` | Standard excludes. |

---

## Core principles

| # | Principle | What it means |
|---|---|---|
| 01 | **State the thesis.** | Every post opens with a plain-language argument. |
| 02 | **Log the receipt.** | Price, size, horizon, and conviction are first-class. |
| 03 | **Let time grade it.** | The archive is append-only in spirit. |

---

## Feature overview

### 📖 The Feed (public, no account required)
- Chronological or popularity-sorted stream of published theses.
- **Two-header post format** — each post renders `The Thesis` and `The Receipt` as distinct sections.
- **Conviction badge** — color-banded meter (Weak → Iron-clad).
- **Color-coded tags** — deterministic palette per tag value.
- **Search** across titles, bodies, tags, folders, and dates.
- **Hearts** — one per anonymous visitor, stored in Supabase, counts synced across devices.
- **Share menu** — X, Threads, Messenger, Instagram, copy-link.

### ✍️ The Studio (owner-only)
- Protected by email + password login.
- **Two-section composer** — independent AI refinement per header.
- **Conviction input** — slider + numeric + preset chips.
- **Tag editor** — label+value pairing with smart paste.
- **AI Assistant** — GPT-4o, Claude 3.5, Gemini, Llama.
- **Library** — search, folder-filter, inline edit/reply/delete.
- **Sync banner** warns if Supabase env vars are missing.

---

## Tech stack

- **React 18** + **TypeScript**
- **Vite 5**
- **Supabase** (Postgres + PostgREST + RLS) for shared storage
- **Vanilla CSS** (per-component, co-located)
- **Fraunces** + **Inter** via Google Fonts `@import`
- **Zero runtime dependencies** beyond React/ReactDOM (Supabase is plain `fetch()`)

---

## Project structure

```
.
├── index.html
├── vite.config.ts
├── vercel.json
├── tsconfig.json
├── package.json
├── .env.example
├── supabase/
│   └── schema.sql                # DB schema + RLS policies
├── public/
│   └── favicon.svg
└── src/
    ├── index.tsx
    ├── App.tsx                   # Shell, routing
    ├── App.css
    │
    ├── components/
    │   ├── Icon.tsx
    │   ├── SearchBar.tsx/.css
    │   ├── TagPill.tsx/.css
    │   ├── BrandLogo.tsx/.css
    │   └── SyncBanner.tsx/.css   # Shows when in local-only mode
    │
    ├── features/
    │   ├── posts/                # Domain core + Supabase sync
    │   ├── ai/
    │   ├── auth/
    │   ├── owner/
    │   ├── public/
    │   └── about/
    │
    └── utils/
        ├── persistence.ts        # localStorage wrapper
        ├── visitorId.ts          # Anonymous visitor UUID
        └── supabaseClient.ts     # Tiny fetch-based Supabase client
```

---

## Owner credentials (demo)

```
Email:    dbsuelan@revlv.com
Password: Enterpassword!@#
```

> ⚠️ These credentials live in the browser bundle. For production, swap `AuthContext` for Supabase Auth + a real admin user, and move the write-key check server-side.

---

## Troubleshooting

**"My post on Chrome doesn't appear on Firefox."**
→ You're in local-only mode. Complete [Global sync setup](#-global-sync-setup-supabase).

**"Yellow banner says Local-only mode in Studio."**
→ The `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` env vars didn't make it into the build. Re-check them on Vercel and **redeploy**.

**"Publish fails with a red error banner."**
→ Usually one of:
- `VITE_OWNER_WRITE_KEY` in Vercel doesn't match the secret in your `schema.sql` policies.
- You didn't run `schema.sql` yet (tables don't exist → 404).
- RLS is disabled / policies were dropped.

**"No Output Directory named 'build' found" on Vercel.**
→ Wrong preset. Change Framework Preset to **Vite**.

**"Hearts don't sync across devices."**
→ Check DevTools → Network for failed calls to `/rest/v1/hearts`. If they're 401, the `hearts_insert` policy didn't get created — re-run the SQL.

---

## Philosophy

> *"A civilization that lowers its time preference builds cathedrals, libraries, and long-dated infrastructure. We write as if someone will read this in ten years — because someone will, and that someone is usually us."*

**@TracktheThesis — We keep receipts.**
