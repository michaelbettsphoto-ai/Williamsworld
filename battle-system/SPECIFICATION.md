# William's World - Character Cards + Battle System Specification
**Version 1.0 • Feb 8, 2026**

## Purpose
Define exactly how character cards work in William's World, what information they show, and how those attributes drive the battle gameplay. This specification enables design + dev to build the UI, effects language, and rules engine without guessing.

**Target audience:** 10-year-old friendly (big icons, minimal reading), but with enough depth to feel like a real RPG party battle.

## 1. Design Principles (Non‑negotiables)

1. **Readable in 2 seconds** - The role + type + "what it does" must be obvious at a glance
2. **Kid-friendly** - Icons and keyword chips (Stun, Shield, Heal, Mark) are more important than long text
3. **Consistency** - Same layout, same icon positions, same color rules across all cards
4. **Battle-first** - Everything on a card must map to something that happens during combat
5. **Polished game feel** - Micro-animations, sound cues, and satisfying feedback when effects trigger

## 2. Terminology

| Term | Meaning |
|------|---------|
| **Character / Companion** | Any playable creature (including William) used in battles and exploration |
| **Role** | The character's party job (Striker, Defender, Support, Controller, Summoner/Builder, Scout/Utility) |
| **Type** | Elemental affinity that drives strengths/weaknesses (Pokemon-like) |
| **Move** | An action selected on the character's turn (damage, heal, control, etc.) |
| **Passive** | Always-on rule modifier (ability) |
| **Keyword** | Short, standardized effect label used everywhere in UI (Stun, Shield, Cleanse, etc.) |
| **Stacks** | Effects that can accumulate to strengthen an outcome (e.g., Guard stacks) |
| **Board State** | Everything active that persists between turns: buffs/debuffs, terrain, hazards, auras, summons |

## 3. Roles (What the card is trying to communicate)

Each character has 1 Primary Role and optionally 1 Secondary Role (shown as a smaller badge). Role drives silhouette, card color accents, and VFX language.

| Role | Gameplay Job | Visual / VFX Language |
|------|--------------|----------------------|
| **Striker** | Win fast. High damage or crit. Often fragile. | Slashes, bursts, impact rings, sharp shapes |
| **Defender** | Protect team. Soak hits. Mark enemies. Provide shields. | Barriers, domes, metal clang, sturdy shapes |
| **Support** | Heal, shield, cleanse, and buff the party. | Warm glow, sparkles, musical/holy rings |
| **Controller** | Control tempo. Stun/sleep/slow. Manipulate turn order. | Runes, time-warp, frost haze, chain effects |
| **Summoner/Builder** | Creates board advantage: hazards, totems, minions, stacking power. | Totems, gadgets, spores, stacking icons |
| **Scout/Utility** | Info + reposition. Reveal intents, exploit weaknesses, pivot. | Scan lines, target reticles, map tools |

## 4. Character Card UI Requirements

### 4.1 Card Views to Design

| View | What it must show |
|------|-------------------|
| **Collection Grid Card** | Small card used in collection screens. Shows portrait, name, role badge, type icons, and rarity/rank. |
| **Full Detail Card (Front)** | Main card view. Shows stats, passive, 4 moves, synergy tags. |
| **Full Detail Card (Back)** | Progression path (3 ranks), exploration perk, personality quirk/emote triggers. |
| **Battle Mini Card (HUD)** | Compact in-battle summary: HP bar, status icons, role/type, cooldown/charge indicators. |
| **Move Button Tile** | A consistent button component for moves, showing type icon, target icon, keyword chips, and cooldown/charges. |

### 4.2 Card Front Layout (Battle-first)

1. **Name + Title** - Title communicates fantasy class vibe (e.g., "Backpack Bastion")
2. **Primary Role badge** (big) + optional Secondary Role badge (small)
3. **Type icons** (1-2) - Must be instantly readable
4. **Core stats** (5 max): HP, Power, Defense, Magic Resist, Speed
5. **Passive** (1 sentence) + icon
6. **4 Moves** - Each move shows Type, Targeting, Power rating, and Keywords (chips)
7. **Synergy tags** (2-4) to hint combos (Shield, Mark, Poison, Storm, Summon, etc.)

### 4.3 Card Back Layout (RPG flavor + progression)

1. **Rank-up path**: Starter → Expert → Legendary (3 stages)
   - Each stage changes gear/visuals and upgrades 1 passive or move
2. **Exploration perk**: 1 perk that matters outside battle (detect traps, find caches, craft potion, reveal shortcut)
3. **Personality quirk**: 1 fun behavior hook (ties to Easter egg emotes and reactions)
4. **Unlock rules**: Show how the next stage is earned (XP, quests, collecting items, etc.)

## 5. Card Data Model (Fields the game needs)

This is the minimum structured data needed so the UI can be generated consistently and battles can run on a rules engine.

```typescript
interface CharacterCard {
  id: string;                           // Unique identifier
  name: string;                         // Display name
  title: string;                        // Fantasy/class subtitle
  role_primary: Role;                   // Primary role
  role_secondary?: Role;                // Optional secondary role
  types: ElementType[];                 // 1-2 type icons
  rarity: Rarity;                       // Common/Rare/Epic/Legendary
  rank: Rank;                           // Starter/Expert/Legendary (0/1/2)
  stats: Stats;                         // HP, Power, Defense, MagicResist, Speed
  passive: Passive;                     // Always-on ability
  moves: Move[];                        // Exactly 4 moves
  synergy_tags: string[];               // 2-4 tags for filtering/combos
  exploration_perk: ExplorationPerk;    // Non-battle ability
  quirks: Quirk[];                      // Idle/emote triggers
  vfx_profile: VFXProfile;              // Role-based VFX palette
}

interface Stats {
  hp: number;
  power: number;
  defense: number;
  magicResist: number;
  speed: number;
}

interface Passive {
  name: string;
  icon: string;
  description: string;
  rules: any;                           // Game engine rules
}

interface Move {
  name: string;
  type: ElementType;
  target: TargetType;
  power: number;                        // 1-5 pips or numeric
  keywords: Keyword[];                  // 1-3 keyword chips
  description: string;
  cooldown: number;                     // 0-3 rounds
  charges?: number;                     // Optional charge system
  rules: any;                           // Game engine rules
}

interface ExplorationPerk {
  name: string;
  description: string;
}

interface Quirk {
  trigger: string;
  behavior: string;
}

interface VFXProfile {
  roleColors: string[];
  iconSet: string;
}

enum Role {
  Striker = 'striker',
  Defender = 'defender',
  Support = 'support',
  Controller = 'controller',
  Summoner = 'summoner',
  Scout = 'scout'
}

enum ElementType {
  Fire = 'fire',
  Water = 'water',
  Grass = 'grass',
  Electric = 'electric',
  Ice = 'ice',
  Rock = 'rock',
  Shadow = 'shadow',
  Light = 'light',
  Wind = 'wind',
  Metal = 'metal'
}

enum Rarity {
  Common = 'common',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary'
}

enum Rank {
  Starter = 0,
  Expert = 1,
  Legendary = 2
}

enum TargetType {
  SingleEnemy = 'single_enemy',
  AllEnemies = 'all_enemies',
  Self = 'self',
  SingleAlly = 'single_ally',
  AllAllies = 'all_allies',
  AllUnits = 'all_units'
}

enum Keyword {
  Damage = 'damage',
  Heal = 'heal',
  Shield = 'shield',
  Cleanse = 'cleanse',
  Buff = 'buff',
  Debuff = 'debuff',
  Stun = 'stun',
  Sleep = 'sleep',
  Freeze = 'freeze',
  Poison = 'poison',
  Burn = 'burn',
  Shock = 'shock',
  Mark = 'mark',
  Taunt = 'taunt',
  Push = 'push',
  Pull = 'pull',
  Summon = 'summon',
  Terrain = 'terrain'
}
```

## 6. Battle System Overview

### Battle Format
- **Party size**: 3 vs 3 (simple, fast, still tactical)
- **Turn-based**, with speed deciding order (Pokemon feel), plus limited priority moves (D&D tactics feel)
- **Win condition**: Defeat all opponents, or complete an objective (boss battles can add objectives)

### 6.1 Turn Loop (The rules engine)

1. **Start of Round**: Apply start-of-round effects (some auras, regen, etc.)
2. **Determine action order**: Priority moves first, then remaining by Speed (ties random or fixed)
3. **Each character takes a turn**: Choose 1 move
4. **Resolve move**: Accuracy check → damage/heal → apply keywords → apply secondary effects
5. **End of Round**: Apply damage-over-time (Poison), weather/terrain ticks, cooldown tick-down, expire buffs/debuffs

### 6.2 Core Battle Stats (what they do)

| Stat | Effect |
|------|--------|
| **HP** | How much damage you can take |
| **Power** | Increases physical or general damage |
| **Defense** | Reduces incoming physical/general damage |
| **Magic Resist** | Reduces incoming magic/element damage and some control effects |
| **Speed** | Acts earlier; influences dodge/accuracy slightly |

### 6.3 Damage + Healing (simple formulas)

**Damage Formula:**
```
BaseDamage = MovePower × (AttackerPower / (DefenderDefense + 50))
TypeMultiplier = 0.5 (resist) / 1.0 (neutral) / 2.0 (super) / 0.0 (immune)
FinalDamage = BaseDamage × TypeMultiplier × (1 + Buffs - Debuffs)
```

**Healing Formula:**
```
Healing = MovePower × (1 + HealingBuffs) (cap at max HP)
```

**UI note:** Always show TypeMultiplier feedback (e.g., SUPER!, RESIST!) and a small icon flash to teach kids the system.

## 7. Types (Pokemon-style strengths/weaknesses)

Keep the type chart small at first (8-10 types) so it is learnable.

**Type Set:**
- Fire
- Water
- Grass
- Electric
- Ice
- Rock
- Shadow
- Light (Holy)
- Wind (Air)
- Metal

**Designer requirement:** Each type has a distinct icon + two-tone color pair used consistently across move tiles, damage numbers, and status icons.

### Type Chart (Strengths/Weaknesses)

| Attacker ↓ Defender → | Fire | Water | Grass | Electric | Ice | Rock | Shadow | Light | Wind | Metal |
|------------------------|------|-------|-------|----------|-----|------|--------|-------|------|-------|
| **Fire**               | 1.0  | 0.5   | 2.0   | 1.0      | 2.0 | 0.5  | 1.0    | 1.0   | 1.0  | 0.5   |
| **Water**              | 2.0  | 1.0   | 0.5   | 0.5      | 0.5 | 2.0  | 1.0    | 1.0   | 1.0  | 1.0   |
| **Grass**              | 0.5  | 2.0   | 1.0   | 0.5      | 2.0 | 2.0  | 0.5    | 1.0   | 0.5  | 1.0   |
| **Electric**           | 1.0  | 2.0   | 1.0   | 0.5      | 1.0 | 1.0  | 1.0    | 1.0   | 2.0  | 2.0   |
| **Ice**                | 0.5  | 1.0   | 2.0   | 1.0      | 0.5 | 2.0  | 1.0    | 1.0   | 2.0  | 0.5   |
| **Rock**               | 2.0  | 0.5   | 1.0   | 0.5      | 2.0 | 1.0  | 1.0    | 1.0   | 0.5  | 1.0   |
| **Shadow**             | 1.0  | 1.0   | 1.0   | 1.0      | 1.0 | 1.0  | 0.5    | 2.0   | 1.0  | 1.0   |
| **Light**              | 1.0  | 1.0   | 1.0   | 1.0      | 1.0 | 1.0  | 2.0    | 0.5   | 1.0  | 1.0   |
| **Wind**               | 1.0  | 1.0   | 2.0   | 0.5      | 0.5 | 1.0  | 1.0    | 1.0   | 1.0  | 1.0   |
| **Metal**              | 2.0  | 1.0   | 1.0   | 0.5      | 2.0 | 2.0  | 1.0    | 1.0   | 1.0  | 0.5   |

## 8. Keywords + Status System (the language of battle)

Keywords must be standardized and reused everywhere: move tiles, floating combat text, status icons, and tooltips.

### 8.1 Common Keywords (chip list)

| Keyword | Meaning |
|---------|---------|
| **Damage** | Deals HP damage |
| **Heal** | Restores HP |
| **Shield** | Adds a shield that absorbs damage until depleted or expires |
| **Cleanse** | Removes 1 negative status effect |
| **Buff** | Raises a stat (Power/Defense/Speed) for X turns |
| **Debuff** | Lowers a stat for X turns |
| **Stun** | Target loses its next turn (or acts last) |
| **Sleep** | Target cannot act for X turns; waking early on hit is optional |
| **Freeze** | Target has a chance to miss a turn; breaks on fire damage |
| **Poison** | Damage over time each end of round |
| **Burn** | DoT + reduces Power slightly |
| **Shock** | Small chance to fail a move; or reduces Speed |
| **Mark** | Defender tag: marked enemies are encouraged/forced to hit the defender |
| **Taunt** | Target must use attacking moves for X turns (cannot use support/control) |
| **Push/Pull** | Reposition or change target focus (if using a front/back row system) |
| **Summon** | Creates a helper unit or totem with its own effects |
| **Terrain** | Creates a zone that persists for X rounds (spores, holy ground, storm) |

### 8.2 Status Icons (rules)

- Every active status must be represented by an icon above the HP bar (max 5 icons shown; overflow goes into a +N indicator)
- Statuses have durations (turn counters) shown as a tiny number badge on the icon
- If a status is refreshed, duration resets (unless noted)
- If a status stacks, show stack count (e.g., Poison 2)

## 9. Moves (what the player clicks)

### 9.1 Move Structure

Each character has exactly 4 moves. This keeps the UI simple and readable.

Components:
1. **Move name** (short, punchy)
2. **Type icon** (Fire/Water/etc.)
3. **Target icon**: Single Enemy, All Enemies, Self, Ally, All Allies
4. **Power rating** (1-5 pips) or small number; consistent across the whole game
5. **Keyword chips** (1-3) like Damage + Stun, or Heal + Cleanse
6. **Resource rule**: Cooldowns (recommended: 0-3 rounds)
7. **Animation/VFX**: Tied to Type + Role language

### 9.2 Resource System (Cooldowns)

- **Basic Move**: 0 cooldown (always available)
- **Special Move**: 1-2 cooldown
- **Ultimate Move** (optional later): 3-4 cooldown with big VFX

**UI:** Move tile shows cooldown number overlay when unavailable.

## 10. Party Tactics (D&D flavor that makes roles matter)

To feel like D&D (not just Pokemon), we add three party mechanics that roles naturally use:

### 10.1 Mark / Guard (Defender identity)

- **Mark**: Defender applies Mark to an enemy. Marked enemy deals -25% damage to allies that are NOT the defender
- **Guard**: Defender can grant Guard to an ally (a shield + damage redirect)
- **UI**: Mark icon on enemy, Guard icon on protected ally, with clear arrow/connection effect

### 10.2 Concentration / Auras (Support/Controller identity)

- Certain buffs create an Aura for 2-3 rounds (e.g., +Defense to all allies)
- Auras can be broken if the caster takes a big hit (optional: if damage > 25% max HP)
- **UI**: Aura ring under the caster + small party buff icon row

### 10.3 Terrain / Hazards (Summoner identity)

- Terrain persists for 2-4 rounds (e.g., Spore Field: enemies entering get Poison 1)
- Hazards are readable: show a ground decal + a small tooltip label
- Limit active terrain to 1 per team to avoid clutter (new terrain replaces old)

## 11. In‑Battle UI Requirements

### 11.1 Must show

- HP bars for all active units (ally + enemy)
- Role badge + type icons for each unit (small but visible)
- Status icons with duration numbers
- Turn order preview (a small initiative bar) so kids learn tempo
- Move buttons (4) with clear cooldown state + target highlighting
- Readable combat text: damage/heal numbers and keyword popups (STUN!, SHIELD!)

### 11.2 Animation feedback rules

- Every keyword triggers a micro VFX: Stun = stars; Shield = barrier flash; Mark = target reticle; Heal = green ring
- Type advantage must be obvious: SUPER! shakes slightly; RESIST shows dull thud; IMMUNE shows 'No effect'
- Keep all VFX under 1.5 seconds to maintain pace

## 12. Progression (Rank‑ups) and Card Upgrades

- **3 ranks**: Starter → Expert → Legendary
- Each rank grants: +stat bump + one move upgrade OR passive upgrade + a cosmetic gear change
- Move upgrades should be simple: +Power pip, +1 turn duration, or add 1 keyword chip
- **UI**: Show before/after for the upgraded move or passive

## 13. Example Character Cards

### Trapper — Backpack Bastion
**Primary Role:** Defender | **Type(s):** Metal, Light

| HP  | Power | Defense | MagicRes | Speed |
|-----|-------|---------|----------|-------|
| 120 | 35    | 65      | 55       | 25    |

**Passive: Pack Guard** — When an ally takes damage, gain 1 Guard. At 3 Guard, auto‑shield the lowest‑HP ally for 20.

**Moves:**
1. **Shield Slam** (Metal, Single Enemy) — Damage + Mark (CD 0)
2. **Barrier Bubble** (Light, All Allies) — Shield (CD 2)
3. **Taunt Roar** (Metal, Single Enemy) — Taunt 2 turns (CD 2)
4. **Emergency Cover** (Light, Ally) — Guard + Cleanse 1 (CD 3)

### Sparkfin — Storm Trickster
**Primary Role:** Scout/Utility | **Type(s):** Water, Electric

| HP | Power | Defense | MagicRes | Speed |
|----|-------|---------|----------|-------|
| 85 | 55    | 35      | 40       | 70    |

**Passive: Quick Scan** — At start of round, reveal the next enemy move icon and gain +10 Speed if you are below 50% HP.

**Moves:**
1. **Zap Splash** (Electric, Single Enemy) — Damage + Shock (CD 0)
2. **Slipstream** (Water, Ally) — Buff Speed 2 turns (CD 1)
3. **Backstep** (Water, Self) — Dodge next hit (CD 2)
4. **Weakness Mark** (Electric, Single Enemy) — Mark + Debuff Defense 2 turns (CD 3)

### Glowmoss — Spore Sage
**Primary Role:** Summoner/Builder | **Type(s):** Grass, Shadow

| HP  | Power | Defense | MagicRes | Speed |
|-----|-------|---------|----------|-------|
| 100 | 45    | 40      | 50       | 30    |

**Passive: Fungal Bloom** — Whenever you apply Poison, gain 1 Bloom. At 3 Bloom, summon a Spore Totem for 2 rounds.

**Moves:**
1. **Spore Dart** (Grass, Single Enemy) — Damage + Poison 2 turns (CD 0)
2. **Totem Call** (Grass, Self) — Summon (CD 2)
3. **Dark Mist** (Shadow, All Enemies) — Debuff Accuracy 2 turns (CD 2)
4. **Overgrowth Field** (Grass, Terrain) — Terrain 3 rounds (Poison on entry) (CD 3)

## 14. Designer Deliverables Checklist

### UI Components
- [ ] Role badges (6 designs: Striker, Defender, Support, Controller, Summoner, Scout)
- [ ] Type icons (10 designs: Fire, Water, Grass, Electric, Ice, Rock, Shadow, Light, Wind, Metal)
- [ ] Keyword chips (17+ designs for all status effects)
- [ ] Status icons with duration badge overlay

### Card Views
- [ ] Collection card (compact grid view)
- [ ] Full front card (detailed stats view)
- [ ] Full back card (progression view)
- [ ] Battle mini card (in-battle HUD)
- [ ] Move tile component (action button)

### Battle HUD
- [ ] HP bars with gradient fill
- [ ] Status icon row (max 5 + overflow)
- [ ] Initiative bar (turn order preview)
- [ ] 4 move buttons with states (available, cooldown, selected)
- [ ] Target highlight states

### VFX Style Guide
- [ ] Per-role VFX palette (colors, shapes, timing)
- [ ] Per-type VFX palette (element-specific effects)
- [ ] Motion rules (easing, duration limits)
- [ ] Combat feedback (SUPER!/RESIST!/IMMUNE visual language)

---

**End of Specification v1.0**
