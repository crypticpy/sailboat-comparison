import { useEffect, type ReactNode } from "react";
import type { ScoredBoat } from "../types/boat";
import { DIMS, comfort, csf } from "../lib/metrics";
import { budgeLabel, headline } from "../lib/format";
import { Dots } from "../lib/svg";

interface Props {
  boats: ScoredBoat[];
  onClose: () => void;
  onClear: () => void;
}

export default function CompareModal({ boats: list, onClose, onClear }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const rows: [string, (b: ScoredBoat) => ReactNode][] = [
    ["Mission fit", (b) => b.missionFit + "/100"],
    ["Type", (b) => b.category],
    ["Price (USD)", (b) => b.priceText],
    ["Budget", (b) => budgeLabel(b.budget)],
    ["Hull", (b) => b.material],
    ["Cockpit", (b) => b.cockpitType],
    ["LOA", (b) => headline(b.loa)],
    ["Beam", (b) => headline(b.beam)],
    [
      "Draft",
      (b) =>
        headline(b.draftMin) +
        (b.draftMax !== b.draftMin ? "–" + headline(b.draftMax) : ""),
    ],
    ["Displacement", (b) => b.displacement],
    ["Ballast ratio", (b) => b.ballastRatio],
    ["Comfort ratio", (b) => "~" + Math.round(comfort(b))],
    ["Capsize screen", (b) => "~" + csf(b).toFixed(2)],
    ["Engine / drive", (b) => b.engine + " · " + b.drive],
    ["Fuel", (b) => b.fuel.split(" / ")[0]],
    ["Water", (b) => b.water.split(" / ")[0]],
    ["Motoring range (est.)", (b) => "~" + b.rangeNm + " nm"],
    ["Cabins", (b) => b.cabins],
    ...DIMS.map(
      ([k, label]) =>
        [label, (b: ScoredBoat) => <Dots n={b.scores[k]} />] as [
          string,
          (b: ScoredBoat) => ReactNode,
        ],
    ),
  ];

  return (
    <div
      className="overlay open"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div
          className="mhead"
          style={{ background: "linear-gradient(135deg,#0d2238,#16344f)" }}
        >
          <button className="close" onClick={onClose}>
            ×
          </button>
          <h2>⚖️ Side-by-side comparison</h2>
          <div className="mb">
            {list.length} boats · weighted by your current priorities
          </div>
        </div>
        <div className="mbody">
          <div className="cmptable">
            <table>
              <tbody>
                <tr>
                  <th>Attribute</th>
                  {list.map((b) => (
                    <th key={b.id} style={{ color: b.color }}>
                      {b.name}
                    </th>
                  ))}
                </tr>
                {rows.map(([label, fn]) => (
                  <tr key={label}>
                    <td className="h">{label}</td>
                    {list.map((b) => (
                      <td key={b.id}>{fn(b)}</td>
                    ))}
                  </tr>
                ))}
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
