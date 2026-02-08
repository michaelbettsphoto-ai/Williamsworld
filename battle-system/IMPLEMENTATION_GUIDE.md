# William's World - Battle System Implementation Guide

This guide provides step-by-step instructions for implementing and extending the William's World battle system.

## Quick Start

### 1. View the Demos

**Character Card Templates:**
Open `/battle-system/ui/card-templates.html` in your browser to see:
- Collection grid cards
- Full detail cards
- Battle mini cards
- All visual components

**Battle System Demo:**
Open `/battle-system-demo.html` in your browser to:
- Run automated battle simulations
- View character details
- Check type effectiveness chart
- See the battle engine in action

### 2. Understanding the Architecture

```
battle-system/
├── SPECIFICATION.md          # Master design document
├── README.md                 # Overview and quick reference
├── data/
│   ├── game-constants.json   # Roles, types, keywords, type chart
│   └── characters/           # Character card data
│       ├── trapper.json
│       ├── sparkfin.json
│       └── glowmoss.json
├── logic/
│   ├── battle-engine.js      # Core battle mechanics
│   └── battle-simulator.js   # Testing and demo utilities
└── ui/
    ├── character-cards.css   # Complete UI component library
    ├── card-templates.html   # Visual component examples
    └── README.md             # UI component documentation
```

## Adding New Characters

### Step 1: Create Character Data File

Create a new JSON file in `/battle-system/data/characters/`:

```json
{
  "id": "unique_character_id",
  "name": "Character Name",
  "title": "Cool Title",
  "role_primary": "striker|defender|support|controller|summoner|scout",
  "role_secondary": null,
  "types": ["element1", "element2"],
  "rarity": "common|rare|epic|legendary",
  "rank": 0,
  "stats": {
    "hp": 100,
    "power": 50,
    "defense": 40,
    "magicResist": 40,
    "speed": 50
  },
  "passive": {
    "name": "Passive Name",
    "icon": "🎯",
    "description": "What the passive does",
    "rules": {
      "trigger": "when_this_happens",
      "effect": "do_this"
    }
  },
  "moves": [
    {
      "name": "Move Name",
      "type": "fire|water|grass|etc",
      "target": "single_enemy|all_enemies|self|single_ally|all_allies",
      "power": 30,
      "keywords": ["damage", "burn"],
      "description": "What the move does",
      "cooldown": 0,
      "rules": {
        "damage_formula": "standard"
      }
    }
    // ... 3 more moves (total of 4)
  ],
  "synergy_tags": ["Fire", "Burn", "AoE"],
  "exploration_perk": {
    "name": "Perk Name",
    "description": "What it does outside battle"
  },
  "quirks": [
    {
      "trigger": "idle",
      "behavior": "What the character does"
    }
  ],
  "vfx_profile": {
    "roleColors": ["#color1", "#color2"],
    "iconSet": "icon_set_name",
    "animations": {
      "idle": "animation_name",
      "attack": "animation_name"
    }
  },
  "progression": {
    "ranks": [
      {
        "rank": 0,
        "name": "Starter",
        "unlock_requirement": "Default",
        "visual_changes": "Description"
      }
      // ... ranks 1 and 2
    ]
  }
}
```

### Step 2: Balance Guidelines

Use these guidelines to create balanced characters:

**Total Stat Points by Rarity:**
- Common: 250-280 total stats
- Rare: 280-310 total stats
- Epic: 310-340 total stats
- Legendary: 340-370 total stats

**Role Stat Distribution:**
- **Striker**: High Power (50-70), Low HP/Defense (70-90 / 30-40)
- **Defender**: High HP/Defense (120-140 / 60-80), Low Power (30-40)
- **Support**: Balanced stats (90-110 / 40-50 / 40-50)
- **Controller**: High Speed (60-80), Moderate others
- **Summoner**: Balanced with good Magic Resist (50-70)
- **Scout**: High Speed (70-90), Moderate Power (50-60)

**Move Power Guidelines:**
- Basic attack (CD 0): 25-35 power
- Special move (CD 1-2): 35-50 power
- Ultimate (CD 3): 50-70 power
- Support moves: 20-40 (for shields/heals)

### Step 3: Test Your Character

Load your character in the battle simulator:

```javascript
// Add to battle-simulator.js
const newChar = await fetch('/battle-system/data/characters/your-character.json')
  .then(r => r.json());

simulator.characters['your-character'] = newChar;
```

## Implementing Battle UI

### Basic Battle Screen Layout

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/battle-system/ui/character-cards.css">
  <style>
    .battle-screen {
      display: grid;
      grid-template-rows: auto 1fr auto;
      height: 100vh;
      background: linear-gradient(135deg, #1a0e2e 0%, #2d1b4e 100%);
    }
    
    .battle-field {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      padding: 40px;
    }
    
    .team-area {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .moves-panel {
      padding: 20px;
      background: rgba(30, 15, 40, 0.95);
      border-top: 3px solid rgba(255, 211, 110, 0.3);
    }
  </style>
</head>
<body>
  <div class="battle-screen">
    
    <!-- Turn Order Bar -->
    <div class="turn-order-bar">
      <!-- Show turn order here -->
    </div>
    
    <!-- Battle Field -->
    <div class="battle-field">
      <!-- Ally Team -->
      <div class="team-area">
        <div class="card-battle-mini">
          <!-- Ally 1 -->
        </div>
        <div class="card-battle-mini">
          <!-- Ally 2 -->
        </div>
        <div class="card-battle-mini">
          <!-- Ally 3 -->
        </div>
      </div>
      
      <!-- Enemy Team -->
      <div class="team-area">
        <div class="card-battle-mini">
          <!-- Enemy 1 -->
        </div>
        <div class="card-battle-mini">
          <!-- Enemy 2 -->
        </div>
        <div class="card-battle-mini">
          <!-- Enemy 3 -->
        </div>
      </div>
    </div>
    
    <!-- Moves Panel -->
    <div class="moves-panel">
      <div class="card-detail-moves">
        <!-- 4 move tiles for active character -->
      </div>
    </div>
    
  </div>
  
  <script src="/battle-system/logic/battle-engine.js"></script>
  <script>
    // Initialize battle
    const engine = new BattleEngine(gameConstants);
    engine.initBattle(allyParty, enemyParty);
    
    // Update UI every turn
    function updateBattleUI() {
      // Update HP bars
      // Update status icons
      // Update turn order
      // Highlight active unit
    }
  </script>
</body>
</html>
```

### Connecting Battle Engine to UI

```javascript
class BattleUIController {
  constructor(engine, uiElements) {
    this.engine = engine;
    this.ui = uiElements;
  }
  
  updateHP(unit, newHP) {
    const hpBar = this.ui.getHPBar(unit.id);
    const percentage = (newHP / unit.maxHp) * 100;
    hpBar.style.width = percentage + '%';
    hpBar.textContent = `${newHP}/${unit.maxHp}`;
    
    // Update color
    if (percentage <= 25) {
      hpBar.classList.add('critical');
    } else if (percentage <= 50) {
      hpBar.classList.add('low');
    }
  }
  
  addStatusIcon(unit, statusType, duration) {
    const statusContainer = this.ui.getStatusContainer(unit.id);
    const icon = document.createElement('div');
    icon.className = 'battle-status-icon';
    icon.innerHTML = `
      ${this.getStatusIcon(statusType)}
      <div class="status-duration">${duration}</div>
    `;
    statusContainer.appendChild(icon);
  }
  
  showDamageNumber(unit, damage, effectiveness) {
    const damageText = document.createElement('div');
    damageText.className = 'floating-damage';
    damageText.textContent = `-${damage}`;
    
    if (effectiveness === 'SUPER EFFECTIVE!') {
      damageText.classList.add('super-effective');
    }
    
    // Animate
    const unitElement = this.ui.getUnitElement(unit.id);
    unitElement.appendChild(damageText);
    
    setTimeout(() => damageText.remove(), 2000);
  }
  
  async executeMove(attacker, moveIndex, targets) {
    // Visual feedback: highlight attacker
    this.highlightUnit(attacker);
    
    // Show move animation
    await this.playMoveAnimation(attacker, moveIndex);
    
    // Execute in engine
    this.engine.executeMove(attacker, moveIndex, targets);
    
    // Update UI for all effects
    this.updateAllBattleState();
  }
}
```

## Adding New Element Types

### Step 1: Update game-constants.json

```json
{
  "types": {
    "psychic": {
      "name": "Psychic",
      "primary_color": "#a855f7",
      "secondary_color": "#c084fc",
      "icon": "🔮"
    }
  },
  "type_chart": {
    "psychic": {
      "fire": 1.0,
      "water": 1.0,
      "grass": 2.0,
      "electric": 1.0,
      "ice": 1.0,
      "rock": 1.0,
      "shadow": 2.0,
      "light": 0.5,
      "wind": 1.0,
      "metal": 0.5,
      "psychic": 0.5
    }
  }
}
```

### Step 2: Add CSS Variables

```css
:root {
  --type-psychic: #a855f7;
  --type-psychic-light: #c084fc;
}
```

### Step 3: Update All Existing Types

Add the new type to each existing type's matchup in the type chart.

## Adding New Keywords/Status Effects

### Step 1: Define in game-constants.json

```json
{
  "keywords": {
    "lifesteal": {
      "name": "Lifesteal",
      "description": "Heals attacker for percentage of damage dealt",
      "icon": "🧛",
      "type": "offensive"
    }
  }
}
```

### Step 2: Implement in Battle Engine

```javascript
// In battle-engine.js executeMove()
case 'lifesteal':
  targets.forEach(target => {
    const result = this.calculateDamage(attacker, target, move);
    this.applyDamage(target, result.damage);
    const healing = Math.floor(result.damage * 0.3); // 30% lifesteal
    this.applyHealing(attacker, healing);
  });
  break;
```

### Step 3: Add UI Styling

```css
.keyword-chip.lifesteal {
  background: rgba(220, 38, 38, 0.3);
  border-color: #dc2626;
  color: #dc2626;
}
```

## Performance Optimization

### For Large Battles

```javascript
// Batch UI updates
class BattleRenderer {
  constructor() {
    this.updateQueue = [];
    this.isRendering = false;
  }
  
  queueUpdate(updateFn) {
    this.updateQueue.push(updateFn);
    if (!this.isRendering) {
      this.processQueue();
    }
  }
  
  async processQueue() {
    this.isRendering = true;
    
    while (this.updateQueue.length > 0) {
      const batch = this.updateQueue.splice(0, 10); // Process 10 at a time
      
      await Promise.all(batch.map(fn => fn()));
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    
    this.isRendering = false;
  }
}
```

### Efficient Status Management

```javascript
// Use Map for O(1) lookups
class StatusManager {
  constructor() {
    this.statusesByUnit = new Map();
  }
  
  addStatus(unitId, status) {
    if (!this.statusesByUnit.has(unitId)) {
      this.statusesByUnit.set(unitId, []);
    }
    this.statusesByUnit.get(unitId).push(status);
  }
  
  getStatuses(unitId) {
    return this.statusesByUnit.get(unitId) || [];
  }
}
```

## Testing Your Implementation

### Unit Tests (Example)

```javascript
describe('Battle Engine', () => {
  let engine;
  
  beforeEach(() => {
    engine = new BattleEngine(gameConstants);
  });
  
  test('damage calculation with type effectiveness', () => {
    const attacker = { currentStats: { power: 50 } };
    const defender = { 
      currentStats: { defense: 30 },
      types: ['water']
    };
    const move = { 
      power: 30, 
      type: 'fire' 
    };
    
    const result = engine.calculateDamage(attacker, defender, move);
    
    expect(result.typeMultiplier).toBe(0.5); // Fire weak vs Water
    expect(result.effectiveness).toBe('Not very effective...');
  });
  
  test('status effect application', () => {
    const unit = { statuses: [] };
    
    engine.applyStatus(unit, 'poison', 2, { damage_per_turn: 10 });
    
    expect(unit.statuses).toHaveLength(1);
    expect(unit.statuses[0].type).toBe('poison');
    expect(unit.statuses[0].duration).toBe(2);
  });
});
```

### Integration Testing

```javascript
describe('Full Battle Flow', () => {
  test('complete 3v3 battle', () => {
    const simulator = new BattleSimulator();
    await simulator.loadGameData();
    
    const result = simulator.runFullBattle(10);
    
    expect(result.winner).toBeDefined();
    expect(result.battleLog.length).toBeGreaterThan(0);
  });
});
```

## Common Pitfalls

### 1. Forgetting to Tick Cooldowns
Always decrement cooldowns at end of round:
```javascript
processEndOfRound() {
  units.forEach(unit => {
    unit.cooldowns = unit.cooldowns.map(cd => Math.max(0, cd - 1));
  });
}
```

### 2. Not Capping Healing
Always cap healing at max HP:
```javascript
const actualHealing = Math.min(healing, unit.maxHp - unit.currentHp);
```

### 3. Type Chart Incomplete
Ensure ALL type matchups are defined, including self-matchups.

### 4. Status Duration Edge Cases
Handle status expiration carefully:
```javascript
// Filter AFTER ticking down
unit.statuses = unit.statuses.filter(status => {
  status.duration--;
  return status.duration > 0;
});
```

## Next Steps

1. **Asset Creation**: Design actual sprites/icons for all types, roles, and keywords
2. **Sound Effects**: Add audio feedback for moves, hits, status effects
3. **Animations**: Implement sprite animations and VFX
4. **AI Opponent**: Create smarter AI that considers type matchups and strategy
5. **Multiplayer**: Add networking for PvP battles
6. **Tournament Mode**: Create bracket-style competitions
7. **Card Collection**: Implement unlock/progression system
8. **Mobile Touch**: Add swipe gestures and touch-optimized UI

## Resources

- **Specification**: `/battle-system/SPECIFICATION.md`
- **Data Models**: `/battle-system/data/`
- **Battle Logic**: `/battle-system/logic/`
- **UI Components**: `/battle-system/ui/`
- **Demo**: `/battle-system-demo.html`

## Support

For questions or issues with implementation, refer to:
1. The specification document for design decisions
2. The example characters for data structure reference
3. The battle simulator for working code examples

---

**William's World Battle System v1.0 • Feb 8, 2026**
