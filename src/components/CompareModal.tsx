import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { ScoredBoat } from "../types/boat";
import {
  DIMS,
  comfort,
  csf,
  stabilityIndex,
  usd,
  waterDays,
} from "../lib/metrics";
import { budgeLabel, headline } from "../lib/format";
import { Dots } from "../lib/svg";
import { researchOf } from "../lib/research";
import { useNoteIds } from "../lib/notes";
import NotesField from "./NotesField";
import type { ResearchIndexEntry } from "../types/research";

const ri = (b: ScoredBoat): ResearchIndexEntry | undefined => researchOf(b.id);
// A researched 0–100 score is only honest above the confidence floor (0.3).
const shownScore = (v: number, conf: number): string =>
  conf >= 0.3 ? String(v) : "—";

// Distinct, legible-on-parchment slot colours — one per compared boat. Used
// consistently for the radar polygon, the column accent and the per-row bars so
// a reader can track a boat by colour across the whole board.
const SLOT_COLORS = ["#1f6f73", "#b8893b", "#7a4f9e", "#3b8a55"];
const slotColor = (i: number) => SLOT_COLORS[i % SLOT_COLORS.length];

interface Props {
  boats: ScoredBoat[];
  onClose: () => void;
  onClear: () => void;
  onRemove?: (id: string) => void;
  onOpenBoat?: (id: string) => void;
}

/** One comparison row. `num`/`better` drive the winner highlight + heat bar; the
 *  rendered `text` doubles as the equality key for the show-differences filter. */
interface Row {
  label: string;
  cell: (b: ScoredBoat) => ReactNode;
  text: (b: ScoredBoat) => string;
  num?: (b: ScoredBoat) => number;
  better?: "high" | "low";
}
interface Section {
  title: string;
  rows: Row[];
}

// ── radar chart over the nine mission dimensions ─────────────────────────────
function Radar({ boats }: { boats: ScoredBoat[] }) {
  const N = DIMS.length;
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 46;
  const ang = (i: number) => (Math.PI * 2 * i) / N - Math.PI / 2;
  const pt = (i: number, frac: number): [number, number] => [
    cx + Math.cos(ang(i)) * R * frac,
    cy + Math.sin(ang(i)) * R * frac,
  ];
  const rings = [0.25, 0.5, 0.75, 1];
  const polyOf = (frac: (i: number) => number) =>
    DIMS.map((_, i) => pt(i, frac(i)).join(",")).join(" ");

  return (
    <div className="cmp-radar">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Mission profile radar"
      >
        {/* grid rings */}
        {rings.map((r) => (
          <polygon
            key={r}
            points={polyOf(() => r)}
            fill="none"
            stroke="var(--line)"
            strokeWidth={1}
          />
        ))}
        {/* spokes + axis labels */}
        {DIMS.map(([, , short], i) => {
          const [x, y] = pt(i, 1);
          const [lx, ly] = pt(i, 1.17);
          return (
            <g key={short}>
              <line
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="var(--line)"
                strokeWidth={1}
              />
              <text
                x={lx}
                y={ly}
                fontSize={9.5}
                fill="var(--muted)"
                textAnchor={
                  Math.abs(lx - cx) < 6 ? "middle" : lx > cx ? "start" : "end"
                }
                dominantBaseline="middle"
              >
                {short}
              </text>
            </g>
          );
        })}
        {/* one polygon per boat */}
        {boats.map((b, i) => {
          const c = slotColor(i);
          return (
            <polygon
              key={b.id}
              points={polyOf((j) => b.scores[DIMS[j][0]] / 5)}
              fill={c}
              fillOpacity={0.12}
              stroke={c}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
      <div className="cmp-radar-legend">
        {boats.map((b, i) => (
          <span key={b.id} className="cmp-leg">
            <i style={{ background: slotColor(i) }} />
            {b.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CompareModal({
  boats: list,
  onClose,
  onClear,
  onRemove,
  onOpenBoat,
}: Props) {
  const [diffOnly, setDiffOnly] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [showNotes, setShowNotes] = useState(false);
  const [copied, setCopied] = useState(false);
  const noteIds = useNoteIds();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const sections: Section[] = useMemo(
    () => [
      {
        title: "Headline",
        rows: [
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
        ],
      },
      {
        title: "Identity & price",
        rows: [
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
        ],
      },
      {
        title: "Dimensions",
        rows: [
          {
            label: "LOA",
            cell: (b) => headline(b.loa),
            text: (b) => headline(b.loa),
            num: (b) => b.loaN,
            better: "high",
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
        ],
      },
      {
        title: "Seaworthiness",
        rows: [
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
            label: "Stability index (computed)",
            cell: (b) => stabilityIndex(b) + "/100",
            text: (b) => String(stabilityIndex(b)),
            num: (b) => stabilityIndex(b),
            better: "high",
          },
        ],
      },
      {
        title: "Range & accommodation",
        rows: [
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
        ],
      },
      {
        title: "Mission scores",
        rows: DIMS.map(
          ([k, , short]): Row => ({
            label: short,
            cell: (b) => <Dots n={b.scores[k]} />,
            text: (b) => String(b.scores[k]),
            num: (b) => b.scores[k],
            better: "high",
          }),
        ),
      },
      {
        title: "Deep research",
        rows: [
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
              return e && e.refitLow
                ? usd(e.refitLow) + "–" + usd(e.refitHigh)
                : "—";
            },
            text: (b) => {
              const e = ri(b);
              return e && e.refitLow
                ? usd(e.refitLow) + "–" + usd(e.refitHigh)
                : "—";
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
        ],
      },
    ],
    [],
  );

  const allSame = (r: Row) => {
    const t = list.map(r.text);
    return t.every((x) => x === t[0]);
  };
  const winners = (r: Row): Set<number> => {
    const out = new Set<number>();
    if (!r.num || !r.better || allSame(r)) return out;
    const vals = list
      .map(r.num)
      .filter((v) => v > -1 && v < Number.MAX_SAFE_INTEGER);
    if (!vals.length) return out;
    const best = r.better === "high" ? Math.max(...vals) : Math.min(...vals);
    list.forEach((b, i) => r.num!(b) === best && out.add(i));
    return out;
  };
  // 0..1 relative strength of a value within the row (1 = best), for the heat bar.
  const frac = (r: Row, b: ScoredBoat): number | null => {
    if (!r.num || !r.better) return null;
    const raw = list
      .map(r.num)
      .filter((v) => v > -1 && v < Number.MAX_SAFE_INTEGER);
    if (raw.length < 2) return null;
    const min = Math.min(...raw);
    const max = Math.max(...raw);
    if (max === min) return null;
    const v = r.num(b);
    if (v <= -1 || v >= Number.MAX_SAFE_INTEGER) return null;
    return r.better === "high"
      ? (v - min) / (max - min)
      : (max - v) / (max - min);
  };

  const toggle = (title: string) =>
    setCollapsed((c) => {
      const n = new Set(c);
      n.has(title) ? n.delete(title) : n.add(title);
      return n;
    });

  const visibleRows = (rows: Row[]) =>
    diffOnly ? rows.filter((r) => !allSame(r)) : rows;
  const hiddenCount = diffOnly
    ? sections.reduce((a, s) => a + s.rows.filter(allSame).length, 0)
    : 0;

  // Copy the whole board as a Markdown table (portable, paste anywhere).
  function copyMarkdown() {
    const header =
      "| Attribute | " + list.map((b) => b.name).join(" | ") + " |";
    const divider = "| --- " + list.map(() => "| --- ").join("") + "|";
    const lines = [header, divider];
    for (const sec of sections) {
      lines.push(`| **${sec.title}** |${list.map(() => " ").join("|")}|`);
      for (const r of sec.rows) {
        const cells = list.map((b) => r.text(b).replace(/\|/g, "\\|"));
        lines.push(`| ${r.label} | ${cells.join(" | ")} |`);
      }
    }
    lines.push(
      `| Best for | ${list.map((b) => b.bestFor.replace(/\|/g, "\\|")).join(" | ")} |`,
    );
    const md = lines.join("\n");
    navigator.clipboard?.writeText(md).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      },
      () => {},
    );
  }

  return (
    <div
      className="overlay open"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal cmp-modal">
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
            {list.length} boat{list.length > 1 ? "s" : ""} · <b>◆</b> marks the
            strongest on each measure · bars show relative strength
          </div>
          <div className="cmp-chips">
            {list.map((b, i) => (
              <span
                className="cmp-chip"
                key={b.id}
                style={{ borderColor: slotColor(i) }}
              >
                <i
                  className="cmp-chip-dot"
                  style={{ background: slotColor(i) }}
                />
                {b.name}
                {noteIds.has(b.id) && (
                  <span className="cmp-chip-note" title="You have a note">
                    ✎
                  </span>
                )}
                {onRemove && (
                  <button
                    className="cmp-chip-x"
                    aria-label={`Remove ${b.name}`}
                    onClick={() => onRemove(b.id)}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
        <div className="mbody">
          {list.length >= 1 && <Radar boats={list} />}

          <div className="cmpopts">
            <label>
              <input
                type="checkbox"
                checked={diffOnly}
                onChange={(e) => setDiffOnly(e.target.checked)}
              />
              Show only where they differ
            </label>
            {diffOnly && hiddenCount > 0 && (
              <span style={{ color: "var(--muted)" }}>
                {hiddenCount} identical row{hiddenCount > 1 ? "s" : ""} hidden
              </span>
            )}
            <span className="cmpopts-sp" />
            <button className="cmp-act" onClick={copyMarkdown}>
              {copied ? "Copied ✓" : "⧉ Copy table"}
            </button>
            <button className="cmp-act no-print" onClick={() => window.print()}>
              ⎙ Print
            </button>
            <button className="cmp-act" onClick={() => setShowNotes((s) => !s)}>
              {showNotes ? "Hide notes" : "📝 Notes"}
            </button>
          </div>

          <div className="cmptable">
            <table>
              <thead>
                <tr>
                  <th>Attribute</th>
                  {list.map((b, i) => (
                    <th key={b.id} style={{ borderTopColor: slotColor(i) }}>
                      <button
                        className="cmp-th-name"
                        onClick={() => onOpenBoat?.(b.id)}
                        title={onOpenBoat ? "Open full profile" : undefined}
                      >
                        {b.name}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sections.map((sec) => {
                  const rows = visibleRows(sec.rows);
                  if (!rows.length) return null;
                  const isCollapsed = collapsed.has(sec.title);
                  return (
                    <SectionBody
                      key={sec.title}
                      title={sec.title}
                      span={list.length + 1}
                      collapsed={isCollapsed}
                      onToggle={() => toggle(sec.title)}
                    >
                      {!isCollapsed &&
                        rows.map((r) => {
                          const win = winners(r);
                          return (
                            <tr key={r.label}>
                              <td className="h">{r.label}</td>
                              {list.map((b, i) => {
                                const f = frac(r, b);
                                return (
                                  <td
                                    key={b.id}
                                    className={win.has(i) ? "win" : ""}
                                  >
                                    <span className="cmp-cellv">
                                      {r.cell(b)}
                                    </span>
                                    {f != null && (
                                      <span className="cmp-bar" aria-hidden>
                                        <span
                                          style={{
                                            width: `${Math.round(f * 100)}%`,
                                            background: win.has(i)
                                              ? "var(--good)"
                                              : slotColor(i),
                                            opacity: win.has(i) ? 0.9 : 0.45,
                                          }}
                                        />
                                      </span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                    </SectionBody>
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

          {showNotes && (
            <div className="cmp-notes">
              <h3>📝 Notes while you compare</h3>
              <p className="provnote">
                Private to this browser. They show up on each boat's profile
                too.
              </p>
              <div
                className="cmp-notes-grid"
                style={{
                  gridTemplateColumns: `repeat(${list.length}, minmax(180px,1fr))`,
                }}
              >
                {list.map((b, i) => (
                  <div key={b.id} className="cmp-note-col">
                    <div className="cmp-note-h" style={{ color: slotColor(i) }}>
                      {b.name}
                    </div>
                    <NotesField
                      id={b.id}
                      rows={4}
                      placeholder={`Notes on the ${b.name}…`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

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

// A collapsible section header row + its body rows.
function SectionBody({
  title,
  span,
  collapsed,
  onToggle,
  children,
}: {
  title: string;
  span: number;
  collapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <tr className="cmp-secrow">
        <td className="cmp-sec" colSpan={span} onClick={onToggle}>
          <span className="cmp-sec-caret">{collapsed ? "▸" : "▾"}</span> {title}
        </td>
      </tr>
      {children}
    </>
  );
}
