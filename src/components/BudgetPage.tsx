// The planning deck at /budget — six honest, interactive tools a buyer actually
// needs: all-in purchase cost (+ loan), refit budget (seeded from each boat's
// researched projection), an upgrade builder, a provisioning calculator, a
// voyage/passage planner, and a total-cost-of-ownership roll-up. State persists
// to localStorage so a plan survives a refresh. Every figure is an estimate with
// stated assumptions — never a quote.
import { useEffect, useState, type ReactNode } from "react";
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
    const price = Math.round((b.priceMinUSD + b.priceMaxUSD) / 2);
    setS((v) => ({
      ...v,
      boatId: id,
      purchase: {
        ...v.purchase,
        price,
        insuranceYr: Math.round((price * 0.014) / 100) * 100,
      },
      voyage: { ...v.voyage, speed: Math.round(cruiseKt(b) * 10) / 10 },
      tco: {
        ...v.tco,
        insurance: Math.round((price * 0.014) / 100) * 100,
        berth: Math.round((loaFt(b) * 220) / 100) * 100,
      },
    }));
    // refit: prefer the researched itemised projection, else the index range
    const idx = researchOf(id);
    if (idx) {
      loadResearch(id).then((r) => {
        const items = r?.scores?.refit_projection?.by_item;
        if (items && items.length) {
          setS((v) => ({
            ...v,
            refit: items.map((it) => ({
              label: it.system,
              low: it.low,
              high: it.high,
            })),
          }));
        } else if (idx.refitLow) {
          setS((v) => ({
            ...v,
            refit: [
              {
                label: "Whole-boat refit (researched estimate)",
                low: idx.refitLow!,
                high: idx.refitHigh!,
              },
            ],
          }));
        }
      });
    }
  }

  // ── derived totals ─────────────────────────────────────────────────────────
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

  const refitRow = (i: number, patch: Partial<RefitItem>) =>
    setS((st) => ({
      ...st,
      refit: st.refit.map((it, j) => (j === i ? { ...it, ...patch } : it)),
    }));

  const grandLow = acqTotal + refitLow + upLow;
  const grandHigh = acqTotal + refitHigh + upHigh;

  return (
    <div className="budget">
      <div className="report-top no-print">
        <div className="wrap report-topin">
          <Link to="/" className="backlink">
            ← Back to the fleet
          </Link>
          <button className="bprint" onClick={() => window.print()}>
            ⎙ Print / save plan
          </button>
        </div>
      </div>

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
