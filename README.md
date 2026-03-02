# WCAG 2.2 Component Checker (Figma Plugin)

MVP plugin that scans the current selection or entire page for key WCAG 2.2 AA design-time checks:

- Target Size (2.5.8) — ensures interactive hit areas are at least 24×24 px.
- Text Contrast (1.4.3) — solid text fill vs effective solid background.
- Non-text Contrast (1.4.11) — icons/borders vs background.
- Text Size heuristic (design-system rule) — configurable minimum, warning by default.

## Quick start

```bash
npm install
npm run build
```

Load `manifest.json` in Figma → Plugins → Development → “Import plugin from manifest…”. Built assets live in `dist/` (`code.js`, `ui.js`, `ui.html`).

## Usage

1. Open the plugin; choose **Selection** or **Page**.
2. Optionally toggle “include hidden/locked” and set text-size minimum / strict mode in Settings.
3. Click **Scan**. Progress updates every ~50 nodes; cancel anytime.
4. Review summary cards and filter results. “Go” focuses the node in Figma.

## Features (MVP)

- Batched BFS traversal, skips hidden/locked unless enabled.
- 20s timeout guard; always ends in COMPLETE / EMPTY / ERROR / CANCELLED.
- Manual flags for unknown backgrounds (gradients/images) or non-solid fills.
- Preact UI with filters: criterion, severity, search; summary chips.

## Project structure

```
manifest.json
esbuild.config.js
package.json
tsconfig.json
src/
  code.ts               // main thread
  ui.tsx, ui.html       // UI iframe
  traversal.ts          // batched scan
  engine/ruleEngine.ts  // runs rules
  figma/background.ts   // effective background heuristic
  figma/roles.ts        // interactive detection
  rules/*               // target size, text size, text/non-text contrast
  color/*               // luminance & contrast utils
  settings.ts, types.ts
tests/
  color.test.ts
  contrast.test.ts
```

## Scripts

- `npm run build` — bundle main + UI and copy `ui.html` to `dist/`.
- `npm run watch` / `npm run dev` — build in watch mode.
- `npm run test` — Vitest unit tests for color/contrast utilities.

## Limitations (MVP)

- Background detection stops at first solid ancestor; gradients, images, or blends produce “Manual” findings.
- Mixed text styles (mixed font sizes/weights) are skipped for contrast/text-size checks.
- Role/interaction inferred by name or pluginData; may miss custom patterns.

## Smoke test checklist

- Tiny icon/button (16×16) → target size error.
- Low-contrast text (#777 on #fff) → text contrast error.
- Icon stroke at 2:1 contrast → non-text warning.
- Text at 11px → text-size warning (or error if strict).

## Roadmap ideas

- Export results (CSV/JSON), saved settings per file.
- Better background resolution (blend modes, multiple fills).
- Evidence badges (swatches, size chips) and rule toggles.
