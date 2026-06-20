// Capture a baseline screenshot set of the CURRENT UI for the design workshop.
// Agents read these PNGs to ground their critique in what actually exists.
import pw from "/opt/homebrew/lib/node_modules/playwright/index.js";
const { chromium } = pw;
import { mkdirSync } from "node:fs";
const URL = "http://localhost:4173/sailboat-comparison/";
const OUT = "/tmp/workshop-shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });

async function shot(name, w, h, fn) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForSelector(".card", { timeout: 15000 });
  if (fn) await fn(page);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  await ctx.close();
  console.log(name, "ok");
}

const openDetail = async (page) => {
  await page.locator(".card").first().click();
  await page.waitForSelector(".modal .mbody", { timeout: 5000 });
  await page.waitForTimeout(400);
};

// Desktop
await shot("01-desktop-hero", 1366, 900); // hero + controls (top of page)
await shot("02-desktop-grid", 1366, 1100, async (p) => {
  await p.locator(".grid").scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
});
await shot("03-desktop-detail", 1366, 1000, openDetail);
await shot("04-desktop-compare", 1366, 1000, async (p) => {
  const adds = p.locator(".cmpadd");
  await adds.nth(0).click(); await adds.nth(1).click(); await adds.nth(2).click();
  await p.locator(".cmpBar").click();
  await p.waitForSelector(".cmptable"); await p.waitForTimeout(300);
});
await shot("05-desktop-table", 1366, 1000, async (p) => {
  await p.getByRole("button", { name: "Table" }).click();
  await p.waitForSelector("table.main"); await p.waitForTimeout(300);
});
// Mobile
await shot("06-mobile-hero", 390, 844);
await shot("07-mobile-grid", 390, 844, async (p) => {
  await p.locator(".grid").scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
});
await shot("08-mobile-detail", 390, 844, openDetail);

await browser.close();
console.log("done");
