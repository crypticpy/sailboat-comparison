// Capture the redesigned UI across breakpoints for visual verification.
import pw from "/opt/homebrew/lib/node_modules/playwright/index.js";
const { chromium } = pw;
import { mkdirSync } from "node:fs";
const URL = "http://localhost:4173/sailboat-comparison/";
const OUT = "/tmp/redesign-shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const errors = [];

async function shot(name, w, h, fn) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`${name}: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`${name} PAGEERROR: ${e.message}`));
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
  await page.waitForTimeout(450);
};
const openCompare = async (p) => {
  const adds = p.locator(".cmpadd");
  await adds.nth(0).click();
  await adds.nth(1).click();
  await adds.nth(2).click();
  await p.locator(".cmpBar").click();
  await p.waitForSelector(".cmptable");
  await p.waitForTimeout(300);
};

await shot("01-desktop-hero", 1280, 900);
await shot("02-desktop-grid", 1280, 1200, async (p) => {
  await p.locator(".grid").scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
});
await shot("03-desktop-detail", 1280, 1100, openDetail);
await shot("04-desktop-compare", 1280, 1000, openCompare);
await shot("04b-compare-diff", 1280, 1000, async (p) => {
  await openCompare(p);
  await p.locator('.cmpopts input[type="checkbox"]').check();
  await p.waitForTimeout(250);
});
await shot("05-desktop-table", 1280, 900, async (p) => {
  await p.getByRole("button", { name: "Table" }).click();
  await p.waitForSelector("table.main");
  await p.waitForTimeout(300);
});
await shot("06-tablet-grid", 768, 1100, async (p) => {
  await p.locator(".grid").scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
});
await shot("07-mobile-hero", 375, 812);
await shot("08-mobile-grid", 375, 812, async (p) => {
  await p.locator(".grid").scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
});
await shot("09-mobile-detail", 375, 812, openDetail);

await browser.close();
console.log("\nconsole/page errors:", errors.length ? "\n - " + errors.join("\n - ") : "none");
process.exit(errors.length ? 1 : 0);
