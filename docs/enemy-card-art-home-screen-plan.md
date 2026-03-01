# Plan: Use non-binary SVG enemy card art on the Home/Hub screen

## Goal
Ensure Home/Hub enemy deck cards use text-based SVG images (non-binary) so art renders reliably without committing PNG binaries.

## Current source of truth
- Enemy metadata lives in `assets/data/enemies.json`.
- Per-enemy SVG card art already exists in `assets/enemies/<slug>/card_art_v1.svg`.
- Hub deck rendering resolves art in `js/hub.js`.

## Implementation
1. Compute enemy slug safely from `enemy.slug || enemy.id || enemy.name`.
2. Resolve primary Home/Hub art as `assets/enemies/<slug>/card_art_v1.svg`.
3. Keep fallbacks in order:
   - `enemy.artPath`
   - `enemy.portrait`
   - generated SVG data URL fallback.
4. Keep card rendering image-first (no text overlays on card body).

## Validation
- Verify every enemy in `assets/data/enemies.json` has a matching `assets/enemies/<slug>/card_art_v1.svg`.
- Run JS syntax check for `js/hub.js`.
- Smoke test in browser to confirm Home/Hub enemy deck renders card art.

## Acceptance criteria
- Enemy cards render in the Home/Hub enemy deck using non-binary SVG assets.
- No dependency on `assets/enemies/cards/png/*.png` for deck rendering.
- Missing art gracefully degrades to existing fallback image sources.
