# Research contract & scoring rubrics

This is the single source of truth for (a) what every research agent must collect and
(b) how our own scores are computed from it. Agents and humans both read this.

## Confidence model (0–1, on every researched datum)

- **0.85–1.0** — published builder/design spec, _or_ ≥2 independent credible sources agree.
- **0.6–0.84** — one credible source (a named review, a builder page, a substantiated owner thread).
- **0.3–0.59** — a single anecdotal/forum mention, or reasonably inferred from related facts (must say so).
- **< 0.3** — weak/unconfirmed; treat as a gap, do not publish as fact.
  Every datum needs `sources[]` with a real URL and, where possible, a short quote. **No source → it's a gap, not a fact.** Never invent a number, a URL, or a quote.

## Research contract (per boat) — the JSON each research agent returns

```
{
  id,
  facts: [ { key, value, confidence, sources:[{title,url,quote}] } ],   // see fact keys below
  sentiment: { praise:[], complaints:[], known_issues:[], forums:[{title,url}] },
  refit_items: [ { system, action, age_relevant:bool, cost_low_usd, cost_high_usd, confidence, sources:[] } ],
  provisioning_specific: [ { item, category, why } ],
  gaps: [ "what we could not source" ],
  overall_confidence
}
```

**Fact keys to pursue** (null/omit if unsourced — and add to `gaps`):
`stability.avs`, `stability.stix`, `stability.ce_category`, `stability.ballast_type`,
`cold.heating` (type/presence), `cold.insulation`, `cold.keel_stepped_mast`, `cold.watertight_bulkheads`, `cold.inside_helm`,
`tropical.ventilation`, `tropical.shade`, `tropical.refrigeration`, `tropical.watermaker`, `tropical.airflow`,
`self_steering.windvane_option`, `self_steering.autopilot`, `self_steering.electrical_autonomy`,
`ergonomics.transom`, `ergonomics.freeboard`, `ergonomics.side_decks`, `ergonomics.mob_recovery`,
`heavy_weather.storm_report` (cited owner/reviewer heavy-weather behaviour), `heavy_weather.cutter_staysail`,
`refit.standing_rigging_age`, `refit.known_issues`, `parts.availability`.

## Our scoring rubrics (applied by the scoring agent to the _verified_ record)

### Cold-weather readiness (0–100)

Weighted, only over sourced inputs (re-normalise weight over what's known; report `confidence` = coverage):
diesel/solid heating present 25 · hull insulation 15 · inside/sheltered helm 20 · keel-stepped mast 10 ·
watertight bulkhead / crash box 10 · hard cockpit shelter 10 · cold tankage (water/fuel) 10.

### Tropical readiness (0–100)

opening hatches/ventilation 20 · shade (bimini/awning/hardtop) 15 · refrigeration capacity 15 ·
watermaker 15 · hull/deck airflow & light colour 15 · light-air ability (SA/D) 20.

### Stability normalisation (0–100, `basis` names the input)

AVS ≥130 → 90–100 · 120–129 → 75–89 · 110–119 → 55–74 · <110 → ≤45.
If only CE category: A → 80 / B → 60 / C → 40 (basis="CE category"). Neither AVS nor CE → `not published`.

### Storm verdict (authored prose)

One honest paragraph **only** from cited heavy-weather reports (heaves-to, behaviour under storm canvas,
windvane use, motion). If no cited behaviour exists → `"insufficient sourced data"`. Carry `confidence` + `cited:true`.
Never assert a seamanship behaviour the sources don't support.

### Refit projection — "buy today → passage-ready" (USD ranges, age-based)

Compare boat age to typical service intervals; flag items due/overdue + researched known issues. Per-item low/high:

- standing rigging (replace ~15–20 yr): $8k–$30k by size · running rigging (~8–10 yr): $2k–$6k
- sails (~8–12 yr, full suit): $15k–$45k · engine (repower ~25–30 yr / high hours): $25k–$70k; service: $2k–$8k
- electronics/nav (~10–15 yr): $8k–$30k · batteries + charging/solar (~6–10 yr): $5k–$20k
- ground tackle / windlass: $3k–$10k · seacocks/through-hulls (~25 yr): $3k–$9k
- liferaft + safety/EPIRB: $4k–$12k · canvas/dodger (~10–15 yr): $4k–$12k · watermaker (if absent): $6k–$15k
  Output `{ total_low, total_high, by_item:[{system,low,high,note}], assumptions }`. Always a **range**, labelled "our estimate," with the age logic stated.

### Boat-specific provisioning

Spares/parts unique to this boat's systems (engine model impellers/belts, rig/furler spares, pump rebuild kits,
proprietary parts, known-weak-point spares). The **universal** passage kit is defined once (W3), not per boat.
