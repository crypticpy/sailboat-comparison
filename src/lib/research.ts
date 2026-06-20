// Access seam for the bespoke research layer. The light grid index is bundled;
// the heavy per-boat record is lazy-loaded (Vite code-splits each research/data/<id>.json
// into its own chunk, fetched only when a detail/report view opens).
//
// Honesty-first: scores come WITH a confidence. Use scoreDisplay() so the UI can render
// a low-confidence score as "insufficient data" rather than a misleading headline number
// (e.g. a re-normalised cold 100 at confidence 0.14 when only one input survived verify).
import indexData from "../data/research-index.json";
import type { BoatResearch, ResearchIndexEntry } from "../types/research";

export const researchIndex = indexData as unknown as Record<
  string,
  ResearchIndexEntry
>;
export const RESEARCHED_IDS: string[] = Object.keys(researchIndex);
export const hasResearch = (id: string): boolean => id in researchIndex;
export const researchOf = (id: string): ResearchIndexEntry | undefined =>
  researchIndex[id];

// Lazy per-boat detail loaders, keyed by boat id (the filename stem).
const loaders = import.meta.glob("../../research/data/*.json") as Record<
  string,
  () => Promise<{ default: BoatResearch }>
>;
const byId: Record<string, () => Promise<{ default: BoatResearch }>> = {};
for (const path in loaders) {
  const id = path.slice(path.lastIndexOf("/") + 1).replace(/\.json$/, "");
  byId[id] = loaders[path];
}

const cache = new Map<string, Promise<BoatResearch | null>>();
/** Fetch a boat's full research record (memoised). Resolves null if not researched. */
export function loadResearch(id: string): Promise<BoatResearch | null> {
  const loader = byId[id];
  if (!loader) return Promise.resolve(null);
  let p = cache.get(id);
  if (!p) {
    p = loader()
      .then((m) => m.default)
      .catch(() => null);
    cache.set(id, p);
  }
  return p;
}

// ── Confidence-aware display (the honesty contract, made operational) ────────
export type ConfBand = "solid" | "limited" | "insufficient";

/** Map a 0–1 confidence to a display band. <0.3 ⇒ treat as a gap, not a number. */
export function confBand(confidence: number): ConfBand {
  if (confidence < 0.3) return "insufficient";
  if (confidence < 0.6) return "limited";
  return "solid";
}

export const CONF_LABEL: Record<ConfBand, string> = {
  solid: "Well-sourced",
  limited: "Limited data",
  insufficient: "Insufficient data",
};

export interface ScoreDisplay {
  band: ConfBand;
  /** When false, render an "insufficient data" state instead of the number. */
  showNumber: boolean;
  value: number;
  confidence: number;
  /** confidence as 0–100, for a small meter. */
  pct: number;
  label: string;
}

/** Decide how to present a confidence-scored value, honestly. */
export function scoreDisplay(s: {
  value: number;
  confidence: number;
}): ScoreDisplay {
  const band = confBand(s.confidence);
  return {
    band,
    showNumber: band !== "insufficient",
    value: s.value,
    confidence: s.confidence,
    pct: Math.round(s.confidence * 100),
    label: CONF_LABEL[band],
  };
}
