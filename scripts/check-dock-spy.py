#!/usr/bin/env python3
"""Assert the mobile dock scroll-spy follows DOM order (about is before services/pricing).

Run against a local static server:
  python3 scripts/check-dock-spy.py --base http://127.0.0.1:8765/
"""
from __future__ import annotations

import argparse
import sys

from playwright.sync_api import sync_playwright

VIEWPORTS = [
    ("320", {"width": 320, "height": 568}),
    ("390", {"width": 390, "height": 844}),
    ("844x390", {"width": 844, "height": 390}),
]


def current_dock(page):
    return page.evaluate(
        """() => {
          const el = document.querySelector('[data-dock-link][aria-current="page"]');
          return el ? el.getAttribute('data-dock-link') : null;
        }"""
    )


def jump(page, section_id):
    page.evaluate(
        """(id) => {
          const el = document.getElementById(id);
          if (!el) return;
          el.scrollIntoView({behavior: 'instant', block: 'start'});
        }""",
        section_id,
    )
    page.wait_for_timeout(120)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="http://127.0.0.1:8765/")
    parser.add_argument("--chrome", default="/usr/bin/google-chrome")
    args = parser.parse_args()
    base = args.base.rstrip("/") + "/"
    errors = []

    expected = [
        ("top", "home"),
        ("about", "about"),
        ("services", "services"),
        ("pricing", "pricing"),
        ("contact", "contact"),
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=args.chrome, args=["--no-sandbox"], headless=True)
        for name, vp in VIEWPORTS:
            page = browser.new_page(viewport=vp)
            page.goto(base, wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(80)
            for section_id, key in expected:
                jump(page, section_id)
                got = current_dock(page)
                if got != key:
                    errors.append(f"{name}: #{section_id} dock aria-current={got!r}, expected {key!r}")
            page.close()
        browser.close()

    if errors:
        print("FAIL check-dock-spy")
        for e in errors:
            print(" -", e)
        return 1
    print("PASS: dock scroll-spy follows DOM order at 320/390/844x390.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
