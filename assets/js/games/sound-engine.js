/**
 * William's World — Game Sound Engine
 * High-quality synthesized sound effects for all games.
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
        _masterGain.gain.value = 0.6;
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

  function osc(ctx, type, freq, startTime, duration, gainPeak, gainEnd) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, startTime);
    g.gain.setValueAtTime(gainPeak, startTime);
    g.gain.exponentialRampToValueAtTime(gainEnd || 0.001, startTime + duration);
    o.connect(g);
    g.connect(_masterGain);
    o.start(startTime);
    o.stop(startTime + duration + 0.01);
    return { osc: o, gain: g };
  }

  function freqRamp(o, fromFreq, toFreq, startTime, endTime) {
    o.osc.frequency.setValueAtTime(fromFreq, startTime);
    o.osc.frequency.linearRampToValueAtTime(toFreq, endTime);
  }

  function noise(ctx, startTime, duration, gainPeak) {
    const bufSize = ctx.sampleRate * duration;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gainPeak, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    src.connect(g);
    g.connect(_masterGain);
    src.start(startTime);
    src.stop(startTime + duration + 0.01);
  }

  function play(fn) {
    if (!_enabled) return;
    const ctx = getCtx();
    if (!ctx) return;
    try { fn(ctx, ctx.currentTime); } catch(e) {}
  }

  // ─── SNAKE sounds ─────────────────────────────────────────────────────────

  const snake = {
    eat() {
      play((ctx, t) => {
        // Juicy "pop" — quick frequency sweep up
        const o = osc(ctx, 'sine', 300, t, 0.12, 0.5, 0.001);
        freqRamp(o, 300, 900, t, t + 0.08);
        // Harmonic layer
        const o2 = osc(ctx, 'triangle', 600, t, 0.1, 0.25, 0.001);
        freqRamp(o2, 600, 1200, t, t + 0.07);
      });
    },
    move() {
      play((ctx, t) => {
        // Very soft tick
        osc(ctx, 'sine', 220, t, 0.04, 0.08, 0.001);
      });
    },
    die() {
      play((ctx, t) => {
        // Descending "wah-wah" death sound
        const o1 = osc(ctx, 'sawtooth', 440, t, 0.5, 0.4, 0.001);
        freqRamp(o1, 440, 80, t, t + 0.5);
        const o2 = osc(ctx, 'square', 220, t + 0.1, 0.4, 0.3, 0.001);
        freqRamp(o2, 220, 55, t + 0.1, t + 0.5);
        noise(ctx, t + 0.05, 0.3, 0.15);
      });
    },
    levelUp() {
      play((ctx, t) => {
        // Quick ascending arpeggio
        [261, 329, 392, 523].forEach((f, i) => {
          osc(ctx, 'triangle', f, t + i * 0.07, 0.15, 0.4, 0.001);
        });
      });
    }
  };

  // ─── TETRIS sounds ────────────────────────────────────────────────────────

  const tetris = {
    move() {
      play((ctx, t) => {
        osc(ctx, 'square', 180, t, 0.06, 0.12, 0.001);
      });
    },
    rotate() {
      play((ctx, t) => {
        const o = osc(ctx, 'sine', 400, t, 0.1, 0.2, 0.001);
        freqRamp(o, 400, 600, t, t + 0.08);
      });
    },
    drop() {
      play((ctx, t) => {
        // Satisfying thud — low thump + brief noise burst
        const o = osc(ctx, 'sine', 120, t, 0.18, 0.5, 0.001);
        freqRamp(o, 120, 60, t, t + 0.15);
        noise(ctx, t, 0.08, 0.3);
      });
    },
    lineClear(count) {
      play((ctx, t) => {
        // Bright chime cascade — more lines = more notes
        const notes = count === 4
          ? [523, 659, 784, 1047, 1319]  // Tetris! — 5 note fanfare
          : [523, 659, 784, 1047].slice(0, count + 1);
        notes.forEach((f, i) => {
          osc(ctx, 'triangle', f, t + i * 0.06, 0.2, 0.5, 0.001);
          osc(ctx, 'sine', f * 2, t + i * 0.06, 0.15, 0.2, 0.001);
        });
        if (count === 4) {
          // Extra sparkle for Tetris
          [2093, 2637].forEach((f, i) => {
            osc(ctx, 'sine', f, t + 0.35 + i * 0.08, 0.2, 0.3, 0.001);
          });
        }
      });
    },
    gameOver() {
      play((ctx, t) => {
        // Dramatic descending crash
        const o = osc(ctx, 'sawtooth', 880, t, 1.0, 0.6, 0.001);
        freqRamp(o, 880, 55, t, t + 0.8);
        noise(ctx, t, 0.5, 0.4);
        // Low boom
        const o2 = osc(ctx, 'sine', 80, t + 0.1, 0.8, 0.5, 0.001);
        freqRamp(o2, 80, 30, t + 0.1, t + 0.8);
      });
    }
  };

  // ─── 2048 sounds ──────────────────────────────────────────────────────────

  const g2048 = {
    move() {
      play((ctx, t) => {
        osc(ctx, 'sine', 350, t, 0.05, 0.1, 0.001);
      });
    },
    merge(value) {
      play((ctx, t) => {
        // Pitch scales with tile value — higher tiles = higher, richer sound
        const base = Math.min(200 + Math.log2(value) * 60, 1200);
        const o = osc(ctx, 'triangle', base, t, 0.18, 0.4, 0.001);
        freqRamp(o, base, base * 1.5, t, t + 0.12);
        osc(ctx, 'sine', base * 2, t + 0.03, 0.12, 0.2, 0.001);
      });
    },
    win() {
      play((ctx, t) => {
        // Triumphant fanfare for reaching 2048
        const melody = [523, 659, 784, 1047, 784, 1047, 1319];
        melody.forEach((f, i) => {
          osc(ctx, 'triangle', f, t + i * 0.1, 0.25, 0.5, 0.001);
          osc(ctx, 'sine', f * 2, t + i * 0.1, 0.1, 0.2, 0.001);
        });
      });
    },
    gameOver() {
      play((ctx, t) => {
        // Sad descending tones
        [440, 370, 311, 261].forEach((f, i) => {
          osc(ctx, 'triangle', f, t + i * 0.18, 0.25, 0.3, 0.001);
        });
      });
    }
  };

  // ─── CHESS sounds ─────────────────────────────────────────────────────────

  const chess = {
    move() {
      play((ctx, t) => {
        // Wooden "clack" — short noise burst + low thump
        noise(ctx, t, 0.06, 0.35);
        osc(ctx, 'sine', 180, t, 0.08, 0.3, 0.001);
      });
    },
    capture() {
      play((ctx, t) => {
        // Heavier "thud" — louder noise + lower thump + brief crunch
        noise(ctx, t, 0.12, 0.6);
        const o = osc(ctx, 'sine', 120, t, 0.15, 0.5, 0.001);
        freqRamp(o, 120, 60, t, t + 0.12);
        osc(ctx, 'sawtooth', 240, t, 0.08, 0.2, 0.001);
      });
    },
    check() {
      play((ctx, t) => {
        // Alert "ping" — two-tone warning
        osc(ctx, 'sine', 880, t, 0.15, 0.4, 0.001);
        osc(ctx, 'sine', 1100, t + 0.12, 0.15, 0.4, 0.001);
      });
    },
    checkmate() {
      play((ctx, t) => {
        // Dramatic fanfare — ascending then triumphant chord
        [261, 329, 392, 523, 659, 784].forEach((f, i) => {
          osc(ctx, 'triangle', f, t + i * 0.08, 0.3, 0.5, 0.001);
        });
        // Final chord
        [523, 659, 784, 1047].forEach((f) => {
          osc(ctx, 'triangle', f, t + 0.6, 0.6, 0.4, 0.001);
          osc(ctx, 'sine', f, t + 0.6, 0.6, 0.2, 0.001);
        });
      });
    },
    gameOver(playerWon) {
      if (playerWon) {
        chess.checkmate();
      } else {
        play((ctx, t) => {
          // Sad descending tones for loss
          [440, 392, 349, 294, 261].forEach((f, i) => {
            osc(ctx, 'triangle', f, t + i * 0.15, 0.25, 0.3, 0.001);
          });
        });
      }
    },
    illegalMove() {
      play((ctx, t) => {
        // Short buzzer
        const o = osc(ctx, 'square', 150, t, 0.1, 0.3, 0.001);
        freqRamp(o, 150, 100, t, t + 0.1);
      });
    },
    promotion() {
      play((ctx, t) => {
        // Royal fanfare for pawn promotion
        [523, 659, 784, 1047, 784, 1047].forEach((f, i) => {
          osc(ctx, 'triangle', f, t + i * 0.09, 0.2, 0.45, 0.001);
        });
      });
    }
  };

  // ─── CHECKERS sounds ──────────────────────────────────────────────────────

  const checkers = {
    move() {
      play((ctx, t) => {
        // Smooth "slide" — soft swish
        const o = osc(ctx, 'sine', 500, t, 0.1, 0.2, 0.001);
        freqRamp(o, 500, 300, t, t + 0.08);
        noise(ctx, t, 0.05, 0.1);
      });
    },
    capture() {
      play((ctx, t) => {
        // Satisfying "pop" for capturing a piece
        const o = osc(ctx, 'sine', 400, t, 0.15, 0.4, 0.001);
        freqRamp(o, 400, 800, t, t + 0.08);
        noise(ctx, t + 0.05, 0.1, 0.3);
      });
    },
    multiCapture() {
      play((ctx, t) => {
        // Multiple pops in quick succession
        [0, 0.15, 0.3].forEach((delay) => {
          const o = osc(ctx, 'sine', 400, t + delay, 0.12, 0.35, 0.001);
          freqRamp(o, 400, 800, t + delay, t + delay + 0.08);
          noise(ctx, t + delay + 0.04, 0.08, 0.25);
        });
      });
    },
    kingPromotion() {
      play((ctx, t) => {
        // Royal "ding" — bright ascending chime
        [523, 784, 1047, 1568].forEach((f, i) => {
          osc(ctx, 'triangle', f, t + i * 0.1, 0.25, 0.5, 0.001);
          osc(ctx, 'sine', f * 2, t + i * 0.1, 0.1, 0.2, 0.001);
        });
      });
    },
    win() {
      play((ctx, t) => {
        // Victory fanfare
        [261, 329, 392, 523, 659, 784, 1047].forEach((f, i) => {
          osc(ctx, 'triangle', f, t + i * 0.09, 0.25, 0.45, 0.001);
        });
        [523, 659, 784, 1047].forEach((f) => {
          osc(ctx, 'triangle', f, t + 0.75, 0.5, 0.4, 0.001);
        });
      });
    },
    lose() {
      play((ctx, t) => {
        [440, 370, 311, 261].forEach((f, i) => {
          osc(ctx, 'triangle', f, t + i * 0.18, 0.25, 0.3, 0.001);
        });
      });
    },
    illegalMove() {
      play((ctx, t) => {
        const o = osc(ctx, 'square', 150, t, 0.1, 0.25, 0.001);
        freqRamp(o, 150, 100, t, t + 0.1);
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
