# UI/UX Redesign — "The Binnacle" design language

**Date:** 2026-06-20
**Source:** 17-agent expert workshop (7 critics → 5 collaboration pairs → 3 vision framings → 1 design-director synthesis → 1 adversarial stress-test), run `wf_db0f814b-fb2`.
**Audience:** an experienced skipper choosing a sub-$1M bluewater monohull for a two-handed couple + two dogs, cold Patagonia → tropical Polynesia.

## Thesis

**The interface is a ship's instrument, and honesty is the aesthetic.** Every figure is legible, type-coded by what it means, and the tool openly admits what it does _not_ know. We never fabricate a safety number or a seamanship claim to fill a slot — "not published" is a designed, first-class state.

The stress-test confirmed the language is **coherent**, with one caveat: the original P0 set over-promised decision-support on data that doesn't exist as structured fields (AVS, CE design category, heater/insulation/inside-helm booleans are prose-only across the 34 boats; only 5/34 publish a loaded displacement). This round therefore ships the full visual/structural redesign + the _derivable_ half of the heavy-weather work, and defers the per-boat data authoring to a follow-up round.

## Design tokens

- **Surfaces:** ink `#0B2030` / ink-2 `#14334A` (bezels, hero, footer), paper `#FAF6EE` (page), card `#FFFCF6`, brass-tinted hairline `rgba(184,137,59,.28)`.
- **Brass accents:** `#B8893B` / bright `#D6A94B` / deep `#9A6F2C` — active states, focus ring, the binnacle gauge.
- **Rate tokens:** good `#1F7A52`, ok `#B07D1E`, warn `#B23A2B`, neutral `#6B7785` (the "not published" state).
- **Category hues (distinct, fixes four muddy blue-grays):** Aluminium expedition `#5B8AA6`, Centre-cockpit `#1F6F73`, Deck-saloon/pilothouse `#B07D2E`, Aft-cockpit `#5A6B7A`.
- **Pillars (drops the alien purple):** mission `#1F6F73`, sea `#2E7D5B`, ownership `#A8762E`, value `#4A6076`.
- **Type:** Fraunces (display/numerals) + Public Sans (UI), variable, `font-variant-numeric: tabular-nums` on all data, tabular-capable system fallback for marina-wifi font failure.
- **Motion:** `--t-fast 120ms` / `--t-base 220ms` / `--t-sheet 320ms`, ease `cubic-bezier(.2,.8,.2,1)`; mandatory `prefers-reduced-motion` guard.

## Shipped this round

1. **Binnacle identity** — full token/type/surface rewrite; ink-bezel card headers with a category-hue accent (fleet-of-instruments coherence, type-coded by hue).
2. **Brass binnacle Ring** — score reborn as a gauge with tick marks, Fraunces tabular numeral, always-on tier WORD ("Strong · 89"), arc sweeps on re-weight, `role="img"` + composed aria-label.
3. **Tier bars replace the 9-axis radar** — labeled horizontal bars with a **fleet-median tick**; screen-reader native, legible at 375px.
4. **Card 3-tier reset (delete-first)** — dynamic "why it fits YOU" chips (computed from the user's top-weighted dims over existing `scores[]`) _replace_ the static tag-pill row; net element count drops.
5. **Heavy-weather & stability strip (derivable-only)** — loaded capsize screen + comfort + inside-helm (from `cockpitType`) + keel/rudder (from `own.keelRudder`); AVS/CE render as **"not published — confirm with surveyor"**. No fabricated stability numbers.
6. **Autonomy-in-days** — water/fuel reframed into days for 2 crew + 2 dogs, with the payload assumption stated on the figure.
7. **Ship's-Log lead** — detail modal opens with the hand-authored `bestFor` verdict + the strongest pro / sharpest watch-out. No auto-generated seamanship assertions.
8. **Provenance map** — every surfaced figure tagged computed-from-physics / editorial-opinion / published-spec, driving a small provenance marker so the honesty thesis is real, not decorative.
9. **Difference-first compare** — "show only differences" toggle + per-row winner highlight.
10. **Accessibility + motion floor** — `:focus-visible` brass ring, `prefers-reduced-motion`, ≥44px targets, `role`/aria on every SVG, a tier WORD beside every color-coded value.

## Deferred to a data-authoring round (do NOT fake these)

- Structured per-boat **AVS / STIX / CE category**, **diesel heating**, **hull insulation**, **keel-stepped**, **windvane** booleans → then the survival strip's published half + hero mission-count filters become real.
- **Live loaded-condition toggle** — needs a user-signed-off payload model (L/person/day + dog + gear); only 5/34 boats publish a loaded figure today.
- **P2 Passage-Plan spine** — merge favourites+compare into one Shortlist, FLIP re-rank, mobile Tide Dock. Highest-risk hand-rolled interaction; sequence after the identity/a11y wins land.
- A distinct **"staying-aboard" (MOB/jackline) dimension** — a scoring-model change that would shift rankings; must not ride along in a visual round.
