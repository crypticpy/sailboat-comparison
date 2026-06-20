// Regenerate public/og.png — a Playwright screenshot of the live hero (1200x630).
// The hero shows a count-up of boats.length, so this must be re-run whenever the
// fleet count changes. Assumes `vite preview` is serving on :4173.
import pkg from "/opt/homebrew/lib/node_modules/playwright/index.js";
const { chromium } = pkg;

const URL = "http://localhost:4173/sailboat-comparison/";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1400); // fonts + count-up settle
await page.screenshot({
  path: "public/og.png",
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});

// Capture the rendered hero headline so we can confirm the count baked in.
const headline = await page
  .locator(".hero, header, h1")
  .first()
  .innerText()
  .catch(() => "(headline not found)");
console.log("og.png written");
console.log("hero text:", headline.replace(/\n+/g, " | ").slice(0, 200));
console.log("console errors:", errors.length ? errors.join(" | ") : "none");
await browser.close();
