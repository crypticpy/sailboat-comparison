// Naval-architecture metrics and the scoring pipeline, ported verbatim from the
// legacy single-file site so numbers are identical. Nothing here touches the DOM.
import type { Boat, MissionScores, ScoredBoat } from "../types/boat";

// ── Mission dimensions & default weights ────────────────────────────────────
export type DimKey = keyof MissionScores;

export const DIMS: [DimKey, string, string][] = [
  ["protection", "Cockpit protection", "Cockpit"],
  ["handling", "Short-handed ease", "Handling"],
  ["dogs", "Dog-friendliness", "Dogs"],
  ["workshop", "Workshop & engine access", "Workshop"],
  ["storage", "Storage", "Storage"],
  ["tankage", "Tankage & range", "Range"],
  ["highlat", "High-latitude capability", "Cold"],
  ["tropical", "Tropical comfort", "Tropics"],
  ["budget", "Budget fit (<$1M)", "Budget"],
];

export type Weights = Record<DimKey, number>;

export const BASE_WEIGHTS: Weights = {
  protection: 1.5,
  handling: 1.5,
  dogs: 1,
  workshop: 1,
  storage: 1,
  tankage: 1,
  highlat: 1.25,
  tropical: 0.75,
  budget: 1,
};

// Four DISTINCT category hues so the grid is scannable by boat type at a glance
// (the legacy four were near-identical blue-grays). Tuned to read clearly on the
// warm-paper surface while staying nautical, not candy.
export const CAT_COLOR: Record<string, string> = {
  "Aluminium expedition": "#5B8AA6", // weathered steel-blue
  "Centre-cockpit cruiser": "#1F6F73", // deep teal
  "Deck-saloon & pilothouse": "#B07D2E", // brass/amber
  "Aft-cockpit bluewater": "#5A6B7A", // slate
};

/** Category hue for a boat, falling back to brass for any unmapped type. */
export const catColor = (b: { category: string }): string =>
  CAT_COLOR[b.category] ?? "#B8893B";

// ── Selection pillars & default blend ───────────────────────────────────────
export type PillarKey = "mission" | "sea" | "own" | "value";
export type Pillars = Record<PillarKey, number>;

export const PILLARS: [PillarKey, string, string][] = [
  ["mission", "Mission fit", "#1F6F73"],
  ["sea", "Seaworthiness", "#2E7D5B"],
  ["own", "Ownership", "#A8762E"], // was an alien purple
  ["value", "Value", "#4A6076"],
];

export type PillarWeights = Record<PillarKey, number>;

export const BASE_PILLAR_WEIGHTS: PillarWeights = {
  mission: 1.2,
  sea: 1.0,
  own: 1.0,
  value: 0.6,
};

// ── Rating words / colour classes ───────────────────────────────────────────
export type RateClass = "g" | "y" | "o" | "r" | "n";
export const RATE_WORDS: Record<RateClass, string> = {
  g: "Excellent",
  y: "Good",
  o: "Fair",
  r: "Weak",
  n: "n/a",
};
export const R5_WORDS: Record<Exclude<RateClass, "n">, string> = {
  g: "Strong",
  y: "OK",
  o: "Caution",
  r: "Weak",
};

// ── Pure helpers ────────────────────────────────────────────────────────────
export const loaFt = (b: Boat) => b.loaN * 3.28084;
export const csf = (b: Boat) => b.beamFt / Math.cbrt(b.dispLb / 64);
export const comfort = (b: Boat) =>
  b.dispLb /
  (0.65 * (0.7 * b.lwlFt + 0.3 * loaFt(b)) * Math.pow(b.beamFt, 1.33));
export const hullSpeed = (b: Boat) => 1.34 * Math.sqrt(b.lwlFt);

// ── Computed stability screening index ──────────────────────────────────────
// A true Angle of Vanishing Stability needs the GZ (righting-arm) curve from
// full hydrostatics, which builders rarely publish — so we never invent one.
// What IS calculable from basic hull specs is a *screening* index: a 0–100
// blend of the standard offshore-stability proxies (capsize screening formula,
// ballast ratio, motion comfort, beam-to-waterline). It is an indicator for
// comparison and sea-trial planning, NOT a measured AVS. Higher = stiffer /
// more resistant to capsize. Centreboarders lean on form stability, so a low
// published ballast ratio is not penalised when absent.
const clamp100 = (v: number): number => Math.max(0, Math.min(100, v));
/** Map v across [lo,hi] → [0,100], clamped. */
const lerp100 = (v: number, lo: number, hi: number): number =>
  clamp100(((v - lo) / (hi - lo)) * 100);

export function stabilityIndex(b: Boat): number {
  const csfC = lerp100(2.2 - csf(b), 0, 0.6); // CSF 2.2→0, 1.6→100 (lower better)
  const comfC = lerp100(comfort(b), 18, 42); // sea-kindly motion proxy
  const beamC = lerp100(0.4 - b.beamFt / b.lwlFt, 0, 0.13); // narrower → higher AVS
  const parts: [number, number][] = [
    [csfC, 0.35],
    [comfC, 0.2],
    [beamC, 0.15],
  ];
  const br = parseNum(b.ballastRatio);
  if (br != null) parts.push([lerp100(br, 22, 45), 0.3]); // higher ballast → stiffer
  const w = parts.reduce((s, [, k]) => s + k, 0);
  return Math.round(parts.reduce((s, [c, k]) => s + c * k, 0) / w);
}
/** Rating class for the computed stability index (higher is better). */
export const stabilityRate = (v: number | null): RateClass =>
  tierHigh(v, 68, 54, 42);
/** Plain word for a stability-index value. */
export function stabilityWord(v: number): string {
  return v >= 68
    ? "Stiff / offshore-capable form"
    : v >= 54
      ? "Sound cruising stability"
      : v >= 42
        ? "Moderate — mind the GZ curve"
        : "Tender — verify righting on survey";
}

export function parseNum(s: unknown): number | null {
  const m = String(s).match(/-?[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}

export function shade(hex: string, p: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + p;
  let g = ((n >> 8) & 255) + p;
  let bl = (n & 255) + p;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  bl = Math.max(0, Math.min(255, bl));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
}

export function usd(n: number): string {
  return n >= 1e6
    ? "$" + (n / 1e6).toFixed(2).replace(/0$/, "") + "M"
    : "$" + Math.round(n / 1000) + "k";
}

// Engine-aware motoring range: fuel ÷ (hp × 0.065 L/hr) × 0.82 of hull speed.
export const cruiseKt = (b: Boat) => 0.82 * hullSpeed(b);
export const burnLph = (b: Boat) => b.engineHp * 0.065;
export const rangeNm = (b: Boat) =>
  Math.round(((b.fuelN / burnLph(b)) * cruiseKt(b)) / 10) * 10;

// ── Mission fit (weighted average of the nine dims) ─────────────────────────
export function fit(scores: MissionScores, weights: Weights): number {
  let t = 0;
  let w = 0;
  for (const k in weights) {
    t += scores[k as DimKey] * weights[k as DimKey];
    w += weights[k as DimKey];
  }
  return w ? Math.round((t / w / 5) * 100) : 0;
}

// ── Colour tiers ────────────────────────────────────────────────────────────
function tierHigh(
  v: number | null,
  a: number,
  b: number,
  c: number,
): RateClass {
  if (v == null) return "n";
  return v >= a ? "g" : v >= b ? "y" : v >= c ? "o" : "r";
}
function tierLow(v: number | null, a: number, b: number, c: number): RateClass {
  if (v == null) return "n";
  return v <= a ? "g" : v <= b ? "y" : v <= c ? "o" : "r";
}
function dlRate(v: number | null): RateClass {
  if (v == null) return "n";
  if (v >= 160 && v <= 260) return "g";
  if ((v >= 130 && v < 160) || (v > 260 && v <= 300)) return "y";
  if ((v >= 100 && v < 130) || (v > 300 && v <= 340)) return "o";
  return "r";
}
export function rate5(v: number): Exclude<RateClass, "n"> {
  return v >= 4 ? "g" : v >= 3 ? "y" : v >= 2 ? "o" : "r";
}

// ── Performance / safety scorecard metrics ──────────────────────────────────
export interface Metric {
  key: string;
  label: string;
  hint: string;
  get: (b: ScoredBoat) => number | null;
  fmt: (v: number) => string;
  rate: (v: number | null) => RateClass;
}

export const METRICS: Metric[] = [
  {
    key: "comfort",
    label: "Comfort ratio",
    hint: "motion comfort — higher is gentler",
    get: (b) => comfort(b),
    fmt: (v) => "~" + Math.round(v),
    rate: (v) => tierHigh(v, 35, 28, 22),
  },
  {
    key: "csf",
    label: "Capsize screen",
    hint: "offshore stability — under 2.0 good, lower better",
    get: (b) => csf(b),
    fmt: (v) => "~" + v.toFixed(2),
    rate: (v) => tierLow(v, 1.8, 1.95, 2.05),
  },
  {
    key: "ballast",
    label: "Ballast ratio",
    hint: "stiffness — higher is stiffer (centreboarders use form stability)",
    get: (b) => parseNum(b.ballastRatio),
    fmt: (v) => Math.round(v) + "%",
    rate: (v) => tierHigh(v, 38, 33, 28),
  },
  {
    key: "sad",
    label: "Sail area / disp",
    hint: "light-air power — ~16–21 is ideal cruising",
    get: (b) => parseNum(b.sad),
    fmt: (v) => v.toFixed(1),
    rate: (v) => tierHigh(v, 16.5, 15, 13.5),
  },
  {
    key: "dl",
    label: "Disp / length",
    hint: "hull type — moderate (160–260) is the bluewater sweet spot",
    get: (b) => parseNum(b.dl),
    fmt: (v) => String(Math.round(v)),
    rate: (v) => dlRate(v),
  },
  {
    key: "hull",
    label: "Hull speed",
    hint: "top cruising-speed potential — higher is faster",
    get: (b) => hullSpeed(b),
    fmt: (v) => v.toFixed(1) + " kt",
    rate: (v) => tierHigh(v, 8.6, 8.0, 7.4),
  },
  {
    key: "range",
    label: "Motoring range",
    hint: "computed from fuel + engine size/efficiency at economical cruise",
    get: (b) => b.rangeNm,
    fmt: (v) => "~" + v + " nm",
    rate: (v) => tierHigh(v, 1000, 750, 550),
  },
  {
    key: "water",
    label: "Water capacity",
    hint: "higher = longer between fills",
    get: (b) => b.waterN,
    fmt: (v) => v + " L",
    rate: (v) => tierHigh(v, 650, 500, 420),
  },
  {
    key: "draft",
    label: "Min draft",
    hint: "shoaler = more anchorages, can dry out",
    get: (b) => b.draftMinN,
    fmt: (v) => v.toFixed(2) + " m",
    rate: (v) => tierLow(v, 1.3, 1.8, 2.1),
  },
];

const metricByKey = new Map(METRICS.map((m) => [m.key, m]));

export function mrate(b: ScoredBoat, key: string): RateClass {
  const M = metricByKey.get(key);
  return M ? M.rate(M.get(b)) : "n";
}

/** Colour class + text for an inline spec value (e.g. draft, fuel). */
export function specColor(
  b: ScoredBoat,
  key: string,
  txt: string,
): { cls: RateClass; txt: string } {
  const M = metricByKey.get(key);
  if (!M) return { cls: "n", txt };
  return { cls: M.rate(M.get(b)), txt };
}

function ratePts(c: RateClass): number {
  return { g: 5, y: 4, o: 3, r: 2, n: 3.5 }[c];
}

// ── Pillars & selection ─────────────────────────────────────────────────────
function pillars(b: ScoredBoat, missionFit: number): Pillars {
  const sea =
    ((b.scores.protection +
      b.scores.highlat +
      ratePts(mrate(b, "comfort")) +
      ratePts(mrate(b, "csf"))) /
      4 /
      5) *
    100;
  const own = b.own
    ? ((b.own.scores.maintain +
        b.own.scores.simplicity +
        b.own.scores.parts +
        b.own.scores.community) /
        4 /
        5) *
      100
    : 60;
  let pScore = 5 - ((b.priceMinUSD - 115000) / (1500000 - 115000)) * 4;
  pScore = Math.max(1, Math.min(5, pScore));
  const value = ((b.scores.budget + pScore) / 2 / 5) * 100;
  return {
    mission: missionFit,
    sea: Math.round(sea),
    own: Math.round(own),
    value: Math.round(value),
  };
}

function selection(p: Pillars, pw: PillarWeights): number {
  let t = 0;
  let w = 0;
  for (const k in pw) {
    t += p[k as PillarKey] * pw[k as PillarKey];
    w += pw[k as PillarKey];
  }
  return w ? Math.round(t / w) : 0;
}

/**
 * Attach all runtime-derived fields to a boat for the current weight blends.
 * Pure: returns a new object, never mutates the input.
 */
export function scoreBoat(
  b: Boat,
  weights: Weights,
  pillarWeights: PillarWeights,
): ScoredBoat {
  const missionFit = fit(b.scores, weights);
  const scored = {
    ...b,
    missionFit,
    rangeNm: 0,
    pillars: { mission: 0, sea: 0, own: 0, value: 0 },
    selection: 0,
  } as ScoredBoat;
  scored.rangeNm = rangeNm(b);
  scored.pillars = pillars(scored, missionFit);
  scored.selection = selection(scored.pillars, pillarWeights);
  return scored;
}

// ── Binnacle tier words ─────────────────────────────────────────────────────
// A non-colour-redundant word always sits beside the score (accessibility floor).
export function selectionTier(pct: number): { word: string; cls: RateClass } {
  if (pct >= 80) return { word: "Strong", cls: "g" };
  if (pct >= 66) return { word: "Solid", cls: "y" };
  if (pct >= 52) return { word: "Fair", cls: "o" };
  return { word: "Marginal", cls: "r" };
}

// ── Autonomy-in-days ────────────────────────────────────────────────────────
// Reframes raw litres into the only question a passage-maker asks: how long can
// we stay out? Stated assumption (NOT a published figure): 2 crew @ 4 L/day +
// 2 dogs @ 1.5 L/day ≈ 11 L/day of drinking + cooking water, no watermaker.
export const CREW_WATER_LPD = 2 * 4 + 2 * 1.5; // 11 L/day, 2 crew + 2 dogs
export const waterDays = (b: Boat): number =>
  Math.max(0, Math.round(b.waterN / CREW_WATER_LPD));
export const AUTONOMY_NOTE = "2 crew + 2 dogs, no watermaker (~11 L/day)";

/** Honest loaded displacement (lb) ONLY when the spec string publishes one. */
export function loadedLb(b: Boat): number | null {
  const m = b.displacement.match(
    /([\d,]+)\s*lb\s*loaded|loaded[^)]*?([\d,]+)\s*lb/i,
  );
  if (!m) return null;
  const n = (m[1] || m[2] || "").replace(/,/g, "");
  return n ? parseInt(n, 10) : null;
}

// ── Fleet medians (for the tier-bar reference tick) ─────────────────────────
export function fleetMedians(boats: Boat[]): Record<DimKey, number> {
  const med = {} as Record<DimKey, number>;
  for (const [k] of DIMS) {
    const vals = boats.map((b) => b.scores[k]).sort((a, z) => a - z);
    const n = vals.length;
    med[k] = n
      ? n % 2
        ? vals[(n - 1) / 2]
        : (vals[n / 2 - 1] + vals[n / 2]) / 2
      : 0;
  }
  return med;
}

/** The user's most-weighted mission dims, for the card's "why it fits YOU" chips. */
export function topWeightedDims(
  weights: Weights,
  scores: MissionScores,
  n = 3,
): { key: DimKey; label: string; score: number }[] {
  return [...DIMS]
    .filter(([k]) => weights[k] > 0 && scores[k] >= 4) // only genuine strengths
    .sort(
      (a, z) => weights[z[0]] - weights[a[0]] || scores[z[0]] - scores[a[0]],
    )
    .slice(0, n)
    .map(([k, , short]) => ({ key: k, label: short, score: scores[k] }));
}

// ── Provenance map ──────────────────────────────────────────────────────────
// Makes "honesty is the aesthetic" literal: every surfaced figure is tagged as
// computed-from-physics, a published spec, or an editorial opinion — and the UI
// shows which. "not-published" is a first-class state for data we don't have.
export type Provenance = "computed" | "spec" | "editorial" | "not-published";
export const PROVENANCE_LABEL: Record<Provenance, string> = {
  computed: "Computed from physics (displacement, beam, waterline, fuel)",
  spec: "Published builder/design specification",
  editorial: "Editorial judgement — synthesised from reviews & owner reports",
  "not-published": "Not published — confirm with a surveyor / sea-trial",
};
/** Provenance for a metric/field key. Drives the small provenance marker. */
export function provenanceOf(key: string): Provenance {
  if (/^(comfort|csf|hull|range|autonomy|loaded)$/.test(key)) return "computed";
  if (/^(avs|stix|ce|heater|insulation)$/.test(key)) return "not-published";
  if (DIMS.some(([k]) => k === key)) return "editorial";
  return "spec";
}
