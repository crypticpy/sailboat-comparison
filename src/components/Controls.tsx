import { usd } from "../lib/metrics";

export type SortKey =
  | "selection"
  | "fit"
  | "priceLow"
  | "priceHigh"
  | "draft"
  | "protection"
  | "handling"
  | "range"
  | "name";

export type ChipFilter =
  | "all"
  | "alu"
  | "grp"
  | "lift"
  | "pilot"
  | "budget"
  | "shoal"
  | "seakindly";

const CHIPS: [ChipFilter, string][] = [
  ["all", "All"],
  ["alu", "Aluminium hull"],
  ["grp", "GRP hull"],
  ["lift", "Lifting keel"],
  ["pilot", "Pilothouse/shelter"],
  ["budget", "Fits <$1M"],
  ["shoal", "Shoal draft"],
  ["seakindly", "Sea-kindly"],
];

const CATEGORIES = [
  "Aluminium expedition",
  "Centre-cockpit cruiser",
  "Deck-saloon & pilothouse",
  "Aft-cockpit bluewater",
];

export interface ControlsState {
  sort: SortKey;
  cat: string;
  maxPrice: number;
  query: string;
  chip: ChipFilter;
  favOnly: boolean;
  gridView: boolean;
}

interface Props {
  state: ControlsState;
  set: <K extends keyof ControlsState>(key: K, value: ControlsState[K]) => void;
  onReset: () => void;
}

const PRICE_MAX = 2000000;

export default function Controls({ state, set, onReset }: Props) {
  return (
    <div className="controls">
      <div className="wrap">
        <div className="row">
          <div className="fld">
            <label>Sort</label>
            <select
              value={state.sort}
              onChange={(e) => set("sort", e.target.value as SortKey)}
            >
              <option value="selection">Selection score (best first)</option>
              <option value="fit">Mission fit</option>
              <option value="priceLow">Price (low → high)</option>
              <option value="priceHigh">Price (high → low)</option>
              <option value="draft">Shoalest draft</option>
              <option value="protection">Most protected cockpit</option>
              <option value="handling">Easiest to handle</option>
              <option value="range">Most range/tankage</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>
          <div className="fld">
            <label>Type</label>
            <select
              value={state.cat}
              onChange={(e) => set("cat", e.target.value)}
            >
              <option value="all">All types</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="fld">
            <label>
              Max entry price{" "}
              <b style={{ color: "var(--teal)" }}>
                {state.maxPrice >= PRICE_MAX
                  ? "(any)"
                  : `≤ ${usd(state.maxPrice)}`}
              </b>
            </label>
            <input
              type="range"
              min={100000}
              max={PRICE_MAX}
              step={50000}
              value={state.maxPrice}
              onChange={(e) => set("maxPrice", +e.target.value)}
            />
          </div>
          <div className="fld">
            <label htmlFor="fleet-search">Search</label>
            <input
              id="fleet-search"
              type="search"
              placeholder="name, builder, keyword…  ( / )"
              value={state.query}
              onChange={(e) => set("query", e.target.value)}
            />
          </div>
          <div className="fld">
            <label>Quick filters</label>
            <div className="chips">
              {CHIPS.map(([f, label]) => (
                <span
                  key={f}
                  className={"chip" + (state.chip === f ? " active" : "")}
                  onClick={() => set("chip", f)}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="spacer" />
          <button
            className={"btn" + (state.favOnly ? " on" : "")}
            onClick={() => set("favOnly", !state.favOnly)}
          >
            ★ Favourites
          </button>
          <button className="btn ghost" onClick={onReset}>
            Reset
          </button>
          <div className="viewtoggle">
            <button
              className={state.gridView ? "active" : ""}
              onClick={() => set("gridView", true)}
            >
              Cards
            </button>
            <button
              className={!state.gridView ? "active" : ""}
              onClick={() => set("gridView", false)}
            >
              Table
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
