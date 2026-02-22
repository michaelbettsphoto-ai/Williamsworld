
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
    school_subject:  5,   // per subject logged (ELA, Math, Science, Other)
  };

  // Workout activities (non-running)
  const WORKOUT_ACTIVITIES = [
    { id: 'pullups',    label: 'Pull-Ups',   icon: '💪' },
    { id: 'situps',     label: 'Sit-Ups',    icon: '🧘' },
    { id: 'pushups',    label: 'Push-Ups',   icon: '🏋️' },
    { id: 'stretching', label: 'Stretching', icon: '🤸' },
  ];

  const SCHOOL_SUBJECTS = [
    { id: 'ela',     label: 'ELA',     icon: '📖' },
    { id: 'math',    label: 'Math',    icon: '🔢' },
    { id: 'science', label: 'Science', icon: '🔬' },
    { id: 'other',   label: 'Other',   icon: '📝' },
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
      el.textContent = msg;
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
    showToast(`🔓 Parent unlocked +${extraMinutes} min! New cap: ${getDailyCap()} min`);
  }

  // Parent-only: behavior award (bypasses cap)
  function parentBehaviorAward(minutes, note) {
    const rec = getTodayRec();
    rec.earned += minutes;
    rec.behaviorAwards.push({ minutes, note: note || 'Great behavior!', ts: Date.now() });
    saveState();
    updateUI();
    showToast(`⭐ Behavior Award: +${minutes} min! "${note || 'Great behavior!'}"`);
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
    showToast(`📚 +${extraMinutes} min bonus for ${subj ? subj.label : subjectId}!`);
  }

  // ── Public API (called by hub.js) ──────────
  window.ScreenTime = {
    onTaskChecked(taskId) {
      const added = awardMinutes(`task_${taskId}`, REWARDS.task_per_item, `Task: ${taskId}`);
      if (added > 0) showToast(`📱 +${added} min screen time earned!`);
      for (const [quest, tasks] of Object.entries(QUEST_TASKS)) {
        if (!tasks.includes(taskId)) continue;
        const dayState = getHubDayTasks();
        if (!dayState) continue;
        const allDone = tasks.every(id => dayState[id] === true);
        if (allDone) {
          const questKey = `quest_${quest}`;
          const bonus = awardMinutes(questKey, REWARDS[`quest_${quest}`], `Quest complete: ${quest}`);
          if (bonus > 0) showToast(`🏆 Quest complete! +${bonus} min screen time!`);
        }
      }
      updateUI();
    },
    // Award arbitrary minutes (used by High Score system and parent controls)
    addMinutes(minutes, label) {
      const key = `bonus_${Date.now()}`;
      const added = awardMinutes(key, minutes, label || 'Bonus');
      if (added > 0) showToast(`📱 +${added} min screen time earned!`);
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

  function startTimer() {
    if (timerRunning) return;
    timerRemainSec = getTimerTotalSec();
    if (timerRemainSec <= 0) {
      showToast('No screen time earned yet! Complete tasks to earn time.');
      return;
    }
    timerRunning = true;
    updateTimerUI();
    timerInterval = setInterval(() => {
      timerRemainSec--;
      const rec = getTodayRec();
      rec.timerUsedSec = (rec.timerUsedSec || 0) + 1;
      saveState();
      updateTimerUI();
      if (timerRemainSec <= 0) {
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
      err.textContent = '❌ Incorrect PIN. Try again.';
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
      <h3>📱 Screen Time Earned Today</h3>

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
        🏆 Daily cap reached! Ask a parent to unlock more time.
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
              <button class="stTimerBtn stTimerBtnPause" id="stTimerPauseBtn" style="display:none;">⏸ Pause</button>
              <button class="stTimerBtn stTimerBtnReset" id="stTimerResetBtn" style="display:none;">↺ Reset</button>
            </div>
          </div>
          <!-- Church inside timer column -->
          <div class="stSection">
            <div class="stSectionTitle">⛪ Church</div>
            <div class="stSource" id="stSrc_church">
              <div class="stSrcIcon">⛪</div>
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
            <div class="stSectionTitle">🏃 Exercise</div>
            <div class="stRunCard" id="stRunCard">
              <div class="stRunLeft">
                <span class="stRunIcon">🏃</span>
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
            <div class="stSectionTitle">📚 School Work</div>
            <div class="stSchoolList" id="stSchoolGrid">
              ${SCHOOL_SUBJECTS.map(s => `
              <div class="stSchoolRow" id="stSubj_${s.id}">
                <div class="stSubjIcon">${s.icon}</div>
                <div class="stSubjLabel">${s.label}</div>
                <div class="stSubjReward">+${REWARDS.school_subject} min</div>
                <div class="stSubjBtns">
                  <button class="stSrcBtn stSubjLogBtn" data-subj="${s.id}">Log</button>
                  <button class="stSrcBtn stSubjBonusBtn stParentBtn" data-subj="${s.id}" title="Parent: add bonus minutes">+🔒</button>
                </div>
              </div>`).join('')}
            </div>
          </div>
          <div class="stSection">
            <div class="stSectionTitle">🔒 Parent Controls</div>
            <div class="stParentGrid">
              <button class="stBtn stBtnParent" id="stBehaviorBtn">⭐ Behavior Award</button>
              <button class="stBtn stBtnParent" id="stUnlockCapBtn">🔓 Add More Time</button>
            </div>
            <div id="stBehaviorAwardsList" class="stAwardsList"></div>
          </div>
          <div class="stSection">
            <div class="stSectionTitle">📅 This Week</div>
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
        <div class="stTimesUpMsg">⏰ TIME'S UP!</div>
        <div class="stTimesUpSub">Your screen time for today is all done!</div>
        <div class="stTimesUpSub2">Great job earning it — see you tomorrow, hero! 🦸</div>
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
        <div class="stPinTitle">🔒 Parent PIN Required</div>
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
        <div class="stPinTitle">⭐ Behavior Award</div>
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
        <div class="stPinTitle">🔓 Add More Screen Time</div>
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
        <div class="stPinTitle" id="stSchoolBonusTitle">📚 Bonus Minutes</div>
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
        labelEl.textContent = '🏆 Daily cap reached! Great job, hero!';
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
      prayerBtn.textContent = claimed ? '✅ Done' : 'Log';
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
      btn.textContent   = claimed ? '✅' : 'Log';
      card.classList.toggle('stSourceDone', claimed);
    });

    // School subjects
    SCHOOL_SUBJECTS.forEach(s => {
      const card   = document.getElementById(`stSubj_${s.id}`);
      const logBtn = document.querySelector(`.stSubjLogBtn[data-subj="${s.id}"]`);
      if (!card || !logBtn) return;
      const claimed = !!rec.sources[`school_${s.id}`];
      logBtn.disabled     = claimed;
      logBtn.textContent  = claimed ? '✅' : 'Log';
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
        const icon = r.earned >= cap ? '🏆' : r.earned > 0 ? '✅' : '—';
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
      }

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
      .stSrcIcon { font-size: 1.5rem; flex-shrink: 0; }
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
      .stRunIcon { font-size: 1.6rem; flex-shrink: 0; }
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
      .stWktIcon { font-size: 1.4rem; flex-shrink: 0; }
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
      .stSubjIcon { font-size: 1.4rem; flex-shrink: 0; }
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
        if (added > 0) showToast(`⛪ +${added} min for Church Time!`);
        else showToast('Already logged today ✅');
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
        if (added > 0) showToast(`🏃 +${added} min for ${miles} mile${miles !== 1 ? 's' : ''}!`);
        else showToast('Daily cap reached — ask a parent to add more time!');
        input.value = '';
        updateUI();
      });
    }

    // Workout activity buttons
    document.querySelectorAll('.stWktBtn[data-wkt]').forEach(btn => {
      btn.addEventListener('click', () => {
        const wkt   = btn.dataset.wkt;
        const mins  = REWARDS[wkt];
        const label = WORKOUT_ACTIVITIES.find(a => a.id === wkt)?.label || wkt;
        const added = awardMinutes(`wkt_${wkt}`, mins, label);
        if (added > 0) showToast(`💪 +${added} min for ${label}!`);
        else showToast('Already logged today ✅');
        updateUI();
      });
    });

    // School subject log buttons
    document.querySelectorAll('.stSubjLogBtn[data-subj]').forEach(btn => {
      btn.addEventListener('click', () => {
        const subj  = btn.dataset.subj;
        const label = SCHOOL_SUBJECTS.find(s => s.id === subj)?.label || subj;
        const added = awardMinutes(`school_${subj}`, REWARDS.school_subject, `School: ${label}`);
        if (added > 0) showToast(`📚 +${added} min for ${label}!`);
        else showToast('Already logged today ✅');
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
          document.getElementById('stSchoolBonusTitle').textContent = `📚 Bonus for ${label}`;
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
