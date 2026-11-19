# Arnold-RG public-repository platform audit — 19 November 2026

This is an initial **source-layout audit** across 20 public repositories available under Arnold-RG. It is **not** a claim of full Windows, Linux, macOS, Android or iOS runtime compatibility. Private repositories were deliberately excluded. Static web delivery, cross-OS local development, native mobile binaries and backend hosting are separate requirements.

## Cross-platform matrix

| Repository | Observed stack / clues | Best delivery model | Verified so far | Next required verification |
| --- | --- | --- | --- | --- |
| [vira](https://github.com/Arnold-RG/vira) | HTML/CSS/JS plus concept pages | Website; browser on desktop/mobile | Concept static tests PASS on Windows/macOS/Ubuntu; Pages SUCCESS | Actual Safari iOS / Chrome Android / desktop visual QA |
| [Boutique-la-difference](https://github.com/Arnold-RG/Boutique-la-difference) | Static shop front end, data and assets | Website; browser on desktop/mobile | Static CI PASS on Windows/macOS/Ubuntu; Pages SUCCESS | Browser tests of cart, catalogue, links and mobile checkout-like features |
| [hamwe](https://github.com/Arnold-RG/hamwe) | React/Vite/TypeScript travel app | Website; browser on desktop/mobile | TypeScript/Vite build PASS on Windows/macOS/Ubuntu; Pages SUCCESS | Real Safari/Chrome mobile tests, routes, booking states and payments |
| [study-atlas](https://github.com/Arnold-RG/study-atlas) | Browser study portal, Python research/tests | Browser lessons + independent Python environment | Web static checks PASS on three OSes; Pages SUCCESS | Browser interactive tests; Python scientific stack environment matrix |
| [arnold-portfolio](https://github.com/Arnold-RG/arnold-portfolio) | HTML/CSS/JS portfolio | Browser-based | Not checked on three OS runners in this audit | Responsive and browser QA |
| [Arnold-RG](https://github.com/Arnold-RG/Arnold-RG) | GitHub profile and web dashboard | GitHub/web browser | Not cross-OS tested in this audit | Responsive and browser QA |
| [kingdom-life-krakow](https://github.com/Arnold-RG/kingdom-life-krakow) | Static HTML/CSS/JS church website | Web browser | Not cross-OS tested in this audit | Responsive QA, images, accessibility, language |
| [AbroadCost](https://github.com/Arnold-RG/AbroadCost) | Static HTML/CSS/JS + data | Web browser | Not cross-OS tested in this audit | Mobile data UX, browser QA |
| [our-money-hub](https://github.com/Arnold-RG/our-money-hub) | JS package, browser client | Browser app | Not cross-OS tested in this audit | Local build, security/privacy and browser QA |
| [elvora](https://github.com/Arnold-RG/elvora) | Flutter folders: android, ios, windows, linux, macos, web | Flutter multi-platform clients | Platform source trees present; **builds not tested** | Flutter build/test on each OS; signing, permissions and native-device testing |
| [worldshield-soc](https://github.com/Arnold-RG/worldshield-soc) | Python requirements and public UI | Web dashboard + backend service | Source clues only | Python dependency/host matrix, backend integration, auth, browser testing |
| [peakwise](https://github.com/Arnold-RG/peakwise) | Backend, frontend, models, Python deps | Backend API + browser client | Source clues only | Backend cross-OS envs, frontend/mobile QA |
| [2daymovie](https://github.com/Arnold-RG/2daymovie) | Python app, Dockerfile, Compose, templates | Containerized backend + web UI | Containerization present, not validated | Container image build, Compose, browser UI |
| [ragi](https://github.com/Arnold-RG/ragi) | Backend + web + Docker Compose | Server + browser UI | Source clues only | Container/service smoke, mobile browser UX |
| [STANS](https://github.com/Arnold-RG/STANS) | JS/TS web app, Docker Compose, `k8s/`, monitoring | Web frontend + optional orchestrated server stack | Kubernetes manifests **already present**, unvalidated | Security review, kube manifests, deployment, browser QA |
| [network-scanner](https://github.com/Arnold-RG/network-scanner) | PowerShell and Bash scripts | Windows PowerShell / Linux shell CLI | OS-specific scripts present, not runtime tested | CI on Windows/Linux; mobile via remote UI, not native CLI |
| [port-scanner](https://github.com/Arnold-RG/port-scanner) | PowerShell and Bash scripts | Windows PowerShell / Linux shell CLI | OS-specific scripts present, not runtime tested | CI, permission/security review, network environments |
| [network-monitor](https://github.com/Arnold-RG/network-monitor) | PowerShell and Bash scripts | Windows PowerShell / Linux shell CLI | OS-specific scripts present, not runtime tested | CI Windows/Linux, remote mobile dashboard if useful |
| [security-hardening-checker](https://github.com/Arnold-RG/security-hardening-checker) | `check-linux.sh` and `check-windows.ps1` | OS-specific Windows/Linux security diagnostic | Source files present, not runtime tested | OS-specific security test environments, privileges and safe modes |
| [log-analyzer](https://github.com/Arnold-RG/log-analyzer) | `analyze-linux-logs.sh`, `analyze-windows-logs.ps1` | OS-specific Windows/Linux log analysis | Source files present, not runtime tested | CI fixtures on both systems and permission edge cases |

## Kubernetes policy

Do **not** add Kubernetes to static GitHub Pages sites, the lightweight frontend builds, or CLI utilities. Kubernetes already has a place in `STANS` (the repository contains `k8s/`), but the manifests need validation before making production claims. Backends in `worldshield-soc`, `2daymovie` or `ragi` may justify containers/orchestration if actual scaling, high-availability, monitoring and operational needs are established. No unnecessary cluster deployment.

## Recommended compatibility phases

1. **Web projects:** ship responsive HTML/CSS, test desktop browsers and mobile devices; do not claim Android/iOS native apps.
2. **Flutter project:** validate Android/iOS/Windows/Linux/macOS/web builds individually with matching SDKs and native CI runners; provide documented platform-specific setup and permissions.
3. **Python/server projects:** use pinned dependencies, reproducible environments and platform-safe paths; containerize where helpful; verify browser frontends on phones.
4. **Security utilities:** maintain explicit Windows and Linux versions, test on controlled environments, document permissions; do not expect privileged host-scanning scripts to run as native mobile apps.
5. **Release gate:** use CI per repository, verify deploy success, then test critical customer journeys on representative real or emulated devices. Maintain accessibility and fallback behavior.

## Notes

- The source audit covers visible public repo top-level structure and explicitly verified Actions runs for the four updated web projects; it does not inspect every file or certify every device.
- Existing backend services, containers, authentication or native apps **must not** be called production-ready based on this audit alone.
- Approval is required before representing third-party business concepts as official websites.
