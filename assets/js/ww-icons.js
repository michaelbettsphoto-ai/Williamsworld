/**
 * William's World — Custom SVG Icon Set
 * RPG fantasy aesthetic: thick strokes, gold-tinted, hand-crafted silhouettes
 * All icons are 24×24 viewBox inline SVG strings
 */
const WWIcons = {

  // ── Navigation ──────────────────────────────────────────────────────────
  games: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="6" width="20" height="13" rx="3" ry="3"/>
    <path d="M8 12h2m-1-1v2"/>
    <circle cx="16" cy="11.5" r="0.8" fill="currentColor"/>
    <circle cx="14.5" cy="13" r="0.8" fill="currentColor"/>
    <path d="M6 19l-2 2M18 19l2 2"/>
  </svg>`,

  battle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.5 2L21 8.5l-9 9-2.5-2.5"/>
    <path d="M3 21l5-5"/>
    <path d="M9.5 14.5L3 21"/>
    <path d="M17 3l4 4-1.5 1.5"/>
    <path d="M3 3l3 3"/>
    <path d="M5 5l1.5 1.5"/>
  </svg>`,

  home: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 12L12 3l9 9"/>
    <path d="M9 21V12h6v9"/>
    <path d="M5 10v11h14V10"/>
  </svg>`,

  tracker: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
    <path d="M8 14l2 2 4-4"/>
  </svg>`,

  party: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="9" cy="7" r="3"/>
    <circle cx="17" cy="8" r="2.5"/>
    <path d="M1 20c0-3.3 3.6-6 8-6s8 2.7 8 6"/>
    <path d="M17 14c2.2.5 4 2.2 4 4.5"/>
  </svg>`,

  map: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2"/>
    <line x1="8" y1="2" x2="8" y2="18"/>
    <line x1="16" y1="6" x2="16" y2="22"/>
  </svg>`,

  // ── Weather ──────────────────────────────────────────────────────────────
  weather: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>`,

  sunny: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>`,

  cloudy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
  </svg>`,

  rain: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/>
    <line x1="8" y1="19" x2="8" y2="21"/><line x1="8" y1="13" x2="8" y2="15"/>
    <line x1="12" y1="21" x2="12" y2="23"/><line x1="12" y1="15" x2="12" y2="17"/>
    <line x1="16" y1="19" x2="16" y2="21"/>
  </svg>`,

  storm: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/>
    <polyline points="13,11 9,17 15,17 11,23"/>
  </svg>`,

  snow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/>
    <line x1="8" y1="16" x2="8" y2="20"/><line x1="8" y1="13" x2="8" y2="13"/>
    <line x1="12" y1="18" x2="12" y2="22"/><line x1="12" y1="15" x2="12" y2="15"/>
    <line x1="16" y1="16" x2="16" y2="20"/>
    <circle cx="8" cy="21" r="0.5" fill="currentColor"/>
    <circle cx="12" cy="23" r="0.5" fill="currentColor"/>
    <circle cx="16" cy="21" r="0.5" fill="currentColor"/>
  </svg>`,

  // ── Audio ────────────────────────────────────────────────────────────────
  sound_on: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  </svg>`,

  sound_off: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
    <line x1="23" y1="9" x2="17" y2="15"/>
    <line x1="17" y1="9" x2="23" y2="15"/>
  </svg>`,

  music: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>`,

  ambience: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 18c0-3.3 4-6 9-6s9 2.7 9 6"/>
    <path d="M7 12c0-2.2 2.2-4 5-4s5 1.8 5 4"/>
    <path d="M10 8c0-1.1.9-2 2-2s2 .9 2 2"/>
    <circle cx="12" cy="6" r="1" fill="currentColor"/>
  </svg>`,

  sfx: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>`,

  // ── Quest / Task ─────────────────────────────────────────────────────────
  quest_night: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>`,

  quest_morning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>`,

  quest_backpack: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 20V10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>
    <path d="M9 6V4a3 3 0 0 1 6 0v2"/>
    <line x1="12" y1="11" x2="12" y2="17"/>
    <line x1="9" y1="14" x2="15" y2="14"/>
  </svg>`,

  // ── Trophy / Score ───────────────────────────────────────────────────────
  trophy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 9H3V4h3M18 9h3V4h-3"/>
    <path d="M6 4h12v7a6 6 0 0 1-12 0V4z"/>
    <path d="M12 17v4"/>
    <path d="M8 21h8"/>
  </svg>`,

  // ── Companion Awards ─────────────────────────────────────────────────────
  ember: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2c0 6-6 8-6 13a6 6 0 0 0 12 0c0-5-6-7-6-13z"/>
    <path d="M12 12c0 3-2 4-2 6a2 2 0 0 0 4 0c0-2-2-3-2-6z"/>
  </svg>`,

  sprite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>`,

  golem: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="2" width="12" height="10" rx="2"/>
    <rect x="4" y="12" width="16" height="8" rx="2"/>
    <line x1="9" y1="5" x2="9" y2="5"/><circle cx="9" cy="6" r="1" fill="currentColor"/>
    <circle cx="15" cy="6" r="1" fill="currentColor"/>
    <line x1="2" y1="14" x2="4" y2="16"/><line x1="22" y1="14" x2="20" y2="16"/>
  </svg>`,

  // ── Games Hub ────────────────────────────────────────────────────────────
  snake: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 8a4 4 0 0 1 8 0v2a4 4 0 0 0 8 0V8"/>
    <path d="M4 8v8a4 4 0 0 0 8 0v-2"/>
    <circle cx="20" cy="6" r="1.5" fill="currentColor" stroke="none"/>
  </svg>`,

  tetris: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="5" height="5" rx="1"/>
    <rect x="10" y="3" width="5" height="5" rx="1"/>
    <rect x="10" y="10" width="5" height="5" rx="1"/>
    <rect x="3" y="16" width="5" height="5" rx="1"/>
    <rect x="10" y="16" width="5" height="5" rx="1"/>
    <rect x="17" y="16" width="4" height="5" rx="1"/>
  </svg>`,

  tiles_2048: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="2" width="9" height="9" rx="2"/>
    <rect x="13" y="2" width="9" height="9" rx="2"/>
    <rect x="2" y="13" width="9" height="9" rx="2"/>
    <rect x="13" y="13" width="9" height="9" rx="2"/>
    <text x="6.5" y="8.5" font-size="5" text-anchor="middle" fill="currentColor" stroke="none" font-weight="bold">2</text>
    <text x="17.5" y="8.5" font-size="4" text-anchor="middle" fill="currentColor" stroke="none" font-weight="bold">4</text>
  </svg>`,

  checkers: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2"/>
    <circle cx="7.5" cy="7.5" r="2.5"/>
    <circle cx="16.5" cy="7.5" r="2.5" fill="currentColor" stroke="none"/>
    <circle cx="7.5" cy="16.5" r="2.5" fill="currentColor" stroke="none"/>
    <circle cx="16.5" cy="16.5" r="2.5"/>
  </svg>`,

  chess: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 4h6l-1 4H10L9 4z"/>
    <path d="M8 8h8l1 4H7L8 8z"/>
    <rect x="6" y="12" width="12" height="3" rx="1"/>
    <rect x="5" y="18" width="14" height="3" rx="1"/>
    <line x1="12" y1="2" x2="12" y2="4"/>
    <circle cx="12" cy="2" r="1" fill="currentColor" stroke="none"/>
  </svg>`,

  // ── Misc UI ──────────────────────────────────────────────────────────────
  close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`,

  check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20,6 9,17 4,12"/>
  </svg>`,

  shield: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>`,

  sword: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="14.5,17.5 3,6 3,3 6,3 17.5,14.5"/>
    <line x1="13" y1="19" x2="19" y2="13"/>
    <line x1="16" y1="16" x2="20" y2="20"/>
    <line x1="19" y1="21" x2="21" y2="19"/>
  </svg>`,

  crown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 19h20M2 19l3-9 5 5 2-9 2 9 5-5 3 9"/>
    <circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none"/>
  </svg>`,

  scroll: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="16" y2="17"/>
  </svg>`,

  /**
   * Render an icon as an HTML string with optional class and size
   * @param {string} name - icon key
   * @param {object} opts - { cls, size, color, title }
   */
  render(name, opts = {}) {
    const svg = this[name];
    if (!svg) return '';
    const cls = opts.cls ? ` class="${opts.cls}"` : '';
    const size = opts.size || 20;
    const color = opts.color || 'currentColor';
    const title = opts.title ? `<title>${opts.title}</title>` : '';
    // Inject size and class into the SVG
    return svg
      .replace('<svg ', `<svg width="${size}" height="${size}" aria-hidden="true"${cls} `)
      .replace('stroke="currentColor"', `stroke="${color}"`)
      .replace(/^(<svg[^>]*>)/, `$1${title}`);
  }
};

// Make available globally
window.WWIcons = WWIcons;
