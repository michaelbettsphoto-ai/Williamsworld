# William's World - Battle System

This directory contains the complete specification and data models for the William's World character card and battle system.

## Overview

William's World combines Pokemon-style elemental battles with D&D tactical combat in a kid-friendly format designed for 10-year-olds. The system features:

- **6 Role Types**: Striker, Defender, Support, Controller, Summoner, Scout
- **10 Element Types**: Fire, Water, Grass, Electric, Ice, Rock, Shadow, Light, Wind, Metal
- **Turn-Based 3v3 Battles**: Fast, tactical, with clear feedback
- **18+ Keywords**: Standardized status effects (Damage, Heal, Shield, Stun, Poison, etc.)
- **Progression System**: 3 ranks (Starter → Expert → Legendary)

## Directory Structure

```
battle-system/
├── SPECIFICATION.md           # Complete design specification (18KB)
├── README.md                  # This file
├── data/
│   ├── game-constants.json    # Roles, types, keywords, type chart
│   └── characters/
│       ├── trapper.json       # Defender example (Metal/Light)
│       ├── sparkfin.json      # Scout example (Water/Electric)
│       └── glowmoss.json      # Summoner example (Grass/Shadow)
├── logic/                     # (Future) Battle engine implementation
└── ui/                        # (Future) UI components
```

## Files

### SPECIFICATION.md
The master design document covering:
- Design principles
- Data models (TypeScript interfaces)
- Battle mechanics and formulas
- UI requirements
- Example character cards
- Designer deliverables checklist

### data/game-constants.json
Core game data including:
- **Roles**: All 6 roles with colors and VFX language
- **Types**: All 10 element types with icons and colors
- **Type Chart**: Complete 10x10 effectiveness matrix
- **Keywords**: All 18+ status effects with descriptions
- **Target Types**: Single/All enemy/ally targeting options

### data/characters/
Example character implementations:

#### trapper.json (Defender)
- **Role**: Defender (Metal/Light)
- **Stats**: High HP (120), Defense (65)
- **Passive**: Pack Guard - Builds stacks to auto-shield allies
- **Moves**: Shield Slam, Barrier Bubble, Taunt Roar, Emergency Cover

#### sparkfin.json (Scout)
- **Role**: Scout/Support (Water/Electric)
- **Stats**: High Speed (70), moderate Power (55)
- **Passive**: Quick Scan - Reveals enemy intents, speed boost when low
- **Moves**: Zap Splash, Slipstream, Backstep, Weakness Mark

#### glowmoss.json (Summoner)
- **Role**: Summoner/Controller (Grass/Shadow)
- **Stats**: Balanced, focuses on control
- **Passive**: Fungal Bloom - Summons totems after applying poison
- **Moves**: Spore Dart, Totem Call, Dark Mist, Overgrowth Field

## Data Model

Each character card includes:

```javascript
{
  id: "unique_identifier",
  name: "Character Name",
  title: "Class Title",
  role_primary: "defender|striker|support|controller|summoner|scout",
  role_secondary: null | "role",
  types: ["element1", "element2"],
  rarity: "common|rare|epic|legendary",
  rank: 0|1|2,
  stats: { hp, power, defense, magicResist, speed },
  passive: { name, icon, description, rules },
  moves: [4 moves with keywords, cooldowns, targeting],
  synergy_tags: ["tag1", "tag2", "tag3"],
  exploration_perk: { name, description },
  quirks: [{ trigger, behavior }],
  vfx_profile: { roleColors, iconSet, animations },
  progression: { ranks: [3 rank definitions] }
}
```

## Battle Mechanics

### Damage Formula
```
BaseDamage = MovePower × (AttackerPower / (DefenderDefense + 50))
TypeMultiplier = 0.5 (resist) / 1.0 (neutral) / 2.0 (super) / 0.0 (immune)
FinalDamage = BaseDamage × TypeMultiplier × (1 + Buffs - Debuffs)
```

### Turn Loop
1. **Start of Round**: Apply auras, regen
2. **Determine Order**: By speed (with priority moves first)
3. **Execute Turns**: Each unit takes action
4. **Resolve Effects**: Apply damage, status effects
5. **End of Round**: DoT damage, terrain effects, cooldown reduction

### Party Tactics
- **Mark/Guard**: Defender mechanics (force enemy targeting)
- **Auras**: Support/Controller buffs for whole team
- **Terrain**: Summoner hazards that persist

## Type Effectiveness

Quick reference for type matchups:

| Strong Against | Weak Against |
|---------------|--------------|
| **Fire** → Grass, Ice | Water, Rock, Metal |
| **Water** → Fire, Rock | Grass, Electric |
| **Grass** → Water, Rock | Fire, Ice, Wind |
| **Electric** → Water, Wind, Metal | Grass, Electric |
| **Ice** → Grass, Wind | Fire, Metal |
| **Rock** → Fire, Ice | Water, Grass |
| **Shadow** → Light | Shadow |
| **Light** → Shadow | Light |
| **Wind** → Grass | Ice, Electric |
| **Metal** → Fire, Ice, Rock | Fire, Electric, Metal |

## Usage

### Loading Character Data
```javascript
// Load a character
const trapper = await fetch('/battle-system/data/characters/trapper.json')
  .then(r => r.json());

// Access character properties
console.log(trapper.name);          // "Trapper"
console.log(trapper.title);         // "Backpack Bastion"
console.log(trapper.role_primary);  // "defender"
console.log(trapper.stats.hp);      // 120
console.log(trapper.moves[0].name); // "Shield Slam"
```

### Loading Game Constants
```javascript
// Load type chart and constants
const constants = await fetch('/battle-system/data/game-constants.json')
  .then(r => r.json());

// Get type effectiveness
const effectiveness = constants.type_chart.fire.water; // 0.5 (not very effective)

// Get role info
const defenderInfo = constants.roles.defender;
console.log(defenderInfo.primary_color); // "#3b82f6"

// Get keyword info
const stunInfo = constants.keywords.stun;
console.log(stunInfo.icon); // "💫"
```

## Next Steps

### Implementation Phases

1. **✅ Phase 1: Data Models & Specification** (COMPLETE)
   - Specification document
   - Game constants
   - 3 example characters

2. **Phase 2: Battle Logic** (TODO)
   - Turn manager
   - Damage calculator
   - Status effect handler
   - AI opponent logic

3. **Phase 3: UI Components** (TODO)
   - Character card components
   - Battle HUD
   - Move selection interface
   - Status icon display

4. **Phase 4: Integration** (TODO)
   - Connect to existing William's World quest tracker
   - Add character collection screen
   - Implement battle mode
   - Sound effects and animations

## Design Principles

All implementations should follow these principles:

1. **Readable in 2 seconds** - Role, type, and function must be obvious
2. **Kid-friendly** - Big icons, minimal text, emoji usage
3. **Consistent** - Same layouts, colors, and patterns everywhere
4. **Battle-first** - Every card element maps to combat mechanics
5. **Polished** - Smooth animations, sound cues, satisfying feedback

## Contributing

When adding new characters:
1. Follow the data model structure
2. Ensure 4 moves per character
3. Include all required fields
4. Choose 1-2 synergistic element types
5. Make passive abilities thematic and impactful
6. Test type matchups for balance

## License

Part of William's World - See main repository for license details.

---

**Created for William's World v1.0 • Feb 8, 2026**
