// Dedicated, shareable report page at /boat/:id. Loads the fleet + this boat's deep
// research, then renders the SAME <BoatDossier> the modal uses — but full-page, with a
// proper header and the binnacle selection gauge. Direct links survive a hard refresh
// on GitHub Pages via the public/404.html SPA redirect.
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Boat, ScoredBoat } from "../types/boat";
import { loadBoats } from "../lib/data";
import {
  BASE_WEIGHTS,
  BASE_PILLAR_WEIGHTS,
  catColor,
  fleetMedians,
  scoreBoat,
} from "../lib/metrics";
import { Ring } from "../lib/svg";
import { hasResearch, loadResearch } from "../lib/research";
import type { BoatResearch } from "../types/research";
import BoatDossier from "./BoatDossier";

export default function ReportPage() {
  const { id } = useParams();
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [research, setResearch] = useState<BoatResearch | null>(null);
  const [rLoading, setRLoading] = useState(false);

  const researched = id ? hasResearch(id) : false;

  useEffect(() => {
    loadBoats().then((r) => {
      setBoats(r.boats);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let alive = true;
    if (!id || !researched) {
      setResearch(null);
      setRLoading(false);
      return;
    }
    setRLoading(true);
    loadResearch(id).then((r) => {
      if (alive) {
        setResearch(r);
        setRLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [id, researched]);

  const scored = useMemo<ScoredBoat[]>(
    () => boats.map((b) => scoreBoat(b, BASE_WEIGHTS, BASE_PILLAR_WEIGHTS)),
    [boats],
  );
  const medians = useMemo(() => fleetMedians(boats), [boats]);
  const boat = id ? (scored.find((b) => b.id === id) ?? null) : null;

  useEffect(() => {
    if (boat) document.title = `${boat.name} — Bluewater report`;
    return () => {
      document.title = "Bluewater Sailboat Comparison — Patagonia to Polynesia";
    };
  }, [boat]);

  if (loading) return <div className="loading">Loading the report…</div>;

  if (!boat)
    return (
      <div className="report">
        <div className="report-top">
          <div className="wrap report-topin">
            <Link to="/" className="backlink">
              ← Back to the fleet
            </Link>
          </div>
        </div>
        <div className="wrap" style={{ padding: "40px 0" }}>
          <p>
            That boat isn't in the fleet.{" "}
            <Link to="/">Return to the comparison.</Link>
          </p>
        </div>
      </div>
    );

  const hue = catColor(boat);
  return (
    <div className="report">
      <div className="report-top">
        <div className="wrap report-topin">
          <Link to="/" className="backlink">
            ← Back to the fleet
          </Link>
          {researched && <span className="research-pill">Deep research</span>}
        </div>
      </div>
      <header className="report-hero" style={{ borderTop: `4px solid ${hue}` }}>
        <div className="wrap report-heroin">
          <div className="report-id">
            <div className="report-eyebrow">{boat.category}</div>
            <h1>{boat.name}</h1>
            <div className="report-meta">
              {boat.builder} · {boat.designer} · {boat.years} ·{" "}
              <b>{boat.priceText}</b>
            </div>
            <p className="report-verdict">{boat.bestFor}</p>
          </div>
          <div className="report-score">
            <Ring pct={boat.selection} />
            <span>Selection score</span>
          </div>
        </div>
      </header>
      <main className="wrap report-main">
        <BoatDossier
          boat={boat}
          research={research}
          researchLoading={rLoading}
          researched={researched}
          pillarWeights={BASE_PILLAR_WEIGHTS}
          medians={medians}
        />
      </main>
    </div>
  );
}
