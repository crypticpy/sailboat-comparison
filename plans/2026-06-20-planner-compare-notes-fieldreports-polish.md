# Plan — Planner level-up, advanced compare, local notes, field reports, world-class polish

Date: 2026-06-20
Owner: autonomous (user asleep; "make the best choices… don't stop until world-class")

## Goals (from the user)

1. **Voyage/budget planner level-up**: bring a chosen boat into the plan (exists — improve),
   **export** the plan, and **compare plans between 2 boats**.
2. **Comparison engine**: more advanced + more interactive.
3. **Personal notes & comments**: local-only (browser DB).
4. **Deepen Boreal & Garcia** (and Amel + Moody) with **real-life accounts** — weather,
   living aboard, regions, how they behave. Cited.
5. **Polish & delighters all around** until world-class.

## Honesty rule (unchanged)

Never fabricate a measured safety number or a quote. Real-world accounts must be cited to a
real, locatable source with a confidence. "Not found / not published" stays a valid state.

## Architecture facts (grounded)

- Vite + React 18 + TS. Router v7. d3-scale/d3-shape already deps.
- Boats from Supabase (42) → fallback `data/boats.json`. Research lazy-loaded from
  `research/data/<id>.json`; light index `src/data/research-index.json`.
- `BoatDossier` renders the full `BoatResearch`. `CompareModal` is a static table with
  diff-only + winner highlight (≤4 boats, `compareSet` in `App`). `BudgetPage` = 6 tools,
  localStorage key `sailbudget1`, `pickBoat()` already seeds price/refit/speed/berth.
- Existing localStorage keys: `sailfav19` (favs), `sailbudget1` (budget).

## Workstreams

### WS-1 — Local notes & comments (browser DB)

- `src/lib/notes.ts`: tiny IndexedDB wrapper (db `sailnotes`, store `notes`), async API:
  `getNote(id)`, `setNote(id, text)`, `allNotes()`, `deleteNote(id)`, plus a React
  `useNote(id)` hook and a `useNoteIds()` subscription. No deps. Debounced writes.
- `src/components/NotesField.tsx`: reusable textarea w/ saved-state + char count.
- Integrate: a "My notes" block in `BoatDossier` (Ownership tab) + a note indicator (✎) on
  `BoatCard` and `BoatTable`. Notes are personal, local, never networked.
- Notes also exportable (with budget plan + as a "My notebook" JSON).

### WS-2 — Comparison engine v2

- Radar/spider chart (d3-shape `lineRadial`) over normalised mission dims + key ratios,
  one coloured polygon per boat, legend = boat names.
- Grouped, collapsible metric sections (Identity, Dimensions, Seaworthiness, Range, Mission,
  Researched). Sticky header row + sticky first column.
- Per-row heat: colour-scale the winner→loser gradient (not just a single ◆).
- Remove-a-boat chips inside the modal; "Add note" link per boat → opens its notes.
- Export comparison: copy-as-Markdown + print. Keep diff-only toggle.

### WS-3 — Budget planner v2

- **Export/Import**: download plan as JSON; import a JSON; "copy summary" (Markdown);
  keep print/PDF. Versioned payload `{v:1, ...}`.
- **Two-boat plan compare**: pick Boat A + Boat B → compute both seeded plans → side-by-side
  headline deltas (all-in, finance, refit, TCO/yr, per-mile). Separate `comparePlans()` pure
  fn so totals math is shared with the single-plan view (refactor totals into a `compute()`
  returning a typed result).
- A short freeform **plan note** (stored with the plan).

### WS-4 — Field reports (real-world accounts) — BACKGROUND AGENTS

- New `scores.field_reports: FieldReport[]` on each researched boat:
  `{title, theme, region, account, conditions, source:{title,url}, confidence}`.
  themes: weather | liveaboard | passage | region | handling | maintenance | community.
- Agents (background) gather CITED accounts: Boreal (deep), Garcia (deep), Amel 54/55/60,
  Moody 54/47. Write `/tmp/field-<group>.json`. I validate + merge into the JSON, regen index.
- Render: new dossier section "From the logbook — real-world accounts", grouped by theme,
  each with source link + confidence dot. Honest empty state otherwise.

### WS-5 — Polish & delighters

- Replace `alert()` with a toast system; scroll-to-top FAB; route-change scroll reset;
  skeleton loaders for fleet + dossier; richer hover/active micro-interactions; focus-visible
  rings; `prefers-reduced-motion` guard; OG/twitter meta + theme-color; favicon check;
  keyboard: `/` focuses search, `c` opens compare; count-up on hero stats; polished empty
  states; sticky compare bar animation. Audit spacing/typography across breakpoints.

## Verification

- `tsc -b --noEmit` + `npm run build` clean.
- Headless (Playwright, system Chrome, vite preview): notes persist across reloads; compare
  radar renders; budget export downloads + two-boat compare computes; field reports render
  with sources; zero console errors; mobile + desktop.
- Self-talk gate stays green on any research edits.

## Sequence

Launch WS-4 agents (bg) → build WS-1 → WS-2 → WS-3 → WS-5 → integrate WS-4 → verify → 3–4
conventional commits → push (deploy). User pre-authorised commit+push for the autonomous run.
