-- Sailboat comparison catalog: one row per boat.
--
-- Design (see plans/2026-06-19-rewrite-react-ts-supabase.md §3): real typed
-- columns for anything we filter / sort / compute on, JSONB for narrative and
-- nested arrays. Column names are snake_case; the app's camelCase Boat shape is
-- mapped in src/lib/data.ts (rowToBoat) — that adapter and this DDL must agree.
--
-- Note: `sad` and `dl` are display strings ("~17.6", "~18–20", "n/a",
-- "moderate"), not numbers, so they are text. Numeric ratios used for scoring
-- are computed at runtime in src/lib/metrics.ts from the *_n / *_ft / *_lb
-- columns, not read from these display fields.

create table if not exists public.boats (
  -- Identity & classification
  id            text primary key,
  name          text not null,
  builder       text,
  designer      text,
  color         text,
  years         text,
  material      text,
  category      text,
  cockpit_type  text,

  -- Display-string specs (rendered verbatim)
  loa           text,
  lwl           text,
  beam          text,
  draft_min     text,
  draft_max     text,
  displacement  text,
  ballast       text,
  ballast_ratio text,
  sail_area     text,
  air_draft     text,
  engine        text,
  drive         text,
  cabins        text,
  keel          text,
  cockpit       text,
  fuel          text,
  water         text,

  -- Numeric (filter / sort / compute)
  loa_n         numeric,
  lwl_ft        numeric,
  beam_ft       numeric,
  disp_lb       numeric,
  draft_min_n   numeric,
  sad           text,   -- display string (e.g. "~17.6", "~18–20", "n/a")
  dl            text,   -- display string (e.g. "~216", "moderate", "n/a")
  fuel_n        numeric,
  water_n       numeric,
  engine_hp     numeric,
  price_min_usd numeric,
  price_max_usd numeric,
  budget        text check (budget in ('fit', 'tight', 'over')),
  budget_n      numeric,

  -- Narrative text
  best_for        text,
  protection_text text,
  rig             text,
  handling_text   text,
  engine_workshop text,
  systems         text,
  storage_text    text,
  range_text      text,
  accommodation   text,
  high_lat_text   text,
  tropical_text   text,
  price_text      text,
  price_new       text,
  price_used      text,
  budget_text     text,
  notable         text,

  -- Collections / nested
  scores         jsonb  not null default '{}'::jsonb,  -- 9 mission dims, 0–5
  tags           text[] not null default '{}',
  fun            text[] not null default '{}',
  price_examples text[] not null default '{}',
  sources        jsonb  not null default '[]'::jsonb,   -- [{name,url}]
  youtube        jsonb  not null default '[]'::jsonb,   -- [{name,url,note}]
  pros           text[] not null default '{}',
  cons           text[] not null default '{}',
  awards         text[] not null default '{}',
  endorsements   jsonb  not null default '[]'::jsonb,   -- [{who,note,url?}]
  badge          text,
  own            jsonb  not null default '{}'::jsonb,    -- ownership/support layer

  -- Bookkeeping
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.boats is
  'Bluewater sailboat comparison catalog. Public read-only via RLS; writes via service role / migrations only. Derived metrics (mission fit, pillars, range) are computed client-side in src/lib/metrics.ts.';

-- Row-level security: the anon key ships in the client bundle, so RLS is the
-- only boundary between this table and the public. Posture: everyone may read,
-- nobody may write through the Data API (no insert/update/delete policies →
-- those operations are denied for anon/authenticated by default).
alter table public.boats enable row level security;

create policy "Public read access"
  on public.boats
  for select
  to anon, authenticated
  using (true);

-- Expose the table to the Data API for the read roles (separate from RLS, which
-- governs which rows are visible once the table itself is reachable). SELECT
-- only — no insert/update/delete grants.
grant select on public.boats to anon, authenticated;
