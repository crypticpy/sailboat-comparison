// Author the Moody Deck Saloon "whole DS line": add 45DS, DS48, DS41 as new
// catalog boats and enrich the existing Decksaloon 54 (moodyds54) to
// Boréal/Garcia depth. Sourced from four parallel offshore-research dossiers
// (see scripts/moody-research/ summaries in the commit message / sources arrays).
// Deterministic transform of data/boats.json — run once, then sync to Supabase.
import { readFileSync, writeFileSync } from "node:fs";

const path = new URL("../data/boats.json", import.meta.url);
const boats = JSON.parse(readFileSync(path, "utf8"));

// ---------------------------------------------------------------------------
// 1) ENRICH the existing Moody Decksaloon 54 (moodyds54)
// ---------------------------------------------------------------------------
const ds54 = boats.find((b) => b.id === "moodyds54");
if (!ds54) throw new Error("moodyds54 not found");

Object.assign(ds54, {
  years: "2014–present",
  designer: "Bill Dixon (deck saloon/styling) · Judel/Vrolijk (Hanse 575/588 hull)",
  bestFor:
    "The cruising couple who want a catamaran-style, single-level, glass-walled bluewater monohull where dogs and a less-mobile crew never face a companionway ladder — and who will plan passages around weather rather than punch through it.",
  protectionText:
    "Exceptional, and the boat's \"winning hand.\" The cockpit shares one level with the saloon via sliding glass doors; you can stand a watch from the inside helm/nav seat in \"complete protection and all-round visibility\" (Yachting World), running the autopilot from a wireless remote (owner Adam Sutton). Substantial bulwarks and inboard/outboard handrails make the side decks \"the most secure we've seen\" (BOTY judges).",
  highLatText:
    "Very good — an enclosed, all-round-visibility deck saloon lets a short-handed crew keep watch and steer without exposure in cold, wet weather. Cat A hull, secure side decks. Honest watch-outs: extensive glazing means real heat loss and condensation (Yachting World saw fogging in cold trials and noted blinds were unavailable at test), and a large systems/heating load.",
  tropicalText:
    "Excellent — the retractable bimini and shaded saloon give superb sun protection; sliding doors + hatches give cross-ventilation; A/C typical; the swim platform and one-level living are perfect for anchorages. One owner did flag the glass saloon getting hot in the Med without A/C.",
  priceText: "$700k–$950k (used)",
  priceNew:
    "New base ~$784,500 (US, 2017) / €549,000 (EU, 2015); well-equipped ~$1.1M",
  priceUsed: "Used ~$700k–$950k (2014–2019); newer/loaded examples toward $1M+",
  priceMinUSD: 700000,
  priceMaxUSD: 950000,
  budgetText:
    "A clean used 2014–2019 DS54 fits under $1M (a 2019 example listed at US$850k); new is above budget. The single-level layout is its killer feature for this crew. It rides the same Judel/Vrolijk hull as the cheaper Hanse 575/588 — but those trade the protected saloon for an open aft cockpit.",
  priceExamples: [
    "2019 \"Harmony\" — US$850,000 (Berthon, Wickford RI)",
    "2016 Moody DS54 — US$949,000 (IVT Yacht Sales, San Diego)",
    "2014 — ~€700,000 (Union Yachts, Italy); 2015 ~€735,000 (De Valk)",
  ],
  notable:
    "No single famous campaign, but a DS54 (\"Mojeka\") sailed the 2015 ARC+ — 3,125 nm Las Palmas→Cape Verdes→St Lucia in 12 days, finishing in the top four of its group — and owners cruise them transatlantic and in the Med/Caribbean. It is Moody's flagship long-range deck-saloon model.",
});

ds54.fun = [
  "A DS54 named \"Mojeka\" crossed the Atlantic in the 2015 ARC+ — 3,125 nm in 12 days, finishing top-four in its group, furling sail \"at the touch of a button\" through a storm front.",
  "The deck-saloon concept revived a near-200-year-old British marque under German (Hanse) ownership — a Judel/Vrolijk hull (shared with the Hanse 575/588) wearing a Bill Dixon \"lifestyle\" deck.",
  "BOTY judges singled out \"the most secure side decks we've seen\" and the genuinely livable one-level layout; a hydraulically folding transom becomes a beach-club swim platform.",
];

ds54.cons = [
  "Plan passages around weather: in a Force 7 and steep seas testers reported slamming and needing the engine to keep her tracking — \"owners will need to plan passages carefully\" (Yachting World).",
  "Tall and \"a lot of boat to manage\": heeled, the raised saloon leaves \"hard to find any bracing,\" and \"a rolling sea quickly makes you realise how high up you are.\"",
  "Moderate fuel tankage (~138 gal) limits motoring range for the longest crossings — plan fuel/jerry cans plus a watermaker.",
  "Massive glazing means heat loss, condensation and big A/C/heating loads; insulation and a strong heater are mandatory for Patagonia.",
  "Systems-heavy \"apartment afloat\" with electric galley and digital switching — more to maintain and a large power budget far from support.",
  "8'8\" deep keel (shoal still 7'5\") limits gunkholing; high windage from topsides loads the helm and complicates close-quarters handling.",
];

ds54.sources = [
  { name: "Moody (HanseYachts) — official", url: "https://moody-yachts.com/gb/sailing-yachts/moody-decksaloon-54/" },
  { name: "Specs — Boat-Specs (deep draft)", url: "https://www.boat-specs.com/sailing/sailboats/moody/moody-54-ds-deep-draft" },
  { name: "Boat test (heavy-weather candour) — Yachting World", url: "https://www.yachtingworld.com/reviews/boat-tests/moody-54ds-boat-test" },
  { name: "Boat review (two-up, inside steering) — SAIL", url: "https://sailmagazine.com/boats/boat-review-moody-ds54/" },
  { name: "Review (Judel/Vrolijk hull, layup) — Cruising World", url: "https://www.cruisingworld.com/moody-ds-54-boat-review/" },
  { name: "\"Sail around the world\" test — Blue Water Sailing", url: "https://www.bwsailing.com/bw/moody-deck-saloon-54/" },
  { name: "ARC+ 2015 crossing — DS54 \"Mojeka\"", url: "http://www.yachting-pleasure.com/state-of-the-art-bluewater-yacht-moody-ds54-in-the-top-four-at-arc/" },
  { name: "Owner experiences — Moody Owners Information Exchange", url: "https://www.moodyowners.info/threads/moody-ds-41-45-54-owner-experience-advice.20166/" },
];

ds54.endorsements = [
  {
    who: "Yachting World (Toby Hodges)",
    note: "\"The ability to stand a watch here in complete protection and all-round visibility is the Moody's winning hand\" — though testers reported slamming and needing the engine to track in a Force 7.",
    url: "https://www.yachtingworld.com/reviews/boat-tests/moody-54ds-boat-test",
  },
  {
    who: "SAIL (Zuzana Prochazka)",
    note: "\"Despite its large sail area and a displacement of over 53,000 lb, the Moody DS54 is remarkably easy to sail with just two\"; inside steering means watch-standers \"don't have to leave the comfort of the interior on long passages.\"",
    url: "https://sailmagazine.com/boats/boat-review-moody-ds54/",
  },
  {
    who: "Blue Water Sailing (George Day)",
    note: "\"This is a boat that you could easily sail around the world and I'd be quite happy to give it a try\" — 42° to the true wind, tacking in just over 80°.",
    url: "https://www.bwsailing.com/bw/moody-deck-saloon-54/",
  },
];

ds54.youtube = [
  { name: "Moody yard — official guided tour", url: "https://www.youtube.com/watch?v=FjPT70UhfVk", note: "Builder walkthrough" },
  { name: "IVT 2016 DS54 walkthrough", url: "https://www.youtube.com/watch?v=bHMoTyA1jHY", note: "Detailed brokerage tour" },
  { name: "2021 DS54 \"Easy\" owner walkthrough", url: "https://www.youtube.com/watch?v=fjtgjp9Zbvs", note: "Owner's-eye tour" },
  { name: "Moody DS54 official", url: "https://www.youtube.com/watch?v=JHk0v__4nSU", note: "Builder feature" },
];

ds54.own.communities = [
  { name: "Moody Owners Information Exchange", url: "https://www.moodyowners.info/threads/moody-ds-41-45-54-owner-experience-advice.20166/" },
  { name: "Moody (HanseYachts) official", url: "https://moody-yachts.com/gb/sailing-yachts/moody-decksaloon-54/" },
];

ds54.own.problems =
  "No widespread documented DS54 fault pattern; reviews largely positive (the single spade rudder was \"well up to the job\"). Considerations: a single spade rudder is less grounding-tolerant; the large saloon windows are an inherent heavy-weather exposure; condensation/fogging on the big glazing in cold weather; many electrically-actuated systems are potential maintenance points.";

// ---------------------------------------------------------------------------
// 2) NEW BOATS
// ---------------------------------------------------------------------------
const moody45ds = {
  id: "moody45ds",
  name: "Moody 45DS",
  builder: "Moody (HanseYachts / AD Boats) · Germany",
  designer: "Bill Dixon (interior Mark Tucker)",
  color: "#41607a",
  years: "2007–c.2014",
  material: "GRP (early hulls epoxy)",
  category: "Deck-saloon & pilothouse",
  loa: "45'0\" (13.72 m)",
  loaN: 13.72,
  lwl: "42'4\" (12.93 m)",
  beam: "14'11\" (4.57 m)",
  beamFt: 14.92,
  lwlFt: 42.33,
  dispLb: 30865,
  draftMin: "5'5\" (1.65 m shoal)",
  draftMinN: 1.65,
  draftMax: "6'6\" (1.99 m deep)",
  displacement: "~14,000 kg / 30,865 lb (light)",
  ballast: "~4,300 kg cast iron",
  ballastRatio: "~31%",
  sailArea: "98 m² / 1,055 ft² (62 main + 36 self-tacking jib)",
  sad: "~18",
  dl: "~180",
  airDraft: "~21.8 m / 71'6\"",
  engine: "Yanmar 4JH 75 hp (110 hp opt)",
  drive: "Saildrive",
  cabins: "2–3 cabins / 2 heads",
  keel: "Fin keel (cast iron) + TWIN spade rudders & twin wheels; deep (1.99 m) or shoal (1.65 m)",
  cockpit: "Single-level deck saloon: cockpit and saloon share one level via aft sliding 'patio' doors; hardtop; sheltered inside nav/helm seat with autopilot control",
  cockpitType: "Single-level deck saloon",
  bestFor:
    "The couple who want the single-level, dog-friendly deck-saloon formula in a smaller, far more affordable and genuinely crossing-proven package — the most ocean-documented Moody DS, and one that fits well under a $1M budget.",
  protectionText:
    "Strong. A hardtop and aft sliding 'patio' doors close the cockpit to the saloon on one level; reviewers liked sitting at the inside seat \"autopilot in hand, as the rain pelts down\" (Blue Water Sailing), and owners report keeping watch \"warm, dry and safe\" on Atlantic crossings. Calf-height bulwarks + SS handrails. Honest caveat: forward visibility from the outside wheels is poor (you look through the coachroof), and owners warn the patio doors \"don't stand a chance against green water.\"",
  rig: "9/10 fractional sloop, triple swept spreaders, self-tacking jib, Park-Avenue boom; in-mast furling main common.",
  handlingText:
    "Genuinely two-handed: self-tacking jib makes tacking \"a simple singlehanded operation\" (SAIL), all lines led aft, twin wheels, twin rudders that track straight when pressed and avoid excess weather helm. Catch: the high boom means climbing onto the coachroof to reach the stack-pack, so in-mast furling is favoured for short-handed reefing.",
  engineWorkshop:
    "Yanmar 75 hp (110 hp optional) under the saloon/cockpit sole; reasonable access via the companionway/aft but behind joinery — an engine-behind-panels yacht, not a walk-in workshop. A big aft lazarette swallows expedition gear (one owner stowed a dive compressor).",
  systems:
    "12V + 220V, shore power and charger; offshore examples add a genset, 3.5 kW inverter, watermaker, radar/AIS and satcomms — the Australian circumnavigation boat \"One Step Ahead\" carried all of it.",
  storageText:
    "Good for 45 ft — a large aft lazarette, deep lockers and big tankage (640 L fuel / 800 L water) give real autonomy; the single-level layout frees living-floor area.",
  fuel: "640 L / 169 gal",
  fuelN: 640,
  water: "800 L / 211 gal",
  waterN: 800,
  rangeText:
    "Big tankage for the size (640 L fuel / 800 L water) supports long passages; ~800–1,000 nm motoring range (estimate).",
  accommodation:
    "Single-level cockpit↔saloon living via sliding patio doors — dogs and a less-mobile crew move between sheltered saloon and cockpit with NO companionway ladder. Typically 3 cabins / 2 heads with a forward master; only the sleeping cabins need stairs.",
  highLatText:
    "Good — a sheltered, autopilot-controlled inside watch position keeps a short-handed crew warm and dry, proven in 30–35 kn / 3 m North Sea conditions. Less specialised than a heated alloy doghouse boat: large single-skin glazing means heat loss/condensation, and the aft patio doors are the heavy-weather weak point.",
  tropicalText:
    "Excellent — hardtop and bimini shade, sliding doors and hatches for cross-ventilation, and single-level living for easy anchorage life; shoal 1.65 m keel option helps in reefy waters.",
  priceText: "$320k–$550k (used)",
  priceNew: "New ~$798k base / ~$950k optioned (2008)",
  priceUsed: "Used ~$320k–$550k (asking; 2008–2014; common in EU/Australia, rare in the US)",
  priceMinUSD: 320000,
  priceMaxUSD: 550000,
  budget: "fit",
  budgetN: 1,
  budgetText:
    "Comfortably under $1M — the value entry to the Moody DS world and the most crossing-proven of the line. A clean European/Australian example asks ~$320k–$550k; few are in the US, so budget for import/survey.",
  priceExamples: [
    "2010 Moody 45DS — €295,000 (Apollo Duck, EU)",
    "2011 \"In The Mood\" — AUD 750,000 (Yacht Sales Co., Auckland)",
    "2009–2021 range — £319,630–£478,491 (Apollo Duck aggregate)",
  ],
  scores: {
    protection: 4.5,
    handling: 4.5,
    dogs: 5,
    workshop: 3,
    storage: 4,
    tankage: 4,
    highlat: 3.5,
    tropical: 4.5,
    budget: 4,
  },
  tags: ["Single-level living", "No companionway ladder", "Crossing-proven", "Best value DS"],
  fun: [
    "Owners \"Happy\"/\"Karma\" took their 45DS close-hauled in 30 kn off a lee shore on day three of ownership, then crossed from Sweden to Florida: \"she sails like a dream… smooth, fast, and maneuverable with those twin rudders.\"",
    "An owner who crossed the Atlantic twice in a DS: \"you can happily be on watch in any weather whilst remaining warm, dry and safe! I would sail anywhere in one!\"",
    "\"One Step Ahead\" (hull No. 39, the last epoxy hull) was fitted out for an in-company circumnavigation of Australia — watermaker, genset, satphones and all.",
  ],
  notable:
    "The original single-level Moody deck saloon and Moody's first model under Hanse ownership — and the most ocean-documented of the DS line, with North Sea heavy-weather, Sweden→Florida and twin-Atlantic owner accounts.",
  sources: [
    { name: "Specs — Boat-Specs (deep draft)", url: "https://www.boat-specs.com/sailing/sailboats/moody/moody-45-ds-deep-draft" },
    { name: "Specs/ratios — SailboatData", url: "https://sailboatdata.com/sailboat/moody-45-ds/" },
    { name: "Boat test — SAIL (Bill Springer)", url: "https://swizzlesportsmedia.com/boat-test-moody-45ds/" },
    { name: "Design analysis — SAILING (Robert Perry)", url: "https://sailingmagazine.net/article-29-moody-45ds.html" },
    { name: "Review — Cruising World", url: "https://www.cruisingworld.com/sailboats/moody-45ds-mini-review/" },
    { name: "North Sea + Sweden→Florida — 48° North \"My Boat\"", url: "https://48north.com/boats-and-gear/my-boat/my-boat-2012-moody-45ds-happy/" },
    { name: "\"One Step Ahead\" offshore fit-out — Trade-a-Boat", url: "https://www.tradeaboat.com.au/news-reviews/7565-moody-45ds-around-australia-special-review" },
    { name: "Owner experiences (green-water, reefing) — YBW Forum", url: "https://forums.ybw.com/threads/moody-45-ds.511929/" },
  ],
  youtube: [
    { name: "Moody 45DS — sailing/walkthrough", url: "https://www.youtube.com/results?search_query=moody+45ds", note: "Brokerage & owner tours (no dedicated voyage channel verified)" },
  ],
  pros: [
    "The most crossing-proven Moody DS — real North Sea heavy-weather, Sweden→Florida and twin-Atlantic owner accounts.",
    "Single-level saloon-to-cockpit living via sliding patio doors — outstanding for two dogs and a smaller/less-strong crew (no ladder).",
    "Genuinely short-handed: self-tacking jib, all lines aft, twin wheels + twin rudders (redundant, straight-tracking, light helm).",
    "Big tankage for 45 ft (640 L fuel / 800 L water) and CE Category A.",
    "Far cheaper than the rest of the DS line — a clean example fits well under $1M.",
  ],
  cons: [
    "The aft 'patio' doors/glazing are the heavy-weather weak point — owners warn they \"don't stand a chance against green water.\"",
    "Poor forward visibility from the outside wheels (you look through the coachroof, worse with condensation) — tiring on passage.",
    "High boom: reaching the stack-pack means climbing on the coachroof, so deep slab reefing is awkward (in-mast furling preferred).",
    "Tender once it blows (~31% ballast) and high topsides/windage; modest comfort ratio (~28.9).",
    "Rare in the US — thinner parts/dealer support outside Europe/Australia; some early-Hanse-era QC complaints.",
  ],
  awards: [],
  endorsements: [
    {
      who: "Owner Hugh Creasy (45DS \"Happy\")",
      note: "\"The fin keel and twin rudders make this boat sail like a dream — she has a great motion and speed… smooth, fast, and maneuverable.\"",
      url: "https://48north.com/boats-and-gear/my-boat/my-boat-2012-moody-45ds-happy/",
    },
    {
      who: "SAIL (Bill Springer)",
      note: "\"Well-balanced and almost sailed itself in a wide groove\"; the self-tacking jib makes tacking \"a simple singlehanded operation\" — though \"I found myself constantly trying to look over or around the coachroof when steering.\"",
      url: "https://swizzlesportsmedia.com/boat-test-moody-45ds/",
    },
  ],
  badge: "Crossing-proven",
  own: {
    mastStep: "Keel-stepped (Seldén alloy, triple spreaders)",
    keelRudder: "Bolted cast-iron fin keel (deep/shoal) · TWIN semi-balanced spade rudders (fitted to stop the beamy aft sections ventilating the rudder when heeled) · GRP hull (early hulls epoxy)",
    complexity: "Moderate — twin-wheel/twin-rudder steering, self-tacking jib and in-mast furling; far simpler than the bigger DS54/DS48, though offshore examples layer on genset/watermaker/inverter.",
    maintain: "Moderate — mainstream Yanmar/Lewmar/Seldén hardware, but it's an engine-behind-joinery boat and the deck-saloon glazing/door seals want attention.",
    partsText: "Good — built by HanseYachts AG, shares hardware with the Hanse range and a wide European dealer network; Yanmar engine. US support is thin (the boats are concentrated in Europe and Australia).",
    problems: "Recurring themes are window/door seal leaks (common across Moody's deck-saloon glazing) and the green-water exposure of the aft patio doors; some early-Hanse-era new-boat QC complaints. No verified pattern of rudder, keel or rig structural failures.",
    sentiment: "Strongly positive on motion, the protected watch position and short-handed ease; the consistent gripes are forward visibility and roof-access reefing.",
    communities: [
      { name: "Moody Owners Information Exchange", url: "https://www.moodyowners.info/threads/moody-ds-41-45-54-owner-experience-advice.20166/" },
      { name: "Cruisers Forum — \"Moody 45DS: Safe Ocean Cruiser?\"", url: "https://www.cruisersforum.com/forums/f47/moody-45ds-safe-ocean-cruiser-34899.html" },
      { name: "YBW Forum — Moody 45 DS", url: "https://forums.ybw.com/threads/moody-45-ds.511929/" },
    ],
    risks: [
      "Aft patio doors/glazing vs green water — the key offshore exposure",
      "Poor forward visibility from the outside helm",
      "Roof-access reefing; high windage; tender once it blows",
      "US-rare — import/survey and thin local parts support",
    ],
    scores: { maintain: 3, simplicity: 3, parts: 3, community: 3 },
  },
  engineHp: 75,
};

const moodyds48 = {
  id: "moodyds48",
  name: "Moody Decksaloon 48",
  builder: "Moody (HanseYachts) · Germany",
  designer: "Bill Dixon / Dixon Yacht Design",
  color: "#34536f",
  years: "2024–present",
  material: "GRP",
  category: "Deck-saloon & pilothouse",
  loa: "50'7\" (15.42 m)",
  loaN: 15.42,
  lwl: "45'4\" (13.83 m)",
  beam: "15'11\" (4.85 m)",
  beamFt: 15.92,
  lwlFt: 45.33,
  dispLb: 46650,
  draftMin: "5'11\" (1.80 m shoal)",
  draftMinN: 1.8,
  draftMax: "7'1\" (2.15 m deep)",
  displacement: "~21,160 kg / 46,650 lb",
  ballast: "~5.5–6.2 t (sources vary)",
  ballastRatio: "~26–29%",
  sailArea: "131 m² / 1,409 ft² (79 main + 52 jib); ~156 m² with reacher",
  sad: "~17.4",
  dl: "~223",
  airDraft: "~24.1 m / 79'",
  engine: "Yanmar 110 hp (150 hp opt)",
  drive: "Saildrive",
  cabins: "up to 3 cabins / up to 3 heads",
  keel: "L-bulb keel: deep (2.15 m) or shoal (1.80 m) + a SINGLE deep spade rudder; twin wheels; bow/stern thrusters optional",
  cockpit: "Single-level deck saloon: cockpit and saloon on one level via sliding glass doors; hardtop; inside helm/nav with redundant autopilots",
  cockpitType: "Single-level deck saloon",
  bestFor:
    "The well-funded couple who want the newest, most refined single-level deck saloon for liveaboard cruising — and who can accept a brand-new model (launched 2024) with no ocean-crossing track record yet, at a near-new price.",
  protectionText:
    "Best-in-class on paper. Single-level cockpit↔saloon via sliding glass doors, hardtop, and a bright deck saloon that stays \"light, warm and supremely comfortable\" with all-round views — \"a boat that takes the brunt of the weather so you don't have to\" (Yachting World). Twin wheels with redundant, independent autopilots. Caveat: the big hardtop blocks forward sightlines — reviewers call a mast-mounted forward camera \"necessary.\"",
  rig: "Fractional sloop on a Seldén spar; self-tacking jib standard, furling genoa and reacher options; electric furling/winch package optional (and effectively required for easy short-handed work).",
  handlingText:
    "Set up for short-handed sailing — self-tacking jib, electric furlers and powered Lewmar winches, dual helms, bow+stern thrusters. The single deep rudder gives \"plenty of grip,\" but it's \"a more physical boat to helm\" in a broad-reaching seaway, and on test the autopilot \"was working hard, and once or twice let the boat round up\" — size the pilot/drive and reef conservatively.",
  engineWorkshop:
    "Yanmar 110 hp (150 hp opt) on a saildrive under the saloon sole; an integrated production fit-out with access behind joinery rather than a walk-in workshop. A large aft garage/lazarette is the most useful stowage/spares space.",
  systems:
    "Digital switching hub; typical spec adds genset, A/C/heating, watermaker, lithium house bank and electric galley — a large power budget and many electrically-actuated systems.",
  storageText:
    "Generous liveaboard volume (Moody claims ~25% more interior space) with deep lockers and an aft garage; the single-level layout frees living-floor area.",
  fuel: "570 L / 151 gal",
  fuelN: 570,
  water: "766 L / 202 gal",
  waterN: 766,
  rangeText:
    "Moderate fuel (570 L) for the size — plan fuel/jerry cans plus a watermaker for the longest legs; ~700–900 nm motoring (estimate).",
  accommodation:
    "Single-level cockpit↔saloon living via sliding glass doors — no companionway ladder, ideal for dogs and a less-mobile crew; up to 3 cabins / 3 heads with a full-width galley. Only the sleeping cabins need stairs.",
  highLatText:
    "Good on paper — sheltered, all-round-visibility inside watch position; CE Cat A, sea-kindly deep forefoot. Same deck-saloon caveats apply (heat loss/condensation through the big glazing; large systems load) and there is no cold-weather passage track record for the model yet.",
  tropicalText:
    "Excellent — hardtop and shaded saloon, sliding doors and hatches for ventilation, A/C typical, single-level anchorage living and a fold-down transom; shoal 1.80 m keel option helps in reefy waters.",
  priceText: "~$1.0M–$1.5M (new/near-new)",
  priceNew: "New base ~€864,900 net (2024); US ~$1.36M base, ~$1.5M loaded",
  priceUsed: "No real used market yet — cheapest listing ~€800k (~$860k, Turkey), effectively a current build",
  priceMinUSD: 860000,
  priceMaxUSD: 1500000,
  budget: "over",
  budgetN: 3,
  budgetText:
    "Over budget for most — it's a new-boat market at ~$1.0M–$1.5M with no proven depreciation yet (one ~$860k Turkish listing is effectively a current build). For the single-level layout under $1M, the used DS54 or 45DS are the realistic buys.",
  priceExamples: [
    "2024 Moody DS48 — €800,000 (Denison/TRIO Deniz, Turkey)",
    "2026 DS48 — base $1,366,000 (San Diego); sold ~$1,366,000 (Apr 2026)",
    "New base ~€864,900 net (boot Düsseldorf 2024)",
  ],
  scores: {
    protection: 5,
    handling: 4.5,
    dogs: 5,
    workshop: 3,
    storage: 4,
    tankage: 3.5,
    highlat: 4,
    tropical: 4.5,
    budget: 2,
  },
  tags: ["Single-level living", "No companionway ladder", "Inside steering", "Newest DS (2024)"],
  fun: [
    "Replaced the long-running 45DS after 16 years of the DS deck-saloon lineage — world premiere at boot Düsseldorf in January 2024, US debut at Newport that September.",
    "Yachting Monthly hopped it across the English Channel and called it \"a boat that takes the brunt of the weather so you don't have to.\"",
    "A 2025 Cruising World Boat of the Year finalist (Best Full-Size Cruiser Over 45 ft) and a SAIL Top 10 Best Boats 2025 nominee.",
  ],
  notable:
    "Moody's newest deck saloon, launched 2024 to replace the 45DS. Reviewed enthusiastically on sea trials (Channel, Newport) but — being so new — with no documented ocean crossings or owner voyaging accounts yet.",
  sources: [
    { name: "Boat test — Yachting World", url: "https://www.yachtingworld.com/reviews/boat-tests/moody-ds48-review-ambitious-cruising-plans-look-no-further" },
    { name: "Channel-crossing test — Yachting Monthly", url: "https://www.yachtingmonthly.com/reviews/yacht-reviews/moody-ds48-review-we-sail-this-new-yacht-across-the-english-channel-to-see-if-she-has-what-it-takes" },
    { name: "Sea trial — yacht.de (single rudder)", url: "https://www.yacht.de/en/yachts/cruising-yachts/moody-ds-48-comfortable-and-promising-deck-saloon-yacht-on-test/" },
    { name: "Review — Cruising World (2025 BOTY finalist)", url: "https://www.cruisingworld.com/sailboats/moody-ds48-liveaboard-cruiser/" },
    { name: "Top 10 Best Boats 2025 nominee — SAIL", url: "https://sailmagazine.com/boats/review-moody-ds48-top-10-best-boats-2025-nominee/" },
    { name: "World premiere (specs/price) — Sail-World", url: "https://www.sailworldcruising.com/news/270790/Countdown-to-Moody-DS48-world-premiere" },
    { name: "Official — Moody (HanseYachts)", url: "https://moody-yachts.com/us/sailing-yachts/moody-decksaloon-48/" },
  ],
  youtube: [
    { name: "Yachting Monthly — DS48 cross-Channel test", url: "https://www.youtube.com/watch?v=8L90bKJE6pM", note: "Sea-trial / passage feel" },
    { name: "Moody DS48 — premiere walkaround", url: "https://www.youtube.com/watch?v=Q_xVLaFW9Ic", note: "Boat-show tour" },
  ],
  pros: [
    "The most refined single-level deck saloon — cockpit↔saloon on one level, no companionway ladder (ideal for two dogs).",
    "Sheltered, bright saloon that stays \"light, warm and supremely comfortable\" at sea, with redundant autopilots for short-handed watches.",
    "CE Category A; heavy displacement (~21 t) and a deep forefoot give a steady, sea-kindly motion in tests.",
    "Strong short-handed kit: self-tacking jib, electric furlers/winches, dual helms, bow+stern thrusters.",
    "Performs well upwind for a tall, high-volume cruiser (Cruising World BOTY judges).",
  ],
  cons: [
    "Brand-new (2024) — NO documented ocean crossings or owner voyaging accounts yet; systems-at-sea reliability is unproven.",
    "Expensive: a new-boat market at ~$1.0M–$1.5M with no established used/depreciation pricing.",
    "Big hardtop blocks forward sightlines — reviewers call a mast-mounted forward camera \"necessary.\"",
    "\"Feels like a larger boat to helm\"; the autopilot \"was working hard\" and let her round up broad-reaching in a seaway — size the pilot and reef early.",
    "Single rudder on a beamy hull (less guaranteed bite at extreme heel than twin rudders), big glazing, high windage — the usual deck-saloon offshore tradeoffs.",
  ],
  awards: [
    "Cruising World Boat of the Year 2025 — Best Full-Size Cruiser Over 45 ft (finalist)",
    "SAIL Top 10 Best Boats 2025 (nominee)",
  ],
  endorsements: [
    {
      who: "Yachting Monthly (Theo Stocker)",
      note: "Sailing across the Channel: \"She has a feeling of gravitas, purpose and assurance that few can match… the rare ability to make prevailing conditions seem at least a force or two less.\"",
      url: "https://www.yachtingmonthly.com/reviews/yacht-reviews/moody-ds48-review-we-sail-this-new-yacht-across-the-english-channel-to-see-if-she-has-what-it-takes",
    },
    {
      who: "Yachting World",
      note: "\"The deep single rudder offered plenty of grip… The Moody DS48 is a boat that takes the brunt of the weather so you don't have to.\"",
      url: "https://www.yachtingworld.com/reviews/boat-tests/moody-ds48-review-ambitious-cruising-plans-look-no-further",
    },
  ],
  badge: "CW BOTY 2025 finalist",
  own: {
    mastStep: "Keel-stepped (Seldén alloy)",
    keelRudder: "Bolted L-bulb keel (deep/shoal) · SINGLE deep spade rudder · GRP hull",
    complexity: "High — electric furlers and winches, dual helms with redundant autopilots, drop-down thrusters, digital switching and a feature-rich production fit-out.",
    maintain: "Lower–Moderate — mainstream Yanmar/Lewmar/Seldén hardware and a wide dealer network help, but the density of electric/hydraulic systems and the complex deck-saloon structure favour dealer/yard servicing.",
    partsText: "Good — built by HanseYachts AG, sharing hardware and dealer support with the large Hanse range; Yanmar engine. (Note HanseYachts' corporate finances have been volatile.)",
    problems: "Too new for any recurring-fault record — none sourced, which reflects newness rather than a clean bill of health. Generic deck-saloon considerations apply: big single rudder, large glazing exposure, high systems count.",
    sentiment: "Very positive in early professional reviews (steady motion, protected saloon, able upwind); no owner-fleet sentiment yet.",
    communities: [
      { name: "Moody (HanseYachts) official", url: "https://moody-yachts.com/us/sailing-yachts/moody-decksaloon-48/" },
      { name: "Moody Owners Information Exchange", url: "https://www.moodyowners.info/" },
    ],
    risks: [
      "Brand-new model — no ocean track record, unproven systems-at-sea",
      "New-boat pricing ($1.0–1.5M); no used market to value against",
      "Forward visibility needs a mast camera; single rudder + big glazing offshore exposure",
      "High systems complexity to maintain far from support",
    ],
    scores: { maintain: 2, simplicity: 2, parts: 4, community: 2 },
  },
  engineHp: 110,
};

const moodyds41 = {
  id: "moodyds41",
  name: "Moody Decksaloon 41",
  builder: "Moody (HanseYachts) · Germany",
  designer: "Bill Dixon / Dixon Yacht Design",
  color: "#3d5c78",
  years: "2020–present",
  material: "GRP (chined hull)",
  category: "Deck-saloon & pilothouse",
  loa: "41'1\" (12.52 m)",
  loaN: 12.52,
  lwl: "37'6\" (11.42 m)",
  beam: "13'9\" (4.20 m)",
  beamFt: 13.78,
  lwlFt: 37.5,
  dispLb: 24692,
  draftMin: "6'1\" (1.85 m shoal)",
  draftMinN: 1.85,
  draftMax: "7'0\" (2.14 m deep)",
  displacement: "11,200 kg / 24,692 lb",
  ballast: "3,130 kg",
  ballastRatio: "~28%",
  sailArea: "86 m² / 924 ft² (48 main + 38 self-tacking jib)",
  sad: "~17",
  dl: "~210",
  airDraft: "19.9 m / 65'4\"",
  engine: "Yanmar 57 hp (80 hp opt)",
  drive: "Saildrive",
  cabins: "2 cabins / 1–2 heads",
  keel: "L-keel: shoal (1.85 m, TWIN rudders) or deep (2.14 m, single spade rudder); twin wheels; electric winches standard",
  cockpit: "Single-level deck saloon: cockpit and saloon on one level; raised inside helm/nav; 360° saloon glazing",
  cockpitType: "Single-level deck saloon",
  bestFor:
    "The couple who want the single-level, dog-friendly deck-saloon experience in the smallest, most manageable and most affordable size — best understood as a superb short-handed coastal/tradewind lifestyle cruiser rather than a heavy-weather ocean boat.",
  protectionText:
    "Strong for the size — a one-level cockpit↔saloon with a raised inside helm and 360° glazing lets you keep watch \"warm, dry and safe,\" steering from inside on the autopilot (owners use wireless remotes). High bulwarks and handrails all round. Caveats: glass glare/reflection underway and limited headsail visibility from the cockpit.",
  rig: "Fractional sloop on a Seldén spar; self-tacking jib on a track, all lines led aft to twin helms; 135% genoa optional; electric winches standard.",
  handlingText:
    "Marketed and reviewed as a fine short-handed boat — self-tacking jib, electric winches, lines to both helms, \"the design suits single-crew operation\" (YACHT). Honest catch: YACHT found the twin-rudder steering \"demands disproportionately high forces,\" so the manual helm/autopilot load can be heavy — budget for a robust pilot and verify on the specific hull.",
  engineWorkshop:
    "Yanmar 57 hp (80 hp opt) on a saildrive, well isolated (a quiet ~60 dB at 2,000 rpm); a compact production boat with access behind joinery, not a workshop boat.",
  systems:
    "12V/220V with shore power and charger; electric winches standard; typical cruising adds solar, a larger house bank, and optional heating/A-C — a moderate systems load for the size.",
  storageText:
    "Adequate for a couple — deliberately a two-cabin boat (no third cabin) to free saloon and stowage volume; tankage is modest (210 L fuel / 475 L water).",
  fuel: "210 L / 56 gal",
  fuelN: 210,
  water: "475 L / 125 gal",
  waterN: 475,
  rangeText:
    "Small fuel tank (210 L / 56 gal) limits motoring range in windless ocean stretches — its weakest passage-making spec; water (475 L) is ample for the size.",
  accommodation:
    "Single-level cockpit↔saloon living with no companionway ladder — ideal for dogs and a less-mobile crew; deliberately just 2 cabins (1–2 heads) with a large saloon, so it's a couple's boat, not a crew boat.",
  highLatText:
    "Fair–good — the elevated, enclosed saloon gives a sheltered, all-round-visibility watch position (\"psychological security\" in rough weather), and CE Cat A. But it's a lighter, smaller boat with big glazing — less reassuring in big cold seas than a heavy doghouse expedition boat.",
  tropicalText:
    "Excellent — 360° shaded glazing, a roof window to check the sails, good ventilation and single-level anchorage living; shoal 1.85 m standard draft suits reefy, thin water.",
  priceText: "$550k–$900k (used)",
  priceNew: "New ~€535k ex-VAT / ~€625k incl-VAT (2023)",
  priceUsed: "Used ~€495k–€690k in the EU (~$540k–$750k); US-commissioned examples to ~$900k",
  priceMinUSD: 550000,
  priceMaxUSD: 900000,
  budget: "fit",
  budgetN: 1,
  budgetText:
    "Fits under $1M — a used 2020–2023 EU example asks ~€495k–€690k (~$540k–$750k); US-commissioned boats run higher. The in-budget way into a current-generation Moody deck saloon, accepting it's a smaller, lighter, coastal/tradewind-leaning boat.",
  priceExamples: [
    "2020–2023 EU used — ~€495,000–€690,000 (~$540k–$750k, YachtWorld/annoncesbateau)",
    "2024 trade-in — ~US$899,000 (Seattle Yachts)",
    "New ~€624,631 incl-VAT (2023, ex-shipyard)",
  ],
  scores: {
    protection: 4.5,
    handling: 4,
    dogs: 5,
    workshop: 3,
    storage: 3.5,
    tankage: 2.5,
    highlat: 3.5,
    tropical: 4.5,
    budget: 4,
  },
  tags: ["Single-level living", "No companionway ladder", "Short-handed", "Smallest DS"],
  fun: [
    "Boating NZ: \"She would be a phenomenal platform for cruising with small children, short-handed, or with a reluctant spouse.\"",
    "Cruising World expected a so-so motorsailer and got 8 knots in 13 knots of breeze: \"'I expected this boat to sail like a typical motorsailer… Boy, was I wrong.'\" — named 2023 Best Full-Size Cruiser.",
    "Moody's own line: \"the greatest moment on a Moody is to sail her single-handed\" — float Magazin tested it as \"single-handed with three helms.\"",
  ],
  notable:
    "The smallest, newest and most affordable single-level Moody deck saloon (launched at boot Düsseldorf 2020). Reviewers praise it as a superb short-handed lifestyle cruiser; genuine ocean-crossing accounts specific to the 41 are scarce.",
  sources: [
    { name: "Boat test — Yachting World", url: "https://www.yachtingworld.com/reviews/boat-tests/moody-41ds-decksaloon-lifestyle" },
    { name: "Review — Yachting Monthly", url: "https://www.yachtingmonthly.com/reviews/yacht-reviews/moody-41-ds-a-deck-saloon-that-pushes-all-boundaries" },
    { name: "Review (2023 Best Full-Size Cruiser) — Cruising World", url: "https://www.cruisingworld.com/sailboats/sailboat-review-moody-ds-41/" },
    { name: "Sea trial (heavy helm, ~10 kn needed) — YACHT", url: "https://www.yacht.de/en/cruising-yachts/moody-ds-41-the-smallest-moody-in-the-yacht-test/" },
    { name: "Review (short-handed praise) — Boating NZ", url: "https://www.boatingnz.co.nz/boat-reviews/moody-ds41/" },
    { name: "Owner experiences & defects — Moody Owners Information Exchange", url: "https://www.moodyowners.info/threads/moody-ds-41.21954/" },
  ],
  youtube: [
    { name: "Moody DS41 — boot show walkthrough", url: "https://www.youtube.com/watch?v=v_RMjbX2a8k", note: "Boat-show tour (no dedicated voyage channel verified)" },
  ],
  pros: [
    "Single-level cockpit↔saloon with no companionway ladder — uniquely dog-friendly in a manageable 41-footer.",
    "Genuinely short-handed: self-tacking jib, electric winches standard, twin helms, inside autopilot steering — \"phenomenal short-handed platform\" (Boating NZ).",
    "Sails better than its motorsailer looks suggest (8 kn in 13 kn breeze); CE Category A; quiet, well-isolated engine.",
    "The in-budget way into a current-generation Moody deck saloon (used ~$540k–$750k in the EU).",
    "All-round-visibility raised saloon for sheltered, secure watch-keeping at anchor and underway.",
  ],
  cons: [
    "Scarce real ocean-crossing data specific to the 41 — best read as a coastal/tradewind lifestyle cruiser, not a heavy-weather ocean boat.",
    "Twin-rudder steering can be heavy (YACHT flagged \"disproportionately high forces\") — potential autopilot strain on long passages.",
    "Small fuel tank (210 L / 56 gal) limits motoring range; modest comfort ratio (~30) on a relatively light hull.",
    "Glass glare/reflection underway and poor headsail visibility from the cockpit; high windage wants ~10 kn to settle and perform.",
    "Newer, lower-volume model: thin used market and spares base, plus owner reports of windscreen-seal leaks, steering-cog rust and early-build bugs.",
  ],
  awards: [
    "Cruising World Boat of the Year 2023 — Best Full-Size Cruiser",
  ],
  endorsements: [
    {
      who: "Boating New Zealand",
      note: "\"She would be a phenomenal platform for cruising with small children, short-handed, or with a reluctant spouse.\"",
      url: "https://www.boatingnz.co.nz/boat-reviews/moody-ds41/",
    },
    {
      who: "Owner Adam Sutton (Moody DS)",
      note: "\"I have crossed the Atlantic a couple of times in a DS and is by far my favourite style of boat… I would sail anywhere in one!\" (refers to the DS line generally).",
      url: "https://www.moodyowners.info/threads/moody-ds-41-45-54-owner-experience-advice.20166/",
    },
  ],
  badge: "CW BOTY 2023",
  own: {
    mastStep: "Keel-stepped (Seldén alloy)",
    keelRudder: "Bolted L-keel · TWIN rudders on the shoal/standard boat, a SINGLE deep spade rudder on the deep-keel option · chined GRP hull",
    complexity: "Moderate — self-tacking jib, electric winches and twin-wheel steering with an inside autopilot helm; lighter on systems than the bigger DS boats.",
    maintain: "Moderate — mainstream Yanmar/Lewmar/Seldén/Jefa hardware and a wide dealer network, but it's a compact production boat with access behind joinery; deck-saloon glazing/seals want attention.",
    partsText: "Good — built by HanseYachts AG with Hanse hardware commonality and a broad European dealer network; Yanmar engine. US presence is growing but still limited.",
    problems: "Owner-reported on the Moody Owners forum: windscreen-seal water leaks, steering-wheel centre-cog rust, panel-connector/cable-routing fit-and-finish gripes, and early-build \"bugs and design errors\" with weak after-sales support; plus the heavy twin-rudder helm forces YACHT measured. Individual reports, not confirmed fleet-wide recalls.",
    sentiment: "Positive on the concept, short-handed ease and surprising sailing ability; the consistent gripes are build/finish niggles, heavy steering and window-seal leaks.",
    communities: [
      { name: "Moody Owners Information Exchange — DS41", url: "https://www.moodyowners.info/threads/moody-ds-41.21954/" },
      { name: "Moody (HanseYachts) official", url: "https://moody-yachts.com/us/sailing-yachts/moody-decksaloon-41/" },
    ],
    risks: [
      "Scarce 41-specific ocean-crossing data — coastal/tradewind-leaning",
      "Heavy twin-rudder helm forces; small fuel tank limits motoring range",
      "Windscreen-seal leaks / steering-cog rust / early-build bugs (owner reports)",
      "Thin used market & spares base on a young, low-volume model",
    ],
    scores: { maintain: 3, simplicity: 3, parts: 3, community: 3 },
  },
  engineHp: 57,
};

// ---------------------------------------------------------------------------
// 3) Splice the three new boats in right after moodyds54 (keep DS line grouped)
// ---------------------------------------------------------------------------
const idx = boats.findIndex((b) => b.id === "moodyds54");
boats.splice(idx + 1, 0, moody45ds, moodyds48, moodyds41);

writeFileSync(path, JSON.stringify(boats, null, 2) + "\n");
console.log(`Wrote data/boats.json: ${boats.length} boats`);
console.log("New:", ["moody45ds", "moodyds48", "moodyds41"].join(", "), "| Enriched: moodyds54");
