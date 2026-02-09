/**
 * William's World - Battle Engine
 * Core battle mechanics and turn resolution logic
 */

class BattleEngine {
  constructor(gameConstants) {
    this.constants = gameConstants;
    this.battleState = null;
  }

  /**
   * Initialize a new battle
   * @param {Array} allyParty - Array of 3 character cards for player
   * @param {Array} enemyParty - Array of 3 character cards for opponent
   */
  initBattle(allyParty, enemyParty) {
    this.battleState = {
      round: 1,
      turn: 0,
      allies: allyParty.map(char => this.initBattleUnit(char, 'ally')),
      enemies: enemyParty.map(char => this.initBattleUnit(char, 'enemy')),
      terrain: { ally: null, enemy: null },
      battleLog: [],
      winner: null
    };
    
    this.logEvent('Battle started!');
    return this.battleState;
  }

  /**
   * Initialize a battle unit with combat state
   */
  initBattleUnit(character, team) {
    return {
      ...character,
      team: team,
      currentHp: character.stats.hp,
      maxHp: character.stats.hp,
      currentStats: { ...character.stats },
      statuses: [],
      auras: [],
      shields: [],
      cooldowns: character.moves.map(() => 0),
      stacks: {},
      summons: [],
      isDefeated: false
    };
  }

  /**
   * Calculate damage based on formula
   * BaseDamage = MovePower × (AttackerPower / (DefenderDefense + 50))
   * TypeMultiplier = 0.5 (resist) / 1.0 (neutral) / 2.0 (super) / 0.0 (immune)
   * FinalDamage = BaseDamage × TypeMultiplier × (1 + Buffs - Debuffs)
   */
  calculateDamage(attacker, defender, move) {
    // Base damage calculation
    const baseDamage = move.power * (attacker.currentStats.power / (defender.currentStats.defense + 50));
    
    // Type effectiveness
    const typeMultiplier = this.getTypeEffectiveness(move.type, defender.types[0]);
    
    // Buffs and debuffs (simplified: count buff/debuff statuses)
    const buffModifier = this.calculateModifiers(attacker, defender);
    
    // Final damage
    const finalDamage = Math.floor(baseDamage * typeMultiplier * (1 + buffModifier));
    
    return {
      damage: Math.max(0, finalDamage),
      typeMultiplier: typeMultiplier,
      effectiveness: this.getEffectivenessLabel(typeMultiplier)
    };
  }

  /**
   * Get type effectiveness multiplier
   */
  getTypeEffectiveness(attackType, defenseType) {
    const typeChart = this.constants.type_chart;
    if (typeChart[attackType] && typeChart[attackType][defenseType] !== undefined) {
      return typeChart[attackType][defenseType];
    }
    return 1.0; // Neutral
  }

  /**
   * Get effectiveness label for UI feedback
   */
  getEffectivenessLabel(multiplier) {
    if (multiplier === 0) return 'IMMUNE!';
    if (multiplier === 0.5) return 'Not very effective...';
    if (multiplier === 2.0) return 'SUPER EFFECTIVE!';
    return '';
  }

  /**
   * Calculate buff/debuff modifiers
   */
  calculateModifiers(attacker, defender) {
    let modifier = 0;
    
    // Count power buffs on attacker
    attacker.statuses.forEach(status => {
      if (status.type === 'buff' && status.stat === 'power') {
        modifier += 0.2; // +20% per buff
      }
    });
    
    // Count defense debuffs on defender
    defender.statuses.forEach(status => {
      if (status.type === 'debuff' && status.stat === 'defense') {
        modifier += 0.15; // +15% damage per defense debuff
      }
    });
    
    return modifier;
  }

  /**
   * Apply damage to a unit, accounting for shields
   */
  applyDamage(unit, damage) {
    let remainingDamage = damage;
    
    // Shields absorb damage first
    for (let i = unit.shields.length - 1; i >= 0; i--) {
      const shield = unit.shields[i];
      if (shield.amount >= remainingDamage) {
        shield.amount -= remainingDamage;
        this.logEvent(`${unit.name}'s shield absorbed ${remainingDamage} damage!`);
        remainingDamage = 0;
        if (shield.amount === 0) {
          unit.shields.splice(i, 1);
        }
        break;
      } else {
        remainingDamage -= shield.amount;
        this.logEvent(`${unit.name}'s shield broke!`);
        unit.shields.splice(i, 1);
      }
    }
    
    // Apply remaining damage to HP
    if (remainingDamage > 0) {
      unit.currentHp = Math.max(0, unit.currentHp - remainingDamage);
      if (unit.currentHp === 0) {
        unit.isDefeated = true;
        this.logEvent(`${unit.name} was defeated!`);
      }
    }
    
    return remainingDamage;
  }

  /**
   * Apply healing to a unit
   */
  applyHealing(unit, amount) {
    const healingModifier = this.getHealingModifier(unit);
    const finalHealing = Math.floor(amount * (1 + healingModifier));
    const actualHealing = Math.min(finalHealing, unit.maxHp - unit.currentHp);
    
    unit.currentHp += actualHealing;
    this.logEvent(`${unit.name} restored ${actualHealing} HP!`);
    
    return actualHealing;
  }

  /**
   * Get healing modifier from buffs
   */
  getHealingModifier(unit) {
    let modifier = 0;
    unit.statuses.forEach(status => {
      if (status.type === 'healing_buff') {
        modifier += 0.25; // +25% per healing buff
      }
    });
    return modifier;
  }

  /**
   * Apply a status effect to a unit
   */
  applyStatus(unit, statusType, duration, extraData = {}) {
    const status = {
      type: statusType,
      duration: duration,
      ...extraData
    };
    
    // Check if status already exists (refresh or stack)
    const existing = unit.statuses.find(s => s.type === statusType);
    if (existing) {
      // Refresh duration
      existing.duration = duration;
      this.logEvent(`${unit.name}'s ${statusType} was refreshed!`);
    } else {
      unit.statuses.push(status);
      this.logEvent(`${unit.name} was afflicted with ${statusType}!`);
    }
  }

  /**
   * Apply a shield to a unit
   */
  applyShield(unit, amount, duration) {
    unit.shields.push({
      amount: amount,
      duration: duration
    });
    this.logEvent(`${unit.name} gained a shield of ${amount}!`);
  }

  /**
   * Cleanse negative status effects
   */
  cleanse(unit, count = 1) {
    const negativeStatuses = ['poison', 'burn', 'stun', 'sleep', 'freeze', 'debuff'];
    let cleansed = 0;
    
    for (let i = unit.statuses.length - 1; i >= 0 && cleansed < count; i--) {
      if (negativeStatuses.includes(unit.statuses[i].type)) {
        const statusType = unit.statuses[i].type;
        unit.statuses.splice(i, 1);
        this.logEvent(`${unit.name}'s ${statusType} was cleansed!`);
        cleansed++;
      }
    }
  }

  /**
   * Determine turn order for a round based on speed
   */
  determineTurnOrder() {
    const allUnits = [
      ...this.battleState.allies.filter(u => !u.isDefeated),
      ...this.battleState.enemies.filter(u => !u.isDefeated)
    ];
    
    // Sort by speed (higher goes first), with random tiebreaker
    allUnits.sort((a, b) => {
      const speedDiff = b.currentStats.speed - a.currentStats.speed;
      if (speedDiff !== 0) return speedDiff;
      return Math.random() - 0.5; // Random tiebreaker
    });
    
    return allUnits;
  }

  /**
   * Process start of round effects
   */
  processStartOfRound() {
    this.logEvent(`=== Round ${this.battleState.round} Start ===`);
    
    const allUnits = [...this.battleState.allies, ...this.battleState.enemies];
    
    allUnits.forEach(unit => {
      if (unit.isDefeated) return;
      
      // Trigger start-of-round passives
      if (unit.passive.rules && unit.passive.rules.trigger === 'start_of_round') {
        this.triggerPassive(unit, 'start_of_round');
      }
      
      // Apply regen effects
      unit.statuses.forEach(status => {
        if (status.type === 'regen') {
          this.applyHealing(unit, status.amount || 5);
        }
      });
    });
  }

  /**
   * Process end of round effects
   */
  processEndOfRound() {
    const allUnits = [...this.battleState.allies, ...this.battleState.enemies];
    
    allUnits.forEach(unit => {
      if (unit.isDefeated) return;
      
      // Apply damage over time
      unit.statuses.forEach(status => {
        if (status.type === 'poison') {
          const damage = status.damage_per_turn || 10;
          this.applyDamage(unit, damage);
          this.logEvent(`${unit.name} took ${damage} poison damage!`);
        } else if (status.type === 'burn') {
          const damage = status.damage_per_turn || 8;
          this.applyDamage(unit, damage);
          this.logEvent(`${unit.name} took ${damage} burn damage!`);
        }
      });
      
      // Tick down cooldowns
      unit.cooldowns = unit.cooldowns.map(cd => Math.max(0, cd - 1));
      
      // Tick down status durations
      unit.statuses = unit.statuses.filter(status => {
        status.duration--;
        if (status.duration <= 0) {
          this.logEvent(`${unit.name}'s ${status.type} wore off.`);
          return false;
        }
        return true;
      });
      
      // Tick down shield durations
      unit.shields = unit.shields.filter(shield => {
        shield.duration--;
        if (shield.duration <= 0) {
          this.logEvent(`${unit.name}'s shield expired.`);
          return false;
        }
        return true;
      });
    });
    
    // Process terrain effects
    this.processTerrainEffects();
    
    this.logEvent(`=== Round ${this.battleState.round} End ===`);
    this.battleState.round++;
  }

  /**
   * Process terrain effects
   */
  processTerrainEffects() {
    // Process ally terrain
    if (this.battleState.terrain.ally) {
      const terrain = this.battleState.terrain.ally;
      terrain.duration--;
      if (terrain.duration <= 0) {
        this.logEvent(`${terrain.name} dissipated.`);
        this.battleState.terrain.ally = null;
      }
    }
    
    // Process enemy terrain
    if (this.battleState.terrain.enemy) {
      const terrain = this.battleState.terrain.enemy;
      terrain.duration--;
      if (terrain.duration <= 0) {
        this.logEvent(`${terrain.name} dissipated.`);
        this.battleState.terrain.enemy = null;
      }
    }
  }

  /**
   * Execute a move
   */
  executeMove(attacker, moveIndex, targets) {
    const move = attacker.moves[moveIndex];
    
    // Check cooldown
    if (attacker.cooldowns[moveIndex] > 0) {
      this.logEvent(`${move.name} is on cooldown!`);
      return false;
    }
    
    this.logEvent(`${attacker.name} used ${move.name}!`);
    
    // Process move effects based on keywords
    move.keywords.forEach(keyword => {
      switch(keyword) {
        case 'damage':
          targets.forEach(target => {
            const result = this.calculateDamage(attacker, target, move);
            this.applyDamage(target, result.damage);
            this.logEvent(`${target.name} took ${result.damage} damage! ${result.effectiveness}`);
          });
          break;
          
        case 'heal':
          targets.forEach(target => {
            this.applyHealing(target, move.power);
          });
          break;
          
        case 'shield':
          targets.forEach(target => {
            this.applyShield(target, move.power, 2);
          });
          break;
          
        case 'poison':
          targets.forEach(target => {
            this.applyStatus(target, 'poison', 2, { damage_per_turn: 10 });
          });
          break;
          
        case 'stun':
          targets.forEach(target => {
            this.applyStatus(target, 'stun', 1);
          });
          break;
          
        case 'cleanse':
          targets.forEach(target => {
            this.cleanse(target, 1);
          });
          break;
      }
    });
    
    // Set cooldown
    attacker.cooldowns[moveIndex] = move.cooldown;
    
    return true;
  }

  /**
   * Trigger passive abilities
   */
  triggerPassive(unit, trigger) {
    // Simplified passive trigger system
    // Full implementation would parse unit.passive.rules
    this.logEvent(`${unit.name}'s ${unit.passive.name} activated!`);
  }

  /**
   * Check if battle is over
   */
  checkBattleEnd() {
    const alliesAlive = this.battleState.allies.some(u => !u.isDefeated);
    const enemiesAlive = this.battleState.enemies.some(u => !u.isDefeated);
    
    if (!alliesAlive) {
      this.battleState.winner = 'enemy';
      this.logEvent('=== DEFEAT ===');
      return true;
    }
    
    if (!enemiesAlive) {
      this.battleState.winner = 'ally';
      this.logEvent('=== VICTORY! ===');
      return true;
    }
    
    return false;
  }

  /**
   * Log an event to battle log
   */
  logEvent(message) {
    this.battleState.battleLog.push({
      round: this.battleState.round,
      turn: this.battleState.turn,
      message: message
    });
  }

  /**
   * Get current battle state
   */
  getBattleState() {
    return this.battleState;
  }

  /**
   * Get all alive units in turn order
   */
  getAliveUnitsInOrder() {
    return this.determineTurnOrder();
  }
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BattleEngine;
}
