// Proves the built app loads from Supabase (not the bundled JSON fallback):
//   - a network request hits <ref>.supabase.co/rest/v1/boats
//   - the lazy boats-*.js fallback chunk is NOT fetched
//   - all 34 boat cards render, with no console/page errors
import pw from "/opt/homebrew/lib/node_modules/playwright/index.js";
const { chromium } = pw;
const URL = "http://localhost:4173/sailboat-comparison/";

const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
const page = await ctx.newPage();

const reqs = [];
const errors = [];
page.on("request", (r) => reqs.push(r.url()));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForSelector(".card", { timeout: 10000 });
const cards = await page.locator(".card").count();

const hitSupabase = reqs.some((u) => /supabase\.co\/rest\/v1\/boats/.test(u));
const loadedFallback = reqs.some((u) => /\/assets\/boats-.*\.js/.test(u));

console.log("cards rendered     :", cards);
console.log("fetched supabase   :", hitSupabase);
console.log("loaded JSON fallback:", loadedFallback);
console.log("console/page errors:", errors.length ? errors.join(" | ") : "none");

const ok = cards === 34 && hitSupabase && !loadedFallback && errors.length === 0;
console.log(ok ? "VERIFY_OK" : "VERIFY_FAIL");

await browser.close();
process.exit(ok ? 0 : 1);
