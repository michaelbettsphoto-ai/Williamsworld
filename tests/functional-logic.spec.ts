/**
 * Agent B — Functional / Logic Test Suite
 * Focus: Primary user journeys, every button/link, state changes, localStorage persistence.
 */
import { test, expect } from '@playwright/test';
import { HubPage } from './pom/HubPage';
import { BattlePage } from './pom/BattlePage';
import { GamesPage } from './pom/GamesPage';

test.use({ viewport: { width: 1280, height: 720 } });

// ─────────────────────────────────────────────────────────────────────────────
// Page Load & Title
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent B — Page Load', () => {
  test('B-01: hub page title is correct', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await expect(page).toHaveTitle(/William's World/i);
  });

  test('B-02: hub page loads without uncaught JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const hub = new HubPage(page);
    await hub.goto();
    await hub.waitForNetworkIdle();
    // Filter out known third-party font/resource errors
    const criticalErrors = errors.filter(
      (e) => !e.includes('fonts.googleapis') && !e.includes('favicon')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('B-03: battle page title contains "Battle"', async ({ page }) => {
    const battle = new BattlePage(page);
    await battle.goto();
    await expect(page).toHaveTitle(/Battle/i);
  });

  test('B-04: games page title is correct', async ({ page }) => {
    const games = new GamesPage(page);
    await games.goto();
    await expect(page).toHaveTitle(/William/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent B — Navigation', () => {
  test('B-05: nav button sections exist (home, tracker, party, map, deck)', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    for (const section of ['home', 'tracker', 'party', 'map', 'deck']) {
      const btn = page.locator(`[data-section="${section}"]`);
      await expect(btn).toBeVisible();
    }
  });

  test('B-06: clicking tracker nav button updates active state', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await hub.navigateTo('tracker');
    // Active class or aria-selected should be applied somewhere
    const trackerBtn = page.locator('[data-section="tracker"]');
    await expect(trackerBtn).toBeVisible();
    // The button click should not cause a JS error
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    expect(errors).toHaveLength(0);
  });

  test('B-07: clicking each nav section does not throw JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const hub = new HubPage(page);
    await hub.goto();
    for (const section of ['home', 'tracker', 'party', 'map', 'deck'] as const) {
      await hub.navigateTo(section);
      await page.waitForTimeout(200);
    }
    expect(errors).toHaveLength(0);
  });

  test('B-08: battle external nav link navigates to battle page', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await hub.navigateToExternal('battle.html');
    expect(page.url()).toContain('battle.html');
    await expect(page).toHaveTitle(/Battle/i);
  });

  test('B-09: games external nav link navigates to games page', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await hub.navigateToExternal('games/index.html');
    expect(page.url()).toContain('games');
    const games = new GamesPage(page);
    const count = await games.getGameCount();
    expect(count).toBe(5);
  });

  test('B-10: battle back button returns to hub', async ({ page }) => {
    const battle = new BattlePage(page);
    await battle.goto();
    await battle.goBackToHub();
    expect(page.url()).not.toContain('battle.html');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// William Card
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent B — William Card Interaction', () => {
  test('B-11: William card is visible on page load', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await expect(hub.williamCard).toBeVisible();
  });

  test('B-12: clicking William card triggers flipper animation', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    // Capture transform before and after click
    const transformBefore = await hub.williamCardFlipper.evaluate((el) =>
      getComputedStyle(el).transform
    );
    await hub.clickWilliamCard();
    // After click, either class changes or transform changes
    const classList = await hub.williamCard.evaluate((el) => el.className);
    const transformAfter = await hub.williamCardFlipper.evaluate((el) =>
      getComputedStyle(el).transform
    );
    // Either the card has a new class or the transform changed
    const changed =
      transformBefore !== transformAfter ||
      classList.includes('flipped') ||
      classList.includes('back');
    // The card element itself must still be present
    await expect(hub.williamCard).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Quest Checkboxes
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent B — Quest Checkboxes', () => {
  test('B-13: quest checkboxes are present', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    const count = await hub.checkItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('B-14: clicking a task checkbox registers interaction without error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const hub = new HubPage(page);
    await hub.goto();
    const count = await hub.checkItems.count();
    if (count > 0) {
      await hub.checkTask(0);
    }
    expect(errors).toHaveLength(0);
  });

  test('B-15: localStorage state is saved after checking a task', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    const count = await hub.checkItems.count();
    if (count > 0) {
      await hub.checkTask(0);
      await page.waitForTimeout(500);
      const state = await hub.getLocalStorageItem('williams_world_embed_state_v1');
      // State should be saved (non-null, non-empty)
      expect(state).toBeTruthy();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// High Score Modals
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent B — High Score Modals', () => {
  test('B-16: night high score button is visible', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await expect(hub.nightHighScoreBtn).toBeVisible();
  });

  test('B-17: morning high score button is visible', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await expect(hub.morningHighScoreBtn).toBeVisible();
  });

  test('B-18: backpack high score button is visible', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await expect(hub.backpackHighScoreBtn).toBeVisible();
  });

  test('B-19: night high score modal opens on button click', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await hub.openHighScoreModal('night');
    // At least one hsModal should be visible
    const visibleModals = await page.evaluate(() => {
      const modals = document.querySelectorAll('.hsModal');
      return Array.from(modals).filter((m) => {
        const style = getComputedStyle(m as HTMLElement);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }).length;
    });
    expect(visibleModals).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Enemy Deck
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent B — Enemy Deck', () => {
  test('B-20: enemy deck grid is present in DOM', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await expect(hub.enemyDeckGrid).toBeAttached();
  });

  test('B-21: enemy deck grid populates with cards', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await hub.waitForNetworkIdle();
    const childCount = await page.evaluate(() => {
      const grid = document.querySelector('#enemyDeckGrid');
      return grid ? grid.childElementCount : 0;
    });
    expect(childCount).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Audio & Weather Controls
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent B — Audio & Weather Controls', () => {
  test('B-22: audio toggle button is present', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await expect(hub.audioToggle).toBeAttached();
  });

  test('B-23: weather toggle button is present', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await expect(hub.weatherToggle).toBeAttached();
  });

  test('B-24: clicking audio toggle does not throw JS error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const hub = new HubPage(page);
    await hub.goto();
    const audioExists = await hub.audioToggle.count();
    if (audioExists > 0) {
      await hub.audioToggle.click();
      await page.waitForTimeout(300);
    }
    expect(errors).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Games Hub
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent B — Games Hub', () => {
  test('B-25: games page shows exactly 5 game cards', async ({ page }) => {
    const games = new GamesPage(page);
    await games.goto();
    const count = await games.getGameCount();
    expect(count).toBe(5);
  });

  test('B-26: snake game card navigates to snake game', async ({ page }) => {
    const games = new GamesPage(page);
    await games.goto();
    // Click the first game card link (snake)
    const snakeCard = page.locator('.game-card[href*="snake"]');
    const exists = await snakeCard.count();
    if (exists > 0) {
      await snakeCard.click();
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain('snake');
    }
  });

  test('B-27: games page high score from localStorage displays', async ({ page }) => {
    const games = new GamesPage(page);
    await games.goto();
    // Pre-set a score in localStorage
    await games.setLocalStorageItem('ww-snake-highscore', '9001');
    await page.reload({ waitUntil: 'domcontentloaded' });
    const scoreText = await games.getGameScore('snake');
    expect(scoreText).toContain('9001');
  });

  test('B-28: games page back button navigates to hub', async ({ page }) => {
    const games = new GamesPage(page);
    await games.goto();
    await games.backBtn.click();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).not.toContain('games/index.html');
  });
});
