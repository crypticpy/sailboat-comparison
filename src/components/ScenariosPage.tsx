// The decision scenarios at /scenarios — the same question the buyer keeps
// asking, answered three ways by budget. Each tier is a curated, honest shortlist
// (not the whole fleet) with a thesis and a plain caveat about what the money
// really buys, then the existing decision board (radar + side-by-side table) is
// opened preloaded with that tier's roster. Editorial picks and one-liners are
// judgements in the site's voice — no fabricated specs, prices or scores.
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Boat, ScoredBoat } from "../types/boat";
import { loadBoats } from "../lib/data";
import {
  BASE_WEIGHTS,
  BASE_PILLAR_WEIGHTS,
  scoreBoat,
  loaFt,
  selectionTier,
} from "../lib/metrics";
import { headline } from "../lib/format";
import { researchOf } from "../lib/research";
import CompareModal from "./CompareModal";

// ── the three budget scenarios ───────────────────────────────────────────────
// Rosters are curated to the user's real mission: a last boat, liveaboard home
// for a couple, go-anywhere-but-not-polar. Each `why` is honest editorial — the
// facts it leans on (e.g. Lifexplorer's 80°N→62°S decade, the Amel's deck-stepped
// in-mast rig) are already verified in those boats' dossiers.
interface TierBoat {
  id: string;
  why: string;
}
interface Tier {
  key: string;
  ceiling: string;
  scenario: string;
  title: string;
  thesis: string;
  caveat: string;
  roster: TierBoat[];
}

const TIERS: Tier[] = [
  {
    key: "budget",
    ceiling: "Up to $500k",
    scenario: "Scenario 1",
    title: "The realistic budget",
    thesis:
      "What you can actually buy today without an inheritance — proven, used production and semi-custom bluewater boats that will still take a couple safely across an ocean. You trade some new-boat polish and the lightest alloy expedition pedigree for a home you can own outright now.",
    caveat:
      "These are mid-2026 used ranges. The blue-chip names here reach the bottom of the bracket only as earlier or higher-hours hulls — a well-found one of several is really a next-tier boat.",
    roster: [
      {
        id: "ip485",
        why: "The value anchor — a foam-cored, beamy liveaboard that forgives almost everything. Slow and no light-air flyer, but the most boat-and-home per dollar in the bracket, and built to keep going.",
      },
      {
        id: "oyster485",
        why: "Blue-chip British pedigree that sits entirely inside budget — a properly engineered centre-cockpit ocean cruiser with the volume and tankage to grow old aboard.",
      },
      {
        id: "tayana58",
        why: "Pilothouse warmth and serious volume for the money — an inside steering station that earns its keep the moment the trip turns cold or wet, which a go-anywhere couple will want.",
      },
      {
        id: "discovery55",
        why: "A genuine go-anywhere semi-custom — but only earlier, higher-hours hulls reach this floor; a well-found one is $600k+. Included here as the stretch ceiling, honestly flagged.",
      },
    ],
  },
  {
    key: "high",
    ceiling: "Up to $1M",
    scenario: "Scenario 2",
    title: "The high range — the expedition shortlist",
    thesis:
      "The boats this whole search has been circling: aluminium-hulled, centreboard-or-shoal, keel-stepped and slab-reefed, built to take the ground, dry out upright and head for high latitudes. This is the tier where capability and a last-boat build quality meet a price a serious buyer can still reach.",
    caveat:
      "Used entry points, not list prices. A new Garcia 45 is over $1M; brokerage examples start near $700k. The Sirius is the smallest here — its price buys craftsmanship over length, and no ~50ft Sirius exists.",
    roster: [
      {
        id: "garcia",
        why: "The expedition benchmark — alloy hull, lifting centreboard, keel-stepped slab-reefed rig, the redundancy the Amel gave you pause over. Used hulls start near $700k; a new one tips into the next tier.",
      },
      {
        id: "boreal",
        why: "The hand-built alternative to the Garcia — the same go-anywhere alloy-and-centreboard formula with arguably finer detailing, and squarely inside $1M on the used market.",
      },
      {
        id: "sirius40ds",
        why: "The smallest of the shortlist but the most finely finished — German deck-saloon, Category A, sea-kindly to the point of stout (heeled 15° under bare poles in a 30-kn squall). You buy build quality, not length.",
      },
      {
        id: "allures",
        why: "The natural fourth — a French alloy-hull centreboard cruiser that cross-shops directly against the Garcia and Boréal for less money, trading a little polar pedigree for value.",
      },
    ],
  },
  {
    key: "ultimate",
    ceiling: "$1M and up",
    scenario: "Scenario 3",
    title: "The inheritance range — the ultimate",
    thesis:
      "If the budget were never the constraint: the 50-plus-footers that are a true ship for two, with the volume to live aboard indefinitely and the build to go almost anywhere sane. This is the one-shot, best-boat tier — and the place to be most honest that 'best' depends entirely on where you actually point the bow.",
    caveat:
      "The line between this tier and the last is blurry by design — the Boréal 52's entry dips just under $1M, the Amel 50's floor is near $900k. The point of the tier is the ceiling, not the floor.",
    roster: [
      {
        id: "garcia52",
        why: "The Garcia scaled to a true ship for two — a decade from Svalbard (80°N) to the Antarctic Peninsula (62°S) aboard 'Lifexplorer' is the proof. Capability and sea-kindliness over outright speed.",
      },
      {
        id: "boreal52",
        why: "The Boréal grown to liveaboard volume without losing the beach-it-anywhere alloy hull — surprisingly nimble at ~18 tonnes. Entry dips just under $1M; a well-found one is over.",
      },
      {
        id: "amel",
        why: "The comfort-first flagship — enclosed cockpit, legendary systems integration, the boat that argues capability isn't only an aluminium hull. The trade for that ease is the deck-stepped rig and in-mast furling you flagged.",
      },
      {
        id: "oyster",
        why: "A different philosophy at the top — British blue-chip cruising rather than an alloy expedition boat. Here as the reminder that the 'best' last boat is the one matched to your real route, not the toughest hull on paper.",
      },
    ],
  },
];

const money0 = (n: number): string => "$" + Math.round(n / 1000) + "k";

export default function ScenariosPage() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [openTier, setOpenTier] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadBoats().then((r) => setBoats(r.boats));
  }, []);
  useEffect(() => {
    document.title = "Decision scenarios — three budgets, three shortlists";
    return () => {
      document.title = "Bluewater Sailboat Comparison — Patagonia to Polynesia";
    };
  }, []);

  // Score every boat once with the site's default weight blends, then index by
  // id so each tier roster resolves to the same ScoredBoat the home grid shows.
  const byId = useMemo(() => {
    const m = new Map<string, ScoredBoat>();
    for (const b of boats)
      m.set(b.id, scoreBoat(b, BASE_WEIGHTS, BASE_PILLAR_WEIGHTS));
    return m;
  }, [boats]);

  const rosterOf = (t: Tier): ScoredBoat[] =>
    t.roster.map((r) => byId.get(r.id)).filter((b): b is ScoredBoat => !!b);

  const openRoster =
    openTier != null ? rosterOf(TIERS.find((t) => t.key === openTier)!) : [];

  return (
    <div className="budget scn">
      <div className="report-top no-print">
        <div className="wrap report-topin">
          <Link to="/" className="backlink">
            ← Back to the fleet
          </Link>
          <Link to="/budget" className="hero-navlink">
            🧮 Plan the money →
          </Link>
        </div>
      </div>

      <header className="budget-hero">
        <div className="wrap">
          <div className="budget-eyebrow">Decision scenarios</div>
          <h1>Three budgets, three shortlists</h1>
          <p className="budget-sub">
            The same question — one last boat, a liveaboard home for two,
            capable of going almost anywhere sane but not the poles — answered
            three ways by what you can spend. Each tier is a curated shortlist,
            not the whole fleet, with an honest note on what the money really
            buys. Open any tier on the decision board to see the boats head to
            head.
          </p>
        </div>
      </header>

      <main className="wrap budget-main scn-main">
        {TIERS.map((t) => {
          const roster = rosterOf(t);
          const lo = Math.min(...roster.map((b) => b.priceMinUSD));
          const hi = Math.max(...roster.map((b) => b.priceMaxUSD));
          return (
            <section className="scn-tier" key={t.key}>
              <div className="scn-tier-head">
                <div className="scn-tier-headl">
                  <div className="scn-scenario">{t.scenario}</div>
                  <h2>
                    <span className="scn-ceiling">{t.ceiling}</span>
                    {t.title}
                  </h2>
                  <p className="scn-thesis">{t.thesis}</p>
                </div>
                <div className="scn-tier-acts">
                  <span className="scn-span">
                    {roster.length} boats · {money0(lo)}–{money0(hi)}
                  </span>
                  <button
                    className="scn-board-btn"
                    onClick={() => setOpenTier(t.key)}
                  >
                    ⚖️ Open the decision board
                  </button>
                </div>
              </div>

              <div className="scn-roster">
                {t.roster.map((r) => {
                  const b = byId.get(r.id);
                  if (!b) return null;
                  const tier = selectionTier(b.selection);
                  return (
                    <article className="scn-card" key={r.id}>
                      <div className="scn-card-top">
                        <Link to={`/boat/${b.id}`} className="scn-card-name">
                          {b.name}
                        </Link>
                        {researchOf(b.id) && (
                          <span
                            className="scn-pill"
                            title="Has a deep research dossier on this site"
                          >
                            deep dossier
                          </span>
                        )}
                      </div>
                      <div className="scn-card-meta">
                        <span className="scn-price">{b.priceText}</span>
                        <span>{Math.round(loaFt(b))}′ LOA</span>
                        <span>{headline(b.category)}</span>
                        <span>{b.material}</span>
                      </div>
                      <div className="scn-card-scores">
                        <span className={"scn-score scn-" + tier.cls}>
                          {b.selection}
                          <i>selection · {tier.word}</i>
                        </span>
                        <span className="scn-score scn-mission">
                          {b.missionFit}
                          <i>mission fit</i>
                        </span>
                      </div>
                      <p className="scn-why">{r.why}</p>
                      <Link to={`/boat/${b.id}`} className="scn-card-link">
                        Full dossier →
                      </Link>
                    </article>
                  );
                })}
              </div>

              <p className="scn-caveat">
                <b>Honest note:</b> {t.caveat}
              </p>
            </section>
          );
        })}

        <p className="budget-foot">
          Curated shortlists and editorial judgements — a starting point for
          your own sea-trials and surveys, not a buy list. Prices are
          approximate mid-2026 used USD ranges that move with the market. Want
          the real all-in numbers on any of these?{" "}
          <Link to="/budget" className="scn-inline-link">
            Take one to the planning deck →
          </Link>
        </p>
      </main>

      {openTier && openRoster.length > 0 && (
        <CompareModal
          boats={openRoster}
          onClose={() => setOpenTier(null)}
          onClear={() => setOpenTier(null)}
          onOpenBoat={(id) => navigate(`/boat/${id}`)}
        />
      )}
    </div>
  );
}
