// Assert every RWF (and daily-care PLN) amount on the homepage sits in a convertible span.
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
  openRe.lastIndex = 0;
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
    inside(html, idx, /data-rwf\s*=\s*["']\d+["']/g, /<\/span>/) ||
    inside(html, idx, /class\s*=\s*["']price["']/g, /<\/div>/);
  if (!ok) {
    bareRwf.push(match[0].trim() + ' @' + idx);
  }
}

const plnRe = /(?:^|[^0-9.,])(\d{1,3}(?:,\d{3})+|\d{1,6})\s*PLN/g;
const barePln = [];
while ((match = plnRe.exec(html))) {
  const idx = match.index + match[0].search(/\d/);
  const ok = inside(html, idx, /data-pln\s*=\s*["']\d+["']/g, /<\/span>/);
  if (!ok) barePln.push(match[0].trim() + ' @' + idx);
}

assert.equal(bareRwf.length, 0, 'Bare RWF amounts outside convertible spans: ' + bareRwf.join('; '));
assert.equal(barePln.length, 0, 'Bare PLN amounts outside convertible spans: ' + barePln.join('; '));

const required = [35000, 18000, 12000, 6000, 9000, 23000, 38000, 32000, 24000, 3000, 10000, 20000];
for (const amount of required) {
  assert(
    new RegExp('data-rwf="' + amount + '"').test(html),
    'Missing data-rwf="' + amount + '"'
  );
}
for (const amount of [24, 30, 40, 55, 64]) {
  assert(
    new RegExp('data-pln="' + amount + '"').test(html),
    'Missing data-pln="' + amount + '"'
  );
}

const packagePrices = [...html.matchAll(/class="price">([^<]+)<\/div>/g)].map((m) => m[1]);
assert.equal(packagePrices.length, 4, 'Expected four package .card .price elements, got ' + packagePrices.length);
console.log('PASS: every homepage RWF and daily-care PLN amount is in a convertible span.');

