// Enrich the existing Amel 50 record (id "amel") to Boréal/Garcia depth.
// Deterministic in-place mutation of data/boats.json so the diff stays minimal.
// Corrects the thin/stale baseline (years, Super-Maramu-not-Amel-50 endorsements)
// and adds honest, Amel-50-specific, cited research. Run: node scripts/build-amel.mjs
import { readFileSync, writeFileSync } from "node:fs";

const path = new URL("../data/boats.json", import.meta.url);
const raw = readFileSync(path, "utf8");
const boats = JSON.parse(raw);
const b = boats.find((x) => x.id === "amel");
if (!b) throw new Error("amel record not found");
if (b.name !== "Amel 50") throw new Error(`unexpected name: ${b.name}`);

// ---- top-level scalars (mutate in place to preserve key order) ----
b.builder = "Chantiers Amel · La Rochelle, France";
b.years = "2017–present";
b.material = "GRP (vacuum-infused; foam-cored topsides)";
b.loa = "54'2\" (16.50 m)";
b.lwl = "47'7\" (14.50 m)";
b.lwlFt = 47.57;
b.beam = "15'9\" (4.79 m)";
b.displacement = "18,750 kg light / 22,200 kg loaded";
b.ballast = "5,360 kg cast iron";
b.ballastRatio = "~28.6% (light)";
b.sailArea = "126 m² / 1,356 ft² (62 main + 64 genoa)";
b.airDraft = "~22.5 m / 74'";
b.engine = "Volvo D3-110 (early) / D3-150 (Evolution)";
b.keel = "Fixed fin keel with bulb (cast iron); twin spade rudders; 4–5 watertight compartments + single sea-chest";
b.cockpit = "Center cockpit under a rigid hardtop with a pillarless wraparound windscreen, opening sunroof and electric sail controls — an enclosed, all-weather 'deckhouse' helm";
b.fuel = "~675 L / 178 gal";
b.fuelN = 675;
b.sad = "~18–20";
b.dl = "~170";

b.bestFor =
  "The cruising couple who want the most comfortable, genuinely push-button liveaboard passage-maker for temperate-to-tropical oceans — and who value an enclosed all-weather cockpit and turnkey systems over the shoal-draft, ice-capable, beach-anywhere ruggedness of an aluminium expedition boat. It wins on comfortable living and short-handed ease; it is not an expedition or high-latitude boat.";
b.protectionText =
  "Among the best-protected production cockpits afloat. Helm and crew sit inside a rigid hardtop 'deckhouse' with a pillarless wraparound windscreen — sealed from wind, spray, sun and cold, the whole boat worked by button from the seat. Pip Hare (Yachting World) punched out of La Rochelle into a wet December gale \"oblivious to the weather raging outside.\" Superb tropical shade and genuine warmth in the cold — but it's a comfort-in-the-cold cockpit, not an ice-capable expedition one, and the full enclosure detaches the helmsman from the feel of the boat (a Cruising World judge disliked exactly that).";
b.rig =
  "Amel's first sloop in ~20 years (the ketch was dropped to free up the wide aft hull and centre-cockpit volume). Masthead double-headsail rig on a proprietary four-compartment alloy spar: electric in-mast main furling, an electric ~64 m² outer genoa and an electric self-tacking inner staysail (~24 m²) — set, reef and trim by button. Optional Code 0/gennaker on a stemhead sprit; carbon mast optional on later (Evolution) hulls.";
b.handlingText =
  "The Amel hallmark and its strongest card for a smaller/less-strong crew: electric in-mast main, electric genoa and self-tacking staysail furlers, electric winches and a standard bow thruster mean you sail, reef and dock almost entirely by button from the protected seat. The honest cost: the push-pull cable steering gives \"little feeling\" (Pip Hare), the high topsides make it windage-heavy and \"tricky\" to manoeuvre at low speed, and the bow thruster is effectively mandatory in a marina.";
b.engineWorkshop =
  "Class-leading. The cockpit sole lifts on gas struts to a dedicated, sealed, insulated walk-in engine room with full stand-up access all around the Volvo, genset, watermaker, A/C and inverters — no floorboards to pull in the saloon, and a prop-shaft inspection port under the aft berth. The best machinery access in this fleet.";
b.systems =
  "A fully integrated turnkey systems boat: watermaker (Dessalator), 8 kW genset, A/C, electric furling/winches, washer-dryer, big house bank and a single sea-chest feeding the raw-water services (fewer through-hulls). Later 'Evolution' hulls add solar, lithium, a 150 hp engine, an induction galley and a laminated-glass windscreen. Superb to live with — but a lot of proprietary, French-sourced systems to maintain.";
b.storageText =
  "Exceptional — a Cruising World judge said he'd \"never seen a more efficient use of space on any cruising boat\": deep bilge lockers, settee and floorboard stowage, a saloon freezer and heeled-secure drawer lockers. Long-term liveaboard provisioning volume (the forward guest cabin is the one tight space).";
b.rangeText =
  "~800–1,000+ nm motoring on ~675 L; a near-standard watermaker removes the water constraint. Owners note it \"will spend much time under power\" in light air (Ralph Naranjo), so plan fuel accordingly.";
b.accommodation =
  "3 cabins / 2 heads with a luxurious aft owner's suite (island berth, en-suite), a saloon flooded with light from the deckhouse windows, and a notably small forward guest cabin. Big, climate-controllable and genuinely residential. For two dogs it's the awkward case here: high topsides and a companionway-down (not single-level) layout mean boarding and getting dogs into the centre cockpit needs a ramp/sling routine — no confirmed dog-aboard accounts found.";
b.highLatText =
  "A comfort-in-the-cold boat, not an expedition one. The enclosed, heated hardtop cockpit and watertight bulkheads make cold-weather watch-keeping genuinely livable — but the GRP hull (no ice reinforcement), fixed 2.15 m keel (no beaching; a hard grounding is consequential), modest ~28% iron ballast and an unpublished AVS put true high-latitude/ice work in the domain of the aluminium centreboarders (Garcia, Boréal). Fine for a careful Norway or one Patagonia season; not the tool for sustained polar voyaging.";
b.tropicalText =
  "Excellent — full hardtop shade, opening sunroof and hatches for ventilation, and effortless push-button sailing in the trades. The natural home of the Amel 50, where its comfort-first design shines (most owners cruise the Caribbean/Pacific tradewind circuit).";
b.priceNew =
  "New launched ~€790k ex-VAT base (2017); ~$1.1–1.15M sailaway by 2021; current pre-50.2 builds ~$1.3–1.7M";
b.priceUsed =
  "Used ~$850k–$1.1M for 2017–2021 hulls; loaded/newer to ~$1.3–1.75M. Amels hold value exceptionally — near-zero real depreciation";
b.budgetText =
  "Tight — a clean 2017–2019 example can dip toward $850–950k (under $1M), but most sit above it, and the famously firm resale means few bargains. Budget hard, but you're buying an asset that holds value.";

// ---- score objects (mutate in place) ----
Object.assign(b.scores, {
  protection: 5,
  handling: 4.5,
  dogs: 2.5,
  workshop: 4.5,
  storage: 4.5,
  tankage: 4,
  highlat: 3,
  tropical: 5,
  budget: 2.5,
});

// ---- arrays (reassign wholesale) ----
b.tags = [
  "Enclosed center cockpit",
  "Push-button sailing",
  "Walk-in engine room",
  "EYOTY 2018 winner",
];
b.fun = [
  "Amel's first sloop in ~20 years and the modern heir to the legendary Super Maramu — the couple's-circumnavigator icon, reimagined with a wide hull and twin rudders.",
  "Hull #30 'Gaïa' sailed La Rochelle → the Caribbean → the Chilean fjords → French Polynesia as a floating science observatory; the 100th hull, 'Grace,' left to circumnavigate full-time.",
  "The cockpit sole lifts on gas struts to a stand-up, watertight engine room — and a single sea-chest feeds the raw-water systems through one hull penetration.",
  "European Yacht of the Year 2018 (Luxury Cruiser), beating the Hallberg-Rassy 44 and Ice 60.",
];
b.notable =
  "European Yacht of the Year 2018 (Luxury Cruiser) and SAIL Best Boats 2020; 100+ built since 2017. The modern, push-button heir to the Super Maramu — with real ocean miles (the Courvoisiers' science voyage to Polynesia, the Nydrle family's 19-day Atlantic crossing on 'Liberty II', World-ARC circumnavigators) — superseded by the Amel 50.2 for 2026.";
b.priceExamples = [
  "New ~€790,000 ex-VAT base (2017); ~$1.1M sailaway",
  "2019 — €890,000 incl. VAT (France, Sizun & Charpentier)",
  "2024 'one-year-old' — €1,050,000 ex-VAT, sold (Martinique, Caraibe Yachts)",
  "2025 — ~$1.77M (France, Sizun & Charpentier)",
];
b.sources = [
  { name: "Amel — official", url: "https://amel.fr/en/our-yachts/amel-50/" },
  { name: "Boat test — Yachting World (Pip Hare)", url: "https://www.yachtingworld.com/boat-test/amel-50-review-120818" },
  { name: "Boat test (numbers) — Yachting Monthly (Pip Hare)", url: "https://www.yachtingmonthly.com/reviews/yacht-reviews/amel-50" },
  { name: "Boat review — SAIL (Tom Dove)", url: "https://sailmagazine.com/boats/boat-review-amel-50/" },
  { name: "Boat of the Year review — Cruising World", url: "https://www.cruisingworld.com/story/sailboats/boat-review-amel-50/" },
  { name: "On test — YACHT (Jochen Rieker)", url: "https://www.yacht.de/en/yachts/cruising-yachts/amel-50-on-test-modern-cruising-boat-in-the-50-foot-luxury-class/" },
  { name: "Specs — Boat-Specs", url: "https://www.boat-specs.com/sailing/sailboats/amel/amel-50" },
  { name: "Buying/owning guide — Amel School (Bill Rouse)", url: "https://www.amelschool.com/p/guide-to-acquiring-amel-yacht.html" },
  { name: "Atlantic crossing account — Family on the Boat", url: "https://www.familyontheboat.com/blog/if-you-dont-go-you-dont-know-sailing-across-the-atlantic" },
];
b.youtube = [
  { name: "Sailing Amazing Grace", url: "https://www.youtube.com/@SailingAmazingGrace", note: "Owners of Amel 50 hull #100, circumnavigating full-time" },
  { name: "Sailing Mirage — 2-year owner review", url: "https://www.youtube.com/watch?v=KnzDI3l6rIY", note: "Candid 'five wishes for next-gen push-button sailing'" },
  { name: "Family on the Boat — 'Liberty II'", url: "https://www.youtube.com/watch?v=EwTu0-GXGBM", note: "Czech family's Amel 50 circumnavigation (Atlantic crossing documented)" },
  { name: "Amel (official)", url: "https://www.youtube.com/@AmelYachts", note: "Builder walkthroughs & owner spotlights" },
  { name: "Sailing Unknown — critical test sail", url: "https://www.youtube.com/watch?v=Fvsg4gMNmXI", note: "'All hype or true bluewater boat?'" },
];
b.pros = [
  "Best-in-class enclosed hardtop center cockpit — a fully sheltered, all-weather helm for hot trades and cold-weather comfort alike.",
  "The most genuinely push-button boat here: electric in-mast main, electric genoa + self-tacking staysail, electric winches and bow thruster — a couple sails and reefs it from the seat.",
  "Class-leading walk-in watertight engine room with stand-up access to every system; a single sea-chest reduces through-hulls.",
  "Exceptional, secure liveaboard stowage and a luxurious, light-filled, climate-controlled interior — \"never seen a more efficient use of space\" (Cruising World).",
  "European Yacht of the Year 2018, a deep owners' network (AmelYachtOwners, the Amel school) and famously firm resale.",
  "Real ocean record: ARC/World-ARC crossings, the Courvoisiers' La Rochelle→Polynesia science voyage, the Nydrles' 19-day Atlantic passage.",
];
b.cons = [
  "More motorsailer than sailboat in light air — modest sail area on a ~19-t hull means \"it will spend much time under power\" (Ralph Naranjo, Cruising World).",
  "Push-pull cable steering gives \"little feeling\" (Pip Hare); high windage makes it tricky at low speed and effectively bow-thruster-dependent in a marina.",
  "GRP hull + fixed 2.15 m iron-ballast keel: no beaching/shoal access, no ice capability, and a hard grounding is consequential — not an expedition/high-latitude boat (that's the Garcia).",
  "Modest stability metrics for serious bluewater: ~28% iron (not lead) ballast and an unpublished AVS — critics rate righting moment below heavier-ballasted peers (e.g. Hallberg-Rassy 44 ~40%).",
  "Systems-heavy and proprietary: \"the single biggest maintenance challenge is the sheer number of systems\" (Bill Rouse), with some \"only made in France\" parts slow to source when remote.",
  "Documented teething/owner issues: early aft-cabin engine noise (since fixed), in-mast furling-motor seizures, halyard-wrap forestay/mast risk, and Atlantic-crossing gear failures (autopilot, boom traveller) — survey the iron keel on aging hulls.",
];
b.awards = [
  "European Yacht of the Year 2018 — Luxury Cruiser (winner)",
  "SAIL Best Boats 2020 — Best Monohull Cruising Boat 41–50 ft",
  "Cruising World Boat of the Year 2020 — Full-Size Cruiser 45–55 ft (runner-up)",
];
b.endorsements = [
  {
    who: "Yachting World (Pip Hare)",
    note: "\"I left surprised and ever so slightly in love\" — punching upwind in a December gale \"oblivious to the weather raging outside,\" though the push-pull helm \"has little feeling.\"",
    url: "https://www.yachtingworld.com/boat-test/amel-50-review-120818",
  },
  {
    who: "Cruising World (Ralph Naranjo, BOTY judge)",
    note: "\"A well-built vessel that, to me, is more of a motorsailer than a traditional cruising sailboat; it will spend much time under power\" — and iron rather than lead ballast trades away righting moment.",
    url: "https://www.cruisingworld.com/story/sailboats/boat-review-amel-50/",
  },
  {
    who: "Amel School (Bill Rouse, 40,000+ Amel nm)",
    note: "\"The single biggest maintenance challenge on any Amel is the sheer number of systems\"; certain \"only made in France\" parts are hard to source when cruising remotely.",
    url: "https://www.amelschool.com/p/guide-to-acquiring-amel-yacht.html",
  },
  {
    who: "YACHT (Jochen Rieker)",
    note: "\"The most modern cruising boat in the 50-foot luxury class. No competitor offers the crew more protection and comfort in the cockpit\" — an absolute recommendation for long blue-water cruises.",
    url: "https://www.yacht.de/en/yachts/cruising-yachts/amel-50-on-test-modern-cruising-boat-in-the-50-foot-luxury-class/",
  },
];

// ---- own (mutate fields in place) ----
b.own.mastStep =
  "Deck-stepped (per Boat-Specs.com) — the proprietary four-compartment extruded-alloy spar sits on deck over an internal compression structure that carries rig loads into the hull; electric in-mast furling; carbon mast optional on later (Evolution) hulls";
b.own.keelRudder =
  "Bolted cast-iron (not lead) fin keel with bulb on a keel-sump stub · TWIN spade rudders driven by push-pull cables · vacuum-infused GRP hull (solid glass below the waterline, foam-cored topsides) with 4–5 watertight compartments and a single raw-water sea-chest";
b.own.complexity =
  "High — electric in-mast main + electric genoa + self-tacking staysail furlers, powered winches, retractable bow thruster, genset, watermaker, A/C, washer-dryer, a 24V system and a single 'sea-chest' through-hull. Day-to-day operation is genuinely easy; the depth of integrated systems is the burden.";
b.own.maintain =
  "Mixed. The stand-up engine room and single sea-chest make access and leak-isolation outstanding, and day-to-day use is easy — but the many proprietary, integrated systems (in-mast furling, push-pull steering, electric furlers) want Amel-trained techs and factory parts for deep work, and 'only made in France' spares can be slow to reach remote cruising grounds.";
b.own.partsText =
  "Amel remains an active La Rochelle builder (now part of Groupe Beneteau) with first-class factory support and a strong owners' network; mainstream Volvo engine and a conventional shaft (the 50 dropped the old Aquadrive). The proprietary furling/steering/sea-chest systems route through the yard — moderate parts risk, lower than the niche aluminium builders.";
b.own.problems =
  "Limited but accumulating field data (since 2017). Documented: early hulls measured a loud 83 dB in the aft cabin under power (Amel fixed it with added insulation + a new prop, to ~70 dB); in-mast furling-motor gearbox seizure from missing grease (a recurring owners' thread); at least one Amel 50 dismasted when a halyard wrapped the genoa furler in light air, with several forestay-damage cases traced to slack light-air halyards; an Atlantic-crossing owner ('Liberty II') lost the primary autopilot and tore the boom traveller from the deck in a squall; an 'A50 mast/boom corrosion' owners' thread exists (carbon mast offered as an alternative). Iron keel = survey the bolts/stub on aging hulls; Bill Rouse warns the used market hides total-loss rebuilds and grounding damage — survey hard.";
b.own.sentiment =
  "Rated a superbly built, genuinely ocean-ready 'complete package' you run from a sheltered enclosed helm, with the easiest short-handing in its class and famously firm resale. The honest minority view: expensive, heavy in light air ('motorsailer'), the enclosed helm detaches you from the boat's feel, and a couple of testers/owners found the finish less plush than the price implies.";
b.own.risks = [
  "Light-air performance is modest — it motors a lot; not for those who want engaged sailing",
  "High, proprietary systems complexity — Amel-trained service & French factory spares for deep work",
  "GRP + fixed deep iron keel — no beaching/ice; a hard grounding is consequential; survey the keel on older hulls",
  "Modest published stability data (unpublished AVS, ~28% iron ballast) — solid within its temperate/tropical envelope, less margin than heavier-ballasted peers",
  "High purchase & running costs — offset by exceptional resale and an outstanding owners' community/school",
];
Object.assign(b.own.scores, { maintain: 3, simplicity: 2, parts: 4, community: 5 });

// ---- write back, matching the file's 2-space indent + trailing newline ----
const out = JSON.stringify(boats, null, 2) + (raw.endsWith("\n") ? "\n" : "");
writeFileSync(path, out);
console.log(`Enriched amel (Amel 50): ${b.pros.length} pros, ${b.cons.length} cons, ${b.sources.length} sources, ${b.endorsements.length} endorsements, ${b.awards.length} awards`);
