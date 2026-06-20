import { useEffect, type ReactNode } from "react";
import type { ScoredBoat } from "../types/boat";
import {
  METRICS,
  PILLARS,
  RATE_WORDS,
  R5_WORDS,
  comfort,
  csf,
  hullSpeed,
  rate5,
  shade,
  specColor,
  type PillarWeights,
} from "../lib/metrics";
import { Radar } from "../lib/svg";

/** Inline colour-coded spec value (legacy .cw span). */
function CV({
  boat,
  metric,
  txt,
}: {
  boat: ScoredBoat;
  metric: string;
  txt: string;
}) {
  const { cls } = specColor(boat, metric, txt);
  return <span className={`cw ${cls}`}>{txt}</span>;
}

function KV({ k, v }: { k: ReactNode; v: ReactNode }) {
  return (
    <div className="kv">
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
}

function Scorecard({ boat }: { boat: ScoredBoat }) {
  return (
    <div className="scards">
      {METRICS.map((M) => {
        const v = M.get(boat);
        const cls = M.rate(v);
        return (
          <div className={`scard ${cls}`} key={M.key}>
            <div className="sl">{M.label}</div>
            <div className="sv">{v == null ? "n/a" : M.fmt(v)}</div>
            <div className="sr">{RATE_WORDS[cls]}</div>
            <div className="sh">{M.hint}</div>
          </div>
        );
      })}
    </div>
  );
}

function OwnershipSection({ boat: b }: { boat: ScoredBoat }) {
  const o = b.own;
  if (!o) return null;
  const items: [string, number][] = [
    ["Owner-maintainability", o.scores.maintain],
    ["Systems simplicity", o.scores.simplicity],
    ["Parts & builder", o.scores.parts],
    ["Community & support", o.scores.community],
  ];
  const det: [string, string][] = [
    ["🧩 Systems complexity", o.complexity],
    ["🧰 Owner-maintainability", o.maintain],
    ["📦 Parts & builder support", o.partsText],
    ["🩺 Known problems / history", o.problems],
    ["💬 Owner sentiment", o.sentiment],
    ["⛩️ Mast step", o.mastStep],
    ["⚓ Keel & rudder", o.keelRudder],
  ];
  const risk = o.scores.community <= 2 || o.scores.parts <= 2;
  return (
    <div className="msec">
      <h3>🛠️ Ownership, support &amp; maintainability</h3>
      {risk && <div className="riskbanner">⚠ Support risk — {o.risks[0]}</div>}
      <div style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 9px" }}>
        Ownership &amp; support pillar{" "}
        <b style={{ color: "var(--navy)" }}>{b.pillars.own}/100</b> — the
        average of the four ratings below.
      </div>
      <div className="scards">
        {items.map(([l, v]) => {
          const c = rate5(v);
          return (
            <div className={`scard ${c}`} key={l}>
              <div className="sl">{l}</div>
              <div className="sv">{v}/5</div>
              <div className="sr">{R5_WORDS[c]}</div>
            </div>
          );
        })}
      </div>
      <div className="legendbar">
        <span>
          <i style={{ background: "#1f8a5b" }} />
          Strong
        </span>
        <span>
          <i style={{ background: "#9bbb1e" }} />
          OK
        </span>
        <span>
          <i style={{ background: "#d98a2b" }} />
          Caution
        </span>
        <span>
          <i style={{ background: "#c0492f" }} />
          Weak
        </span>
      </div>
      <div
        className="spectable detgrid"
        style={{ gridTemplateColumns: "1fr", marginTop: 12 }}
      >
        {det.map(([k, v]) => (
          <KV key={k} k={k} v={v} />
        ))}
      </div>
      {o.communities?.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div
            className="sl"
            style={{ marginBottom: 6, fontWeight: 700, color: "var(--muted)" }}
          >
            Owner communities &amp; support
          </div>
          <div className="lnks">
            {o.communities.map((c) => (
              <a key={c.url} href={c.url} target="_blank" rel="noopener">
                {c.name} ↗
              </a>
            ))}
          </div>
        </div>
      )}
      {o.risks?.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div
            className="sl"
            style={{ marginBottom: 4, fontWeight: 700, color: "var(--muted)" }}
          >
            Risk flags for an inexperienced-crew liveaboard couple
          </div>
          <ul className="risklist">
            {o.risks.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface Props {
  boat: ScoredBoat;
  pillarWeights: PillarWeights;
  onClose: () => void;
}

export default function DetailModal({
  boat: b,
  pillarWeights: pw,
  onClose,
}: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const det: [string, string][] = [
    ["🛡️ Cockpit protection", b.protectionText],
    ["🪢 Short-handed handling", b.handlingText],
    ["⛓️ Rig & sails", b.rig],
    ["🔧 Workshop & engine", b.engineWorkshop],
    ["🔋 Systems & power", b.systems],
    ["📦 Storage", b.storageText],
    ["⛽ Tankage & range", b.rangeText],
    ["🐕 Crew & dogs", b.accommodation],
    ["❄️ High latitude (Patagonia)", b.highLatText],
    ["🌴 Tropics (Caribbean/Polynesia)", b.tropicalText],
  ];
  const glance: [string, ReactNode][] = [
    ["Mission fit", b.missionFit + "/100"],
    ["Type", b.category],
    ["Price", b.priceText],
    ["Comfort ratio", "~" + Math.round(comfort(b))],
    ["Capsize screen", "~" + csf(b).toFixed(2)],
    ["Fuel / water", b.fuel.split(" / ")[0] + " / " + b.water.split(" / ")[0]],
  ];
  const hasAwards =
    (b.awards?.length || 0) > 0 || (b.endorsements?.length || 0) > 0;

  return (
    <div
      className="overlay open"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div
          className="mhead"
          style={{
            background: `linear-gradient(135deg,${b.color},${shade(b.color, -18)})`,
          }}
        >
          <button className="close" onClick={onClose}>
            ×
          </button>
          <h2>{b.name}</h2>
          <div className="mb">
            {b.builder} · {b.designer} · {b.years} · <b>{b.priceText}</b>
          </div>
        </div>
        <div className="mbody">
          <div className="bestfor">
            <b>Best for:</b> {b.bestFor}
          </div>

          <div className="msec">
            <h3>🎯 Selection score — {b.selection}/100</h3>
            <div className="bars">
              {PILLARS.map(([k, label, color]) => (
                <div className="bar" key={k}>
                  <div className="bl">
                    <span>{label}</span>
                    <span>
                      {b.pillars[k]}/100 · weight ×{pw[k].toFixed(2)}
                    </span>
                  </div>
                  <div className="track">
                    <div
                      className="fillb"
                      style={{ width: `${b.pillars[k]}%`, background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
              A weighted average of four pillars: <b>Mission fit</b> (matches
              your stated needs), <b>Seaworthiness</b> (motion comfort,
              stability, protected helm, offshore toughness),{" "}
              <b>Ownership &amp; support</b> (maintainability, simplicity,
              parts, community) and <b>Value</b> (price + budget fit). Re-blend
              it with the “Selection score weighting” sliders at the top.
            </div>
          </div>

          <div className="mtop">
            <div>
              <Radar scores={b.scores} color={b.color} />
            </div>
            <div className="spectable" style={{ gridTemplateColumns: "1fr" }}>
              {glance.map(([k, v]) => (
                <KV key={k} k={k} v={v} />
              ))}
            </div>
          </div>

          <div className="msec">
            <div className="note">{b.budgetText}</div>
          </div>

          <div className="msec">
            <h3>Why it fits — and where it doesn't</h3>
            <div className="pc">
              <div className="pros">
                <h4>✓ Pros for this mission</h4>
                <ul>
                  {b.pros.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
              <div className="cons">
                <h4>✗ Watch-outs</h4>
                <ul>
                  {b.cons.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {hasAwards && (
            <div className="msec">
              <h3>🏆 Awards &amp; expert take</h3>
              {b.awards?.length > 0 && (
                <div className="awards">
                  {b.awards.map((a) => (
                    <span className="award" key={a}>
                      {a}
                    </span>
                  ))}
                </div>
              )}
              <div className="endlist">
                {(b.endorsements || []).map((e) => (
                  <div className="endrow" key={e.who}>
                    <b>{e.who}</b> — {e.note}
                    {e.url && (
                      <>
                        {" "}
                        <a href={e.url} target="_blank" rel="noopener">
                          source ↗
                        </a>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="msec">
            <h3>The details that matter here</h3>
            <div
              className="spectable detgrid"
              style={{ gridTemplateColumns: "1fr" }}
            >
              {det.map(([k, v]) => (
                <KV key={k} k={k} v={v} />
              ))}
            </div>
          </div>

          <div className="msec">
            <h3>📊 Performance &amp; safety scorecard</h3>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--muted)",
                margin: "0 0 9px",
              }}
            >
              Seaworthiness pillar{" "}
              <b style={{ color: "var(--navy)" }}>{b.pillars.sea}/100</b> — the
              colour-rated factors below feed it (range is now engine-aware).
            </div>
            <Scorecard boat={b} />
            <div className="legendbar">
              <span>
                <i style={{ background: "#1f8a5b" }} />
                Excellent
              </span>
              <span>
                <i style={{ background: "#9bbb1e" }} />
                Good
              </span>
              <span>
                <i style={{ background: "#d98a2b" }} />
                Fair
              </span>
              <span>
                <i style={{ background: "#c0492f" }} />
                Weak
              </span>
              <span>— colour-rated for this couple’s bluewater mission</span>
            </div>
          </div>

          <OwnershipSection boat={b} />

          <div className="msec">
            <h3>Full specifications</h3>
            <div className="spectable">
              <KV k="Builder" v={b.builder} />
              <KV k="Designer" v={b.designer} />
              <KV k="Years" v={b.years} />
              <KV k="Type" v={b.category} />
              <KV k="Hull material" v={b.material} />
              <KV k="LOA" v={b.loa} />
              <KV k="LWL" v={b.lwl} />
              <KV k="Beam" v={b.beam} />
              <KV
                k="Draft (min)"
                v={<CV boat={b} metric="draft" txt={b.draftMin} />}
              />
              <KV k="Draft (max)" v={b.draftMax} />
              <KV k="Air draft" v={b.airDraft} />
              <KV k="Displacement" v={b.displacement} />
              <KV k="Ballast" v={b.ballast} />
              <KV
                k="Ballast ratio"
                v={<CV boat={b} metric="ballast" txt={b.ballastRatio} />}
              />
              <KV k="Sail area" v={b.sailArea} />
              <KV
                k="SA/D ratio"
                v={<CV boat={b} metric="sad" txt={String(b.sad)} />}
              />
              <KV
                k="D/L ratio"
                v={<CV boat={b} metric="dl" txt={String(b.dl)} />}
              />
              <KV
                k="Hull speed"
                v={
                  <CV
                    boat={b}
                    metric="hull"
                    txt={hullSpeed(b).toFixed(1) + " kt"}
                  />
                }
              />
              <KV
                k="Comfort ratio"
                v={
                  <CV
                    boat={b}
                    metric="comfort"
                    txt={"~" + Math.round(comfort(b))}
                  />
                }
              />
              <KV
                k="Capsize screen"
                v={<CV boat={b} metric="csf" txt={"~" + csf(b).toFixed(2)} />}
              />
              <KV k="Engine" v={b.engine} />
              <KV k="Drive" v={b.drive} />
              <KV k="Cabins / heads" v={b.cabins} />
              <KV k="Keel / hull" v={b.keel} />
              <KV k="Mast step" v={b.own ? b.own.mastStep : "n/a"} />
              <KV
                k="Keel attach & rudder"
                v={b.own ? b.own.keelRudder : "n/a"}
              />
              <KV k="Fuel" v={<CV boat={b} metric="range" txt={b.fuel} />} />
              <KV k="Water" v={<CV boat={b} metric="water" txt={b.water} />} />
              <KV
                k="Motoring range (est.)"
                v={<CV boat={b} metric="range" txt={"~" + b.rangeNm + " nm"} />}
              />
            </div>
          </div>

          <div className="msec">
            <h3>💵 Price detail</h3>
            <div className="spectable" style={{ gridTemplateColumns: "1fr" }}>
              <div className="kv">
                <span>New</span>
                <span
                  style={{
                    fontWeight: 400,
                    textAlign: "left",
                    maxWidth: "74%",
                  }}
                >
                  {b.priceNew}
                </span>
              </div>
              <div className="kv">
                <span>Used / brokerage</span>
                <span
                  style={{
                    fontWeight: 400,
                    textAlign: "left",
                    maxWidth: "74%",
                  }}
                >
                  {b.priceUsed}
                </span>
              </div>
            </div>
            <ul className="plist">
              {b.priceExamples.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="msec">
            <h3>✨ Fun details</h3>
            <ul className="funlist">
              {b.fun.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <div
              style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8 }}
            >
              <b>Notable voyages:</b> {b.notable}
            </div>
          </div>

          <div className="msec">
            <h3>🔗 Sources &amp; further reading</h3>
            <div className="lnks">
              {b.sources.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener">
                  {s.name} ↗
                </a>
              ))}
            </div>
          </div>

          <div className="msec">
            <h3>▶ YouTube — owners &amp; reviews</h3>
            <div className="yt">
              {b.youtube.map((y) => (
                <a key={y.url} href={y.url} target="_blank" rel="noopener">
                  <span className="ytic" />
                  <span className="ytmeta">
                    <b>{y.name}</b>
                    <small>{y.note}</small>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
