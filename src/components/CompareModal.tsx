import { useEffect, useState, type ReactNode } from "react";
import type { ScoredBoat } from "../types/boat";
import { DIMS, comfort, csf, usd, waterDays } from "../lib/metrics";
import { budgeLabel, headline } from "../lib/format";
import { Dots } from "../lib/svg";
import { researchOf } from "../lib/research";
import type { ResearchIndexEntry } from "../types/research";

const ri = (b: ScoredBoat): ResearchIndexEntry | undefined => researchOf(b.id);
// A researched 0–100 score is only honest above the confidence floor (0.3).
const shownScore = (v: number, conf: number): string =>
  conf >= 0.3 ? String(v) : "—";

interface Props {
  boats: ScoredBoat[];
  onClose: () => void;
  onClear: () => void;
}

/** One comparison row. `num`/`better` drive the per-row "winner" highlight; the
 *  rendered `text` doubles as the equality key for the show-differences filter. */
interface Row {
  label: string;
  cell: (b: ScoredBoat) => ReactNode;
  text: (b: ScoredBoat) => string;
  num?: (b: ScoredBoat) => number;
  better?: "high" | "low";
}

export default function CompareModal({ boats: list, onClose, onClear }: Props) {
  const [diffOnly, setDiffOnly] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const rows: Row[] = [
    {
      label: "Selection score",
      cell: (b) => b.selection + "/100",
      text: (b) => String(b.selection),
      num: (b) => b.selection,
      better: "high",
    },
    {
      label: "Mission fit",
      cell: (b) => b.missionFit + "/100",
      text: (b) => String(b.missionFit),
      num: (b) => b.missionFit,
      better: "high",
    },
    { label: "Type", cell: (b) => b.category, text: (b) => b.category },
    {
      label: "Price (USD)",
      cell: (b) => b.priceText,
      text: (b) => b.priceText,
      num: (b) => b.priceMinUSD,
      better: "low",
    },
    {
      label: "Budget",
      cell: (b) => budgeLabel(b.budget),
      text: (b) => b.budget,
    },
    { label: "Hull", cell: (b) => b.material, text: (b) => b.material },
    {
      label: "Cockpit",
      cell: (b) => b.cockpitType,
      text: (b) => b.cockpitType,
    },
    {
      label: "LOA",
      cell: (b) => headline(b.loa),
      text: (b) => headline(b.loa),
    },
    {
      label: "Beam",
      cell: (b) => headline(b.beam),
      text: (b) => headline(b.beam),
    },
    {
      label: "Draft",
      cell: (b) =>
        headline(b.draftMin) +
        (b.draftMax !== b.draftMin ? "–" + headline(b.draftMax) : ""),
      text: (b) => b.draftMin,
      num: (b) => b.draftMinN,
      better: "low",
    },
    {
      label: "Displacement",
      cell: (b) => b.displacement,
      text: (b) => b.displacement,
    },
    {
      label: "Ballast ratio",
      cell: (b) => b.ballastRatio,
      text: (b) => b.ballastRatio,
    },
    {
      label: "Comfort ratio",
      cell: (b) => "~" + Math.round(comfort(b)),
      text: (b) => String(Math.round(comfort(b))),
      num: (b) => comfort(b),
      better: "high",
    },
    {
      label: "Capsize screen",
      cell: (b) => "~" + csf(b).toFixed(2),
      text: (b) => csf(b).toFixed(2),
      num: (b) => csf(b),
      better: "low",
    },
    {
      label: "Engine / drive",
      cell: (b) => b.engine + " · " + b.drive,
      text: (b) => b.engine + b.drive,
    },
    {
      label: "Fuel",
      cell: (b) => b.fuel.split(" / ")[0],
      text: (b) => b.fuel.split(" / ")[0],
    },
    {
      label: "Water autonomy",
      cell: (b) => "~" + waterDays(b) + " days",
      text: (b) => String(waterDays(b)),
      num: (b) => waterDays(b),
      better: "high",
    },
    {
      label: "Motoring range (est.)",
      cell: (b) => "~" + b.rangeNm + " nm",
      text: (b) => String(b.rangeNm),
      num: (b) => b.rangeNm,
      better: "high",
    },
    { label: "Cabins", cell: (b) => b.cabins, text: (b) => b.cabins },
    ...DIMS.map(
      ([k, , short]): Row => ({
        label: short,
        cell: (b) => <Dots n={b.scores[k]} />,
        text: (b) => String(b.scores[k]),
        num: (b) => b.scores[k],
        better: "high",
      }),
    ),
    // ── Deep-research layer (only the top 15 carry it; "—" elsewhere) ──────────
    {
      label: "❄️ Cold (researched)",
      cell: (b) => {
        const e = ri(b);
        return e ? shownScore(e.cold, e.coldConf) : "—";
      },
      text: (b) => {
        const e = ri(b);
        return e ? shownScore(e.cold, e.coldConf) : "—";
      },
      num: (b) => {
        const e = ri(b);
        return e && e.coldConf >= 0.3 ? e.cold : -1;
      },
      better: "high",
    },
    {
      label: "🌴 Tropics (researched)",
      cell: (b) => {
        const e = ri(b);
        return e ? shownScore(e.tropic, e.tropicConf) : "—";
      },
      text: (b) => {
        const e = ri(b);
        return e ? shownScore(e.tropic, e.tropicConf) : "—";
      },
      num: (b) => {
        const e = ri(b);
        return e && e.tropicConf >= 0.3 ? e.tropic : -1;
      },
      better: "high",
    },
    {
      label: "⚖️ Stability (researched)",
      cell: (b) => {
        const e = ri(b);
        return e ? shownScore(e.stability, e.stabilityConf) : "—";
      },
      text: (b) => {
        const e = ri(b);
        return e ? shownScore(e.stability, e.stabilityConf) : "—";
      },
      num: (b) => {
        const e = ri(b);
        return e && e.stabilityConf >= 0.3 ? e.stability : -1;
      },
      better: "high",
    },
    {
      label: "🛠️ Refit estimate",
      cell: (b) => {
        const e = ri(b);
        return e && e.refitLow ? usd(e.refitLow) + "–" + usd(e.refitHigh) : "—";
      },
      text: (b) => {
        const e = ri(b);
        return e && e.refitLow ? usd(e.refitLow) + "–" + usd(e.refitHigh) : "—";
      },
      num: (b) => {
        const e = ri(b);
        return e && e.refitLow ? e.refitLow : Number.MAX_SAFE_INTEGER;
      },
      better: "low",
    },
    {
      label: "CE design category",
      cell: (b) => ri(b)?.ceCategory ?? "—",
      text: (b) => ri(b)?.ceCategory ?? "—",
    },
    {
      label: "AVS (if published)",
      cell: (b) => {
        const a = ri(b)?.avs;
        return a ? a + "°" : "—";
      },
      text: (b) => {
        const a = ri(b)?.avs;
        return a ? String(a) : "—";
      },
      num: (b) => ri(b)?.avs ?? -1,
      better: "high",
    },
  ];

  const allSame = (r: Row) => {
    const t = list.map(r.text);
    return t.every((x) => x === t[0]);
  };
  const winners = (r: Row): Set<number> => {
    const out = new Set<number>();
    if (!r.num || !r.better || allSame(r)) return out;
    const vals = list.map(r.num);
    const best = r.better === "high" ? Math.max(...vals) : Math.min(...vals);
    vals.forEach((v, i) => v === best && out.add(i));
    return out;
  };

  const visible = diffOnly ? rows.filter((r) => !allSame(r)) : rows;
  const hidden = rows.length - visible.length;

  return (
    <div
      className="overlay open"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div
          className="mhead"
          style={{
            background: "linear-gradient(135deg,var(--ink),var(--ink-2))",
            borderTop: "3px solid var(--brass)",
          }}
        >
          <button className="close" onClick={onClose} aria-label="Close">
            ×
          </button>
          <h2>⚖️ Decision board</h2>
          <div className="mb">
            {list.length} boats · <b>◆</b> marks the strongest on each measure
          </div>
        </div>
        <div className="mbody">
          <div className="cmpopts">
            <label>
              <input
                type="checkbox"
                checked={diffOnly}
                onChange={(e) => setDiffOnly(e.target.checked)}
              />
              Show only where they differ
            </label>
            {diffOnly && hidden > 0 && (
              <span style={{ color: "var(--muted)" }}>
                {hidden} identical row{hidden > 1 ? "s" : ""} hidden
              </span>
            )}
          </div>
          <div className="cmptable">
            <table>
              <thead>
                <tr>
                  <th>Attribute</th>
                  {list.map((b) => (
                    <th key={b.id}>{b.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const win = winners(r);
                  return (
                    <tr key={r.label}>
                      <td className="h">{r.label}</td>
                      {list.map((b, i) => (
                        <td key={b.id} className={win.has(i) ? "win" : ""}>
                          {r.cell(b)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr>
                  <td className="h">Best for</td>
                  {list.map((b) => (
                    <td key={b.id} style={{ fontStyle: "italic" }}>
                      {b.bestFor}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 14 }}>
            <button className="btn ghost" onClick={onClear}>
              Clear comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
