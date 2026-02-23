/**
 * William's World — Game Sound Engine v2
 * Rich, expressive synthesized sound effects for all games.
 * Uses Web Audio API — no external files needed.
 * Theme music is handled separately and NOT touched here.
 */

(function(global) {
  'use strict';

  let _ctx = null;
  let _masterGain = null;
  let _enabled = true;

  function getCtx() {
    if (!_ctx) {
      try {
        _ctx = new (window.AudioContext || window.webkitAudioContext)();
        _masterGain = _ctx.createGain();
        _masterGain.gain.value = 0.65;
        _masterGain.connect(_ctx.destination);
      } catch(e) { return null; }
    }
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  }

  function enabled() { return _enabled; }
  function setEnabled(v) { _enabled = !!v; }
  function setVolume(v) { if (_masterGain) _masterGain.gain.value = Math.max(0, Math.min(1, v)); }

  // ─── Low-level helpers ────────────────────────────────────────────────────

  /** Create an oscillator with full ADSR envelope */
  function osc(ctx, type, freq, t0, attack, decay, sustain, release, gainPeak) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    // ADSR
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gainPeak, t0 + attack);
    g.gain.linearRampToValueAtTime(gainPeak * sustain, t0 + attack + decay);
    g.gain.setValueAtTime(gainPeak * sustain, t0 + attack + decay);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay + release);
    o.connect(g);
    g.connect(_masterGain);
    o.start(t0);
    o.stop(t0 + attack + decay + release + 0.05);
    return o;
  }

  /** Simple one-shot oscillator (legacy-compatible) */
  function oscSimple(ctx, type, freq, t0, duration, gainPeak) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(gainPeak, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    o.connect(g);
    g.connect(_masterGain);
    o.start(t0);
    o.stop(t0 + duration + 0.05);
    return o;
  }

  /** Noise burst with optional bandpass filter */
  function noiseBurst(ctx, t0, duration, gainPeak, loFreq, hiFreq) {
    const bufSize = Math.ceil(ctx.sampleRate * (duration + 0.05));
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gainPeak, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    if (loFreq && hiFreq) {
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.value = (loFreq + hiFreq) / 2;
      bpf.Q.value = (loFreq + hiFreq) / (2 * (hiFreq - loFreq));
      src.connect(bpf);
      bpf.connect(g);
    } else {
      src.connect(g);
    }
    g.connect(_masterGain);
    src.start(t0);
    src.stop(t0 + duration + 0.05);
  }

  /** Frequency sweep helper */
  function freqSweep(oscNode, fromFreq, toFreq, t0, t1) {
    oscNode.frequency.setValueAtTime(fromFreq, t0);
    oscNode.frequency.linearRampToValueAtTime(toFreq, t1);
  }

  /** Exponential frequency sweep (more natural) */
  function freqSweepExp(oscNode, fromFreq, toFreq, t0, t1) {
    oscNode.frequency.setValueAtTime(fromFreq, t0);
    oscNode.frequency.exponentialRampToValueAtTime(Math.max(toFreq, 0.01), t1);
  }

  /** FM synthesis — modulate an oscillator's frequency */
  function fmOsc(ctx, carrierFreq, modFreq, modDepth, t0, duration, gainPeak) {
    const carrier = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const modGain = ctx.createGain();
    const g = ctx.createGain();
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(carrierFreq, t0);
    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(modFreq, t0);
    modGain.gain.setValueAtTime(modDepth, t0);
    modGain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    g.gain.setValueAtTime(gainPeak, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    carrier.connect(g);
    g.connect(_masterGain);
    modulator.start(t0); modulator.stop(t0 + duration + 0.05);
    carrier.start(t0); carrier.stop(t0 + duration + 0.05);
    return carrier;
  }

  /** Reverb-like delay echo */
  function echo(ctx, t0, fn, delayTime, feedback, gainScale) {
    fn(ctx, t0);
    if (feedback > 0.05) {
      setTimeout(() => {
        try {
          const ctx2 = getCtx();
          if (ctx2) fn(ctx2, ctx2.currentTime, gainScale * 0.4);
        } catch(e) {}
      }, delayTime * 1000);
    }
  }

  function play(fn) {
    if (!_enabled) return;
    const ctx = getCtx();
    if (!ctx) return;
    try { fn(ctx, ctx.currentTime); } catch(e) { console.warn('Sound error:', e); }
  }

  // ─── SNAKE sounds ─────────────────────────────────────────────────────────
  // Fantasy RPG: eating a magic orb, slithering, dramatic death

  const snake = {
    eat() {
      play((ctx, t) => {
        // Magical "chomp" — FM bell-like pop with sparkle
        fmOsc(ctx, 520, 260, 400, t, 0.18, 0.55);
        fmOsc(ctx, 780, 390, 200, t + 0.02, 0.14, 0.35);
        // Sparkle overtone
        const sp = oscSimple(ctx, 'sine', 2093, t + 0.04, 0.12, 0.20);
        freqSweepExp(sp, 2093, 3136, t + 0.04, t + 0.10);
        // Tiny noise crunch
        noiseBurst(ctx, t, 0.04, 0.18, 800, 4000);
      });
    },
    move() {
      play((ctx, t) => {
        // Subtle slither — very soft filtered tick
        noiseBurst(ctx, t, 0.025, 0.06, 300, 1200);
        oscSimple(ctx, 'sine', 160, t, 0.03, 0.04);
      });
    },
    die() {
      play((ctx, t) => {
        // Dramatic RPG death — descending wail + explosion
        const o1 = oscSimple(ctx, 'sawtooth', 660, t, 0.9, 0.55);
        freqSweepExp(o1, 660, 40, t, t + 0.85);
        const o2 = oscSimple(ctx, 'square', 330, t + 0.05, 0.7, 0.40);
        freqSweepExp(o2, 330, 55, t + 0.05, t + 0.80);
        // Explosion noise
        noiseBurst(ctx, t, 0.25, 0.50, 80, 800);
        noiseBurst(ctx, t + 0.05, 0.40, 0.30, 200, 2000);
        // Low boom
        const boom = oscSimple(ctx, 'sine', 55, t + 0.08, 0.6, 0.70);
        freqSweepExp(boom, 55, 28, t + 0.08, t + 0.65);
        // Eerie high shimmer
        const shimmer = oscSimple(ctx, 'sine', 1760, t + 0.1, 0.5, 0.12);
        freqSweepExp(shimmer, 1760, 440, t + 0.1, t + 0.7);
      });
    },
    levelUp() {
      play((ctx, t) => {
        // Ascending magical arpeggio with shimmer
        [261, 329, 392, 523, 659, 784].forEach((f, i) => {
          fmOsc(ctx, f, f * 0.5, f * 0.3, t + i * 0.07, 0.3, 0.28);
          oscSimple(ctx, 'sine', f * 2, t + i * 0.07, 0.2, 0.10);
        });
        // Final sparkle burst
        [1047, 1319, 1568].forEach((f, i) => {
          oscSimple(ctx, 'sine', f, t + 0.5 + i * 0.06, 0.25, 0.18);
        });
      });
    }
  };

  // ─── TETRIS sounds ────────────────────────────────────────────────────────
  // Mechanical, satisfying, crystal-clear

  const tetris = {
    move() {
      play((ctx, t) => {
        // Crisp mechanical click — not a beep, a real click
        noiseBurst(ctx, t, 0.018, 0.22, 600, 3000);
        oscSimple(ctx, 'square', 200, t, 0.018, 0.10);
      });
    },
    rotate() {
      play((ctx, t) => {
        // Satisfying "whoosh-click" — sweep + snap
        const o = oscSimple(ctx, 'sine', 350, t, 0.10, 0.22);
        freqSweep(o, 350, 700, t, t + 0.07);
        noiseBurst(ctx, t + 0.06, 0.04, 0.18, 1000, 5000);
        // Harmonic shimmer
        const o2 = oscSimple(ctx, 'triangle', 700, t + 0.04, 0.08, 0.14);
        freqSweep(o2, 700, 1050, t + 0.04, t + 0.09);
      });
    },
    drop() {
      play((ctx, t) => {
        // Heavy mechanical thud — layered impact
        const thud = oscSimple(ctx, 'sine', 90, t, 0.22, 0.65);
        freqSweepExp(thud, 90, 42, t, t + 0.18);
        const mid = oscSimple(ctx, 'sine', 180, t, 0.12, 0.35);
        freqSweepExp(mid, 180, 80, t, t + 0.12);
        // Impact crack
        noiseBurst(ctx, t, 0.06, 0.55, 200, 2000);
        noiseBurst(ctx, t, 0.12, 0.30, 50, 400);
        // Resonant ring-out
        oscSimple(ctx, 'triangle', 220, t + 0.04, 0.18, 0.15);
      });
    },
    lineClear(count) {
      play((ctx, t) => {
        // Crystal chime cascade — each line adds more richness
        const scales = {
          1: [523, 659, 784],
          2: [523, 659, 784, 1047],
          3: [523, 659, 784, 1047, 1319],
          4: [523, 659, 784, 1047, 1319, 1568, 2093]
        };
        const notes = scales[Math.min(count, 4)] || scales[1];
        notes.forEach((f, i) => {
          const delay = i * 0.055;
          // Main crystal tone with FM richness
          fmOsc(ctx, f, f * 2, f * 0.8, t + delay, 0.55, 0.30);
          // Bright harmonic
          oscSimple(ctx, 'sine', f * 3, t + delay + 0.01, 0.35, 0.14);
          // Sub tone
          oscSimple(ctx, 'triangle', f * 0.5, t + delay, 0.25, 0.12);
        });
        if (count >= 4) {
          // TETRIS! — extra explosion of sparkle
          noiseBurst(ctx, t + 0.30, 0.20, 0.25, 2000, 8000);
          [2637, 3136, 4186].forEach((f, i) => {
            oscSimple(ctx, 'sine', f, t + 0.38 + i * 0.07, 0.28, 0.18);
          });
          // Victory chord
          [523, 659, 784, 1047].forEach(f => {
            oscSimple(ctx, 'triangle', f, t + 0.55, 0.35, 0.22);
          });
        }
      });
    },
    gameOver() {
      play((ctx, t) => {
        // Epic RPG game over — crumbling tower
        // Descending sawtooth wail
        const wail = oscSimple(ctx, 'sawtooth', 880, t, 1.2, 0.55);
        freqSweepExp(wail, 880, 40, t, t + 1.1);
        // Rumbling bass
        const bass = oscSimple(ctx, 'sine', 60, t + 0.05, 1.0, 0.60);
        freqSweepExp(bass, 60, 25, t + 0.05, t + 1.0);
        // Crumbling noise
        noiseBurst(ctx, t, 0.35, 0.55, 100, 1500);
        noiseBurst(ctx, t + 0.2, 0.50, 0.35, 50, 600);
        // Three descending stabs
        [440, 330, 220].forEach((f, i) => {
          const stab = oscSimple(ctx, 'square', f, t + 0.15 + i * 0.18, 0.15, 0.30);
          freqSweepExp(stab, f, f * 0.5, t + 0.15 + i * 0.18, t + 0.28 + i * 0.18);
        });
      });
    }
  };

  // ─── 2048 sounds ──────────────────────────────────────────────────────────
  // Wooden tiles, resonant merges, triumphant win

  const g2048 = {
    move() {
      play((ctx, t) => {
        // Wooden tile slide — soft clatter
        noiseBurst(ctx, t, 0.035, 0.20, 400, 2500);
        oscSimple(ctx, 'sine', 280, t, 0.04, 0.08);
      });
    },
    merge(value) {
      play((ctx, t) => {
        // Resonant wooden "thock" — pitch and richness scale with value
        const tier = Math.min(Math.floor(Math.log2(value || 2)), 11); // 1–11
        const baseFreq = 120 + tier * 45;  // 165Hz (2) → 615Hz (2048)
        const richness = tier / 11;

        // Main resonant thock
        const main = oscSimple(ctx, 'triangle', baseFreq, t, 0.22, 0.50);
        freqSweepExp(main, baseFreq * 1.3, baseFreq, t, t + 0.08);

        // Harmonic overtone (gets brighter with higher tiles)
        oscSimple(ctx, 'sine', baseFreq * 2, t + 0.01, 0.18, 0.28 + richness * 0.2);
        oscSimple(ctx, 'sine', baseFreq * 3, t + 0.02, 0.10 + richness * 0.12, 0.20);

        // Impact noise (gets crunchier with higher tiles)
        noiseBurst(ctx, t, 0.03 + richness * 0.04, 0.18 + richness * 0.25, 300, 3000 + tier * 300);

        // High tiles get a shimmer
        if (tier >= 7) {
          oscSimple(ctx, 'sine', baseFreq * 4, t + 0.03, 0.22, 0.15 + richness * 0.15);
          fmOsc(ctx, baseFreq * 5, baseFreq, baseFreq * 2, t + 0.04, 0.25, 0.12);
        }
      });
    },
    win() {
      play((ctx, t) => {
        // Grand 2048 fanfare — triumphant orchestral feel
        const melody = [523, 659, 784, 1047, 784, 1047, 1319, 1047];
        melody.forEach((f, i) => {
          fmOsc(ctx, f, f * 0.5, f * 0.4, t + i * 0.11, 0.55, 0.32);
          oscSimple(ctx, 'sine', f * 2, t + i * 0.11, 0.45, 0.15);
          oscSimple(ctx, 'triangle', f * 0.5, t + i * 0.11, 0.35, 0.10);
        });
        // Final triumphant chord with shimmer
        [523, 659, 784, 1047, 1319].forEach(f => {
          oscSimple(ctx, 'triangle', f, t + 0.95, 0.70, 0.28);
          oscSimple(ctx, 'sine', f * 2, t + 0.95, 0.50, 0.12);
        });
        noiseBurst(ctx, t + 0.95, 0.30, 0.20, 2000, 8000);
      });
    },
    gameOver() {
      play((ctx, t) => {
        // Melancholy descending phrase — wooden tiles falling
        [440, 392, 349, 311, 261, 220].forEach((f, i) => {
          const o = oscSimple(ctx, 'triangle', f, t + i * 0.16, 0.28, 0.28);
          freqSweepExp(o, f * 1.05, f * 0.95, t + i * 0.16, t + i * 0.16 + 0.15);
          oscSimple(ctx, 'sine', f * 0.5, t + i * 0.16, 0.22, 0.12);
        });
        // Final low thud
        const thud = oscSimple(ctx, 'sine', 80, t + 1.1, 0.35, 0.45);
        freqSweepExp(thud, 80, 40, t + 1.1, t + 1.5);
        noiseBurst(ctx, t + 1.1, 0.18, 0.22, 60, 400);
      });
    }
  };

  // ─── CHESS sounds ─────────────────────────────────────────────────────────
  // Real wooden chess pieces — clack, thud, ring, fanfare

  const chess = {
    move() {
      play((ctx, t) => {
        // Authentic wooden piece placement — sharp clack with resonance
        // Initial impact transient
        noiseBurst(ctx, t, 0.008, 0.65, 1500, 6000);
        // Wood body resonance
        const body = oscSimple(ctx, 'triangle', 320, t, 0.12, 0.38);
        freqSweepExp(body, 380, 280, t, t + 0.10);
        // Low wood thump
        const thump = oscSimple(ctx, 'sine', 140, t, 0.10, 0.28);
        freqSweepExp(thump, 160, 110, t, t + 0.08);
        // Subtle board resonance ring-out
        oscSimple(ctx, 'sine', 560, t + 0.01, 0.14, 0.18);
      });
    },
    capture() {
      play((ctx, t) => {
        // Heavy capture — piece slammed down with authority
        // Loud impact crack
        noiseBurst(ctx, t, 0.015, 0.90, 800, 5000);
        noiseBurst(ctx, t, 0.08, 0.55, 100, 800);
        // Deep wood thud
        const thud = oscSimple(ctx, 'sine', 90, t, 0.18, 0.65);
        freqSweepExp(thud, 110, 55, t, t + 0.15);
        // Mid body crack
        const crack = oscSimple(ctx, 'triangle', 280, t, 0.14, 0.45);
        freqSweepExp(crack, 320, 200, t, t + 0.12);
        // Captured piece "scatter" — brief rattle
        noiseBurst(ctx, t + 0.05, 0.12, 0.30, 2000, 8000);
        oscSimple(ctx, 'sine', 440, t + 0.04, 0.10, 0.18);
      });
    },
    check() {
      play((ctx, t) => {
        // Urgent warning — two sharp metallic pings
        // First ping — sharp and bright
        fmOsc(ctx, 1100, 1100, 800, t, 0.22, 0.42);
        oscSimple(ctx, 'sine', 2200, t, 0.18, 0.18);
        // Second ping — slightly lower, more urgent
        fmOsc(ctx, 880, 880, 600, t + 0.16, 0.22, 0.38);
        oscSimple(ctx, 'sine', 1760, t + 0.16, 0.15, 0.16);
        // Tension noise
        noiseBurst(ctx, t, 0.04, 0.18, 3000, 8000);
        noiseBurst(ctx, t + 0.16, 0.04, 0.15, 3000, 8000);
      });
    },
    checkmate() {
      play((ctx, t) => {
        // Majestic victory fanfare — worthy of a king
        // Ascending heroic run
        const heroRun = [261, 329, 392, 523, 659, 784, 1047];
        heroRun.forEach((f, i) => {
          fmOsc(ctx, f, f * 0.5, f * 0.5, t + i * 0.075, 0.35, 0.35);
          oscSimple(ctx, 'triangle', f * 2, t + i * 0.075, 0.25, 0.15);
        });
        // Triumphant final chord — full and rich
        const chord = [261, 329, 392, 523, 659, 784, 1047];
        chord.forEach(f => {
          oscSimple(ctx, 'triangle', f, t + 0.62, 0.85, 0.32);
          oscSimple(ctx, 'sine', f * 2, t + 0.62, 0.65, 0.18);
          fmOsc(ctx, f, f * 3, f * 0.3, t + 0.62, 1.0, 0.22);
        });
        // Sparkle burst
        noiseBurst(ctx, t + 0.62, 0.30, 0.22, 3000, 10000);
        [2093, 2637, 3136].forEach((f, i) => {
          oscSimple(ctx, 'sine', f, t + 0.65 + i * 0.08, 0.45, 0.18);
        });
      });
    },
    gameOver(playerWon) {
      if (playerWon) {
        chess.checkmate();
      } else {
        play((ctx, t) => {
          // Defeated — slow descending minor phrase
          const minor = [440, 415, 370, 349, 311, 294, 261];
          minor.forEach((f, i) => {
            oscSimple(ctx, 'triangle', f, t + i * 0.18, 0.32, 0.30);
            oscSimple(ctx, 'sine', f * 0.5, t + i * 0.18, 0.22, 0.14);
          });
          // Final low toll
          const toll = oscSimple(ctx, 'sine', 110, t + 1.4, 0.55, 0.55);
          freqSweepExp(toll, 110, 80, t + 1.4, t + 1.9);
          noiseBurst(ctx, t + 1.4, 0.20, 0.20, 80, 500);
        });
      }
    },
    illegalMove() {
      play((ctx, t) => {
        // Harsh buzz — "no, you can't do that"
        const o = oscSimple(ctx, 'square', 120, t, 0.14, 0.38);
        freqSweep(o, 140, 90, t, t + 0.12);
        noiseBurst(ctx, t, 0.10, 0.22, 200, 1000);
      });
    },
    promotion() {
      play((ctx, t) => {
        // Royal coronation fanfare — a pawn becomes a queen!
        // Triumphant ascending run
        [392, 523, 659, 784, 1047, 1319].forEach((f, i) => {
          fmOsc(ctx, f, f * 0.5, f * 0.6, t + i * 0.08, 0.30, 0.32);
          oscSimple(ctx, 'sine', f * 2, t + i * 0.08, 0.22, 0.14);
        });
        // Majestic final chord
        [523, 659, 784, 1047, 1319].forEach(f => {
          oscSimple(ctx, 'triangle', f, t + 0.55, 0.70, 0.28);
          oscSimple(ctx, 'sine', f * 2, t + 0.55, 0.45, 0.14);
        });
        noiseBurst(ctx, t + 0.55, 0.25, 0.18, 2000, 8000);
      });
    }
  };

  // ─── CHECKERS sounds ──────────────────────────────────────────────────────
  // Smooth disc slides, satisfying captures, royal king crowning

  const checkers = {
    move() {
      play((ctx, t) => {
        // Smooth disc slide across board — soft whoosh + landing click
        // Slide whoosh
        const slide = oscSimple(ctx, 'sine', 420, t, 0.09, 0.16);
        freqSweepExp(slide, 480, 320, t, t + 0.07);
        noiseBurst(ctx, t, 0.06, 0.12, 600, 3000);
        // Landing click
        noiseBurst(ctx, t + 0.07, 0.012, 0.35, 1200, 5000);
        oscSimple(ctx, 'triangle', 380, t + 0.07, 0.04, 0.18);
      });
    },
    capture() {
      play((ctx, t) => {
        // Satisfying capture — disc slammed, opponent piece removed
        // Impact
        noiseBurst(ctx, t, 0.012, 0.70, 1000, 5000);
        const hit = oscSimple(ctx, 'triangle', 300, t, 0.10, 0.35);
        freqSweepExp(hit, 360, 240, t, t + 0.09);
        // Low thud
        const thud = oscSimple(ctx, 'sine', 120, t, 0.12, 0.30);
        freqSweepExp(thud, 140, 80, t, t + 0.10);
        // Captured disc "pop off" — brief high burst
        noiseBurst(ctx, t + 0.04, 0.08, 0.28, 2000, 6000);
        oscSimple(ctx, 'sine', 660, t + 0.04, 0.08, 0.18);
      });
    },
    multiCapture() {
      play((ctx, t) => {
        // Chain of captures — each one satisfying
        [0, 0.18, 0.36].forEach((delay, idx) => {
          const amp = 1.0 - idx * 0.1;
          noiseBurst(ctx, t + delay, 0.012, 0.65 * amp, 1000, 5000);
          const hit = oscSimple(ctx, 'triangle', 300 + idx * 30, t + delay, 0.09, 0.30 * amp);
          freqSweepExp(hit, 360 + idx * 30, 240 + idx * 20, t + delay, t + delay + 0.08);
          oscSimple(ctx, 'sine', 120, t + delay, 0.10, 0.25 * amp);
          noiseBurst(ctx, t + delay + 0.04, 0.07, 0.25 * amp, 2000, 6000);
        });
        // Final triumphant note
        oscSimple(ctx, 'triangle', 660, t + 0.52, 0.22, 0.30);
        oscSimple(ctx, 'sine', 1320, t + 0.52, 0.18, 0.20);
      });
    },
    kingPromotion() {
      play((ctx, t) => {
        // Royal coronation — a piece becomes a KING
        // Crown descends — descending then ascending
        [1047, 784, 523, 784, 1047, 1319, 1568].forEach((f, i) => {
          fmOsc(ctx, f, f * 0.5, f * 0.5, t + i * 0.09, 0.35, 0.30);
          oscSimple(ctx, 'sine', f * 2, t + i * 0.09, 0.25, 0.14);
        });
        // Majestic final chord
        [523, 659, 784, 1047, 1319].forEach(f => {
          oscSimple(ctx, 'triangle', f, t + 0.70, 0.65, 0.28);
          oscSimple(ctx, 'sine', f * 2, t + 0.70, 0.40, 0.14);
        });
        noiseBurst(ctx, t + 0.70, 0.22, 0.18, 2000, 8000);
      });
    },
    win() {
      play((ctx, t) => {
        // Grand victory fanfare — all pieces captured!
        const run = [261, 329, 392, 523, 659, 784, 1047, 784];
        run.forEach((f, i) => {
          fmOsc(ctx, f, f * 0.5, f * 0.4, t + i * 0.08, 0.35, 0.30);
          oscSimple(ctx, 'triangle', f * 2, t + i * 0.08, 0.22, 0.14);
        });
        // Final triumphant chord
        [261, 329, 392, 523, 659, 784, 1047].forEach(f => {
          oscSimple(ctx, 'triangle', f, t + 0.72, 0.80, 0.30);
          oscSimple(ctx, 'sine', f * 2, t + 0.72, 0.55, 0.16);
          fmOsc(ctx, f, f * 3, f * 0.3, t + 0.72, 1.0, 0.18);
        });
        noiseBurst(ctx, t + 0.72, 0.35, 0.25, 2000, 10000);
        [2093, 2637, 3136].forEach((f, i) => {
          oscSimple(ctx, 'sine', f, t + 0.75 + i * 0.08, 0.40, 0.18);
        });
      });
    },
    lose() {
      play((ctx, t) => {
        // Sad defeat — slow minor descent
        [440, 392, 349, 311, 261, 220].forEach((f, i) => {
          oscSimple(ctx, 'triangle', f, t + i * 0.18, 0.28, 0.28);
          oscSimple(ctx, 'sine', f * 0.5, t + i * 0.18, 0.18, 0.12);
        });
        const toll = oscSimple(ctx, 'sine', 110, t + 1.2, 0.45, 0.50);
        freqSweepExp(toll, 110, 75, t + 1.2, t + 1.7);
        noiseBurst(ctx, t + 1.2, 0.18, 0.18, 80, 500);
      });
    },
    illegalMove() {
      play((ctx, t) => {
        const o = oscSimple(ctx, 'square', 120, t, 0.14, 0.35);
        freqSweep(o, 140, 90, t, t + 0.12);
        noiseBurst(ctx, t, 0.10, 0.20, 200, 1000);
      });
    }
  };

  // ─── Public API ───────────────────────────────────────────────────────────

  global.GameSounds = {
    enabled,
    setEnabled,
    setVolume,
    snake,
    tetris,
    g2048,
    chess,
    checkers,
    // Unlock audio context on first user interaction (required by browsers)
    unlock() {
      const ctx = getCtx();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    }
  };

})(window);
