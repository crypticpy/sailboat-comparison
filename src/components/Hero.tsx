import type { Boat } from "../types/boat";
import { isShelter } from "../lib/format";
import { usd } from "../lib/metrics";

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

export default function Hero({ boats }: { boats: Boat[] }) {
  const fitN = boats.filter((b) => b.budget === "fit").length;
  const minP = boats.length ? Math.min(...boats.map((b) => b.priceMinUSD)) : 0;
  const alu = boats.filter((b) =>
    b.material.toLowerCase().includes("alumin"),
  ).length;
  const sh = boats.filter(isShelter).length;

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
          <Stat n={String(boats.length)} label="boats compared" />
          <Stat n={String(fitN)} label="fit under $1M" />
          <Stat n={`from ${usd(minP)}`} label="cheapest entry" />
          <Stat n={String(alu)} label="aluminium hulls" />
          <Stat n={String(sh)} label="hard shelter / pilothouse" />
        </div>
      </div>
    </header>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="st">
      <b>{n}</b>
      <span>{label}</span>
    </div>
  );
}
