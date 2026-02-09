# William's World - UI Components

This directory contains reusable UI components for displaying character cards and battle interfaces in William's World.

## Files

### character-cards.css
Complete CSS stylesheet with all character card component styles:
- Collection grid cards (small)
- Full detail cards (front and back)
- Battle mini cards (HUD)
- Move button tiles
- Status icons and effects
- Role and type badges
- Responsive layouts

### card-templates.html
Interactive demo page showcasing all card component variations:
- Live examples of each card type
- Interactive elements (clickable cards and moves)
- Visual design reference for implementation

## Component Types

### 1. Collection Grid Card
**Usage:** Collection screens, character selection

**Features:**
- Portrait placeholder (200x180px)
- Character name
- Role badge (primary + optional secondary)
- Type icons (1-2)
- Rarity indicator
- Hover effects

**CSS Classes:**
- `.card-collection` - Main container
- `.card-collection-portrait` - Portrait area
- `.card-collection-name` - Character name
- `.card-collection-badges` - Role badges container
- `.card-role-badge` - Individual role badge
- `.card-type-icons` - Type icons container
- `.card-type-icon` - Individual type icon
- `.card-rarity` - Rarity label

### 2. Full Detail Card (Front)
**Usage:** Character details, deck building, collection viewing

**Features:**
- Character name and title
- Role badges (large primary, small secondary)
- Type badges with icons
- 5 core stats (HP, Power, Defense, Magic Resist, Speed)
- Passive ability with icon and description
- 4 move tiles with:
  - Move name
  - Type icon
  - Cooldown indicator
  - Keyword chips
  - Description
- Synergy tags

**CSS Classes:**
- `.card-detail-front` - Main container (400px wide)
- `.card-detail-header` - Header section
- `.card-detail-name` - Character name
- `.card-detail-subtitle` - Character title
- `.card-detail-roles` - Role badges container
- `.role-badge-large` - Large role badge (48x48px)
- `.role-badge-small` - Small role badge (32x32px)
- `.card-detail-types` - Type badges container
- `.type-badge` - Type badge with icon
- `.card-detail-stats` - Stats grid (5 columns)
- `.stat-box` - Individual stat container
- `.stat-label` - Stat name
- `.stat-value` - Stat value
- `.card-detail-passive` - Passive ability container
- `.passive-header` - Passive header with icon
- `.passive-name` - Passive ability name
- `.passive-description` - Passive description
- `.card-detail-moves` - Moves container
- `.move-tile` - Individual move button
- `.move-header` - Move header with name and info
- `.move-name` - Move name
- `.move-info` - Move metadata container
- `.move-type-icon` - Move type icon
- `.move-cooldown` - Cooldown indicator
- `.move-keywords` - Keywords container
- `.keyword-chip` - Individual keyword chip
- `.move-description` - Move description
- `.card-detail-synergies` - Synergy tags container
- `.synergy-tag` - Individual synergy tag

### 3. Full Detail Card (Back)
**Usage:** Progression tracking, rank information

**Features:**
- Progression path (3 ranks)
- Each rank shows:
  - Rank name (Starter/Expert/Legendary)
  - Status (current/locked/completed)
  - Unlock requirements
  - Stat upgrades
  - Move/passive upgrades
- Exploration perk
- Personality quirks

**CSS Classes:**
- `.card-detail-back` - Main container
- `.card-back-header` - Header section
- `.progression-path` - Ranks container
- `.rank-stage` - Individual rank
- `.rank-stage.active` - Current rank
- `.rank-stage.locked` - Locked rank
- `.rank-header` - Rank header
- `.rank-name` - Rank name
- `.rank-status` - Rank status badge
- `.rank-requirement` - Unlock requirement
- `.rank-upgrades` - Upgrade details
- `.exploration-perk-box` - Exploration perk container
- `.perk-title` - Perk name
- `.perk-description` - Perk description
- `.quirks-box` - Quirks container
- `.quirks-title` - Quirks title
- `.quirk-item` - Individual quirk
- `.quirk-trigger` - Quirk trigger
- `.quirk-behavior` - Quirk behavior

### 4. Battle Mini Card (HUD)
**Usage:** In-battle unit display

**Features:**
- Character name
- HP bar with percentage fill
- Color-coded HP (normal/low/critical)
- Status icons with duration badges
- Role and type indicators
- Compact size (180px wide)

**CSS Classes:**
- `.card-battle-mini` - Main container
- `.battle-mini-name` - Character name
- `.battle-hp-bar` - HP bar container
- `.battle-hp-fill` - HP fill bar
- `.battle-hp-fill.low` - Low HP warning
- `.battle-hp-fill.critical` - Critical HP warning
- `.battle-status-icons` - Status icons container
- `.battle-status-icon` - Individual status icon
- `.status-duration` - Duration badge
- `.battle-mini-footer` - Footer section
- `.battle-role-type` - Role/type icons container
- `.battle-mini-icon` - Small icon (20x20px)

## CSS Custom Properties

The component library uses CSS custom properties for easy theming and customization:

### Role Colors
```css
--role-striker: #dc2626
--role-defender: #3b82f6
--role-support: #7dffb4
--role-controller: #7c3aed
--role-summoner: #10b981
--role-scout: #fbbf24
```

### Element Type Colors
```css
--type-fire: #ef4444
--type-water: #3b82f6
--type-grass: #22c55e
--type-electric: #eab308
--type-ice: #06b6d4
--type-rock: #78716c
--type-shadow: #6366f1
--type-light: #fbbf24
--type-wind: #14b8a6
--type-metal: #71717a
```

### Card Dimensions
```css
--card-width-small: 200px
--card-width-medium: 320px
--card-width-large: 400px
--card-border-radius: 16px
--card-shadow: 0 8px 24px rgba(0, 0, 0, 0.3)
```

## Usage Examples

### Collection Grid Card
```html
<div class="card-collection" 
     style="--role-color-1: var(--role-defender); 
            --role-color-2: var(--role-defender-light);">
  <div class="card-collection-portrait">🎒</div>
  <div class="card-collection-name">Trapper</div>
  <div class="card-collection-badges">
    <div class="card-role-badge">🛡️</div>
  </div>
  <div class="card-type-icons">
    <div class="card-type-icon" 
         style="--type-color-1: var(--type-metal); 
                --type-color-2: var(--type-metal-light);">⚙️</div>
  </div>
  <div class="card-rarity">Rare</div>
</div>
```

### Move Tile
```html
<div class="move-tile" 
     style="--type-color-1: var(--type-fire); 
            --type-color-2: var(--type-fire-light);">
  <div class="move-header">
    <div class="move-name">Flame Strike</div>
    <div class="move-info">
      <div class="move-type-icon">🔥</div>
      <div class="move-cooldown">CD: 2</div>
    </div>
  </div>
  <div class="move-keywords">
    <span class="keyword-chip">⚔️ Damage</span>
    <span class="keyword-chip">🔥 Burn</span>
  </div>
  <div class="move-description">
    A powerful fire attack that burns the target.
  </div>
</div>
```

### Battle Mini Card
```html
<div class="card-battle-mini">
  <div class="battle-mini-name">Character Name</div>
  <div class="battle-hp-bar">
    <div class="battle-hp-fill" style="width: 75%;">75/100</div>
  </div>
  <div class="battle-status-icons">
    <div class="battle-status-icon">
      🛡️
      <div class="status-duration">2</div>
    </div>
  </div>
  <div class="battle-mini-footer">
    <div class="battle-role-type">
      <div class="battle-mini-icon">🛡️</div>
    </div>
  </div>
</div>
```

## Responsive Design

All components include responsive breakpoints:
- Mobile: Cards stack vertically, stats grid adjusts
- Tablet: 2-3 columns for collection grids
- Desktop: Full multi-column layouts

## Integration

### In HTML Files
```html
<link rel="stylesheet" href="./assets/css/character-cards.css">
```

### In JavaScript
```javascript
// Dynamically create cards from character data
function createCollectionCard(character) {
  const card = document.createElement('div');
  card.className = 'card-collection';
  card.style.setProperty('--role-color-1', getRoleColor(character.role_primary));
  // ... populate card content
  return card;
}
```

## Animation Guidelines

From specification (Section 11.2):
- All keyword VFX should be under 1.5 seconds
- Type effectiveness feedback must be obvious (SUPER!/RESIST!)
- HP changes should animate smoothly (0.3s transition)
- Status icons appear with fade-in (0.2s)
- Cards hover with scale and translate effects

## Accessibility

- High contrast text (minimum WCAG AA)
- Icons paired with text labels
- Keyboard navigation support (add `tabindex`)
- Screen reader friendly structure
- Color is not the only information indicator

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Future Enhancements

Planned features:
- [ ] Card flip animations (front/back)
- [ ] Drag-and-drop for deck building
- [ ] Particle effects for keyword VFX
- [ ] Audio integration (card reveal sounds)
- [ ] Touch gestures for mobile
- [ ] Dark/light theme toggle

---

**Part of William's World v1.0 • Feb 8, 2026**
