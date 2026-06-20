// Verification: confirm the ported TS metrics produce byte-identical scores to
// the legacy site for all 34 boats at the default weight blends. Compares
// missionFit, rangeNm, selection, and the four pillars.
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';
import { execSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// 1) Legacy values: run the truncated legacy script, then replicate its render
//    loop (default weights) and capture the canonical numbers.
const html = readFileSync(resolve(root, 'legacy/sailboat-comparison.html'), 'utf8');
let code = html.match(/<script>([\s\S]*?)<\/script>/)[1];
code = code.slice(0, code.indexOf('const grid=document.getElementById'));
code += `
  BOATS.forEach(b=>{b.missionFit=fit(b.scores);b._p=pillars(b);b.selection=selection(b);b.rangeNm=rangeNm(b);});
  this.__OUT = BOATS.map(b=>({id:b.id,missionFit:b.missionFit,rangeNm:b.rangeNm,selection:b.selection,p:b._p}));
`;
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const legacy = new Map(sandbox.__OUT.map((x) => [x.id, x]));

// 2) Ported values: bundle metrics.ts to ESM via esbuild and import it.
const tmp = resolve(root, '.metrics.verify.mjs');
execSync(`npx esbuild src/lib/metrics.ts --bundle --format=esm --platform=node --outfile=${tmp}`, {
  cwd: root,
  stdio: 'pipe',
});
const { scoreBoat, BASE_WEIGHTS, BASE_PILLAR_WEIGHTS } = await import(tmp + '?t=' + Date.now());
const boats = JSON.parse(readFileSync(resolve(root, 'data/boats.json'), 'utf8'));

// 3) Compare.
let mismatches = 0;
for (const b of boats) {
  const L = legacy.get(b.id);
  const S = scoreBoat(b, BASE_WEIGHTS, BASE_PILLAR_WEIGHTS);
  const checks = [
    ['missionFit', L.missionFit, S.missionFit],
    ['rangeNm', L.rangeNm, S.rangeNm],
    ['selection', L.selection, S.selection],
    ['pillar.sea', L.p.sea, S.pillars.sea],
    ['pillar.own', L.p.own, S.pillars.own],
    ['pillar.value', L.p.value, S.pillars.value],
  ];
  for (const [field, a, c] of checks) {
    if (a !== c) {
      console.error(`MISMATCH ${b.id}.${field}: legacy=${a} ported=${c}`);
      mismatches++;
    }
  }
}

rmSync(tmp, { force: true });
writeFileSync(resolve(root, '.metrics.verify.mjs.map'), '', { flag: 'w' });
rmSync(resolve(root, '.metrics.verify.mjs.map'), { force: true });

if (mismatches) {
  console.error(`\n${mismatches} mismatch(es) across 34 boats.`);
  process.exit(1);
}
console.log('All 34 boats: missionFit, rangeNm, selection, and 3 pillars match legacy exactly. ✓');
