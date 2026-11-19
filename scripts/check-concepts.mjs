// Platform-neutral static smoke checks for the ArnovaGroup concept websites.
// Intended to run with Node on Linux, Windows and macOS without dependencies.
// These checks do not replace real browser/device testing on Android or iOS.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join, relative } from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const paths = [
  'concepts/index.html',
  'concepts/117-cafe/index.html',
  'concepts/shisha-supermarket/index.html',
  'concepts/royal-relay-electronics/index.html'
];

for (const path of paths) {
  const full = join(root, path);
  assert(existsSync(full), 'Missing page: ' + path);
  const html = readFileSync(full, 'utf8');
  const checks = [
    [/<html[^>]*lang="en"/i, 'lang'],
    [/<meta[^>]*charset="utf-8"/i, 'charset'],
    [/<meta[^>]*name="viewport"/i, 'viewport'],
    [/<meta[^>]*name="robots"[^>]*noindex/i, 'noindex'],
    [/<title>[^<]+<\/title>/i, 'title'],
    [/<main(?:\s|>)/i, 'main landmark'],
    [/<h1(?:\s|>)/i, 'H1 heading'],
    [/UNOFFICIAL/i, 'unofficial disclaimer'],
    [/@media\s*\(max-width:/i, 'responsive CSS'],
    [/<\/body>\s*<\/html>/i, 'document closure']
  ];
  for (const [rx, name] of checks) assert(rx.test(html), path + ': missing ' + name);

  // Resolve every same-site anchor against the source directory. External links
  // aren't fetched and still need an approved content/links review.
  const links = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)].map(m => m[1]);
  for (const href of links) {
    if (href.startsWith('#') || /^(?:https?:|mailto:|tel:)/i.test(href)) continue;
    const clean = href.split(/[?#]/)[0];
    const target = resolve(dirname(full), clean);
    const targetFile = clean.endsWith('/') || clean === '' ? join(target, 'index.html') : target;
    assert(existsSync(targetFile), path + ': broken local link ' + href + ' → ' + relative(root, targetFile));
  }
  console.log('PASS ' + path + ' · page semantics, mobile breakpoint, disclaimers, local links');
}
console.log('PASS: 4 concept pages validated. Browser/device testing is still required.');
