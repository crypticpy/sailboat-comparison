import type { ScoredBoat } from "../types/boat";
import { usd } from "../lib/metrics";
import { budgeClass, budgeLabel, headline } from "../lib/format";
import { Dots } from "../lib/svg";

export type TableSortKey =
  | "selection"
  | "category"
  | "material"
  | "cockpit"
  | "loaN"
  | "draftMinN"
  | "fuelN"
  | "waterN"
  | "rangeNm"
  | "protection"
  | "handling"
  | "priceMinUSD"
  | "budgetN";

const COLUMNS: [TableSortKey, string][] = [
  ["selection", "Boat / Score ▾"],
  ["category", "Type"],
  ["material", "Hull"],
  ["cockpit", "Cockpit"],
  ["loaN", "LOA"],
  ["draftMinN", "Draft"],
  ["fuelN", "Fuel"],
  ["waterN", "Water"],
  ["rangeNm", "Range"],
  ["protection", "Protect"],
  ["handling", "Easy"],
  ["priceMinUSD", "From"],
  ["budgetN", "Budget"],
];

interface Props {
  boats: ScoredBoat[];
  sortKey: TableSortKey;
  sortDir: number;
  onSort: (key: TableSortKey) => void;
  onOpen: (id: string) => void;
}

function sortValue(b: ScoredBoat, key: TableSortKey): number | string {
  if (key === "protection" || key === "handling") return b.scores[key];
  return (b as unknown as Record<string, number | string>)[key];
}

export default function BoatTable({
  boats,
  sortKey,
  sortDir,
  onSort,
  onOpen,
}: Props) {
  const list = [...boats].sort((a, b) => {
    const x = sortValue(a, sortKey);
    const y = sortValue(b, sortKey);
    if (typeof x === "string") return sortDir * x.localeCompare(y as string);
    return sortDir * ((x as number) - (y as number));
  });

  return (
    <div className="tablewrap">
      <table className="main">
        <thead>
          <tr>
            {COLUMNS.map(([k, label]) => (
              <th key={k} onClick={() => onSort(k)}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map((b) => (
            <tr key={b.id} onClick={() => onOpen(b.id)}>
              <td>
                <span className="nm">{b.name}</span>
                <br />
                <span
                  className="mini"
                  style={{ width: b.selection * 0.7, background: b.color }}
                />{" "}
                {b.selection}{" "}
                <span style={{ color: "#8aa" }}>· fit {b.missionFit}</span>
              </td>
              <td>{b.category}</td>
              <td>{b.material}</td>
              <td>{b.cockpitType}</td>
              <td>{headline(b.loa)}</td>
              <td>
                {headline(b.draftMin)}
                {b.draftMax !== b.draftMin ? "–" + headline(b.draftMax) : ""}
              </td>
              <td>{b.fuel.split(" / ")[0]}</td>
              <td>{b.water.split(" / ")[0]}</td>
              <td>~{b.rangeNm} nm</td>
              <td>
                <Dots n={b.scores.protection} />
              </td>
              <td>
                <Dots n={b.scores.handling} />
              </td>
              <td>{usd(b.priceMinUSD)}</td>
              <td>
                <span className={"budge " + budgeClass(b.budget)}>
                  {budgeLabel(b.budget)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
