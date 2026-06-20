// The shared boat dossier — a tabbed, research-rich profile used by BOTH the modal
// and the dedicated /boat/:id report page. It fuses the hand-authored narrative with
// the bespoke research layer (cited facts, cold/tropic/stability scores WITH confidence,
// storm verdict, refit projection, provisioning) and degrades gracefully for boats with
// no deep research yet.
import { useMemo, useState, type ReactNode } from "react";
import type { ScoredBoat } from "../types/boat";
import type { BoatResearch, Fact } from "../types/research";
import {
  METRICS,
  PILLARS,
  RATE_WORDS,
  R5_WORDS,
  AUTONOMY_NOTE,
  catColor,
  comfort,
  csf,
  hullSpeed,
  loadedLb,
  mrate,
  rate5,
  specColor,
  stabilityIndex,
  stabilityRate,
  stabilityWord,
  waterDays,
  type DimKey,
  type PillarWeights,
} from "../lib/metrics";
import { isShelter } from "../lib/format";
import { TierBars, Prov } from "../lib/svg";
import {
  ConfMeter,
  ScoreBar,
  RangeBars,
  CostWaterfall,
  SentimentSplit,
  usd,
} from "../lib/charts";
import universalRaw from "../../research/provisioning-universal.json";

interface UniversalCat {
  key: string;
  label: string;
  note: string;
  items: { item: string; why: string; spec?: string; priority: string }[];
}
const UNIVERSAL = universalRaw as unknown as {
  categories: UniversalCat[];
  priority_key: Record<string, string>;
};

// ── small shared atoms ──────────────────────────────────────────────────────
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
function SecHead({ children }: { children: ReactNode }) {
  return <h3>{children}</h3>;
}

const CSF_WORD: Record<string, string> = {
  g: "Sea-kindly",
  y: "Moderate",
  o: "Lively",
  r: "Stiff",
  n: "—",
};

const FACT_DOMAINS: [string, string][] = [
  ["stability", "Stability & structure"],
  ["cold", "Cold-weather readiness"],
  ["tropical", "Tropical readiness"],
  ["self_steering", "Self-steering & power"],
  ["ergonomics", "Ergonomics & MOB"],
  ["heavy_weather", "Heavy weather"],
  ["refit", "Refit & known issues"],
  ["parts", "Parts & support"],
];

// ── reusable section renderers ──────────────────────────────────────────────
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

function DerivableHeavyWeather({
  boat: b,
  research,
}: {
  boat: ScoredBoat;
  research?: BoatResearch | null;
}) {
  const csfCls = mrate(b, "csf");
  const comfCls = mrate(b, "comfort");
  const lLb = loadedLb(b);
  const loadedCsf = lLb ? b.beamFt / Math.cbrt(lLb / 64) : null;
  const shelter = isShelter(b);
  // Prefer a published/researched stability figure when one survived verification;
  // otherwise fall back to the computed screening index so no boat is ever blank.
  const ss = research?.scores.stability_score;
  const published = !!ss && ss.confidence > 0 && ss.value > 0;
  const si = stabilityIndex(b);
  const stabVal = published ? Math.round(ss!.value) : si;
  const stabCls = stabilityRate(stabVal);
  return (
    <div className="hwstrip">
      <div className={"hwcard " + stabCls}>
        <div className="hl">
          <Prov kind={published ? "spec" : "computed"} /> Stability index
        </div>
        <div className="hv">
          {stabVal}
          <i>/100</i>
        </div>
        <div className="hr">{stabilityWord(stabVal)}</div>
        <div className="hsub">
          {published
            ? "From published stability data."
            : "Screening blend of capsize ratio, ballast & motion — not a measured AVS."}
        </div>
      </div>
      <div className={"hwcard " + csfCls}>
        <div className="hl">
          <Prov kind="computed" /> Capsize screen
        </div>
        <div className="hv">{csf(b).toFixed(2)}</div>
        <div className="hr">{CSF_WORD[csfCls]}</div>
        <div className="hsub">
          Under 2.0 is the offshore target.{" "}
          {loadedCsf
            ? `Loaded ≈ ${loadedCsf.toFixed(2)}.`
            : "Light-ship figure."}
        </div>
      </div>
      <div className={"hwcard " + comfCls}>
        <div className="hl">
          <Prov kind="computed" /> Comfort ratio
        </div>
        <div className="hv">~{Math.round(comfort(b))}</div>
        <div className="hr">{RATE_WORDS[comfCls]}</div>
        <div className="hsub">
          Motion comfort in a seaway — higher is gentler.
        </div>
      </div>
      <div className={"hwcard " + (shelter ? "g" : "n")}>
        <div className="hl">
          <Prov kind="spec" /> Steer from inside
        </div>
        <div className="hv">{shelter ? "Yes" : "Exposed"}</div>
        <div className="hr">{shelter ? "Sheltered helm" : "Open cockpit"}</div>
        <div className="hsub">{b.cockpitType}</div>
      </div>
    </div>
  );
}

function SourceLinks({ sources }: { sources: Fact["sources"] }) {
  if (!sources?.length) return null;
  return (
    <span className="srclinks">
      {sources.slice(0, 4).map((s, i) => (
        <a
          key={s.url + i}
          href={s.url}
          target="_blank"
          rel="noopener"
          title={s.title}
        >
          {hostOf(s.url)} ↗
        </a>
      ))}
    </span>
  );
}
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

function FactRow({ f }: { f: Fact }) {
  return (
    <div className="factrow">
      <div className="factrow-head">
        <span className="factrow-key">
          {f.key.split(".").slice(1).join(" ") || f.key}
        </span>
        <ConfMeter confidence={f.confidence} />
      </div>
      <div className="factrow-val">{f.value}</div>
      <SourceLinks sources={f.sources} />
    </div>
  );
}

// ── the dossier ─────────────────────────────────────────────────────────────
type TabKey =
  | "overview"
  | "weather"
  | "systems"
  | "ownership"
  | "costs"
  | "provisioning"
  | "evidence";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "weather", label: "Heavy Weather" },
  { key: "systems", label: "Systems & Specs" },
  { key: "ownership", label: "Ownership" },
  { key: "costs", label: "Costs & Refit" },
  { key: "provisioning", label: "Provisioning" },
  { key: "evidence", label: "Evidence" },
];

export default function BoatDossier({
  boat: b,
  research,
  researchLoading,
  researched,
  pillarWeights: pw,
  medians,
}: {
  boat: ScoredBoat;
  research: BoatResearch | null;
  researchLoading: boolean;
  researched: boolean;
  pillarWeights: PillarWeights;
  medians: Record<DimKey, number>;
}) {
  const [tab, setTab] = useState<TabKey>("overview");
  const hue = catColor(b);

  const factGroups = useMemo(() => {
    const facts = research?.verify.cleaned_facts ?? [];
    return FACT_DOMAINS.map(([prefix, label]) => ({
      label,
      facts: facts.filter((f) =>
        (f.key || "").toLowerCase().startsWith(prefix),
      ),
    })).filter((g) => g.facts.length);
  }, [research]);

  const glance: [string, ReactNode][] = [
    ["Mission fit", b.missionFit + "/100"],
    ["Type", b.category],
    ["Price", b.priceText],
    ["Hull material", b.material],
    ["Water autonomy", `~${waterDays(b)} days`],
    ["Motoring range", "~" + b.rangeNm + " nm"],
  ];

  const researchPending = researched && researchLoading;

  return (
    <div className="dossier">
      <div className="tabbar" role="tablist" aria-label="Boat dossier sections">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={"tabbtn" + (tab === t.key ? " on" : "")}
            style={
              tab === t.key
                ? { borderBottomColor: hue, color: "var(--ink)" }
                : undefined
            }
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="tabpanel" role="tabpanel">
        {tab === "overview" && (
          <>
            <div className="shiplog">
              <div className="eyebrow">Ship's log — the verdict</div>
              <div className="verdict">{b.bestFor}</div>
              {(b.pros?.length > 0 || b.cons?.length > 0) && (
                <div className="caselist">
                  {b.pros?.[0] && (
                    <div className="for">
                      <div className="ct">The case for</div>
                      <div>{b.pros[0]}</div>
                    </div>
                  )}
                  {b.cons?.[0] && (
                    <div className="against">
                      <div className="ct">The sharpest watch-out</div>
                      <div>{b.cons[0]}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="msec">
              <SecHead>🎯 Selection score — {b.selection}/100</SecHead>
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
            </div>

            <div className="msec">
              <SecHead>🧭 Mission profile</SecHead>
              <div className="mtop">
                <TierBars scores={b.scores} medians={medians} color={hue} />
                <div>
                  <div
                    className="spectable"
                    style={{ gridTemplateColumns: "1fr" }}
                  >
                    {glance.map(([k, v]) => (
                      <KV key={k} k={k} v={v} />
                    ))}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "var(--muted)",
                      marginTop: 8,
                    }}
                  >
                    Water autonomy assumes {AUTONOMY_NOTE}.
                  </div>
                </div>
              </div>
            </div>

            <div className="msec">
              <SecHead>Why it fits — and where it doesn't</SecHead>
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
          </>
        )}

        {tab === "weather" && (
          <>
            <div className="msec">
              <SecHead>
                🌊 Heavy weather &amp; stability — read this first
              </SecHead>
              <DerivableHeavyWeather boat={b} research={research} />
              <div className="provkey">
                <span>
                  <Prov kind="computed" /> computed from physics
                </span>
                <span>
                  <Prov kind="spec" /> published spec
                </span>
                <span>
                  <Prov kind="editorial" /> editorial judgement
                </span>
                <span>
                  <Prov kind="not-published" /> not published
                </span>
              </div>
            </div>

            {research ? (
              <>
                <div className="msec">
                  <SecHead>
                    🧪 Researched climate scores — with confidence
                  </SecHead>
                  <div className="scoregrid">
                    <ScoreBar
                      label="❄️ Cold-weather readiness"
                      value={research.scores.cold_score.value}
                      confidence={research.scores.cold_score.confidence}
                    />
                    <ScoreBar
                      label="🌴 Tropical readiness"
                      value={research.scores.tropic_score.value}
                      confidence={research.scores.tropic_score.confidence}
                    />
                  </div>
                  <details className="why-scores">
                    <summary>Why these scores</summary>
                    <p>
                      <b>Cold-weather:</b>{" "}
                      {research.scores.cold_score.rationale}
                    </p>
                    <p>
                      <b>Tropics:</b> {research.scores.tropic_score.rationale}
                    </p>
                    {research.scores.stability_score.rationale && (
                      <p>
                        <b>Stability:</b>{" "}
                        {research.scores.stability_score.rationale}
                      </p>
                    )}
                  </details>
                </div>

                <div className="msec">
                  <SecHead>⛈️ Storm verdict</SecHead>
                  <div
                    className={
                      "verdict-card " +
                      (research.scores.storm_verdict.cited
                        ? "cited"
                        : "uncited")
                    }
                  >
                    <span className="verdict-badge">
                      {research.scores.storm_verdict.cited
                        ? "Cited account"
                        : "Insufficient sourced data"}
                    </span>
                    <p>{research.scores.storm_verdict.text}</p>
                  </div>
                </div>
              </>
            ) : (
              <ResearchEmpty
                pending={researchPending}
                researched={researched}
                what="climate scores & storm verdict"
              />
            )}

            {b.own?.keelRudder && (
              <div className="note">
                <b>Keel &amp; rudder:</b> {b.own.keelRudder}
              </div>
            )}
          </>
        )}

        {tab === "systems" && (
          <>
            <div className="msec">
              <SecHead>The details that matter here</SecHead>
              <div
                className="spectable detgrid"
                style={{ gridTemplateColumns: "1fr" }}
              >
                {(
                  [
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
                  ] as [string, string][]
                ).map(([k, v]) => (
                  <KV key={k} k={k} v={v} />
                ))}
              </div>
            </div>
            <div className="msec">
              <SecHead>📊 Performance &amp; safety scorecard</SecHead>
              <Scorecard boat={b} />
            </div>
            <div className="msec">
              <SecHead>Full specifications</SecHead>
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
                <KV k="Fuel" v={<CV boat={b} metric="range" txt={b.fuel} />} />
                <KV
                  k="Water"
                  v={<CV boat={b} metric="water" txt={b.water} />}
                />
                <KV
                  k="Motoring range (est.)"
                  v={
                    <CV boat={b} metric="range" txt={"~" + b.rangeNm + " nm"} />
                  }
                />
              </div>
            </div>
          </>
        )}

        {tab === "ownership" && (
          <>
            <OwnershipBlock boat={b} />
            {research ? (
              <div className="msec">
                <SecHead>💬 Owner sentiment — from the field</SecHead>
                <SentimentSplit
                  praise={research.research.sentiment.praise.length}
                  complaints={research.research.sentiment.complaints.length}
                  issues={research.research.sentiment.known_issues.length}
                />
                <div className="sentcols">
                  <Sentlist
                    title="✓ Praise"
                    cls="for"
                    items={research.research.sentiment.praise}
                  />
                  <Sentlist
                    title="✗ Complaints"
                    cls="against"
                    items={research.research.sentiment.complaints}
                  />
                  <Sentlist
                    title="⚠ Known issues"
                    cls="against"
                    items={research.research.sentiment.known_issues}
                  />
                </div>
                {research.research.sentiment.forums?.length > 0 && (
                  <div className="lnks" style={{ marginTop: 10 }}>
                    {research.research.sentiment.forums
                      .slice(0, 8)
                      .map((s, i) => (
                        <a
                          key={s.url + i}
                          href={s.url}
                          target="_blank"
                          rel="noopener"
                        >
                          {hostOf(s.url)} ↗
                        </a>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <ResearchEmpty
                pending={researchPending}
                researched={researched}
                what="owner sentiment"
              />
            )}
          </>
        )}

        {tab === "costs" && (
          <>
            {research ? (
              <div className="msec">
                <SecHead>
                  💸 Buy-today → passage-ready refit (our estimate)
                </SecHead>
                <div className="refit-total">
                  {usd(research.scores.refit_projection.total_low_usd)} –{" "}
                  {usd(research.scores.refit_projection.total_high_usd)}
                  <span> all-in, on top of purchase</span>
                </div>
                <CostWaterfall
                  items={research.scores.refit_projection.by_item}
                  totalLow={research.scores.refit_projection.total_low_usd}
                  totalHigh={research.scores.refit_projection.total_high_usd}
                />
                <RangeBars
                  items={[...research.scores.refit_projection.by_item]
                    .sort((a, z) => z.high - a.high)
                    .map((d) => ({
                      label: d.system,
                      low: d.low,
                      high: d.high,
                      note: d.note,
                    }))}
                />
                <div className="note" style={{ marginTop: 10 }}>
                  <b>Assumptions:</b>{" "}
                  {research.scores.refit_projection.assumptions}
                </div>
              </div>
            ) : (
              <ResearchEmpty
                pending={researchPending}
                researched={researched}
                what="the refit projection"
              />
            )}
            <div className="msec">
              <SecHead>💵 Price detail</SecHead>
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
              <div className="note">{b.budgetText}</div>
            </div>
          </>
        )}

        {tab === "provisioning" && (
          <ProvisioningTab
            boat={b}
            research={research}
            researchPending={researchPending}
            researched={researched}
          />
        )}

        {tab === "evidence" && (
          <>
            {research ? (
              <div className="msec">
                <SecHead>
                  🔬 Cited evidence — {research.verify.cleaned_facts.length}{" "}
                  verified facts
                </SecHead>
                <div className="evidnote">
                  Every fact below was checked against its cited source.{" "}
                  <b>{research.verify.removed.length}</b> unsupported or
                  implausible claims were set aside, and{" "}
                  <b>{research.verify.fabrication_flags.length}</b> more were
                  withheld as unreliable — none of those are shown here.
                </div>
                {factGroups.map((g) => (
                  <div className="factgroup" key={g.label}>
                    <div className="factgroup-title">{g.label}</div>
                    {g.facts.map((f, i) => (
                      <FactRow key={f.key + i} f={f} />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <ResearchEmpty
                pending={researchPending}
                researched={researched}
                what="cited evidence"
              />
            )}
            {(b.awards?.length > 0 || (b.endorsements?.length || 0) > 0) && (
              <div className="msec">
                <SecHead>🏆 Awards &amp; expert take</SecHead>
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
              <SecHead>🔗 Sources &amp; further reading</SecHead>
              <div className="lnks">
                {b.sources.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener">
                    {s.name} ↗
                  </a>
                ))}
              </div>
            </div>
            {b.youtube?.length > 0 && (
              <div className="msec">
                <SecHead>▶ YouTube — owners &amp; reviews</SecHead>
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
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Sentlist({
  title,
  cls,
  items,
}: {
  title: string;
  cls: string;
  items: string[];
}) {
  if (!items?.length) return null;
  return (
    <div className={"sentlist " + cls}>
      <h4>{title}</h4>
      <ul>
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

function ResearchEmpty({
  pending,
  researched,
  what,
}: {
  pending: boolean;
  researched: boolean;
  what: string;
}) {
  return (
    <div className="research-empty">
      {pending
        ? `Loading ${what}…`
        : researched
          ? `Could not load ${what}.`
          : `Deep research for ${what} covers our top 15 boats — this one isn't in that set yet.`}
    </div>
  );
}

function OwnershipBlock({ boat: b }: { boat: ScoredBoat }) {
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
      <SecHead>🛠️ Ownership, support &amp; maintainability</SecHead>
      {risk && <div className="riskbanner">⚠ Support risk — {o.risks[0]}</div>}
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
      <div
        className="spectable detgrid"
        style={{ gridTemplateColumns: "1fr", marginTop: 12 }}
      >
        {det.map(([k, v]) => (
          <KV key={k} k={k} v={v} />
        ))}
      </div>
      {o.communities?.length > 0 && (
        <div className="lnks" style={{ marginTop: 12 }}>
          {o.communities.map((c) => (
            <a key={c.url} href={c.url} target="_blank" rel="noopener">
              {c.name} ↗
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function ProvisioningTab({
  boat: b,
  research,
  researchPending,
  researched,
}: {
  boat: ScoredBoat;
  research: BoatResearch | null;
  researchPending: boolean;
  researched: boolean;
}) {
  const [open, setOpen] = useState<string | null>(
    UNIVERSAL.categories[0]?.key ?? null,
  );
  const specific =
    research?.scores.provisioning_specific ??
    research?.research.provisioning_specific ??
    [];
  return (
    <>
      <div className="msec">
        <SecHead>🧰 Boat-specific spares — for {b.name}</SecHead>
        {research ? (
          specific.length ? (
            <div className="provspecific">
              {specific.map((p, i) => (
                <div className="provitem" key={i}>
                  <div className="provitem-head">
                    <b>{p.item}</b>
                    <span className="provcat">{p.category}</span>
                  </div>
                  <div className="provwhy">{p.why}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="research-empty">
              No boat-specific spares surfaced for this hull.
            </div>
          )
        ) : (
          <ResearchEmpty
            pending={researchPending}
            researched={researched}
            what="boat-specific spares"
          />
        )}
      </div>
      <div className="msec">
        <SecHead>⚓ Universal passage kit — every boat needs this</SecHead>
        <div className="provnote">
          Mission-tuned for 2 crew + 2 dogs, Patagonia → Polynesia. Tap a
          category.
        </div>
        <div className="provaccord">
          {UNIVERSAL.categories.map((c) => {
            const isOpen = open === c.key;
            return (
              <div
                className={"provcatblk" + (isOpen ? " open" : "")}
                key={c.key}
              >
                <button
                  className="provcatbtn"
                  onClick={() => setOpen(isOpen ? null : c.key)}
                  aria-expanded={isOpen}
                >
                  <span>{c.label}</span>
                  <span className="provcount">
                    {c.items.length} <i>{isOpen ? "▾" : "▸"}</i>
                  </span>
                </button>
                {isOpen && (
                  <div className="provcatbody">
                    <div className="provcatnote">{c.note}</div>
                    {c.items.map((it, i) => (
                      <div className={"provrow pr-" + it.priority} key={i}>
                        <span
                          className="provrow-pri"
                          title={UNIVERSAL.priority_key[it.priority]}
                        >
                          {it.priority === "essential"
                            ? "●"
                            : it.priority === "recommended"
                              ? "◐"
                              : "○"}
                        </span>
                        <span>
                          <b>{it.item}</b> — {it.why}
                          {it.spec && (
                            <span className="provspec"> {it.spec}</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
