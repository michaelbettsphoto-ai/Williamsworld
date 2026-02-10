// ============================================
// HOMEPAGE LOCKDOWN: P0 DEFENSIVE INITIALIZATION
// ============================================
// Rule 4: All init runs under DOMContentLoaded
// Rule 9: Boot check log for regression detection
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log("WW_HUB_BOOT_OK v1");
    
    // Rule 6: Fail-soft for optional resources
    const DATA_PATHS = {
      progression: "./assets/data/heroes-and-companions.json",
      audio: "./assets/data/audio-events.json"
    };
    const PROGRESSION_CACHE_KEY = "williamsworld_progression_data_v2";
    const AUDIO_EVENTS_CACHE_KEY = "williamsworld_audio_events_v1";
    
    async function loadJsonWithCache(path, cacheKey) {
      try {
        const response = await fetch(path, { cache: "no-store" });
        if (!response.ok) throw new Error(`Failed to load ${path}`);
        const data = await response.json();
        localStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      } catch (error) {
        console.warn(`[FAIL-SOFT] Error loading ${path}:`, error);
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            console.log(`[FAIL-SOFT] Using cached data for ${cacheKey}`);
            return JSON.parse(cached);
          } catch (parseError) {
            console.warn(`[FAIL-SOFT] Cache parse error for ${cacheKey}:`, parseError);
          }
        }
        return null;
      }
    }

    const progressionData = await loadJsonWithCache(DATA_PATHS.progression, PROGRESSION_CACHE_KEY);
    const audioEventsData = await loadJsonWithCache(DATA_PATHS.audio, AUDIO_EVENTS_CACHE_KEY);
    if (!progressionData) {
      console.error("[CRITICAL] Missing progression data. Homepage cannot initialize.");
      // Rule 6: Show user-friendly message instead of crashing
      const errorContainer = document.createElement('div');
      errorContainer.style.cssText = 'padding:40px;text-align:center;font-family:sans-serif;background:#1a0e2e;color:#fff5e6;min-height:100vh;display:flex;align-items:center;justify-content:center;';
      errorContainer.innerHTML = `
        <div style="max-width:500px;">
          <h2>⚠️ Loading Error</h2>
          <p>Could not load game data. Please refresh the page.</p>
          <button onclick="location.reload()" style="margin-top:20px;padding:10px 20px;cursor:pointer;background:#ffd36e;border:none;border-radius:8px;font-size:16px;">Refresh</button>
        </div>
      `;
      document.body.appendChild(errorContainer);
      return;
    }
  const characterMap = Object.fromEntries(progressionData.characters.map(char => [char.id, char]));

  const ASSETS = {
    mapstrip: "./assets/images/mapstrip.svg",
    banner:   "./assets/images/banner.svg",
    logo:     "./assets/images/williamsworldlogo.png",
    william: {
      level1: "./assets/images/Williams avatar.PNG",
      level2: "./assets/images/Williams avatar.PNG",
      level3: "./assets/images/Williams avatar.PNG",
    },
    companions: {
      ember:  "./assets/images/companion_ember_512.png",
      sprite: "./assets/images/companion_sprite_512.png",
      golem:  "./assets/images/companion_golem_512.png",
    },
    
    // Zone images for quest map
    zones: {
      z1: "./assets/images/zone_launch_256.png",
      z2: "./assets/images/zone_homework_256.png",
      z3: "./assets/images/zone_backpack_256.svg",
      z4: "./assets/images/zone_focus_256.png",
    }
  };
  
  // D&D-Style Level Titles
  const LEVEL_TITLES = {
    1: "Apprentice Adventurer",
    2: "Brave Scout",
    3: "Squire of the Realm",
    4: "Woodland Ranger",
    5: "Knight of Focus",
    6: "Battle Mage",
    7: "Dungeon Explorer",
    8: "Dragon Slayer",
    9: "Quest Master",
    10: "Quest Champion",
    11: "Elite Warrior",
    12: "Arcane Sage",
    13: "Shadow Hunter",
    14: "Storm Bringer",
    15: "Legendary Hero",
    16: "Realm Protector",
    17: "Titan Slayer",
    18: "Cosmic Guardian",
    19: "Eternal Champion",
    20: "Dragon Master"
  };
  
  const getLevelTitle = (level) => {
    if (level <= 20) return LEVEL_TITLES[level];
    return "Dragon Master";
  };
  
  // Get William's character image based on current level
  function getWilliamImage(level) {
    if (level >= 14) return ASSETS.william.level3;  // Epic/powered-up form
    if (level >= 7) return ASSETS.william.level2;    // Armored/mid-tier form
    return ASSETS.william.level1;                     // Base/casual form
  }

  // Companion Level Titles
  const COMPANION_TITLES = {
    ember: {
      1: "Tiny Spark", 2: "Flickering Flame", 3: "Blaze Cub", 4: "Fire Prowler",
      5: "Inferno Striker", 6: "Magma Fang", 7: "Volcanic Hunter", 8: "Phoenix Fury",
      9: "Solar Beast", 10: "Eternal Inferno"
    },
    sprite: {
      1: "Dim Glimmer", 2: "Sparkle Wisp", 3: "Glow Dancer", 4: "Shimmer Wing",
      5: "Radiant Pixie", 6: "Starlight Weaver", 7: "Aurora Enchanter", 8: "Prismatic Sage",
      9: "Celestial Beacon", 10: "Eternal Luminary"
    },
    golem: {
      1: "Pebble Scout", 2: "Rock Tumbler", 3: "Boulder Buddy", 4: "Granite Guard",
      5: "Iron Fortress", 6: "Steel Sentinel", 7: "Diamond Wall", 8: "Obsidian Titan",
      9: "Mountain King", 10: "Eternal Colossus"
    }
  };
  const COMPANION_MAX_TITLES = { ember: "Supernova Tiger", sprite: "Supernova Fairy", golem: "World Shaker" };
  const COMPANION_EMOJIS = { ember: "🔥", sprite: "✨", golem: "🗿" };
  const COMPANION_IDS = progressionData.characters.filter(char => char.id !== "william").map(char => char.id);
  const COMPANION_NAMES = Object.fromEntries(COMPANION_IDS.map(id => [id, characterMap[id].displayName]));
  const COMPANION_CLASSES = Object.fromEntries(COMPANION_IDS.map(id => [id, characterMap[id].classTitle]));

  function getCompanionTitle(companion, level) {
    if (level >= 11) return COMPANION_MAX_TITLES[companion];
    return COMPANION_TITLES[companion][level] || COMPANION_MAX_TITLES[companion];
  }

  const KEY = "williams_world_embed_state_v1";
  const WAR_CHEST_XP_RATE = 0.25;       // 25% of task XP goes to war chest
  const WAR_CHEST_AWARD_COST = 50;      // Gold cost per companion award
  const COMPANION_XP_SHARE = progressionData.xpRules.companionXpShareOfHero;
  const LEVEL_DOWN_HP_RESET = 50;       // HP after level-down
  const HP_PER_STREAK = 100;            // Extra max HP per streak day
  const TASKS = [
    // Night-Before Quest
    { id:"n_trapper",  label:"Night-Before: Trapper ready", xp:15, quest:"night" },
    { id:"n_clothes",  label:"Night-Before: Clothes ready", xp:15, quest:"night" },
    { id:"n_lunch",    label:"Night-Before: Lunch plan ready", xp:10, quest:"night" },
    { id:"n_shoes",    label:"Night-Before: Shoes + Jacket ready", xp:10, quest:"night" },
    // Morning Quest
    { id:"m_prayer",   label:"Morning: Prayer & Breakfast", xp:15, quest:"morning" },
    { id:"m_dressed",  label:"Morning: Get dressed", xp:10, quest:"morning" },
    { id:"m_teeth",    label:"Morning: Brush teeth & hair", xp:15, quest:"morning" },
    { id:"m_trappercheck", label:"Morning: Backpack check", xp:10, quest:"morning" },
    // Trapper/Backpack Quest
    { id:"t_work",     label:"Trapper: Work & Papers", xp:15, quest:"backpack" },
    { id:"t_notebooks",label:"Trapper: Notebooks inside", xp:10, quest:"backpack" },
    { id:"t_supplies", label:"Trapper: Supplies packed", xp:15, quest:"backpack" },
    { id:"t_check",    label:"Trapper: Final check", xp:10, quest:"backpack" },
  ];

  const MAP = [
    { id:"z1", slug:"launch-meadow", title:"Launch Meadow", need:0 },
    { id:"z2", slug:"homework-hills", title:"Homework Hills", need:3 },
    { id:"z3", slug:"backpack-bastion", title:"Backpack Bastion", need:5 },
    { id:"z4", slug:"focus-forest", title:"Focus Forest", need:10 },
  ];
  
  const COMPANIONS = [...COMPANION_IDS];

  // ============================================
  // MORNING MISSION CONSTANTS
  // ============================================
  const MORNING_MISSION = {
    TIMEZONE: 'America/Chicago',
    WINDOW_START_HOUR: 6,  // 6:00 AM
    WINDOW_START_MIN: 0,
    DEADLINE_HOUR: 8,       // 8:00 AM
    DEADLINE_MIN: 0,
    RESET_HOUR: 4,          // 4:00 AM daily reset
    RESET_MIN: 0,
    HP_PER_TASK: 5,         // HP reward per task
    HP_COMPLETION_BONUS: 10, // Bonus for completing all before deadline
    STREAK_BONUS_HP: 5,      // HP bonus every 3 consecutive successes
    STREAK_BONUS_INTERVAL: 3,
    OVERLAY_FADE_DURATION: 500, // Milliseconds for overlay fade out
    CONFETTI_COUNT: 30,      // Number of confetti particles
    SMOKE_PUFF_COUNT: 8,     // Number of smoke puffs
    WIRE_COLORS: {
      'm_prayer': { color: '#dc2626', label: 'Red', icon: '🍳' },      // Fire/breakfast
      'm_dressed': { color: '#22c55e', label: 'Green', icon: '👕' },   // Grass/clothes
      'm_teeth': { color: '#3b82f6', label: 'Blue', icon: '🪥' },      // Water/teeth
      'm_trappercheck': { color: '#a855f7', label: 'Purple', icon: '🎒' } // Magic/backpack
    }
  };

  // Rule 5: Null-safe DOM selector with warning
  const $ = (id) => {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`[FAIL-SOFT] Element not found: #${id}`);
    }
    return element;
  };
  const todayKey = ()=>{
    const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };
  const prettyToday = ()=>new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});

  const HERO_XP_THRESHOLDS = progressionData.xpRules.heroXpThresholds;
  const COMPANION_XP_THRESHOLDS = progressionData.xpRules.companionXpThresholds;

  const xpForLevel = (lvl)=> {
    const key = String(lvl);
    if (HERO_XP_THRESHOLDS[key]) return HERO_XP_THRESHOLDS[key];
    const maxLevel = Math.max(...Object.keys(HERO_XP_THRESHOLDS).map(Number));
    return HERO_XP_THRESHOLDS[String(maxLevel)];
  };

  const companionXpForLevel = (lvl)=> {
    const key = String(lvl);
    if (COMPANION_XP_THRESHOLDS[key]) return COMPANION_XP_THRESHOLDS[key];
    const maxLevel = Math.max(...Object.keys(COMPANION_XP_THRESHOLDS).map(Number));
    return COMPANION_XP_THRESHOLDS[String(maxLevel)];
  };

  const STAT_GROWTH = progressionData.xpRules.statGrowthPerLevel;

  function getCharacterStats(characterId, level) {
    const base = characterMap[characterId]?.stats;
    if (!base) return { hp: 0, atk: 0, def: 0, spd: 0 };
    const multiplier = Math.max(0, level - 1);
    const applyGrowth = (value, pct) => Math.round(value * Math.pow(1 + pct, multiplier));
    return {
      hp: applyGrowth(base.hp, STAT_GROWTH.hpPct),
      atk: applyGrowth(base.atk, STAT_GROWTH.atkPct),
      def: applyGrowth(base.def, STAT_GROWTH.defPct),
      spd: applyGrowth(base.spd, STAT_GROWTH.spdPct)
    };
  }

  function formatStatChange(oldStats, newStats) {
    return `HP +${newStats.hp - oldStats.hp} • ATK +${newStats.atk - oldStats.atk} • DEF +${newStats.def - oldStats.def} • SPD +${newStats.spd - oldStats.spd}`;
  }

  function getAbilityUpdates(characterId, level) {
    const character = characterMap[characterId];
    if (!character) return [];
    const unlocks = character.abilities
      .filter(ability => ability.unlockLevel === level)
      .map(ability => ({
        name: `${ability.name} Unlocked`,
        changes: [ability.description]
      }));
    const upgrades = character.abilityUpgrades
      .filter(upgrade => upgrade.atLevel === level)
      .map(upgrade => {
        const ability = character.abilities.find(a => a.abilityId === upgrade.abilityId);
        return {
          name: ability ? `${ability.name} Upgrade` : "Ability Upgrade",
          changes: upgrade.changes
        };
      });
    return [...unlocks, ...upgrades];
  }

  // ============================================
  // TIME UTILITY FUNCTIONS (America/Chicago)
  // ============================================
  
  // Get current date/time in America/Chicago timezone
  function getChicagoTime() {
    // Use a more reliable timezone conversion approach
    const utcDate = new Date();
    const chicagoTimeString = utcDate.toLocaleString('en-US', { 
      timeZone: MORNING_MISSION.TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    // Parse the formatted string (MM/DD/YYYY, HH:mm:ss format)
    const parts = chicagoTimeString.match(/(\d+)\/(\d+)\/(\d+),\s+(\d+):(\d+):(\d+)/);
    if (parts) {
      return new Date(parts[3], parts[1] - 1, parts[2], parts[4], parts[5], parts[6]);
    }
    
    // Fallback to UTC if parsing fails
    return utcDate;
  }
  
  // Get today's date key in Chicago timezone
  function getChicagoDateKey() {
    const d = getChicagoTime();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  
  // Check if current time is within morning window (6:00-8:00 AM Chicago)
  function isInMorningWindow() {
    const now = getChicagoTime();
    const hour = now.getHours();
    const min = now.getMinutes();
    
    const afterStart = (hour > MORNING_MISSION.WINDOW_START_HOUR) || 
                       (hour === MORNING_MISSION.WINDOW_START_HOUR && min >= MORNING_MISSION.WINDOW_START_MIN);
    const beforeDeadline = (hour < MORNING_MISSION.DEADLINE_HOUR) || 
                           (hour === MORNING_MISSION.DEADLINE_HOUR && min < MORNING_MISSION.DEADLINE_MIN);
    
    return afterStart && beforeDeadline;
  }
  
  // Check if deadline has passed
  function isMorningDeadlinePassed() {
    const now = getChicagoTime();
    const hour = now.getHours();
    const min = now.getMinutes();
    
    return (hour > MORNING_MISSION.DEADLINE_HOUR) || 
           (hour === MORNING_MISSION.DEADLINE_HOUR && min >= MORNING_MISSION.DEADLINE_MIN);
  }
  
  // Check if before morning window
  function isBeforeMorningWindow() {
    const now = getChicagoTime();
    const hour = now.getHours();
    const min = now.getMinutes();
    
    return (hour < MORNING_MISSION.WINDOW_START_HOUR) || 
           (hour === MORNING_MISSION.WINDOW_START_HOUR && min < MORNING_MISSION.WINDOW_START_MIN);
  }
  
  // Get time remaining until deadline (in milliseconds)
  function getTimeUntilDeadline() {
    const now = getChicagoTime();
    const deadline = new Date(now);
    deadline.setHours(MORNING_MISSION.DEADLINE_HOUR, MORNING_MISSION.DEADLINE_MIN, 0, 0);
    
    // If deadline already passed today, return 0
    if (deadline <= now) return 0;
    
    return deadline - now;
  }
  
  // Format time remaining as MM:SS
  function formatTimeRemaining(ms) {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  
  // Get mission window string for tooltips
  function getMissionWindowString() {
    return `Morning Mission runs ${MORNING_MISSION.WINDOW_START_HOUR}:00–${MORNING_MISSION.DEADLINE_HOUR}:00 AM.`;
  }

  // ============================================
  // AUDIO MANAGER - Centralized sound system
  // ============================================
  class AudioManager {
    constructor(audioEvents) {
      this.sounds = {};
      this.currentWeatherSound = null;
      this.currentWeatherKey = null;
      this.currentWeatherHowl = null;
      this.currentMusicSound = null;
      this.currentMusicHowl = null;
      this.currentZoneAmbience = null;
      this.currentZoneAmbienceHowl = null;
      this.isInitialized = false;
      this.isMuted = false;
      this.activeSounds = [];
      this.maxSimultaneousSounds = 4;
      this.audioEvents = audioEvents;
      this.currentMusicKey = audioEvents?.events?.some(event => event.id === 'music_main_hub') ? 'music_main_hub' : 'music.hub';
      this.eventChannelMap = {};
      this.reduceSoundCaps = audioEvents?.settings?.reduceSoundMode?.behavior || null;
      this.storageKey = audioEvents?.settings?.storageKey || 'williamsworld_audio_settings';
      
      // Load settings from localStorage
      const savedSettings = this.loadSettings();
      const channelDefaults = this.audioEvents?.channels || {};
      this.volumes = {
        master: savedSettings.master !== undefined ? savedSettings.master : 1.0,
        music: savedSettings.music !== undefined ? savedSettings.music : (channelDefaults.music?.defaultVolume ?? 0.2),
        ambience: savedSettings.ambience !== undefined ? savedSettings.ambience : (channelDefaults.ambience?.defaultVolume ?? 0.3),
        sfx: savedSettings.sfx !== undefined ? savedSettings.sfx : (channelDefaults.sfx?.defaultVolume ?? 0.7),
      };
      this.reduceSoundMode = savedSettings.reduceSoundMode || false;
      
      // William avatar sound tracking
      this.williamLastEasterEgg = 0;
      this.williamClickCount = 0;
      this.williamClickTimestamps = [];
      this.williamSpamCooldown = false;
      
      // Sound manifest mapping
      this.soundMap = {
        // UI sounds
        'ui.click': ['ui/button-click-1', 'ui/button-click-2', 'ui/button-click-3'],
        'ui.hover': ['ui/hover-tick'],
        'ui.panelOpen': ['ui/panel-open'],
        'ui.panelClose': ['ui/panel-close'],
        'ui.toggleOn': ['ui/toggle-on'],
        'ui.toggleOff': ['ui/toggle-off'],
        'ui.tabChange': ['ui/tab-change'],
        'ui.success': ['ui/success-1', 'ui/success-2', 'ui/success-3'],
        'ui.error': ['ui/error-soft'],
        'ui.notification': ['ui/notification-ping'],
        
        // Avatar sounds
        'avatar.idle': ['avatar/idle-1', 'avatar/idle-2', 'avatar/idle-3'],
        'avatar.tap': ['avatar/william-tap'],
        'avatar.easterEgg': [
          'avatar/confetti-sneeze',
          'avatar/banana-slip',
          'avatar/bubble-burp',
          'avatar/pie-trap',
          'avatar/rubber-chicken',
          'avatar/hero-landing',
          'avatar/endless-scarf',
          'avatar/frog-crown',
          'avatar/chipmunk-voice',
          'avatar/marshmallow-volley',
          'avatar/hair-tornado',
          'avatar/tiger-shuffle',
          'avatar/lego-step',
          'avatar/goose-chase',
          'avatar/treasure-socks'
        ],
        'avatar.onBreak': ['avatar/william-on-break'],
        
        // Weather sounds
        'weather.sunny': ['weather/sunny-ambient'],
        'weather.cloudy': ['weather/cloudy-ambient'],
        'weather.rain': ['weather/rain-ambient'],
        'weather.storm': ['weather/storm-ambient'],
        'weather.snow': ['weather/snow-ambient'],
        
        // Music
        'music.hub': ['music/hub-loop'],
        'music.forest': ['music/forest-loop'],
        'music.dungeon': ['music/dungeon-loop'],

        // Gameplay
        'gameplay.battleHit': ['gameplay/battle-hit'],
      };

      if (this.audioEvents?.events) {
        this.audioEvents.events.forEach(event => {
          this.soundMap[event.id] = [event.file];
          this.eventChannelMap[event.id] = event.channel;
        });
      }
    }
    
    // Initialize audio on user interaction (required for mobile)
    init() {
      if (this.isInitialized) return;
      if (!window.Howl || !window.Howler) {
        console.warn('Howler.js not loaded; audio disabled.');
        return;
      }
      this.isInitialized = true;
      console.log('AudioManager initialized');
      Howler.mute(this.isMuted);
      
      // Preload core UI sounds
      this.preloadSound('ui.click');
      this.preloadSound('ui.panelOpen');
      this.preloadSound('ui.panelClose');
      this.preloadSound('ui.toggleOn');
      this.preloadSound('ui.toggleOff');
      this.preloadSound('ui.success');
    }
    
    // Load settings from localStorage
    loadSettings() {
      try {
        const saved = localStorage.getItem(this.storageKey) || localStorage.getItem('williamsWorldAudioSettings');
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
    
    // Save settings to localStorage
    saveSettings() {
      const settings = {
        master: this.volumes.master,
        music: this.volumes.music,
        ambience: this.volumes.ambience,
        sfx: this.volumes.sfx,
        reduceSoundMode: this.reduceSoundMode,
      };
      localStorage.setItem(this.storageKey, JSON.stringify(settings));
    }
    
    // Get file path with extension
    getFilePath(key) {
      if (key.startsWith('assets/')) return `./${key}`;
      if (key.endsWith('.mp3')) return `./assets/audio/${key}`;
      return `./assets/audio/${key}.mp3`;
    }

    getHowl(file, options = {}) {
      if (!this.sounds[file]) {
        this.sounds[file] = new Howl({
          src: [this.getFilePath(file)],
          preload: options.preload !== undefined ? options.preload : true,
          loop: options.loop || false,
        });
      } else if (options.loop !== undefined) {
        this.sounds[file].loop(options.loop);
      }
      return this.sounds[file];
    }

    getSoundVolume(soundKey, baseVolume = 1.0) {
      let volume = baseVolume;
      const eventChannel = this.eventChannelMap[soundKey];
      const channel = eventChannel || (soundKey.startsWith('weather.') ? 'ambience' :
        soundKey.startsWith('music.') ? 'music' : 'sfx');
      if (channel === 'sfx') {
        volume *= this.volumes.sfx * this.volumes.master;
      } else if (channel === 'ambience') {
        volume *= this.volumes.ambience * this.volumes.master;
      } else if (channel === 'music') {
        volume *= this.volumes.music * this.volumes.master;
      }
      if (this.reduceSoundMode && this.reduceSoundCaps) {
        if (channel === 'music') volume = Math.min(volume, this.reduceSoundCaps.capMusic);
        if (channel === 'ambience') volume = Math.min(volume, this.reduceSoundCaps.capAmbience);
        if (channel === 'sfx') volume = Math.min(volume, this.reduceSoundCaps.capSfx);
      }
      return Math.max(0, Math.min(1, volume));
    }

    getWeatherSoundKey(weatherType) {
      const normalized = weatherType === 'clouds' ? 'cloudy' : weatherType;
      return normalized || 'sunny';
    }

    getCurrentWeatherSoundKey() {
      return `weather.${this.getWeatherSoundKey(this.currentWeatherKey)}`;
    }

    getCurrentMusicKey() {
      return this.currentMusicKey || (this.audioEvents?.events?.some(event => event.id === 'music_main_hub') ? 'music_main_hub' : 'music.hub');
    }
    
    // Preload a sound
    preloadSound(soundKey) {
      if (!this.soundMap[soundKey]) return;
      
      const files = this.soundMap[soundKey];
      files.forEach(file => {
        this.getHowl(file, { preload: true });
      });
    }
    
    // Play a sound effect
    play(soundKey, options = {}) {
      if (this.isMuted || !this.isInitialized) return;
      
      // Get sound files for this key
      const files = this.soundMap[soundKey];
      if (!files || files.length === 0) {
        console.warn(`Sound not found: ${soundKey}`);
        return;
      }
      
      // Pick random variation
      const file = files[Math.floor(Math.random() * files.length)];

      // Determine volume based on category
      let volume = options.volume !== undefined ? options.volume : 1.0;
      if (soundKey.startsWith('avatar.') && this.reduceSoundMode && soundKey === 'avatar.idle') {
        return; // Skip idle sounds in reduce mode
      }

      volume = this.getSoundVolume(soundKey, volume);
      const howl = this.getHowl(file);
      const playId = howl.play();
      if (playId && typeof playId.catch === 'function') {
        playId.catch(() => {}); // Suppress autoplay errors
      }
      howl.volume(volume, playId);
      
      // Track active sound
      this.activeSounds.push({ key: soundKey, time: Date.now() });
      if (this.activeSounds.length > this.maxSimultaneousSounds) {
        this.activeSounds.shift();
      }
    }
    
    // Play weather ambient sound
    playWeatherAmbience(weatherType) {
      const normalized = this.getWeatherSoundKey(weatherType);
      const soundKey = `weather.${normalized}`;
      if (!this.soundMap[soundKey]) return;
      this.currentWeatherKey = normalized;
      if (this.isMuted || !this.isInitialized) return;
      
      const volume = this.getSoundVolume(soundKey, 1.0);
      const file = this.soundMap[soundKey][0];

      if (this.currentWeatherHowl && this.currentWeatherSound === soundKey) {
        this.currentWeatherHowl.volume(volume);
        return;
      }

      if (this.currentWeatherHowl) {
        this.currentWeatherHowl.stop();
      }

      const howl = this.getHowl(file, { loop: true });
      howl.volume(volume);
      const playPromise = howl.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {}); // Suppress autoplay errors
      }

      this.currentWeatherSound = soundKey;
      this.currentWeatherHowl = howl;
    }
    
    // Stop weather ambience
    stopWeatherAmbience() {
      if (this.currentWeatherHowl) {
        this.currentWeatherHowl.stop();
        this.currentWeatherHowl = null;
      }
      this.currentWeatherSound = null;
    }

    // Play zone ambience by event id
    playZoneAmbience(eventId) {
      if (!eventId || !this.soundMap[eventId]) return;
      this.currentZoneAmbience = eventId;
      if (this.isMuted || !this.isInitialized) return;

      const volume = this.getSoundVolume(eventId, 1.0);
      const file = this.soundMap[eventId][0];

      if (this.currentZoneAmbienceHowl && this.currentZoneAmbience === eventId) {
        this.currentZoneAmbienceHowl.volume(volume);
        return;
      }

      if (this.currentZoneAmbienceHowl) {
        this.currentZoneAmbienceHowl.stop();
      }

      const howl = this.getHowl(file, { loop: true });
      howl.volume(volume);
      const playPromise = howl.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {}); // Suppress autoplay errors
      }

      this.currentZoneAmbienceHowl = howl;
    }

    stopZoneAmbience() {
      if (this.currentZoneAmbienceHowl) {
        this.currentZoneAmbienceHowl.stop();
        this.currentZoneAmbienceHowl = null;
      }
      this.currentZoneAmbience = null;
    }

    // Play background music with loop
    playMusic(musicKey = 'music.hub') {
      if (!this.soundMap[musicKey]) return;
      this.currentMusicKey = musicKey;
      if (this.isMuted || !this.isInitialized) return;

      const volume = this.getSoundVolume(musicKey, 1.0);
      const file = this.soundMap[musicKey][0];

      if (this.currentMusicHowl && this.currentMusicSound === musicKey) {
        this.currentMusicHowl.volume(volume);
        return;
      }

      if (this.currentMusicHowl) {
        this.currentMusicHowl.stop();
      }

      const howl = this.getHowl(file, { loop: true });
      howl.volume(volume);
      const playPromise = howl.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {}); // Suppress autoplay errors
      }

      this.currentMusicSound = musicKey;
      this.currentMusicHowl = howl;
    }

    stopMusic() {
      if (this.currentMusicHowl) {
        this.currentMusicHowl.stop();
        this.currentMusicHowl = null;
      }
      this.currentMusicSound = null;
    }
    
    // Set volume for a category
    setVolume(category, value) {
      this.volumes[category] = Math.max(0, Math.min(1, value));
      this.saveSettings();
      
      // Update any playing sounds in that category
      if (category === 'ambience' && this.currentWeatherHowl) {
        this.currentWeatherHowl.volume(this.getSoundVolume(this.getCurrentWeatherSoundKey(), 1.0));
      }
      if (category === 'ambience' && this.currentZoneAmbienceHowl) {
        this.currentZoneAmbienceHowl.volume(this.getSoundVolume(this.currentZoneAmbience, 1.0));
      }
      if (category === 'music' && this.currentMusicHowl) {
        this.currentMusicHowl.volume(this.getSoundVolume(this.getCurrentMusicKey(), 1.0));
      }
      if (category === 'master') {
        if (this.currentWeatherHowl) {
          this.currentWeatherHowl.volume(this.getSoundVolume(this.getCurrentWeatherSoundKey(), 1.0));
        }
        if (this.currentZoneAmbienceHowl) {
          this.currentZoneAmbienceHowl.volume(this.getSoundVolume(this.currentZoneAmbience, 1.0));
        }
        if (this.currentMusicHowl) {
          this.currentMusicHowl.volume(this.getSoundVolume(this.getCurrentMusicKey(), 1.0));
        }
      }
    }
    
    // Toggle mute
    toggleMute() {
      this.isMuted = !this.isMuted;
      if (window.Howler) {
        Howler.mute(this.isMuted);
      }
      if (!this.isMuted) {
        if (this.currentWeatherKey) {
          this.playWeatherAmbience(this.currentWeatherKey);
        }
        if (this.currentZoneAmbience) {
          this.playZoneAmbience(this.currentZoneAmbience);
        }
        if (this.currentMusicKey) {
          this.playMusic(this.getCurrentMusicKey());
        }
      }
      console.log(this.isMuted ? '🔇 Audio muted' : '🔊 Audio unmuted');
      return this.isMuted;
    }
    
    // Set reduce sound mode
    setReduceSoundMode(enabled) {
      this.reduceSoundMode = enabled;
      this.saveSettings();
      console.log(`Reduce sound mode: ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    // William avatar sound helpers
    canPlayWilliamEasterEgg() {
      const now = Date.now();
      
      // Check spam prevention
      this.williamClickTimestamps = this.williamClickTimestamps.filter(t => now - t < 3000);
      if (this.williamClickTimestamps.length >= 5) {
        if (!this.williamSpamCooldown) {
          this.williamSpamCooldown = true;
          this.play('avatar.onBreak');
          setTimeout(() => {
            this.williamSpamCooldown = false;
          }, 60000);
        }
        return false;
      }
      
      // Check rate limit
      if (now - this.williamLastEasterEgg < 1500) {
        return false;
      }
      
      return true;
    }
    
    playWilliamTap() {
      this.williamClickTimestamps.push(Date.now());
      this.play('avatar.tap');
    }
    
    playWilliamEasterEgg() {
      if (!this.canPlayWilliamEasterEgg()) return;
      
      this.williamLastEasterEgg = Date.now();
      this.play('avatar.easterEgg');
    }
    
    playWilliamIdle() {
      if (this.reduceSoundMode) return;
      this.play('avatar.idle');
    }
  }
  
  // Create global audio manager instance
  const audioManager = new AudioManager(audioEventsData);

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw) throw 0;
      const data = JSON.parse(raw);
      // Ensure companions exist
      if (!data.companions) {
        data.companions = Object.fromEntries(COMPANIONS.map(comp => [
          comp,
          { level: characterMap[comp].level, xp: 0 }
        ]));
      }
      if (!data.selectedParty || data.selectedParty.length !== 2) {
        data.selectedParty = COMPANIONS.slice(0, 2);
      }
      if (!data.currentZone) data.currentZone = "launch-meadow";
      if (data.maxStreak === undefined) data.maxStreak = data.streak || 0;
      // Ensure hp exists
      if (data.hp === undefined) data.hp = 100;
      // Ensure warChest exists
      if (data.warChest === undefined) data.warChest = 0;
      // Ensure morningMission exists
      if (!data.morningMission) {
        data.morningMission = {
          streak: 0,
          lastCompletionDate: null,
          dailyState: {} // date -> { status, completedTasks, completionBonus, startTime, endTime }
        };
      }
      return data;
    }catch{
      return { 
        xp:0, 
        level: characterMap.william.level, 
        streak:0, 
        maxStreak: 0,
        hp:100,
        warChest: 0,
        days:{},
        companions: Object.fromEntries(COMPANIONS.map(comp => [
          comp,
          { level: characterMap[comp].level, xp: 0 }
        ])),
        selectedParty: COMPANIONS.slice(0, 2),
        currentZone: "launch-meadow",
        morningMission: {
          streak: 0,
          lastCompletionDate: null,
          dailyState: {}
        }
      };
    }
  }
  function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }

  // Rule 5: Null-safe toast notification
  function toast(msg){
    const el=$("toast");
    if (!el) {
      console.warn('[FAIL-SOFT] Toast element not found');
      return;
    }
    el.textContent=msg;
    el.style.display="block";
    clearTimeout(toast._t);
    toast._t=setTimeout(()=>el.style.display="none", 2500);
  }

  function showStoredNotice() {
    const noticeKey = "williamsworld_battle_notice";
    const notice = localStorage.getItem(noticeKey);
    if (notice) {
      localStorage.removeItem(noticeKey);
      toast(notice);
    }
  }
  
  // ============================================
  // MORNING MISSION STATE MANAGEMENT
  // ============================================
  
  // Get or create today's morning mission state
  function getTodayMissionState() {
    const today = getChicagoDateKey();
    if (!state.morningMission.dailyState[today]) {
      state.morningMission.dailyState[today] = {
        status: 'not_started',  // not_started, in_progress, completed, failed, expired
        completedTasks: {},      // taskId -> timestamp
        completionBonus: false,
        startTime: null,
        endTime: null
      };
    }
    return state.morningMission.dailyState[today];
  }
  
  // ============================================
  // GENERAL TASK ANTI-SPAM PROTECTION
  // ============================================
  
  // Track all task completions for the day (not just morning tasks)
  function getTodayTaskCompletions() {
    const today = todayKey();
    const day = state.days[today];
    if (!day.taskCompletions) {
      day.taskCompletions = {}; // taskId -> timestamp
    }
    return day.taskCompletions;
  }
  
  // Check if ANY task was already completed today (idempotent check)
  function isTaskCompletedToday(taskId) {
    const completions = getTodayTaskCompletions();
    return !!completions[taskId];
  }
  
  // Mark any task as completed for today (returns false if already completed)
  function markTaskCompletedToday(taskId) {
    const completions = getTodayTaskCompletions();
    
    // Anti-spam: already completed today
    if (completions[taskId]) {
      return false;
    }
    
    // Mark as completed
    completions[taskId] = Date.now();
    save();
    return true;
  }
  
  // Check if a specific morning task was completed today
  function isMorningTaskCompletedToday(taskId) {
    const missionState = getTodayMissionState();
    return !!missionState.completedTasks[taskId];
  }
  
  // Mark morning task as completed (returns false if already completed today)
  function markMorningTaskCompleted(taskId) {
    const missionState = getTodayMissionState();
    
    // Anti-spam: already completed today
    if (missionState.completedTasks[taskId]) {
      return false;
    }
    
    // Check time window
    if (!isInMorningWindow()) {
      return false;
    }
    
    // Mark as completed
    missionState.completedTasks[taskId] = Date.now();
    if (missionState.status === 'not_started') {
      missionState.status = 'in_progress';
      missionState.startTime = Date.now();
    }
    
    save();
    return true;
  }
  
  // Get count of completed morning tasks today
  function getMorningTasksCompletedCount() {
    const missionState = getTodayMissionState();
    return Object.keys(missionState.completedTasks).length;
  }
  
  // Check if all morning tasks are complete
  function areAllMorningTasksComplete() {
    const morningTaskIds = TASKS.filter(t => t.quest === 'morning').map(t => t.id);
    const missionState = getTodayMissionState();
    return morningTaskIds.every(id => missionState.completedTasks[id]);
  }
  
  // Complete the morning mission (all tasks done before deadline)
  function completeMorningMission() {
    const missionState = getTodayMissionState();
    
    if (missionState.status === 'completed' || missionState.completionBonus) {
      return; // Already completed
    }
    
    if (!areAllMorningTasksComplete()) {
      return; // Not all tasks complete
    }
    
    if (isMorningDeadlinePassed()) {
      return; // Too late
    }
    
    // Award completion bonus
    missionState.status = 'completed';
    missionState.completionBonus = true;
    missionState.endTime = Date.now();
    
    state.hp += MORNING_MISSION.HP_COMPLETION_BONUS;
    const maxHP = getMaxHP();
    if (state.hp > maxHP) state.hp = maxHP;
    
    // Update streak
    const today = getChicagoDateKey();
    const yesterday = getYesterdayDateKey();
    
    // Only update streak if this is genuinely a new completion (not same-day re-check)
    if (state.morningMission.lastCompletionDate === yesterday) {
      state.morningMission.streak += 1;
    } else if (state.morningMission.lastCompletionDate !== today) {
      // First completion or broken streak
      state.morningMission.streak = 1;
    }
    // If lastCompletionDate === today, keep streak unchanged (same-day completion check)
    
    state.morningMission.lastCompletionDate = today;
    
    // Streak bonus every 3 days
    if (state.morningMission.streak % MORNING_MISSION.STREAK_BONUS_INTERVAL === 0) {
      state.hp += MORNING_MISSION.STREAK_BONUS_HP;
      if (state.hp > maxHP) state.hp = maxHP;
      toast(`🎉 Mission Complete! +${MORNING_MISSION.HP_COMPLETION_BONUS} HP + Streak +${MORNING_MISSION.STREAK_BONUS_HP} HP!`);
    } else {
      toast(`🎉 Morning Mission Complete! +${MORNING_MISSION.HP_COMPLETION_BONUS} HP`);
    }
    
    save();
    updateMorningMissionUI();
    showMorningMissionSuccess();
  }
  
  // Fail the morning mission (deadline passed with incomplete tasks)
  function failMorningMission() {
    const missionState = getTodayMissionState();
    
    if (missionState.status === 'failed' || missionState.status === 'completed') {
      return; // Already processed
    }
    
    if (areAllMorningTasksComplete()) {
      return; // Actually completed
    }
    
    missionState.status = 'failed';
    missionState.endTime = Date.now();
    
    // Reset streak
    state.morningMission.streak = 0;
    
    save();
    updateMorningMissionUI();
    showMorningMissionFailed();
  }
  
  // Get yesterday's date key
  function getYesterdayDateKey() {
    const now = getChicagoTime();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,"0")}-${String(yesterday.getDate()).padStart(2,"0")}`;
  }
  
  // Check and update morning mission status based on time
  function checkMorningMissionStatus() {
    const missionState = getTodayMissionState();
    
    if (missionState.status === 'completed' || missionState.status === 'failed') {
      return; // Already finalized
    }
    
    // Check if all tasks are complete
    if (areAllMorningTasksComplete() && !isMorningDeadlinePassed()) {
      completeMorningMission();
    } else if (isMorningDeadlinePassed() && !areAllMorningTasksComplete()) {
      failMorningMission();
    }
  }
  
  
  // Rule 5: Null-safe floating XP animation
  function showFloatingXP(amount, x, y) {
    if (!document.body) {
      console.warn('[FAIL-SOFT] document.body not available for floating XP');
      return;
    }
    const el = document.createElement('div');
    el.className = 'floatingXP';
    el.textContent = `+${amount} XP`;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) {
        el.remove();
      }
    }, 1500);
  }
  
  // Rule 5: Null-safe companion reward card
  function showCompanionRewardCard(companion, fromLevel, newLevel) {
    const overlay = $('companionRewardOverlay');
    if (!overlay) {
      console.warn('[FAIL-SOFT] Companion reward overlay not found');
      return;
    }
    
    const statsBefore = getCharacterStats(companion, fromLevel);
    const statsAfter = getCharacterStats(companion, newLevel);
    const updates = getAbilityUpdates(companion, newLevel);
    const rewardPower = $('rewardCompPower');
    const rewardStats = $('rewardCompStats');
    
    const rewardEmoji = $('rewardEmoji');
    if (rewardEmoji) rewardEmoji.textContent = COMPANION_EMOJIS[companion];
    
    const rewardCompName = $('rewardCompName');
    if (rewardCompName) rewardCompName.textContent = COMPANION_NAMES[companion];
    
    const rewardCompFrom = $('rewardCompFrom');
    if (rewardCompFrom) rewardCompFrom.textContent = fromLevel;
    
    const rewardCompLevel = $('rewardCompLevel');
    if (rewardCompLevel) rewardCompLevel.textContent = newLevel;
    
    const rewardCompClass = $('rewardCompClass');
    if (rewardCompClass) rewardCompClass.textContent = COMPANION_CLASSES[companion];
    
    const rewardCompTitle = $('rewardCompTitle');
    if (rewardCompTitle) rewardCompTitle.textContent = getCompanionTitle(companion, newLevel);
    
    const rewardImg = $('rewardCompImg');
    if (rewardImg) rewardImg.src = ASSETS.companions[companion];
    if (rewardStats) rewardStats.textContent = formatStatChange(statsBefore, statsAfter);
    if (rewardPower) {
      if (updates.length) {
        rewardPower.innerHTML = `<ul>${updates.map(update => `<li>${update.name}: ${update.changes.join(', ')}</li>`).join('')}</ul>`;
      } else {
        rewardPower.textContent = '⚡ New Power Unlocked! ⚡';
      }
    }
    overlay.classList.add('show');
    audioManager.play('companion_level_up_fanfare');
    
    // Particle effects
    for (let i = 0; i < 25; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = Math.random() * window.innerHeight + 'px';
        const colors = ['var(--gold)', 'var(--green)', 'var(--blue)', '#ff6b8a', '#c084fc'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        overlay.querySelector('.content').appendChild(particle);
        setTimeout(() => particle.remove(), 2000);
      }, i * 40);
    }
    
    setTimeout(() => overlay.classList.remove('show'), 3000);
  }

  // Show level-down overlay
  function showLevelDown(newLevel) {
    const overlay = $('levelDownOverlay');
    $('levelDownNumber').textContent = newLevel;
    $('levelDownTitle').textContent = getLevelTitle(newLevel);
    overlay.classList.add('show');
    setTimeout(() => overlay.classList.remove('show'), 3000);
  }

  // Check for level down when HP reaches 0
  function checkLevelDown() {
    if (state.hp <= 0 && state.level > 1) {
      state.level = Math.max(1, state.level - 1);
      state.xp = 0;
      state.hp = LEVEL_DOWN_HP_RESET;
      save();
      showLevelDown(state.level);
      toast(`💀 LEVEL DOWN! Dropped to Level ${state.level}: ${getLevelTitle(state.level)}`);
    }
  }
  function showLevelUpCelebration(characterId, fromLevel, level) {
    const character = characterMap[characterId];
    const statsBefore = getCharacterStats(characterId, fromLevel);
    const statsAfter = getCharacterStats(characterId, level);
    const updates = getAbilityUpdates(characterId, level);
    const overlay = $('levelUpOverlay');
    const levelTitle = $('levelUpTitle');
    const williamImgOverlay = $('williamImgOverlay');
    
    $('levelUpFrom').textContent = fromLevel;
    $('levelUpTo').textContent = level;
    $('levelUpName').textContent = character.displayName;
    $('levelUpClass').textContent = character.classTitle;
    $('levelUpStats').textContent = formatStatChange(statsBefore, statsAfter);
    $('levelUpAbilities').innerHTML = updates.length
      ? `<ul>${updates.map(update => `<li>${update.name}: ${update.changes.join(', ')}</li>`).join('')}</ul>`
      : '<div>No new abilities this level.</div>';
    levelTitle.textContent = getLevelTitle(level);
    if (williamImgOverlay) williamImgOverlay.src = getWilliamImage(level);
    overlay.classList.add('show');
    audioManager.play('hero_level_up_fanfare');
    
    // Create particle effects
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = Math.random() * window.innerHeight + 'px';
        overlay.querySelector('.content').appendChild(particle);
        setTimeout(() => particle.remove(), 2000);
      }, i * 50);
    }
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      overlay.classList.remove('show');
    }, 3000);
  }

  function showXpRecap(amount) {
    const overlay = $('xpRecapOverlay');
    if (!overlay) return;
    $('xpRecapValue').textContent = `+${amount} XP`;
    overlay.classList.add('show');
    setTimeout(() => {
      overlay.classList.remove('show');
    }, 2500);
  }
  
  // ============================================
  // MORNING MISSION UI FUNCTIONS
  // ============================================
  
  // Update Morning Mission UI
  function updateMorningMissionUI() {
    const questCard = $('questMorning');
    if (!questCard) return;
    
    const missionState = getTodayMissionState();
    const morningTaskIds = TASKS.filter(t => t.quest === 'morning').map(t => t.id);
    const completedCount = getMorningTasksCompletedCount();
    const totalCount = morningTaskIds.length;
    
    // Update timer and status banner
    let timerEl = questCard.querySelector('.missionTimer');
    let statusBanner = questCard.querySelector('.missionStatusBanner');
    let bombVisual = questCard.querySelector('.bombVisual');
    
    // Create elements if they don't exist
    if (!timerEl) {
      timerEl = document.createElement('div');
      timerEl.className = 'missionTimer';
      questCard.insertBefore(timerEl, questCard.querySelector('.questChecklist'));
    }
    
    if (!statusBanner) {
      statusBanner = document.createElement('div');
      statusBanner.className = 'missionStatusBanner';
      questCard.insertBefore(statusBanner, questCard.querySelector('.questChecklist'));
    }
    
    if (!bombVisual) {
      bombVisual = document.createElement('div');
      bombVisual.className = 'bombVisual';
      questCard.insertBefore(bombVisual, questCard.querySelector('.questChecklist'));
    }
    
    // Update based on status
    if (missionState.status === 'completed') {
      timerEl.style.display = 'none';
      statusBanner.style.display = 'block';
      statusBanner.className = 'missionStatusBanner success';
      statusBanner.textContent = '🎉 Morning Mission Complete!';
      bombVisual.innerHTML = '<div class="bombDisarmed">💚 DISARMED</div>';
      bombVisual.className = 'bombVisual disarmed';
    } else if (missionState.status === 'failed') {
      timerEl.style.display = 'none';
      statusBanner.style.display = 'block';
      statusBanner.className = 'missionStatusBanner failed';
      const missedTasks = morningTaskIds.filter(id => !missionState.completedTasks[id])
        .map(id => TASKS.find(t => t.id === id).label.replace('Morning: ', ''))
        .join(', ');
      statusBanner.innerHTML = `💥 Morning Mission Failed<br><span class="small">You missed: ${missedTasks}</span>`;
      bombVisual.innerHTML = '<div class="bombExploded">💥 BOOM!</div>';
      bombVisual.className = 'bombVisual exploded';
    } else if (isBeforeMorningWindow()) {
      timerEl.style.display = 'block';
      timerEl.className = 'missionTimer locked';
      timerEl.textContent = '🔒 Opens at 6:00 AM';
      statusBanner.style.display = 'none';
      updateBombWires(bombVisual, completedCount, totalCount);
    } else if (isMorningDeadlinePassed()) {
      // Deadline passed, check status
      checkMorningMissionStatus();
    } else if (isInMorningWindow()) {
      // Active mission
      timerEl.style.display = 'block';
      const remaining = getTimeUntilDeadline();
      const formatted = formatTimeRemaining(remaining);
      
      // Color based on urgency
      let urgency = 'normal';
      if (remaining < 2 * 60 * 1000) urgency = 'critical'; // < 2 minutes
      else if (remaining < 10 * 60 * 1000) urgency = 'warning'; // < 10 minutes
      
      timerEl.className = `missionTimer active ${urgency}`;
      timerEl.innerHTML = `⏱️ Time Left: <strong>${formatted}</strong><br><span class="deadline">Mission ends at ${MORNING_MISSION.DEADLINE_HOUR}:00 AM</span>`;
      statusBanner.style.display = 'none';
      updateBombWires(bombVisual, completedCount, totalCount);
    } else {
      timerEl.style.display = 'none';
      statusBanner.style.display = 'none';
      updateBombWires(bombVisual, completedCount, totalCount);
    }
    
    // Update wire colors on task items
    morningTaskIds.forEach(taskId => {
      const checkItem = document.querySelector(`.checkItem[data-task="${taskId}"]`);
      if (!checkItem) return;
      
      const wireColor = MORNING_MISSION.WIRE_COLORS[taskId];
      if (!wireColor) return;
      
      let wireBadge = checkItem.querySelector('.wireBadge');
      if (!wireBadge) {
        wireBadge = document.createElement('span');
        wireBadge.className = 'wireBadge';
        checkItem.insertBefore(wireBadge, checkItem.querySelector('span'));
      }
      
      wireBadge.textContent = wireColor.icon;
      wireBadge.style.background = wireColor.color;
      wireBadge.title = `${wireColor.label} wire`;
      
      if (isMorningTaskCompletedToday(taskId)) {
        wireBadge.classList.add('cut');
      } else {
        wireBadge.classList.remove('cut');
      }
    });
  }
  
  // Update bomb visual with wires
  function updateBombWires(bombVisual, completedCount, totalCount) {
    if (!bombVisual) return;
    
    bombVisual.className = 'bombVisual active';
    bombVisual.innerHTML = '';
    
    const morningTaskIds = TASKS.filter(t => t.quest === 'morning').map(t => t.id);
    const missionState = getTodayMissionState();
    
    // Progress indicator
    const progress = document.createElement('div');
    progress.className = 'bombProgress';
    progress.innerHTML = `<strong>Wires Cut: ${completedCount}/${totalCount}</strong>`;
    bombVisual.appendChild(progress);
    
    // Bomb emoji
    const bomb = document.createElement('div');
    bomb.className = 'bombEmoji';
    bomb.textContent = '💣';
    bombVisual.appendChild(bomb);
    
    // Wires
    const wiresContainer = document.createElement('div');
    wiresContainer.className = 'wiresContainer';
    
    morningTaskIds.forEach(taskId => {
      const wireInfo = MORNING_MISSION.WIRE_COLORS[taskId];
      if (!wireInfo) return;
      
      const wire = document.createElement('div');
      wire.className = 'wire';
      if (missionState.completedTasks[taskId]) {
        wire.classList.add('cut');
      }
      wire.style.background = wireInfo.color;
      wire.title = `${wireInfo.label} wire - ${TASKS.find(t => t.id === taskId).label.replace('Morning: ', '')}`;
      
      wiresContainer.appendChild(wire);
    });
    
    bombVisual.appendChild(wiresContainer);
  }
  
  // Show mission success animation
  function showMorningMissionSuccess() {
    const overlay = document.createElement('div');
    overlay.className = 'missionOverlay success';
    overlay.innerHTML = `
      <div class="missionOverlayContent">
        <div class="williamHero">🦸</div>
        <h2>Morning Mission Complete!</h2>
        <div class="missionStats">
          <div>✅ All tasks complete before deadline</div>
          <div>💚 +${MORNING_MISSION.HP_COMPLETION_BONUS} HP Bonus</div>
          <div>🔥 Streak: ${state.morningMission.streak} days</div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Confetti effect
    for (let i = 0; i < MORNING_MISSION.CONFETTI_COUNT; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        const colors = ['#ffd36e', '#7dffb4', '#ff9d5c', '#d4a530', '#7c3aed'];
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        overlay.querySelector('.missionOverlayContent').appendChild(confetti);
      }, i * 20);
    }
    
    setTimeout(() => {
      overlay.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), MORNING_MISSION.OVERLAY_FADE_DURATION);
    }, 3500);
  }
  
  // Show mission failed animation
  function showMorningMissionFailed() {
    const overlay = document.createElement('div');
    overlay.className = 'missionOverlay failed';
    
    const morningTaskIds = TASKS.filter(t => t.quest === 'morning').map(t => t.id);
    const missionState = getTodayMissionState();
    const missedTasks = morningTaskIds.filter(id => !missionState.completedTasks[id])
      .map(id => TASKS.find(t => t.id === id).label.replace('Morning: ', ''));
    
    overlay.innerHTML = `
      <div class="missionOverlayContent">
        <div class="williamSooty">😅💨</div>
        <h2>Morning Mission Failed</h2>
        <div class="missionStats">
          <div>⏰ Deadline passed at ${MORNING_MISSION.DEADLINE_HOUR}:00 AM</div>
          <div>📋 You missed: ${missedTasks.join(', ')}</div>
          <div>🔄 Try again tomorrow!</div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Smoke puffs
    for (let i = 0; i < MORNING_MISSION.SMOKE_PUFF_COUNT; i++) {
      setTimeout(() => {
        const smoke = document.createElement('div');
        smoke.className = 'smoke';
        smoke.textContent = '💨';
        smoke.style.left = 45 + Math.random() * 10 + '%';
        smoke.style.animationDelay = Math.random() * 0.3 + 's';
        overlay.querySelector('.missionOverlayContent').appendChild(smoke);
      }, i * 100);
    }
    
    setTimeout(() => {
      overlay.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), MORNING_MISSION.OVERLAY_FADE_DURATION);
    }, 4000);
  }

  function applyAssets(){
    const bannerEl = document.querySelector("#ww [data-banner]");
    // Banner background removed - letting the cinematic backdrop show through
    const logoImg = $("logoImg");
    const mapstripImg = $("mapstripImg");
    const emberImg = $("emberImg");
    const spriteImg = $("spriteImg");
    const golemImg = $("golemImg");
    
    if(logoImg) logoImg.src = ASSETS.logo;
    if(mapstripImg) mapstripImg.src = ASSETS.mapstrip;
    if(emberImg) emberImg.src = ASSETS.companions.ember;
    if(spriteImg) spriteImg.src = ASSETS.companions.sprite;
    if(golemImg) golemImg.src = ASSETS.companions.golem;
    
    // Load William's character image
    const williamImg = $("williamImg");
    if(williamImg) williamImg.src = getWilliamImage(state.level);
    
    // Load zone images
    if($("zone1Img")) $("zone1Img").src = ASSETS.zones.z1;
    if($("zone2Img")) $("zone2Img").src = ASSETS.zones.z2;
    if($("zone3Img")) $("zone3Img").src = ASSETS.zones.z3;
    if($("zone4Img")) $("zone4Img").src = ASSETS.zones.z4;
    
    // Load zone icon images in sidebar
    if($("zone1IconImg")) $("zone1IconImg").src = ASSETS.zones.z1;
    if($("zone2IconImg")) $("zone2IconImg").src = ASSETS.zones.z2;
    if($("zone3IconImg")) $("zone3IconImg").src = ASSETS.zones.z3;
    if($("zone4IconImg")) $("zone4IconImg").src = ASSETS.zones.z4;
  }

  let state = load();
  const TODAY = todayKey();
  function getMaxHP() { return 100 + (state.streak * HP_PER_STREAK); }
  if(!state.days[TODAY]){
    state.days[TODAY]={ 
      tasks:Object.fromEntries(TASKS.map(t=>[t.id,false])), 
      result:"Not graded",
      leveledUp: false,
      taskCompletions: {} // Track task completion timestamps for anti-spam
    };
    save();
  }
  // Ensure taskCompletions exists for existing days
  if (!state.days[TODAY].taskCompletions) {
    state.days[TODAY].taskCompletions = {};
  }
  if (state.days[TODAY].leveledUp === undefined) {
    state.days[TODAY].leveledUp = false;
  }

  // Calculate damage for incomplete tasks in a day
  function calcDamage(dayData) {
    let dmg = 0;
    TASKS.forEach(t => {
      if (!dayData.tasks[t.id]) dmg += t.xp;
    });
    return dmg;
  }

  // Midnight check: auto-grade any past ungraded days as FAIL and apply damage
  function midnightCheck() {
    let totalDamage = 0;
    const sortedKeys = Object.keys(state.days).sort();
    sortedKeys.forEach(dateKey => {
      if (dateKey >= TODAY) return; // skip today
      const day = state.days[dateKey];
      if (day.result === "Not graded") {
        // Midnight passed without grading — auto-FAIL and apply damage
        day.result = "FAIL";
        const dmg = calcDamage(day);
        totalDamage += dmg;
        state.streak = 0;
      }
    });
    if (totalDamage > 0) {
      state.hp = Math.max(0, state.hp - totalDamage);
      // Cap HP to max based on current streak
      const maxHP = getMaxHP();
      if (state.hp > maxHP) state.hp = maxHP;
      save();
      setTimeout(() => {
        toast(`💀 Midnight damage! -${totalDamage} HP for missed tasks`);
        checkLevelDown();
      }, 500);
    }
  }
  midnightCheck();

  function isPassDay(){
    const day = state.days[TODAY];
    // PASS criteria: all Night-Before tasks + Trapper Check complete
    // Night quest task IDs
    const nightIds = ["n_trapper","n_clothes","n_lunch","n_shoes"];
    
    const nightOk = nightIds.every(id=>day.tasks[id]===true);
    const trapperCheckOk = day.tasks["m_trappercheck"] === true;
    
    return nightOk && trapperCheckOk;
  }

  function recalcLevel(){
    while(state.xp >= xpForLevel(state.level)){
      const fromLevel = state.level;
      state.xp -= xpForLevel(state.level);
      state.level += 1;
      state.days[TODAY].leveledUp = true;
      showLevelUpCelebration('william', fromLevel, state.level);
    }
    if (state.days[TODAY].leveledUp) {
      toast(`LEVEL UP → ${state.level}: ${getLevelTitle(state.level)}`);
    }
  }
  
  // Add XP to companions
  function addCompanionXP(amount, specificComp) {
    const comps = specificComp ? [specificComp] : COMPANIONS;
    comps.forEach(comp => {
      state.companions[comp].xp += Math.floor(amount);
      while (state.companions[comp].xp >= companionXpForLevel(state.companions[comp].level)) {
        const fromLevel = state.companions[comp].level;
        state.companions[comp].xp -= companionXpForLevel(state.companions[comp].level);
        state.companions[comp].level += 1;
        state.days[TODAY].leveledUp = true;
        showCompanionRewardCard(comp, fromLevel, state.companions[comp].level);
      }
    });
  }

  // Rule 5: Defensive UI update with null checks for all DOM elements
  function updateHeader(){
    const todayLabel = $("todayLabel");
    if (todayLabel) todayLabel.textContent = prettyToday();
    
    const levelNum = $("levelNum");
    if (levelNum) levelNum.textContent = state.level;
    
    const levelTitle = $("levelTitle");
    if (levelTitle) levelTitle.textContent = getLevelTitle(state.level);
    
    const williamClassTitle = $("williamClassTitle");
    if (williamClassTitle) williamClassTitle.textContent = characterMap.william.classTitle;
    
    const streakNum = $("streakNum");
    if (streakNum) streakNum.textContent = state.streak;

    const need = xpForLevel(state.level);
    const xpNow = $("xpNow");
    if (xpNow) xpNow.textContent = state.xp;
    
    const xpNext = $("xpNext");
    if (xpNext) xpNext.textContent = need;
    
    const xpBar = $("xpBar");
    if (xpBar) xpBar.style.width = Math.max(0, Math.min(100, Math.round((state.xp/need)*100))) + "%";

    const dayResult = $("dayResult");
    if (dayResult) dayResult.textContent = state.days[TODAY].result;
    
    // Update William's character image based on level
    const williamImg = $("williamImg");
    if (williamImg) williamImg.src = getWilliamImage(state.level);
    
    // Update HP display
    const maxHP = getMaxHP();
    const hpPct = Math.max(0, Math.min(100, Math.round((state.hp / maxHP) * 100)));
    
    const hpNum = $("hpNum");
    if (hpNum) hpNum.textContent = state.hp;
    
    const hpMaxPill = $("hpMaxPill");
    if (hpMaxPill) hpMaxPill.textContent = maxHP;
    
    const hpNow = $("hpNow");
    if (hpNow) hpNow.textContent = state.hp;
    
    const hpMax = $("hpMax");
    if (hpMax) hpMax.textContent = maxHP;
    
    const hpBar = $("hpBar");
    if (hpBar) hpBar.style.width = hpPct + "%";
    
    const dashHP = $("dashHP");
    if (dashHP) dashHP.textContent = state.hp;
    
    const dashHPMax = $("dashHPMax");
    if (dashHPMax) dashHPMax.textContent = maxHP;
    
    const dashHPBar = $("dashHPBar");
    if (dashHPBar) dashHPBar.style.width = hpPct + "%";
    
    // Low HP warning
    const hpMeterBanner = $("hpMeterBanner");
    const hpMeterDash = $("hpMeterDash");
    if (hpPct <= 25) {
      if (hpMeterBanner) hpMeterBanner.classList.add("low");
      if (hpMeterDash) hpMeterDash.classList.add("low");
    } else {
      if (hpMeterBanner) hpMeterBanner.classList.remove("low");
      if (hpMeterDash) hpMeterDash.classList.remove("low");
    }

    // Update dashboard
    const dashXP = $("dashXP");
    if (dashXP) dashXP.textContent = state.xp;
    
    const dashStreak = $("dashStreak");
    if (dashStreak) dashStreak.textContent = state.streak;
    
    const dashXPBar = $("dashXPBar");
    if (dashXPBar) dashXPBar.style.width = Math.max(0, Math.min(100, Math.round((state.xp/need)*100))) + "%";
    
    // Update streak fire animation
    const streakFire = document.querySelector('.streakFire');
    if (streakFire) {
      if (state.streak >= 10) {
        streakFire.classList.add('mega');
      } else {
        streakFire.classList.remove('mega');
      }
    }
    
    updateBadges();
    updateStreakBadges();
    updateWeeklyTracker();
    updateCompanions();
    updateZones();
    
    // Update War Chest display
    const warChestGold = $("warChestGold");
    if (warChestGold) warChestGold.textContent = state.warChest;
    document.querySelectorAll('.awardBtn').forEach(btn => {
      btn.disabled = state.warChest < WAR_CHEST_AWARD_COST;
    });
  }
  
  // Update companion display
  function updateCompanions() {
    COMPANIONS.forEach(comp => {
      const el = $(`companion${comp.charAt(0).toUpperCase() + comp.slice(1)}`);
      if (!el) return;
      
      const compData = state.companions[comp];
      el.querySelector('.companionLevel').textContent = compData.level;
      const compNeed = companionXpForLevel(compData.level);
      el.querySelector('.companionXPBar').style.width = Math.max(0, Math.min(100, Math.round((compData.xp / compNeed) * 100))) + '%';
      const nameEl = $(`${comp}Name`);
      if (nameEl) nameEl.textContent = COMPANION_NAMES[comp];
      const classEl = $(`${comp}Class`);
      if (classEl) classEl.textContent = `${COMPANION_EMOJIS[comp]} ${COMPANION_CLASSES[comp]}`;
      
      // Update companion title
      const titleEl = $(`${comp}Title`);
      if (titleEl) titleEl.textContent = getCompanionTitle(comp, compData.level);
      
      // Add evolved class for higher level companions
      if (compData.level >= 5) {
        el.classList.add('evolved');
      } else {
        el.classList.remove('evolved');
      }
    });
    document.querySelectorAll('.awardName').forEach(el => {
      const comp = el.dataset.companion;
      if (comp && COMPANION_NAMES[comp]) {
        el.textContent = COMPANION_NAMES[comp];
      }
    });
  }

  let activeQuestZoneId = null;
  let questLoreOpenMode = null;
  let questLoreHoverTarget = null;
  let questLoreLastFocused = null;
  let questLoreCardEl = null;
  let questLoreFocusables = [];

  function updateQuestLoreFocusables() {
    if (!questLoreCardEl) {
      questLoreFocusables = [];
      return;
    }
    questLoreFocusables = Array.from(
      questLoreCardEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex^="-"])')
    ).filter(el => !el.disabled && (el.offsetParent !== null || el.getClientRects().length > 0));
  }

  function updateQuestLoreStatus(zone) {
    const statusEl = $("questLoreStatus");
    const lockEl = $("questLoreLock");
    const ctaEl = $("questLoreCta");
    if (!statusEl || !lockEl || !ctaEl) return;

    const isUnlocked = state.streak >= zone.unlockDays;
    statusEl.textContent = isUnlocked
      ? "Unlocked"
      : `Unlocks at ${zone.unlockDays}-day streak`;
    statusEl.classList.toggle("unlocked", isUnlocked);
    statusEl.classList.toggle("locked", !isUnlocked);

    if (isUnlocked) {
      lockEl.textContent = "";
      ctaEl.disabled = false;
      ctaEl.textContent = "Enter Battle";
      ctaEl.removeAttribute("aria-disabled");
      ctaEl.setAttribute("aria-label", "Enter Battle");
    } else {
      lockEl.textContent = `Locked — unlocks at ${zone.unlockDays}-day streak`;
      ctaEl.disabled = true;
      ctaEl.textContent = "Locked";
      ctaEl.setAttribute("aria-disabled", "true");
      ctaEl.setAttribute("aria-label", `Locked — unlocks at ${zone.unlockDays}-day streak`);
    }
  }

  function renderQuestLore(zone) {
    const titleEl = $("questLoreTitle");
    const storyEl = $("questLoreStory");
    const listEl = $("questLoreEnemiesList");
    if (!titleEl || !storyEl || !listEl) return;

    titleEl.textContent = zone.name;
    storyEl.textContent = zone.story;

    listEl.innerHTML = "";
    zone.enemies.forEach(enemy => {
      const enemyEl = document.createElement("div");
      enemyEl.className = "questLoreEnemy";

      const nameEl = document.createElement("div");
      nameEl.className = "questLoreEnemyName";
      nameEl.textContent = enemy.name;
      enemyEl.appendChild(nameEl);

      const behaviorEl = document.createElement("div");
      behaviorEl.className = "questLoreEnemyBehavior";
      behaviorEl.textContent = enemy.behavior;
      enemyEl.appendChild(behaviorEl);

      const movesEl = document.createElement("div");
      movesEl.className = "questLoreMoves";
      enemy.moves.forEach(move => {
        const moveEl = document.createElement("span");
        moveEl.className = "questLoreMove";
        moveEl.textContent = move.name;
        movesEl.appendChild(moveEl);
      });
      enemyEl.appendChild(movesEl);

      listEl.appendChild(enemyEl);
    });

    updateQuestLoreStatus(zone);
  }

  function buildQuestZoneLockOverlay(unlockText) {
    const lockOverlay = document.createElement("div");
    lockOverlay.className = "questZoneLockOverlay";
    const lockIcon = document.createElement("div");
    lockIcon.className = "lockIcon";
    lockIcon.textContent = "🔒";
    const lockText = document.createElement("div");
    lockText.className = "questZoneLockText";
    lockText.textContent = unlockText;
    lockOverlay.appendChild(lockIcon);
    lockOverlay.appendChild(lockText);
    return lockOverlay;
  }

  function getUnlockText(unlockDays) {
    return `Unlocks at ${unlockDays}-day streak`;
  }

  function openQuestLore(zoneId, openMode = "click", sourceEl = null) {
    if (!questZonesData || !questZonesData.zones) return;
    const zone = questZonesData.zones.find(item => item.id === zoneId);
    if (!zone) return;

    activeQuestZoneId = zoneId;
    questLoreOpenMode = openMode;
    questLoreHoverTarget = sourceEl;
    renderQuestLore(zone);

    const overlay = $("questLoreOverlay");
    if (overlay) {
      overlay.classList.add("show");
      overlay.setAttribute("aria-hidden", "false");
    }

    questLoreLastFocused = document.activeElement;
    updateQuestLoreFocusables();
    if (questLoreFocusables.length > 0) {
      questLoreFocusables[0].focus();
    }
  }

  function closeQuestLore() {
    const overlay = $("questLoreOverlay");
    if (overlay) {
      overlay.classList.remove("show");
      overlay.setAttribute("aria-hidden", "true");
    }
    activeQuestZoneId = null;
    questLoreOpenMode = null;
    questLoreHoverTarget = null;
    if (questLoreLastFocused && document.contains(questLoreLastFocused)) {
      questLoreLastFocused.focus();
    }
    questLoreLastFocused = null;
  }

  function renderQuestZones() {
    const grid = $("questZonesGrid");
    if (!grid || !questZonesData || !questZonesData.zones) return;

    const canHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;
    grid.innerHTML = "";

    questZonesData.zones.forEach(zone => {
      const card = document.createElement("div");
      card.className = "questZoneCard";
      card.id = zone.cardId;
      card.dataset.zoneId = zone.id;
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");

      const media = document.createElement("div");
      media.className = "questZoneMedia";

      const imageWrapper = document.createElement("div");
      imageWrapper.className = "questZoneImage";
      const imgEl = document.createElement("img");
      imgEl.alt = zone.name;
      if (ASSETS.zones[zone.assetKey]) {
        imgEl.src = ASSETS.zones[zone.assetKey];
      }
      imageWrapper.appendChild(imgEl);

      const textWrapper = document.createElement("div");
      const nameEl = document.createElement("div");
      nameEl.className = "questZoneName";
      nameEl.textContent = zone.name;
      const statusEl = document.createElement("div");
      statusEl.className = "questZoneStatus";
      textWrapper.appendChild(nameEl);
      textWrapper.appendChild(statusEl);

      media.appendChild(imageWrapper);
      media.appendChild(textWrapper);

      const enemyCountEl = document.createElement("div");
      enemyCountEl.className = "questZoneEnemyCount";
      enemyCountEl.textContent = `Enemy count: ${zone.enemies.length}`;

      card.appendChild(media);
      card.appendChild(enemyCountEl);
      const isUnlocked = state.streak >= zone.unlockDays;
      if (!isUnlocked) {
        card.appendChild(buildQuestZoneLockOverlay(getUnlockText(zone.unlockDays)));
      }

      if (canHover) {
        card.addEventListener("mouseenter", () => openQuestLore(zone.id, "hover", card));
      }
      card.addEventListener("click", () => openQuestLore(zone.id, "click", card));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openQuestLore(zone.id, "click", card);
        }
      });

      grid.appendChild(card);
    });
  }

  function getInlineQuestZonesData() {
    const inlineData = document.getElementById("questZonesData");
    if (!inlineData) return null;
    try {
      return JSON.parse(inlineData.textContent);
    } catch (error) {
      console.error("Quest zones inline data failed to parse", error);
      return null;
    }
  }

  function applyQuestZonesData(data) {
    questZonesData = data;
    renderQuestZones();
    updateZones();
  }

  function loadInlineQuestZones() {
    const inlineData = getInlineQuestZonesData();
    if (!inlineData) return false;
    applyQuestZonesData(inlineData);
    return true;
  }

  async function loadQuestZones() {
    if (loadInlineQuestZones()) return;
    try {
      const response = await fetch(QUEST_ZONES_URL);
      if (!response.ok) throw new Error("Failed to load quest zones data");
      applyQuestZonesData(await response.json());
    } catch (error) {
      console.error("Quest zones failed to load", error);
      if (typeof toast === "function") {
        toast("Quest zones are temporarily unavailable. Please refresh the page or contact support if it keeps happening.");
      }
    }
  }

  function handleQuestLoreKeydown(event) {
    const overlay = $("questLoreOverlay");
    if (!overlay || !overlay.classList.contains("show")) return;

    if (event.key === "Escape") {
      closeQuestLore();
      return;
    }

    if (event.key !== "Tab") return;
    updateQuestLoreFocusables();
    if (questLoreFocusables.length === 0) return;

    const first = questLoreFocusables[0];
    const last = questLoreFocusables[questLoreFocusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function isPointInRect(x, y, rect) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function handleQuestLoreHoverMove(event) {
    if (questLoreOpenMode !== "hover") return;
    if (!questLoreHoverTarget || !questLoreCardEl) return;

    const zoneRect = questLoreHoverTarget.getBoundingClientRect();
    const loreRect = questLoreCardEl.getBoundingClientRect();
    const isInsideZone = isPointInRect(event.clientX, event.clientY, zoneRect);
    const isInsideLore = isPointInRect(event.clientX, event.clientY, loreRect);

    if (!isInsideZone && !isInsideLore) {
      closeQuestLore();
    }
  }

  function handleQuestLoreCtaClick() {
    if (!activeQuestZoneId || !questZonesData) return;
    const zone = questZonesData.zones.find(item => item.id === activeQuestZoneId);
    if (!zone) return;
    if (state.streak < zone.unlockDays) return;
    window.location.href = `./battle-system-demo.html?zone=${encodeURIComponent(zone.id)}`;
  }

  function setupQuestLoreOverlay() {
    const closeBtn = $("questLoreClose");
    const overlay = $("questLoreOverlay");
    const ctaBtn = $("questLoreCta");
    questLoreCardEl = overlay ? overlay.querySelector(".questLoreCard") : null;

    if (closeBtn) {
      closeBtn.addEventListener("click", closeQuestLore);
    }
    if (ctaBtn) {
      ctaBtn.addEventListener("click", handleQuestLoreCtaClick);
    }
    if (overlay) {
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeQuestLore();
      });
    }
    document.addEventListener("keydown", handleQuestLoreKeydown);
    document.addEventListener("mousemove", handleQuestLoreHoverMove);
  }
  
  // Update zone unlocking based on streak milestones
  function updateZones() {
    const streakCount = state.maxStreak ?? state.streak;
    
    const updateZoneCard = (zone, zoneEl, statusEl, lockIcon) => {
      const isUnlocked = streakCount >= zone.need;
      if (isUnlocked) {
        zoneEl.classList.remove('locked');
        zoneEl.classList.add('unlocked');
        if (statusEl) {
          statusEl.classList.remove('locked');
          statusEl.classList.add('unlocked');
          statusEl.textContent = '✓ UNLOCKED!';
        }
        if (lockIcon) lockIcon.style.display = 'none';
      } else {
        zoneEl.classList.add('locked');
        zoneEl.classList.remove('unlocked');
        if (statusEl) {
          statusEl.classList.add('locked');
          statusEl.classList.remove('unlocked');
          statusEl.textContent = `🔒 Unlocks at ${zone.need} day${zone.need > 1 ? 's' : ''}`;
        }
      }
    };
    
    MAP.forEach((zone, idx) => {
      const zoneEl = $(zone.id.replace('z', 'zone'));
      if (zoneEl) {
        updateZoneCard(zone, zoneEl, zoneEl.querySelector('.zoneStatus'), zoneEl.querySelector('.lockIcon'));
      }
      const zoneIconEl = $(`zoneIcon${idx + 1}`);
      if (zoneIconEl) {
        updateZoneCard(zone, zoneIconEl, zoneIconEl.querySelector('.zoneIconStatus'), null);
      }
    });
  }

  function isZoneUnlocked(zone) {
    const streakCount = state.maxStreak ?? state.streak;
    return streakCount >= zone.need;
  }

  function handleZoneSelection(zone) {
    if (!isZoneUnlocked(zone)) {
      toast(`🔒 Locked — unlock at ${zone.need} day streak.`);
      return;
    }
    state.currentZone = zone.slug;
    if (!state.selectedParty || state.selectedParty.length !== 2) {
      state.selectedParty = COMPANIONS.slice(0, 2);
    }
    save();
    window.location.href = `battle-system-demo.html?zone=${zone.slug}`;
  }

  function setupZoneNavigation() {
    MAP.forEach((zone, idx) => {
      const zoneEl = $(zone.id.replace('z', 'zone'));
      const zoneIconEl = $(`zoneIcon${idx + 1}`);
      [zoneEl, zoneIconEl].forEach(el => {
        if (!el) return;
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => handleZoneSelection(zone));
      });
    });

    if (activeQuestZoneId) {
      const activeZone = questZonesData.zones.find(zone => zone.id === activeQuestZoneId);
      if (activeZone) updateQuestLoreStatus(activeZone);
    }
  }
  
  // Update streak milestone badges
  function updateStreakBadges() {
    const milestones = [
      { days: 3, id: 'streakBadge3' },
      { days: 5, id: 'streakBadge5' },
      { days: 7, id: 'streakBadge7' },
      { days: 10, id: 'streakBadge10' }
    ];
    
    milestones.forEach(m => {
      const badge = $(m.id);
      if (!badge) return;
      
      if (state.streak >= m.days) {
        badge.classList.add('earned');
        badge.classList.remove('locked');
      } else {
        badge.classList.add('locked');
        badge.classList.remove('earned');
      }
    });
    
    // Update next badge text
    if (state.streak < 3) $("nextBadge").textContent = "Bronze Shield (3 days)";
    else if (state.streak < 5) $("nextBadge").textContent = "Silver Sword (5 days)";
    else if (state.streak < 7) $("nextBadge").textContent = "Gold Crown (7 days)";
    else if (state.streak < 10) $("nextBadge").textContent = "Diamond Dragon (10 days)";
    else $("nextBadge").textContent = "All Milestones Earned! 🎉";
  }
  
  function updateBadges(){
    const day = state.days[TODAY];
    
    // Badge 1: Trapper Master (all backpack tasks complete)
    const backpackIds = ["t_work","t_notebooks","t_supplies","t_check"];
    const trapperMaster = backpackIds.every(id=>day.tasks[id]===true);
    const b1 = $("badge1");
    if(trapperMaster){ b1.classList.add("earned"); b1.classList.remove("locked"); }
    else{ b1.classList.add("locked"); b1.classList.remove("earned"); }
    
    // Badge 2: Perfect Day (all tasks complete)
    const perfectDay = TASKS.every(t=>day.tasks[t.id]===true);
    const b2 = $("badge2");
    if(perfectDay){ b2.classList.add("earned"); b2.classList.remove("locked"); }
    else{ b2.classList.add("locked"); b2.classList.remove("earned"); }
    
    // Badge 3: Streak Star (3+ day streak)
    const b3 = $("badge3");
    if(state.streak >= 3){ b3.classList.add("earned"); b3.classList.remove("locked"); }
    else{ b3.classList.add("locked"); b3.classList.remove("earned"); }
    
    // Badge 4: No Missing Items (morning backpack check complete)
    const noMissing = day.tasks["m_trappercheck"] === true;
    const b4 = $("badge4");
    if(noMissing){ b4.classList.add("earned"); b4.classList.remove("locked"); }
    else{ b4.classList.add("locked"); b4.classList.remove("earned"); }
    
    // Update next badge text
    if(!trapperMaster) $("nextBadge").textContent = "Trapper Master";
    else if(!noMissing) $("nextBadge").textContent = "No Missing Items";
    else if(!perfectDay) $("nextBadge").textContent = "Perfect Day";
    else if(state.streak < 3) $("nextBadge").textContent = "Streak Star";
    else $("nextBadge").textContent = "All Earned! 🎉";
  }
  
  function updateWeeklyTracker(){
    // Get current week's days (Mon-Fri)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    
    // Calculate dates for Mon-Fri of current week
    const weekDays = ["mon","tue","wed","thu","fri"];
    weekDays.forEach((dayName, idx) => {
      const dayBox = document.querySelector(`[data-day="${dayName}"]`);
      if(!dayBox) return;
      
      // Calculate date for this day (Mon=1, Tue=2, ..., Fri=5)
      const targetDay = idx + 1;
      const diff = targetDay - dayOfWeek;
      const date = new Date(today);
      date.setDate(date.getDate() + diff);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
      
      // Check if this day is PASS
      if(state.days[dateKey] && state.days[dateKey].result === "PASS"){
        dayBox.classList.add("complete");
      } else {
        dayBox.classList.remove("complete");
      }
    });
  }

  function renderTasks(){
    const day = state.days[TODAY];
    const list = $("taskList");
    list.innerHTML = "";
    TASKS.forEach(t=>{
      const row=document.createElement("div");
      row.className="task";
      row.innerHTML = `
        <input type="checkbox" ${day.tasks[t.id]?"checked":""}>
        <div class="name"></div>
        <div class="xp">+${t.xp} XP</div>
      `;
      row.querySelector(".name").textContent = t.label;

      const cb=row.querySelector("input");
      cb.addEventListener("change", ()=>{
        const was = day.tasks[t.id]===true;
        day.tasks[t.id] = cb.checked;

        if(!was && cb.checked){ 
          state.xp += t.xp; 
          addCompanionXP(Math.floor(t.xp * COMPANION_XP_SHARE));
          state.warChest += Math.floor(t.xp * WAR_CHEST_XP_RATE);
          recalcLevel(); 
          toast(`+${t.xp} XP`); 
        }
        day.result="Not graded";
        save();
        updateHeader();
        syncQuestCheckboxes();
      });

      list.appendChild(row);
    });
  }
  
  // Setup quest card checkboxes
  function setupQuestCheckboxes() {
    const day = state.days[TODAY];
    
    // For each task, find its checkbox in the quest cards
    TASKS.forEach(task => {
      const checkItem = document.querySelector(`.checkItem[data-task="${task.id}"]`);
      if (!checkItem) return;
      
      const checkbox = checkItem.querySelector('input[type="checkbox"]');
      if (!checkbox) return;
      
      // Set initial state
      checkbox.checked = day.tasks[task.id] === true;
      if (checkbox.checked) {
        checkItem.classList.add('completed');
      }
      
      // Add change handler
      checkbox.addEventListener('change', (e) => {
        const wasChecked = day.tasks[task.id] === true;
        
        // UNIVERSAL ANTI-SPAM PROTECTION FOR ALL TASKS
        // Check if already completed today (prevents check/uncheck/check exploit)
        if (checkbox.checked && isTaskCompletedToday(task.id)) {
          toast("Already done today ✅");
          checkbox.checked = true; // Keep checked
          return;
        }
        
        // MORNING MISSION-SPECIFIC TIME WINDOW CHECK
        if (task.quest === 'morning' && checkbox.checked && !wasChecked) {
          if (isBeforeMorningWindow()) {
            toast(getMissionWindowString());
            checkbox.checked = false;
            return;
          }
          if (isMorningDeadlinePassed()) {
            toast("Morning Mission closed. Try again tomorrow.");
            checkbox.checked = false;
            return;
          }
          if (!isInMorningWindow()) {
            toast(getMissionWindowString());
            checkbox.checked = false;
            return;
          }
        }
        
        day.tasks[task.id] = checkbox.checked;
        
        if (!wasChecked && checkbox.checked) {
          // Mark task as completed for today (anti-spam)
          const completedNow = markTaskCompletedToday(task.id);
          if (!completedNow) {
            // Should not happen due to check above, but safety check
            toast("Already done today ✅");
            return;
          }
          
          // Task just completed - award rewards
          let hpAwarded = 0;
          
          // Morning task HP rewards
          if (task.quest === 'morning') {
            const success = markMorningTaskCompleted(task.id);
            if (success) {
              hpAwarded = MORNING_MISSION.HP_PER_TASK;
              state.hp += hpAwarded;
              const maxHP = getMaxHP();
              if (state.hp > maxHP) state.hp = maxHP;
            }
          }
          
          state.xp += task.xp;
          addCompanionXP(Math.floor(task.xp * COMPANION_XP_SHARE));
          state.warChest += Math.floor(task.xp * WAR_CHEST_XP_RATE);
          recalcLevel();
          
          // Show floating XP animation
          const rect = checkItem.getBoundingClientRect();
          showFloatingXP(task.xp, rect.left + rect.width / 2, rect.top);
          
          // Toast with HP if morning task
          if (hpAwarded > 0) {
            toast(`+${task.xp} XP + ${hpAwarded} HP! ❤️`);
            // Check if mission complete
            checkMorningMissionStatus();
            updateMorningMissionUI();
          } else {
            toast(`+${task.xp} XP Earned!`);
          }
          
          checkItem.classList.add('completed');
        } else if (wasChecked && !checkbox.checked) {
          // Task unchecked - do NOT remove completion flag (idempotent)
          // User can uncheck visually, but won't get rewards again
          checkItem.classList.remove('completed');
        }
        
        day.result = "Not graded";
        save();
        updateHeader();
        updateQuestProgress(task.quest);
        renderTasks(); // Keep backward compat task list in sync
      });
    });
    
    // Initialize progress bars for all quests
    ['night', 'morning', 'backpack'].forEach(questType => {
      updateQuestProgress(questType);
    });
    
    // Initialize Morning Mission UI
    updateMorningMissionUI();
  }
  
  // Sync quest checkboxes with state (called from renderTasks)
  function syncQuestCheckboxes() {
    const day = state.days[TODAY];
    TASKS.forEach(task => {
      const checkItem = document.querySelector(`.checkItem[data-task="${task.id}"]`);
      if (!checkItem) return;
      
      const checkbox = checkItem.querySelector('input[type="checkbox"]');
      if (!checkbox) return;
      
      checkbox.checked = day.tasks[task.id] === true;
      if (checkbox.checked) {
        checkItem.classList.add('completed');
      } else {
        checkItem.classList.remove('completed');
      }
    });
    
    // Update progress bars
    ['night', 'morning', 'backpack'].forEach(questType => {
      updateQuestProgress(questType);
    });
  }
  
  // Update quest progress bar
  function updateQuestProgress(questType) {
    const day = state.days[TODAY];
    const questTasks = TASKS.filter(t => t.quest === questType);
    const completedCount = questTasks.filter(t => day.tasks[t.id] === true).length;
    const totalCount = questTasks.length;
    const percentage = (completedCount / totalCount) * 100;
    
    // Find the quest card
    const cardId = questType === 'night' ? 'questNight' : 
                   questType === 'morning' ? 'questMorning' : 'questBackpack';
    const card = $(cardId);
    if (!card) return;
    
    const progressText = card.querySelector('.progressText');
    const progressBar = card.querySelector('.progressBar');
    
    if (progressText) {
      progressText.textContent = `${completedCount}/${totalCount} tasks`;
    }
    if (progressBar) {
      progressBar.style.width = percentage + '%';
    }
    
    // Show quest complete celebration
    if (completedCount === totalCount && completedCount > 0) {
      // Check if we just completed it (to avoid showing multiple times)
      if (!card.dataset.celebrated) {
        card.dataset.celebrated = 'true';
        toast(`🎉 ${questType.toUpperCase()} QUEST COMPLETE!`);
        audioManager.play('task_complete_stinger');
      }
    } else {
      delete card.dataset.celebrated;
    }
  }

  function gradeDay(){
    const pass = isPassDay();
    const prevMaxStreak = state.maxStreak ?? 0;
    state.days[TODAY].result = pass ? "PASS" : "FAIL";
    state.streak = pass ? (state.streak+1) : 0;
    if (pass) {
      state.maxStreak = Math.max(prevMaxStreak, state.streak);
    }
    if (!pass) {
      const dmg = calcDamage(state.days[TODAY]);
      state.hp = Math.max(0, state.hp - dmg);
    }
    // Cap HP to new max (streak may have changed)
    const maxHP = getMaxHP();
    if (state.hp > maxHP) state.hp = maxHP;
    save();
    updateHeader();
    toast(pass ? "🎉 PASS! Streak +1" : `⚠️ FAIL. Streak reset. -${calcDamage(state.days[TODAY])} HP!`);
    if (pass) {
      audioManager.play('pass_day_stinger');
      const newlyUnlocked = MAP.filter(zone => zone.need > prevMaxStreak && zone.need <= state.maxStreak);
      newlyUnlocked.forEach(zone => {
        toast(`🎉 ${zone.title} Unlocked!`);
        audioManager.play('zone_unlock_stinger');
      });
    }
    if (!state.days[TODAY].leveledUp) {
      const xpEarned = TASKS.reduce((sum, task) => sum + (state.days[TODAY].tasks[task.id] ? task.xp : 0), 0);
      if (xpEarned > 0) {
        showXpRecap(xpEarned);
      }
    }
    if (!pass) checkLevelDown();
  }

  document.querySelectorAll("#ww .nav button").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      initAudioOnInteraction();
      audioManager.play('ui_click_confirm');
      document.querySelectorAll("#ww .nav button").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      const id = btn.dataset.section;
      const target = document.getElementById(id);
      if(target) target.scrollIntoView({behavior:"smooth", block:"start"});
    });
  });

  // Add grading and reset buttons to topbar actions
  const topbar = document.querySelector(".topbar-inner .nav");
  if(topbar){
    const gradeBtn = document.createElement("button");
    gradeBtn.textContent = "🏆 Grade";
    gradeBtn.setAttribute("aria-label", "Grade today's progress and update streak");
    gradeBtn.addEventListener("click", () => {
      initAudioOnInteraction();
      const pass = isPassDay();
      if (pass) {
        audioManager.play('ui.success');
      } else {
        audioManager.play('ui.error');
      }
      gradeDay();
    });
    topbar.appendChild(gradeBtn);
    
    const resetBtn = document.createElement("button");
    resetBtn.textContent = "🧽 Reset";
    resetBtn.setAttribute("aria-label", "Reset today's task completion");
    resetBtn.addEventListener("click", ()=>{
      initAudioOnInteraction();
      audioManager.play('ui_click_confirm');
      state.days[TODAY]={
        tasks:Object.fromEntries(TASKS.map(t=>[t.id,false])),
        result:"Not graded",
        leveledUp: false,
        taskCompletions: {}
      };
      save(); 
      renderTasks(); 
      setupQuestCheckboxes();
      updateHeader(); 
      toast("Today reset");
    });
    topbar.appendChild(resetBtn);
  }

  // War Chest Award button handlers
  document.querySelectorAll('.awardBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      initAudioOnInteraction();
      const comp = btn.dataset.award;
      if (state.warChest < WAR_CHEST_AWARD_COST) {
        audioManager.play('ui.error');
        toast('Not enough gold in the War Chest!');
        return;
      }
      audioManager.play('ui.success');
      state.warChest -= WAR_CHEST_AWARD_COST;
      addCompanionXP(WAR_CHEST_AWARD_COST, comp);
      save();
      updateHeader();
      toast(`🪙 Awarded ${WAR_CHEST_AWARD_COST} gold to ${COMPANION_NAMES[comp]}!`);
    });
  });

  // William Character Animation System
  const williamAnimations = [
    'william-jump',
    'william-spin',
    'william-shake',
    'william-flip',
    'william-wave',
    'william-pulse-glow',
    'william-bounce-rotate',
    'william-swing',
    'william-zoom',
    'william-slide',
    'william-wobble',
    'william-float-spin',
    'william-bounce-scale',
    'william-rainbow',
    'william-victory',
    // Fun animations for kids!
    'william-fire',
    'william-fart',
    'william-throw',
    'william-burp',
    'william-sneeze',
    'william-dizzy',
    'william-dance',
    'william-explode',
    // New skills!
    'william-water-balloon',
    'william-slip-out'
  ];

  function applyRandomWilliamAnimation() {
    const williamAvatar = document.getElementById('williamAvatar');
    if (!williamAvatar) return;

    // Play idle sound
    audioManager.playWilliamIdle();

    // Remove any existing animation
    williamAvatar.style.animation = 'none';
    
    // Force browser reflow to restart animation from beginning
    // This is a standard technique to retrigger CSS animations
    void williamAvatar.offsetWidth;
    
    // Pick a random animation
    const randomAnimation = williamAnimations[Math.floor(Math.random() * williamAnimations.length)];
    
    // Apply the animation (2 seconds duration)
    williamAvatar.style.animation = `${randomAnimation} 2s ease-in-out`;
    
    // Add particle effects for fun animations
    if (randomAnimation === 'william-fire') {
      createFireEffect(williamAvatar);
    } else if (randomAnimation === 'william-fart') {
      createFartEffect(williamAvatar);
    } else if (randomAnimation === 'william-throw') {
      createThrowEffect(williamAvatar);
    } else if (randomAnimation === 'william-burp') {
      createBurpEffect(williamAvatar);
    } else if (randomAnimation === 'william-sneeze') {
      createSneezeEffect(williamAvatar);
    } else if (randomAnimation === 'william-explode') {
      createExplodeEffect(williamAvatar);
    } else if (randomAnimation === 'william-water-balloon') {
      createWaterBalloonEffect(williamAvatar);
    } else if (randomAnimation === 'william-slip-out') {
      createSlipOutEffect(williamAvatar);
    }
    
    // Remove animation after it completes
    setTimeout(() => {
      if (williamAvatar) williamAvatar.style.animation = 'none';
    }, 2000);
  }
  
  // Particle effect functions
  function createFireEffect(element) {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const flame = document.createElement('div');
        flame.textContent = ['🔥', '💥', '✨'][Math.floor(Math.random() * 3)];
        flame.style.cssText = `
          position: fixed;
          left: ${rect.right}px;
          top: ${rect.top + rect.height / 2}px;
          font-size: ${20 + Math.random() * 20}px;
          pointer-events: none;
          z-index: 10000;
          animation: fireParticle 1s ease-out forwards;
        `;
        document.body.appendChild(flame);
        setTimeout(() => flame.remove(), 1000);
      }, i * 80);
    }
  }
  
  function createFartEffect(element) {
    const rect = element.getBoundingClientRect();
    const fartCloud = document.createElement('div');
    fartCloud.textContent = '💨';
    fartCloud.style.cssText = `
      position: fixed;
      left: ${rect.left - 30}px;
      top: ${rect.bottom - 40}px;
      font-size: 40px;
      pointer-events: none;
      z-index: 10000;
      animation: fartParticle 1.5s ease-out forwards;
    `;
    document.body.appendChild(fartCloud);
    
    // Add extra stink clouds
    ['💩', '💨', '😷'].forEach((emoji, i) => {
      setTimeout(() => {
        const cloud = document.createElement('div');
        cloud.textContent = emoji;
        cloud.style.cssText = `
          position: fixed;
          left: ${rect.left - 20 + Math.random() * -30}px;
          top: ${rect.bottom - 30 + Math.random() * -20}px;
          font-size: ${25 + Math.random() * 15}px;
          pointer-events: none;
          z-index: 10000;
          animation: fartParticle ${1 + Math.random()}s ease-out forwards;
        `;
        document.body.appendChild(cloud);
        setTimeout(() => cloud.remove(), 1500);
      }, i * 200);
    });
    
    setTimeout(() => fartCloud.remove(), 1500);
  }
  
  function createThrowEffect(element) {
    const rect = element.getBoundingClientRect();
    const projectiles = ['🏀', '⚾', '🎾', '🏈', '⚽', '🍕', '🍎', '🍌'];
    const projectile = document.createElement('div');
    projectile.textContent = projectiles[Math.floor(Math.random() * projectiles.length)];
    projectile.style.cssText = `
      position: fixed;
      left: ${rect.right}px;
      top: ${rect.top + rect.height / 2}px;
      font-size: 30px;
      pointer-events: none;
      z-index: 10000;
      animation: throwParticle 1.2s ease-out forwards;
    `;
    document.body.appendChild(projectile);
    setTimeout(() => projectile.remove(), 1200);
  }
  
  function createBurpEffect(element) {
    const rect = element.getBoundingClientRect();
    const burp = document.createElement('div');
    burp.textContent = '🗣️💨';
    burp.style.cssText = `
      position: fixed;
      left: ${rect.right - 10}px;
      top: ${rect.top + 20}px;
      font-size: 35px;
      pointer-events: none;
      z-index: 10000;
      animation: burpParticle 1s ease-out forwards;
    `;
    document.body.appendChild(burp);
    
    // Add burp text
    setTimeout(() => {
      const text = document.createElement('div');
      text.textContent = 'BURRRP!';
      text.style.cssText = `
        position: fixed;
        left: ${rect.right + 10}px;
        top: ${rect.top}px;
        font-size: 20px;
        font-weight: bold;
        color: #4ade80;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        pointer-events: none;
        z-index: 10000;
        animation: burpParticle 1s ease-out forwards;
      `;
      document.body.appendChild(text);
      setTimeout(() => text.remove(), 1000);
    }, 100);
    
    setTimeout(() => burp.remove(), 1000);
  }
  
  function createSneezeEffect(element) {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
      const sneeze = document.createElement('div');
      sneeze.textContent = ['💦', '💧', '🤧'][Math.floor(Math.random() * 3)];
      const randomX = 50 + Math.random() * 50;
      const randomY = 30 + Math.random() * 30;
      sneeze.style.cssText = `
        position: fixed;
        left: ${rect.right - 10}px;
        top: ${rect.top + 30}px;
        font-size: ${15 + Math.random() * 15}px;
        pointer-events: none;
        z-index: 10000;
        animation: sneezeParticle ${0.8 + Math.random() * 0.4}s ease-out forwards;
        --random-x: ${randomX}px;
        --random-y: ${randomY}px;
      `;
      // Apply random transform using custom animation
      const duration = 0.8 + Math.random() * 0.4;
      sneeze.animate([
        { transform: 'translateX(0) translateY(0) scale(1)', opacity: 1 },
        { transform: `translateX(${randomX}px) translateY(-${randomY}px) scale(0.3)`, opacity: 0 }
      ], {
        duration: duration * 1000,
        easing: 'ease-out',
        fill: 'forwards'
      });
      document.body.appendChild(sneeze);
      setTimeout(() => sneeze.remove(), 1200);
    }
    
    // Add "ACHOO!" text
    const text = document.createElement('div');
    text.textContent = 'ACHOO!';
    text.style.cssText = `
      position: fixed;
      left: ${rect.right + 10}px;
      top: ${rect.top + 20}px;
      font-size: 22px;
      font-weight: bold;
      color: #60a5fa;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      pointer-events: none;
      z-index: 10000;
    `;
    text.animate([
      { transform: 'translateY(0) scale(0.8)', opacity: 1 },
      { transform: 'translateY(-60px) scale(1.5)', opacity: 0 }
    ], {
      duration: 1000,
      easing: 'ease-out',
      fill: 'forwards'
    });
    document.body.appendChild(text);
    setTimeout(() => text.remove(), 1000);
  }
  
  function createExplodeEffect(element) {
    const rect = element.getBoundingClientRect();
    const emojis = ['💥', '⭐', '✨', '💫', '🌟', '🎆', '🎇'];
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        const angle = (Math.PI * 2 * i) / 20;
        const distance = 150;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        particle.style.cssText = `
          position: fixed;
          left: ${rect.left + rect.width / 2}px;
          top: ${rect.top + rect.height / 2}px;
          font-size: ${15 + Math.random() * 15}px;
          pointer-events: none;
          z-index: 10000;
        `;
        // Apply transform using Web Animations API for full browser support
        particle.animate([
          { transform: 'translate(0, 0) scale(1)', opacity: 1 },
          { transform: `translate(${x}px, ${y}px) scale(0.5)`, opacity: 0 }
        ], {
          duration: 1000,
          easing: 'ease-out',
          fill: 'forwards'
        });
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
      }, i * 20);
    }
  }
  
  function createWaterBalloonEffect(element) {
    const rect = element.getBoundingClientRect();
    const waterBalloon = document.createElement('div');
    waterBalloon.textContent = '💧';
    waterBalloon.style.cssText = `
      position: fixed;
      left: ${rect.right}px;
      top: ${rect.top + rect.height / 2}px;
      font-size: 40px;
      pointer-events: none;
      z-index: 10000;
      animation: waterBalloonParticle 1.5s ease-out forwards;
    `;
    document.body.appendChild(waterBalloon);
    
    // Create splash effect at the end
    setTimeout(() => {
      const splash = document.createElement('div');
      splash.textContent = '💦';
      splash.style.cssText = `
        position: fixed;
        left: ${rect.right + 200}px;
        top: ${rect.top + rect.height / 2 - 50}px;
        font-size: 50px;
        pointer-events: none;
        z-index: 10000;
        animation: waterSplash 0.6s ease-out forwards;
      `;
      document.body.appendChild(splash);
      
      // Find nearby elements and push them away from splash
      const splashX = rect.right + 200;
      const splashY = rect.top + rect.height / 2 - 50;
      
      const interactiveElements = [
        ...document.querySelectorAll('.quest-card'),
        ...document.querySelectorAll('.btn'),
        ...document.querySelectorAll('.stat-card')
      ];
      
      interactiveElements.forEach(element => {
        const elementRect = element.getBoundingClientRect();
        const elementCenterX = elementRect.left + elementRect.width / 2;
        const elementCenterY = elementRect.top + elementRect.height / 2;
        
        const distance = Math.sqrt(
          Math.pow(elementCenterX - splashX, 2) + 
          Math.pow(elementCenterY - splashY, 2)
        );
        
        // If element is within splash range
        if (distance < 200) {
          const angle = Math.atan2(elementCenterY - splashY, elementCenterX - splashX);
          const pushDistance = 20 * (1 - distance / 200);
          
          const newX = Math.cos(angle) * pushDistance;
          const newY = Math.sin(angle) * pushDistance;
          
          element.style.transition = 'transform 0.3s ease-out';
          element.style.transform = `translate(${newX}px, ${newY}px)`;
          element.style.animation = 'william-wobble 0.5s ease-in-out';
          
          setTimeout(() => {
            element.style.animation = '';
            element.style.transition = 'transform 1s ease-in-out';
            element.style.transform = 'translate(0, 0)';
          }, 500);
        }
      });
      
      setTimeout(() => splash.remove(), 600);
    }, 1050);
    
    setTimeout(() => waterBalloon.remove(), 1500);
  }
  
  function createSlipOutEffect(element) {
    // Add trail of dust clouds as William slips out
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const rect = element.getBoundingClientRect();
        const dust = document.createElement('div');
        dust.textContent = '💨';
        dust.style.cssText = `
          position: fixed;
          left: ${rect.left + (i * 30)}px;
          top: ${rect.bottom - 20}px;
          font-size: 25px;
          pointer-events: none;
          z-index: 9999;
          animation: fartParticle 1s ease-out forwards;
        `;
        document.body.appendChild(dust);
        setTimeout(() => dust.remove(), 1000);
      }, i * 200);
    }
    
    // Add "Wheee!" text
    setTimeout(() => {
      const rect = element.getBoundingClientRect();
      const text = document.createElement('div');
      text.textContent = 'Wheee!';
      text.style.cssText = `
        position: fixed;
        left: ${rect.right + 50}px;
        top: ${rect.top}px;
        font-size: 24px;
        font-weight: bold;
        color: #ffd36e;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        pointer-events: none;
        z-index: 10000;
      `;
      text.animate([
        { transform: 'translateY(0) scale(0.8)', opacity: 1 },
        { transform: 'translateY(-40px) scale(1.2)', opacity: 0 }
      ], {
        duration: 1000,
        easing: 'ease-out',
        fill: 'forwards'
      });
      document.body.appendChild(text);
      setTimeout(() => text.remove(), 1000);
    }, 400);
  }

  // William Collision Detection System
  function setupWilliamCollisionDetection() {
    const williamAvatar = document.getElementById('williamAvatar');
    if (!williamAvatar) return;
    
    // Get all interactive elements that can be bumped
    const interactiveElements = [
      ...document.querySelectorAll('.quest-card'),
      ...document.querySelectorAll('.btn'),
      ...document.querySelectorAll('.stat-card'),
      document.getElementById('weatherToggle'),
      document.getElementById('settingsToggle')
    ].filter(el => el && el !== williamAvatar);
    
    // Check for collisions periodically
    setInterval(() => {
      const williamRect = williamAvatar.getBoundingClientRect();
      
      interactiveElements.forEach(element => {
        if (!element) return;
        
        const elementRect = element.getBoundingClientRect();
        
        // Check if William is colliding with this element
        const isColliding = !(
          williamRect.right < elementRect.left ||
          williamRect.left > elementRect.right ||
          williamRect.bottom < elementRect.top ||
          williamRect.top > elementRect.bottom
        );
        
        if (isColliding) {
          // Calculate push direction based on William's position relative to element
          const williamCenterX = williamRect.left + williamRect.width / 2;
          const williamCenterY = williamRect.top + williamRect.height / 2;
          const elementCenterX = elementRect.left + elementRect.width / 2;
          const elementCenterY = elementRect.top + elementRect.height / 2;
          
          const deltaX = elementCenterX - williamCenterX;
          const deltaY = elementCenterY - williamCenterY;
          
          // Determine primary direction
          const angle = Math.atan2(deltaY, deltaX);
          const pushDistance = 10;
          
          // Apply push effect
          const currentTransform = element.style.transform || '';
          const translateMatch = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
          
          let currentX = 0, currentY = 0;
          if (translateMatch) {
            currentX = parseFloat(translateMatch[1]) || 0;
            currentY = parseFloat(translateMatch[2]) || 0;
          }
          
          const newX = currentX + Math.cos(angle) * pushDistance;
          const newY = currentY + Math.sin(angle) * pushDistance;
          
          // Apply wobble animation and translation
          element.style.transition = 'transform 0.3s ease-out';
          element.style.transform = `translate(${newX}px, ${newY}px)`;
          
          // Add wobble effect
          element.style.animation = 'william-wobble 0.5s ease-in-out';
          
          // Reset after animation
          setTimeout(() => {
            element.style.animation = '';
            element.style.transition = 'transform 1s ease-in-out';
            element.style.transform = 'translate(0, 0)';
          }, 500);
        }
      });
    }, 100);
  }

  // Weather Effects System
  const weatherContainer = document.getElementById('weatherContainer');
  const weatherLightning = document.getElementById('weatherLightning');
  const weatherToggle = document.getElementById('weatherToggle');
  const weatherMenu = document.getElementById('weatherMenu');
  let currentWeather = 'none';
  let weatherParticles = [];
  let lightningInterval = null;
  
  // Constants
  const WEATHER_STORAGE_KEY = 'williamsWorldWeather';
  const MIN_LIGHTNING_INTERVAL = 5000; // 5 seconds
  const LIGHTNING_INTERVAL_RANGE = 5000; // Additional random 0-5 seconds

  // Create rain
  function createRain() {
    clearWeather();
    const rainCount = 100;
    for (let i = 0; i < rainCount; i++) {
      const drop = document.createElement('div');
      drop.className = 'raindrop';
      drop.style.left = Math.random() * 100 + '%';
      drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
      drop.style.animationDelay = Math.random() * 2 + 's';
      weatherContainer.appendChild(drop);
      weatherParticles.push(drop);
    }
  }

  // Create snow
  function createSnow() {
    clearWeather();
    const snowCount = 50;
    const snowflakes = ['❄', '❅', '❆'];
    for (let i = 0; i < snowCount; i++) {
      const flake = document.createElement('div');
      flake.className = 'snowflake';
      flake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
      flake.style.left = Math.random() * 100 + '%';
      flake.style.fontSize = (Math.random() * 15 + 15) + 'px';
      flake.style.animationDuration = (Math.random() * 3 + 3) + 's';
      flake.style.animationDelay = Math.random() * 3 + 's';
      weatherContainer.appendChild(flake);
      weatherParticles.push(flake);
    }
  }

  // Create clouds
  function createClouds() {
    clearWeather();
    const cloudCount = 8;
    const cloudEmojis = ['☁️', '☁', '🌥'];
    for (let i = 0; i < cloudCount; i++) {
      const cloud = document.createElement('div');
      cloud.className = 'cloud';
      cloud.textContent = cloudEmojis[Math.floor(Math.random() * cloudEmojis.length)];
      cloud.style.top = (Math.random() * 40) + '%';
      cloud.style.fontSize = (Math.random() * 40 + 40) + 'px';
      cloud.style.animationDuration = (Math.random() * 20 + 20) + 's';
      cloud.style.animationDelay = Math.random() * 10 + 's';
      cloud.style.left = '-10%';
      weatherContainer.appendChild(cloud);
      weatherParticles.push(cloud);
    }
  }

  // Create storm (rain + clouds + lightning)
  function createStorm() {
    clearWeather();
    createRain();
    
    // Add some dark clouds
    const cloudCount = 5;
    for (let i = 0; i < cloudCount; i++) {
      const cloud = document.createElement('div');
      cloud.className = 'cloud';
      cloud.textContent = '☁️';
      cloud.style.top = (Math.random() * 30) + '%';
      cloud.style.fontSize = (Math.random() * 50 + 50) + 'px';
      cloud.style.animationDuration = (Math.random() * 15 + 15) + 's';
      cloud.style.animationDelay = Math.random() * 8 + 's';
      cloud.style.left = '-10%';
      cloud.style.opacity = '0.8';
      cloud.style.filter = 'brightness(0.6) drop-shadow(0 0 15px rgba(0, 0, 0, 0.5))';
      weatherContainer.appendChild(cloud);
      weatherParticles.push(cloud);
    }

    // Add lightning effect
    if (lightningInterval) clearInterval(lightningInterval);
    lightningInterval = setInterval(() => {
      if (currentWeather === 'storm') {
        weatherLightning.style.animation = 'lightning 0.4s ease-out';
        setTimeout(() => {
          weatherLightning.style.animation = '';
        }, 400);
      }
    }, MIN_LIGHTNING_INTERVAL + Math.random() * LIGHTNING_INTERVAL_RANGE);
  }

  // Clear all weather
  function clearWeather() {
    weatherParticles.forEach(particle => particle.remove());
    weatherParticles = [];
    if (lightningInterval) {
      clearInterval(lightningInterval);
      lightningInterval = null;
    }
    weatherLightning.style.animation = '';
  }

  // Set weather
  function setWeather(weather) {
    currentWeather = weather;
    
    // Update weather icon
    const weatherIcons = {
      'none': '☀️',
      'rain': '🌧️',
      'snow': '❄️',
      'clouds': '☁️',
      'storm': '⛈️'
    };
    weatherToggle.textContent = weatherIcons[weather];

    // Update active state
    document.querySelectorAll('.weatherOption').forEach(option => {
      option.classList.toggle('active', option.dataset.weather === weather);
    });

    // Apply weather effect
    switch(weather) {
      case 'rain':
        createRain();
        break;
      case 'snow':
        createSnow();
        break;
      case 'clouds':
        createClouds();
        break;
      case 'storm':
        createStorm();
        break;
      case 'none':
      default:
        clearWeather();
        break;
    }

    if (audioManager.isInitialized) {
      if (weather === 'none') {
        audioManager.stopWeatherAmbience();
        audioManager.playZoneAmbience(getZoneAmbienceEvent(state.currentZone));
      } else {
        audioManager.stopZoneAmbience();
        audioManager.playWeatherAmbience(weather);
      }
    }

    // Save to localStorage
    localStorage.setItem(WEATHER_STORAGE_KEY, weather);
  }

  function getZoneAmbienceEvent(zoneSlug) {
    return audioEventsData?.zoneAmbience?.[zoneSlug]?.event || null;
  }

  // Toggle weather menu
  weatherToggle.addEventListener('click', () => {
    weatherMenu.classList.toggle('show');
  });

  // Weather option click handlers
  document.querySelectorAll('.weatherOption').forEach(option => {
    option.addEventListener('click', () => {
      initAudioOnInteraction();
      audioManager.play('ui_click_confirm');
      const weather = option.dataset.weather;
      setWeather(weather);
      weatherMenu.classList.remove('show');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!weatherToggle.contains(e.target) && !weatherMenu.contains(e.target)) {
      weatherMenu.classList.remove('show');
    }
  });

  // Load saved weather on init
  const savedWeather = localStorage.getItem(WEATHER_STORAGE_KEY) || 'none';
  setWeather(savedWeather);

  // ============================================
  // AUDIO CONTROLS SYSTEM
  // ============================================
  
  const audioToggle = document.getElementById('audioToggle');
  const audioSettings = document.getElementById('audioSettings');
  const musicVolumeSlider = document.getElementById('musicVolume');
  const ambienceVolumeSlider = document.getElementById('ambienceVolume');
  const sfxVolumeSlider = document.getElementById('sfxVolume');
  const reduceSoundCheckbox = document.getElementById('reduceSoundMode');
  
  // Initialize audio on first user interaction
  let audioInitialized = false;
  let audioUnlocked = false;
  try {
    audioUnlocked = localStorage.getItem('williamsworld_audio_unlocked') === 'true';
  } catch (e) {
    console.warn('localStorage not available:', e);
  }
  
  function initAudioOnInteraction() {
    if (!audioInitialized) {
      audioManager.init();
      if (audioManager.isInitialized) {
        audioInitialized = true;
        audioUnlocked = true;
        try {
          localStorage.setItem('williamsworld_audio_unlocked', 'true');
        } catch (e) {
          console.warn('localStorage not available:', e);
        }
        
        const unlockEvent = audioEventsData?.autoplayPolicy?.firstGestureUnlock?.recommendedEventToPlay;
        if (unlockEvent) {
          audioManager.play(unlockEvent);
        }
        if (currentWeather === 'none') {
          audioManager.playZoneAmbience(getZoneAmbienceEvent(state.currentZone));
        } else {
          audioManager.playWeatherAmbience(currentWeather);
        }
        audioManager.playMusic(audioManager.getCurrentMusicKey());
        console.log('Audio initialized on user interaction');
      }
    }
  }
  
  // Try autoplay on load if audio was previously unlocked
  async function tryAutoplayOnLoad() {
    // Check if audio was unlocked and manager is ready (already initialized with settings loaded)
    if (audioUnlocked) {
      try {
        audioManager.init();
        if (audioManager.isInitialized && !audioManager.isMuted) {
          audioInitialized = true;
          
          // Use the playMusic method to avoid code duplication
          audioManager.playMusic(audioManager.getCurrentMusicKey());
          console.log('Hub music autoplay succeeded');
        }
      } catch (error) {
        // Autoplay blocked - will wait for user gesture
        console.log('Autoplay blocked, waiting for user gesture');
        audioInitialized = false;
      }
    }
  }
  
  // Initialize on any user interaction (required for mobile)
  document.addEventListener('click', initAudioOnInteraction, { once: true });
  document.addEventListener('touchstart', initAudioOnInteraction, { once: true });
  
  // Try autoplay after page loads
  tryAutoplayOnLoad();
  
  // Update volume display values
  function updateVolumeDisplays() {
    document.getElementById('musicVolumeValue').textContent = musicVolumeSlider.value + '%';
    document.getElementById('ambienceVolumeValue').textContent = ambienceVolumeSlider.value + '%';
    document.getElementById('sfxVolumeValue').textContent = sfxVolumeSlider.value + '%';
  }
  
  // Load saved audio settings into UI
  function loadAudioSettingsUI() {
    musicVolumeSlider.value = Math.round(audioManager.volumes.music * 100);
    ambienceVolumeSlider.value = Math.round(audioManager.volumes.ambience * 100);
    sfxVolumeSlider.value = Math.round(audioManager.volumes.sfx * 100);
    reduceSoundCheckbox.checked = audioManager.reduceSoundMode;
    updateVolumeDisplays();
    updateAudioToggleIcon();
  }
  
  // Update audio toggle icon based on mute state
  function updateAudioToggleIcon() {
    if (audioManager.isMuted) {
      audioToggle.textContent = '🔇';
      audioToggle.classList.add('muted');
    } else {
      audioToggle.textContent = '🔊';
      audioToggle.classList.remove('muted');
    }
  }
  
  // Toggle audio settings panel
  audioToggle.addEventListener('click', (e) => {
    initAudioOnInteraction();
    
    // If shift-click, toggle mute
    if (e.shiftKey) {
      audioManager.toggleMute();
      updateAudioToggleIcon();
      audioManager.play('ui.toggleOn');
      return;
    }
    
    audioSettings.classList.toggle('show');
    if (audioSettings.classList.contains('show')) {
      audioManager.play('ui.panelOpen');
    } else {
      audioManager.play('ui.panelClose');
    }
  });
  
  // Music volume slider
  musicVolumeSlider.addEventListener('input', () => {
    const value = musicVolumeSlider.value / 100;
    audioManager.setVolume('music', value);
    updateVolumeDisplays();
  });
  
  // Ambience volume slider
  ambienceVolumeSlider.addEventListener('input', () => {
    const value = ambienceVolumeSlider.value / 100;
    audioManager.setVolume('ambience', value);
    updateVolumeDisplays();
    
    // Update current weather ambience if playing
    if (currentWeather && currentWeather !== 'none') {
      audioManager.playWeatherAmbience(currentWeather);
    }
  });
  
  // SFX volume slider
  sfxVolumeSlider.addEventListener('input', () => {
    const value = sfxVolumeSlider.value / 100;
    audioManager.setVolume('sfx', value);
    updateVolumeDisplays();
    
    // Play test sound
    audioManager.play('ui_click_confirm');
  });
  
  // Reduce sound mode checkbox
  reduceSoundCheckbox.addEventListener('change', () => {
    audioManager.setReduceSoundMode(reduceSoundCheckbox.checked);
    audioManager.play('ui.toggleOn');
  });
  
  // Close audio settings when clicking outside
  document.addEventListener('click', (e) => {
    if (!audioToggle.contains(e.target) && !audioSettings.contains(e.target)) {
      if (audioSettings.classList.contains('show')) {
        audioSettings.classList.remove('show');
        audioManager.play('ui.panelClose');
      }
    }
  });
  
  // Load audio settings on init
  loadAudioSettingsUI();
  
  // Delay for autoplay check to complete before showing prompt
  const AUTOPLAY_CHECK_DELAY_MS = 500;
  setTimeout(() => {
    if (!audioInitialized) {
      toast('Tap anywhere to enable sound');
    }
  }, AUTOPLAY_CHECK_DELAY_MS);
  
  // Connect weather changes to audio
  const originalSetWeather = setWeather;
  setWeather = function(weather) {
    originalSetWeather(weather);
    
    // Play weather ambience
    if (weather === 'none') {
      audioManager.playWeatherAmbience('sunny');
    } else {
      audioManager.playWeatherAmbience(weather);
    }
  };

  // ============================================
  // WILLIAM EASTER EGG EMOTE SYSTEM
  // ============================================
  
  // Easter Egg Animations (Click-Triggered)
  const easterEggEmotes = [
    { name: 'easter-confetti-sneezus', effect: 'confettiSneeze', duration: 3000 },
    { name: 'easter-banana-slip', effect: 'bananaSlip', duration: 4000 },
    { name: 'easter-bubble-burp', effect: 'bubbleBurp', duration: 3000 },
    { name: 'easter-pie-trap', effect: 'pieTrap', duration: 3000 },
    { name: 'easter-rubber-chicken', effect: 'rubberChicken', duration: 3000 },
    { name: 'easter-hero-landing', effect: 'heroLanding', duration: 2500 },
    { name: 'easter-endless-scarf', effect: 'endlessScarf', duration: 4000 },
    { name: 'easter-frog-crown', effect: 'frogCrown', duration: 3000 },
    { name: 'easter-chipmunk-voice', effect: 'chipmunkVoice', duration: 3000 },
    { name: 'easter-marshmallow-volley', effect: 'marshmallowVolley', duration: 3000 },
    { name: 'easter-hair-tornado', effect: 'hairTornado', duration: 3500 },
    { name: 'easter-tiger-shuffle', effect: 'tigerShuffle', duration: 3000 },
    { name: 'easter-lego-step', effect: 'legoStep', duration: 3000 },
    { name: 'easter-goose-chase', effect: 'gooseChase', duration: 4000 },
    { name: 'easter-sock-chest', effect: 'sockChest', duration: 3500 }
  ];
  
  // State machine for William animations
  let williamState = {
    current: 'idle', // idle, auto-emote, easter-egg, rest
    lastEasterEgg: null,
    clickCount: 0,
    clickTimestamps: [],
    isOnCooldown: false,
    restUntil: null,
    autoEmoteTimer: null,
    nextAutoEmoteTime: null
  };
  
  // Easter Egg Particle Effects
  function createConfettiSneezeEffect(element) {
    const rect = element.getBoundingClientRect();
    const confetti = ['🎊', '🎉', '✨', '⭐', '💫'];
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.textContent = confetti[Math.floor(Math.random() * confetti.length)];
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 70;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        particle.style.cssText = `
          position: fixed;
          left: ${rect.right - 10}px;
          top: ${rect.top + 40}px;
          font-size: ${20 + Math.random() * 15}px;
          pointer-events: none;
          z-index: 10000;
        `;
        particle.animate([
          { transform: 'translate(0, 0) scale(1)', opacity: 1 },
          { transform: `translate(${x}px, ${y}px) scale(0.3) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], { duration: 1000, easing: 'ease-out', fill: 'forwards' });
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
      }, i * 30);
    }
  }
  
  function createBananaSlipEffect(element) {
    const rect = element.getBoundingClientRect();
    const banana = document.createElement('div');
    banana.textContent = '🍌';
    banana.style.cssText = `
      position: fixed;
      left: ${rect.left - 20}px;
      top: ${rect.bottom - 10}px;
      font-size: 30px;
      pointer-events: none;
      z-index: 10000;
    `;
    document.body.appendChild(banana);
    setTimeout(() => banana.remove(), 2000);
    
    // Thumbs up at the end
    setTimeout(() => {
      const thumbsUp = document.createElement('div');
      thumbsUp.textContent = '👍';
      thumbsUp.style.cssText = `
        position: fixed;
        left: ${rect.right + 10}px;
        top: ${rect.top + 20}px;
        font-size: 40px;
        pointer-events: none;
        z-index: 10000;
      `;
      thumbsUp.animate([
        { transform: 'scale(0)', opacity: 0 },
        { transform: 'scale(1.2)', opacity: 1 },
        { transform: 'scale(1)', opacity: 1 }
      ], { duration: 500, easing: 'ease-out' });
      document.body.appendChild(thumbsUp);
      setTimeout(() => thumbsUp.remove(), 1500);
    }, 3000);
  }
  
  function createBubbleBurpEffect(element) {
    const rect = element.getBoundingClientRect();
    const bubble = document.createElement('div');
    bubble.textContent = '💭';
    bubble.style.cssText = `
      position: fixed;
      left: ${rect.right}px;
      top: ${rect.top + 30}px;
      font-size: 40px;
      pointer-events: none;
      z-index: 10000;
    `;
    bubble.animate([
      { transform: 'translateY(0) scale(0.8)', opacity: 0.8 },
      { transform: 'translateY(-100px) scale(1.5)', opacity: 0 }
    ], { duration: 2000, easing: 'ease-out', fill: 'forwards' });
    document.body.appendChild(bubble);
    
    // Sparkles when it pops
    setTimeout(() => {
      const sparkles = ['✨', '⭐', '💫'];
      for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('div');
        sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
        const angle = (Math.PI * 2 * i) / 8;
        const distance = 50;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        sparkle.style.cssText = `
          position: fixed;
          left: ${rect.right}px;
          top: ${rect.top - 70}px;
          font-size: 20px;
          pointer-events: none;
          z-index: 10000;
        `;
        sparkle.animate([
          { transform: 'translate(0, 0) scale(1)', opacity: 1 },
          { transform: `translate(${x}px, ${y}px) scale(0.5)`, opacity: 0 }
        ], { duration: 600, easing: 'ease-out', fill: 'forwards' });
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 600);
      }
    }, 1800);
    setTimeout(() => bubble.remove(), 2000);
  }
  
  function createPieTrapEffect(element) {
    const rect = element.getBoundingClientRect();
    const pie = document.createElement('div');
    pie.textContent = '🥧';
    pie.style.cssText = `
      position: fixed;
      left: ${rect.right - 20}px;
      top: ${rect.top + 10}px;
      font-size: 50px;
      pointer-events: none;
      z-index: 10000;
    `;
    pie.animate([
      { transform: 'scale(0) rotate(0deg)', opacity: 0 },
      { transform: 'scale(1.5) rotate(360deg)', opacity: 1 },
      { transform: 'scale(1) rotate(360deg)', opacity: 0 }
    ], { duration: 800, easing: 'ease-out', fill: 'forwards' });
    document.body.appendChild(pie);
    setTimeout(() => pie.remove(), 800);
  }
  
  function createRubberChickenEffect(element) {
    const rect = element.getBoundingClientRect();
    const chicken = document.createElement('div');
    chicken.textContent = '🐔';
    chicken.style.cssText = `
      position: fixed;
      left: ${rect.right + 10}px;
      top: ${rect.top + 30}px;
      font-size: 40px;
      pointer-events: none;
      z-index: 10000;
    `;
    chicken.animate([
      { transform: 'translateY(20px) scale(0)', opacity: 0 },
      { transform: 'translateY(0) scale(1)', opacity: 1 },
      { transform: 'translateY(0) scale(1.1)', opacity: 1 },
      { transform: 'translateY(20px) scale(0)', opacity: 0 }
    ], { duration: 2500, easing: 'ease-in-out', fill: 'forwards' });
    document.body.appendChild(chicken);
    setTimeout(() => chicken.remove(), 2500);
  }
  
  function createHeroLandingEffect(element) {
    const rect = element.getBoundingClientRect();
    const impact = document.createElement('div');
    impact.textContent = '💥';
    impact.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width / 2 - 20}px;
      top: ${rect.bottom - 10}px;
      font-size: 40px;
      pointer-events: none;
      z-index: 10000;
    `;
    impact.animate([
      { transform: 'scale(0)', opacity: 0 },
      { transform: 'scale(1.5)', opacity: 1 },
      { transform: 'scale(0)', opacity: 0 }
    ], { duration: 600, easing: 'ease-out', fill: 'forwards' });
    document.body.appendChild(impact);
    setTimeout(() => impact.remove(), 600);
  }
  
  function createEndlessScarfEffect(element) {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const scarf = document.createElement('div');
        scarf.textContent = '🧣';
        scarf.style.cssText = `
          position: fixed;
          left: ${rect.right + (i * 15)}px;
          top: ${rect.top + 40}px;
          font-size: 25px;
          pointer-events: none;
          z-index: 10000;
        `;
        scarf.animate([
          { transform: 'translateX(0) scale(0)', opacity: 0 },
          { transform: 'translateX(0) scale(1)', opacity: 1 },
          { transform: 'translateX(0) scale(1)', opacity: 0.5 }
        ], { duration: 300, easing: 'ease-out', fill: 'forwards' });
        document.body.appendChild(scarf);
        setTimeout(() => scarf.remove(), 3000);
      }, i * 200);
    }
  }
  
  function createFrogCrownEffect(element) {
    const rect = element.getBoundingClientRect();
    const frog = document.createElement('div');
    frog.textContent = '🐸';
    frog.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width / 2 - 20}px;
      top: ${rect.top - 40}px;
      font-size: 40px;
      pointer-events: none;
      z-index: 10000;
    `;
    frog.animate([
      { transform: 'translateY(20px) scale(0)', opacity: 0 },
      { transform: 'translateY(0) scale(1)', opacity: 1 }
    ], { duration: 500, easing: 'ease-out', fill: 'forwards' });
    document.body.appendChild(frog);
    setTimeout(() => frog.remove(), 2500);
    
    // Ribbit text
    setTimeout(() => {
      const text = document.createElement('div');
      text.textContent = 'Ribbit!';
      text.style.cssText = `
        position: fixed;
        left: ${rect.right + 10}px;
        top: ${rect.top}px;
        font-size: 20px;
        font-weight: bold;
        color: #4ade80;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        pointer-events: none;
        z-index: 10000;
      `;
      text.animate([
        { transform: 'scale(0)', opacity: 0 },
        { transform: 'scale(1.2)', opacity: 1 },
        { transform: 'scale(1)', opacity: 0 }
      ], { duration: 1000, easing: 'ease-out', fill: 'forwards' });
      document.body.appendChild(text);
      setTimeout(() => text.remove(), 1000);
    }, 1000);
  }
  
  function createChipmunkVoiceEffect(element) {
    const rect = element.getBoundingClientRect();
    const notes = ['🎵', '🎶', '🎼'];
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const note = document.createElement('div');
        note.textContent = notes[Math.floor(Math.random() * notes.length)];
        note.style.cssText = `
          position: fixed;
          left: ${rect.right + (i * 10)}px;
          top: ${rect.top + 20}px;
          font-size: ${20 + Math.random() * 10}px;
          pointer-events: none;
          z-index: 10000;
        `;
        note.animate([
          { transform: 'translateY(0) scale(0.5)', opacity: 1 },
          { transform: 'translateY(-60px) scale(1)', opacity: 0 }
        ], { duration: 1500, easing: 'ease-out', fill: 'forwards' });
        document.body.appendChild(note);
        setTimeout(() => note.remove(), 1500);
      }, i * 200);
    }
  }
  
  function createMarshmallowVolleyEffect(element) {
    const rect = element.getBoundingClientRect();
    const marshmallow = document.createElement('div');
    marshmallow.textContent = '🍡';
    marshmallow.style.cssText = `
      position: fixed;
      left: ${rect.right}px;
      top: ${rect.top + rect.height / 2}px;
      font-size: 30px;
      pointer-events: none;
      z-index: 10000;
    `;
    marshmallow.animate([
      { transform: 'translateX(0) translateY(0)', opacity: 1 },
      { transform: 'translateX(150px) translateY(-60px)', opacity: 1 },
      { transform: 'translateX(0) translateY(0)', opacity: 1 }
    ], { duration: 1500, easing: 'ease-in-out', fill: 'forwards' });
    document.body.appendChild(marshmallow);
    setTimeout(() => marshmallow.remove(), 1500);
  }
  
  function createHairTornadoEffect(element) {
    const rect = element.getBoundingClientRect();
    const tornado = document.createElement('div');
    tornado.textContent = '🌪️';
    tornado.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width / 2 - 20}px;
      top: ${rect.top - 50}px;
      font-size: 50px;
      pointer-events: none;
      z-index: 10000;
    `;
    tornado.animate([
      { transform: 'scale(0) rotate(0deg)', opacity: 0 },
      { transform: 'scale(1) rotate(360deg)', opacity: 1 },
      { transform: 'scale(1) rotate(720deg)', opacity: 1 },
      { transform: 'scale(0) rotate(1080deg)', opacity: 0 }
    ], { duration: 2000, easing: 'ease-in-out', fill: 'forwards' });
    document.body.appendChild(tornado);
    setTimeout(() => tornado.remove(), 2000);
  }
  
  function createTigerShuffleEffect(element) {
    const rect = element.getBoundingClientRect();
    const pawPrints = ['🐾'];
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const paw = document.createElement('div');
        paw.textContent = pawPrints[0];
        paw.style.cssText = `
          position: fixed;
          left: ${rect.left + rect.width / 2 + (i % 2 === 0 ? -30 : 30)}px;
          top: ${rect.bottom - 20 + (i * 10)}px;
          font-size: 25px;
          pointer-events: none;
          z-index: 9999;
        `;
        paw.animate([
          { transform: 'scale(0)', opacity: 0 },
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'scale(1)', opacity: 0 }
        ], { duration: 800, easing: 'ease-out', fill: 'forwards' });
        document.body.appendChild(paw);
        setTimeout(() => paw.remove(), 800);
      }, i * 150);
    }
  }
  
  function createLegoStepEffect(element) {
    const rect = element.getBoundingClientRect();
    const lego = document.createElement('div');
    lego.textContent = '🧱';
    lego.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width / 2 - 15}px;
      top: ${rect.bottom - 10}px;
      font-size: 30px;
      pointer-events: none;
      z-index: 10000;
    `;
    document.body.appendChild(lego);
    setTimeout(() => lego.remove(), 2500);
    
    // "OUCH!" text
    const text = document.createElement('div');
    text.textContent = 'OUCH!';
    text.style.cssText = `
      position: fixed;
      left: ${rect.right + 10}px;
      top: ${rect.top}px;
      font-size: 24px;
      font-weight: bold;
      color: #ef4444;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      pointer-events: none;
      z-index: 10000;
    `;
    text.animate([
      { transform: 'scale(0)', opacity: 0 },
      { transform: 'scale(1.3)', opacity: 1 },
      { transform: 'scale(1)', opacity: 0 }
    ], { duration: 1000, easing: 'ease-out', fill: 'forwards' });
    document.body.appendChild(text);
    setTimeout(() => text.remove(), 1000);
  }
  
  function createGooseChaseEffect(element) {
    const rect = element.getBoundingClientRect();
    const goose = document.createElement('div');
    goose.textContent = '🦆';
    goose.style.cssText = `
      position: fixed;
      left: ${rect.right + 20}px;
      top: ${rect.top + rect.height / 2 - 20}px;
      font-size: 40px;
      pointer-events: none;
      z-index: 10000;
    `;
    goose.animate([
      { transform: 'translateX(0) scale(1)', opacity: 1 },
      { transform: 'translateX(-50px) scale(1.1)', opacity: 1 },
      { transform: 'translateX(0) scale(1)', opacity: 1 }
    ], { duration: 2000, easing: 'ease-in-out', fill: 'forwards' });
    document.body.appendChild(goose);
    
    // Feather at the end
    setTimeout(() => {
      const feather = document.createElement('div');
      feather.textContent = '🪶';
      feather.style.cssText = `
        position: fixed;
        left: ${rect.right + 20}px;
        top: ${rect.top + rect.height / 2 - 20}px;
        font-size: 30px;
        pointer-events: none;
        z-index: 10000;
      `;
      feather.animate([
        { transform: 'translateY(0) rotate(0deg) scale(0)', opacity: 0 },
        { transform: 'translateY(-50px) rotate(360deg) scale(1)', opacity: 1 }
      ], { duration: 1000, easing: 'ease-out', fill: 'forwards' });
      document.body.appendChild(feather);
      setTimeout(() => feather.remove(), 2000);
    }, 2500);
    
    setTimeout(() => goose.remove(), 3500);
  }
  
  function createSockChestEffect(element) {
    const rect = element.getBoundingClientRect();
    const chest = document.createElement('div');
    chest.textContent = '🧦🧦🧦';
    chest.style.cssText = `
      position: fixed;
      left: ${rect.right}px;
      top: ${rect.top + 20}px;
      font-size: 35px;
      pointer-events: none;
      z-index: 10000;
    `;
    chest.animate([
      { transform: 'translateY(20px) scale(0)', opacity: 0 },
      { transform: 'translateY(0) scale(1.2)', opacity: 1 },
      { transform: 'translateY(-10px) scale(1)', opacity: 1 }
    ], { duration: 800, easing: 'ease-out', fill: 'forwards' });
    document.body.appendChild(chest);
    setTimeout(() => chest.remove(), 2500);
  }
  
  // Call particle effect based on emote name
  function triggerEasterEggEffect(effectName, element) {
    const effects = {
      confettiSneeze: createConfettiSneezeEffect,
      bananaSlip: createBananaSlipEffect,
      bubbleBurp: createBubbleBurpEffect,
      pieTrap: createPieTrapEffect,
      rubberChicken: createRubberChickenEffect,
      heroLanding: createHeroLandingEffect,
      endlessScarf: createEndlessScarfEffect,
      frogCrown: createFrogCrownEffect,
      chipmunkVoice: createChipmunkVoiceEffect,
      marshmallowVolley: createMarshmallowVolleyEffect,
      hairTornado: createHairTornadoEffect,
      tigerShuffle: createTigerShuffleEffect,
      legoStep: createLegoStepEffect,
      gooseChase: createGooseChaseEffect,
      sockChest: createSockChestEffect
    };
    
    if (effects[effectName]) {
      effects[effectName](element);
    }
  }
  
  // Apply Easter egg emote
  function applyEasterEggEmote() {
    const williamAvatar = document.getElementById('williamAvatar');
    if (!williamAvatar || williamState.current === 'rest') return;
    
    // Get available emotes (exclude last played for no immediate repeats)
    let availableEmotes = easterEggEmotes;
    if (williamState.lastEasterEgg) {
      availableEmotes = easterEggEmotes.filter(e => e.name !== williamState.lastEasterEgg);
    }
    
    // Pick random Easter egg
    const emote = availableEmotes[Math.floor(Math.random() * availableEmotes.length)];
    williamState.lastEasterEgg = emote.name;
    williamState.current = 'easter-egg';
    
    // Remove any existing animation
    williamAvatar.style.animation = 'none';
    void williamAvatar.offsetWidth;
    
    // Apply the Easter egg animation
    williamAvatar.style.animation = `${emote.name} ${emote.duration}ms ease-in-out`;
    
    // Trigger particle effect
    triggerEasterEggEffect(emote.effect, williamAvatar);
    
    // Return to idle after animation completes
    setTimeout(() => {
      williamAvatar.style.animation = 'none';
      williamState.current = 'idle';
      
      // If auto-emote was scheduled during Easter egg, reschedule it
      if (williamState.nextAutoEmoteTime && Date.now() > williamState.nextAutoEmoteTime) {
        scheduleNextAutoEmote();
      }
    }, emote.duration);
  }
  
  // Check for anti-spam (5+ clicks in ~3 seconds)
  function checkAntiSpam() {
    const now = Date.now();
    williamState.clickTimestamps = williamState.clickTimestamps.filter(t => now - t < 3000);
    
    if (williamState.clickTimestamps.length >= 5) {
      enterRestState();
      return true;
    }
    return false;
  }
  
  // Enter rest state (60 second break)
  function enterRestState() {
    const williamAvatar = document.getElementById('williamAvatar');
    const restOverlay = document.getElementById('williamRestOverlay');
    if (!williamAvatar || !restOverlay) return;
    
    williamState.current = 'rest';
    williamState.restUntil = Date.now() + 60000; // 60 seconds
    williamState.clickTimestamps = [];
    
    // Clear auto-emote timer
    if (williamState.autoEmoteTimer) {
      clearTimeout(williamState.autoEmoteTimer);
      williamState.autoEmoteTimer = null;
    }
    
    // Apply rest animation
    williamAvatar.style.animation = 'none';
    void williamAvatar.offsetWidth;
    williamAvatar.style.animation = 'easter-rest-state 3s ease-in-out infinite';
    
    // Show rest overlay
    restOverlay.classList.add('show');
    
    // Countdown timer
    const countdownEl = document.getElementById('restCountdown');
    const countdownInterval = setInterval(() => {
      const remaining = Math.ceil((williamState.restUntil - Date.now()) / 1000);
      if (countdownEl) countdownEl.textContent = Math.max(0, remaining);
      
      if (remaining <= 0) {
        clearInterval(countdownInterval);
        exitRestState();
      }
    }, 1000);
  }
  
  // Exit rest state
  function exitRestState() {
    const williamAvatar = document.getElementById('williamAvatar');
    const restOverlay = document.getElementById('williamRestOverlay');
    if (!williamAvatar || !restOverlay) return;
    
    williamState.current = 'idle';
    williamState.restUntil = null;
    
    // Remove rest animation
    williamAvatar.style.animation = 'none';
    
    // Hide rest overlay
    restOverlay.classList.remove('show');
    
    // Resume auto-emote cycle
    scheduleNextAutoEmote();
  }
  
  // Handle William avatar click
  function handleWilliamClick() {
    initAudioOnInteraction(); // Initialize audio on first interaction
    
    if (williamState.current === 'rest') {
      // During rest, just show a tiny blink (do nothing for now)
      return;
    }
    
    // Always play tap sound first
    audioManager.playWilliamTap();
    
    // Track click for anti-spam
    williamState.clickTimestamps.push(Date.now());
    
    // Check for spam
    if (checkAntiSpam()) {
      return;
    }
    
    // Check cooldown
    if (williamState.isOnCooldown) {
      return;
    }
    
    // Play Easter egg sound
    audioManager.playWilliamEasterEgg();
    
    // Trigger Easter egg emote
    applyEasterEggEmote();
    
    // Set cooldown (1-2 seconds random)
    williamState.isOnCooldown = true;
    const cooldownDuration = 1000 + Math.random() * 1000; // 1-2 seconds
    setTimeout(() => {
      williamState.isOnCooldown = false;
    }, cooldownDuration);
  }
  
  // Schedule next auto-emote
  function scheduleNextAutoEmote() {
    // Clear existing timer
    if (williamState.autoEmoteTimer) {
      clearTimeout(williamState.autoEmoteTimer);
    }
    
    // Schedule next emote in 10 seconds
    williamState.nextAutoEmoteTime = Date.now() + 10000;
    williamState.autoEmoteTimer = setTimeout(() => {
      // Only play if not in Easter egg or rest state
      if (williamState.current === 'idle') {
        applyRandomWilliamAnimation();
      }
      
      // Schedule next one
      scheduleNextAutoEmote();
    }, 10000);
  }
  
  // Start the animation timer (every 10 seconds for Easter egg unlock window) - only if element exists
  if (document.getElementById('williamAvatar')) {
    const williamAvatar = document.getElementById('williamAvatar');
    
    // Add click handler
    williamAvatar.addEventListener('click', handleWilliamClick);
    williamAvatar.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleWilliamClick();
    });
    
    // Add glow class for affordance
    williamAvatar.classList.add('clickable-glow');
    
    // Trigger the first animation after 1 second
    setTimeout(applyRandomWilliamAnimation, 1000);
    
    // Start the 10-second cycle
    scheduleNextAutoEmote();

    // Setup collision detection after DOM is ready
    setTimeout(setupWilliamCollisionDetection, 100);
  }

  // INIT
  applyAssets();
  setupQuestLoreOverlay();
  loadQuestZones();
  renderTasks();
  setupQuestCheckboxes();
  updateHeader();
  setupZoneNavigation();
  showStoredNotice();
  
  // ============================================
  // MORNING MISSION TIMER LOOP
  // ============================================
  
  // Update timer every second, but only when needed
  let missionTimerInterval = setInterval(() => {
    const now = getChicagoTime();
    const hour = now.getHours();
    
    // Only run during relevant hours (5 AM to 9 AM for some buffer)
    if (hour >= 5 && hour <= 9) {
      if (isInMorningWindow()) {
        updateMorningMissionUI();
        checkMorningMissionStatus();
      } else if (isMorningDeadlinePassed() && hour < 9) {
        const missionState = getTodayMissionState();
        if (missionState.status !== 'completed' && missionState.status !== 'failed') {
          checkMorningMissionStatus();
        }
      }
    }
  }, 1000);
  
  // Initial status check
  // Rule 5: Null-safe call
  if (typeof checkMorningMissionStatus === 'function') {
    checkMorningMissionStatus();
  } else {
    console.warn('[FAIL-SOFT] checkMorningMissionStatus not defined');
  }
  
  } catch (error) {
    // Rule 4: Top-level error handler
    console.error('[CRITICAL] Homepage initialization failed:', error);
    console.error(error.stack);
    // Rule 6: Don't crash the page, show error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:40px;background:rgba(220,38,38,0.9);color:white;border-radius:12px;text-align:center;z-index:99999;';
    errorDiv.innerHTML = `
      <h2>⚠️ Initialization Error</h2>
      <p>Homepage could not start. Check console for details.</p>
      <button onclick="location.reload()" style="margin-top:20px;padding:10px 20px;cursor:pointer;">Refresh Page</button>
    `;
    if (document.body) {
      document.body.appendChild(errorDiv);
    }
  }
});
