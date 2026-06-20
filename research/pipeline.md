# Research pipeline — how to run it & extend it

The boat-research pipeline is a **versioned, re-runnable workflow** so adding boats or
deepening coverage is a one-liner. It turns web research into a cited, confidence-scored,
rubric-scored dataset — with an adversarial citation gate so nothing fabricated survives.

- **Script:** [`research/research-workflow.js`](./research-workflow.js) (the runnable pipeline + embedded prompts + the 34-boat catalog)
- **Contract & rubrics:** [`research/RUBRICS.md`](./RUBRICS.md) (the JSON contract + how every score is computed). The `RUBRICS` string in the script must stay in sync with this file.

## Scope

Deep research targets the **top 15 boats by selection score** (default weights; computed from
`data/boats.json` via `src/lib/metrics.ts`). The rest of the fleet keeps its current
published-spec data until we choose to expand (just pass more ids — see below).

Top 15, in rank order:

| #   | id         | boat                     | #   | id            | boat                  |
| --- | ---------- | ------------------------ | --- | ------------- | --------------------- |
| 1   | `tayana58` | Tayana 58 Deck Salon     | 9   | `bestevaer49` | Bestevaer 49ST        |
| 2   | `ip485`    | Island Packet 485        | 10  | `najad460`    | Najad 460             |
| 3   | `hr44`     | Hallberg-Rassy 44        | 11  | `outbound`    | Outbound 46           |
| 4   | `hr43`     | Hallberg-Rassy 43 Mk III | 12  | `hylas48`     | Hylas 48 (H48)        |
| 5   | `hylas54`  | Hylas 54                 | 13  | `amel54`      | Amel 54               |
| 6   | `boreal`   | Boréal 47.2              | 14  | `garcia`      | Garcia Exploration 45 |
| 7   | `ovni450`  | Ovni 450                 | 15  | `outbound52`  | Outbound 52           |
| 8   | `tayana48` | Tayana 48 Deck Salon     |     |               |                       |

Re-run `node` over `metrics.ts`'s `scoreBoat` if weights change — the cut line can move.

## Models (token policy)

Per-stage tiers, overridable via `args.models`:
| Stage | Default | Why |
|-------|---------|-----|
| Research (web gather) | **haiku** | cheap, high-volume crawling/synthesis |
| Verify (citation gate) | **sonnet** | the trust gate — must reliably catch uncited/implausible claims |
| Score (apply rubrics) | **sonnet** | rubric math + refit/cost reasoning |
Bump a stage to `opus` only if a quality pass shows the cheaper tier is too thin.

## Run it

```
// research the full top 15:
Workflow({ scriptPath: "research/research-workflow.js",
           args: { ids: ["tayana58","ip485","hr44","hr43","hylas54","boreal","ovni450",
                         "tayana48","bestevaer49","najad460","outbound","hylas48",
                         "amel54","garcia","outbound52"] } })

// research brand-new boats not yet in the catalog:
Workflow({ scriptPath: "research/research-workflow.js",
           args: { boats: [ { id, name, builder, years, category, price } ] } })

// cheaper/cleaner run, override models:
Workflow({ scriptPath: "research/research-workflow.js",
           args: { ids: [...], models: { research: "haiku", verify: "sonnet", score: "haiku" } } })
```

It returns `{ count, models, tokens_spent_k, boats:[{id,name,verified:{cleaned_facts,scores,refit_projection,…}}] }`.
Persist that output to `research/data/<id>.json`, then it flows into the schema-seed step.

## Add a new boat to the fleet

1. Add the boat to `data/boats.json` (the base published-spec record) and seed Supabase.
2. Add its `{id,name,builder,years,category,price}` to `CATALOG` in `research-workflow.js`
   (or just pass it via `args.boats`).
3. Run the pipeline for that id; persist + seed the researched layer.

## Extend / deepen research

- **More fact keys:** add to `FACT_KEYS` (script) and the fact-key list in `RUBRICS.md`.
- **New scored dimension:** add a rubric block in `RUBRICS.md`, mirror it in the script's
  `RUBRICS` string, and add the field to `SCORE_SCHEMA`.
- **Re-verify only:** re-run with the same ids; the verify stage re-checks citations.

## Trust discipline (non-negotiable)

Every datum carries `confidence` + `sources[]`. No source ⇒ it's a gap, not a fact. The
verify stage demotes uncited/implausible claims and flags likely fabrication. Storm verdicts
are authored only from cited heavy-weather reports, else "insufficient sourced data."
Cost figures are labelled "our estimate" with stated age assumptions.
