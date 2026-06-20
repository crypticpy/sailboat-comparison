// Inline visual building blocks for the Binnacle design language: the brass
// score gauge, the median-ticked tier bars (which retire the old radar), the
// provenance marker, and the dot rating. Nothing here fetches or mutates data.
import type { MissionScores } from "../types/boat";
import {
  DIMS,
  selectionTier,
  type DimKey,
  type Provenance,
  PROVENANCE_LABEL,
} from "./metrics";

/**
 * The score reborn as a ship's binnacle gauge: an ink bezel with tick marks, a
 * brass value arc that sweeps when the weighting changes, a Fraunces tabular
 * numeral, and an always-on tier WORD (so the reading never relies on colour).
 */
export function Ring({ pct }: { pct: number }) {
  const r = 27;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  const tier = selectionTier(pct);
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const a = (i * 15 * Math.PI) / 180;
    const long = i % 6 === 0;
    const r1 = long ? 30.5 : 31.5;
    return (
      <line
        key={i}
        x1={(36 + Math.cos(a) * r1).toFixed(1)}
        y1={(36 + Math.sin(a) * r1).toFixed(1)}
        x2={(36 + Math.cos(a) * 33.5).toFixed(1)}
        y2={(36 + Math.sin(a) * 33.5).toFixed(1)}
        stroke="#0B2030"
        strokeOpacity={long ? 0.45 : 0.2}
        strokeWidth={long ? 1.4 : 0.9}
      />
    );
  });
  return (
    <svg
      className="binnacle"
      width="72"
      height="72"
      viewBox="0 0 72 72"
      role="img"
      aria-label={`Selection score ${pct} of 100 — ${tier.word}`}
    >
      <defs>
        <linearGradient id="brassArc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9A6F2C" />
          <stop offset="0.5" stopColor="#D6A94B" />
          <stop offset="1" stopColor="#B8893B" />
        </linearGradient>
      </defs>
      {ticks}
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="#EADFC6"
        strokeWidth="5.5"
      />
      <circle
        className="binnacle-arc"
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="url(#brassArc)"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeDasharray={c.toFixed(1)}
        strokeDashoffset={off.toFixed(1)}
        transform="rotate(-90 36 36)"
      />
      <text className="binnacle-num" x="36" y="43" textAnchor="middle">
        {pct}
      </text>
    </svg>
  );
}

/**
 * The nine mission dimensions as labelled horizontal tier bars, each carrying a
 * fleet-median tick so a reading is instantly relative ("strong on Cold, weak on
 * Tropics"). Plain HTML for screen-reader and small-screen legibility — this
 * replaces the faint, unlabelled radar.
 */
export function TierBars({
  scores,
  medians,
  color,
}: {
  scores: MissionScores;
  medians: Record<DimKey, number>;
  color: string;
}) {
  return (
    <div
      className="tiers"
      role="list"
      aria-label="Mission dimension ratings out of 5"
    >
      {DIMS.map(([k, full, short]) => {
        const v = scores[k];
        const med = medians[k] ?? 0;
        return (
          <div
            className="tier"
            role="listitem"
            key={k}
            title={`${full}: ${v} of 5`}
          >
            <span className="tier-l">{short}</span>
            <span className="tier-track">
              <span
                className="tier-fill"
                style={{ width: `${(v / 5) * 100}%`, background: color }}
              />
              <span
                className="tier-med"
                style={{ left: `${(med / 5) * 100}%` }}
                aria-hidden="true"
                title={`fleet median ${med}`}
              />
            </span>
            <span className="tier-v">{v}</span>
          </div>
        );
      })}
      <div className="tier-key">
        <span className="tier-med-key" aria-hidden="true" /> fleet median ·
        scored 0–5
      </div>
    </div>
  );
}

/** Small provenance marker — makes "honesty is the aesthetic" literal. */
export function Prov({ kind }: { kind: Provenance }) {
  return (
    <span
      className={`prov prov-${kind}`}
      title={PROVENANCE_LABEL[kind]}
      aria-label={PROVENANCE_LABEL[kind]}
      role="img"
    />
  );
}

/** Filled/empty dot rating out of 5 (table + compare grids). */
export function Dots({ n }: { n: number }) {
  const filled = Math.round(n);
  return (
    <span
      className="dots"
      role="img"
      aria-label={`${filled} of 5`}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {"●".repeat(filled)}
      <span style={{ color: "#cdd5d0" }}>{"●".repeat(5 - filled)}</span>
    </span>
  );
}
