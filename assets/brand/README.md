# Brand options

Three directions were prepared for review. The live layout defaults to **Option 1 — Apex Navy**.

Boards (not in this folder): `/workspace/arnova-agency-brand/option-1.png`, `option-2.png`, `option-3.png`, and `overview.png`.

## Swap the palette
Edit `css/tokens.css` and change the single import to `tokens-option-2.css` or `tokens-option-3.css`. Then update the mark files used by `.original-logo` in the shared header and `logo.svg` at the repository root.

The shared token API (used by the layout and by the pricing page) lives in `css/tokens.css`, which imports `css/tokens-option-1.css` by default.

## Options
1. **Apex Navy** — architectural A, navy and gold. Files in `option-1/`.
2. **Ridge Forest** — terraced A, forest and clay. Files in `option-2/`.
3. **Signal Slate** — gateway A, slate and teal. Files in `option-3/`.

Each folder has `mark-light.svg`, `mark-dark.svg`, `wordmark-light.svg`, `wordmark-dark.svg`, `lockup-light.svg` and `lockup-dark.svg`.
