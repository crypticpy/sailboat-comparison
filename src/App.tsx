import { useEffect, useMemo, useState, useCallback } from "react";
import type { Boat, ScoredBoat } from "./types/boat";
import { loadBoats } from "./lib/data";
import {
  BASE_WEIGHTS,
  BASE_PILLAR_WEIGHTS,
  DIMS,
  PILLARS,
  fleetMedians,
  scoreBoat,
  type Weights,
  type PillarWeights,
  type DimKey,
  type PillarKey,
} from "./lib/metrics";
import { isShelter } from "./lib/format";
import Hero from "./components/Hero";
import Controls, {
  type ControlsState,
  type SortKey,
} from "./components/Controls";
import Panel from "./components/Panel";
import WeightSliders from "./components/WeightSliders";
import ScatterPlot from "./components/ScatterPlot";
import {
  CaptainsPanelBody,
  ObscurePanelBody,
} from "./components/EditorialPanels";
import BoatCard from "./components/BoatCard";
import BoatTable, { type TableSortKey } from "./components/BoatTable";
import DetailModal from "./components/DetailModal";
import CompareModal from "./components/CompareModal";

const PRICE_MAX = 2000000;
const FAV_KEY = "sailfav19";

const DISCLAIMER =
  "Scores are editorial judgements synthesised from builder data, magazine reviews (Yachting World, SAIL, Cruising World, Yachting Monthly, Practical Sailor), SailboatData, the Attainable Adventure Cruising archive and live brokerage listings — a starting point for your own sea-trials and surveys, not gospel. Prices are approximate USD ranges as of mid-2026 and move with the market and exchange rates; several models are sold in euros. Comfort ratio and capsize screening are computed from each boat’s displacement, beam and waterline, using a representative displacement (light or loaded), so treat them as indicative. Always confirm specs, draft options and outfitting on the specific hull you’re considering. The headline Selection score is a tunable weighted average of four pillars — Mission fit, Seaworthiness, Ownership & support, and Value — so an experienced skipper can balance raw suitability against safety, maintainability and price for a first-time crew. Motoring range is computed from fuel capacity AND installed-engine size/efficiency (≈ hp × 0.065 L/hr at an economical-cruise speed of ~0.82× hull speed).";

function loadFavs(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export default function App() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"supabase" | "fallback">("fallback");

  const [weights, setWeights] = useState<Weights>({ ...BASE_WEIGHTS });
  const [pillarWeights, setPillarWeights] = useState<PillarWeights>({
    ...BASE_PILLAR_WEIGHTS,
  });

  const [ctrl, setCtrl] = useState<ControlsState>({
    sort: "selection",
    cat: "all",
    maxPrice: PRICE_MAX,
    query: "",
    chip: "all",
    favOnly: false,
    gridView: true,
  });
  const [tableSortKey, setTableSortKey] = useState<TableSortKey>("selection");
  const [tableSortDir, setTableSortDir] = useState(-1);

  const [favs, setFavs] = useState<Set<string>>(() => loadFavs());
  const [compareSet, setCompareSet] = useState<Set<string>>(new Set());
  const [modalId, setModalId] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    loadBoats().then((r) => {
      setBoats(r.boats);
      setSource(r.source);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
    } catch {
      /* ignore */
    }
  }, [favs]);

  // Re-score whenever data or either weight blend changes.
  const scored = useMemo<ScoredBoat[]>(
    () => boats.map((b) => scoreBoat(b, weights, pillarWeights)),
    [boats, weights, pillarWeights],
  );

  // Fleet-median per mission dim — the reference tick on the detail tier bars.
  const medians = useMemo(() => fleetMedians(boats), [boats]);

  const setControl = useCallback(
    <K extends keyof ControlsState>(key: K, value: ControlsState[K]) => {
      setCtrl((c) => ({ ...c, [key]: value }));
    },
    [],
  );

  const passesFilter = useCallback(
    (b: ScoredBoat) => {
      const { query, cat, maxPrice, favOnly, chip } = ctrl;
      if (query) {
        const q = query.trim().toLowerCase();
        const hay = (
          b.name +
          " " +
          b.builder +
          " " +
          b.tags.join(" ") +
          " " +
          b.cockpitType +
          " " +
          b.material +
          " " +
          b.bestFor +
          " " +
          b.category
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (cat !== "all" && b.category !== cat) return false;
      if (b.priceMinUSD > maxPrice) return false;
      if (favOnly && !favs.has(b.id)) return false;
      switch (chip) {
        case "alu":
          return b.material.toLowerCase().includes("alumin");
        case "grp":
          return b.material.toLowerCase().startsWith("grp");
        case "lift":
          return /centreboard|lifting|board/i.test(b.keel);
        case "pilot":
          return isShelter(b);
        case "budget":
          return b.budget === "fit";
        default:
          return true;
      }
    },
    [ctrl, favs],
  );

  const filtered = useMemo(
    () => scored.filter(passesFilter),
    [scored, passesFilter],
  );

  const gridList = useMemo(() => {
    const s = [...filtered];
    const key: SortKey = ctrl.sort;
    s.sort((a, b) => {
      switch (key) {
        case "priceLow":
          return a.priceMinUSD - b.priceMinUSD;
        case "priceHigh":
          return b.priceMinUSD - a.priceMinUSD;
        case "draft":
          return a.draftMinN - b.draftMinN;
        case "protection":
          return b.scores.protection - a.scores.protection;
        case "handling":
          return b.scores.handling - a.scores.handling;
        case "range":
          return b.fuelN + b.waterN - (a.fuelN + a.waterN);
        case "name":
          return a.name.localeCompare(b.name);
        case "fit":
          return b.missionFit - a.missionFit;
        default:
          return b.selection - a.selection || b.missionFit - a.missionFit;
      }
    });
    return s;
  }, [filtered, ctrl.sort]);

  const onToggleFav = useCallback((id: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const onToggleCompare = useCallback((id: string) => {
    setCompareSet((prev) => {
      if (prev.has(id)) {
        const next = new Set(prev);
        next.delete(id);
        return next;
      }
      if (prev.size >= 4) {
        alert("Compare up to 4 boats at once.");
        return prev;
      }
      return new Set(prev).add(id);
    });
  }, []);

  const onTableSort = useCallback(
    (k: TableSortKey) => {
      if (tableSortKey === k) setTableSortDir((d) => d * -1);
      else {
        setTableSortKey(k);
        setTableSortDir(
          k === "material" || k === "cockpit" || k === "category" ? 1 : -1,
        );
      }
    },
    [tableSortKey],
  );

  const resetAll = useCallback(() => {
    setCtrl((c) => ({
      ...c,
      sort: "fit",
      cat: "all",
      query: "",
      maxPrice: PRICE_MAX,
      favOnly: false,
      chip: "all",
    }));
  }, []);

  const modalBoat = modalId
    ? (scored.find((b) => b.id === modalId) ?? null)
    : null;
  const compareBoats = scored.filter((b) => compareSet.has(b.id));

  if (loading) {
    return <div className="loading">Loading the fleet…</div>;
  }

  return (
    <>
      <Hero boats={boats} />
      <Controls state={ctrl} set={setControl} onReset={resetAll} />

      <div className="wrap">
        <Panel
          title="🎯 Selection score weighting"
          subtitle="Blend Mission fit, Seaworthiness, Ownership & Value into one score — drag to match your priorities"
        >
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
        </Panel>

        <Panel
          title="⚙️ Tune your priorities"
          subtitle="Drag to re-weight what matters — mission-fit scores and ranking update live"
        >
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
        </Panel>

        <Panel
          title="📊 Overview — price vs selection score"
          subtitle="Each dot is a boat; the line marks the $1M budget. Tap a dot to open it."
        >
          <ScatterPlot boats={filtered} onOpen={setModalId} />
        </Panel>

        <Panel
          title="🧭 The captain’s panel — what to watch"
          subtitle="Cross-fleet review for an inexperienced second crew, mostly-calm cruising + liveaboard"
        >
          <CaptainsPanelBody />
        </Panel>

        <Panel
          title="🚀 The panel debates the obscure options"
          subtitle="Under-the-radar go-anywhere boats for Europe/Scandinavia + South America + the tropics"
        >
          <ObscurePanelBody />
        </Panel>

        <div className="count">
          {filtered.length} of {boats.length} boats shown
          {source === "fallback" && (
            <span className="srcnote"> · offline data</span>
          )}
        </div>

        {ctrl.gridView ? (
          gridList.length ? (
            <div className="grid">
              {gridList.map((b, i) => (
                <BoatCard
                  key={b.id}
                  boat={b}
                  rank={i + 1}
                  weights={weights}
                  fav={favs.has(b.id)}
                  inCompare={compareSet.has(b.id)}
                  onOpen={setModalId}
                  onToggleFav={onToggleFav}
                  onToggleCompare={onToggleCompare}
                />
              ))}
            </div>
          ) : (
            <p style={{ color: "#5b6b7b" }}>
              No boats match these filters.{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  resetAll();
                }}
              >
                Reset
              </a>
              .
            </p>
          )
        ) : (
          <BoatTable
            boats={filtered}
            sortKey={tableSortKey}
            sortDir={tableSortDir}
            onSort={onTableSort}
            onOpen={setModalId}
          />
        )}
      </div>

      {compareSet.size > 0 && (
        <button
          className="btn on cmpBar"
          style={cmpBarStyle}
          onClick={() => setCompareOpen(true)}
        >
          ⚖️ Compare {compareSet.size} boat{compareSet.size > 1 ? "s" : ""}
        </button>
      )}

      <footer>
        <div className="wrap">
          <h4>How the “mission fit” score works</h4>
          Each boat is rated 1–5 on nine factors, then weighted toward what this
          couple emphasised most. The defaults weight cockpit protection ×1.5
          and short-handed ease ×1.5 the most, high-latitude capability ×1.25,
          tropical comfort ×0.75, and dog-friendliness, workshop/engine access,
          storage, tankage/range and budget fit each ×1.0 — but you can change
          all of these with the “Tune your priorities” sliders above. Comfort
          ratio and capsize screening formula are computed from each boat’s
          displacement, beam and waterline length (higher comfort = easier
          motion; capsize screen under 2.0 indicates a sea-kindly offshore
          hull).
          <div className="disclaimer">{DISCLAIMER}</div>
        </div>
      </footer>

      {modalBoat && (
        <DetailModal
          boat={modalBoat}
          pillarWeights={pillarWeights}
          medians={medians}
          onClose={() => setModalId(null)}
        />
      )}
      {compareOpen && compareBoats.length > 0 && (
        <CompareModal
          boats={compareBoats}
          onClose={() => setCompareOpen(false)}
          onClear={() => {
            setCompareSet(new Set());
            setCompareOpen(false);
          }}
        />
      )}
    </>
  );
}

const cmpBarStyle: React.CSSProperties = {
  position: "fixed",
  right: 20,
  bottom: 20,
  zIndex: 60,
  boxShadow: "var(--shadow)",
  padding: "12px 18px",
  fontSize: 14,
};
