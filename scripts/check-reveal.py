#!/usr/bin/env python3
"""Assert homepage scroll-reveal content is visible once seen, and with JS off.

Run against a local static server, for example:
  python3 -m http.server 8765 --bind 127.0.0.1
  python3 scripts/check-reveal.py --base http://127.0.0.1:8765/
"""
from __future__ import annotations

import argparse
import sys

from playwright.sync_api import sync_playwright

VIEWPORTS = [
    ("320", {"width": 320, "height": 568}),
    ("390", {"width": 390, "height": 844}),
    ("1440", {"width": 1440, "height": 900}),
]
SECTIONS = ["top", "about", "services", "work", "process", "pricing", "daily-care", "faq", "contact", "privacy"]

EFFECTIVE_OPACITY = """(sel) => {
  const els = typeof sel === 'string' ? [...document.querySelectorAll(sel)] : sel;
  return els.map((el) => {
    let o = 1;
    let node = el;
    while (node && node.nodeType === 1) {
      const op = getComputedStyle(node).opacity;
      o *= (op === '' ? 1 : parseFloat(op));
      node = node.parentElement;
    }
    return {id: el.id || el.className, opacity: o};
  });
}"""


def fail(msg, errors):
    errors.append(msg)


def missing_inview(page):
    """Reveals already in or above the viewport must have .is-inview immediately."""
    return page.evaluate(
        """() => {
          const vh = window.innerHeight;
          return [...document.querySelectorAll('.arnova-reveal')].filter((el) => {
            const r = el.getBoundingClientRect();
            const seen = r.bottom <= 0 || r.top < vh;
            return seen && !el.classList.contains('is-inview');
          }).map((el) => el.id || el.className);
        }"""
    )


def faded_after_transition(page):
    """After the 0.7s reveal transition, every .is-inview element must be opaque."""
    page.wait_for_timeout(800)
    return page.evaluate(
        """() => {
          return [...document.querySelectorAll('.arnova-reveal')].filter((el) => {
            if (!el.classList.contains('is-inview')) return false;
            let o = 1, node = el;
            while (node && node.nodeType === 1) {
              o *= parseFloat(getComputedStyle(node).opacity || '1');
              node = node.parentElement;
            }
            return o < 0.99;
          }).map((el) => el.id || el.className);
        }"""
    )


def scroll_through(page):
    page.evaluate("() => window.scrollTo({top: 0, behavior: 'instant'})")
    page.wait_for_timeout(50)
    height = page.evaluate("() => document.documentElement.scrollHeight")
    vh = page.evaluate("() => window.innerHeight")
    y = 0
    while y <= height:
        page.evaluate("(top) => window.scrollTo({top, behavior: 'instant'})", y)
        page.wait_for_timeout(40)
        missing = missing_inview(page)
        if missing:
            return missing, y, "missing-inview"
        y += max(int(vh * 0.7), 160)
    page.evaluate("() => window.scrollTo({top: document.documentElement.scrollHeight, behavior: 'instant'})")
    page.wait_for_timeout(40)
    missing = missing_inview(page)
    if missing:
        return missing, "end", "missing-inview"
    leftover = faded_after_transition(page)
    return leftover, "end", "faded"


def section_opacity(page, section_id):
    return page.evaluate(
        """(id) => {
          const el = document.getElementById(id);
          if (!el) return null;
          let o = 1, node = el;
          while (node && node.nodeType === 1) {
            o *= parseFloat(getComputedStyle(node).opacity || '1');
            node = node.parentElement;
          }
          const fadedKids = [...el.querySelectorAll('.arnova-reveal')].filter((kid) => {
            let k = 1, n = kid;
            while (n && n.nodeType === 1) {
              k *= parseFloat(getComputedStyle(n).opacity || '1');
              n = n.parentElement;
            }
            return k < 0.99;
          }).length;
          return {opacity: o, fadedKids};
        }""",
        section_id,
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="http://127.0.0.1:8765/")
    parser.add_argument("--chrome", default="/usr/bin/google-chrome")
    args = parser.parse_args()
    base = args.base.rstrip("/") + "/"
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=args.chrome, args=["--no-sandbox"], headless=True)

        for name, vp in VIEWPORTS:
            page = browser.new_page(viewport=vp)
            page.goto(base, wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(100)
            faded, at, kind = scroll_through(page)
            if faded:
                fail(f"{name}: {kind} after scroll at {at}: {faded[:6]}", errors)
            for sid in SECTIONS:
                info = section_opacity(page, sid)
                if info is None:
                    continue
                if info["opacity"] < 0.99 or info["fadedKids"]:
                    fail(f"{name}: #{sid} opacity={info['opacity']} fadedKids={info['fadedKids']}", errors)
            page.close()

            # hash landings should reveal the target and in-section cards immediately
            for hid in ("pricing", "daily-care", "privacy"):
                page = browser.new_page(viewport=vp)
                page.goto(base + "#" + hid, wait_until="networkidle", timeout=30000)
                page.wait_for_timeout(200)
                page.evaluate("() => { const el=document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView({behavior:'instant', block:'start'}); }")
                page.wait_for_timeout(80)
                info = section_opacity(page, hid if hid != "daily-care" else "pricing")
                faded_target = page.evaluate(
                    """(id) => {
                      const el = document.getElementById(id);
                      if (!el) return ['missing'];
                      const nodes = [el, ...el.querySelectorAll('.arnova-reveal')];
                      return nodes.filter((n) => {
                        let o = 1, cur = n;
                        while (cur && cur.nodeType === 1) {
                          o *= parseFloat(getComputedStyle(cur).opacity || '1');
                          cur = cur.parentElement;
                        }
                        const r = n.getBoundingClientRect();
                        const visible = r.bottom > 0 && r.top < window.innerHeight;
                        return visible && o < 0.99;
                      }).map((n) => n.id || n.className);
                    }""",
                    hid,
                )
                if faded_target:
                    fail(f"{name}: hash #{hid} still faded in view: {faded_target[:8]}", errors)
                page.close()

        # JS off: everything visible, including hash targets
        for name, vp in VIEWPORTS:
            ctx = browser.new_context(viewport=vp, java_script_enabled=False)
            page = ctx.new_page()
            page.goto(base, wait_until="domcontentloaded", timeout=30000)
            has_js = page.evaluate("() => document.documentElement.classList.contains('js')")
            if has_js:
                fail(f"{name} JS-off: html still has .js class", errors)
            faded = page.evaluate(
                """() => [...document.querySelectorAll('.arnova-reveal, #pricing, #daily-care, #privacy')].filter((el) => {
                  let o = 1, n = el;
                  while (n && n.nodeType === 1) {
                    o *= parseFloat(getComputedStyle(n).opacity || '1');
                    n = n.parentElement;
                  }
                  return o < 0.99;
                }).map((el) => el.id || el.className)"""
            )
            if faded:
                fail(f"{name} JS-off: faded elements: {faded[:8]}", errors)
            page.goto(base + "#daily-care", wait_until="domcontentloaded")
            faded = page.evaluate(
                """() => {
                  const el = document.getElementById('daily-care');
                  if (!el) return ['missing'];
                  let o = 1, n = el;
                  while (n && n.nodeType === 1) {
                    o *= parseFloat(getComputedStyle(n).opacity || '1');
                    n = n.parentElement;
                  }
                  return o < 0.99 ? ['daily-care'] : [];
                }"""
            )
            if faded:
                fail(f"{name} JS-off hash #daily-care faded", errors)
            ctx.close()

        browser.close()

    if errors:
        print("FAIL check-reveal")
        for e in errors:
            print(" -", e)
        return 1
    print("PASS: reveals are visible once seen at 320/390/1440, and JS-off is fully visible.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
