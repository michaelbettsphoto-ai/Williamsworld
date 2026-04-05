/**
 * Agent D — Games Gameplay Test Suite
 * Focus: Game loading, controls, score mechanics, high score persistence for all 5 games.
 */
import { test, expect } from '@playwright/test';
import { GamePage } from './pom/GamePage';
import { SnakePage } from './pom/SnakePage';

// ─────────────────────────────────────────────────────────────────────────────
// Snake
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent D — Snake Game', () => {
  test('D-01 @game: Snake — page loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const snake = new SnakePage(page);
    await snake.goto();
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });

  test('D-02 @game: Snake — canvas element is present and has dimensions', async ({ page }) => {
    const snake = new SnakePage(page);
    await snake.goto();
    await expect(snake.canvas).toBeAttached();
    const box = await snake.canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test('D-03 @game: Snake — score starts at 0', async ({ page }) => {
    const snake = new SnakePage(page);
    await snake.goto();
    const scoreText = await snake.getScoreText();
    expect(parseInt(scoreText, 10)).toBe(0);
  });

  test('D-04 @game: Snake — Start button activates game', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const snake = new SnakePage(page);
    await snake.goto();
    await snake.clickStart();
    // Pause button should now be enabled after game starts
    const pauseDisabled = await snake.pauseBtn.getAttribute('disabled');
    expect(pauseDisabled).toBeNull();
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });

  test('D-05 @game: Snake — arrow key press does not throw error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const snake = new SnakePage(page);
    await snake.goto();
    await snake.clickStart();
    await snake.pressDirection('ArrowRight');
    await snake.pressDirection('ArrowDown');
    await snake.pressDirection('ArrowLeft');
    await snake.pressDirection('ArrowUp');
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });

  test('D-06 @game: Snake — high score persists to localStorage', async ({ page }) => {
    const snake = new SnakePage(page);
    await snake.goto();
    await snake.setLocalStorageItem('ww-snake-highscore', '500');
    await page.reload({ waitUntil: 'commit' });
    const storedScore = await snake.getLocalStorageItem('ww-snake-highscore');
    expect(storedScore).toBe('500');
    const displayText = await snake.highscore.textContent();
    expect(displayText).toContain('500');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2048
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent D — 2048 Game', () => {
  test('D-07 @game: 2048 — page loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const game = new GamePage(page);
    await game.gotoGame('2048');
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });

  test('D-08 @game: 2048 — 4x4 game board renders tiles', async ({ page }) => {
    const game = new GamePage(page);
    await game.gotoGame('2048');
    // Start a new game to populate the board
    await game.clickStart();
    await page.waitForTimeout(300);
    const tileCount = await page.evaluate(() =>
      document.querySelectorAll('#gameBoard .tile').length
    );
    expect(tileCount).toBeGreaterThanOrEqual(2); // 2048 starts with 2 tiles
  });

  test('D-09 @game: 2048 — arrow key press causes board state change', async ({ page }) => {
    const game = new GamePage(page);
    await game.gotoGame('2048');
    await game.clickStart();
    await page.waitForTimeout(300);
    const boardBefore = await page.evaluate(() => document.querySelector('#gameBoard')?.innerHTML ?? '');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    const boardAfter = await page.evaluate(() => document.querySelector('#gameBoard')?.innerHTML ?? '');
    // Board HTML should change after a key press (tiles moved or merged)
    expect(boardAfter).not.toBe(boardBefore);
  });

  test('D-10 @game: 2048 — score element is present and numeric', async ({ page }) => {
    const game = new GamePage(page);
    await game.gotoGame('2048');
    await expect(game.score).toBeAttached();
    const scoreText = await game.getScoreText();
    expect(isNaN(parseInt(scoreText, 10))).toBe(false);
  });

  test('D-11 @game: 2048 — high score persists to localStorage', async ({ page }) => {
    const game = new GamePage(page);
    await game.gotoGame('2048');
    await game.setLocalStorageItem('ww-2048-highscore', '1024');
    await page.reload({ waitUntil: 'commit' });
    const stored = await game.getLocalStorageItem('ww-2048-highscore');
    expect(stored).toBe('1024');
    const displayText = await game.highscore.textContent();
    expect(displayText).toContain('1024');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tetris
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent D — Tetris Game', () => {
  test('D-12 @game: Tetris — canvas renders and game starts on button click', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const game = new GamePage(page);
    await game.gotoGame('tetris');
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeAttached();
    const box = await canvas.boundingBox();
    expect(box!.width).toBeGreaterThan(0);
    await game.clickStart();
    const pauseDisabled = await game.pauseBtn.getAttribute('disabled');
    expect(pauseDisabled).toBeNull();
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });

  test('D-13 @game: Tetris — key presses do not throw errors during play', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const game = new GamePage(page);
    await game.gotoGame('tetris');
    await game.clickStart();
    await page.waitForTimeout(300);
    // Send rotation and movement keys
    for (const key of ['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown']) {
      await page.keyboard.press(key);
      await page.waitForTimeout(80);
    }
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Chess
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent D — Chess Game', () => {
  test('D-14 @game: Chess — mode selection screen is visible on load', async ({ page }) => {
    const game = new GamePage(page);
    await game.gotoGame('chess');
    const modeScreen = page.locator('#modeScreen');
    await expect(modeScreen).toBeVisible();
  });

  test('D-15 @game: Chess — difficulty buttons (Easy/Medium/Hard) are clickable', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const game = new GamePage(page);
    await game.gotoGame('chess');
    // Select 1P mode first to reveal difficulty row
    await page.locator('.mode-card').filter({ hasText: '1 Player' }).click();
    await page.waitForTimeout(200);
    for (const diff of ['Easy', 'Medium', 'Hard']) {
      const btn = page.locator('.mode-card').filter({ hasText: diff });
      await expect(btn).toBeVisible();
      await btn.click();
      await page.waitForTimeout(100);
    }
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });

  test('D-16 @game: Chess — color selection (White/Black) buttons work', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const game = new GamePage(page);
    await game.gotoGame('chess');
    await page.locator('.mode-card').filter({ hasText: '1 Player' }).click();
    await page.waitForTimeout(200);
    await page.locator('.mode-card').filter({ hasText: 'Easy' }).click();
    await page.waitForTimeout(200);
    // Color row should now be visible
    for (const color of ['White', 'Black']) {
      const btn = page.locator('.mode-card').filter({ hasText: color });
      await expect(btn).toBeVisible();
      await btn.click();
      await page.waitForTimeout(100);
    }
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });

  test('D-17 @game: Chess — Start Game button navigates to game board', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const game = new GamePage(page);
    await game.gotoGame('chess');
    // Select 1P → Easy → White then start
    await page.locator('.mode-card').filter({ hasText: '1 Player' }).click();
    await page.waitForTimeout(200);
    await page.locator('.mode-card').filter({ hasText: 'Easy' }).click();
    await page.waitForTimeout(200);
    await page.locator('.mode-card').filter({ hasText: 'White' }).click();
    await page.waitForTimeout(200);
    const startBtn = page.locator('#startGameBtn');
    await expect(startBtn).toBeVisible();
    await startBtn.click();
    await page.waitForTimeout(500);
    // Game screen should now be visible
    const gameScreen = page.locator('#gameScreen');
    await expect(gameScreen).toBeVisible();
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Checkers
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent D — Checkers Game', () => {
  test('D-18 @game: Checkers — mode selection screen is visible on load', async ({ page }) => {
    const game = new GamePage(page);
    await game.gotoGame('checkers');
    const modeScreen = page.locator('#modeScreen');
    await expect(modeScreen).toBeVisible();
  });

  test('D-19 @game: Checkers — difficulty and color selection works', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const game = new GamePage(page);
    await game.gotoGame('checkers');
    await page.locator('.mode-card').filter({ hasText: '1 Player' }).click();
    await page.waitForTimeout(200);
    await page.locator('.mode-card').filter({ hasText: 'Easy' }).click();
    await page.waitForTimeout(200);
    const colorCards = page.locator('#colorRow .mode-card');
    const count = await colorCards.count();
    expect(count).toBeGreaterThanOrEqual(2);
    await colorCards.first().click();
    await page.waitForTimeout(100);
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// All Games — Back Button
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent D — Back Navigation', () => {
  for (const game of ['snake', '2048', 'tetris', 'chess', 'checkers'] as const) {
    test(`D-20 @game: ${game} — back button returns to games hub`, async ({ page }) => {
      const gamePage = new GamePage(page);
      await gamePage.gotoGame(game);
      await gamePage.clickBackToGames();
      expect(page.url()).toContain('games/index.html');
    });
  }
});
