// Visual verification: render the app at phone/tablet/desktop widths and capture
// the grid, an open detail modal, and the table view. Uses the system Chrome.
import pw from '/opt/homebrew/lib/node_modules/playwright/index.js';
const { chromium } = pw;

const URL = 'http://localhost:4173/sailboat-comparison/';
const OUT = '/tmp/sail-shots';
import { mkdirSync } from 'node:fs';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });

async function shot(name, width, height, fn) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('.card, .loading', { timeout: 10000 });
  if (fn) await fn(page);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(`${name}: ${errors.length ? 'ERRORS → ' + errors.join(' | ') : 'no console errors'}`);
  await ctx.close();
}

// Mobile, full page top
await shot('mobile-375', 375, 900);
// Tablet
await shot('tablet-768', 768, 1024);
// Desktop
await shot('desktop-1280', 1280, 900);
// Mobile with a detail modal open
await shot('mobile-modal', 375, 900, async (page) => {
  await page.locator('.card').first().click();
  await page.waitForSelector('.modal .mbody', { timeout: 5000 });
  await page.waitForTimeout(300);
});
// Desktop modal
await shot('desktop-modal', 1280, 900, async (page) => {
  await page.locator('.card').first().click();
  await page.waitForSelector('.modal .mbody', { timeout: 5000 });
  await page.waitForTimeout(300);
});

await browser.close();
console.log('done');
