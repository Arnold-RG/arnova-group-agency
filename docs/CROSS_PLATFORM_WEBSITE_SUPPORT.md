# ArnovaGroup — Browser and OS compatibility

## Supported delivery model

All four pages under `/concepts/` are **static, responsive HTML/CSS**. Modern standards-compliant web browsers can render them on Windows, Linux, macOS, Android, iOS and other systems; they are not native installers or native OS apps. These pages do not need Node.js, Docker, Kubernetes, a server or cloud infrastructure at runtime — GitHub Pages serves them.

## CI validation

The GitHub Actions workflow `.github/workflows/concept-platform-checks.yml` validates the four concept pages on **Ubuntu, Windows and macOS** with dependency-free Node tests. It checks basic HTML semantics, viewport, explicit concept status, responsive CSS presence and local links.

**Scope warning:** This is a **static smoke test**. It is not proof of correct visual rendering or feature performance in all browsers and physical phones. Before representing a website as production-ready, test at least:
- Desktop Chrome, Firefox, Safari, Edge at common sizes; keyboard navigation, focus and links.
- Android Chrome: 360–430 px portrait and landscape, touch target size, scrolling and CTA.
- iPhone Safari: 320–430 px portrait and landscape, safe-area insets, font scaling and fixed elements.
- Tablet Safari/Chrome: 768–1024 px, mobile navigation and grid adaptation.
- Slow connection, blocked external assets, reduced motion, zoom to 200%, readable contrast and image fallbacks.
- Forms, booking, cart and payments only where the business owner has provided or authorized real workflows.

## Kubernetes decision

**Not required for static sites.** It adds operational complexity and hosting costs without an advantage for GitHub Pages HTML/CSS demos. Consider container deployment or Kubernetes only for a proven production backend with multiple services, continuous operations, scaling needs, deployment monitoring, secrets management and security controls. Decide individually, not as a global requirement.

## Existing repositories

- `Arnold-RG/vira`: static website and demos, no runtime installation needed.
- `Arnold-RG/Boutique-la-difference`: HTML/CSS/JavaScript business shop, expected browser-based experience; business-specific UX and cart require separate device testing.
- `Arnold-RG/hamwe`: React/Vite website with routes and booking logic; production build and browser testing required.
- `Arnold-RG/study-atlas`: static study portal with browser JavaScript; its client-side features require browser compatibility checks.
- Other projects: **compatibility not yet certified**. Command-line scanners, cybersecurity utilities, backends and mobile apps may need OS-specific dependencies or implementations. Do not claim all 22 repositories run natively on every operating system.

## Publishing principle

After changes, commit to the connected GitHub repository, check CI and Pages deployment, verify the published URL and report failures. Do not equate commit success with deployment success.

## Ownership

Unofficial concepts remain labeled as such; never publish under a business's own domain, claim endorsement or use restricted media until the owner authorizes it.
