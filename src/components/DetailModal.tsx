// Thin modal shell around the shared <BoatDossier>. The heavy, research-rich,
// tabbed content lives in BoatDossier (reused verbatim by the /boat/:id report page);
// here we own only the overlay, the header, escape-to-close, body-scroll lock, and
// the lazy fetch of this boat's deep-research record.
import { useEffect, useState } from "react";
import type { ScoredBoat } from "../types/boat";
import type { DimKey, PillarWeights } from "../lib/metrics";
import { catColor } from "../lib/metrics";
import type { BoatResearch } from "../types/research";
import { hasResearch, loadResearch } from "../lib/research";
import BoatDossier from "./BoatDossier";

interface Props {
  boat: ScoredBoat;
  pillarWeights: PillarWeights;
  medians: Record<DimKey, number>;
  onClose: () => void;
}

export default function DetailModal({
  boat: b,
  pillarWeights: pw,
  medians,
  onClose,
}: Props) {
  const researched = hasResearch(b.id);
  const [research, setResearch] = useState<BoatResearch | null>(null);
  const [loading, setLoading] = useState(researched);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    let alive = true;
    if (!researched) {
      setResearch(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    loadResearch(b.id).then((r) => {
      if (alive) {
        setResearch(r);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [b.id, researched]);

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
            borderTop: `3px solid ${catColor(b)}`,
          }}
        >
          <button className="close" onClick={onClose} aria-label="Close">
            ×
          </button>
          <h2>{b.name}</h2>
          <div className="mb">
            {b.builder} · {b.designer} · {b.years} · <b>{b.priceText}</b>
            {researched && <span className="research-pill">Deep research</span>}
            <a
              className="report-link"
              href={`${import.meta.env.BASE_URL}boat/${b.id}`}
              target="_blank"
              rel="noopener"
            >
              Open full report ↗
            </a>
          </div>
        </div>
        <div className="mbody">
          <BoatDossier
            boat={b}
            research={research}
            researchLoading={loading}
            researched={researched}
            pillarWeights={pw}
            medians={medians}
          />
        </div>
      </div>
    </div>
  );
}
