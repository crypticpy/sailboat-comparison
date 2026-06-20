import type { ScoredBoat } from "../types/boat";
import { PILLARS, shade } from "../lib/metrics";
import { budgeClass, budgeLabel, headline } from "../lib/format";
import { Ring, BoatDeco } from "../lib/svg";

interface Props {
  boat: ScoredBoat;
  rank: number;
  fav: boolean;
  inCompare: boolean;
  onOpen: (id: string) => void;
  onToggleFav: (id: string) => void;
  onToggleCompare: (id: string) => void;
}

export function PillarBars({ boat }: { boat: ScoredBoat }) {
  return (
    <div className="pills">
      {PILLARS.map(([k, label, color]) => (
        <div className="pill" key={k}>
          <span className="pl">{label}</span>
          <span className="pt">
            <span
              className="pf"
              style={{ width: `${boat.pillars[k]}%`, background: color }}
            />
          </span>
          <span className="pv">{boat.pillars[k]}</span>
        </div>
      ))}
    </div>
  );
}

export default function BoatCard({
  boat: b,
  rank,
  fav,
  inCompare,
  onOpen,
  onToggleFav,
  onToggleCompare,
}: Props) {
  const supportRisk =
    b.own && (b.own.scores.community <= 2 || b.own.scores.parts <= 2);
  return (
    <div className="card" onClick={() => onOpen(b.id)}>
      <div
        className="top"
        style={{
          background: `linear-gradient(135deg,${b.color},${shade(b.color, -18)})`,
        }}
      >
        <BoatDeco />
        <div className="rank">{rank}</div>
        <button
          className={"star" + (fav ? " fav" : "")}
          title="Shortlist"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav(b.id);
          }}
        >
          {fav ? "★" : "☆"}
        </button>
        <h3 className="name">{b.name}</h3>
        <div className="builder">
          {b.builder} · {b.years}
        </div>
      </div>
      <div className="body">
        <div className="fit">
          <div>
            <Ring pct={b.selection} color={b.color} />
          </div>
          <div>
            <div className="fitlabel">Selection score</div>
            <div className="fitval">{b.selection}/100</div>
            <span className={"budge " + budgeClass(b.budget)}>
              {budgeLabel(b.budget)}
            </span>
          </div>
        </div>
        <PillarBars boat={b} />
        <div>
          <span className="badgeCat">{b.category}</span>
          {b.badge && <span className="badgeAward">{b.badge}</span>}
          {supportRisk && (
            <span
              className="badgeAward"
              style={{
                background: "#fbe6e0",
                color: "#a3331c",
                borderColor: "#f3cabc",
              }}
            >
              ⚠ support risk
            </span>
          )}
        </div>
        <div className="cardbest">“{b.bestFor}”</div>
        <div className="specrow">
          <span className="s">
            <b>LOA</b> {headline(b.loa)}
          </span>
          <span className="s">
            <b>Draft</b> {headline(b.draftMin)}
            {b.draftMax !== b.draftMin ? "–" + headline(b.draftMax) : ""}
          </span>
          <span className="s">
            <b>Hull</b> {b.material}
          </span>
          <span className="s">
            <b>Cockpit</b> {b.cockpitType}
          </span>
          <span className="s">
            <b>Range</b> ~{b.rangeNm} nm
          </span>
        </div>
        <div className="tags">
          {b.tags.map((t) => (
            <span
              key={t}
              className={
                "tag" +
                (/over budget|two generations|tight/i.test(t) ? " warnt" : "")
              }
            >
              {t}
            </span>
          ))}
        </div>
        <div className="cardfoot">
          <span className="pricep">
            💵 <b>{b.priceText}</b>
          </span>
          <button
            className={"cmpadd" + (inCompare ? " in" : "")}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(b.id);
            }}
          >
            {inCompare ? "✓ comparing" : "+ compare"}
          </button>
        </div>
      </div>
    </div>
  );
}
