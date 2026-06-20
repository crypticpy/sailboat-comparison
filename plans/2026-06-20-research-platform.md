# Research-backed buyer's intelligence platform — master plan

**Date:** 2026-06-20
**Premise:** Evolve the site from a published-spec comparator into a **bespoke decision-support tool** whose data we build ourselves — synthesised from real-world owner reports, forums, refit threads, and reviews — scored with **our own rubrics** for the mission (two-handed couple + two dogs, Patagonia → Polynesia, sub-$1M). Plus refit/provisioning cost projection, deep-dive reports, and interactions that don't feel like a spreadsheet.

## Locked decisions (2026-06-20)

1. **Charts:** bespoke SVG built on `d3-scale`/`d3-shape` — matches the Binnacle instrument language, tiny bundle, full control.
2. **Deep-dive reports:** dedicated shareable pages via `react-router` (`/boat/:id`), alongside the quick at-a-glance modal.
3. **Data trust:** publish everything **with a visible confidence level + cited sources**; nothing reaches live until an adversarial verification pass clears it. Label `owner-reported` vs `our estimate` vs `published spec`.
4. **Execution:** **pilot 3–5 boats end-to-end first** (validate research quality + token cost), then fan out to **the top 15 boats by selection score** using the cheaper **Haiku (gather) / Sonnet (verify + score)** tiers. The rest of the fleet keeps published-spec data until we choose to expand.
5. **Reusable pipeline (2026-06-20 revision):** the research process + prompts + rubric live in the repo as a versioned, re-runnable asset — [`research/research-workflow.js`](../research/research-workflow.js) + [`research/pipeline.md`](../research/pipeline.md) — so adding a boat or deepening coverage is a one-line `Workflow({ scriptPath, args:{ids|boats} })`.

## First principle — honesty & confidence (extends the shipped provenance system)

Every synthesised datum is a record of `{ value, confidence (0–1), sources[] }`. The UI surfaces confidence and citations. We **never** turn a forum anecdote into a hard safety number. Unknowns are a designed "not found / not published" state, not a guess. The adversarial verifier demotes any uncited claim to a gap.

## The expanded data model

New dimensions, each a confidence-scored, cited record (contract in `research/RUBRICS.md`):

- **Stability & heavy weather** — AVS / STIX / CE category; storm behaviour (heave-to), cutter/staysail provision
- **Cold-weather readiness** — heating, insulation, keel-stepped mast, watertight bulkheads, inside helm → **our cold score**
- **Tropical readiness** — ventilation, shade, refrigeration, watermaker, airflow, light-air ability → **our tropic score**
- **Self-steering & redundancy** — windvane option, autopilot, electrical autonomy
- **Crew/dog ergonomics & MOB** — transom/boarding, freeboard, side-deck safety, recovery
- **Owner sentiment & known issues** — praise/complaints, "what breaks," reliability, forum links
- **Refit & cost** — known issues by age, replacement intervals, parts availability
- **Provisioning** — universal passage kit + boat-specific spares

**Schema (Supabase, via MCP — CLI hangs here):** extend `boats` with typed columns for new _filterable_ scalars (`avs`, `ce_category`, `has_heating`, `cold_score`, `tropic_score`, `stability_score`, `refit_low_usd`, `refit_high_usd`) + JSONB blobs `research`, `costs`, `provisioning`, `report`. Seed via the established PostgREST bulk-upsert behind a brief, immediately-revoked anon-insert window.

## Agent groups / workshops

| #      | Workshop                    | Shape                                                                                            | Output                                                                                                      | Depends  |
| ------ | --------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | -------- |
| **W1** | Data Architecture & Rubrics | authored directly (this doc + `research/RUBRICS.md`)                                             | schema, confidence model, scoring rubrics, research JSON contract                                           | — (gate) |
| **W0** | Pilot (4 boats end-to-end)  | pipeline: research → adversarial verify → score/cost/provision                                   | proven dataset + **measured token cost**                                                                    | W1       |
| **W2** | Per-Boat Research (top 15)  | reusable pipeline (`research-workflow.js`): research(haiku)→verify(sonnet)→score(sonnet), 1/boat | researched, verified, scored dataset for the top 15                                                         | W0       |
| **W3** | Cost & Refit Modeling       | by-system + provisioning                                                                         | age-based refit model + universal & per-boat provisioning lists                                             | W1       |
| **W4** | Deep-Dive Reports (top 15)  | 1/boat                                                                                           | comprehensive narrative + chart data                                                                        | W2, W3   |
| **W5** | UX/UI Design                | design panel                                                                                     | modal redesign, clickable-KPI patterns, home control-deck, 3-way compare board, report layout, chart system | parallel |

## Implementation phases (after data + design land)

1. **Schema + seed** verified researched data (confidence + sources) into Supabase.
2. **Chart kit** — bespoke SVG primitives on d3-scale (bars, area/line, waterfall, scatter, sentiment, gauge), Binnacle-themed.
3. **Interaction redesign** — replace the 5 collapsible "Show" panels with a **Control Deck** (segmented: Weighting · Priorities · Overview · Insights); make **every KPI/number card clickable** (filter the fleet / open the relevant drill-down).
4. **Tabbed modal** — kill the long scroll: Overview · Heavy Weather & Stability · Systems · Ownership & Refit · Costs · Provisioning · Sources; mobile = segmented bottom-sheet.
5. **Cost projection + provisioning UI** — "buy-today → passage-ready" refit budget by system with a waterfall chart; universal + boat-specific provisioning checklists.
6. **Deep-dive report pages** (top 15, router) + **3-way compare board** (cap 3, visual + difference-first).
7. **Verify** (typecheck/build/Playwright 375·768·1280) → **deploy**.

## Pilot boats (W0)

`outbound` (Outbound 46), `boreal` (Boréal 47.2), `hr44` (Hallberg-Rassy 44), `tayana48` (Tayana 48 Deck Salon) — span the four categories, a range of ages/prices, and different parts-risk profiles.

## Risk discipline

- No fabricated safety numbers; storm verdicts authored only from cited heavy-weather reports, else "insufficient sourced data."
- Confidence + citations on every researched datum; adversarial verification gate before publish.
- Cost estimates are ranges with stated assumptions and sources, labelled "our estimate."
- Scoring-model changes (e.g. a distinct MOB "staying-aboard" dimension) are an explicit, separately-blessed step — they shift rankings.
