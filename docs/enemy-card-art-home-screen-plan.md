# Plan: Use zipped enemy card PNG art on the Home screen

## Goal
Wire the newly committed archive (`assets/enemies/williams_world_enemy_cards_48_individual_png.zip`) into the Home screen enemy card UI so each enemy tile in `#enemyDeckGrid` uses the new PNG card art.

## Current state (baseline)
- Home screen enemy cards are rendered by `renderEnemyDeck()` in `js/hub.js`.
- The image source currently resolves from `enemy.artPath || enemy.portrait || enemyCardSvgDataUrl(enemy)`.
- Enemy metadata is loaded from `assets/data/enemies.json`, where `artPath`/`portrait` currently point at SVG assets under `assets/enemies/<slug>/`.

## Implementation plan

### 1) Inventory + mapping validation
1. List every enemy `id`/`slug` in `assets/data/enemies.json`.
2. Compare against zip entries (`*_*.png`) and identify naming differences (hyphen-case vs underscore-case).
3. Produce a deterministic mapping rule:
   - `slug` like `dandelion-dagger` → `dandelion_dagger.png`.
4. Identify any missing or extra files and document fallbacks before code changes.

### 2) Extract and place PNG assets in a stable web path
1. Unzip into a committed static folder, e.g.:
   - `assets/enemies/cards/png/<enemy_name>.png`
2. Keep original zip committed for source-of-truth/archive purposes.
3. Confirm all extracted files are reachable from the browser using relative asset URLs.

### 3) Add explicit Home-screen art field (low-risk)
1. In `assets/data/enemies.json`, add a new field per enemy (recommended):
   - `homeCardArtPath: "assets/enemies/cards/png/<enemy_name>.png"`
2. Keep existing `artPath`/`portrait` unchanged so battle/other screens are not unintentionally affected.

### 4) Update Home screen renderer to prefer PNG art
In `js/hub.js` (`renderEnemyDeck()`), change card image selection order to:
1. `enemy.homeCardArtPath`
2. `enemy.artPath`
3. `enemy.portrait`
4. `enemyCardSvgDataUrl(enemy)` fallback

This scopes the visual swap to the Home screen deck only.

### 5) Resilience + UX safeguards
1. Add `onerror` fallback in generated `<img>` markup so broken PNG paths gracefully downgrade to SVG.
2. Keep `loading="lazy"`.
3. Optionally add `decoding="async"` for smoother initial paint.

### 6) Validation checklist
1. Load Home screen and verify every enemy tile displays art (no broken images).
2. Spot-check one enemy from each zone/tier.
3. Hard-refresh to verify cache behavior after first deploy.
4. Confirm no regressions in battle overlays/dock card displays.

### 7) Cleanup and follow-up
1. Add a short note in docs/changelog describing the new Home screen art source.
2. (Optional) Add a tiny script to auto-generate `homeCardArtPath` from slug to avoid manual drift.

## Acceptance criteria
- Home screen enemy deck shows the new PNG card art for all enemies represented in the zip.
- Missing/mismatched files degrade gracefully to prior art sources.
- Existing gameplay visuals outside the Home deck remain unchanged unless intentionally updated.
