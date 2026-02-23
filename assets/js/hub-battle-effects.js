// ============================================
// HUB BATTLE EFFECTS — Ported from battle.html
// Adds particle bursts, screen flashes, float text,
// XP orbs, confetti, and sound to the William card deck
// ============================================
(function() {
  'use strict';

  // ─── CARD TYPE → ELEMENT COLOUR MAP ───
  const CARD_ELEMENT_COLORS = {
    ready:     '#ffd36e',   // gold
    battle:    '#ef4444',   // fire red
    victory:   '#fbbf24',   // bright gold
    scholar:   '#a78bfa',   // psychic purple
    rest:      '#60a5fa',   // water blue
    legendary: '#ffffff',   // white/rainbow
  };

  const CARD_ELEMENT_SOUNDS = {
    ready:     'ui_click_soft',
    battle:    'sfx.attackHeavy',
    victory:   'sfx.victory',
    scholar:   'sfx.abilityMagic',
    rest:      'ui_click_soft',
    legendary: 'hero_level_up_fanfare',
  };

  // ─── SCREEN FLASH ───
  function hubScreenFlash(color = 'rgba(255,211,110,0.4)') {
    const flash = document.createElement('div');
    flash.className = 'hub-screen-flash';
    flash.style.background = color;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 400);
  }

  // ─── ELEMENT PARTICLE BURST ───
  function hubSpawnElementParticles(x, y, color, count = 14) {
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'hub-element-particle';
      p.style.background = color;
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.width = (5 + Math.random() * 5) + 'px';
      p.style.height = p.style.width;
      const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.6);
      const dist = 40 + Math.random() * 70;
      p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      p.style.animationDuration = (0.5 + Math.random() * 0.4) + 's';
      p.style.animationDelay = (Math.random() * 0.1) + 's';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1000);
    }
  }

  // ─── FLOAT TEXT ───
  function hubSpawnFloatText(x, y, text, type) {
    const ft = document.createElement('div');
    ft.className = `hub-float-text ${type}`;
    ft.textContent = text;
    ft.style.left = (x - 40 + Math.random() * 20 - 10) + 'px';
    ft.style.top = y + 'px';
    document.body.appendChild(ft);
    setTimeout(() => ft.remove(), 1600);
  }

  // ─── XP ORBS ───
  function hubSpawnXPOrbs(fromEl, count = 5) {
    if (!fromEl) return;
    const rect = fromEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < count; i++) {
      const orb = document.createElement('div');
      orb.className = 'hub-xp-orb';
      orb.style.left = (cx + (Math.random() * 30 - 15)) + 'px';
      orb.style.top = cy + 'px';
      orb.style.transition = `all ${0.8 + Math.random() * 0.5}s cubic-bezier(0.4, 0, 0.2, 1)`;
      document.body.appendChild(orb);
      setTimeout(() => {
        orb.style.top = '-20px';
        orb.style.left = (window.innerWidth / 2) + 'px';
        orb.style.opacity = '0';
      }, 50 + i * 80);
      setTimeout(() => orb.remove(), 2000);
    }
  }

  // ─── CONFETTI ───
  function hubSpawnConfetti(count = 60) {
    const colors = ['#ffd36e', '#ef4444', '#3b82f6', '#22c55e', '#a78bfa', '#ff9d5c', '#06b6d4'];
    for (let i = 0; i < count; i++) {
      const c = document.createElement('div');
      c.className = 'hub-confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.top = '-10px';
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      c.style.width = (4 + Math.random() * 8) + 'px';
      c.style.height = (4 + Math.random() * 8) + 'px';
      c.style.animationDuration = (2 + Math.random() * 3) + 's';
      c.style.animationDelay = Math.random() * 1 + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 6000);
    }
  }

  // ─── BACKGROUND PARTICLES (ambient) ───
  function hubCreateAmbientParticles() {
    const container = document.getElementById('hub-particles');
    if (!container) return;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'hub-particle';
      const size = 2 + Math.random() * 5;
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${40 + Math.random() * 55}%;
        width: ${size}px;
        height: ${size}px;
        animation-delay: ${Math.random() * 6}s;
        animation-duration: ${4 + Math.random() * 4}s;
        opacity: ${0.1 + Math.random() * 0.3};
      `;
      container.appendChild(p);
    }
  }

  // ─── PLAY SOUND VIA HUB AUDIO MANAGER ───
  function hubPlaySound(key) {
    try {
      if (window.audioManager && audioManager.isInitialized) {
        audioManager.play(key);
      }
    } catch(e) {}
  }

  // ─── SYNTHESIZED SOUNDS VIA WEB AUDIO ───
  function hubSynth(type) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const master = ctx.createGain();
      master.connect(ctx.destination);

      if (type === 'card_flip_common') {
        // Soft whoosh + landing click
        const noise = ctx.createBufferSource();
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        noise.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 0.8;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.18, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        noise.connect(filter); filter.connect(g); g.connect(master);
        noise.start();
        // Click at end
        const osc = ctx.createOscillator();
        const og = ctx.createGain();
        osc.frequency.value = 800;
        og.gain.setValueAtTime(0.12, ctx.currentTime + 0.12);
        og.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.connect(og); og.connect(master);
        osc.start(ctx.currentTime + 0.12);
        osc.stop(ctx.currentTime + 0.18);
        setTimeout(() => ctx.close(), 300);

      } else if (type === 'card_flip_rare') {
        // Magical shimmer whoosh
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const g = ctx.createGain();
        osc1.type = 'sine'; osc1.frequency.setValueAtTime(600, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);
        osc2.type = 'sine'; osc2.frequency.setValueAtTime(900, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.25);
        g.gain.setValueAtTime(0.12, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc1.connect(g); osc2.connect(g); g.connect(master);
        osc1.start(); osc2.start();
        osc1.stop(ctx.currentTime + 0.4); osc2.stop(ctx.currentTime + 0.4);
        // Sparkle notes
        [1200, 1600, 2000, 2400].forEach((freq, i) => {
          const sp = ctx.createOscillator();
          const sg = ctx.createGain();
          sp.type = 'sine'; sp.frequency.value = freq;
          sg.gain.setValueAtTime(0, ctx.currentTime + 0.1 + i * 0.04);
          sg.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.12 + i * 0.04);
          sg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25 + i * 0.04);
          sp.connect(sg); sg.connect(master);
          sp.start(ctx.currentTime + 0.1 + i * 0.04);
          sp.stop(ctx.currentTime + 0.3 + i * 0.04);
        });
        setTimeout(() => ctx.close(), 600);

      } else if (type === 'card_flip_legendary') {
        // Epic power chord + shimmer
        const freqs = [220, 330, 440, 550, 660];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sawtooth'; osc.frequency.value = freq;
          g.gain.setValueAtTime(0, ctx.currentTime + i * 0.02);
          g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.05 + i * 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
          osc.connect(g); g.connect(master);
          osc.start(ctx.currentTime + i * 0.02);
          osc.stop(ctx.currentTime + 0.8);
        });
        // Rising sweep
        const sweep = ctx.createOscillator();
        const sg = ctx.createGain();
        sweep.type = 'sine';
        sweep.frequency.setValueAtTime(200, ctx.currentTime);
        sweep.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.5);
        sg.gain.setValueAtTime(0.15, ctx.currentTime);
        sg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        sweep.connect(sg); sg.connect(master);
        sweep.start(); sweep.stop(ctx.currentTime + 0.5);
        setTimeout(() => ctx.close(), 1000);

      } else if (type === 'xp_orb') {
        // Ascending sparkle tones
        [800, 1000, 1200, 1500, 1800].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine'; osc.frequency.value = freq;
          g.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
          g.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.03 + i * 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15 + i * 0.08);
          osc.connect(g); g.connect(master);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + 0.2 + i * 0.08);
        });
        setTimeout(() => ctx.close(), 800);

      } else if (type === 'hit') {
        // Impact thud
        const noise = ctx.createBufferSource();
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.3));
        noise.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.value = 300;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.4, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        noise.connect(filter); filter.connect(g); g.connect(master);
        noise.start();
        setTimeout(() => ctx.close(), 200);

      } else if (type === 'heal') {
        // Soft ascending chime
        [523, 659, 784, 1047].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine'; osc.frequency.value = freq;
          g.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
          g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.03 + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4 + i * 0.1);
          osc.connect(g); g.connect(master);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + 0.5 + i * 0.1);
        });
        setTimeout(() => ctx.close(), 800);

      } else if (type === 'confetti') {
        // Quick fanfare burst
        const notes = [523, 659, 784, 1047, 1319];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'square'; osc.frequency.value = freq;
          g.gain.setValueAtTime(0, ctx.currentTime + i * 0.06);
          g.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.02 + i * 0.06);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2 + i * 0.06);
          osc.connect(g); g.connect(master);
          osc.start(ctx.currentTime + i * 0.06);
          osc.stop(ctx.currentTime + 0.25 + i * 0.06);
        });
        setTimeout(() => ctx.close(), 600);
      }
    } catch(e) {}
  }

  // ─── CARD REACTION CLASS HELPER ───
  function addCardClass(el, cls, duration) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), duration);
  }

  // ─── GET CARD DECK CENTER COORDS ───
  function getCardCenter() {
    const card = document.getElementById('williamActiveCard');
    if (!card) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const rect = card.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  // ─── ENHANCED CARD FLIP WITH EFFECTS ───
  // Patch the existing wcFlipToCard to add effects
  const _origFlip = window.wcFlipToCard;
  if (typeof _origFlip === 'function') {
    window.wcFlipToCard = function(cardIndex, opts) {
      // Call original
      _origFlip(cardIndex, opts);

      const WILLIAM_CARDS = window.WILLIAM_CARDS;
      if (!WILLIAM_CARDS) return;
      const card = WILLIAM_CARDS[cardIndex];
      if (!card) return;

      const { x, y } = getCardCenter();
      const color = CARD_ELEMENT_COLORS[card.id] || '#ffd36e';

      // Particle burst
      setTimeout(() => {
        hubSpawnElementParticles(x, y, color, card.rarity === 'secret' ? 22 : card.rarity === 'rare' || card.rarity === 'holo' ? 16 : 10);
      }, 280);

      // Screen flash for rare+
      if (card.rarity === 'secret') {
        setTimeout(() => hubScreenFlash('rgba(255,255,255,0.3)'), 280);
        hubSynth('card_flip_legendary');
      } else if (card.rarity === 'rare' || card.rarity === 'holo') {
        setTimeout(() => hubScreenFlash(color.replace(')', ',0.2)').replace('rgb', 'rgba')), 280);
        hubSynth('card_flip_rare');
      } else {
        hubSynth('card_flip_common');
      }
    };
    console.log('[HubBattleEffects] wcFlipToCard patched with effects');
  }

  // ─── ENHANCED williamCard API WITH EFFECTS ───
  // Extend the existing williamCard object
  document.addEventListener('DOMContentLoaded', () => {
    // Wait for williamCard to be defined
    const waitForCard = setInterval(() => {
      if (!window.williamCard) return;
      clearInterval(waitForCard);

      const _origCelebrate = window.williamCard.celebrate;
      const _origHurt = window.williamCard.hurt;
      const _origLevelUp = window.williamCard.levelUp;

      window.williamCard.celebrate = function() {
        _origCelebrate.call(this);
        const { x, y } = getCardCenter();
        hubSpawnElementParticles(x, y, '#ffd36e', 12);
        hubSpawnXPOrbs(document.getElementById('williamActiveCard'), 5);
        hubSpawnFloatText(x, y - 60, '+XP ✦', 'xp');
        hubSynth('xp_orb');
      };

      window.williamCard.hurt = function() {
        _origHurt.call(this);
        const { x, y } = getCardCenter();
        hubSpawnElementParticles(x, y, '#ef4444', 10);
        hubSpawnFloatText(x, y - 40, '💥 HIT!', 'damage');
        const activeCard = document.getElementById('williamActiveCard');
        addCardClass(activeCard, 'card-hit-flash', 400);
        hubSynth('hit');
      };

      window.williamCard.levelUp = function() {
        _origLevelUp.call(this);
        const { x, y } = getCardCenter();
        hubSpawnElementParticles(x, y, '#ffd36e', 20);
        hubScreenFlash('rgba(255,211,110,0.25)');
        hubSpawnFloatText(x, y - 80, '⭐ LEVEL UP!', 'levelup');
        hubSpawnConfetti(40);
        hubSynth('card_flip_legendary');
      };

      // New: mission complete effect
      window.williamCard.missionComplete = function() {
        const { x, y } = getCardCenter();
        hubSpawnElementParticles(x, y, '#ffd36e', 20);
        hubScreenFlash('rgba(255,211,110,0.3)');
        hubSpawnFloatText(x, y - 80, '🎯 MISSION COMPLETE!', 'mission');
        hubSpawnConfetti(60);
        hubSynth('confetti');
        // Flip to victory card
        if (typeof wcFlipToCard === 'function') {
          setTimeout(() => wcFlipToCard(2), 400);
        }
      };

      // New: mission failed effect
      window.williamCard.missionFailed = function() {
        const { x, y } = getCardCenter();
        hubSpawnElementParticles(x, y, '#ef4444', 14);
        hubScreenFlash('rgba(239,68,68,0.2)');
        hubSpawnFloatText(x, y - 60, '💀 MISSION FAILED', 'ko');
        const activeCard = document.getElementById('williamActiveCard');
        addCardClass(activeCard, 'card-hit-flash', 400);
        hubSynth('hit');
      };

      // New: heal effect
      window.williamCard.heal = function(amount) {
        const { x, y } = getCardCenter();
        hubSpawnElementParticles(x, y, '#7dffb4', 10);
        hubSpawnFloatText(x, y - 50, `+${amount || ''} HP ❤️`, 'heal');
        const activeCard = document.getElementById('williamActiveCard');
        addCardClass(activeCard, 'card-heal', 900);
        hubSynth('heal');
      };

      // New: pass day effect
      window.williamCard.passDay = function() {
        const { x, y } = getCardCenter();
        hubSpawnElementParticles(x, y, '#ffd36e', 16);
        hubScreenFlash('rgba(255,211,110,0.2)');
        hubSpawnFloatText(x, y - 70, '🎉 PASS! +Streak', 'mission');
        hubSpawnConfetti(50);
        hubSynth('confetti');
      };

      // New: fail day effect
      window.williamCard.failDay = function() {
        const { x, y } = getCardCenter();
        hubSpawnElementParticles(x, y, '#ef4444', 14);
        hubScreenFlash('rgba(239,68,68,0.25)');
        hubSpawnFloatText(x, y - 60, '⚠️ FAIL! -HP', 'damage');
        hubSynth('hit');
      };

      // Enable idle aura
      const deck = document.getElementById('williamCardDeck');
      if (deck) deck.classList.add('card-aura');

      console.log('[HubBattleEffects] williamCard API extended with battle effects');
    }, 100);

    // Init ambient particles
    hubCreateAmbientParticles();
  });

  // ─── EXPOSE HELPERS GLOBALLY ───
  window.hubBattleEffects = {
    screenFlash: hubScreenFlash,
    spawnParticles: hubSpawnElementParticles,
    spawnFloatText: hubSpawnFloatText,
    spawnXPOrbs: hubSpawnXPOrbs,
    spawnConfetti: hubSpawnConfetti,
    synth: hubSynth,
  };

})();
