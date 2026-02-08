/**
 * William's World - Battle Simulator
 * Demonstrates the battle system with example characters
 */

class BattleSimulator {
  constructor() {
    this.gameConstants = null;
    this.characters = {};
    this.engine = null;
  }

  /**
   * Load game data
   */
  async loadGameData() {
    // Load game constants
    const constantsResponse = await fetch('/battle-system/data/game-constants.json');
    this.gameConstants = await constantsResponse.json();
    
    // Load characters
    const characterIds = ['trapper', 'sparkfin', 'glowmoss'];
    for (const id of characterIds) {
      const response = await fetch(`/battle-system/data/characters/${id}.json`);
      this.characters[id] = await response.json();
    }
    
    // Initialize battle engine
    this.engine = new BattleEngine(this.gameConstants);
    
    console.log('Game data loaded successfully!');
    return true;
  }

  /**
   * Start a demo battle
   */
  startDemoBattle() {
    // Create parties (using same characters for demo, but could be different)
    const allyParty = [
      this.characters.trapper,
      this.characters.sparkfin,
      this.characters.glowmoss
    ];
    
    const enemyParty = [
      { ...this.characters.trapper, name: 'Enemy Trapper' },
      { ...this.characters.sparkfin, name: 'Enemy Sparkfin' },
      { ...this.characters.glowmoss, name: 'Enemy Glowmoss' }
    ];
    
    // Initialize battle
    this.engine.initBattle(allyParty, enemyParty);
    
    console.log('Battle started!');
    console.log('Allies:', this.engine.battleState.allies.map(u => u.name));
    console.log('Enemies:', this.engine.battleState.enemies.map(u => u.name));
    
    return this.engine.getBattleState();
  }

  /**
   * Simulate one round of automated combat
   */
  simulateRound() {
    const state = this.engine.getBattleState();
    
    // Start of round
    this.engine.processStartOfRound();
    
    // Get turn order
    const turnOrder = this.engine.determineTurnOrder();
    console.log('\nTurn order:', turnOrder.map(u => `${u.name} (Speed: ${u.currentStats.speed})`));
    
    // Execute turns
    turnOrder.forEach((unit, index) => {
      state.turn = index + 1;
      
      // Simple AI: Pick first available move and random valid target
      let moveIndex = 0;
      for (let i = 0; i < unit.cooldowns.length; i++) {
        if (unit.cooldowns[i] === 0) {
          moveIndex = i;
          break;
        }
      }
      
      const move = unit.moves[moveIndex];
      let targets = [];
      
      // Determine targets based on move targeting
      const targetType = move.target;
      const enemies = unit.team === 'ally' ? state.enemies : state.allies;
      const allies = unit.team === 'ally' ? state.allies : state.enemies;
      
      switch(targetType) {
        case 'single_enemy':
          const aliveEnemies = enemies.filter(e => !e.isDefeated);
          if (aliveEnemies.length > 0) {
            targets = [aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]];
          }
          break;
          
        case 'all_enemies':
          targets = enemies.filter(e => !e.isDefeated);
          break;
          
        case 'self':
          targets = [unit];
          break;
          
        case 'single_ally':
          const aliveAllies = allies.filter(a => !a.isDefeated && a !== unit);
          if (aliveAllies.length > 0) {
            targets = [aliveAllies[Math.floor(Math.random() * aliveAllies.length)]];
          } else {
            targets = [unit]; // Self if no other allies
          }
          break;
          
        case 'all_allies':
          targets = allies.filter(a => !a.isDefeated);
          break;
      }
      
      if (targets.length > 0) {
        this.engine.executeMove(unit, moveIndex, targets);
      }
    });
    
    // End of round
    this.engine.processEndOfRound();
    
    // Check if battle ended
    const isOver = this.engine.checkBattleEnd();
    
    return {
      isOver: isOver,
      state: this.engine.getBattleState()
    };
  }

  /**
   * Run a complete automated battle
   */
  runFullBattle(maxRounds = 10) {
    this.startDemoBattle();
    
    console.log('\n========== BATTLE START ==========\n');
    
    let round = 1;
    while (round <= maxRounds) {
      console.log(`\n--- ROUND ${round} ---`);
      
      const result = this.simulateRound();
      
      // Display HP status
      console.log('\nHP Status:');
      console.log('Allies:');
      result.state.allies.forEach(u => {
        const hpBar = this.getHPBar(u.currentHp, u.maxHp);
        console.log(`  ${u.name}: ${hpBar} ${u.currentHp}/${u.maxHp}`);
      });
      console.log('Enemies:');
      result.state.enemies.forEach(u => {
        const hpBar = this.getHPBar(u.currentHp, u.maxHp);
        console.log(`  ${u.name}: ${hpBar} ${u.currentHp}/${u.maxHp}`);
      });
      
      if (result.isOver) {
        console.log(`\n========== BATTLE ENDED: ${result.state.winner.toUpperCase()} WINS! ==========`);
        break;
      }
      
      round++;
    }
    
    // Print battle log
    console.log('\n========== BATTLE LOG ==========');
    this.engine.battleState.battleLog.forEach(log => {
      console.log(log.message);
    });
    
    return this.engine.getBattleState();
  }

  /**
   * Generate simple HP bar for console
   */
  getHPBar(current, max) {
    const percentage = current / max;
    const barLength = 20;
    const filled = Math.floor(barLength * percentage);
    const empty = barLength - filled;
    
    return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
  }

  /**
   * Display character card info
   */
  displayCharacterCard(characterId) {
    const char = this.characters[characterId];
    if (!char) {
      console.log('Character not found');
      return;
    }
    
    console.log('\n========================================');
    console.log(`${char.name} — ${char.title}`);
    console.log('========================================');
    console.log(`Role: ${char.role_primary}${char.role_secondary ? ` / ${char.role_secondary}` : ''}`);
    console.log(`Types: ${char.types.map(t => this.gameConstants.types[t].icon + ' ' + this.gameConstants.types[t].name).join(', ')}`);
    console.log(`Rarity: ${char.rarity} | Rank: ${char.rank}`);
    console.log('\nStats:');
    console.log(`  HP: ${char.stats.hp} | Power: ${char.stats.power} | Defense: ${char.stats.defense}`);
    console.log(`  Magic Resist: ${char.stats.magicResist} | Speed: ${char.stats.speed}`);
    console.log(`\nPassive: ${char.passive.icon} ${char.passive.name}`);
    console.log(`  ${char.passive.description}`);
    console.log('\nMoves:');
    char.moves.forEach((move, i) => {
      const typeIcon = this.gameConstants.types[move.type].icon;
      const keywords = move.keywords.map(k => this.gameConstants.keywords[k].icon).join(' ');
      console.log(`  ${i + 1}. ${move.name} ${typeIcon} [CD: ${move.cooldown}]`);
      console.log(`     ${keywords} ${move.description}`);
    });
    console.log(`\nSynergies: ${char.synergy_tags.join(', ')}`);
    console.log(`\nExploration Perk: ${char.exploration_perk.name}`);
    console.log(`  ${char.exploration_perk.description}`);
    console.log('========================================\n');
  }

  /**
   * Display type effectiveness chart
   */
  displayTypeChart() {
    console.log('\n========== TYPE EFFECTIVENESS CHART ==========\n');
    console.log('Legend: 2.0 = Super Effective | 1.0 = Neutral | 0.5 = Not Very Effective | 0.0 = Immune\n');
    
    const types = Object.keys(this.gameConstants.types);
    
    // Header
    console.log('Attacker → Defender');
    console.log('─'.repeat(60));
    
    types.forEach(attackType => {
      const icon = this.gameConstants.types[attackType].icon;
      const row = [icon + ' ' + attackType.padEnd(10)];
      
      types.forEach(defType => {
        const eff = this.gameConstants.type_chart[attackType][defType];
        let display = eff.toFixed(1);
        if (eff === 2.0) display = '✓' + display;
        if (eff === 0.5) display = '✗' + display;
        row.push(display.padEnd(6));
      });
      
      console.log(row.join(''));
    });
    
    console.log('='.repeat(60) + '\n');
  }
}

// Auto-run demo in browser console
if (typeof window !== 'undefined') {
  window.BattleSimulator = BattleSimulator;
  
  // Provide easy access functions
  window.demoCharacter = async (id = 'trapper') => {
    const sim = new BattleSimulator();
    await sim.loadGameData();
    sim.displayCharacterCard(id);
  };
  
  window.demoBattle = async () => {
    const sim = new BattleSimulator();
    await sim.loadGameData();
    return sim.runFullBattle();
  };
  
  window.demoTypeChart = async () => {
    const sim = new BattleSimulator();
    await sim.loadGameData();
    sim.displayTypeChart();
  };
  
  console.log('='.repeat(60));
  console.log("William's World Battle System Loaded!");
  console.log('='.repeat(60));
  console.log('Available commands:');
  console.log('  demoCharacter("trapper")  - Display character card');
  console.log('  demoCharacter("sparkfin") - Display character card');
  console.log('  demoCharacter("glowmoss") - Display character card');
  console.log('  demoBattle()              - Run automated battle simulation');
  console.log('  demoTypeChart()           - Display type effectiveness chart');
  console.log('='.repeat(60));
}
