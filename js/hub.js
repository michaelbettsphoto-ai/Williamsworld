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
          <h2><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Loading Error</h2>
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
  const COMPANION_EMOJIS = { ember: `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><path d="M12 2c0 4-4 6-4 10a4 4 0 0 0 8 0c0-2-1-3-2-5 0 2-2 3-2 5a2 2 0 0 1-4 0c0-3 4-5 4-10z"/></svg>`, sprite: `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z"/><path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5z"/><path d="M19 17l.5 1.5L21 19l-1.5.5L19 21l-.5-1.5L17 19l1.5-.5z"/></svg>`, golem: `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><rect x="7" y="2" width="10" height="14" rx="5"/><path d="M7 10c0 3 5 10 5 10s5-7 5-10"/><path d="M9 7h6M9 9h4"/></svg>` };
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
      'm_prayer': { color: '#dc2626', label: 'Red', icon: `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2L8 8H4l4 4-2 8 6-4 6 4-2-8 4-4h-4z"/></svg>` },      // Fire/breakfast
      'm_dressed': { color: '#22c55e', label: 'Green', icon: `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>` },   // Grass/clothes
      'm_teeth': { color: '#3b82f6', label: 'Blue', icon: `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><path d="M3 21l9-9"/><path d="M12.22 6.22L16 2.5a2.12 2.12 0 0 1 3 3L15.28 9.5"/><path d="M10 14l-1.5 1.5M14 10l-1.5 1.5"/><circle cx="16.5" cy="7.5" r="1" fill="currentColor"/></svg>` },      // Water/teeth
      'm_trappercheck': { color: '#a855f7', label: 'Purple', icon: `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M9 6V4a3 3 0 0 1 6 0v2"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>` } // Magic/backpack
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
  
  // Check if today is Saturday (6) or Sunday (0) in Chicago time — no time bomb on weekends
  function isWeekend() {
    const day = getChicagoTime().getDay(); // 0 = Sunday, 6 = Saturday
    return day === 0 || day === 6;
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
    
    return !isWeekend() && afterStart && beforeDeadline;
  }
  
  // Check if deadline has passed
  function isMorningDeadlinePassed() {
    const now = getChicagoTime();
    const hour = now.getHours();
    const min = now.getMinutes();
    
    if (isWeekend()) return false; // No deadline on weekends
    return (hour > MORNING_MISSION.DEADLINE_HOUR) || 
           (hour === MORNING_MISSION.DEADLINE_HOUR && min >= MORNING_MISSION.DEADLINE_MIN);
  }
  
  // Check if before morning window
  function isBeforeMorningWindow() {
    if (isWeekend()) return false; // No window restriction on weekends
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
    if (isWeekend()) return 'Weekend — complete the mission any time today!';
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
        // Mission / bomb / wire events
        'sfx.wireCut':          ['sfx/wire_cut'],
        'sfx.bombTick':         ['sfx/bomb_tick'],
        'sfx.bombDisarmed':     ['sfx/bomb_disarmed'],
        'sfx.bombExploded':     ['sfx/bomb_exploded'],
        'sfx.missionComplete':  ['sfx/mission_complete'],
        'sfx.missionFailed':    ['sfx/mission_failed'],
        // Progression events
        'sfx.xpEarn':           ['sfx/xp_earn'],
        'sfx.hpGain':           ['sfx/hp_gain'],
        'sfx.hpLoss':           ['sfx/hp_loss'],
        'sfx.goldEarn':         ['sfx/gold_earn'],
        'sfx.goldSpend':        ['sfx/gold_spend'],
        'sfx.streakBonus':      ['sfx/streak_bonus'],
        'sfx.levelDown':        ['sfx/level_down'],
        'sfx.zoneEnter':        ['sfx/zone_enter'],
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
      console.log(this.isMuted ? '[MUTED] Audio muted' : '[ON] Audio unmuted');
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
  // Expose globally so inline onclicks and external scripts can reach it
  window.audioManager = audioManager;

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
    el.innerHTML=msg;
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
      if (audioManager.isInitialized) audioManager.play('sfx.streakBonus');
      toast(`<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.8 11.3L2 22l10.7-3.79M4 3h.01M22 8h.01M15 2h.01M22 20h.01M22 2l-2.24 2.24M4 20l2.24-2.24"/><path d="M15 2c-1 3-4 6-7 8M22 8c-3 1-6 4-8 7"/><circle cx="14" cy="14" r="3"/></svg> Mission Complete! +${MORNING_MISSION.HP_COMPLETION_BONUS} HP + Streak +${MORNING_MISSION.STREAK_BONUS_HP} HP!`);
    } else {
      toast(`<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.8 11.3L2 22l10.7-3.79M4 3h.01M22 8h.01M15 2h.01M22 20h.01M22 2l-2.24 2.24M4 20l2.24-2.24"/><path d="M15 2c-1 3-4 6-7 8M22 8c-3 1-6 4-8 7"/><circle cx="14" cy="14" r="3"/></svg> Morning Mission Complete! +${MORNING_MISSION.HP_COMPLETION_BONUS} HP`);
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
    
    if (isWeekend()) {
      return; // No failure on weekends — no time bomb on Saturday or Sunday
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
    if (rewardEmoji) rewardEmoji.innerHTML = COMPANION_EMOJIS[companion];
    
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
        rewardPower.innerHTML = `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> New Power Unlocked! <svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
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
      toast(`<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="10" r="7"/><path d="M9 21h6M10 17v4M14 17v4M9 13a1 1 0 1 0 2 0 1 1 0 0 0-2 0M13 13a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/></svg> LEVEL DOWN! Dropped to Level ${state.level}: ${getLevelTitle(state.level)}`);
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
    if (window.williamCard) williamCard.levelUp();
    
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
    // Weekend overrides everything — no bomb, no failure shown
    if (isWeekend()) {
      timerEl.style.display = 'none';
      statusBanner.style.display = 'block';
      statusBanner.className = 'missionStatusBanner weekend';
      statusBanner.innerHTML = `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="2" y1="18" x2="4" y2="18"/><line x1="20" y1="18" x2="22" y2="18"/><line x1="19.78" y1="10.22" x2="18.36" y2="11.64"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/></svg> Weekend — no deadline today! Take your time.`;
      bombVisual.style.display = 'none';
    } else if (missionState.status === 'completed') {
      timerEl.style.display = 'none';
      statusBanner.style.display = 'block';
      statusBanner.className = 'missionStatusBanner success';
      statusBanner.innerHTML = `<svg class='ww-icon' width='20' height='20' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M5.8 11.3L2 22l10.7-3.79M4 3h.01M22 8h.01M15 2h.01M22 20h.01M22 2l-2.24 2.24M4 20l2.24-2.24'/><path d='M15 2c-1 3-4 6-7 8M22 8c-3 1-6 4-8 7'/><circle cx='14' cy='14' r='3'/></svg> Morning Mission Complete!`;
      bombVisual.innerHTML = '<div class="bombDisarmed"><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" stroke="none"/></svg> DISARMED</div>';
      bombVisual.className = 'bombVisual disarmed';
      if (audioManager.isInitialized) audioManager.play('sfx.bombDisarmed');
    } else if (missionState.status === 'failed') {
      timerEl.style.display = 'none';
      statusBanner.style.display = 'block';
      statusBanner.className = 'missionStatusBanner failed';
      const missedTasks = morningTaskIds.filter(id => !missionState.completedTasks[id])
        .map(id => TASKS.find(t => t.id === id).label.replace('Morning: ', ''))
        .join(', ');
      statusBanner.innerHTML = `<svg class='ww-icon' width='20' height='20' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true' ><path d='M13 2L3 14h8l-2 8 12-12h-8z'/></svg> Morning Mission Failed<br><span class="small">You missed: ${missedTasks}</span>`;
      bombVisual.innerHTML = '<div class="bombExploded"><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><path d="M13 2L3 14h8l-2 8 12-12h-8z"/></svg> BOOM!</div>';
      bombVisual.className = 'bombVisual exploded';
      if (audioManager.isInitialized) audioManager.play('sfx.bombExploded');
    } else if (isWeekend()) {
      // Weekend — hide the bomb UI entirely, just show the checklist
      timerEl.style.display = 'none';
      statusBanner.style.display = 'block';
      statusBanner.className = 'missionStatusBanner weekend';
      statusBanner.innerHTML = `<svg class='ww-icon' width='20' height='20' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M17 18a5 5 0 0 0-10 0'/><line x1='12' y1='2' x2='12' y2='9'/><line x1='4.22' y1='10.22' x2='5.64' y2='11.64'/><line x1='2' y1='18' x2='4' y2='18'/><line x1='20' y1='18' x2='22' y2='18'/><line x1='19.78' y1='10.22' x2='18.36' y2='11.64'/><line x1='23' y1='22' x2='1' y2='22'/><polyline points='8 6 12 2 16 6'/></svg> Weekend — no deadline today! Take your time.`;
      bombVisual.style.display = 'none';
    } else if (isBeforeMorningWindow()) {
      timerEl.style.display = 'block';
      timerEl.className = 'missionTimer locked';
      timerEl.innerHTML = `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><rect x="5" y="11" width="14" height="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg> Opens at 6:00 AM`;
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
      timerEl.innerHTML = `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Time Left: <strong>${formatted}</strong><br><span class="deadline">Mission ends at ${MORNING_MISSION.DEADLINE_HOUR}:00 AM</span>`;
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
      
      wireBadge.innerHTML = wireColor.icon;
      wireBadge.style.background = wireColor.color;
      wireBadge.title = `${wireColor.label} wire`;
      
      if (isMorningTaskCompletedToday(taskId)) {
        wireBadge.classList.add('cut');
        if (audioManager.isInitialized) audioManager.play('sfx.wireCut');
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
    bomb.innerHTML = `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><circle cx="11" cy="13" r="7"/><path d="M14.35 5.65L17 3M17 3l2-2M17 3l-2-2"/><path d="M16 8l2-2"/></svg>`;
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
    if (audioManager.isInitialized) audioManager.play('sfx.missionComplete');
    const overlay = document.createElement('div');
    overlay.className = 'missionOverlay success';
    overlay.innerHTML = `
      <div class="missionOverlayContent">
        <div class="williamHero"><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><path d="M12 2a3 3 0 0 1 3 3v1l3 2v3l-3 1v1a3 3 0 0 1-6 0v-1l-3-1V8l3-2V5a3 3 0 0 1 3-3z"/><path d="M9 21l3-8 3 8"/></svg></div>
        <h2>Morning Mission Complete!</h2>
        <div class="missionStats">
          <div><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> All tasks complete before deadline</div>
          <div><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" stroke="none"/></svg> +${MORNING_MISSION.HP_COMPLETION_BONUS} HP Bonus</div>
          <div><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2c0 4-4 6-4 10a4 4 0 0 0 8 0c0-2-1-3-2-5 0 2-2 3-2 5a2 2 0 0 1-4 0c0-3 4-5 4-10z"/></svg> Streak: ${state.morningMission.streak} days</div>
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
    if (audioManager.isInitialized) audioManager.play('sfx.missionFailed');
    const overlay = document.createElement('div');
    overlay.className = 'missionOverlay failed';
    
    const morningTaskIds = TASKS.filter(t => t.quest === 'morning').map(t => t.id);
    const missionState = getTodayMissionState();
    const missedTasks = morningTaskIds.filter(id => !missionState.completedTasks[id])
      .map(id => TASKS.find(t => t.id === id).label.replace('Morning: ', ''));
    
    overlay.innerHTML = `
      <div class="missionOverlayContent">
        <div class="williamSooty"><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9" stroke-width="3"/><line x1="15" y1="9" x2="15.01" y2="9" stroke-width="3"/><path d="M17 6l3-2"/></svg></div>
        <h2>Morning Mission Failed</h2>
        <div class="missionStats">
          <div><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Deadline passed at ${MORNING_MISSION.DEADLINE_HOUR}:00 AM</div>
          <div><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><rect x="9" y="2" width="6" height="4" rx="1"/><rect x="4" y="4" width="16" height="18" rx="2"/><path d="M8 12h8M8 16h5"/></svg> You missed: ${missedTasks.join(', ')}</div>
          <div><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Try again tomorrow!</div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Smoke puffs
    for (let i = 0; i < MORNING_MISSION.SMOKE_PUFF_COUNT; i++) {
      setTimeout(() => {
        const smoke = document.createElement('div');
        smoke.className = 'smoke';
        smoke.innerHTML = `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><path d="M9 7c1.1 0 2 .9 2 2s-.9 2-2 2H2"/><path d="M12 4c1.7 0 3 1.3 3 3s-1.3 3-3 3H2"/><path d="M10 17c1.1 0 2 .9 2 2s-.9 2-2 2H2"/></svg>`;
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

  // Midnight check: auto-grade any past ungraded days.
  // PASS if all tasks complete, FAIL otherwise — same logic as the Grade button.
  function midnightCheck() {
    let totalDamage = 0;
    let anyAutoGraded = false;
    const sortedKeys = Object.keys(state.days).sort();
    sortedKeys.forEach(dateKey => {
      if (dateKey >= TODAY) return; // skip today and future
      const day = state.days[dateKey];
      if (day.result === "Not graded") {
        anyAutoGraded = true;
        // Determine pass/fail using the same criteria as the Grade button
        const nightIds = ["n_trapper","n_clothes","n_lunch","n_shoes"];
        const nightOk = nightIds.every(id => day.tasks[id] === true);
        const trapperCheckOk = day.tasks["m_trappercheck"] === true;
        const passed = nightOk && trapperCheckOk;
        day.result = passed ? "PASS" : "FAIL";
        if (passed) {
          const prevMaxStreak = state.maxStreak ?? 0;
          state.streak = (state.streak || 0) + 1;
          state.maxStreak = Math.max(prevMaxStreak, state.streak);
        } else {
          const dmg = calcDamage(day);
          totalDamage += dmg;
          state.streak = 0;
        }
      }
    });
    if (anyAutoGraded) {
      if (totalDamage > 0) {
        state.hp = Math.max(0, state.hp - totalDamage);
        const maxHP = getMaxHP();
        if (state.hp > maxHP) state.hp = maxHP;
      }
      save();
      if (totalDamage > 0) {
        setTimeout(() => {
          toast(`<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="10" r="7"/><path d="M9 21h6M10 17v4M14 17v4M9 13a1 1 0 1 0 2 0 1 1 0 0 0-2 0M13 13a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/></svg> Auto-graded: -${totalDamage} HP for missed tasks`);
          checkLevelDown();
        }, 500);
      }
    }
  }
  midnightCheck();

  // ── Live midnight auto-grade ──────────────────────────────────────────────
  // If the app is left open overnight, schedule gradeDay() to fire automatically
  // at the next midnight (Chicago time) and then every 24 hours after that.
  (function scheduleMidnightAutoGrade() {
    function msUntilMidnight() {
      const now = getChicagoTime ? getChicagoTime() : new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0); // next midnight
      return midnight - now;
    }
    function runAtMidnight() {
      // Auto-grade today if not yet graded
      if (state.days[TODAY] && state.days[TODAY].result === 'Not graded') {
        gradeDay();
        updateHeader();
        toast('<svg class=\"ww-icon\" width=\"20\" height=\"20\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z\"/></svg> Auto-graded at midnight!');
      }
      // Schedule again for the following midnight
      setTimeout(runAtMidnight, msUntilMidnight());
    }
    setTimeout(runAtMidnight, msUntilMidnight());
  })();

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
      if (classEl) classEl.innerHTML = `${COMPANION_EMOJIS[comp]} ${COMPANION_CLASSES[comp]}`;
      
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
    lockIcon.innerHTML = `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><rect x="5" y="11" width="14" height="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>`;
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
    if (openMode === "click" && audioManager.isInitialized) audioManager.play('ui.panelOpen');

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
    if (audioManager.isInitialized) audioManager.play('ui.panelClose');
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
    window.location.href = `./battle.html?zone=${encodeURIComponent(zone.id)}`;
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
          statusEl.innerHTML = `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg> Unlocks at ${zone.need} day${zone.need > 1 ? 's' : ''}`;
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
      toast(`<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg> Locked — unlock at ${zone.need} day streak.`);
      return;
    }
    state.currentZone = zone.slug;
    if (!state.selectedParty || state.selectedParty.length !== 2) {
      state.selectedParty = COMPANIONS.slice(0, 2);
    }
    if (audioManager.isInitialized) audioManager.play('sfx.zoneEnter');
    save();
    window.location.href = `./battle.html?zone=${zone.slug}`;
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
    else $("nextBadge").textContent = "All Milestones Earned! ★";
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
    else $("nextBadge").textContent = "All Earned! ★";
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
          toast("Already done today ✓");
          checkbox.checked = true; // Keep checked
          return;
        }
        
        // MORNING MISSION-SPECIFIC TIME WINDOW CHECK
        // On weekends there is no time restriction — mission can be completed any time.
        if (task.quest === 'morning' && checkbox.checked && !wasChecked && !isWeekend()) {
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
            toast("Already done today ✓");
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
              if (audioManager.isInitialized) audioManager.play('sfx.hpGain');
            }
          }
          
          state.xp += task.xp;
          addCompanionXP(Math.floor(task.xp * COMPANION_XP_SHARE));
          state.warChest += Math.floor(task.xp * WAR_CHEST_XP_RATE);
          if (audioManager.isInitialized) audioManager.play('sfx.xpEarn');
          recalcLevel();
          
          // Show floating XP animation
          const rect = checkItem.getBoundingClientRect();
          showFloatingXP(task.xp, rect.left + rect.width / 2, rect.top);
          
          // Card deck reaction on task complete
          if (window.williamCard) williamCard.celebrate();

          // Toast with HP if morning task
          if (hpAwarded > 0) {
            toast(`+${task.xp} XP + ${hpAwarded} HP! <svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" stroke="none"/></svg>`);
            // Check if mission complete
            checkMorningMissionStatus();
            updateMorningMissionUI();
          } else {
            toast(`+${task.xp} XP Earned!`);
          }
          
          checkItem.classList.add('completed');
          
          // Screen Time reward hook — award minutes for task + quest completion
          if (window.ScreenTime && typeof window.ScreenTime.onTaskChecked === 'function') {
            window.ScreenTime.onTaskChecked(task.id);
          }
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
        toast(`<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.8 11.3L2 22l10.7-3.79M4 3h.01M22 8h.01M15 2h.01M22 20h.01M22 2l-2.24 2.24M4 20l2.24-2.24"/><path d="M15 2c-1 3-4 6-7 8M22 8c-3 1-6 4-8 7"/><circle cx="14" cy="14" r="3"/></svg> ${questType.toUpperCase()} QUEST COMPLETE!`);
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
      if (window.williamCard) williamCard.hurt();
    }
    // Cap HP to new max (streak may have changed)
    const maxHP = getMaxHP();
    if (state.hp > maxHP) state.hp = maxHP;
    save();
    updateHeader();
    toast(pass ? "<svg class='ww-icon' width='20' height='20' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M5.8 11.3L2 22l10.7-3.79M4 3h.01M22 8h.01M15 2h.01M22 20h.01M22 2l-2.24 2.24M4 20l2.24-2.24'/><path d='M15 2c-1 3-4 6-7 8M22 8c-3 1-6 4-8 7'/><circle cx='14' cy='14' r='3'/></svg> PASS! Streak +1" : `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> FAIL. Streak reset. -${calcDamage(state.days[TODAY])} HP!`);
    if (pass) {
      audioManager.play('pass_day_stinger');
    if (window.williamCard) williamCard.celebrate();
      const newlyUnlocked = MAP.filter(zone => zone.need > prevMaxStreak && zone.need <= state.maxStreak);
      newlyUnlocked.forEach(zone => {
        toast(`<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.8 11.3L2 22l10.7-3.79M4 3h.01M22 8h.01M15 2h.01M22 20h.01M22 2l-2.24 2.24M4 20l2.24-2.24"/><path d="M15 2c-1 3-4 6-7 8M22 8c-3 1-6 4-8 7"/><circle cx="14" cy="14" r="3"/></svg> ${zone.title} Unlocked!`);
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

  // Initialize audio on first user interaction (required for mobile autoplay policy)
  function initAudioOnInteraction() {
    if (audioManager.isInitialized) return;
    audioManager.init();
    // Start background music after init
    setTimeout(() => {
      if (audioManager.isInitialized) {
        audioManager.playMusic(audioManager.getCurrentMusicKey());
      }
    }, 150);
  }

  document.querySelectorAll("#ww .nav button").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      initAudioOnInteraction();
      audioManager.play('ui_click_confirm');
      document.querySelectorAll("#ww .nav button").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      // Navigate to external page (Games / Battle)
      const href = btn.dataset.navHref;
      if (href) { window.location.href = href; return; }
      // Scroll to section (Home / Tracker / Party / Map)
      const id = btn.dataset.section;
      const target = document.getElementById(id);
      if(target) target.scrollIntoView({behavior:"smooth", block:"start"});
    });
  });

  // Add grading and reset buttons to topbar actions
  const topbar = document.querySelector(".topbar-inner .nav");
  if(topbar){
    const gradeBtn = document.createElement("button");
    gradeBtn.innerHTML = `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><path d="M6 2h12v6a6 6 0 0 1-12 0V2z"/><path d="M6 5H2v2a4 4 0 0 0 4 4M18 5h4v2a4 4 0 0 1-4 4"/><path d="M12 14v4M8 18h8"/></svg> Grade`;
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
    resetBtn.innerHTML = `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><rect x="4" y="6" width="16" height="12" rx="3"/><path d="M4 12h16M9 6V4M15 6V4"/></svg> Reset`;
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
      audioManager.play('sfx.goldSpend');
      state.warChest -= WAR_CHEST_AWARD_COST;
      addCompanionXP(WAR_CHEST_AWARD_COST, comp);
      save();
      updateHeader();
      toast(`<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9.5c0-1.4 1.3-2.5 3-2.5s3 1.1 3 2.5c0 1.4-1.3 2.5-3 2.5s-3 1.1-3 2.5 1.3 2.5 3 2.5 3-1.1 3-2.5"/></svg> Awarded ${WAR_CHEST_AWARD_COST} gold to ${COMPANION_NAMES[comp]}!`);
    });
  });

  // ============================================
  // AUDIO TOGGLE & SETTINGS PANEL
  // ============================================
  (function wireAudioUI() {
    const audioToggleEl   = document.getElementById('audioToggle');
    const audioSettingsEl = document.getElementById('audioSettings');
    const musicSlider     = document.getElementById('musicVolume');
    const ambienceSlider  = document.getElementById('ambienceVolume');
    const sfxSlider       = document.getElementById('sfxVolume');
    const musicValEl      = document.getElementById('musicVolumeValue');
    const ambienceValEl   = document.getElementById('ambienceVolumeValue');
    const sfxValEl        = document.getElementById('sfxVolumeValue');
    const reduceCheckbox  = document.getElementById('reduceSoundMode');

    // Sync slider UI to current audioManager state
    function syncAudioUI() {
      if (musicSlider) {
        const pct = Math.round(audioManager.volumes.music * 100);
        musicSlider.value = pct;
        if (musicValEl) musicValEl.textContent = pct + '%';
      }
      if (ambienceSlider) {
        const pct = Math.round(audioManager.volumes.ambience * 100);
        ambienceSlider.value = pct;
        if (ambienceValEl) ambienceValEl.textContent = pct + '%';
      }
      if (sfxSlider) {
        const pct = Math.round(audioManager.volumes.sfx * 100);
        sfxSlider.value = pct;
        if (sfxValEl) sfxValEl.textContent = pct + '%';
      }
      if (reduceCheckbox) reduceCheckbox.checked = audioManager.reduceSoundMode;
    }

    // Update toggle button visual to reflect mute state
    function updateMuteVisual() {
      if (!audioToggleEl) return;
      audioToggleEl.classList.toggle('muted', audioManager.isMuted);
      audioToggleEl.title = audioManager.isMuted
        ? 'Audio Muted — click to open settings'
        : 'Enable Sound / Audio Settings';
    }

    // Open / close the settings panel
    if (audioToggleEl && audioSettingsEl) {
      audioToggleEl.addEventListener('click', () => {
        initAudioOnInteraction();
        const isOpen = audioSettingsEl.classList.contains('show');
        if (isOpen) {
          audioSettingsEl.classList.remove('show');
          audioManager.play('ui.panelClose');
        } else {
          syncAudioUI();
          audioSettingsEl.classList.add('show');
          audioManager.play('ui.panelOpen');
          // Close weather menu if open
          const wMenu = document.getElementById('weatherMenu');
          if (wMenu) wMenu.classList.remove('show');
        }
      });

      // Right-click to toggle global mute (quick access)
      audioToggleEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        initAudioOnInteraction();
        audioManager.toggleMute();
        updateMuteVisual();
      });
    }

    // Close settings panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!audioSettingsEl) return;
      if (audioSettingsEl.classList.contains('show') &&
          !audioSettingsEl.contains(e.target) &&
          e.target !== audioToggleEl) {
        audioSettingsEl.classList.remove('show');
      }
    });

    // Volume sliders
    if (musicSlider) {
      musicSlider.addEventListener('input', () => {
        initAudioOnInteraction();
        audioManager.setVolume('music', parseInt(musicSlider.value) / 100);
        if (musicValEl) musicValEl.textContent = musicSlider.value + '%';
      });
    }
    if (ambienceSlider) {
      ambienceSlider.addEventListener('input', () => {
        initAudioOnInteraction();
        audioManager.setVolume('ambience', parseInt(ambienceSlider.value) / 100);
        if (ambienceValEl) ambienceValEl.textContent = ambienceSlider.value + '%';
      });
    }
    if (sfxSlider) {
      sfxSlider.addEventListener('input', () => {
        initAudioOnInteraction();
        audioManager.setVolume('sfx', parseInt(sfxSlider.value) / 100);
        if (sfxValEl) sfxValEl.textContent = sfxSlider.value + '%';
      });
    }

    // Reduce Sound Mode checkbox
    if (reduceCheckbox) {
      reduceCheckbox.addEventListener('change', () => {
        initAudioOnInteraction();
        audioManager.setReduceSoundMode(reduceCheckbox.checked);
      });
    }
  })();

  // ============================================
  // WEATHER TOGGLE & MENU
  // ============================================
  (function wireWeatherUI() {
    const weatherToggleEl = document.getElementById('weatherToggle');
    const weatherMenuEl   = document.getElementById('weatherMenu');
    if (!weatherToggleEl || !weatherMenuEl) return;

    weatherToggleEl.addEventListener('click', () => {
      initAudioOnInteraction();
      const isOpen = weatherMenuEl.classList.contains('show');
      if (isOpen) {
        weatherMenuEl.classList.remove('show');
      } else {
        weatherMenuEl.classList.add('show');
        audioManager.play('ui.panelOpen');
        // Close audio settings if open
        const aSettings = document.getElementById('audioSettings');
        if (aSettings) aSettings.classList.remove('show');
      }
    });

    document.querySelectorAll('.weatherOption').forEach(opt => {
      opt.addEventListener('click', () => {
        initAudioOnInteraction();
        const weather = opt.dataset.weather;
        // Update active visual
        document.querySelectorAll('.weatherOption').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        // Apply weather sound
        if (weather === 'none') {
          audioManager.stopWeatherAmbience();
        } else {
          audioManager.playWeatherAmbience(weather);
        }
        audioManager.play('ui.tabChange');
        weatherMenuEl.classList.remove('show');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (weatherMenuEl.classList.contains('show') &&
          !weatherMenuEl.contains(e.target) &&
          e.target !== weatherToggleEl) {
        weatherMenuEl.classList.remove('show');
      }
    });
  })();

  // William Character Animation System
  // ============================================
  // WILLIAM CARD DECK SYSTEM
  // ============================================
  const WILLIAM_CARDS = [
    { id: 'ready',     src: 'assets/images/william-card-ready.png',     label: 'WILLIAM — Ready',     rarity: 'common' },
    { id: 'battle',    src: 'assets/images/william-card-battle.png',    label: 'WILLIAM EX — Battle', rarity: 'rare' },
    { id: 'victory',   src: 'assets/images/william-card-victory.png',   label: 'WILLIAM ★ — Victory', rarity: 'holo' },
    { id: 'scholar',   src: 'assets/images/william-card-scholar.png',   label: 'WILLIAM Scholar',     rarity: 'uncommon' },
    { id: 'rest',      src: 'assets/images/william-card-rest.png',      label: 'WILLIAM ZZZ',         rarity: 'common' },
    { id: 'legendary', src: 'assets/images/william-card-legendary.png', label: 'WILLIAM V-MAX ✦',     rarity: 'secret' },
  ];

  let wcDeckState = {
    currentIndex: 0,
    isFlipping: false,
    flipCount: 0,
  };

  function wcGetNextCard() {
    // Weighted random: legendary is rarer
    const weights = [30, 20, 20, 15, 10, 5]; // ready, battle, victory, scholar, rest, legendary
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        // Don't repeat same card
        if (i === wcDeckState.currentIndex && WILLIAM_CARDS.length > 1) {
          return (i + 1) % WILLIAM_CARDS.length;
        }
        return i;
      }
    }
    return 0;
  }

  function wcFlipToCard(cardIndex, opts = {}) {
    const activeCard = document.getElementById('williamActiveCard');
    const frontImg = document.getElementById('williamCardFront');
    if (!activeCard || !frontImg) return;
    if (wcDeckState.isFlipping) return;

    wcDeckState.isFlipping = true;
    wcDeckState.flipCount++;

    const card = WILLIAM_CARDS[cardIndex];

    // Play card sound
    if (window.audioManager && audioManager.isInitialized) {
      if (card.rarity === 'secret') {
        audioManager.play('hero_level_up_fanfare');
      } else if (card.rarity === 'holo' || card.rarity === 'rare') {
        audioManager.play('ui_click_confirm');
      } else {
        audioManager.play('ui_click_soft');
      }
    }

    // Spawn sparkles for rare cards
    if (card.rarity !== 'common') {
      wcSpawnSparkles(activeCard, card.rarity);
    }

    // Add ripple
    wcAddRipple(activeCard);

    // Start flip — show back
    activeCard.classList.add('flipping');

    setTimeout(() => {
      // Mid-flip: swap front image
      frontImg.src = card.src;
      wcDeckState.currentIndex = cardIndex;
    }, 275);

    setTimeout(() => {
      // Complete flip — show front
      activeCard.classList.remove('flipping');
      wcDeckState.isFlipping = false;

      // Legendary gets extra glow
      if (card.rarity === 'secret') {
        const deck = document.getElementById('williamCardDeck');
        if (deck) {
          deck.classList.add('card-levelup');
          setTimeout(() => deck.classList.remove('card-levelup'), 1200);
        }
      }
    }, 600);
  }

  function wcAddRipple(el) {
    const ripple = document.createElement('div');
    ripple.className = 'wcard-tap-ripple';
    ripple.style.cssText = 'width:40px;height:40px;left:50%;top:50%;margin:-20px 0 0 -20px;';
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  function wcSpawnSparkles(el, rarity) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const emojis = rarity === 'secret'
      ? ['✦','★','✧','✶','◈','✸']
      : rarity === 'holo' || rarity === 'rare'
      ? ['✦','★','✧','✶']
      : ['✦','✧'];
    const count = rarity === 'secret' ? 12 : rarity === 'rare' || rarity === 'holo' ? 7 : 4;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const sp = document.createElement('div');
        sp.className = 'wcard-sparkle';
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const dist = 60 + Math.random() * 80;
        sp.style.cssText = `left:${cx}px;top:${cy}px;--dx:${Math.cos(angle)*dist}px;--dy:${Math.sin(angle)*dist}px;`;
        sp.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        document.body.appendChild(sp);
        setTimeout(() => sp.remove(), 900);
      }, i * 40);
    }
  }

  // Public API for game events to trigger card reactions
  window.williamCard = {
    celebrate() {
      const deck = document.getElementById('williamCardDeck');
      if (!deck) return;
      deck.classList.remove('card-celebrate');
      void deck.offsetWidth;
      deck.classList.add('card-celebrate');
      setTimeout(() => deck.classList.remove('card-celebrate'), 700);
      // Flip to victory card occasionally
      if (Math.random() < 0.4) {
        setTimeout(() => wcFlipToCard(2), 300); // victory
      }
    },
    hurt() {
      const deck = document.getElementById('williamCardDeck');
      if (!deck) return;
      deck.classList.remove('card-hurt');
      void deck.offsetWidth;
      deck.classList.add('card-hurt');
      setTimeout(() => deck.classList.remove('card-hurt'), 500);
    },
    levelUp() {
      const deck = document.getElementById('williamCardDeck');
      if (!deck) return;
      deck.classList.add('card-levelup');
      setTimeout(() => deck.classList.remove('card-levelup'), 1200);
      // Flip to legendary or battle card
      const idx = Math.random() < 0.3 ? 5 : 1; // legendary or battle
      setTimeout(() => wcFlipToCard(idx), 400);
    },
    battle() { wcFlipToCard(1); },
    rest()    { wcFlipToCard(4); },
    study()   { wcFlipToCard(3); },
    ready()   { wcFlipToCard(0); },
  };

  // Init card deck click handler
  if (document.getElementById('williamCardDeck')) {
    const deck = document.getElementById('williamCardDeck');

    function handleCardClick(e) {
      e.stopPropagation();
      if (wcDeckState.isFlipping) return;
      const nextIdx = wcGetNextCard();
      wcFlipToCard(nextIdx);
    }

    deck.addEventListener('click', handleCardClick);
    deck.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleCardClick(e);
    });

    // Show hint briefly then fade
    const hint = document.getElementById('williamCardHint');
    if (hint) {
      setTimeout(() => { hint.style.opacity = '0'; hint.style.transition = 'opacity 1s'; }, 4000);
    }
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

  // ============================================================
  // HIGH SCORE SYSTEM — All Three Missions
  // Records earliest completion time per mission.
  // Breaking the record triggers fireworks + +15 screen time.
  // ============================================================
  (function initHighScores() {
    const HS_KEY = 'ww_highscores';

    // Quest definitions
    const QUESTS = [
      {
        id: 'night',
        label: 'Win Tomorrow Tonight',
        taskIds: ['n_trapper','n_clothes','n_lunch','n_shoes'],
        btnId: 'nightHighScoreBtn',
        modalId: 'nightHighScoreModal',
        closeId: 'nightHighScoreClose',
        recordId: 'nightHsRecordDisplay',
        historyId: 'nightHsHistoryList',
        cardId: 'questNight',
        emoji: '<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
      },
      {
        id: 'morning',
        label: 'Ready for School',
        taskIds: ['m_prayer','m_dressed','m_teeth','m_trappercheck'],
        btnId: 'morningHighScoreBtn',
        modalId: 'morningHighScoreModal',
        closeId: 'morningHighScoreClose',
        recordId: 'morningHsRecordDisplay',
        historyId: 'morningHsHistoryList',
        cardId: 'questMorning',
        emoji: '<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
      },
      {
        id: 'backpack',
        label: 'Trapper Ready',
        taskIds: ['t_work','t_notebooks','t_supplies','t_check'],
        btnId: 'backpackHighScoreBtn',
        modalId: 'backpackHighScoreModal',
        closeId: 'backpackHighScoreClose',
        recordId: 'backpackHsRecordDisplay',
        historyId: 'backpackHsHistoryList',
        cardId: 'questBackpack',
        emoji: '★'
      }
    ];

    // Load/save high score data
    function loadHS() {
      try { return JSON.parse(localStorage.getItem(HS_KEY)) || {}; } catch { return {}; }
    }
    function saveHS(data) {
      localStorage.setItem(HS_KEY, JSON.stringify(data));
    }

    // Format a timestamp as HH:MM AM/PM (Chicago time)
    function formatTime(ts) {
      if (!ts) return '--';
      const d = new Date(ts);
      const options = { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Chicago' };
      return d.toLocaleTimeString('en-US', options);
    }

    // Format a date key as readable string
    function formatDate(dateKey) {
      if (!dateKey) return '--';
      const [y, m, d] = dateKey.split('-').map(Number);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[m-1]} ${d}, ${y}`;
    }

    // Launch fireworks overlay
    function showFireworks(questLabel) {
      const overlay = document.createElement('div');
      overlay.className = 'fireworksOverlay';
      overlay.innerHTML = `
        <div class="fireworksMsg"><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg> NEW RECORD! <svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg></div>
        <div class="fireworksSubMsg">${questLabel} — Fastest ever!<br>+15 bonus screen time awarded!</div>
      `;
      document.body.appendChild(overlay);

      // Burst particles
      const colors = ['#ffd36e','#7dffb4','#ff9d5c','#a78bfa','#f472b6','#60a5fa'];
      for (let i = 0; i < 60; i++) {
        setTimeout(() => {
          const p = document.createElement('div');
          p.className = 'fireworkParticle';
          const angle = Math.random() * 360;
          const dist = 80 + Math.random() * 220;
          const tx = Math.cos(angle * Math.PI / 180) * dist;
          const ty = Math.sin(angle * Math.PI / 180) * dist;
          p.style.cssText = `
            left: ${20 + Math.random() * 60}%;
            top: ${20 + Math.random() * 60}%;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            --tx: ${tx}px; --ty: ${ty}px;
          `;
          overlay.appendChild(p);
          setTimeout(() => p.remove(), 1300);
        }, i * 30);
      }

      setTimeout(() => overlay.remove(), 4000);
    }

    // Check if a quest was just completed and record the time
    function checkQuestHighScore(quest) {
      // Read tasks from localStorage (state is scoped inside hub.js IIFE)
      let dayTasks = null;
      try {
        const raw = localStorage.getItem('williams_world_embed_state_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          dayTasks = parsed.days?.[TODAY]?.tasks || null;
        }
      } catch (_) {}
      if (!dayTasks) return;

      // All tasks for this quest must be done
      const allDone = quest.taskIds.every(id => dayTasks[id] === true);
      if (!allDone) return;

      const hs = loadHS();
      if (!hs[quest.id]) hs[quest.id] = { record: null, recordDate: null, history: [] };
      const entry = hs[quest.id];

      // Avoid recording the same day twice
      if (entry.history.some(h => h.date === TODAY)) return;

      const now = Date.now();
      const todayEntry = { date: TODAY, time: now, isRecord: false };

      // Compare with existing record (earlier time = better score)
      const isNewRecord = !entry.record || now < entry.record;

      if (isNewRecord) {
        entry.record = now;
        entry.recordDate = TODAY;
        todayEntry.isRecord = true;
        // Mark all previous history entries as non-record
        entry.history.forEach(h => h.isRecord = false);
        // Award +15 screen time bonus
        if (window.ScreenTime && typeof window.ScreenTime.addMinutes === 'function') {
          window.ScreenTime.addMinutes(15, 'New High Score! <svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2h12v6a6 6 0 0 1-12 0V2z"/><path d="M6 5H2v2a4 4 0 0 0 4 4M18 5h4v2a4 4 0 0 1-4 4"/><path d="M12 14v4M8 18h8"/></svg>');
        }
        showFireworks(quest.label);
        setTimeout(() => toast(`<svg class='ww-icon' width='20' height='20' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M6 2h12v6a6 6 0 0 1-12 0V2z'/><path d='M6 5H2v2a4 4 0 0 0 4 4M18 5h4v2a4 4 0 0 1-4 4'/><path d='M12 14v4M8 18h8'/></svg> NEW RECORD! ${quest.emoji} ${quest.label} — fastest ever! +15 min screen time!`), 500);
      }

      entry.history.unshift(todayEntry);
      // Keep last 30 entries
      if (entry.history.length > 30) entry.history = entry.history.slice(0, 30);

      saveHS(hs);

      // Refresh modal if open
      const modal = document.getElementById(quest.modalId);
      if (modal && modal.style.display !== 'none') {
        renderModal(quest);
      }
    }

    // Render the high score modal content
    function renderModal(quest) {
      const hs = loadHS();
      const entry = hs[quest.id] || { record: null, recordDate: null, history: [] };

      const recordEl = document.getElementById(quest.recordId);
      const histEl = document.getElementById(quest.historyId);
      if (!recordEl || !histEl) return;

      // Record display
      if (entry.record) {
        recordEl.innerHTML = `
          <div class="hsRecordLabel"><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2h12v6a6 6 0 0 1-12 0V2z"/><path d="M6 5H2v2a4 4 0 0 0 4 4M18 5h4v2a4 4 0 0 1-4 4"/><path d="M12 14v4M8 18h8"/></svg> All-Time Best Completion Time</div>
          <span class="hsRecordTime">${formatTime(entry.record)}</span>
          <div class="hsRecordDate">Set on ${formatDate(entry.recordDate)}</div>
        `;
      } else {
        recordEl.innerHTML = `<div class="hsNoRecord">No record yet — complete the mission to set one!</div>`;
      }

      // History list
      if (entry.history.length === 0) {
        histEl.innerHTML = `<div class="hsNoRecord">No completions recorded yet.</div>`;
      } else {
        histEl.innerHTML = entry.history.map(h => `
          <div class="hsHistoryItem ${h.isRecord ? 'record' : ''}">
            <span class="hsDate">${formatDate(h.date)}</span>
            <span class="hsTime">${formatTime(h.time)}</span>
            ${h.isRecord ? '<span class="hsBadge"><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2h12v6a6 6 0 0 1-12 0V2z"/><path d="M6 5H2v2a4 4 0 0 0 4 4M18 5h4v2a4 4 0 0 1-4 4"/><path d="M12 14v4M8 18h8"/></svg> Record</span>' : ''}
          </div>
        `).join('');
      }
    }

    // Wire up buttons and modals for each quest
    QUESTS.forEach(quest => {
      // High Score button opens modal
      const btn = document.getElementById(quest.btnId);
      const modal = document.getElementById(quest.modalId);
      const closeBtn = document.getElementById(quest.closeId);

      if (btn && modal) {
        btn.addEventListener('click', () => {
          initAudioOnInteraction();
          renderModal(quest);
          modal.style.display = 'flex';
          audioManager.play('ui.panelOpen');
        });
      }
      if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
          modal.style.display = 'none';
          audioManager.play('ui.panelClose');
        });
      }
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.style.display = 'none';
            audioManager.play('ui.panelClose');
          }
        });
      }

      // Hook into quest progress: check high score whenever a task is checked
      const card = document.getElementById(quest.cardId);
      if (card) {
        card.querySelectorAll('input[type="checkbox"]').forEach(cb => {
          cb.addEventListener('change', () => {
            if (cb.checked) setTimeout(() => checkQuestHighScore(quest), 100);
          });
        });
      }
    });

    // Expose checkQuestHighScore globally so ScreenTime module can call it
    window.QuestHighScore = { checkQuestHighScore, QUESTS };

    // On load, check if any quest was already completed today (e.g. after page reload)
    QUESTS.forEach(quest => checkQuestHighScore(quest));
  })();

  } catch (error) {
    // Rule 4: Top-level error handler
    console.error('[CRITICAL] Homepage initialization failed:', error);
    console.error(error.stack);
    // Rule 6: Don't crash the page, show error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:40px;background:rgba(220,38,38,0.9);color:white;border-radius:12px;text-align:center;z-index:99999;';
    errorDiv.innerHTML = `
      <h2><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Initialization Error</h2>
      <p>Homepage could not start. Check console for details.</p>
      <button onclick="location.reload()" style="margin-top:20px;padding:10px 20px;cursor:pointer;">Refresh Page</button>
    `;
    if (document.body) {
      document.body.appendChild(errorDiv);
    }
  }
});
