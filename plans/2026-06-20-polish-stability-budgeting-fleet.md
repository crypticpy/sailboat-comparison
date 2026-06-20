# Polish, Stability, Budgeting & Fleet Expansion

**Date:** 2026-06-20
**Author:** Claude (Opus 4.8) on behalf of Chris
**Status:** In progress — autonomous overnight execution (no questions; "make the best choices")

## Context

Live site: `https://crypticpy.github.io/sailboat-comparison/` (Vite + React + TS, Supabase
read-only catalog, git-versioned research layer in `research/data/*.json`, lazy-loaded into
tabbed dossiers + report pages). Fleet just expanded to 40 boats.

User feedback driving this work (verbatim intent):

1. **Self-talk in published content** — score `rationale`/`basis` fields leak internal scoring
   arithmetic ("Heating (25 pts) removed as unverified; re-normalised over remaining 75-pt
   pool… Raw 37 over 75-pt pool, normalised to 49") straight into the user-facing dossier.
   "Hard to read." Make it end-user appropriate.
2. **Stability indexes didn't come through** — researched `stability_score` = 0/"not published"
   for many boats even when the hull proxies (CSF, ballast ratio) were in hand. "This should be
   calculatable."
3. **Formatting of many text sections needs sprucing up.**
4. **Deepen Boreal, Garcia, Amel** — more sources, deeper investigation, refit packages &
   upgrades, provisioning strategies.
5. **Budgeting page** — planning/budgeting tools for purchase, refit, upgrade, provisioning,
   voyages & passages.
6. **Add Moody.**

Persona guidance: when in doubt, decide as our sailing-consultant personas would — bluewater
cruising domain judgement, honesty-first (never present an estimate as a published/measured
safety number).

## Honesty rule (non-negotiable)

Never fabricate a measured safety number (published AVS / STIX / CE category). Computed
estimates are allowed **only when transparently labelled as computed from hull form**, with the
formula/source shown, and visually distinct from published values. "Not published" remains a
valid, designed state for the _published_ slot.

---

## Workstream A — Content polish (de-jargon + formatting)

**Problem:** `cold_score.rationale`, `tropic_score.rationale`, `stability_score.rationale`, and
`*.basis` render raw scoring-process notation. `storm_verdict.text` and refit `assumptions`
also carry process meta-language ("per rubric", "adversarial verification", "the often-cited
owner quote was not found in the fetched source and is excluded", "our estimates").

**Fix (two parts):**

- **Code (`BoatDossier.tsx` + CSS):** Stop rendering raw `basis` formula strings to users
  (drop, or render as a clearly-technical collapsible "inputs" line). Restyle the rationale as a
  clean, optionally-collapsible "Why this score" block with proper typography. Improve the
  formatting of long prose sections generally (storm verdict, refit, provisioning).
- **Content (agents):** Rewrite the prose fields in `research/data/*.json` into clean,
  reader-facing language. **Constraint:** never change a numeric value, confidence, score, fact,
  citation, or verdict — only the _wording_. Strip arithmetic/process language; keep the "why."
  - Agents own disjoint file sets (no two agents touch the same file).
  - Files deepened by Workstream C (boreal, garcia, amel54/55/60) are polished _by those same
    agents_ as part of the deepen brief — not double-touched here.

## Workstream B — Computed stability index

**Add to `src/lib/metrics.ts`** (transparent, sourced formulas):

- `avsEstimate(b)` — estimate angle of vanishing stability from hull form (beam, displacement,
  ballast ratio, B/D). Label everywhere as "est." / "computed from hull form."
- `stabilityIndex(b)` — 0–100 composite from the standard calculatable ratios (capsize screening
  formula, ballast ratio, comfort ratio) → fills the dossier "Stability" slot when no _published_
  AVS/CE exists, clearly tagged `computed`.
- Keep existing `csf`, `comfort` as-is.

**Render:** dossier Stability score → prefer published AVS/CE (from research) when present;
otherwise show the computed `stabilityIndex` with a `computed` provenance chip and the estimated
AVS band. Report page + CompareModal "AVS" column → show est. value with an "est." marker when
not published. Document the method in the site disclaimer (`App.tsx` DISCLAIMER).

## Workstream C — Deepen Boreal, Garcia, Amel

Deep-research pass (web sources) for: **Boreal** (boreal.json), **Garcia** (garcia.json),
**Amel 54** (amel54.json), **Amel 55** (amel55.json), **Amel 60** (amel60.json). One agent per
boat. Each enriches its `research/data/<id>.json`:

- More + better sources (owner forums, magazine tests, builder docs, brokerage).
- Deeper `research.facts`, `refit_items` → concrete **refit packages & upgrade paths** with
  cost bands.
- `provisioning_specific` → real **provisioning strategies** for that boat's galley/tankage.
- Clean reader-facing prose (satisfies Workstream A for these files).
- Honesty rule applies (no fabricated safety numbers).

## Workstream D — Budgeting & planning page

New route `/budget` (+ nav entry). Self-contained planning tools, state persisted to
localStorage, exportable/printable. Tools:

1. **Purchase budget** — boat price + survey + tax/registration + delivery + commissioning +
   contingency → all-in acquisition cost; optional loan calculator.
2. **Refit budget** — itemised, pre-seeded from a selected boat's `refit_projection` when
   available; editable line items with low/high bands.
3. **Upgrade builder** — pick upgrades (watermaker, solar/lithium, windvane, liferaft, AIS,
   radar, etc.) from a catalogue with typical cost bands → running total.
4. **Provisioning calculator** — crew × days × $/person/day by region; ties to the universal
   provisioning dataset where relevant.
5. **Voyage / passage planner** — distance + boat cruise speed (from `metrics`) → days,
   fuel burn & cost, water/food consumption, est. cost per passage.
6. **Total cost of ownership** roll-up — annual berthing, insurance, maintenance (%/yr),
   haul-out → yearly + per-mile cost.

Built from existing `metrics.ts` helpers (cruiseKt, burnLph, rangeNm, waterDays) and boat data.
Match the Binnacle visual language. Mobile-first.

## Workstream E — Add Moody

Add 1–2 Moody models, full pipeline (Boat record → Supabase + boats.json → research dossier →
index). Target: **Moody 54** (Bill Dixon centre-cockpit bluewater) as primary; add a second
well-documented model (Moody 45 / 47 / 425, or a modern Moody DS) if sources support a quality
record. Same authoring + research + honesty standards as the recent 6.

---

## Execution order

1. **B** (stability calc in metrics.ts) — foundational, code-only.
2. **Parallel agent round:** C (5 deepen agents) + E (Moody research/author) + A (polish agents
   for the remaining research files) — disjoint file ownership.
3. **D** (budgeting page) — code, in parallel with agent round.
4. **A-code + B-render** — dossier formatting + stability render wiring.
5. Integrate Moody into Supabase + boats.json; regen `research-index.json` + `seed.sql`.
6. **Verify:** `tsc --noEmit`, `npm run build`, headless-Chrome (40+ boats, dossiers clean of
   self-talk, stability populated, budgeting page works, Moody present, zero console errors).
7. Commit (conventional, per-workstream or grouped) and push to deploy.

## Verification criteria

- No `research/data/*.json` user-facing field contains scoring-process notation (grep for
  "re-normalis", "pt pool", "per rubric", "adversarial", "criterion scores", "Raw weighted").
- Every boat shows a stability readout (published or clearly-labelled computed) — none blank.
- `/budget` renders and all six tools compute correctly on desktop + mobile.
- Moody appears in the fleet (Supabase + bundled), dossier + report render.
- `tsc` clean, build green, headless run zero console/page errors.
