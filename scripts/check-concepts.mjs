// Smoke checks for concept URL stubs that redirect to the homepage gallery.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join, relative } from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pages = [
  { path: 'concepts/index.html', hash: '#work' },
  { path: 'concepts/117-cafe/index.html', hash: '#concept-117-cafe' },
  { path: 'concepts/shisha-supermarket/index.html', hash: '#concept-shisha-supermarket' },
  { path: 'concepts/royal-relay-electronics/index.html', hash: '#concept-royal-relay-electronics' }
];

for (const { path, hash } of pages) {
  const full = join(root, path);
  assert(existsSync(full), 'Missing page: ' + path);
  const html = readFileSync(full, 'utf8');
  assert(/<html[^>]*lang="en"/i.test(html), path + ': missing lang');
  assert(/<meta[^>]*charset="utf-8"/i.test(html), path + ': missing charset');
  assert(/<meta[^>]*name="viewport"/i.test(html), path + ': missing viewport');
  assert(/<meta[^>]*name="robots"[^>]*noindex/i.test(html), path + ': missing noindex');
  assert(/<title>[^<]+<\/title>/i.test(html), path + ': missing title');
  assert(/<link[^>]*rel="canonical"[^>]*arnova-group-agency\//i.test(html), path + ': missing canonical');
  assert(new RegExp('<meta[^>]*http-equiv="refresh"[^>]*url=[^">]*' + hash.replace('#', '\\#'), 'i').test(html), path + ': missing refresh to ' + hash);
  assert(!/<script/i.test(html), path + ': stubs must not include script');
  const links = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)].map((m) => m[1]);
  assert(links.some((href) => href.includes(hash)), path + ': missing fallback link to ' + hash);
  for (const href of links) {
    if (href.startsWith('#') || /^(?:https?:|mailto:|tel:)/i.test(href)) continue;
    const clean = href.split(/[?#]/)[0];
    if (!clean || clean === '.' || clean === './' || clean === '..' || clean === '../') continue;
    const target = resolve(dirname(full), clean);
    const targetFile = clean.endsWith('/') ? join(target, 'index.html') : target;
    // Logo and relative homepage paths should exist when they are files.
    if (/\.(svg|png|ico|html)$/i.test(clean)) {
      assert(existsSync(targetFile), path + ': broken local link ' + href + ' → ' + relative(root, targetFile));
    }
  }
  console.log('PASS ' + path + ' · redirect stub to ' + hash);
}
console.log('PASS: 4 concept stubs validated.');
