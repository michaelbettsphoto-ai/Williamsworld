# Progression Discovery (XP, PASS, Streaks)

## Files & Functions
- **index.html**
  - `TASKS` array defines all tasks and XP amounts (night, morning, backpack).
  - `renderTasks()` + `setupQuestCheckboxes()` award XP and update task state on completion.
  - `xpForLevel()` + `recalcLevel()` handle XP thresholds and level-up.
  - `isPassDay()` determines PASS/FAIL.
  - `gradeDay()` updates PASS/FAIL, streak, and HP after grading.
  - `midnightCheck()` auto-fails ungraded past days and resets streak.
  - `updateZones()` uses `state.streak` to unlock quest zones.

## XP Awards (Current Implementation)
- Night-Before Checklist totals **+50 XP** (`n_trapper`, `n_clothes`, `n_lunch`, `n_shoes`).
- Morning Checklist totals **+50 XP** (`m_prayer`, `m_dressed`, `m_teeth`, `m_trappercheck`).
- Trapper Ready Mission totals **+50 XP** (`t_work`, `t_notebooks`, `t_supplies`, `t_check`).
- Daily max XP = **150** via task completion.
- XP gains also add companion XP (`addCompanionXP`) and war chest gold (`WAR_CHEST_XP_RATE`).

## PASS / Streak Logic (Current Implementation)
- `isPassDay()` currently requires **night + morning + backpack** task sets to be complete.
  - Note: The hidden Daily Checklist copy says PASS requires Night-Before + Trapper Check only, but the logic currently checks all three quest categories.
- `gradeDay()` sets `state.days[TODAY].result` to PASS/FAIL and increments or resets `state.streak`.
- `midnightCheck()` auto-FAILs ungraded past days and resets streak to 0.

## LocalStorage Keys
- `williams_world_embed_state_v1` (main state: days, xp, level, streak, hp, companions, warChest, morningMission).
- `williamsWorldAudioSettings` (audio settings).
- `williamsWorldWeather` (weather selection).

## Flow Summary
- On init, the app loads `williams_world_embed_state_v1` from localStorage or seeds defaults.
- Checking tasks updates `state.days[TODAY].tasks`, awards XP, and calls `recalcLevel()` + `updateHeader()`.
- Grading sets PASS/FAIL, updates streak + HP, then refreshes UI and zone unlocks.
