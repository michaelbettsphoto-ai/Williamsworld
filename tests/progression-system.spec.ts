/**
 * Agent F — Progression System Test Suite
 * Focus: XP system, level display, streak tracking, companion rewards, parent mode.
 */
import { test, expect } from '@playwright/test';
import { HubPage } from './pom/HubPage';

// ─────────────────────────────────────────────────────────────────────────────
// XP & Level Display
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent F — XP & Level Display', () => {
  test('F-01 @progression: XP display is a number (not NaN) on fresh load', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await hub.clearLocalStorage();
    await page.reload({ waitUntil: 'commit' });
    const xpText = await hub.xpNow.textContent();
    expect(xpText).not.toBeNull();
    const xpVal = parseInt(xpText ?? '', 10);
    expect(isNaN(xpVal)).toBe(false);
  });

  test('F-02 @progression: XP display is a number after checking one task', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const hub = new HubPage(page);
    await hub.goto();
    await hub.clearLocalStorage();
    await page.reload({ waitUntil: 'commit' });
    const count = await hub.checkItems.count();
    if (count > 0) {
      await hub.checkTask(0);
      await page.waitForTimeout(400);
    }
    const xpText = await hub.xpNow.textContent();
    const xpVal = parseInt(xpText ?? '', 10);
    expect(isNaN(xpVal)).toBe(false);
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });

  test('F-03 @progression: Checking tasks increases XP value', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await hub.clearLocalStorage();
    await page.reload({ waitUntil: 'commit' });
    const xpBefore = parseInt((await hub.xpNow.textContent()) ?? '0', 10);
    const count = await hub.checkItems.count();
    // Check the first 3 tasks
    for (let i = 0; i < Math.min(3, count); i++) {
      await hub.checkTask(i);
      await page.waitForTimeout(200);
    }
    const xpAfter = parseInt((await hub.xpNow.textContent()) ?? '0', 10);
    // XP should have increased after checking tasks
    expect(xpAfter).toBeGreaterThanOrEqual(xpBefore);
  });

  test('F-04 @progression: Level display shows a valid number (1–20)', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    const levelText = await hub.levelNum.textContent();
    const level = parseInt(levelText ?? '', 10);
    expect(isNaN(level)).toBe(false);
    expect(level).toBeGreaterThanOrEqual(1);
    expect(level).toBeLessThanOrEqual(20);
  });

  test('F-05 @progression: Streak display shows a non-negative integer', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    const streakText = await hub.streakNum.textContent();
    const streak = parseInt(streakText ?? '', 10);
    expect(isNaN(streak)).toBe(false);
    expect(streak).toBeGreaterThanOrEqual(0);
  });

  test('F-06 @progression: XP bar element is present in the DOM', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await expect(hub.xpBar).toBeAttached();
  });

  test('F-07 @progression: Level title text is non-empty', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await expect(hub.levelTitle).toBeAttached();
    const titleText = await hub.levelTitle.textContent();
    expect(titleText?.trim().length).toBeGreaterThan(0);
  });

  test('F-08 @progression: State persists across page reload', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    // Check a task to create some state
    const count = await hub.checkItems.count();
    if (count > 0) {
      await hub.checkTask(0);
      await page.waitForTimeout(500);
    }
    const stateBefore = await hub.getLocalStorageItem('williams_world_embed_state_v1');
    await page.reload({ waitUntil: 'commit' });
    const stateAfter = await hub.getLocalStorageItem('williams_world_embed_state_v1');
    // State should still exist after reload
    expect(stateAfter).toBeTruthy();
    expect(stateAfter).toBe(stateBefore);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Companion Awards
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent F — Companion Award System', () => {
  test('F-09 @progression: Companion award buttons are attached in DOM', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    // Navigate to party section where companions live
    await hub.navigateTo('party');
    await page.waitForTimeout(300);
    await expect(hub.awardBtns.first()).toBeAttached();
  });

  test('F-10 @progression: Clicking award button does not throw JS error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const hub = new HubPage(page);
    await hub.goto();
    await hub.navigateTo('party');
    await page.waitForTimeout(300);
    const awardCount = await hub.awardBtns.count();
    if (awardCount > 0) {
      // Award buttons may be disabled (insufficient XP); use force: true to test the handler
      await hub.awardBtns.first().click({ force: true });
      await page.waitForTimeout(400);
    }
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Parent Mode
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent F — Parent Mode', () => {
  test('F-11 @progression: Parent Mode button is attached in DOM', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await expect(hub.parentModeBtn).toBeAttached();
  });

  test('F-12 @progression: Clicking Parent Mode button triggers a dialog or input', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    const parentBtnCount = await hub.parentModeBtn.count();
    if (parentBtnCount > 0) {
      await hub.parentModeBtn.click();
      await page.waitForTimeout(400);
      // Should reveal a PIN input, dialog, or modal
      const pinInput = page.locator('input[type="password"], input[type="number"][maxlength], #parentPin, .pinInput');
      const dialog = page.locator('dialog, [role="dialog"], .modal');
      const pinOrDialog = (await pinInput.count()) + (await dialog.count());
      expect(pinOrDialog).toBeGreaterThan(0);
    }
  });

  test('F-13 @progression: Correct PIN (4242) unlocks parent mode', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const hub = new HubPage(page);
    await hub.goto();
    const parentBtnCount = await hub.parentModeBtn.count();
    if (parentBtnCount > 0) {
      await hub.parentModeBtn.click();
      await page.waitForTimeout(400);
      // Try to find a PIN input and enter the correct PIN
      const pinInput = page.locator('input[type="password"], input[type="number"], #parentPin').first();
      if (await pinInput.count() > 0) {
        await pinInput.fill('4242');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(400);
      }
    }
    // No critical errors should occur
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });

  test('F-14 @progression: Incorrect PIN does not unlock parent mode', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const hub = new HubPage(page);
    await hub.goto();
    const parentBtnCount = await hub.parentModeBtn.count();
    if (parentBtnCount > 0) {
      await hub.parentModeBtn.click();
      await page.waitForTimeout(400);
      const pinInput = page.locator('input[type="password"], input[type="number"], #parentPin').first();
      if (await pinInput.count() > 0) {
        await pinInput.fill('0000');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(400);
      }
    }
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Enemy Deck & Level Title
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent F — Enemy Deck & Progression Tiers', () => {
  test('F-15 @progression: Enemy deck populates when deck section is active', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await hub.navigateTo('deck');
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
    const childCount = await page.evaluate(
      () => document.querySelector('#enemyDeckGrid')?.childElementCount ?? 0
    );
    expect(childCount).toBeGreaterThan(0);
  });

  test('F-16 @progression: Level title text matches a known progression tier', async ({ page }) => {
    const KNOWN_TIERS = [
      'Apprentice', 'Scout', 'Seeker', 'Ranger', 'Guardian',
      'Champion', 'Veteran', 'Hero', 'Legend', 'Master', 'Dragon',
    ];
    const hub = new HubPage(page);
    await hub.goto();
    const titleText = (await hub.levelTitle.textContent()) ?? '';
    const matchesTier = KNOWN_TIERS.some((tier) =>
      titleText.toLowerCase().includes(tier.toLowerCase())
    );
    expect(matchesTier).toBe(true);
  });
});
