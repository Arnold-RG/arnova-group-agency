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
  const pageDir = dirname(full);
  // After CSP extraction, breakpoints live in linked stylesheets rather than
  // in a <style> block. Still check the HTML first, then same-origin CSS.
  const linkedCss = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi)]
    .map((m) => {
      const href = m[0].match(/href=["']([^"']+)["']/i);
      return href ? href[1] : null;
    })
    .filter(Boolean)
    .filter((href) => !/^(?:https?:|\/\/)/i.test(href))
    .map((href) => resolve(pageDir, href.split(/[?#]/)[0]))
    .filter((file) => existsSync(file))
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');
  const cssAndHtml = html + '\n' + linkedCss;
  const checks = [
    [/<html[^>]*lang="en"/i, 'lang', html],
    [/<meta[^>]*charset="utf-8"/i, 'charset', html],
    [/<meta[^>]*name="viewport"/i, 'viewport', html],
    [/<meta[^>]*name="robots"[^>]*noindex/i, 'noindex', html],
    [/<title>[^<]+<\/title>/i, 'title', html],
    [/<main(?:\s|>)/i, 'main landmark', html],
    [/<h1(?:\s|>)/i, 'H1 heading', html],
    [/UNOFFICIAL/i, 'unofficial disclaimer', html],
    [/@media\s*\(max-width:/i, 'responsive CSS', cssAndHtml],
    [/<\/body>\s*<\/html>/i, 'document closure', html]
  ];
  for (const [rx, name, source] of checks) assert(rx.test(source), path + ': missing ' + name);

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
