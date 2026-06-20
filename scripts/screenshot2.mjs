import pw from '/opt/homebrew/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const URL = 'http://localhost:4173/sailboat-comparison/';
const OUT = '/tmp/sail-shots';
const browser = await chromium.launch({ channel: 'chrome' });

async function run(name, width, height, fn) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('.card');
  if (fn) await fn(page);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  await ctx.close();
  console.log(name + ' ok');
}

// Desktop grid scrolled to cards
await run('desktop-grid', 1280, 1000, async (page) => {
  await page.locator('.grid').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
});
// Mobile grid scrolled to cards
await run('mobile-grid', 375, 900, async (page) => {
  await page.locator('.grid').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
});
// Mobile table view (the reworked-for-mobile bit)
await run('mobile-table', 375, 900, async (page) => {
  await page.getByRole('button', { name: 'Table' }).click();
  await page.waitForSelector('table.main');
  await page.locator('.tablewrap').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
});
// Compare bar + compare modal (desktop)
await run('desktop-compare', 1280, 1000, async (page) => {
  const adds = page.locator('.cmpadd');
  await adds.nth(0).click();
  await adds.nth(1).click();
  await adds.nth(2).click();
  await page.locator('.cmpBar').click();
  await page.waitForSelector('.cmptable');
  await page.waitForTimeout(200);
});

await browser.close();
console.log('done');
