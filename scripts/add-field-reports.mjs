// Create lean, HONEST research records for three boats that had none, so their
// dossiers gain a "From the logbook" section + sourced owner-sentiment. These are
// field-report compilations from web sources I personally verified (magazine
// sea-trials, owner blogs/vlogs) — NOT the full Haiku-gather/Sonnet-verify pipeline.
// Climate/stability/storm/refit scoring is intentionally OMITTED (the dossier now
// renders those sections as an honest "not yet" rather than fabricated zeros).
//   node scripts/add-field-reports.mjs
import { writeFileSync } from "node:fs";

const PROVENANCE =
  "Field-report compilation (2026-06) from web sources verified by hand: magazine sea-trials, owner blogs and vlogs, and builder press. Not the full research pipeline — climate, stability, storm and refit scoring are intentionally omitted rather than estimated.";

function leanRecord({ id, name, sentiment, gaps, fieldReports }) {
  return {
    id,
    name,
    _provenance: PROVENANCE,
    research: {
      id,
      overall_confidence: 0.4,
      facts: [],
      sentiment,
      refit_items: [],
      provisioning_specific: [],
      gaps,
    },
    verify: {
      id,
      cleaned_facts: [],
      removed: [],
      fabrication_flags: [],
      verified_confidence: 0.4,
      verdict:
        "Field-report compilation from verified web sources; full fact-verification and climate/refit scoring deferred to the research pipeline.",
    },
    scores: {
      id,
      provisioning_specific: [],
      field_reports: fieldReports,
    },
  };
}

const records = [
  leanRecord({
    id: "boreal52",
    name: "Boréal 52",
    sentiment: {
      praise: [
        "Surprisingly nimble in light airs for an ~18-tonne aluminium expedition boat (Yachting World test)",
        "Go-anywhere brushed-aluminium build that can take the ground and dry out upright",
        "Easy short-handed handling with well thought-out control-line runs",
      ],
      complaints: [
        "Shallow centreboard and rudders trade some ultimate upwind crispness for go-anywhere draft",
        "Dedicated Boréal 52 owner trip-reports/vlogs are still sparse (newer, low-volume model)",
      ],
      known_issues: [],
      forums: [
        {
          title: "Boréal 52 boat test — Yachting World",
          url: "https://www.yachtingworld.com/yachts-and-gear/boreal-52-boat-test-62368",
        },
      ],
    },
    gaps: [
      "Builder publishes no AVS/STIX stability curve.",
      "Dedicated Boréal 52 passage logs remain thin — the Boréal 47.2 logbook on this site holds the line's broader high-latitude record (Antarctica, Cape Horn, NW-bound owners).",
      "Climate, stability and refit scoring not yet run through the research pipeline.",
    ],
    fieldReports: [
      {
        title: "Surprisingly nimble at 18 tonnes (Yachting World sea-trial)",
        theme: "handling",
        region: "Sea trial — light airs",
        account:
          "Yachting World's test of the Boréal 52 found that at roughly 18 tonnes the boat was \"surprisingly nimble, even in the light airs of our test\" and \"a very easy boat to handle with well thought-out control line runs.\" The aft daggerboards are canted (14°, with 4.5° incidence) to balance the helm and reduce autopilot load, and the centreboard can be lifted downwind to cut drag while the daggerboards hold directional stability. The review frames the 52 as the line's biggest 'sailor's off-roader' — built to go anywhere and head-butt the conditions rather than to be quick.",
        conditions: "Light airs",
        source: {
          title: "Boréal 52 boat test: 'the sailor's off-roader' — Yachting World",
          url: "https://www.yachtingworld.com/yachts-and-gear/boreal-52-boat-test-62368",
        },
        confidence: 0.7,
      },
    ],
  }),

  leanRecord({
    id: "garcia52",
    name: "Garcia Exploration 52",
    sentiment: {
      praise: [
        "Comfortable, sea-kindly motion in a seaway",
        "Proven high-latitude record — owner 'Lifexplorer' ran a decade from Svalbard (80°N) to Antarctica (62°S)",
        "Respectable ~9 kn reaching under an asymmetric (Yachting World test)",
      ],
      complaints: [
        "Soft and 'wallowing' in light air — ~8 kn true dropped it to ~4.5 kn (Yachting World)",
        "Can lose grip on the deliberately-shallow twin rudders if over-pressed (Yachting World)",
        "Conservative sail plan (SA/D ~17) — capability and beaching draft over outright speed",
      ],
      known_issues: [],
      forums: [
        {
          title: "Garcia Exploration 52 test — Yachting World",
          url: "https://www.yachtingworld.com/reviews/boat-tests/garcia-exploration-52-jimmy-cornell",
        },
        {
          title: "Lifexplorer — Garcia Exploration 52 owner blog",
          url: "https://lifexplorer.navy/",
        },
      ],
    },
    gaps: [
      "Refit/cost projection not yet itemised for this hull.",
      "Climate scores (cold/tropic) not yet run through the rubric — see the field reports below for real high-latitude evidence.",
      "Builder publishes no AVS/STIX stability curve.",
    ],
    fieldReports: [
      {
        title: "9 kn reaching, but 'lose grip on the rudders' if over-pressed (Yachting World)",
        theme: "handling",
        region: "Sea trial — Force 3–4",
        account:
          "Yachting World's test recorded 6–6.5 kn at 45–50° apparent in Force 3–4; under an asymmetric on a reach (100° AWA, 12–15 kn) it averaged \"a respectable 9 knots,\" max 9.5. In just 8 kn of breeze it fell to 4.5 kn, described as \"wallowing.\" The helm felt \"more neutral and purposeful than particularly rewarding,\" and the tester warned that if you \"heat the Garcia Exploration 52 up too much … you can lose grip on the rudders\" — the twin rudders are deliberately shallow (1.15 m) for beaching, and the sail-area/displacement ratio is a conservative 17.1. Capability over speed.",
        conditions: "Force 3–4; 8–15 kn true",
        source: {
          title: "Garcia Exploration 52 test: 'the sailing equivalent of a 4x4 off-roader' — Yachting World",
          url: "https://www.yachtingworld.com/reviews/boat-tests/garcia-exploration-52-jimmy-cornell",
        },
        confidence: 0.75,
      },
      {
        title: "A decade in the ice: 80°N to 62°S aboard 'Lifexplorer'",
        theme: "region",
        region: "Svalbard / Arctic to the Antarctic Peninsula",
        account:
          "Italian owner Alberto's Exploration 52 'Lifexplorer' (delivered April 2017) ran a decade-long high-latitude programme from Svalbard at 80°N to the Antarctic Peninsula at 62°S, documented on the owner blog at lifexplorer.navy. Garcia's own write-up of the boat notes a 5,000-nautical-mile Arctic voyage where \"performance and comfort matched expectations,\" and praises the aluminium hull, insulation and range for polar work.",
        conditions: "High latitudes, both poles",
        source: {
          title: "Lifexplorer — 10 years in extreme latitudes aboard a Garcia Exploration 52 (Garcia Yachts)",
          url: "https://www.garciayachts.com/en/garcia-magazine/lifexplorer-10-years-of-sailing-in-extreme-latitudes-aboard-a-garcia-exploration-52",
        },
        confidence: 0.7,
      },
      {
        title: "Pete Goss: how the 52 'shrinks the world' for a couple",
        theme: "passage",
        region: "Short-handed ocean cruising",
        account:
          "British ocean veteran Pete Goss (250,000+ nautical miles) recorded sailing sessions aboard the Garcia Exploration 52, focusing on how a boat like this 'shrinks the world' and makes serious ocean cruising manageable for a short-handed couple. Useful as an experienced-sailor's on-the-water impression rather than a numbers-led boat test.",
        conditions: "",
        source: {
          title: "Garcia Exploration 52 with Pete Goss (YouTube)",
          url: "https://www.youtube.com/watch?v=DZbvQ84eQ2g",
        },
        confidence: 0.6,
      },
      {
        title: "A 'true ship' — Reisberg's walkthrough (design, not a sail test)",
        theme: "liveaboard",
        region: "Walkthrough / liveaboard",
        account:
          "Lars Reisberg's no-frills-sailing walkthrough is an in-depth tour of the Exploration 52's construction and interior rather than a sea-trial. It celebrates the robust aluminium build, the navigation station and heating, and frames the boat as a 'true ship' that deliberately trades outright speed for seaworthiness and durability — a good liveaboard/layout reference to pair with the sailing accounts above.",
        conditions: "",
        source: {
          title: "Garcia Exploration 52 review & walkthrough — no-frills-sailing (Lars Reisberg)",
          url: "https://no-frills-sailing.com/garcia-exploration-52-review-walkthrough/",
        },
        confidence: 0.55,
      },
    ],
  }),

  leanRecord({
    id: "sirius40ds",
    name: "Sirius 40 DS",
    sentiment: {
      praise: [
        "Renowned German hand-built quality; Category A bluewater rating",
        "Sea-kindly, deliberate motion — calm and stiff in a blow (heeled just 15° under bare poles in a 30-kn squall, 48° North)",
        "Versatile keel choice including a dry-out twin keel that points like a fin",
      ],
      complaints: [
        "Sluggish acceleration out of tacks (48° North test)",
        "Upwind in moderate air a reviewer 'wondered whether a fin keel would have slightly improved performance to weather'",
        "Heavy, costly and low-volume — limited independent real-world passage content online",
      ],
      known_issues: [],
      forums: [
        {
          title: "Sirius 40 DS boat test — 48° North",
          url: "https://48north.com/boats-and-gear/boat-reviews/sirius-40-ds-boat-test/",
        },
      ],
    },
    gaps: [
      "Low-volume German builder — few independent 40 DS offshore passage accounts or vlogs exist online.",
      "Most verified press coverage is sea-trials rather than long ocean passages.",
      "Note: Sirius's largest model is the 40 DS — there is no ~50-foot Sirius.",
      "Climate, stability and refit scoring not yet run through the research pipeline.",
    ],
    fieldReports: [
      {
        title: "Slow, deliberate, and stout in a squall (48° North sea-trial)",
        theme: "handling",
        region: "Sea trial — to 30 kn",
        account:
          "48° North's test of the twin-keel Sirius 40 DS found it heavy and sea-kindly, with a \"slow, moderate, deliberate\" motion. Easing from close-hauled to a beam reach in 20 kn, \"the boat accelerated and put a big smile on my face,\" and in a 30-kn squall it heeled only 15° under bare poles and felt \"stout and ready for anything.\" The honest weaknesses: sluggish acceleration out of tacks (\"the only time I really wished for more performance\") and moderate-air pointing, where the reviewer \"wondered whether a fin keel would have slightly improved the performance to weather.\" The twin-keel option dries out daily on tidal flats.",
        conditions: "20 kn building to a 30-kn squall",
        source: {
          title: "Sirius 40 DS boat test — 48° North",
          url: "https://48north.com/boats-and-gear/boat-reviews/sirius-40-ds-boat-test/",
        },
        confidence: 0.75,
      },
      {
        title: "'Best boat ever tested?' — the 35 DS sibling under review",
        theme: "community",
        region: "Build quality / deck-saloon family",
        account:
          "The 'TESTED' channel's review of the smaller Sirius 35 DS — same yard and deck-saloon philosophy as the 40 DS — is titled \"Is this the best boat ever tested?\", reflecting the press reverence for Sirius build quality (Yachting Monthly gave the 35 DS the highest score it had ever awarded at the time). It's a sibling rather than the 40 DS itself, but a fair window onto the family's craftsmanship and raised-saloon layout.",
        conditions: "",
        source: {
          title: "TESTED: Sirius 35DS — Is this the best boat ever tested? (YouTube)",
          url: "https://www.youtube.com/watch?v=9InVk3gKThI",
        },
        confidence: 0.5,
      },
    ],
  }),
];

for (const rec of records) {
  const path = new URL(`../research/data/${rec.id}.json`, import.meta.url);
  writeFileSync(path, JSON.stringify(rec, null, 2) + "\n");
  console.log(
    `wrote research/data/${rec.id}.json — ${rec.scores.field_reports.length} field reports, ${rec.research.sentiment.praise.length}/${rec.research.sentiment.complaints.length} praise/complaints`,
  );
}
