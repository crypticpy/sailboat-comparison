// Inline SVG building blocks, ported from the legacy ringSVG / radarSVG / boatSVG.
import type { MissionScores } from "../types/boat";
import { DIMS } from "./metrics";

/** Circular gauge showing a 0–100 score. */
export function Ring({ pct, color }: { pct: number; color: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);
  return (
    <svg width="58" height="58" viewBox="0 0 58 58">
      <circle
        cx="29"
        cy="29"
        r={r}
        fill="none"
        stroke="#eef3f7"
        strokeWidth="6"
      />
      <circle
        cx="29"
        cy="29"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform="rotate(-90 29 29)"
      />
      <text
        x="29"
        y="33"
        textAnchor="middle"
        fontSize="15"
        fontWeight="700"
        fill="#0d2238"
      >
        {pct}
      </text>
    </svg>
  );
}

/** Nine-axis radar of the mission scores. */
export function Radar({
  scores,
  color,
}: {
  scores: MissionScores;
  color: string;
}) {
  const cx = 118;
  const cy = 122;
  const R = 82;
  const rings: React.ReactNode[] = [];
  const axes: React.ReactNode[] = [];
  const labs: React.ReactNode[] = [];
  let pts = "";

  for (let g = 1; g <= 5; g++) {
    const rr = (R * g) / 5;
    let p = "";
    for (let i = 0; i < 9; i++) {
      const a = ((-90 + i * 40) * Math.PI) / 180;
      p +=
        (i ? " " : "") +
        (cx + Math.cos(a) * rr).toFixed(1) +
        "," +
        (cy + Math.sin(a) * rr).toFixed(1);
    }
    rings.push(
      <polygon
        key={`ring${g}`}
        points={p}
        fill="none"
        stroke="#e6ecf2"
        strokeWidth="1"
      />,
    );
  }
  for (let i = 0; i < 9; i++) {
    const a = ((-90 + i * 40) * Math.PI) / 180;
    const ex = cx + Math.cos(a) * R;
    const ey = cy + Math.sin(a) * R;
    axes.push(
      <line
        key={`axis${i}`}
        x1={cx}
        y1={cy}
        x2={ex.toFixed(1)}
        y2={ey.toFixed(1)}
        stroke="#dde4ec"
        strokeWidth="1"
      />,
    );
    const v = scores[DIMS[i][0]] / 5;
    const px = cx + Math.cos(a) * R * v;
    const py = cy + Math.sin(a) * R * v;
    pts += (i ? " " : "") + px.toFixed(1) + "," + py.toFixed(1);
    const lx = cx + Math.cos(a) * (R + 13);
    const ly = cy + Math.sin(a) * (R + 13);
    const anc =
      Math.abs(Math.cos(a)) < 0.3
        ? "middle"
        : Math.cos(a) > 0
          ? "start"
          : "end";
    labs.push(
      <text
        key={`lab${i}`}
        x={lx.toFixed(1)}
        y={(ly + 3).toFixed(1)}
        fontSize="9"
        fill="#5b6b7b"
        textAnchor={anc}
      >
        {DIMS[i][2]}
      </text>,
    );
  }
  return (
    <svg width="236" height="244" viewBox="0 0 236 244">
      {rings}
      {axes}
      <polygon
        points={pts}
        fill={`${color}33`}
        stroke={color}
        strokeWidth="2"
      />
      {labs}
    </svg>
  );
}

/** Faint decorative sailboat in the card header. */
export function BoatDeco() {
  return (
    <svg
      style={{ position: "absolute", right: 14, bottom: 8, opacity: 0.22 }}
      width="80"
      height="60"
      viewBox="0 0 86 66"
    >
      <path d="M6 50 h70 l-10 12 h-50 z" fill="#fff" />
      <path d="M44 6 l0 40 -26 0 z" fill="#fff" />
      <path d="M48 12 l18 34 -18 0 z" fill="#fff" />
    </svg>
  );
}

/** Filled/empty dot rating out of 5 (used in table + compare grids). */
export function Dots({ n }: { n: number }) {
  const filled = Math.round(n);
  return (
    <>
      {"●".repeat(filled)}
      <span style={{ color: "#cfd9e2" }}>{"●".repeat(5 - filled)}</span>
    </>
  );
}
