import type { ScoredBoat } from "../types/boat";
import { CAT_COLOR, usd } from "../lib/metrics";

interface Props {
  boats: ScoredBoat[];
  onOpen: (id: string) => void;
}

/** Price (x) vs selection score (y) scatter, ported from renderScatter. */
export default function ScatterPlot({ boats, onOpen }: Props) {
  const W0 = 760,
    H = 320,
    pl = 58,
    pr = 24,
    pt = 20,
    pb = 46,
    xMax = 2000000;
  const X = (v: number) => pl + (v / xMax) * (W0 - pl - pr);
  const Y = (v: number) => {
    const lo = 50,
      hi = 90;
    return (
      H -
      pb -
      ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * (H - pt - pb)
    );
  };

  const grid: React.ReactNode[] = [];
  for (let p = 0; p <= 2000000; p += 500000) {
    grid.push(
      <g key={`gx${p}`}>
        <line x1={X(p)} y1={pt} x2={X(p)} y2={H - pb} stroke="#eef3f7" />
        <text
          x={X(p)}
          y={H - pb + 16}
          fontSize="10"
          fill="#8aa"
          textAnchor="middle"
        >
          ${(p / 1e6).toFixed(1)}M
        </text>
      </g>,
    );
  }
  for (let s = 50; s <= 90; s += 10) {
    grid.push(
      <g key={`gy${s}`}>
        <line x1={pl} y1={Y(s)} x2={W0 - pr} y2={Y(s)} stroke="#eef3f7" />
        <text
          x={pl - 8}
          y={Y(s) + 3}
          fontSize="10"
          fill="#8aa"
          textAnchor="end"
        >
          {s}
        </text>
      </g>,
    );
  }

  return (
    <>
      <div className="scatterwrap">
        <svg viewBox={`0 0 ${W0} ${H}`} width="100%" style={{ minWidth: 680 }}>
          {grid}
          <line
            x1={X(1000000)}
            y1={pt}
            x2={X(1000000)}
            y2={H - pb}
            stroke="#c0492f"
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />
          <text x={X(1000000) + 5} y={pt + 12} fontSize="10" fill="#c0492f">
            $1M budget
          </text>
          <text
            x={W0 / 2}
            y={H - 6}
            fontSize="11"
            fill="#5b6b7b"
            textAnchor="middle"
          >
            Realistic entry price →
          </text>
          <text
            transform={`translate(14,${H / 2}) rotate(-90)`}
            fontSize="11"
            fill="#5b6b7b"
            textAnchor="middle"
          >
            Selection score →
          </text>
          {boats.map((b) => (
            <circle
              key={b.id}
              cx={X(b.priceMinUSD).toFixed(1)}
              cy={Y(b.selection).toFixed(1)}
              r="6.5"
              fill={CAT_COLOR[b.category] || "#477"}
              fillOpacity="0.82"
              stroke="#fff"
              strokeWidth="1.5"
              style={{ cursor: "pointer" }}
              onClick={() => onOpen(b.id)}
            >
              <title>
                {b.name} — selection {b.selection}, from {usd(b.priceMinUSD)}
              </title>
            </circle>
          ))}
        </svg>
      </div>
      <div className="legend">
        {Object.keys(CAT_COLOR).map((k) => (
          <span key={k}>
            <i style={{ background: CAT_COLOR[k] }} />
            {k}
          </span>
        ))}
      </div>
    </>
  );
}
