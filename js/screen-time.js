
// SCREEN TIME REWARD SYSTEM — William's World
// ============================================
// Screen time is EARNED, not given.
// Sources: quests, tasks, church, exercise,
//          school subjects, parent behavior award.
// Default daily cap: 60 minutes.
// Parent PIN (062923) can add bonus minutes.
// All data resets each day via localStorage.
// ============================================

(function () {
  'use strict';

  // ── Config ─────────────────────────────────
  const PARENT_PIN  = '062923';
  const DEFAULT_CAP = 60;   // minutes — hard cap without parent unlock
  const STORAGE_KEY = 'williamsworld_screentime_v2';

  // Minutes earned per reward
  const REWARDS = {
    task_per_item:   2,   // each individual task checked
    quest_night:    10,   // full Night-Before quest complete
    quest_morning:  10,   // full Morning Quest complete
    quest_backpack: 10,   // full Backpack Quest complete
    church:         15,
    run_per_mile:   10,   // running: 10 min per mile
    pullups:         2,
    situps:          2,
    pushups:         2,
    stretching:      2,
    protein_drink:  12,   // protein drink
    school_subject:  5,   // per subject logged (ELA, Math, Science, Other)
  };

  // Workout activities (non-running)
  const WORKOUT_ACTIVITIES = [
    { id: 'pullups',    label: 'Pull-Ups',   icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v16M18 4v16M6 12h12"/><path d="M3 8h3M18 8h3M3 16h3M18 16h3"/></svg>' },
    { id: 'situps',     label: 'Sit-Ups',    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M5 20l4-8 3 4 2-3 3 7"/><path d="M3 20h18"/></svg>' },
    { id: 'pushups',    label: 'Push-Ups',   icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M5 20h14"/><path d="M8 20V12l4-6 4 6v8"/><path d="M6 14h2M16 14h2"/></svg>' },
    { id: 'stretching',    label: 'Stretching',    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M12 6v6l-4 4M12 12l4 4"/><path d="M6 22l2-4M18 22l-2-4"/></svg>' },
    { id: 'protein_drink', label: 'Protein Drink', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8l1 4H7L8 2z"/><path d="M7 6l1 14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-14"/><path d="M10 10h4"/></svg>' },
  ];

  const SCHOOL_SUBJECTS = [
    { id: 'ela',     label: 'ELA',     icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/></svg>' },
    { id: 'math',    label: 'Math',    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="16" y2="6"/><line x1="12" y1="2" x2="12" y2="10"/><line x1="8" y1="18" x2="16" y2="18"/><line x1="6" y1="14" x2="18" y2="22"/><line x1="18" y1="14" x2="6" y2="22"/></svg>' },
    { id: 'science', label: 'Science', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6v7l4 10H5L9 10V3z"/><line x1="9" y1="3" x2="15" y2="3"/><circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/></svg>' },
    { id: 'other',   label: 'Other',   icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>' },
  ];

  // Tasks that belong to each quest group (mirrors hub.js TASKS)
  const QUEST_TASKS = {
    night:   ['n_trapper','n_clothes','n_lunch','n_shoes'],
    morning: ['m_prayer','m_dressed','m_teeth','m_trappercheck'],
    backpack:['t_work','t_notebooks','t_supplies','t_check'],
  };

  // ── Helpers ────────────────────────────────
  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function fmtMin(totalMin) {
    if (totalMin <= 0) return '0m';
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  function fmtSec(totalSec) {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function showToast(msg) {
    const el = document.getElementById('toast');
    if (el) {
      el.innerHTML = msg;
      el.style.display = 'block';
      clearTimeout(showToast._t);
      showToast._t = setTimeout(() => { el.style.display = 'none'; }, 2800);
    }
  }

  // ── State ──────────────────────────────────
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) throw 0;
      return JSON.parse(raw);
    } catch (_) {
      return { days: {} };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(st));
  }

  function getTodayRec() {
    const key = todayKey();
    if (!st.days[key]) {
      st.days[key] = {
        earned: 0,
        bonusCap: 0,
        sources: {},
        schoolBonus: {},
        behaviorAwards: [],
        milesRun: 0,
        timerUsedSec: 0,   // total seconds of screen time used today
      };
      saveState();
    }
    const r = st.days[key];
    if (!r.sources)        r.sources = {};
    if (!r.schoolBonus)    r.schoolBonus = {};
    if (!r.behaviorAwards) r.behaviorAwards = [];
    if (r.bonusCap        === undefined) r.bonusCap = 0;
    if (r.milesRun        === undefined) r.milesRun = 0;
    if (r.timerUsedSec    === undefined) r.timerUsedSec = 0;
    return r;
  }

  let st = loadState();

  // ── Cap logic ──────────────────────────────
  function getDailyCap()  { return DEFAULT_CAP + getTodayRec().bonusCap; }
  function getEarned()    { return getTodayRec().earned; }
  function getRemaining() { return Math.max(0, getDailyCap() - getEarned()); }

  // ── Award minutes ──────────────────────────
  function awardMinutes(sourceId, minutes, label) {
    const rec = getTodayRec();
    if (rec.sources[sourceId]) return 0; // already awarded
    const cap    = getDailyCap();
    const space  = Math.max(0, cap - rec.earned);
    const actual = Math.min(minutes, space);
    rec.sources[sourceId] = { minutes: actual, label, ts: Date.now() };
    rec.earned += actual;
    saveState();
    return actual;
  }

  // Running: stackable
  function awardRunMiles(miles) {
    const rec = getTodayRec();
    const mins = miles * REWARDS.run_per_mile;
    const cap   = getDailyCap();
    const space = Math.max(0, cap - rec.earned);
    const actual = Math.min(mins, space);
    rec.earned   += actual;
    rec.milesRun += miles;
    const key = `run_${Date.now()}`;
    rec.sources[key] = { minutes: actual, label: `Run: ${miles} mile${miles !== 1 ? 's' : ''}`, ts: Date.now() };
    saveState();
    return actual;
  }

  // Parent-only: add bonus cap minutes
  function parentAddCap(extraMinutes) {
    const rec = getTodayRec();
    rec.bonusCap += extraMinutes;
    saveState();
    updateUI();
    showToast(`<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.75-1.5"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg> Parent unlocked +${extraMinutes} min! New cap: ${getDailyCap()} min`);
  }

  // Parent-only: behavior award (bypasses cap)
  function parentBehaviorAward(minutes, note) {
    const rec = getTodayRec();
    rec.earned += minutes;
    rec.behaviorAwards.push({ minutes, note: note || 'Great behavior!', ts: Date.now() });
    saveState();
    updateUI();
    showToast(`<svg class='ww-icon' width='16' height='16' viewBox='0 0 24 24' fill='currentColor' stroke='none' aria-hidden='true'><polygon points='12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26'/></svg> Behavior Award: +${minutes} min! "${note || 'Great behavior!'}"`);
  }

  // Parent-only: school subject bonus
  function parentSchoolBonus(subjectId, extraMinutes) {
    const rec = getTodayRec();
    if (!rec.schoolBonus[subjectId]) rec.schoolBonus[subjectId] = 0;
    rec.schoolBonus[subjectId] += extraMinutes;
    rec.earned += extraMinutes;
    const bonusKey = `school_bonus_${subjectId}_${Date.now()}`;
    rec.sources[bonusKey] = { minutes: extraMinutes, label: `School bonus: ${subjectId}`, ts: Date.now() };
    saveState();
    updateUI();
    const subj = SCHOOL_SUBJECTS.find(s => s.id === subjectId);
    showToast(`<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> +${extraMinutes} min bonus for ${subj ? subj.label : subjectId}!`);
  }

  // ── Public API (called by hub.js) ──────────
  window.ScreenTime = {
    onTaskChecked(taskId) {
      const added = awardMinutes(`task_${taskId}`, REWARDS.task_per_item, `Task: ${taskId}`);
      if (added > 0) showToast(`<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg> +${added} min screen time earned!`);
      for (const [quest, tasks] of Object.entries(QUEST_TASKS)) {
        if (!tasks.includes(taskId)) continue;
        const dayState = getHubDayTasks();
        if (!dayState) continue;
        const allDone = tasks.every(id => dayState[id] === true);
        if (allDone) {
          const questKey = `quest_${quest}`;
          const bonus = awardMinutes(questKey, REWARDS[`quest_${quest}`], `Quest complete: ${quest}`);
          if (bonus > 0) showToast(`<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2h12v6a6 6 0 0 1-12 0V2z"/><path d="M6 5H2v2a4 4 0 0 0 4 4M18 5h4v2a4 4 0 0 1-4 4"/><path d="M12 14v4M8 18h8"/></svg> Quest complete! +${bonus} min screen time!`);
        }
      }
      updateUI();
    },
    // Award arbitrary minutes (used by High Score system and parent controls)
    addMinutes(minutes, label) {
      const key = `bonus_${Date.now()}`;
      const added = awardMinutes(key, minutes, label || 'Bonus');
      if (added > 0) showToast(`<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg> +${added} min screen time earned!`);
      updateUI();
      return added;
    },
  };

  function getHubDayTasks() {
    try {
      const raw = localStorage.getItem('williams_world_embed_state_v1');
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data.days?.[todayKey()]?.tasks || null;
    } catch (_) { return null; }
  }

  // ── Countdown Timer ────────────────────────
  let timerInterval  = null;
  let timerRunning   = false;
  let timerRemainSec = 0;   // seconds left in the current session

  function getTimerTotalSec() {
    // Earned minutes minus already-used seconds (converted to minutes)
    const rec = getTodayRec();
    const earnedSec = getEarned() * 60;
    const usedSec   = rec.timerUsedSec || 0;
    return Math.max(0, earnedSec - usedSec);
  }

  // ── Full-screen timer overlay ──────────────
  function showFullscreenTimer() {
    let overlay = document.getElementById('stFullscreenTimerOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'stFullscreenTimerOverlay';
      overlay.innerHTML = `
        <style>
          #stFullscreenTimerOverlay {
            position: fixed; top:0; left:0; width:100vw; height:100vh;
            background: linear-gradient(135deg,#0a0a2e 0%,#1a0a3e 50%,#0a1a2e 100%);
            z-index: 9000; display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            font-family: 'Cinzel Decorative', serif;
            transition: background 0.5s ease;
          }
          #stFullscreenTimerOverlay.fs-warn-yellow {
            animation: fsBlinkYellow 0.8s ease infinite;
          }
          #stFullscreenTimerOverlay.fs-warn-red {
            animation: fsBlinkRed 0.5s ease infinite;
          }
          @keyframes fsBlinkYellow {
            0%,100% { background: linear-gradient(135deg,#0a0a2e 0%,#1a0a3e 50%,#0a1a2e 100%); }
            50%      { background: linear-gradient(135deg,#3a3000 0%,#5a4800 50%,#3a3000 100%); }
          }
          @keyframes fsBlinkRed {
            0%,100% { background: linear-gradient(135deg,#0a0a2e 0%,#1a0a3e 50%,#0a1a2e 100%); }
            50%      { background: linear-gradient(135deg,#3a0000 0%,#5a0000 50%,#3a0000 100%); }
          }
          .fst-label {
            font-family: 'Cinzel', serif; font-size: 1.1rem;
            color: rgba(255,255,255,0.5); letter-spacing: 0.2em;
            text-transform: uppercase; margin-bottom: 0.5rem;
          }
          .fst-display {
            font-family: 'Cinzel Decorative', serif;
            font-size: clamp(5rem, 18vw, 14rem);
            font-weight: 900; color: #ffd700;
            text-shadow: 0 0 30px rgba(255,215,0,0.6), 0 0 60px rgba(255,215,0,0.3);
            line-height: 1; margin-bottom: 0.5rem;
            transition: color 0.3s, text-shadow 0.3s;
          }
          .fst-display.fst-yellow {
            color: #ffe000;
            text-shadow: 0 0 30px rgba(255,224,0,0.9), 0 0 80px rgba(255,224,0,0.5);
          }
          .fst-display.fst-red {
            color: #ff3333;
            text-shadow: 0 0 30px rgba(255,50,50,0.9), 0 0 80px rgba(255,50,50,0.5);
          }
          .fst-sublabel {
            font-family: 'Cinzel', serif; font-size: 1rem;
            color: rgba(255,255,255,0.45); margin-bottom: 2.5rem;
          }
          .fst-warn-msg {
            font-family: 'Cinzel', serif; font-size: 1.4rem; font-weight: 700;
            min-height: 2rem; margin-bottom: 1.5rem; text-align: center;
            transition: opacity 0.3s;
          }
          .fst-warn-msg.fst-yellow-msg { color: #ffe000; }
          .fst-warn-msg.fst-red-msg    { color: #ff3333; }
          .fst-btns {
            display: flex; gap: 1.5rem; flex-wrap: wrap; justify-content: center;
            margin-bottom: 2rem;
          }
          .fst-btn {
            font-family: 'Cinzel', serif; font-size: 1.1rem; font-weight: 700;
            padding: 0.75rem 2rem; border-radius: 10px; border: 2px solid;
            cursor: pointer; transition: all 0.2s;
          }
          .fst-btn-pause  { background:#1a1a4e; border-color:#ffd700; color:#ffd700; }
          .fst-btn-pause:hover  { background:#2a2a6e; }
          .fst-btn-resume { background:#1a3a1a; border-color:#7fff00; color:#7fff00; }
          .fst-btn-resume:hover { background:#2a5a2a; }
          .fst-btn-exit   { background:#2a0a0a; border-color:#ff6666; color:#ff6666; }
          .fst-btn-exit:hover   { background:#4a1a1a; }
          .fst-progress-wrap {
            width: min(80vw, 600px); background: rgba(255,255,255,0.1);
            border-radius: 999px; height: 10px; overflow: hidden;
          }
          .fst-progress-bar {
            height: 100%; border-radius: 999px;
            background: linear-gradient(90deg,#ffd700,#ffaa00);
            transition: width 1s linear, background 0.3s;
          }
          .fst-progress-bar.fst-bar-yellow { background: linear-gradient(90deg,#ffe000,#ffcc00); }
          .fst-progress-bar.fst-bar-red    { background: linear-gradient(90deg,#ff3333,#ff6666); }
        </style>
        <div class="fst-label">Screen Time Remaining</div>
        <div class="fst-display" id="fstDisplay">00:00</div>
        <div class="fst-sublabel" id="fstSubLabel"></div>
        <div class="fst-warn-msg" id="fstWarnMsg"></div>
        <div class="fst-btns">
          <button class="fst-btn fst-btn-pause"  id="fstPauseBtn"><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause</button>
          <button class="fst-btn fst-btn-resume" id="fstResumeBtn" style="display:none;">▶ Resume</button>
          <button class="fst-btn fst-btn-exit"   id="fstExitBtn">✕ Exit</button>
        </div>
        <div class="fst-progress-wrap">
          <div class="fst-progress-bar" id="fstProgressBar" style="width:100%"></div>
        </div>
      `;
      document.body.appendChild(overlay);

      document.getElementById('fstPauseBtn').addEventListener('click', () => {
        pauseTimer();
        document.getElementById('fstPauseBtn').style.display  = 'none';
        document.getElementById('fstResumeBtn').style.display = 'inline-flex';
      });
      document.getElementById('fstResumeBtn').addEventListener('click', () => {
        startTimer();
        document.getElementById('fstPauseBtn').style.display  = 'inline-flex';
        document.getElementById('fstResumeBtn').style.display = 'none';
      });
      document.getElementById('fstExitBtn').addEventListener('click', () => {
        closeFullscreenTimer();
      });
    }
    overlay.style.display = 'flex';
    updateFullscreenTimer();
  }

  function closeFullscreenTimer() {
    const overlay = document.getElementById('stFullscreenTimerOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  function updateFullscreenTimer() {
    const overlay = document.getElementById('stFullscreenTimerOverlay');
    if (!overlay || overlay.style.display === 'none') return;

    const display     = document.getElementById('fstDisplay');
    const subLabel    = document.getElementById('fstSubLabel');
    const warnMsg     = document.getElementById('fstWarnMsg');
    const progressBar = document.getElementById('fstProgressBar');
    const pauseBtn    = document.getElementById('fstPauseBtn');
    const resumeBtn   = document.getElementById('fstResumeBtn');

    const totalSec  = getEarned() * 60;
    const showSec   = timerRunning ? timerRemainSec : getTimerTotalSec();
    const pct       = totalSec > 0 ? Math.max(0, (showSec / totalSec) * 100) : 0;

    // Timer display
    if (display) {
      display.textContent = fmtSec(showSec);
      display.className   = 'fst-display' +
        (showSec <= 60  ? ' fst-red'    :
         showSec <= 300 ? ' fst-yellow' : '');
    }

    // Sub-label
    if (subLabel) {
      subLabel.textContent = timerRunning ? 'counting down…' :
        (showSec > 0 ? 'paused' : 'time is up!');
    }

    // Warning message
    if (warnMsg) {
      if (showSec <= 60 && showSec > 0) {
        warnMsg.innerHTML  = `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> LAST MINUTE!`;
        warnMsg.className    = 'fst-warn-msg fst-red-msg';
      } else if (showSec <= 300 && showSec > 0) {
        warnMsg.innerHTML  = `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> 5 minutes remaining!`;
        warnMsg.className    = 'fst-warn-msg fst-yellow-msg';
      } else {
        warnMsg.textContent  = '';
        warnMsg.className    = 'fst-warn-msg';
      }
    }

    // Background blink — yellow from 5 min down to 1 min, red for full last minute
    overlay.classList.remove('fs-warn-yellow','fs-warn-red');
    if      (showSec <= 60  && showSec > 0)              overlay.classList.add('fs-warn-red');
    else if (showSec <= 300 && showSec > 60 && showSec > 0) overlay.classList.add('fs-warn-yellow');

    // Progress bar
    if (progressBar) {
      progressBar.style.width = pct + '%';
      progressBar.className   = 'fst-progress-bar' +
        (showSec <= 60  ? ' fst-bar-red'    :
         showSec <= 300 ? ' fst-bar-yellow' : '');
    }

    // Pause/resume buttons
    if (pauseBtn && resumeBtn) {
      pauseBtn.style.display  = timerRunning   ? 'inline-flex' : 'none';
      resumeBtn.style.display = !timerRunning  ? 'inline-flex' : 'none';
    }
  }

  function startTimer() {
    if (timerRunning) return;
    timerRemainSec = getTimerTotalSec();
    if (timerRemainSec <= 0) {
      showToast('No screen time earned yet! Complete tasks to earn time.');
      return;
    }
    timerRunning = true;
    showFullscreenTimer();
    updateTimerUI();
    timerInterval = setInterval(() => {
      timerRemainSec--;
      const rec = getTodayRec();
      rec.timerUsedSec = (rec.timerUsedSec || 0) + 1;
      saveState();
      updateTimerUI();
      updateFullscreenTimer();
      if (timerRemainSec <= 0) {
        closeFullscreenTimer();
        stopTimer();
        showTimesUp();
      }
    }, 1000);
    updateTimerUI();
  }

  function pauseTimer() {
    if (!timerRunning) return;
    timerRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;
    updateTimerUI();
  }

  function stopTimer() {
    timerRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;
    timerRemainSec = 0;
    updateTimerUI();
  }

  function resetTimer() {
    stopTimer();
    const rec = getTodayRec();
    rec.timerUsedSec = 0;
    saveState();
    timerRemainSec = getTimerTotalSec();
    updateTimerUI();
  }

  function showTimesUp() {
    const overlay = document.getElementById('stTimesUpOverlay');
    if (overlay) {
      overlay.style.display = 'flex';
      // Pulse animation restart
      const msg = overlay.querySelector('.stTimesUpMsg');
      if (msg) {
        msg.style.animation = 'none';
        void msg.offsetWidth; // reflow
        msg.style.animation = '';
      }
    }
  }

  function dismissTimesUp() {
    const overlay = document.getElementById('stTimesUpOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  function updateTimerUI() {
    const display   = document.getElementById('stTimerDisplay');
    const startBtn  = document.getElementById('stTimerStartBtn');
    const pauseBtn  = document.getElementById('stTimerPauseBtn');
    const resetBtn  = document.getElementById('stTimerResetBtn');
    const timerCard = document.getElementById('stTimerCard');

    const totalAvail = getTimerTotalSec();
    const showSec    = timerRunning ? timerRemainSec : totalAvail;

    if (display) {
      display.textContent = fmtSec(showSec);
      display.className   = 'stTimerDisplay' +
        (showSec <= 60 && showSec > 0 ? ' stTimerWarning' : '') +
        (showSec <= 0 ? ' stTimerEmpty' : '');
    }

    if (timerCard) {
      timerCard.className = 'stTimerCard' +
        (timerRunning ? ' stTimerActive' : '') +
        (showSec <= 0 && !timerRunning ? ' stTimerDepleted' : '');
    }

    if (startBtn) {
      startBtn.style.display = timerRunning ? 'none' : 'inline-flex';
      startBtn.disabled      = totalAvail <= 0 && !timerRunning;
    }
    if (pauseBtn) {
      pauseBtn.style.display = timerRunning ? 'inline-flex' : 'none';
    }
    if (resetBtn) {
      resetBtn.style.display = (!timerRunning && (getTodayRec().timerUsedSec || 0) > 0) ? 'inline-flex' : 'none';
    }

    // Sub-label under timer
    const subLabel = document.getElementById('stTimerSubLabel');
    if (subLabel) {
      if (timerRunning) {
        subLabel.textContent = 'Screen time is counting down…';
      } else if (totalAvail <= 0) {
        subLabel.textContent = 'No time remaining — earn more!';
      } else {
        const used = getTodayRec().timerUsedSec || 0;
        if (used > 0) {
          subLabel.textContent = `${fmtSec(used)} used today`;
        } else {
          subLabel.textContent = `${fmtSec(totalAvail)} available — press Start!`;
        }
      }
    }
  }

  // ── PIN modal ──────────────────────────────
  let pinCallback = null;

  function openPinModal(onSuccess) {
    pinCallback = onSuccess;
    const modal = document.getElementById('stPinModal');
    if (!modal) return;
    document.getElementById('stPinInput').value = '';
    document.getElementById('stPinError').style.display = 'none';
    modal.style.display = 'flex';
    setTimeout(() => document.getElementById('stPinInput').focus(), 100);
  }

  function closePinModal() {
    const modal = document.getElementById('stPinModal');
    if (modal) modal.style.display = 'none';
    pinCallback = null;
  }

  function submitPin() {
    const entered = document.getElementById('stPinInput').value.trim();
    if (entered === PARENT_PIN) {
      closePinModal();
      if (typeof pinCallback === 'function') pinCallback();
    } else {
      const err = document.getElementById('stPinError');
      err.style.display = 'block';
      err.textContent = 'Incorrect PIN. Try again.';
      document.getElementById('stPinInput').value = '';
      document.getElementById('stPinInput').focus();
    }
  }

  // ── UI builder ─────────────────────────────
  function buildPanel() {
    const panel = document.createElement('div');
    panel.className = 'dashPanel stPanel';
    panel.id = 'screenTimePanel';

    panel.innerHTML = `
      <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> Screen Time Earned Today</h3>

      <!-- Summary bar -->
      <div class="stSummary">
        <div class="stSummaryNums">
          <span class="stEarnedNum" id="stEarnedNum">0</span>
          <span class="stSummarySlash"> / </span>
          <span class="stCapNum" id="stCapNum">${DEFAULT_CAP}</span>
          <span class="stSummaryUnit"> min</span>
        </div>
        <div class="stSummaryLabel" id="stSummaryLabel">Keep earning to unlock screen time!</div>
      </div>

      <div class="stBarWrap">
        <div class="stBarTrack">
          <div class="stBar" id="stProgressBar" style="width:0%"></div>
        </div>
        <span class="stPct" id="stPercent">0%</span>
      </div>

      <div id="stCapBanner" class="stCapBanner" style="display:none;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><path d="M6 9H3V4h3M18 9h3V4h-3"/><path d="M6 4h12v7a6 6 0 0 1-12 0V4z"/><path d="M12 17v4"/><path d="M8 21h8"/></svg> Daily cap reached! Ask a parent to unlock more time.
      </div>

      <!-- ── 3-column body ── -->
      <div class="stBodyGrid">

        <!-- COL 1: Timer -->
        <div class="stCol stColTimer">
          <div class="stTimerCard" id="stTimerCard">
            <div class="stTimerDisplay" id="stTimerDisplay">00:00</div>
            <div class="stTimerSubLabel" id="stTimerSubLabel">Earn screen time to start the timer!</div>
            <div class="stTimerBtns">
              <button class="stTimerBtn stTimerBtnStart" id="stTimerStartBtn">▶ Start</button>
              <button class="stTimerBtn stTimerBtnPause" id="stTimerPauseBtn" style="display:none;"><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause</button>
              <button class="stTimerBtn stTimerBtnReset" id="stTimerResetBtn" style="display:none;">↺ Reset</button>
            </div>
          </div>
          <!-- Church inside timer column -->
          <div class="stSection">
            <div class="stSectionTitle"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M10 4h4"/><path d="M5 10h14l1 11H4L5 10z"/><path d="M9 21v-6h6v6"/></svg> Church</div>
            <div class="stSource" id="stSrc_church">
              <div class="stSrcIcon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M10 4h4"/><path d="M5 10h14l1 11H4L5 10z"/><path d="M9 21v-6h6v6"/></svg></div>
              <div class="stSrcInfo">
                <div class="stSrcLabel">Church Time</div>
                <div class="stSrcReward">+${REWARDS.church} min</div>
              </div>
              <button class="stSrcBtn" data-src="church">Log</button>
            </div>
          </div>
        </div>

        <!-- COL 2: Exercise -->
        <div class="stCol stColExercise">
          <div class="stSection">
            <div class="stSectionTitle"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M4 13l4-4 3 3 4-4 3 3"/><path d="M4 20l4-4 3 3 4-4 3 3"/></svg> Exercise</div>
            <div class="stRunCard" id="stRunCard">
              <div class="stRunLeft">
                <span class="stRunIcon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="2"/><path d="M7 22l2-8-2-4h8l-2 4 2 8"/><path d="M5 10l2-2 4 2 3-3 3 1"/></svg></span>
                <div class="stRunInfo">
                  <div class="stRunLabel">Running</div>
                  <div class="stRunReward">+${REWARDS.run_per_mile} min per mile</div>
                  <div class="stRunTotal" id="stRunTotal">0 miles logged today</div>
                </div>
              </div>
              <div class="stRunRight">
                <input type="number" id="stMilesInput" class="stMilesInput" min="0.25" max="26" step="0.25" placeholder="Miles" />
                <button class="stSrcBtn" id="stLogRunBtn">Log</button>
              </div>
            </div>
            <div class="stWorkoutList" id="stWorkoutGrid">
              ${WORKOUT_ACTIVITIES.map(a => `
              <div class="stWorkoutRow" id="stWkt_${a.id}">
                <div class="stWktIcon">${a.icon}</div>
                <div class="stWktLabel">${a.label}</div>
                <div class="stWktReward">+${REWARDS[a.id]} min</div>
                <button class="stSrcBtn stWktBtn" data-wkt="${a.id}">Log</button>
              </div>`).join('')}
            </div>
          </div>
        </div>

        <!-- COL 3: School + Parent Controls + History -->
        <div class="stCol stColSchool">
          <div class="stSection">
            <div class="stSectionTitle"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> School Work</div>
            <div class="stSchoolList" id="stSchoolGrid">
              ${SCHOOL_SUBJECTS.map(s => `
              <div class="stSchoolRow" id="stSubj_${s.id}">
                <div class="stSubjIcon">${s.icon}</div>
                <div class="stSubjLabel">${s.label}</div>
                <div class="stSubjReward">+${REWARDS.school_subject} min</div>
                <div class="stSubjBtns">
                  <button class="stSrcBtn stSubjLogBtn" data-subj="${s.id}">Log</button>
                  <button class="stSrcBtn stSubjBonusBtn stParentBtn" data-subj="${s.id}" title="Parent: add bonus minutes"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></button>
                </div>
              </div>`).join('')}
            </div>
          </div>
          <div class="stSection">
            <div class="stSectionTitle"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Parent Controls</div>
            <div class="stParentGrid">
              <button class="stBtn stBtnParent" id="stBehaviorBtn"><svg class="ww-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg> Behavior Award</button>
              <button class="stBtn stBtnParent" id="stUnlockCapBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg> Add More Time</button>
            </div>
            <div id="stBehaviorAwardsList" class="stAwardsList"></div>
          </div>
          <div class="stSection">
            <div class="stSectionTitle"><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><rect x="7" y="14" width="3" height="3" rx="1" fill="currentColor"/></svg> This Week</div>
            <div id="stHistory" class="stHistory"></div>
          </div>
        </div>

      </div><!-- end stBodyGrid -->
    `;
    return panel;
  }

  function buildTimesUpOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'stTimesUpOverlay';
    overlay.className = 'stTimesUpOverlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="stTimesUpContent">
        <div class="stTimesUpMsg"><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> TIME'S UP!</div>
        <div class="stTimesUpSub">Your screen time for today is all done!</div>
        <div class="stTimesUpSub2">Great job earning it — see you tomorrow, hero! <svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 1 3 3v1l3 2v3l-3 1v1a3 3 0 0 1-6 0v-1l-3-1V8l3-2V5a3 3 0 0 1 3-3z"/><path d="M9 21l3-8 3 8"/></svg></div>
        <button class="stTimesUpDismiss" id="stTimesUpDismiss">OK, Got It!</button>
      </div>
    `;
    return overlay;
  }

  function buildPinModal() {
    const modal = document.createElement('div');
    modal.id = 'stPinModal';
    modal.className = 'stPinModal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="stPinCard">
        <div class="stPinTitle"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Parent PIN Required</div>
        <div class="stPinSubtitle">Enter the parent PIN to continue</div>
        <input type="password" id="stPinInput" class="stPinInput" maxlength="10" placeholder="Enter PIN" autocomplete="off" />
        <div id="stPinError" class="stPinError" style="display:none;"></div>
        <div class="stPinBtns">
          <button class="stBtn stBtnSet" id="stPinSubmit">Confirm</button>
          <button class="stBtn stBtnReset" id="stPinCancel">Cancel</button>
        </div>
      </div>
    `;
    return modal;
  }

  function buildBehaviorModal() {
    const modal = document.createElement('div');
    modal.id = 'stBehaviorModal';
    modal.className = 'stPinModal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="stPinCard">
        <div class="stPinTitle"><svg class="ww-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg> Behavior Award</div>
        <div class="stPinSubtitle">How many minutes to award?</div>
        <input type="number" id="stBehaviorMin" class="stPinInput" min="1" max="120" placeholder="e.g. 15" />
        <input type="text" id="stBehaviorNote" class="stPinInput" maxlength="60" placeholder="Note (e.g. Great at school today!)" style="margin-top:8px;" />
        <div class="stPinBtns">
          <button class="stBtn stBtnStart" id="stBehaviorConfirm">Award Time</button>
          <button class="stBtn stBtnReset" id="stBehaviorCancel">Cancel</button>
        </div>
      </div>
    `;
    return modal;
  }

  function buildUnlockCapModal() {
    const modal = document.createElement('div');
    modal.id = 'stUnlockCapModal';
    modal.className = 'stPinModal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="stPinCard">
        <div class="stPinTitle"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg> Add More Screen Time</div>
        <div class="stPinSubtitle">How many extra minutes to allow today?</div>
        <input type="number" id="stUnlockMin" class="stPinInput" min="1" max="240" placeholder="e.g. 30" />
        <div class="stPinBtns">
          <button class="stBtn stBtnStart" id="stUnlockConfirm">Add Time</button>
          <button class="stBtn stBtnReset" id="stUnlockCancel">Cancel</button>
        </div>
      </div>
    `;
    return modal;
  }

  function buildSchoolBonusModal() {
    const modal = document.createElement('div');
    modal.id = 'stSchoolBonusModal';
    modal.className = 'stPinModal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="stPinCard">
        <div class="stPinTitle" id="stSchoolBonusTitle">Bonus Minutes</div>
        <div class="stPinSubtitle">How many bonus minutes to add for this subject?</div>
        <input type="number" id="stSchoolBonusMin" class="stPinInput" min="1" max="60" placeholder="e.g. 10" />
        <div class="stPinBtns">
          <button class="stBtn stBtnStart" id="stSchoolBonusConfirm">Add Bonus</button>
          <button class="stBtn stBtnReset" id="stSchoolBonusCancel">Cancel</button>
        </div>
      </div>
    `;
    return modal;
  }

  // ── UI update ──────────────────────────────
  function updateUI() {
    const rec      = getTodayRec();
    const earned   = getEarned();
    const cap      = getDailyCap();
    const pct      = Math.min(100, Math.round((earned / cap) * 100));
    const remaining = getRemaining();

    // Summary
    const earnedEl = document.getElementById('stEarnedNum');
    const capEl    = document.getElementById('stCapNum');
    const labelEl  = document.getElementById('stSummaryLabel');
    if (earnedEl) earnedEl.textContent = earned;
    if (capEl)    capEl.textContent    = cap;
    if (labelEl) {
      if (remaining <= 0) {
        labelEl.innerHTML = '<svg class=\"ww-icon\" width=\"20\" height=\"20\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M6 2h12v6a6 6 0 0 1-12 0V2z\"/><path d=\"M6 5H2v2a4 4 0 0 0 4 4M18 5h4v2a4 4 0 0 1-4 4\"/><path d=\"M12 14v4M8 18h8\"/></svg> Daily cap reached! Great job, hero!';
        labelEl.className   = 'stSummaryLabel danger';
      } else {
        labelEl.textContent = `${remaining} min remaining — keep earning!`;
        labelEl.className   = 'stSummaryLabel';
      }
    }

    // Progress bar
    const barEl = document.getElementById('stProgressBar');
    const pctEl = document.getElementById('stPercent');
    if (barEl) {
      barEl.style.width = pct + '%';
      barEl.className   = 'stBar' + (pct >= 100 ? ' danger' : pct >= 75 ? ' warning' : '');
    }
    if (pctEl) pctEl.textContent = pct + '%';

    // Cap banner
    const banner = document.getElementById('stCapBanner');
    if (banner) banner.style.display = remaining <= 0 ? 'block' : 'none';

    // Timer (update available time if not running)
    if (!timerRunning) {
      timerRemainSec = getTimerTotalSec();
    }
    updateTimerUI();

    // Church button
    const prayerBtn  = document.querySelector('.stSrcBtn[data-src="church"]');
    const prayerCard = document.getElementById('stSrc_church');
    if (prayerBtn && prayerCard) {
      const claimed = !!rec.sources['church'];
      prayerBtn.disabled    = claimed;
      prayerBtn.textContent = claimed ? 'Done ✓' : 'Log';
      prayerCard.classList.toggle('stSourceDone', claimed);
    }

    // Running total
    const runTotal = document.getElementById('stRunTotal');
    if (runTotal) {
      const miles = rec.milesRun || 0;
      runTotal.textContent = `${miles} mile${miles !== 1 ? 's' : ''} logged today`;
    }

    // Workout activity buttons
    WORKOUT_ACTIVITIES.forEach(a => {
      const card = document.getElementById(`stWkt_${a.id}`);
      const btn  = document.querySelector(`.stWktBtn[data-wkt="${a.id}"]`);
      if (!card || !btn) return;
      const claimed = !!rec.sources[`wkt_${a.id}`];
      btn.disabled      = claimed;
      btn.textContent   = claimed ? '✓' : 'Log';
      card.classList.toggle('stSourceDone', claimed);
    });

    // School subjects
    SCHOOL_SUBJECTS.forEach(s => {
      const card   = document.getElementById(`stSubj_${s.id}`);
      const logBtn = document.querySelector(`.stSubjLogBtn[data-subj="${s.id}"]`);
      if (!card || !logBtn) return;
      const claimed = !!rec.sources[`school_${s.id}`];
      logBtn.disabled     = claimed;
      logBtn.textContent  = claimed ? '✓' : 'Log';
      card.classList.toggle('stSourceDone', claimed);
      const bonus = rec.schoolBonus[s.id] || 0;
      let bonusEl = card.querySelector('.stSubjBonus');
      if (!bonusEl) {
        bonusEl = document.createElement('div');
        bonusEl.className = 'stSubjBonus';
        card.appendChild(bonusEl);
      }
      bonusEl.textContent = bonus > 0 ? `+${bonus} min bonus` : '';
    });

    renderBehaviorAwards();
    renderHistory();
  }

  function renderBehaviorAwards() {
    const el = document.getElementById('stBehaviorAwardsList');
    if (!el) return;
    const awards = getTodayRec().behaviorAwards;
    if (!awards.length) { el.innerHTML = ''; return; }
    el.innerHTML = awards.map(a =>
      `<div class="stAwardItem">⭐ +${a.minutes} min — "${a.note}"</div>`
    ).join('');
  }

  function renderHistory() {
    const el = document.getElementById('stHistory');
    if (!el) return;
    const keys = Object.keys(st.days).sort().reverse().slice(0, 7);
    if (!keys.length) { el.innerHTML = '<div class="stHistEmpty">No history yet.</div>'; return; }
    el.innerHTML = `
      <div class="stHistHeader"><span>Date</span><span>Earned</span><span>Cap</span><span>%</span></div>
      ${keys.map(k => {
        const r   = st.days[k];
        const cap = DEFAULT_CAP + (r.bonusCap || 0);
        const pct = Math.min(100, Math.round((r.earned / cap) * 100));
        const icon = r.earned >= cap ? `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2h12v6a6 6 0 0 1-12 0V2z"/><path d="M6 5H2v2a4 4 0 0 0 4 4M18 5h4v2a4 4 0 0 1-4 4"/><path d="M12 14v4M8 18h8"/></svg>` : r.earned > 0 ? `<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>` : '—';
        return `<div class="stHistRow">
          <span class="stHistDate">${k}</span>
          <span class="stHistTime">${r.earned}m</span>
          <span class="stHistTime">${cap}m</span>
          <span class="stHistPct">${icon} ${pct}%</span>
        </div>`;
      }).join('')}
    `;
  }

  // ── Styles ─────────────────────────────────
  function injectStyles() {
    if (document.getElementById('stStyles')) return;
    const style = document.createElement('style');
    style.id = 'stStyles';
    style.textContent = `
      /* ── Panel ── */
      .stPanel { position: relative; grid-column: 1 / -1; }

      /* ── 3-column body grid ── */
      .stBodyGrid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 20px;
        margin-top: 14px;
        align-items: start;
      }
      .stCol {
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      @media (max-width: 980px) {
        .stBodyGrid { grid-template-columns: 1fr 1fr; }
      }
      @media (max-width: 600px) {
        .stBodyGrid { grid-template-columns: 1fr; }
      }

      /* ── Summary ── */
      .stSummary { text-align: center; margin: 8px 0 6px; }
      .stEarnedNum {
        font-family: var(--fantasy-font);
        font-size: 2.2rem; color: var(--gold); line-height: 1;
      }
      .stSummarySlash { font-size: 1.4rem; color: var(--muted); margin: 0 4px; }
      .stCapNum { font-family: var(--fantasy-font); font-size: 1.4rem; color: var(--muted); }
      .stSummaryUnit { font-size: 0.9rem; color: var(--muted); }
      .stSummaryLabel { font-size: 0.78rem; color: var(--muted); margin-top: 4px; }
      .stSummaryLabel.danger { color: var(--red); font-weight: 700; }

      /* ── Progress bar ── */
      .stBarWrap { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
      .stBarTrack {
        flex: 1; height: 12px;
        background: rgba(255,255,255,0.08);
        border-radius: 8px; overflow: hidden;
      }
      .stBar {
        height: 100%; background: var(--green);
        border-radius: 8px;
        transition: width 0.6s ease, background 0.4s ease;
      }
      .stBar.warning { background: var(--orange); }
      .stBar.danger  { background: var(--red); }
      .stPct { font-size: 0.75rem; color: var(--muted); min-width: 36px; text-align: right; }

      /* ── Cap banner ── */
      .stCapBanner {
        background: rgba(125,255,180,0.12);
        border: 1px solid var(--green);
        border-radius: 10px; color: var(--green);
        font-weight: 700; font-size: 0.82rem;
        padding: 7px 12px; margin-bottom: 10px; text-align: center;
      }

      /* ── Countdown Timer Card ── */
      .stTimerCard {
        background: rgba(212,165,48,0.08);
        border: 2px solid rgba(212,165,48,0.3);
        border-radius: 18px;
        padding: 20px 16px 16px;
        text-align: center;
        margin: 14px 0;
        transition: border-color 0.4s, background 0.4s;
      }
      .stTimerCard.stTimerActive {
        background: rgba(125,255,180,0.08);
        border-color: rgba(125,255,180,0.5);
        box-shadow: 0 0 20px rgba(125,255,180,0.15);
      }
      .stTimerCard.stTimerDepleted {
        background: rgba(255,80,80,0.07);
        border-color: rgba(255,80,80,0.35);
      }
      .stTimerDisplay {
        font-family: var(--fantasy-font);
        font-size: 3.6rem;
        color: var(--gold);
        letter-spacing: 0.04em;
        line-height: 1;
        margin-bottom: 6px;
        transition: color 0.4s;
      }
      .stTimerDisplay.stTimerWarning { color: #ff9f43; animation: stTimerPulse 1s ease-in-out infinite; }
      .stTimerDisplay.stTimerEmpty   { color: var(--red); }
      .stTimerSubLabel {
        font-size: 0.75rem; color: var(--muted); margin-bottom: 14px;
      }
      .stTimerBtns {
        display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;
      }
      .stTimerBtn {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 9px 22px; border: none; border-radius: 10px;
        font-size: 0.9rem; font-weight: 700; cursor: pointer;
        transition: filter 0.15s, transform 0.1s;
        letter-spacing: 0.03em;
      }
      .stTimerBtn:active { transform: scale(0.95); }
      .stTimerBtn:hover:not(:disabled) { filter: brightness(1.15); }
      .stTimerBtn:disabled { opacity: 0.4; cursor: default; }
      .stTimerBtnStart { background: var(--green); color: #0a1a10; }
      .stTimerBtnPause { background: #ff9f43; color: #1a0800; }
      .stTimerBtnReset { background: rgba(255,255,255,0.12); color: var(--muted); }

      @keyframes stTimerPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.7; transform: scale(1.04); }
      }

      /* ── Times Up Overlay ── */
      .stTimesUpOverlay {
        position: fixed; inset: 0; z-index: 99999;
        background: rgba(5,0,15,0.96);
        display: flex; align-items: center; justify-content: center;
        flex-direction: column;
        backdrop-filter: blur(8px);
      }
      .stTimesUpContent {
        text-align: center; padding: 40px 30px;
        display: flex; flex-direction: column; align-items: center; gap: 16px;
      }
      .stTimesUpMsg {
        font-family: var(--fantasy-font);
        font-size: clamp(3rem, 12vw, 7rem);
        color: var(--gold);
        text-shadow: 0 0 40px rgba(212,165,48,0.8), 0 0 80px rgba(212,165,48,0.4);
        animation: stTimesUpPulse 1.4s ease-in-out infinite;
        line-height: 1.1;
      }
      .stTimesUpSub {
        font-size: clamp(1rem, 3.5vw, 1.5rem);
        color: var(--ink); max-width: 480px;
      }
      .stTimesUpSub2 {
        font-size: clamp(0.85rem, 2.5vw, 1.1rem);
        color: var(--muted); max-width: 420px;
      }
      .stTimesUpDismiss {
        margin-top: 10px;
        padding: 14px 40px; border: none; border-radius: 14px;
        background: var(--gold); color: #1a0e00;
        font-family: var(--fantasy-font); font-size: 1.1rem;
        font-weight: 700; cursor: pointer; letter-spacing: 0.04em;
        transition: filter 0.15s, transform 0.1s;
        box-shadow: 0 0 20px rgba(212,165,48,0.5);
      }
      .stTimesUpDismiss:hover { filter: brightness(1.15); }
      .stTimesUpDismiss:active { transform: scale(0.96); }

      @keyframes stTimesUpPulse {
        0%, 100% { text-shadow: 0 0 40px rgba(212,165,48,0.8), 0 0 80px rgba(212,165,48,0.4); transform: scale(1); }
        50%       { text-shadow: 0 0 60px rgba(212,165,48,1), 0 0 120px rgba(212,165,48,0.6); transform: scale(1.03); }
      }

      /* ── Section ── */
      .stSection { margin-top: 14px; }
      .stSectionTitle {
        font-size: 0.78rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.07em;
        color: var(--gold); margin-bottom: 8px;
        border-bottom: 1px solid rgba(212,165,48,0.2);
        padding-bottom: 4px;
        display: flex; align-items: center; gap: 6px;
      }
      .stSectionTitle svg { flex-shrink: 0; }

      /* ── Church source card (single row) ── */
      .stSource {
        display: flex; align-items: center; gap: 10px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px; padding: 10px 12px;
        transition: background 0.2s;
      }
      .stSource.stSourceDone {
        background: rgba(125,255,180,0.07);
        border-color: rgba(125,255,180,0.25);
      }
      .stSrcIcon { font-size: 1.5rem; flex-shrink: 0; display:flex; align-items:center; justify-content:center; color: var(--gold); }
      .stSrcInfo { flex: 1; }
      .stSrcLabel { font-size: 0.82rem; color: var(--ink); font-weight: 600; }
      .stSrcReward { font-size: 0.72rem; color: var(--green); }

      /* ── Running card ── */
      .stRunCard {
        display: flex; align-items: center; justify-content: space-between;
        gap: 10px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px; padding: 10px 12px;
        margin-bottom: 8px;
      }
      .stRunLeft { display: flex; align-items: center; gap: 10px; flex: 1; }
      .stRunIcon { font-size: 1.6rem; flex-shrink: 0; display:flex; align-items:center; justify-content:center; color: var(--gold); }
      .stRunInfo { flex: 1; }
      .stRunLabel { font-size: 0.82rem; font-weight: 700; color: var(--ink); }
      .stRunReward { font-size: 0.7rem; color: var(--green); }
      .stRunTotal { font-size: 0.68rem; color: var(--gold); margin-top: 2px; }
      .stRunRight { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
      .stMilesInput {
        width: 68px; padding: 6px 8px; border-radius: 8px;
        border: 1px solid rgba(212,165,48,0.4);
        background: rgba(255,255,255,0.06); color: var(--ink);
        font-size: 0.85rem; text-align: center; box-sizing: border-box;
      }
      .stMilesInput:focus { outline: none; border-color: var(--gold); }

      /* ── Workout list — single column ── */
      .stWorkoutList { display: flex; flex-direction: column; gap: 8px; }
      .stWorkoutRow {
        display: flex; align-items: center; gap: 10px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px; padding: 10px 12px;
        transition: background 0.2s;
      }
      .stWorkoutRow.stSourceDone {
        background: rgba(125,255,180,0.07);
        border-color: rgba(125,255,180,0.25);
      }
      .stWktIcon { font-size: 1.4rem; flex-shrink: 0; display:flex; align-items:center; justify-content:center; color: var(--gold); width:32px; }
      .stWktLabel { flex: 1; font-size: 0.82rem; font-weight: 700; color: var(--ink); }
      .stWktReward { font-size: 0.72rem; color: var(--green); flex-shrink: 0; margin-right: 4px; }

      /* ── School list — single column ── */
      .stSchoolList { display: flex; flex-direction: column; gap: 8px; }
      .stSchoolRow {
        display: flex; align-items: center; gap: 10px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px; padding: 10px 12px;
        transition: background 0.2s;
      }
      .stSchoolRow.stSourceDone {
        background: rgba(125,255,180,0.07);
        border-color: rgba(125,255,180,0.25);
      }
      .stSubjIcon { font-size: 1.4rem; flex-shrink: 0; display:flex; align-items:center; justify-content:center; color: var(--gold); width:32px; }
      .stSubjLabel { flex: 1; font-size: 0.82rem; font-weight: 700; color: var(--ink); }
      .stSubjReward { font-size: 0.72rem; color: var(--green); flex-shrink: 0; }
      .stSubjBonus { font-size: 0.68rem; color: var(--gold); }
      .stSubjBtns { display: flex; gap: 4px; flex-shrink: 0; }

      /* ── Buttons ── */
      .stBtn, .stSrcBtn {
        padding: 6px 12px; border: none; border-radius: 8px;
        font-size: 0.78rem; font-weight: 700; cursor: pointer;
        transition: filter 0.15s, transform 0.1s; letter-spacing: 0.02em;
      }
      .stBtn:active, .stSrcBtn:active { transform: scale(0.95); }
      .stBtn:hover:not(:disabled), .stSrcBtn:hover:not(:disabled) { filter: brightness(1.15); }
      .stSrcBtn { background: var(--gold); color: #1a0e00; flex-shrink: 0; }
      .stSrcBtn:disabled { background: rgba(255,255,255,0.1); color: var(--muted); cursor: default; }
      .stSubjBonusBtn { background: rgba(212,165,48,0.2); color: var(--gold); font-size: 0.7rem; padding: 5px 8px; }
      .stBtnParent { background: rgba(124,58,237,0.25); color: #c084fc; border: 1px solid rgba(124,58,237,0.4); flex: 1; }
      .stBtnStart  { background: var(--green); color: #0a1a10; }
      .stBtnReset  { background: rgba(255,255,255,0.1); color: var(--muted); }
      .stBtnSet    { background: var(--gold); color: #1a0e00; }

      /* ── Parent grid ── */
      .stParentGrid { display: flex; gap: 8px; }

      /* ── Awards list ── */
      .stAwardsList { margin-top: 8px; }
      .stAwardItem {
        font-size: 0.75rem; color: var(--gold);
        background: rgba(255,211,110,0.07);
        border-radius: 8px; padding: 5px 10px; margin-bottom: 4px;
      }

      /* ── History ── */
      .stHistHeader, .stHistRow {
        display: grid; grid-template-columns: 1fr 50px 50px 60px;
        gap: 4px; font-size: 0.72rem; padding: 3px 4px; border-radius: 6px;
      }
      .stHistHeader { color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
      .stHistRow { color: var(--ink); background: rgba(255,255,255,0.03); margin-bottom: 2px; }
      .stHistRow:hover { background: rgba(255,255,255,0.07); }
      .stHistDate { color: var(--muted); }
      .stHistTime { color: var(--gold); font-weight: 600; }
      .stHistPct  { color: var(--green); }
      .stHistEmpty { color: var(--muted); font-size: 0.78rem; text-align: center; padding: 8px; }

      /* ── PIN / modal ── */
      .stPinModal {
        position: fixed; inset: 0; z-index: 9999;
        background: rgba(10,5,20,0.85);
        display: flex; align-items: center; justify-content: center;
        backdrop-filter: blur(6px);
      }
      .stPinCard {
        background: var(--panel);
        border: 1px solid var(--golden-border);
        border-radius: 20px; padding: 28px 24px;
        min-width: 280px; max-width: 340px; width: 90%;
        box-shadow: 0 0 40px rgba(212,165,48,0.3);
        display: flex; flex-direction: column; gap: 10px;
        animation: slideUp 0.25s ease;
      }
      .stPinTitle { font-family: var(--fantasy-font); font-size: 1.2rem; color: var(--gold); text-align: center; }
      .stPinSubtitle { font-size: 0.8rem; color: var(--muted); text-align: center; }
      .stPinInput {
        width: 100%; padding: 10px 14px; border-radius: 10px;
        border: 1px solid rgba(212,165,48,0.4);
        background: rgba(255,255,255,0.06); color: var(--ink);
        font-size: 1rem; text-align: center; box-sizing: border-box;
      }
      .stPinInput:focus { outline: none; border-color: var(--gold); }
      .stPinError { color: var(--red); font-size: 0.78rem; text-align: center; font-weight: 600; }
      .stPinBtns { display: flex; gap: 8px; margin-top: 4px; }
      .stPinBtns .stBtn { flex: 1; padding: 10px; font-size: 0.88rem; }
    `;
    document.head.appendChild(style);
  }

  // ── Wire up events ──────────────────────────
  function wireEvents() {
    // Timer buttons
    document.getElementById('stTimerStartBtn')?.addEventListener('click', startTimer);
    document.getElementById('stTimerPauseBtn')?.addEventListener('click', pauseTimer);
    document.getElementById('stTimerResetBtn')?.addEventListener('click', resetTimer);

    // Times Up dismiss
    document.getElementById('stTimesUpDismiss')?.addEventListener('click', dismissTimesUp);

    // Church log button
    const prayerBtn = document.querySelector('.stSrcBtn[data-src="church"]');
    if (prayerBtn) {
      prayerBtn.addEventListener('click', () => {
        const added = awardMinutes('church', REWARDS.church, 'Church Time');
        if (added > 0) showToast(`<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v4M10 4h4"/><path d="M4 22V10l8-6 8 6v12H4z"/><path d="M9 22v-6h6v6"/><path d="M10 14h4"/></svg> +${added} min for Church Time!`);
        else showToast('Already logged today ✓');
        updateUI();
      });
    }

    // Running log button
    const logRunBtn = document.getElementById('stLogRunBtn');
    if (logRunBtn) {
      logRunBtn.addEventListener('click', () => {
        const input = document.getElementById('stMilesInput');
        const miles = parseFloat(input.value);
        if (!miles || miles <= 0) {
          showToast('Enter the number of miles first!');
          return;
        }
        const added = awardRunMiles(miles);
        if (added > 0) showToast(`<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13" cy="4" r="2"/><path d="M7.5 13.5l2-3.5 3 3 2-4 3 5"/><path d="M7 21l2-5 3 2 2-4"/></svg> +${added} min for ${miles} mile${miles !== 1 ? 's' : ''}!`);
        else showToast('Daily cap reached — ask a parent to add more time!');
        input.value = '';
        updateUI();
      });
    }

    // Protein is Good! full-screen popup
    function showProteinPopup() {
      const overlay = document.createElement('div');
      overlay.style.cssText = [
        'position:fixed','top:0','left:0','width:100vw','height:100vh',
        'background:linear-gradient(135deg,#0a0a2e 0%,#1a0a3e 50%,#0a1a2e 100%)',
        'z-index:99999','display:flex','flex-direction:column',
        'align-items:center','justify-content:center','cursor:pointer',
        'animation:proteinFadeIn 0.4s ease'
      ].join(';');

      overlay.innerHTML = `
        <style>
          @keyframes proteinFadeIn { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
          @keyframes proteinBounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
          @keyframes proteinShake  { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-5deg)} 75%{transform:rotate(5deg)} }
          @keyframes proteinGlow   { 0%,100%{text-shadow:0 0 20px #00e5ff,0 0 40px #00e5ff} 50%{text-shadow:0 0 40px #00e5ff,0 0 80px #00e5ff,0 0 120px #ffffff} }
          .protein-icon  { font-size:8rem; animation:proteinShake 0.6s ease infinite; margin-bottom:1rem; }
          .protein-title { font-family:'Cinzel Decorative',serif; font-size:3.5rem; font-weight:900;
                           color:#00e5ff; animation:proteinGlow 1.5s ease infinite; text-align:center;
                           line-height:1.2; margin-bottom:0.5rem; }
          .protein-sub   { font-family:'Cinzel',serif; font-size:1.4rem; color:#ffd700;
                           animation:proteinBounce 1s ease infinite; margin-bottom:2rem; }
          .protein-mins  { font-family:'Cinzel Decorative',serif; font-size:2rem; color:#7fff00;
                           background:rgba(0,229,255,0.15); border:2px solid #00e5ff;
                           border-radius:12px; padding:0.5rem 2rem; margin-bottom:2rem; }
          .protein-tap   { font-family:'Cinzel',serif; font-size:1rem; color:rgba(255,255,255,0.5); }
          .protein-stars { font-size:2rem; letter-spacing:0.5rem; margin-bottom:1rem; }
        </style>
        <div class="protein-stars">⭐ ⭐ ⭐ ⭐ ⭐</div>
        <div class="protein-icon"><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2h8l2 6H6z"/><rect x="6" y="8" width="12" height="14" rx="2"/><path d="M10 13h4M12 11v4"/></svg></div>
        <div class="protein-title">PROTEIN<br>IS GOOD!</div>
        <div class="protein-sub"><svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 2.5c0 1.5-1.5 3-1.5 3H9a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1l-1 3H7a4 4 0 0 0-4 4h18a4 4 0 0 0-4-4h-2l-1-3h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1.5z"/></svg> Fuel Your Adventure! <svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 2.5c0 1.5-1.5 3-1.5 3H9a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1l-1 3H7a4 4 0 0 0-4 4h18a4 4 0 0 0-4-4h-2l-1-3h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1.5z"/></svg></div>
        <div class="protein-mins">+12 min Screen Time Earned!</div>
        <div class="protein-tap">Tap anywhere to continue</div>
      `;

      overlay.addEventListener('click', () => overlay.remove());
      document.body.appendChild(overlay);
      setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 5000);
    }

    // Workout activity buttons
    document.querySelectorAll('.stWktBtn[data-wkt]').forEach(btn => {
      btn.addEventListener('click', () => {
        const wkt   = btn.dataset.wkt;
        const mins  = REWARDS[wkt];
        const label = WORKOUT_ACTIVITIES.find(a => a.id === wkt)?.label || wkt;
        const added = awardMinutes(`wkt_${wkt}`, mins, label);
        if (added > 0) {
          showToast(`<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 2.5c0 1.5-1.5 3-1.5 3H9a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1l-1 3H7a4 4 0 0 0-4 4h18a4 4 0 0 0-4-4h-2l-1-3h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1.5z"/></svg> +${added} min for ${label}!`);
          if (wkt === 'protein_drink') showProteinPopup();
        } else {
          showToast('Already logged today ✓');
        }
        updateUI();
      });
    });

    // School subject log buttons
    document.querySelectorAll('.stSubjLogBtn[data-subj]').forEach(btn => {
      btn.addEventListener('click', () => {
        const subj  = btn.dataset.subj;
        const label = SCHOOL_SUBJECTS.find(s => s.id === subj)?.label || subj;
        const added = awardMinutes(`school_${subj}`, REWARDS.school_subject, `School: ${label}`);
        if (added > 0) showToast(`<svg class="ww-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> +${added} min for ${label}!`);
        else showToast('Already logged today ✓');
        updateUI();
      });
    });

    // School subject bonus (parent)
    let activeBonusSubj = null;
    document.querySelectorAll('.stSubjBonusBtn[data-subj]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeBonusSubj = btn.dataset.subj;
        const label = SCHOOL_SUBJECTS.find(s => s.id === activeBonusSubj)?.label || activeBonusSubj;
        openPinModal(() => {
          document.getElementById('stSchoolBonusTitle').textContent = `Bonus for ${label}`;
          document.getElementById('stSchoolBonusMin').value = '';
          document.getElementById('stSchoolBonusModal').style.display = 'flex';
        });
      });
    });

    document.getElementById('stSchoolBonusConfirm').addEventListener('click', () => {
      const mins = parseInt(document.getElementById('stSchoolBonusMin').value, 10);
      if (!mins || mins < 1) return;
      document.getElementById('stSchoolBonusModal').style.display = 'none';
      parentSchoolBonus(activeBonusSubj, mins);
    });
    document.getElementById('stSchoolBonusCancel').addEventListener('click', () => {
      document.getElementById('stSchoolBonusModal').style.display = 'none';
    });

    // Behavior award button
    document.getElementById('stBehaviorBtn').addEventListener('click', () => {
      openPinModal(() => {
        document.getElementById('stBehaviorMin').value  = '';
        document.getElementById('stBehaviorNote').value = '';
        document.getElementById('stBehaviorModal').style.display = 'flex';
      });
    });
    document.getElementById('stBehaviorConfirm').addEventListener('click', () => {
      const mins = parseInt(document.getElementById('stBehaviorMin').value, 10);
      const note = document.getElementById('stBehaviorNote').value.trim();
      if (!mins || mins < 1) return;
      document.getElementById('stBehaviorModal').style.display = 'none';
      parentBehaviorAward(mins, note);
    });
    document.getElementById('stBehaviorCancel').addEventListener('click', () => {
      document.getElementById('stBehaviorModal').style.display = 'none';
    });

    // Unlock cap button
    document.getElementById('stUnlockCapBtn').addEventListener('click', () => {
      openPinModal(() => {
        document.getElementById('stUnlockMin').value = '';
        document.getElementById('stUnlockCapModal').style.display = 'flex';
      });
    });
    document.getElementById('stUnlockConfirm').addEventListener('click', () => {
      const mins = parseInt(document.getElementById('stUnlockMin').value, 10);
      if (!mins || mins < 1) return;
      document.getElementById('stUnlockCapModal').style.display = 'none';
      parentAddCap(mins);
    });
    document.getElementById('stUnlockCancel').addEventListener('click', () => {
      document.getElementById('stUnlockCapModal').style.display = 'none';
    });

    // PIN modal submit / cancel
    document.getElementById('stPinSubmit').addEventListener('click', submitPin);
    document.getElementById('stPinCancel').addEventListener('click', closePinModal);
    document.getElementById('stPinInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') submitPin();
      if (e.key === 'Escape') closePinModal();
    });
  }

  // ── Mount ──────────────────────────────────
  function mount() {
    injectStyles();
    const dashboard = document.querySelector('.dashboard');
    if (!dashboard) { setTimeout(mount, 500); return; }
    if (document.getElementById('screenTimePanel')) return;

    const panel = buildPanel();
    dashboard.insertBefore(panel, dashboard.firstChild);

    document.body.appendChild(buildTimesUpOverlay());
    document.body.appendChild(buildPinModal());
    document.body.appendChild(buildBehaviorModal());
    document.body.appendChild(buildUnlockCapModal());
    document.body.appendChild(buildSchoolBonusModal());

    wireEvents();

    // Init timer display from saved state
    timerRemainSec = getTimerTotalSec();
    updateUI();
  }

  // ── Boot ───────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

})();
