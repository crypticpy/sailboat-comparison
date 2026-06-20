// The Boat record is the single source of truth for a boat's shape — it mirrors
// the legacy camelCase data so the ported rendering logic stays unchanged, and it
// doubles as the validation contract for data/boats.json and the Supabase rows.
//
// Derived values (mission fit, pillar scores, selection, motoring range) are NOT
// stored here — they are computed at runtime in src/lib/metrics.ts.

export type BudgetTier = "fit" | "tight" | "over";

/** The nine mission dimensions, scored 0–5. */
export interface MissionScores {
  protection: number;
  handling: number;
  dogs: number;
  workshop: number;
  storage: number;
  tankage: number;
  highlat: number;
  tropical: number;
  budget: number;
}

export interface Link {
  name: string;
  url: string;
}

export interface VideoLink extends Link {
  note: string;
}

export interface Endorsement {
  who: string;
  note: string;
  url?: string;
}

/** Ownership & support layer (the legacy OWN map). */
export interface Ownership {
  mastStep: string;
  keelRudder: string;
  complexity: string;
  maintain: string;
  partsText: string;
  problems: string;
  sentiment: string;
  communities: Link[];
  risks: string[];
  scores: {
    maintain: number;
    simplicity: number;
    parts: number;
    community: number;
  };
}

export interface Boat {
  // Identity & classification
  id: string;
  name: string;
  builder: string;
  designer: string;
  color: string;
  years: string;
  material: string;
  category: string;
  cockpitType: string;

  // Display-string specs
  loa: string;
  lwl: string;
  beam: string;
  draftMin: string;
  draftMax: string;
  displacement: string;
  ballast: string;
  ballastRatio: string;
  sailArea: string;
  airDraft: string;
  engine: string;
  drive: string;
  cabins: string;
  keel: string;
  cockpit: string;
  fuel: string;
  water: string;

  // Numeric (filter / sort / compute)
  loaN: number;
  lwlFt: number;
  beamFt: number;
  dispLb: number;
  draftMinN: number;
  sad: number | string;
  dl: number | string;
  fuelN: number;
  waterN: number;
  engineHp: number;
  priceMinUSD: number;
  priceMaxUSD: number;
  budget: BudgetTier;
  budgetN: number;

  // Narrative
  bestFor: string;
  protectionText: string;
  rig: string;
  handlingText: string;
  engineWorkshop: string;
  systems: string;
  storageText: string;
  rangeText: string;
  accommodation: string;
  highLatText: string;
  tropicalText: string;
  priceText: string;
  priceNew: string;
  priceUsed: string;
  budgetText: string;
  notable: string;

  // Collections / nested
  scores: MissionScores;
  tags: string[];
  fun: string[];
  priceExamples: string[];
  sources: Link[];
  youtube: VideoLink[];
  pros: string[];
  cons: string[];
  awards: string[];
  endorsements: Endorsement[];
  badge: string;
  own: Ownership;
}

/** A boat with runtime-derived fields attached (see metrics.ts). */
export interface ScoredBoat extends Boat {
  missionFit: number;
  pillars: { mission: number; sea: number; own: number; value: number };
  selection: number;
  rangeNm: number;
}
