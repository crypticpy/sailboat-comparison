// The single data-access seam. Today it loads bundled JSON (and, when configured,
// Supabase). Swapping the source later — a different table, an API, a CMS — is a
// change confined to this file; no component imports the data source directly.
import type { Boat } from "../types/boat";
import { getSupabase } from "./supabase";

// The committed fixture (faithful migration of the 34 legacy boats) is the
// offline fallback when Supabase is unreachable or unconfigured. It is loaded
// via dynamic import so Vite code-splits the ~290 KB JSON into its own chunk —
// keeping it out of the main bundle on the Supabase-primary path, where it is
// never fetched. The promise is memoized so it loads at most once.
let fallbackPromise: Promise<Boat[]> | null = null;
function loadFallback(): Promise<Boat[]> {
  if (!fallbackPromise) {
    fallbackPromise = import("../../data/boats.json").then(
      (m) => m.default as unknown as Boat[],
    );
  }
  return fallbackPromise;
}

export interface BoatsResult {
  boats: Boat[];
  source: "supabase" | "fallback";
  error?: string;
}

/**
 * Load all boats. Prefers Supabase when configured; falls back to the bundled
 * JSON so the site always renders, even with no backend.
 */
export async function loadBoats(): Promise<BoatsResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { boats: await loadFallback(), source: "fallback" };
  }
  try {
    const { data, error } = await supabase.from("boats").select("*");
    if (error) throw error;
    if (!data || data.length === 0) {
      return {
        boats: await loadFallback(),
        source: "fallback",
        error: "no rows",
      };
    }
    return { boats: data.map(rowToBoat), source: "supabase" };
  } catch (e) {
    return {
      boats: await loadFallback(),
      source: "fallback",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

// Supabase stores snake_case columns + JSONB; the app speaks the camelCase Boat
// shape. This adapter is the only place that knows about the column naming.
type Row = Record<string, unknown>;

function rowToBoat(r: Row): Boat {
  const g = <T>(k: string): T => r[k] as T;
  return {
    id: g("id"),
    name: g("name"),
    builder: g("builder"),
    designer: g("designer"),
    color: g("color"),
    years: g("years"),
    material: g("material"),
    category: g("category"),
    cockpitType: g("cockpit_type"),
    loa: g("loa"),
    lwl: g("lwl"),
    beam: g("beam"),
    draftMin: g("draft_min"),
    draftMax: g("draft_max"),
    displacement: g("displacement"),
    ballast: g("ballast"),
    ballastRatio: g("ballast_ratio"),
    sailArea: g("sail_area"),
    airDraft: g("air_draft"),
    engine: g("engine"),
    drive: g("drive"),
    cabins: g("cabins"),
    keel: g("keel"),
    cockpit: g("cockpit"),
    fuel: g("fuel"),
    water: g("water"),
    loaN: g("loa_n"),
    lwlFt: g("lwl_ft"),
    beamFt: g("beam_ft"),
    dispLb: g("disp_lb"),
    draftMinN: g("draft_min_n"),
    sad: g("sad"),
    dl: g("dl"),
    fuelN: g("fuel_n"),
    waterN: g("water_n"),
    engineHp: g("engine_hp"),
    priceMinUSD: g("price_min_usd"),
    priceMaxUSD: g("price_max_usd"),
    budget: g("budget"),
    budgetN: g("budget_n"),
    bestFor: g("best_for"),
    protectionText: g("protection_text"),
    rig: g("rig"),
    handlingText: g("handling_text"),
    engineWorkshop: g("engine_workshop"),
    systems: g("systems"),
    storageText: g("storage_text"),
    rangeText: g("range_text"),
    accommodation: g("accommodation"),
    highLatText: g("high_lat_text"),
    tropicalText: g("tropical_text"),
    priceText: g("price_text"),
    priceNew: g("price_new"),
    priceUsed: g("price_used"),
    budgetText: g("budget_text"),
    notable: g("notable"),
    scores: g("scores"),
    tags: g("tags"),
    fun: g("fun"),
    priceExamples: g("price_examples"),
    sources: g("sources"),
    youtube: g("youtube"),
    pros: g("pros"),
    cons: g("cons"),
    awards: g("awards"),
    endorsements: g("endorsements"),
    badge: g("badge"),
    own: g("own"),
  };
}
