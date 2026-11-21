// Assert every homepage RWF amount sits in a convertible span (RWF is the base).
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = join(root, 'index.html');
assert(existsSync(file), 'Missing index.html');
const html = readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '');

function inside(html, index, openRe, closeTag) {
  const before = html.slice(0, index);
  let last = -1;
  let m;
  const copy = openRe.flags.includes('g') ? openRe : new RegExp(openRe.source, openRe.flags + 'g');
  while ((m = copy.exec(before))) last = m.index;
  if (last < 0) return false;
  const after = html.slice(last);
  const close = after.search(closeTag);
  return close === -1 || index < last + close;
}

const amountRe = /(?:^|[^0-9.,])([+]?)(\d{1,3}(?:,\d{3})+|\d{1,6})\s*RWF/g;
const bareRwf = [];
let match;
while ((match = amountRe.exec(html))) {
  const idx = match.index + match[0].search(/\d/);
  const ok =
    inside(html, idx, /data-rwf\s*=\s*["']\d+["']/g, /<\/span>|<\/div>/) ||
    inside(html, idx, /class\s*=\s*["'][^"']*\bprice\b[^"']*["']/g, /<\/div>/);
  if (!ok) bareRwf.push(match[0].trim() + ' @' + idx);
}

assert.equal(bareRwf.length, 0, 'Bare RWF amounts outside convertible spans: ' + bareRwf.join('; '));
assert.equal((html.match(/data-pln\s*=/g) || []).length, 0, 'Unexpected leftover data-pln attributes');
assert(!/50%\s*deposit/i.test(html), '50% deposit wording is not in the analysis file');
assert(!/id="service-ai"|AI-assisted digital tools|AI creation/.test(html), 'AI prototype offer should be removed');
assert(!/Optional daily care|Polish złoty as the base|data-pln=/.test(html), 'Daily/PLN care billing should be gone');

const required = [
  56000, 75000, 80000, 90000, 145000, 20000,
  9500, 15500, 25000, 26500, 28000, 36000, 27500, 34500, 6500, 16000, 19000, 18500,
  6000, 32000, 72000, 92000, 57000
];
for (const amount of required) {
  assert(new RegExp('data-rwf="' + amount + '"').test(html), 'Missing data-rwf="' + amount + '"');
}

assert(!/data-rwf="35000"/.test(html), 'Old Starter price 35000 is still present');
assert(html.includes('Optional monthly care'), 'Missing monthly care heading');

const packagePrices = [...html.matchAll(/class="price"[^>]*>([^<]+)<\/div>/g)].map((m) => m[1]);
assert.deepEqual(
  packagePrices,
  ['56,000 RWF', '75,000 RWF', '80,000 RWF', '90,000 RWF', '145,000 RWF', '72,000 RWF', '92,000 RWF'],
  'Package prices should be the v2 RWF amounts'
);
console.log('PASS: every homepage RWF amount is in a convertible span.');
