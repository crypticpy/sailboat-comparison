// Types for the bespoke research layer (research/data/<id>.json), produced by the
// versioned pipeline research/research-workflow.js. Every researched datum carries a
// confidence (0–1) and its sources; the UI must present scores WITH their confidence
// and treat confidence < 0.3 as "insufficient data" rather than a headline number.

export interface Source {
  title: string;
  url: string;
  quote?: string;
}

/** A single cited fact gathered (and, post-verify, retained) for a boat. */
export interface Fact {
  key: string;
  value: string;
  confidence: number;
  sources: Source[];
}

/** A rubric-derived score: the number, how sure we are, and why. */
export interface Scored {
  value: number;
  confidence: number;
  rationale: string;
  basis?: string;
}

export interface StormVerdict {
  text: string;
  confidence: number;
  /** true only when backed by a real, cited heavy-weather account. */
  cited: boolean;
}

export interface RefitLine {
  system: string;
  low: number;
  high: number;
  note: string;
}

export interface RefitProjection {
  total_low_usd: number;
  total_high_usd: number;
  assumptions: string;
  by_item: RefitLine[];
}

export interface ProvisioningItem {
  item: string;
  category: string;
  why: string;
}

export interface Sentiment {
  praise: string[];
  complaints: string[];
  known_issues: string[];
  forums: Source[];
}

export interface ResearchFacts {
  id: string;
  overall_confidence: number;
  facts: Fact[];
  sentiment: Sentiment;
  refit_items: unknown[];
  provisioning_specific: ProvisioningItem[];
  gaps: string[];
}

export interface VerifyRecord {
  id: string;
  cleaned_facts: Fact[];
  removed: { key: string; reason: string }[];
  fabrication_flags: string[];
  verified_confidence: number;
  verdict: string;
}

export interface BoatScores {
  id: string;
  cold_score: Scored;
  tropic_score: Scored;
  stability_score: Scored;
  storm_verdict: StormVerdict;
  refit_projection: RefitProjection;
  provisioning_specific: ProvisioningItem[];
}

/** The full per-boat research record (lazy-loaded on demand). */
export interface BoatResearch {
  id: string;
  name: string;
  _provenance?: string;
  _models?: Record<string, string>;
  research: ResearchFacts;
  verify: VerifyRecord;
  scores: BoatScores;
}

/** The lightweight, grid-ready slice bundled for every researched boat. */
export interface ResearchIndexEntry {
  id: string;
  name: string;
  cold: number;
  coldConf: number;
  tropic: number;
  tropicConf: number;
  stability: number;
  stabilityConf: number;
  stabilityBasis?: string;
  stormCited: boolean;
  refitLow: number;
  refitHigh: number;
  ceCategory: string | null;
  hasHeating: boolean | null;
  avs: number | null;
  factCount: number;
  removedCount: number;
  flagCount: number;
  overallConfidence: number;
}
