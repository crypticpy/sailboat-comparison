// The Control Deck — one segmented instrument that replaces the old stack of five
// collapsible panels. A single active segment shows at a time (Weighting · Priorities
// · Overview · Insights), so the page opens calm instead of as a wall of disclosure.
import { useState, type Dispatch, type SetStateAction } from "react";
import {
  DIMS,
  PILLARS,
  BASE_WEIGHTS,
  BASE_PILLAR_WEIGHTS,
  type Weights,
  type PillarWeights,
  type DimKey,
  type PillarKey,
} from "../lib/metrics";
import type { ScoredBoat } from "../types/boat";
import WeightSliders from "./WeightSliders";
import ScatterPlot from "./ScatterPlot";
import { CaptainsPanelBody, ObscurePanelBody } from "./EditorialPanels";

type Seg = "weighting" | "priorities" | "overview" | "insights";

const SEGS: { key: Seg; icon: string; label: string; hint: string }[] = [
  {
    key: "weighting",
    icon: "🎯",
    label: "Weighting",
    hint: "Blend Mission fit, Seaworthiness, Ownership & Value into one Selection score.",
  },
  {
    key: "priorities",
    icon: "⚙️",
    label: "Priorities",
    hint: "Re-weight the nine mission factors — fit scores and ranking update live.",
  },
  {
    key: "overview",
    icon: "📊",
    label: "Overview",
    hint: "Every boat as price vs Selection score. Tap a dot to open its dossier.",
  },
  {
    key: "insights",
    icon: "🧭",
    label: "Insights",
    hint: "The captain's cross-fleet read, plus the panel's debate on obscure options.",
  },
];

interface Props {
  pillarWeights: PillarWeights;
  setPillarWeights: Dispatch<SetStateAction<PillarWeights>>;
  weights: Weights;
  setWeights: Dispatch<SetStateAction<Weights>>;
  scatterBoats: ScoredBoat[];
  onOpen: (id: string) => void;
}

export default function ControlDeck({
  pillarWeights,
  setPillarWeights,
  weights,
  setWeights,
  scatterBoats,
  onOpen,
}: Props) {
  const [seg, setSeg] = useState<Seg>("weighting");
  const active = SEGS.find((s) => s.key === seg)!;

  return (
    <section className="deck" aria-label="Control deck">
      <div
        className="deck-seg"
        role="tablist"
        aria-label="Control deck sections"
      >
        {SEGS.map((s) => (
          <button
            key={s.key}
            role="tab"
            aria-selected={seg === s.key}
            className={"deck-segbtn" + (seg === s.key ? " on" : "")}
            onClick={() => setSeg(s.key)}
          >
            <span className="deck-segico" aria-hidden="true">
              {s.icon}
            </span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
      <div className="deck-hint">{active.hint}</div>

      <div className="deck-body" role="tabpanel">
        {seg === "weighting" && (
          <WeightSliders<PillarKey>
            dims={PILLARS}
            weights={pillarWeights}
            onChange={(k, v) => setPillarWeights((w) => ({ ...w, [k]: v }))}
            onReset={() => setPillarWeights({ ...BASE_PILLAR_WEIGHTS })}
            resetLabel="Reset to recommended"
            note="Recommended blend reflects an experienced skipper with a first-time crew aboard."
            min={0}
            max={2}
            step={0.1}
          />
        )}
        {seg === "priorities" && (
          <WeightSliders<DimKey>
            dims={DIMS}
            weights={weights}
            onChange={(k, v) => setWeights((w) => ({ ...w, [k]: v }))}
            onReset={() => setWeights({ ...BASE_WEIGHTS })}
            resetLabel="Reset to mission defaults"
            min={0}
            max={3}
            step={0.25}
          />
        )}
        {seg === "overview" && (
          <ScatterPlot boats={scatterBoats} onOpen={onOpen} />
        )}
        {seg === "insights" && (
          <div className="deck-insights">
            <CaptainsPanelBody />
            <ObscurePanelBody />
          </div>
        )}
      </div>
    </section>
  );
}
