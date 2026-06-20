// The planning deck at /budget — six honest, interactive tools a buyer actually
// needs: all-in purchase cost (+ loan), refit budget (seeded from each boat's
// researched projection), an upgrade builder, a provisioning calculator, a
// voyage/passage planner, and a total-cost-of-ownership roll-up. State persists
// to localStorage so a plan survives a refresh. Every figure is an estimate with
// stated assumptions — never a quote.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Boat } from "../types/boat";
import { loadBoats } from "../lib/data";
import { cruiseKt, burnLph, loaFt } from "../lib/metrics";
import { researchOf, loadResearch } from "../lib/research";

const KEY = "sailbudget1";

const money = (n: number): string =>
  (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");
const range = (lo: number, hi: number) => money(lo) + " – " + money(hi);

// ── persisted plan shape ─────────────────────────────────────────────────────
interface RefitItem {
  label: string;
  low: number;
  high: number;
}
interface BudgetState {
  boatId: string;
  purchase: {
    price: number;
    surveyPerFt: number;
    haulSurvey: number;
    taxPct: number;
    registration: number;
    insuranceYr: number;
    delivery: number;
    commissioning: number;
    contingencyPct: number;
    loanOn: boolean;
    downPct: number;
    apr: number;
    termYrs: number;
  };
  refit: RefitItem[];
  upgrades: Record<string, boolean>;
  prov: { crew: number; dogs: number; days: number; perDay: number };
  voyage: {
    distance: number;
    speed: number;
    motorPct: number;
    fuelPrice: number;
  };
  tco: {
    berth: number;
    insurance: number;
    haulout: number;
    maintPct: number;
    sinking: number;
    milesYr: number;
  };
  note: string;
}

const DEFAULTS: BudgetState = {
  boatId: "",
  purchase: {
    price: 250000,
    surveyPerFt: 28,
    haulSurvey: 900,
    taxPct: 0,
    registration: 1500,
    insuranceYr: 3500,
    delivery: 4000,
    commissioning: 6000,
    contingencyPct: 8,
    loanOn: false,
    downPct: 20,
    apr: 7.5,
    termYrs: 15,
  },
  refit: [
    { label: "Standing rigging", low: 8000, high: 20000 },
    { label: "Sails (full suit)", low: 12000, high: 40000 },
    { label: "Electronics & autopilot", low: 8000, high: 30000 },
    { label: "Ground tackle & windlass", low: 2000, high: 7000 },
  ],
  upgrades: {},
  prov: { crew: 2, dogs: 2, days: 21, perDay: 18 },
  voyage: { distance: 3000, speed: 7, motorPct: 20, fuelPrice: 1.6 },
  tco: {
    berth: 9000,
    insurance: 3500,
    haulout: 4000,
    maintPct: 4,
    sinking: 5000,
    milesYr: 4000,
  },
  note: "",
};

// ── upgrade catalogue (typical fitted USD bands; labour included) ────────────
const UPGRADES: { key: string; label: string; low: number; high: number }[] = [
  {
    key: "watermaker",
    label: "Watermaker (12V, ~30 L/h)",
    low: 4000,
    high: 9000,
  },
  {
    key: "lithium",
    label: "Lithium house bank + BMS (400–600 Ah)",
    low: 6000,
    high: 14000,
  },
  {
    key: "solar",
    label: "Solar array + MPPT (600–1200 W)",
    low: 2500,
    high: 6000,
  },
  { key: "windgen", label: "Wind generator", low: 1500, high: 3500 },
  {
    key: "windvane",
    label: "Windvane self-steering (Hydrovane/Monitor)",
    low: 4500,
    high: 8000,
  },
  {
    key: "autopilot",
    label: "Below-deck offshore autopilot",
    low: 3000,
    high: 7000,
  },
  {
    key: "liferaft",
    label: "Offshore liferaft (6-person, cradle)",
    low: 3000,
    high: 6000,
  },
  { key: "ais", label: "AIS transponder (Class B)", low: 800, high: 1500 },
  { key: "radar", label: "Radar (broadband dome)", low: 2000, high: 4500 },
  {
    key: "starlink",
    label: "Starlink / satellite comms (hardware)",
    low: 1000,
    high: 3000,
  },
  {
    key: "heater",
    label: "Diesel cabin heater (Webasto/Eberspächer)",
    low: 2500,
    high: 5500,
  },
  {
    key: "fridge",
    label: "Refrigeration + freezer upgrade (12V)",
    low: 2000,
    high: 5000,
  },
  { key: "dinghy", label: "RIB + outboard (10–15 hp)", low: 4000, high: 9000 },
  {
    key: "code0",
    label: "Code zero / downwind sail + furler",
    low: 4000,
    high: 9000,
  },
  {
    key: "drogue",
    label: "Series drogue (Jordan) + bridle",
    low: 1500,
    high: 3000,
  },
  {
    key: "safety",
    label: "Jacklines, tethers, MOB & grab-bag kit",
    low: 1200,
    high: 3000,
  },
  { key: "epirb", label: "EPIRB + PLBs", low: 1000, high: 2200 },
];

const REGIONS: { label: string; perDay: number }[] = [
  { label: "Developed coast — easy marinas", perDay: 25 },
  { label: "Mixed coastal cruising", perDay: 18 },
  { label: "Long ocean passage (pre-stocked)", perDay: 15 },
  { label: "Remote / self-sufficient", perDay: 12 },
];

// ── the one place the budget math lives ──────────────────────────────────────
// A pure function so the single-plan view and the two-boat comparison compute
// identical numbers from the same inputs. Returns every figure the UI renders.
interface Totals {
  loaFtNum: number;
  survey: number;
  tax: number;
  contingency: number;
  acqTotal: number;
  loanPrincipal: number;
  monthly: number;
  refitLow: number;
  refitHigh: number;
  upLow: number;
  upHigh: number;
  provPeople: number;
  provTotal: number;
  provWaterL: number;
  days: number;
  motorHrs: number;
  fuelL: number;
  fuelCost: number;
  passageProv: number;
  passageWaterL: number;
  passageTotal: number;
  maint: number;
  tcoYr: number;
  perMile: number;
  grandLow: number;
  grandHigh: number;
}

function compute(s: BudgetState, boat: Boat | null): Totals {
  const p = s.purchase;
  const loaFtNum = boat ? loaFt(boat) : 45;
  const survey = Math.round(p.surveyPerFt * loaFtNum) + p.haulSurvey;
  const tax = (p.price * p.taxPct) / 100;
  const acqSub =
    p.price +
    survey +
    tax +
    p.registration +
    p.insuranceYr +
    p.delivery +
    p.commissioning;
  const contingency = (acqSub * p.contingencyPct) / 100;
  const acqTotal = acqSub + contingency;

  const loanPrincipal = p.price * (1 - p.downPct / 100);
  const r = p.apr / 100 / 12;
  const nMo = p.termYrs * 12;
  const monthly =
    p.loanOn && r > 0 && nMo > 0
      ? (loanPrincipal * r) / (1 - Math.pow(1 + r, -nMo))
      : p.loanOn && nMo > 0
        ? loanPrincipal / nMo
        : 0;

  const refitLow = s.refit.reduce((a, i) => a + i.low, 0);
  const refitHigh = s.refit.reduce((a, i) => a + i.high, 0);

  const upLow = UPGRADES.filter((u) => s.upgrades[u.key]).reduce(
    (a, u) => a + u.low,
    0,
  );
  const upHigh = UPGRADES.filter((u) => s.upgrades[u.key]).reduce(
    (a, u) => a + u.high,
    0,
  );

  const provPeople = s.prov.crew + s.prov.dogs * 0.4; // a dog ≈ 0.4 of a person's food cost
  const provTotal = provPeople * s.prov.days * s.prov.perDay;
  const provWaterL = (s.prov.crew * 4 + s.prov.dogs * 1.5) * s.prov.days;

  const v = s.voyage;
  const days = v.speed > 0 ? v.distance / (v.speed * 24) : 0;
  const motorHrs = days * 24 * (v.motorPct / 100);
  const fuelL = motorHrs * (boat ? burnLph(boat) : 4.5);
  const fuelCost = fuelL * v.fuelPrice;
  const passageProv = provPeople * days * s.prov.perDay;
  const passageWaterL = (s.prov.crew * 4 + s.prov.dogs * 1.5) * days;
  const passageTotal = fuelCost + passageProv;

  const t = s.tco;
  const maint = (p.price * t.maintPct) / 100;
  const tcoYr = t.berth + t.insurance + t.haulout + maint + t.sinking;
  const perMile = t.milesYr > 0 ? tcoYr / t.milesYr : 0;

  const grandLow = acqTotal + refitLow + upLow;
  const grandHigh = acqTotal + refitHigh + upHigh;

  return {
    loaFtNum,
    survey,
    tax,
    contingency,
    acqTotal,
    loanPrincipal,
    monthly,
    refitLow,
    refitHigh,
    upLow,
    upHigh,
    provPeople,
    provTotal,
    provWaterL,
    days,
    motorHrs,
    fuelL,
    fuelCost,
    passageProv,
    passageWaterL,
    passageTotal,
    maint,
    tcoYr,
    perMile,
    grandLow,
    grandHigh,
  };
}

// Load a boat's researched refit lines (itemised projection → index range → none).
async function researchRefit(id: string): Promise<RefitItem[] | null> {
  const idx = researchOf(id);
  if (!idx) return null;
  const r = await loadResearch(id);
  const items = r?.scores?.refit_projection?.by_item;
  if (items && items.length) {
    return items.map((it) => ({
      label: it.system,
      low: it.low,
      high: it.high,
    }));
  }
  if (idx.refitLow) {
    return [
      {
        label: "Whole-boat refit (researched estimate)",
        low: idx.refitLow,
        high: idx.refitHigh!,
      },
    ];
  }
  return null;
}

// Apply a boat's data to a plan: price, insurance, cruise speed, berthing, refit.
// Keeps the user's shared assumptions (upgrades, provisioning, voyage, finance,
// contingency) so a two-boat compare isolates only the boat-driven differences.
function seedForBoat(
  base: BudgetState,
  boat: Boat,
  refit: RefitItem[] | null,
): BudgetState {
  const price = Math.round((boat.priceMinUSD + boat.priceMaxUSD) / 2);
  const insurance = Math.round((price * 0.014) / 100) * 100;
  return {
    ...base,
    boatId: boat.id,
    purchase: { ...base.purchase, price, insuranceYr: insurance },
    voyage: { ...base.voyage, speed: Math.round(cruiseKt(boat) * 10) / 10 },
    tco: {
      ...base.tco,
      insurance,
      berth: Math.round((loaFt(boat) * 220) / 100) * 100,
    },
    refit: refit && refit.length ? refit : base.refit,
  };
}

// Markdown summary of a plan — for clipboard export and the printed sheet.
function planMarkdown(s: BudgetState, boat: Boat | null, T: Totals): string {
  const L: string[] = [];
  L.push(`# Voyage plan${boat ? ` — ${boat.name}` : ""}`);
  L.push("");
  L.push(`- **All-in to go cruising:** ${range(T.grandLow, T.grandHigh)}`);
  L.push(`  - Acquisition (all-in): ${money(T.acqTotal)}`);
  L.push(`  - Refit: ${range(T.refitLow, T.refitHigh)}`);
  L.push(`  - Selected upgrades: ${range(T.upLow, T.upHigh)}`);
  if (s.purchase.loanOn) {
    L.push(
      `- **Finance:** ${money(T.monthly)}/mo · ${s.purchase.termYrs} yr @ ${s.purchase.apr}% on ${money(T.loanPrincipal)}`,
    );
  }
  L.push(
    `- **Yearly cost of ownership:** ${money(T.tcoYr)} (${money(T.perMile)}/mile)`,
  );
  L.push(
    `- **Reference passage:** ${s.voyage.distance} nm → ${T.days < 1 ? T.days.toFixed(1) : Math.round(T.days)} days, ${Math.round(T.fuelL)} L fuel (${money(T.fuelCost)})`,
  );
  L.push(
    `- **Provisioning:** ${money(T.provTotal)} for ${s.prov.days} days, ${s.prov.crew} crew`,
  );
  if (s.refit.length) {
    L.push("");
    L.push("## Refit line items");
    for (const it of s.refit)
      L.push(`- ${it.label}: ${range(it.low, it.high)}`);
  }
  const ups = UPGRADES.filter((u) => s.upgrades[u.key]);
  if (ups.length) {
    L.push("");
    L.push("## Upgrades");
    for (const u of ups) L.push(`- ${u.label}: ${range(u.low, u.high)}`);
  }
  if (s.note.trim()) {
    L.push("");
    L.push("## Notes");
    L.push(s.note.trim());
  }
  L.push("");
  L.push("_Estimates with stated assumptions, not a quote._");
  return L.join("\n");
}

function download(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── small inputs ─────────────────────────────────────────────────────────────
function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="bfield">
      <span className="bflabel">{label}</span>
      {children}
      {hint && <span className="bfhint">{hint}</span>}
    </label>
  );
}
function NumIn({
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min = 0,
}: {
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
}) {
  return (
    <span className="bnum">
      {prefix && <i className="bpfx">{prefix}</i>}
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
      {suffix && <i className="bsfx">{suffix}</i>}
    </span>
  );
}
function Tool({
  n,
  title,
  blurb,
  total,
  children,
}: {
  n: number;
  title: string;
  blurb: string;
  total: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="btool">
      <div className="btool-head">
        <div>
          <h2>
            <span className="btool-n">{n}</span>
            {title}
          </h2>
          <p className="btool-blurb">{blurb}</p>
        </div>
        <div className="btool-total">{total}</div>
      </div>
      <div className="btool-body">{children}</div>
    </section>
  );
}

function loadState(): BudgetState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULTS;
}

export default function BudgetPage() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [s, setS] = useState<BudgetState>(loadState);

  useEffect(() => {
    loadBoats().then((r) => setBoats(r.boats));
  }, []);
  useEffect(() => {
    document.title = "Voyage budgeting — Bluewater planner";
    return () => {
      document.title = "Bluewater Sailboat Comparison — Patagonia to Polynesia";
    };
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* ignore quota */
    }
  }, [s]);

  // typed slice updaters
  const setPurchase = (p: Partial<BudgetState["purchase"]>) =>
    setS((v) => ({ ...v, purchase: { ...v.purchase, ...p } }));
  const setProv = (p: Partial<BudgetState["prov"]>) =>
    setS((v) => ({ ...v, prov: { ...v.prov, ...p } }));
  const setVoyage = (p: Partial<BudgetState["voyage"]>) =>
    setS((v) => ({ ...v, voyage: { ...v.voyage, ...p } }));
  const setTco = (p: Partial<BudgetState["tco"]>) =>
    setS((v) => ({ ...v, tco: { ...v.tco, ...p } }));

  const boat = boats.find((b) => b.id === s.boatId) || null;

  // selecting a boat seeds prices, cruise speed, TCO and refit from its data
  function pickBoat(id: string) {
    const b = boats.find((x) => x.id === id);
    if (!b) {
      setS((v) => ({ ...v, boatId: "" }));
      return;
    }
    researchRefit(id).then((refit) => setS((v) => seedForBoat(v, b, refit)));
  }

  // ── plan import / export ─────────────────────────────────────────────────
  const fileRef = useRef<HTMLInputElement>(null);
  const [flash, setFlash] = useState("");
  function toast(msg: string) {
    setFlash(msg);
    window.setTimeout(() => setFlash(""), 2200);
  }
  function exportPlan() {
    const stamp = boat ? boat.id : "custom";
    download(
      `voyage-plan-${stamp}.json`,
      JSON.stringify({ v: 1, kind: "sailboat-voyage-plan", plan: s }, null, 2),
      "application/json",
    );
    toast("Plan downloaded");
  }
  function importPlan(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const plan = parsed?.plan ?? parsed;
        if (!plan || !plan.purchase || !Array.isArray(plan.refit))
          throw new Error("not a voyage plan");
        setS({ ...DEFAULTS, ...plan });
        toast("Plan loaded");
      } catch {
        toast("That file isn't a voyage plan");
      }
    };
    reader.readAsText(file);
  }
  function copySummary() {
    navigator.clipboard
      ?.writeText(planMarkdown(s, boat, compute(s, boat)))
      .then(
        () => toast("Summary copied"),
        () => toast("Couldn't copy"),
      );
  }

  // ── derived totals (one source of truth, shared with the compare view) ────
  const p = s.purchase;
  const v = s.voyage;
  const t = s.tco;
  const T = compute(s, boat);
  const {
    loaFtNum,
    survey,
    tax,
    contingency,
    acqTotal,
    loanPrincipal,
    monthly,
    refitLow,
    refitHigh,
    upLow,
    upHigh,
    provPeople,
    provTotal,
    provWaterL,
    days,
    motorHrs,
    fuelL,
    fuelCost,
    passageProv,
    passageWaterL,
    passageTotal,
    maint,
    tcoYr,
    perMile,
    grandLow,
    grandHigh,
  } = T;

  const refitRow = (i: number, patch: Partial<RefitItem>) =>
    setS((st) => ({
      ...st,
      refit: st.refit.map((it, j) => (j === i ? { ...it, ...patch } : it)),
    }));

  return (
    <div className="budget">
      <div className="report-top no-print">
        <div className="wrap report-topin">
          <Link to="/" className="backlink">
            ← Back to the fleet
          </Link>
          <div className="bplan-acts">
            <button
              className="bplan-act"
              onClick={copySummary}
              title="Copy a Markdown summary to the clipboard"
            >
              ⧉ Copy summary
            </button>
            <button
              className="bplan-act"
              onClick={exportPlan}
              title="Download this plan as a JSON file you can reload later"
            >
              ↓ Export
            </button>
            <button
              className="bplan-act"
              onClick={() => fileRef.current?.click()}
              title="Load a plan you exported earlier"
            >
              ↑ Import
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importPlan(f);
                e.target.value = "";
              }}
            />
            <button className="bprint" onClick={() => window.print()}>
              ⎙ Print
            </button>
          </div>
        </div>
      </div>
      {flash && <div className="bplan-toast">{flash}</div>}

      <header className="budget-hero">
        <div className="wrap">
          <div className="budget-eyebrow">Planning deck</div>
          <h1>Voyage budgeting &amp; planning</h1>
          <p className="budget-sub">
            Six tools for the real numbers — buying, refitting, upgrading,
            provisioning, passage-making and the yearly cost of keeping her.
            Every figure is an estimate with stated assumptions, not a quote.
            Pick a boat to seed it from researched data, or plan from scratch.
          </p>
          <div className="budget-pick no-print">
            <Field label="Plan for">
              <select
                value={s.boatId}
                onChange={(e) => pickBoat(e.target.value)}
              >
                <option value="">— Custom / no boat —</option>
                {[...boats]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
              </select>
            </Field>
            {boat && (
              <div className="budget-boatfacts">
                <span>{boat.priceText}</span>
                <span>{Math.round(loaFt(boat))}′ LOA</span>
                <span>~{Math.round(cruiseKt(boat) * 10) / 10} kt cruise</span>
                {researchOf(boat.id) && (
                  <span className="research-pill">refit seeded</span>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="wrap budget-main">
        {/* headline roll-up */}
        <div className="budget-headline">
          <div>
            <span className="bhl-lab">All-in to go cruising</span>
            <span className="bhl-val">{range(grandLow, grandHigh)}</span>
            <span className="bhl-sub">
              acquisition + refit + selected upgrades
            </span>
          </div>
          {s.purchase.loanOn && (
            <div>
              <span className="bhl-lab">Finance</span>
              <span className="bhl-val">{money(monthly)}/mo</span>
              <span className="bhl-sub">
                {p.termYrs} yr @ {p.apr}% on {money(loanPrincipal)}
              </span>
            </div>
          )}
          <div>
            <span className="bhl-lab">To run her / year</span>
            <span className="bhl-val">{money(tcoYr)}</span>
            <span className="bhl-sub">{money(perMile)} per mile</span>
          </div>
        </div>

        {/* 1 — purchase */}
        <Tool
          n={1}
          title="Purchase budget"
          blurb="The true all-in acquisition cost, not just the asking price."
          total={
            <>
              <span className="bt-lab">All-in</span>
              <span className="bt-val">{money(acqTotal)}</span>
            </>
          }
        >
          <div className="bgrid">
            <Field label="Boat price (asking / offer)">
              <NumIn
                value={p.price}
                prefix="$"
                step={1000}
                onChange={(n) => setPurchase({ price: n })}
              />
            </Field>
            <Field
              label="Survey"
              hint={`${money(survey)} — $${p.surveyPerFt}/ft × ${Math.round(loaFtNum)}′ + haul`}
            >
              <NumIn
                value={p.surveyPerFt}
                prefix="$"
                suffix="/ft"
                onChange={(n) => setPurchase({ surveyPerFt: n })}
              />
            </Field>
            <Field label="Survey haul-out">
              <NumIn
                value={p.haulSurvey}
                prefix="$"
                step={100}
                onChange={(n) => setPurchase({ haulSurvey: n })}
              />
            </Field>
            <Field
              label="Sales / VAT / use tax"
              hint={tax ? money(tax) : "0 in many cruising states"}
            >
              <NumIn
                value={p.taxPct}
                suffix="%"
                step={0.5}
                onChange={(n) => setPurchase({ taxPct: n })}
              />
            </Field>
            <Field label="Registration / documentation">
              <NumIn
                value={p.registration}
                prefix="$"
                step={100}
                onChange={(n) => setPurchase({ registration: n })}
              />
            </Field>
            <Field label="Insurance (first year)">
              <NumIn
                value={p.insuranceYr}
                prefix="$"
                step={100}
                onChange={(n) => setPurchase({ insuranceYr: n })}
              />
            </Field>
            <Field label="Delivery / transport">
              <NumIn
                value={p.delivery}
                prefix="$"
                step={500}
                onChange={(n) => setPurchase({ delivery: n })}
              />
            </Field>
            <Field label="Commissioning / initial outfit">
              <NumIn
                value={p.commissioning}
                prefix="$"
                step={500}
                onChange={(n) => setPurchase({ commissioning: n })}
              />
            </Field>
            <Field label="Contingency" hint={money(contingency)}>
              <NumIn
                value={p.contingencyPct}
                suffix="%"
                onChange={(n) => setPurchase({ contingencyPct: n })}
              />
            </Field>
          </div>
          <label className="bcheck">
            <input
              type="checkbox"
              checked={p.loanOn}
              onChange={(e) => setPurchase({ loanOn: e.target.checked })}
            />
            Finance the purchase
          </label>
          {p.loanOn && (
            <div className="bgrid bloan">
              <Field
                label="Down payment"
                hint={money(p.price * (p.downPct / 100))}
              >
                <NumIn
                  value={p.downPct}
                  suffix="%"
                  onChange={(n) => setPurchase({ downPct: n })}
                />
              </Field>
              <Field label="APR">
                <NumIn
                  value={p.apr}
                  suffix="%"
                  step={0.25}
                  onChange={(n) => setPurchase({ apr: n })}
                />
              </Field>
              <Field label="Term">
                <NumIn
                  value={p.termYrs}
                  suffix="yr"
                  onChange={(n) => setPurchase({ termYrs: n })}
                />
              </Field>
              <Field label="Monthly payment">
                <span className="bderived">{money(monthly)}</span>
              </Field>
            </div>
          )}
        </Tool>

        {/* 2 — refit */}
        <Tool
          n={2}
          title="Refit budget"
          blurb="Itemise the work. Seeded from the boat's researched refit projection where we have one."
          total={
            <>
              <span className="bt-lab">Refit</span>
              <span className="bt-val">{range(refitLow, refitHigh)}</span>
            </>
          }
        >
          <div className="brefit">
            <div className="brefit-head">
              <span>Item</span>
              <span>Low</span>
              <span>High</span>
              <span />
            </div>
            {s.refit.map((it, i) => (
              <div className="brefit-row" key={i}>
                <input
                  className="brefit-lab"
                  value={it.label}
                  onChange={(e) => refitRow(i, { label: e.target.value })}
                />
                <NumIn
                  value={it.low}
                  prefix="$"
                  step={500}
                  onChange={(n) => refitRow(i, { low: n })}
                />
                <NumIn
                  value={it.high}
                  prefix="$"
                  step={500}
                  onChange={(n) => refitRow(i, { high: n })}
                />
                <button
                  className="brefit-del"
                  aria-label="Remove line"
                  onClick={() =>
                    setS((st) => ({
                      ...st,
                      refit: st.refit.filter((_, j) => j !== i),
                    }))
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            className="badd no-print"
            onClick={() =>
              setS((st) => ({
                ...st,
                refit: [...st.refit, { label: "New item", low: 0, high: 0 }],
              }))
            }
          >
            + Add line item
          </button>
        </Tool>

        {/* 3 — upgrades */}
        <Tool
          n={3}
          title="Upgrade builder"
          blurb="Tick the bluewater kit you'll add. Bands are typical fitted prices, labour included."
          total={
            <>
              <span className="bt-lab">Upgrades</span>
              <span className="bt-val">{range(upLow, upHigh)}</span>
            </>
          }
        >
          <div className="bupgrades">
            {UPGRADES.map((u) => (
              <label
                key={u.key}
                className={"bupg" + (s.upgrades[u.key] ? " on" : "")}
              >
                <input
                  type="checkbox"
                  checked={!!s.upgrades[u.key]}
                  onChange={(e) =>
                    setS((st) => ({
                      ...st,
                      upgrades: { ...st.upgrades, [u.key]: e.target.checked },
                    }))
                  }
                />
                <span className="bupg-lab">{u.label}</span>
                <span className="bupg-cost">{range(u.low, u.high)}</span>
              </label>
            ))}
          </div>
        </Tool>

        {/* 4 — provisioning */}
        <Tool
          n={4}
          title="Provisioning calculator"
          blurb="Food & consumables for a stint aboard. Water is drinking + cooking only — a watermaker changes everything."
          total={
            <>
              <span className="bt-lab">Provisioning</span>
              <span className="bt-val">{money(provTotal)}</span>
            </>
          }
        >
          <div className="bgrid">
            <Field label="Crew">
              <NumIn
                value={s.prov.crew}
                onChange={(n) => setProv({ crew: n })}
              />
            </Field>
            <Field label="Dogs">
              <NumIn
                value={s.prov.dogs}
                onChange={(n) => setProv({ dogs: n })}
              />
            </Field>
            <Field label="Days">
              <NumIn
                value={s.prov.days}
                onChange={(n) => setProv({ days: n })}
              />
            </Field>
            <Field label="Region / style">
              <select
                value={s.prov.perDay}
                onChange={(e) =>
                  setProv({ perDay: parseFloat(e.target.value) })
                }
              >
                {REGIONS.map((rg) => (
                  <option key={rg.label} value={rg.perDay}>
                    {rg.label} (${rg.perDay}/person/day)
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="bnote">
            ≈ {money(provTotal)} of food &amp; consumables · about{" "}
            {Math.round(provWaterL)} L of water needed ({s.prov.days} days, no
            watermaker) · ~{Math.round(provPeople * s.prov.days * 1.5)} kg of
            stores to stow.
          </div>
        </Tool>

        {/* 5 — passage planner */}
        <Tool
          n={5}
          title="Voyage / passage planner"
          blurb="Turn a distance into days, fuel and money. Cruise speed seeds from the boat's hull speed."
          total={
            <>
              <span className="bt-lab">Passage cost</span>
              <span className="bt-val">{money(passageTotal)}</span>
            </>
          }
        >
          <div className="bgrid">
            <Field label="Distance">
              <NumIn
                value={v.distance}
                suffix="nm"
                step={50}
                onChange={(n) => setVoyage({ distance: n })}
              />
            </Field>
            <Field label="Cruise speed">
              <NumIn
                value={v.speed}
                suffix="kt"
                step={0.1}
                onChange={(n) => setVoyage({ speed: n })}
              />
            </Field>
            <Field
              label="Under power"
              hint={`${Math.round(motorHrs)} engine hours`}
            >
              <NumIn
                value={v.motorPct}
                suffix="%"
                onChange={(n) => setVoyage({ motorPct: n })}
              />
            </Field>
            <Field label="Fuel price">
              <NumIn
                value={v.fuelPrice}
                prefix="$"
                suffix="/L"
                step={0.1}
                onChange={(n) => setVoyage({ fuelPrice: n })}
              />
            </Field>
          </div>
          <div className="bstats">
            <div>
              <b>{days < 1 ? days.toFixed(1) : Math.round(days)}</b>
              <span>days at sea</span>
            </div>
            <div>
              <b>{Math.round(fuelL)} L</b>
              <span>fuel ({money(fuelCost)})</span>
            </div>
            <div>
              <b>{Math.round(passageWaterL)} L</b>
              <span>water aboard</span>
            </div>
            <div>
              <b>{money(passageProv)}</b>
              <span>provisions</span>
            </div>
          </div>
        </Tool>

        {/* 6 — TCO */}
        <Tool
          n={6}
          title="Cost of ownership"
          blurb="What she costs every year, whether you sail or not. Maintenance is a % of value — the rule of thumb that ages best."
          total={
            <>
              <span className="bt-lab">Per year</span>
              <span className="bt-val">{money(tcoYr)}</span>
            </>
          }
        >
          <div className="bgrid">
            <Field label="Berthing / marina (yr)">
              <NumIn
                value={t.berth}
                prefix="$"
                step={500}
                onChange={(n) => setTco({ berth: n })}
              />
            </Field>
            <Field label="Insurance (yr)">
              <NumIn
                value={t.insurance}
                prefix="$"
                step={100}
                onChange={(n) => setTco({ insurance: n })}
              />
            </Field>
            <Field label="Haul-out + antifoul (yr)">
              <NumIn
                value={t.haulout}
                prefix="$"
                step={250}
                onChange={(n) => setTco({ haulout: n })}
              />
            </Field>
            <Field
              label="Maintenance"
              hint={`${money(maint)} at ${t.maintPct}% of value`}
            >
              <NumIn
                value={t.maintPct}
                suffix="%"
                step={0.5}
                onChange={(n) => setTco({ maintPct: n })}
              />
            </Field>
            <Field label="Gear sinking fund (yr)">
              <NumIn
                value={t.sinking}
                prefix="$"
                step={250}
                onChange={(n) => setTco({ sinking: n })}
              />
            </Field>
            <Field
              label="Miles sailed / year"
              hint={`${money(perMile)} per mile`}
            >
              <NumIn
                value={t.milesYr}
                suffix="nm"
                step={250}
                onChange={(n) => setTco({ milesYr: n })}
              />
            </Field>
          </div>
          <div className="bnote">
            ≈ {money(tcoYr / 12)} per month all-in · {money(perMile)} for every
            mile you actually sail.
          </div>
        </Tool>

        {/* plan note */}
        <section className="btool bnote-tool">
          <div className="btool-head">
            <div>
              <h2>
                <span className="btool-n">✎</span>Plan notes
              </h2>
              <p className="btool-blurb">
                Anything you want to remember — survey questions, broker
                contacts, the assumptions behind your numbers. Saved with the
                plan, on this device only, and included in exports and the
                printout.
              </p>
            </div>
          </div>
          <div className="btool-body">
            <textarea
              className="bplan-note"
              rows={5}
              placeholder="e.g. asking price is soft — survey flagged the chainplates; budget assumes haul in Trinidad…"
              value={s.note}
              onChange={(e) => setS((st) => ({ ...st, note: e.target.value }))}
            />
          </div>
        </section>

        {/* two-boat plan comparison */}
        <PlanCompare boats={boats} base={s} />

        <p className="budget-foot">
          Estimates only — actual costs depend on survey findings, location,
          labour rates and the specific hull. Build your real budget with a
          broker, surveyor and insurer. Plan saved automatically in this
          browser.
        </p>
      </main>
    </div>
  );
}

// ── two-boat plan comparison ────────────────────────────────────────────────
// Seeds two boats from your shared assumptions and lays the money side by side,
// so the differences you see are driven by the boats, not by changed inputs.
function PlanCompare({ boats, base }: { boats: Boat[]; base: BudgetState }) {
  const [aId, setAId] = useState("");
  const [bId, setBId] = useState("");
  const [refitA, setRefitA] = useState<RefitItem[] | null>(null);
  const [refitB, setRefitB] = useState<RefitItem[] | null>(null);

  useEffect(() => {
    if (!aId) {
      setRefitA(null);
      return;
    }
    let live = true;
    researchRefit(aId).then((r) => live && setRefitA(r));
    return () => {
      live = false;
    };
  }, [aId]);
  useEffect(() => {
    if (!bId) {
      setRefitB(null);
      return;
    }
    let live = true;
    researchRefit(bId).then((r) => live && setRefitB(r));
    return () => {
      live = false;
    };
  }, [bId]);

  const boatA = boats.find((x) => x.id === aId) || null;
  const boatB = boats.find((x) => x.id === bId) || null;
  const options = [...boats].sort((a, b) => a.name.localeCompare(b.name));

  const sA = boatA ? seedForBoat(base, boatA, refitA) : null;
  const sB = boatB ? seedForBoat(base, boatB, refitB) : null;
  const TA = sA ? compute(sA, boatA) : null;
  const TB = sB ? compute(sB, boatB) : null;
  const ready = !!(boatA && boatB && TA && TB);

  const mid = (lo: number, hi: number) => (lo + hi) / 2;
  type Row = {
    label: string;
    a: number;
    b: number;
    fmt: (n: number) => string;
    lowerBetter?: boolean;
    sub?: [string, string];
  };
  const rows: Row[] = [];
  if (ready) {
    rows.push({
      label: "All-in to go cruising",
      a: mid(TA!.grandLow, TA!.grandHigh),
      b: mid(TB!.grandLow, TB!.grandHigh),
      fmt: money,
      lowerBetter: true,
      sub: [
        range(TA!.grandLow, TA!.grandHigh),
        range(TB!.grandLow, TB!.grandHigh),
      ],
    });
    rows.push({
      label: "Acquisition (all-in)",
      a: TA!.acqTotal,
      b: TB!.acqTotal,
      fmt: money,
      lowerBetter: true,
    });
    rows.push({
      label: "Refit",
      a: mid(TA!.refitLow, TA!.refitHigh),
      b: mid(TB!.refitLow, TB!.refitHigh),
      fmt: money,
      lowerBetter: true,
      sub: [
        range(TA!.refitLow, TA!.refitHigh),
        range(TB!.refitLow, TB!.refitHigh),
      ],
    });
    if (base.purchase.loanOn) {
      rows.push({
        label: "Finance / month",
        a: TA!.monthly,
        b: TB!.monthly,
        fmt: money,
        lowerBetter: true,
      });
    }
    rows.push({
      label: "Cost to run / year",
      a: TA!.tcoYr,
      b: TB!.tcoYr,
      fmt: money,
      lowerBetter: true,
    });
    rows.push({
      label: "Per mile sailed",
      a: TA!.perMile,
      b: TB!.perMile,
      fmt: money,
      lowerBetter: true,
    });
    rows.push({
      label: `Reference passage (${base.voyage.distance} nm)`,
      a: TA!.days,
      b: TB!.days,
      fmt: (n) => (n < 1 ? n.toFixed(1) : Math.round(n)) + " days",
    });
    rows.push({
      label: "Passage fuel",
      a: TA!.fuelCost,
      b: TB!.fuelCost,
      fmt: money,
      lowerBetter: true,
    });
  }

  const allInDelta =
    ready && TA && TB
      ? mid(TB.grandLow, TB.grandHigh) - mid(TA.grandLow, TA.grandHigh)
      : 0;

  return (
    <section className="btool bcompare">
      <div className="btool-head">
        <div>
          <h2>
            <span className="btool-n">⚖</span>Compare two boats
          </h2>
          <p className="btool-blurb">
            Each boat is seeded from its researched price, cruise speed,
            berthing and refit — then run through <em>your</em> assumptions
            above (upgrades, provisioning, finance, contingency). So every
            difference below is the boat talking, not the inputs.
          </p>
        </div>
      </div>
      <div className="btool-body">
        <div className="bcmp-picks no-print">
          <Field label="Boat A">
            <select value={aId} onChange={(e) => setAId(e.target.value)}>
              <option value="">— choose —</option>
              {options.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>
          <span className="bcmp-vs">vs</span>
          <Field label="Boat B">
            <select value={bId} onChange={(e) => setBId(e.target.value)}>
              <option value="">— choose —</option>
              {options.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {!ready ? (
          <p className="bcmp-empty">
            Pick two boats to see their plans head to head.
          </p>
        ) : (
          <>
            <div className="bcmp-verdict">
              {Math.abs(allInDelta) < 1 ? (
                <>
                  <b>{boatA!.name}</b> and <b>{boatB!.name}</b> land at almost
                  the same all-in cost.
                </>
              ) : (
                <>
                  <b>{allInDelta > 0 ? boatA!.name : boatB!.name}</b> is the
                  lighter lift — about <b>{money(Math.abs(allInDelta))}</b> less
                  all-in to go cruising than{" "}
                  {allInDelta > 0 ? boatB!.name : boatA!.name}.
                </>
              )}
            </div>
            <div className="bcmp-tablewrap">
              <table className="bcmp-table">
                <thead>
                  <tr>
                    <th />
                    <th>{boatA!.name}</th>
                    <th>{boatB!.name}</th>
                    <th>Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const delta = row.b - row.a;
                    const aWins = row.lowerBetter && row.a < row.b;
                    const bWins = row.lowerBetter && row.b < row.a;
                    const deltaGood = row.lowerBetter ? delta < 0 : false;
                    const deltaBad = row.lowerBetter ? delta > 0 : false;
                    return (
                      <tr key={row.label}>
                        <td className="bcmp-lab">{row.label}</td>
                        <td className={"bcmp-num" + (aWins ? " win" : "")}>
                          {row.fmt(row.a)}
                          {row.sub && (
                            <span className="bcmp-sub">{row.sub[0]}</span>
                          )}
                        </td>
                        <td className={"bcmp-num" + (bWins ? " win" : "")}>
                          {row.fmt(row.b)}
                          {row.sub && (
                            <span className="bcmp-sub">{row.sub[1]}</span>
                          )}
                        </td>
                        <td
                          className={
                            "bcmp-delta" +
                            (deltaGood ? " good" : deltaBad ? " bad" : "")
                          }
                        >
                          {row.lowerBetter && Math.abs(delta) >= 1
                            ? (delta > 0 ? "+" : "−") + money(Math.abs(delta))
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="bcmp-note">
              Δ is Boat&nbsp;B minus Boat&nbsp;A — green means B costs less.
              Refit and price are seeded from research where we have it; both
              boats share the upgrades, crew, voyage and finance terms you set
              above.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
