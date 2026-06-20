import type { ScoredBoat } from "../types/boat";
import {
  catColor,
  csf,
  mrate,
  selectionTier,
  topWeightedDims,
  waterDays,
  type Weights,
} from "../lib/metrics";
import { budgeClass, budgeLabel, headline, isShelter } from "../lib/format";
import { marketLinks } from "../lib/market";
import { Ring } from "../lib/svg";

interface Props {
  boat: ScoredBoat;
  rank: number;
  weights: Weights;
  fav: boolean;
  inCompare: boolean;
  hasNote?: boolean;
  onOpen: (id: string) => void;
  onToggleFav: (id: string) => void;
  onToggleCompare: (id: string) => void;
}

const CSF_WORD: Record<string, string> = {
  g: "Sea-kindly",
  y: "Moderate",
  o: "Lively",
  r: "Stiff",
  n: "—",
};
const catShort = (cat: string) =>
  cat.replace(/ (cruiser|bluewater|expedition)$/i, "");

export default function BoatCard({
  boat: b,
  rank,
  weights,
  fav,
  inCompare,
  hasNote,
  onOpen,
  onToggleFav,
  onToggleCompare,
}: Props) {
  const hue = catColor(b);
  const tier = selectionTier(b.selection);
  const why = topWeightedDims(weights, b.scores, 3);
  const csfCls = mrate(b, "csf");
  const shelter = isShelter(b);

  return (
    <div
      className="card"
      tabIndex={0}
      role="button"
      aria-label={`${b.name} — selection score ${b.selection} of 100, ${tier.word}. Open full profile.`}
      onClick={() => onOpen(b.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(b.id);
        }
      }}
    >
      <div className="top" style={{ borderTopColor: hue }}>
        <span className="cat-tag" style={{ color: hue }}>
          {catShort(b.category)}
        </span>
        <div className="rank" aria-label={`rank ${rank}`}>
          {rank}
        </div>
        <button
          className={"star" + (fav ? " fav" : "")}
          aria-pressed={fav}
          aria-label={fav ? "Remove from shortlist" : "Add to shortlist"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav(b.id);
          }}
        >
          {fav ? "★" : "☆"}
        </button>
        {hasNote && (
          <span
            className="notemark"
            title="You have a private note on this boat"
            aria-label="Has a personal note"
          >
            ✎
          </span>
        )}
        <h3 className="name">{b.name}</h3>
        <div className="builder">
          {b.builder} · {b.years}
        </div>
      </div>

      <div className="body">
        <div className="fit">
          <Ring pct={b.selection} />
          <div>
            <div className="fitlabel">Selection</div>
            <div className="fitval">
              {b.selection}
              <span
                className={"tierword cw " + tier.cls}
                style={{ border: 0, background: "transparent", padding: 0 }}
              >
                {tier.word}
              </span>
            </div>
            <span className={"budge " + budgeClass(b.budget)}>
              {budgeLabel(b.budget)}
            </span>
          </div>
        </div>

        <div className="whyfit">
          {why.length ? (
            why.map((d) => (
              <span
                className="whychip"
                key={d.key}
                title={`Strong on ${d.label} (${d.score}/5) — and you weighted it highly`}
              >
                {d.label}
              </span>
            ))
          ) : (
            <span className="whynone">
              Balanced all-rounder — no standout strength for your current
              weighting
            </span>
          )}
        </div>

        <div className="hwmini">
          <span className="hw">
            <span className="lab">Capsize</span>
            <span
              className={"val cw " + csfCls}
              style={{ border: 0, background: "transparent", padding: 0 }}
            >
              {csf(b).toFixed(2)} · {CSF_WORD[csfCls]}
            </span>
          </span>
          <span className="hw">
            <span className="lab">Helm</span>
            <span
              className="val"
              style={{ color: shelter ? "var(--good)" : "var(--neutral)" }}
            >
              {shelter ? "Inside / sheltered" : "Exposed"}
            </span>
          </span>
        </div>

        <div className="specrow">
          <span className="s">
            <b>LOA</b>
            {headline(b.loa)}
          </span>
          <span className="s">
            <b>Draft</b>
            {headline(b.draftMin)}
            {b.draftMax !== b.draftMin ? "–" + headline(b.draftMax) : ""}
          </span>
          <span className="s">
            <b>Range</b>~{b.rangeNm} nm
          </span>
          <span className="s">
            <b>Water</b>~{waterDays(b)} days
          </span>
        </div>

        <div className="cardfoot">
          <span className="pricep">
            <b>{b.priceText}</b>
          </span>
          <button
            className={"cmpadd" + (inCompare ? " in" : "")}
            aria-pressed={inCompare}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(b.id);
            }}
          >
            {inCompare ? "✓ comparing" : "+ compare"}
          </button>
        </div>

        <div className="marketrow" onClick={(e) => e.stopPropagation()}>
          <span className="marketlab" title="See what's currently for sale">
            ⚓ For sale
          </span>
          {marketLinks(b).map((m) => (
            <a
              key={m.host}
              className="marketlink"
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`Search current ${b.name} listings — ${m.label}`}
            >
              {m.label}
              <span aria-hidden="true"> ↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
