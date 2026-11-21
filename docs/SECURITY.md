# Security notes for the Arnova Group Agency website

This is a static GitHub Pages site with no accounts, no server-side database and no secrets in the repository.

## Applied

### GRC — Governance, risk and compliance
- Typefaces are SIL Open Font License (see `assets/fonts/OFL-Newsreader.txt` and `assets/fonts/OFL-SourceSans3.txt`, and `docs/LICENSES.md`). Icons in the navigation dock are original inline SVG.
- A short [privacy notice](../index.html#privacy) explains that the site has no accounts, no tracking cookies, and that WhatsApp is a third-party service. Theme preference may be stored in the browser only.
- Public copy must not invent clients, invoices, registration numbers, street addresses or performance claims.

### Cloud security
- No API keys, tokens or `.env` files are committed. Contact goes out through a public WhatsApp link.
- Scripts that used to sit inline on the homepage (theme and hero video) now live in `js/chrome.js` and `js/hero-video.js` so a future Content-Security-Policy can use `script-src 'self'` more easily. A strict CSP is not enforced yet because some existing pages still use inline styles.
- This site is static hosting; there is no application server to harden in this repository.

## Not applicable

- **AI security:** the public website has no models, prompts, training data or automated decisions.
- **IAM:** there are no logins, sessions, roles or account-recovery flows.
- **OT security:** the site does not connect to industrial or physical control systems.
