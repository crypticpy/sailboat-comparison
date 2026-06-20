# Sailboat Comparison — Rewrite to TypeScript + React + Vite, backed by Supabase

**Date:** 2026-06-19
**Status:** Awaiting sign-off (2 open decisions + 1 user action)
**Decisions locked (from kickoff):** Full rewrite now · TypeScript + React + Vite · Supabase as the data store now · stays hosted on GitHub Pages.

---

## 1. Goal

Take the current single-file vanilla site (1,523 lines, duplicated across `index.html` +
`sailboat-comparison.html`, data fragmented across 5 parallel JS maps) and turn it into:

- A **mobile/tablet-first** React app (the comparison table is the main offender today —
  `min-width:1080px`, overflows phones).
- A codebase that is **easy to extend** — one typed `Boat` record per boat, components instead
  of 1,200 lines of `innerHTML` string-building.
- A **real database** (Supabase/Postgres) as the source of truth, consumed from a static
  Pages build via `supabase-js` + the anon/publishable key, secured by row-level security.
- Still **deployable to GitHub Pages** (via a GitHub Actions build step).

## 2. Target repo layout

```
/
├─ index.html                     # Vite entry (replaces the old hand-written page)
├─ vite.config.ts                 # base: '/sailboat-comparison/'  (project-pages subpath)
├─ package.json / tsconfig.json
├─ .env.local                     # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (gitignored)
├─ src/
│  ├─ main.tsx, App.tsx
│  ├─ types/boat.ts               # interface Boat = the schema, single source of truth
│  ├─ lib/supabase.ts            # client + loadBoats() seam (the swappable data layer)
│  ├─ lib/metrics.ts             # comfort, csf, hullSpeed, rangeNm, fit, pillars… (ported)
│  ├─ components/                 # BoatCard, CompareTable, DetailModal, Scorecard,
│  │                              #   RadarChart, Filters, WeightSliders, PillarBars…
│  └─ styles/                     # mobile-first CSS (CSS modules or one global sheet)
├─ supabase/
│  ├─ config.toml
│  └─ migrations/                 # schema + RLS + seed (generated via `supabase db pull`)
├─ scripts/extract-legacy-data.mjs  # one-time: legacy JS maps -> data/boats.json
├─ data/boats.json                # generated, typed; offline fallback + seed source
├─ legacy/sailboat-comparison.html  # archived original (reference; git history also has it)
└─ .github/workflows/deploy.yml   # npm ci && npm run build -> deploy dist/ to Pages
```

## 3. Data model (Postgres)

Hybrid design: **real typed columns for anything we filter/sort/compute on; JSONB for the
narrative and nested arrays.** Adding "a lot more information" later = `add column` or a new
JSONB key, no rewrite.

`boats` table (one row per boat):

- **Identity / classification:** `id text pk`, `name`, `builder`, `designer`, `color`,
  `years`, `material`, `category`, `cockpit_type`.
- **Numeric (indexed, filter/sort/compute):** `loa_n`, `lwl_ft`, `beam_ft`, `disp_lb`,
  `draft_min_n`, `sad numeric`, `dl numeric`, `fuel_n`, `water_n`, `engine_hp`,
  `price_min_usd`, `price_max_usd`, `budget text` (`fit|tight|over`), `budget_n`.
- **Display-string specs:** `loa`, `lwl`, `beam`, `draft_min`, `draft_max`, `displacement`,
  `ballast`, `ballast_ratio`, `sail_area`, `air_draft`, `engine`, `drive`, `cabins`, `keel`,
  `cockpit`.
- **Narrative text:** `best_for`, `protection_text`, `rig`, `handling_text`,
  `engine_workshop`, `systems`, `storage_text`, `range_text`, `accommodation`,
  `high_lat_text`, `tropical_text`, `price_text`, `price_new`, `price_used`, `budget_text`,
  `notable`.
- **JSONB / arrays:** `scores jsonb` (the 9 mission dims), `tags text[]`, `fun text[]`,
  `price_examples text[]`, `sources jsonb`, `youtube jsonb`, `pros text[]`, `cons text[]`,
  `awards jsonb`, `voices jsonb`, `ownership jsonb` (mastStep, keelRudder, complexity,
  maintain, partsText, problems, sentiment, communities, risks, scores).
- **Bookkeeping:** `created_at timestamptz default now()`, `updated_at`.

**RLS / exposure (per Supabase skill):**

- `alter table boats enable row level security;`
- Public read: `create policy "public read" on boats for select to anon, authenticated using (true);`
- No insert/update/delete policies for `anon` → writes are blocked by default (service role /
  dashboard / migrations only). If we add an admin path (open decision #2), writes get a
  policy scoped to `to authenticated` + an ownership/role predicate (never `user_metadata`).
- Ensure the table is granted to `anon`/`authenticated` for the Data API.

## 4. Migrating the existing 34 boats

The legacy data is trusted local JS object-literals embedded in the HTML. Plan:

1. `scripts/extract-legacy-data.mjs` reads `legacy/sailboat-comparison.html`, evaluates the
   `BOATS`, `PC`, `END`, `OWN`, `HP` literals in a sandbox, **merges by `id`**, and writes a
   consolidated, schema-shaped `data/boats.json` (34 records, one object each).
2. A seed step inserts those rows into Supabase (generated SQL or a Node upsert with the
   service-role key, run locally — never shipped).
3. `data/boats.json` stays in the repo as the typed fixture + offline fallback for
   `loadBoats()` (so the UI still renders if the DB is unreachable).

## 5. Deployment pipeline

- Switch Pages from **legacy (branch)** to **GitHub Actions** build (`build_type: workflow`).
- `.github/workflows/deploy.yml`: `npm ci` → `npm run build` → `actions/upload-pages-artifact`
  → `actions/deploy-pages`. Token already has `workflow` scope.
- `vite.config.ts` `base: '/sailboat-comparison/'` so assets resolve under the project subpath.
- Supabase URL + anon key injected at build time from GitHub repo **secrets/variables**
  (anon key is publishable; safety is RLS). `.env.local` for local dev, gitignored.

## 6. Phased execution (each phase independently verifiable)

- **Phase 1 — App scaffold + UI port (no DB yet).** Vite+React+TS; port metrics + rendering
  into components; mobile-first responsive pass (table → stacked cards on narrow screens,
  modal, touch targets). Data from local `data/boats.json`. _Verify:_ `npm run build` clean,
  `npm run dev` renders all 34 boats, responsive at 375/768/1280 px (screenshots).
- **Phase 2 — Supabase.** Create/connect project; author schema + RLS via `execute_sql`,
  snapshot to a migration; extract + seed 34 rows; wire `loadBoats()` to `supabase-js` with
  the JSON fallback. _Verify:_ page loads boats from the DB; `anon` can SELECT, cannot write;
  `supabase db advisors` clean.
- **Phase 3 — Deploy.** Add the Actions workflow; flip Pages to workflow build; set env.
  _Verify:_ live at the Pages URL, data loads from Supabase, no console errors, responsive.
- **Phase 4 (optional, only if decision #2 = yes now) — Admin write path.** Supabase Auth +
  a gated add/edit form; write RLS policies. Otherwise data is managed via dashboard/SQL.

## 7. Open decisions (need your call) + the one action only you can do

1. **Supabase project:** create a brand-new project, or connect an existing one (give me the
   project ref)? Default region if new: **us-east-1** (you're US-based) — say if you prefer
   another.
2. **Admin write path now or later:** read-only public site now (data managed by me via the
   seed migration / dashboard), or also build a minimal authenticated add/edit UI this round?
   Recommended: **read-only now, admin later** — ship the migration first, add the write path
   once the schema has settled.
3. **Action required from you:** I cannot create/link a cloud Supabase project without your
   account. You'll authenticate either by triggering the Supabase MCP OAuth flow, or by
   running `! supabase login` (then `supabase link`) in this session. I'll prompt you at the
   exact step.

## 8. Risks / notes

- Anon key ships in the client bundle by design — **RLS is the only thing standing between the
  DB and the public**, so the read-only policy + no-write-policy posture must be verified, not
  assumed.
- Pages subpath (`/sailboat-comparison/`) is a common source of broken asset paths — the Vite
  `base` must match; will verify on the live URL, not just locally.
- The old single-file site keeps serving until Phase 3 cuts over; archived to `legacy/` so the
  original is never lost (also in git history at commit `3c6cb7f`).
- This is multi-session-sized. Phases 1–3 are the MVP; Phase 4 is additive.
