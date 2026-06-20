// Bespoke SVG chart kit on d3-scale — Binnacle-themed instruments, no chart lib.
// Everything here is honest by construction: confidence rides alongside every score,
// costs are ranges (never false-precision points), and a low-confidence value renders
// as an "insufficient data" state instead of a misleading number.
import { scaleLinear } from "d3-scale";
import type { ReactNode } from "react";
import { confBand, type ConfBand } from "./research";

const BAND_COLOR: Record<ConfBand, string> = {
  solid: "var(--good)",
  limited: "var(--ok)",
  insufficient: "var(--neutral)",
};

const scoreHue = (v: number): string =>
  v >= 75
    ? "var(--good)"
    : v >= 55
      ? "var(--ok)"
      : v >= 40
        ? "#cf7a2a"
        : "var(--warn)";

export const usd = (n: number): string =>
  n >= 1e6
    ? "$" + (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 2).replace(/\.?0+$/, "") + "M"
    : "$" + Math.round(n / 1000) + "k";

/** A small confidence meter: how sure we are, 0–100, banded by colour + label. */
export function ConfMeter({
  confidence,
  showLabel = true,
}: {
  confidence: number;
  showLabel?: boolean;
}) {
  const band = confBand(confidence);
  const pct = Math.round(confidence * 100);
  return (
    <span className="confmeter" title={`Confidence ${pct}%`}>
      <span className="confmeter-track">
        <span
          className="confmeter-fill"
          style={{ width: `${pct}%`, background: BAND_COLOR[band] }}
        />
      </span>
      {showLabel && (
        <span className="confmeter-lab" style={{ color: BAND_COLOR[band] }}>
          {pct}%
        </span>
      )}
    </span>
  );
}

/**
 * A 0–100 research score as a labelled bar, WITH its confidence. Below the
 * confidence floor it shows an honest "insufficient data" state, not the number.
 */
export function ScoreBar({
  label,
  value,
  confidence,
  median,
  note,
}: {
  label: string;
  value: number;
  confidence: number;
  median?: number;
  note?: ReactNode;
}) {
  const band = confBand(confidence);
  const insufficient = band === "insufficient";
  return (
    <div className="scorebar">
      <div className="scorebar-head">
        <span className="scorebar-lab">{label}</span>
        {insufficient ? (
          <span className="scorebar-na">Insufficient data</span>
        ) : (
          <span className="scorebar-val">
            {Math.round(value)}
            <i>/100</i>
          </span>
        )}
      </div>
      <div className={"scorebar-track" + (insufficient ? " na" : "")}>
        {!insufficient && (
          <div
            className="scorebar-fill"
            style={{ width: `${value}%`, background: scoreHue(value) }}
          />
        )}
        {median != null && !insufficient && (
          <div className="scorebar-med" style={{ left: `${median}%` }} />
        )}
      </div>
      <div className="scorebar-foot">
        <ConfMeter confidence={confidence} />
        {note && <span className="scorebar-note">{note}</span>}
      </div>
    </div>
  );
}

/**
 * A set of low–high cost ranges on one shared scale — refit line items, or a
 * compare. Honest about uncertainty: every bar is a range, never a point.
 */
export function RangeBars({
  items,
  width = 520,
  rowH = 30,
  unit = usd,
}: {
  items: { label: string; low: number; high: number; note?: string }[];
  width?: number;
  rowH?: number;
  unit?: (n: number) => string;
}) {
  const labelW = 168;
  const valW = 92;
  const barW = Math.max(120, width - labelW - valW);
  const max = Math.max(1, ...items.map((d) => d.high));
  const x = scaleLinear().domain([0, max]).range([0, barW]).nice();
  const ticks = x.ticks(4);
  const h = items.length * rowH + 26;
  return (
    <svg
      className="rangebars"
      viewBox={`0 0 ${width} ${h}`}
      width="100%"
      role="img"
      aria-label="Cost ranges by system"
    >
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={labelW + x(t)}
            x2={labelW + x(t)}
            y1={16}
            y2={h - 10}
            stroke="var(--line-2)"
            strokeDasharray="2 3"
          />
          <text
            x={labelW + x(t)}
            y={11}
            fontSize="9.5"
            fill="var(--muted)"
            textAnchor="middle"
          >
            {unit(t)}
          </text>
        </g>
      ))}
      {items.map((d, i) => {
        const y = 22 + i * rowH;
        return (
          <g key={d.label}>
            <text
              x={labelW - 10}
              y={y + 11}
              fontSize="11"
              fill="var(--text)"
              textAnchor="end"
            >
              {d.label.length > 26 ? d.label.slice(0, 25) + "…" : d.label}
            </text>
            <rect
              x={labelW + x(d.low)}
              y={y + 3}
              width={Math.max(3, x(d.high) - x(d.low))}
              height={11}
              rx={5}
              fill="url(#brassgrad)"
            />
            <circle
              cx={labelW + x(d.low)}
              cy={y + 8.5}
              r={2.5}
              fill="var(--brass-deep)"
            />
            <circle
              cx={labelW + x(d.high)}
              cy={y + 8.5}
              r={2.5}
              fill="var(--brass-deep)"
            />
            <text
              x={width}
              y={y + 11}
              fontSize="10"
              fill="var(--muted)"
              textAnchor="end"
            >
              {unit(d.low)}–{unit(d.high)}
            </text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="brassgrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="var(--brass-bright)" />
          <stop offset="1" stopColor="var(--brass-deep)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Refit "build-up" — a cumulative ladder from $0 to the all-in range, each system
 * a stacked segment (using its midpoint), with the honest low–high band overlaid.
 */
export function CostWaterfall({
  items,
  totalLow,
  totalHigh,
  width = 560,
}: {
  items: { system: string; low: number; high: number }[];
  totalLow: number;
  totalHigh: number;
  width?: number;
}) {
  const h = 96;
  const padL = 8;
  const padR = 8;
  const barW = width - padL - padR;
  const mids = items.map((d) => (d.low + d.high) / 2);
  const sumMid = mids.reduce((a, b) => a + b, 0) || 1;
  const x = scaleLinear()
    .domain([0, Math.max(totalHigh, sumMid)])
    .range([0, barW]);
  let acc = 0;
  const segs = items.map((d, i) => {
    const mid = mids[i];
    const seg = { x0: acc, x1: acc + mid, system: d.system, mid };
    acc += mid;
    return seg;
  });
  const hue = (i: number) =>
    ["#1F6F73", "#5B8AA6", "#B07D2E", "#5A6B7A", "#2E7D5B", "#9A6F2C"][i % 6];
  return (
    <svg
      className="waterfall"
      viewBox={`0 0 ${width} ${h}`}
      width="100%"
      role="img"
      aria-label="Refit cost build-up by system"
    >
      <text x={padL} y={12} fontSize="10" fill="var(--muted)">
        Buy-today → passage-ready (our estimate)
      </text>
      {segs.map((s, i) => (
        <g key={s.system}>
          <rect
            x={padL + x(s.x0)}
            y={22}
            width={Math.max(1, x(s.x1) - x(s.x0) - 1)}
            height={26}
            fill={hue(i)}
            opacity={0.9}
          >
            <title>{`${s.system}: ${usd(s.mid)} (midpoint)`}</title>
          </rect>
        </g>
      ))}
      {/* honest total range band */}
      <line
        x1={padL + x(totalLow)}
        x2={padL + x(totalLow)}
        y1={18}
        y2={56}
        stroke="var(--ink)"
        strokeWidth={1.5}
      />
      <line
        x1={padL + x(totalHigh)}
        x2={padL + x(totalHigh)}
        y1={18}
        y2={56}
        stroke="var(--ink)"
        strokeWidth={1.5}
      />
      <line
        x1={padL + x(totalLow)}
        x2={padL + x(totalHigh)}
        y1={62}
        y2={62}
        stroke="var(--ink)"
        strokeWidth={2}
      />
      <text
        x={padL + x(totalLow)}
        y={76}
        fontSize="11"
        fill="var(--ink)"
        fontWeight="700"
        textAnchor="middle"
      >
        {usd(totalLow)}
      </text>
      <text
        x={padL + x(totalHigh)}
        y={76}
        fontSize="11"
        fill="var(--ink)"
        fontWeight="700"
        textAnchor="middle"
      >
        {usd(totalHigh)}
      </text>
      <text
        x={padL + (x(totalLow) + x(totalHigh)) / 2}
        y={90}
        fontSize="9.5"
        fill="var(--muted)"
        textAnchor="middle"
      >
        all-in range
      </text>
    </svg>
  );
}

/** Owner sentiment at a glance — praise vs complaints vs flagged issues. */
export function SentimentSplit({
  praise,
  complaints,
  issues,
}: {
  praise: number;
  complaints: number;
  issues: number;
}) {
  const total = Math.max(1, praise + complaints + issues);
  const seg = [
    { n: praise, c: "var(--good)", l: "praise" },
    { n: complaints, c: "var(--ok)", l: "complaints" },
    { n: issues, c: "var(--warn)", l: "known issues" },
  ];
  return (
    <div className="sentsplit">
      <div className="sentsplit-bar">
        {seg.map((s) => (
          <span
            key={s.l}
            style={{ width: `${(s.n / total) * 100}%`, background: s.c }}
            title={`${s.n} ${s.l}`}
          />
        ))}
      </div>
      <div className="sentsplit-key">
        {seg.map((s) => (
          <span key={s.l}>
            <i style={{ background: s.c }} />
            {s.n} {s.l}
          </span>
        ))}
      </div>
    </div>
  );
}
