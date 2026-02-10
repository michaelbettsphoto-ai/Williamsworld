# Progression Discovery (XP/PASS/Streak/Unlocks)

## Files + functions
- **XP awarding (tasks):** `/home/runner/work/Williamsworld/Williamsworld/index.html`
  - `renderTasks()` and `setupQuestCheckboxes()` handle task completion → `state.xp += task.xp`
  - `TASKS` array defines the per-task XP values
  - `recalcLevel()` consumes XP thresholds via `xpForLevel()`
- **PASS rule:** `/home/runner/work/Williamsworld/Williamsworld/index.html`
  - `isPassDay()` evaluates the PASS rule
  - `gradeDay()` calls `isPassDay()` and sets `state.days[TODAY].result`
- **Streak storage + updates:** `/home/runner/work/Williamsworld/Williamsworld/index.html`
  - `state.streak` stored in localStorage under `KEY = "williams_world_embed_state_v1"`
  - `gradeDay()` increments or resets `state.streak`
  - `midnightCheck()` can reset streak for ungraded days
- **Zone unlock checks:** `/home/runner/work/Williamsworld/Williamsworld/index.html`
  - `updateZones()` evaluates unlocks and updates UI
  - Zone thresholds defined in `MAP`

## Storage keys + schema
- **Main state:** `localStorage["williams_world_embed_state_v1"]`
  - Stores `xp`, `level`, `streak`, `hp`, `warChest`, `days`, `companions`, `morningMission`, and derived unlock-related data.
- **Audio settings:** `localStorage["williamsWorldAudioSettings"]` (legacy) and `localStorage["williamsworld_audio_settings"]` (new)

## Trigger flow (high-level)
1. Task checkbox checked → XP awarded in `renderTasks()` / `setupQuestCheckboxes()`.
2. XP awarded → `recalcLevel()` checks `xpForLevel()` thresholds and triggers level-up visuals.
3. Grade button → `gradeDay()` → `isPassDay()` determines PASS/FAIL → updates `state.streak`.
4. `updateZones()` uses streak/PASS-related state to mark zones locked/unlocked.

## Hub ↔ Battle dependencies
- Hub writes progression state to `localStorage` (key above).
- Battle page will read the same key for zone unlock validation and party selection.
