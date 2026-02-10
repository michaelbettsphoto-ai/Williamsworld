/**
 * Williams World - Battle System
 * Isolated JavaScript for battle-system-demo.html only
 * DO NOT import into index.html or any homepage files
 */

class WilliamsBattle {
  constructor() {
    this.heroesData = null;
    this.enemiesData = null;
    this.audioData = null;
    this.audioManager = null;
    
    this.party = [];
    this.enemies = [];
    this.turnOrder = [];
    this.activeTurnIndex = 0;
    this.battleLog = [];
    
    this.currentZone = null;
    this.initialized = false;
  }

  /**
   * Initialize the battle system - load all JSON data
   */
  async init() {
    if (this.initialized) return;
    
    try {
      // Load JSON data files
      await Promise.all([
        this.loadHeroesData(),
        this.loadEnemiesData(),
        this.loadAudioData()
      ]);
      
      // Initialize audio manager
      this.initAudioManager();
      
      // Check zone from URL parameter
      this.validateZone();
      
      this.initialized = true;
      this.log('Battle system initialized successfully!', 'success');
    } catch (error) {
      this.log('Error initializing battle system: ' + error.message, 'error');
      console.error(error);
      throw error;
    }
  }

  /**
   * Load heroes and companions data from JSON
   */
  async loadHeroesData() {
    const response = await fetch('./assets/data/heroes-and-companions.json');
    if (!response.ok) throw new Error('Failed to load heroes data');
    this.heroesData = await response.json();
  }

  /**
   * Load enemies data from JSON
   */
  async loadEnemiesData() {
    const response = await fetch('./assets/data/enemies.json');
    if (!response.ok) throw new Error('Failed to load enemies data');
    this.enemiesData = await response.json();
  }

  /**
   * Load audio events data from JSON
   */
  async loadAudioData() {
    const response = await fetch('./assets/data/audio-events.json');
    if (!response.ok) throw new Error('Failed to load audio data');
    this.audioData = await response.json();
  }

  /**
   * Validate zone from URL params or default to first available zone
   */
  validateZone() {
    const urlParams = new URLSearchParams(window.location.search);
    const zone = urlParams.get('zone');
    
    // Get available zones from enemies data
    const availableZones = Object.keys(this.enemiesData.zoneTiers);
    
    // For demo purposes, default to first zone if not specified
    if (!zone || !availableZones.includes(zone)) {
      this.currentZone = availableZones[0] || 'launch-meadow';
      this.log(`Zone defaulted to: ${this.currentZone}`, 'info');
    } else {
      this.currentZone = zone;
      this.log(`Zone validated: ${this.currentZone}`, 'success');
    }
  }

  /**
   * Initialize audio manager with 3 channels
   */
  initAudioManager() {
    if (!window.Howl || !window.Howler) {
      this.log('Howler.js not loaded - audio disabled', 'warning');
      return;
    }

    this.audioManager = {
      channels: {},
      settings: this.loadAudioSettings(),
      unlocked: false
    };

    // Initialize channels from audio data
    const channels = this.audioData.channels;
    for (const [channelName, channelConfig] of Object.entries(channels)) {
      this.audioManager.channels[channelName] = {
        volume: this.audioManager.settings[channelConfig.sliderKey] || channelConfig.defaultVolume,
        currentSound: null
      };
    }

    this.log('Audio manager initialized with 3 channels', 'success');
  }

  /**
   * Load audio settings from localStorage
   */
  loadAudioSettings() {
    const storageKey = this.audioData?.settings?.storageKey || 'williamsworld_audio_settings';
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse audio settings:', e);
      }
    }
    
    // Return defaults
    return {
      musicVolume: 0.6,
      ambienceVolume: 0.6,
      sfxVolume: 0.8
    };
  }

  /**
   * Save audio settings to localStorage
   */
  saveAudioSettings() {
    if (!this.audioManager) return;
    
    const storageKey = this.audioData?.settings?.storageKey || 'williamsworld_audio_settings';
    localStorage.setItem(storageKey, JSON.stringify(this.audioManager.settings));
  }

  /**
   * Play audio event
   */
  playAudio(eventId) {
    if (!this.audioManager || !window.Howl) return;

    // Find event in audio data
    const event = this.audioData.events.find(e => e.id === eventId);
    if (!event) {
      console.warn(`Audio event not found: ${eventId}`);
      return;
    }

    // Unlock audio on first user gesture
    if (!this.audioManager.unlocked) {
      this.audioManager.unlocked = true;
    }

    const channel = this.audioManager.channels[event.channel];
    if (!channel) return;

    // Stop current sound in channel if not looping
    if (channel.currentSound && !event.loop) {
      channel.currentSound.stop();
    }

    // Create and play new sound
    const sound = new Howl({
      src: [`./assets/audio/${event.file}`],
      volume: channel.volume,
      loop: event.loop || false,
      onloaderror: (id, error) => {
        console.warn(`Failed to load audio: ${event.file}`, error);
      }
    });

    sound.play();
    channel.currentSound = sound;
  }

  /**
   * Setup a new battle encounter
   */
  setupBattle() {
    this.party = this.selectParty();
    this.enemies = this.selectEnemies();
    this.buildTurnOrder();
    this.battleLog = [];
    this.activeTurnIndex = 0;
    
    this.playAudio('battle_start_cue');
    this.log('Battle started!', 'info');
  }

  /**
   * Select party: William + 2 companions
   */
  selectParty() {
    const characters = this.heroesData.characters;
    
    // Find William (hero)
    const william = characters.find(c => c.id === 'william');
    if (!william) {
      throw new Error('William not found in heroes data!');
    }

    // Select 2 companions (not William)
    const companions = characters.filter(c => c.id !== 'william');
    const selectedCompanions = this.shuffleArray(companions).slice(0, 2);

    return [william, ...selectedCompanions].map(char => this.createBattler(char, 'party'));
  }

  /**
   * Select enemies: 2 common/uncommon + 1 rare/elite
   */
  selectEnemies() {
    const enemyPool = this.enemiesData.enemies.filter(e => e.zone === this.currentZone);
    
    if (enemyPool.length === 0) {
      throw new Error(`No enemies found for zone: ${this.currentZone}`);
    }

    // Separate by rarity
    const commonUncommon = enemyPool.filter(e => 
      e.rarity === 'COMMON' || e.rarity === 'UNCOMMON'
    );
    const rareElite = enemyPool.filter(e => 
      e.rarity === 'RARE' || e.rarity === 'ELITE'
    );

    // Select 2 common/uncommon
    const selected1 = this.shuffleArray(commonUncommon).slice(0, 2);
    
    // Select 1 rare/elite (fallback to common if none available)
    const selected2 = rareElite.length > 0 
      ? [this.shuffleArray(rareElite)[0]]
      : [this.shuffleArray(commonUncommon)[0]];

    const selectedEnemies = [...selected1, ...selected2];
    
    // Get tier for this zone
    const tier = this.enemiesData.zoneTiers[this.currentZone];
    
    return selectedEnemies.map(enemy => this.createEnemyBattler(enemy, tier));
  }

  /**
   * Create a battler from character data
   */
  createBattler(char, team) {
    const stats = char.stats;
    
    return {
      id: char.id,
      name: char.displayName || char.name,
      team: team,
      element: char.element,
      level: char.level || 1,
      hp: stats.hp,
      maxHp: stats.hp,
      atk: stats.atk,
      def: stats.def,
      spd: stats.spd,
      abilities: char.abilities || [],
      statuses: [],
      portrait: this.getCharacterPortrait(char.id)
    };
  }

  /**
   * Create an enemy battler with stats from tier system
   */
  createEnemyBattler(enemy, tier) {
    const tierStats = this.enemiesData.tierStatsByRarity[tier][enemy.rarity];
    
    if (!tierStats) {
      console.warn(`No tier stats for ${tier}/${enemy.rarity}, using defaults`);
    }

    const stats = tierStats || { hp: 60, atk: 10, def: 8, spd: 10 };

    return {
      id: enemy.id,
      name: enemy.name,
      team: 'enemy',
      element: enemy.element,
      role: enemy.role,
      rarity: enemy.rarity,
      hp: stats.hp,
      maxHp: stats.hp,
      atk: stats.atk,
      def: stats.def,
      spd: stats.spd,
      moves: enemy.moves || [],
      statuses: [],
      portrait: enemy.portrait || this.getDefaultEnemyPortrait()
    };
  }

  /**
   * Build turn order based on speed
   */
  buildTurnOrder() {
    const all = [
      ...this.party.map(p => ({ side: 'party', battler: p })),
      ...this.enemies.map(e => ({ side: 'enemy', battler: e }))
    ];

    // Sort by speed (highest first)
    this.turnOrder = all.sort((a, b) => b.battler.spd - a.battler.spd);
    this.activeTurnIndex = 0;
  }

  /**
   * Execute a turn
   */
  executeTurn(action = 'auto') {
    if (!this.initialized) {
      this.log('Battle not initialized', 'error');
      return;
    }

    const current = this.turnOrder[this.activeTurnIndex];
    if (!current) return;

    const actor = current.battler;
    
    // Skip if actor is downed
    if (actor.hp <= 0) {
      this.advanceTurn();
      return;
    }

    // Determine target
    const targetTeam = current.side === 'party' ? this.enemies : this.party;
    const target = targetTeam.find(t => t.hp > 0);

    if (!target) {
      this.checkBattleEnd();
      return;
    }

    // Execute action
    let message = '';
    
    if (action === 'attack' || action === 'auto') {
      const damage = this.calculateDamage(actor, target);
      target.hp = Math.max(0, target.hp - damage);
      message = `${actor.name} attacks ${target.name} for ${damage} damage!`;
      this.playAudio('attack_light');
    } else if (action === 'shield') {
      this.applyStatus(actor, 'guard');
      message = `${actor.name} raises a shield!`;
      this.playAudio('ui_click_confirm');
    } else if (action === 'spell') {
      const damage = Math.round(actor.atk * 1.5);
      target.hp = Math.max(0, target.hp - damage);
      this.applyStatus(target, 'shock');
      message = `${actor.name} casts a spell for ${damage} damage!`;
      this.playAudio('ability_cast_magic');
    }

    this.battleLog.push(message);
    this.log(message, 'info');

    this.advanceTurn();
    this.checkBattleEnd();
  }

  /**
   * Calculate damage
   */
  calculateDamage(attacker, defender) {
    const baseDamage = attacker.atk;
    const defense = defender.def;
    
    // Simple damage formula
    const damage = Math.max(1, Math.round(baseDamage * (100 / (100 + defense))));
    
    return damage;
  }

  /**
   * Apply status effect
   */
  applyStatus(battler, status) {
    if (!battler.statuses.includes(status)) {
      battler.statuses.push(status);
    }
  }

  /**
   * Advance to next turn
   */
  advanceTurn() {
    this.activeTurnIndex = (this.activeTurnIndex + 1) % this.turnOrder.length;
  }

  /**
   * Check if battle has ended
   */
  checkBattleEnd() {
    const partyAlive = this.party.some(p => p.hp > 0);
    const enemiesAlive = this.enemies.some(e => e.hp > 0);

    if (!partyAlive) {
      this.endBattle('defeat');
    } else if (!enemiesAlive) {
      this.endBattle('victory');
    }
  }

  /**
   * End the battle
   */
  endBattle(result) {
    if (result === 'victory') {
      this.playAudio('victory_fanfare');
      this.log('Victory! Your party wins!', 'success');
    } else {
      this.playAudio('defeat_cue');
      this.log('Defeat! Your party was defeated...', 'error');
    }

    // Show result modal (would be implemented in UI layer)
    this.showBattleResult(result);
  }

  /**
   * Show battle result (stub for UI integration)
   */
  showBattleResult(result) {
    // This would show a modal in a real implementation
    console.log('Battle Result:', result);
  }

  /**
   * Auto-run a full battle simulation
   */
  async runAutoBattle() {
    this.setupBattle();
    
    let turns = 0;
    const maxTurns = 100; // Safety limit

    while (turns < maxTurns) {
      const partyAlive = this.party.some(p => p.hp > 0);
      const enemiesAlive = this.enemies.some(e => e.hp > 0);

      if (!partyAlive || !enemiesAlive) {
        this.checkBattleEnd();
        break;
      }

      this.executeTurn('auto');
      turns++;
      
      // Add small delay for visual effect
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return this.battleLog;
  }

  /**
   * Get character portrait
   */
  getCharacterPortrait(id) {
    const portraitMap = {
      'william': './assets/images/william-portrait.png',
      'ember': './assets/images/ember-portrait.png',
      'sprite': './assets/images/sprite-portrait.png',
      'golem': './assets/images/golem-portrait.png'
    };

    return portraitMap[id] || './assets/images/logo_512.png';
  }

  /**
   * Get default enemy portrait
   */
  getDefaultEnemyPortrait() {
    return './assets/images/logo_512.png';
  }

  /**
   * Utility: Shuffle array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Log message to console and/or UI
   */
  log(message, level = 'info') {
    const prefix = {
      'info': 'ℹ️',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌'
    }[level] || '';

    console.log(`${prefix} ${message}`);
  }
}

// Export for use in HTML
if (typeof window !== 'undefined') {
  window.WilliamsBattle = WilliamsBattle;
}
