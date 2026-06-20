import type { Boat } from "../types/boat";
import { isShelter } from "../lib/format";
import { csf } from "../lib/metrics";
import type { ChipFilter } from "./Controls";

const numberWord = (n: number): string => {
  const words = [
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
    "Twenty",
    "Twenty-one",
    "Twenty-two",
    "Twenty-three",
    "Twenty-four",
    "Twenty-five",
    "Twenty-six",
    "Twenty-seven",
    "Twenty-eight",
    "Twenty-nine",
    "Thirty",
    "Thirty-one",
    "Thirty-two",
    "Thirty-three",
    "Thirty-four",
    "Thirty-five",
    "Thirty-six",
  ];
  return words[n] ?? String(n);
};

export default function Hero({
  boats,
  onPick,
}: {
  boats: Boat[];
  onPick?: (chip: ChipFilter) => void;
}) {
  // Mission-framed, all honestly derivable — no fabricated survival counts.
  const fitN = boats.filter((b) => b.budget === "fit").length;
  const sh = boats.filter(isShelter).length;
  const shoal = boats.filter((b) => b.draftMinN < 1.3).length;
  const seaKindly = boats.filter((b) => csf(b) < 1.9).length;

  return (
    <header className="hero">
      <div className="wrap">
        <h1>⛵ Bluewater Cruiser Comparison</h1>
        <div className="sub">
          {numberWord(boats.length)} serious offshore monohulls scored against
          one mission: a two-handed couple plus two dogs, a strongly protected
          cockpit, easy short-handed handling, a real workshop, long range — on
          a route from cold Patagonia &amp; Chile to the tropical Caribbean, BVI
          and French Polynesia. Budget: under <b>$1M</b> fully outfitted. Tune
          the priorities, compare boats side by side, and tap any card for the
          full profile.
        </div>
        <div className="statbar">
          <Stat
            n={String(boats.length)}
            label="boats compared"
            onPick={onPick}
            chip="all"
          />
          <Stat
            n={String(fitN)}
            label="fit under $1M"
            onPick={onPick}
            chip="budget"
          />
          <Stat
            n={String(sh)}
            label="steer from inside"
            onPick={onPick}
            chip="pilot"
          />
          <Stat
            n={String(shoal)}
            label="draw under 1.3 m"
            onPick={onPick}
            chip="shoal"
          />
          <Stat
            n={String(seaKindly)}
            label="capsize screen < 1.9"
            onPick={onPick}
            chip="seakindly"
          />
        </div>
      </div>
    </header>
  );
}

function Stat({
  n,
  label,
  onPick,
  chip,
}: {
  n: string;
  label: string;
  onPick?: (chip: ChipFilter) => void;
  chip: ChipFilter;
}) {
  if (!onPick) {
    return (
      <div className="st">
        <b>{n}</b>
        <span>{label}</span>
      </div>
    );
  }
  return (
    <button
      type="button"
      className="st st-click"
      onClick={() => onPick(chip)}
      title={`Filter the fleet — ${label}`}
    >
      <b>{n}</b>
      <span>{label}</span>
    </button>
  );
}
