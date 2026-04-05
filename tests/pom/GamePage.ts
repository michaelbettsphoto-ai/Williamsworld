import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export type GameName = 'snake' | '2048' | 'tetris' | 'chess' | 'checkers';

const GAME_PATHS: Record<GameName, string> = {
  snake: 'games/snake/index.html',
  '2048': 'games/2048/index.html',
  tetris: 'games/tetris/index.html',
  chess: 'games/chess/index.html',
  checkers: 'games/checkers/index.html',
};

export class GamePage extends BasePage {
  readonly score: Locator;
  readonly highscore: Locator;
  readonly startBtn: Locator;
  readonly pauseBtn: Locator;
  readonly restartBtn: Locator;
  readonly muteBtn: Locator;
  readonly backBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.score = page.locator('#score');
    this.highscore = page.locator('#highscore');
    this.startBtn = page.locator('#startBtn');
    this.pauseBtn = page.locator('#pauseBtn');
    this.restartBtn = page.locator('#restartBtn');
    this.muteBtn = page.locator('#muteBtn');
    this.backBtn = page.locator('a.btn[href*="index.html"]').first();
  }

  async gotoGame(game: GameName) {
    await super.goto(GAME_PATHS[game]);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickStart() {
    await this.startBtn.click();
    await this.page.waitForTimeout(200);
  }

  async clickPause() {
    await this.pauseBtn.click();
    await this.page.waitForTimeout(200);
  }

  async clickRestart() {
    await this.restartBtn.click();
    await this.page.waitForTimeout(200);
  }

  async clickMute() {
    await this.muteBtn.click();
    await this.page.waitForTimeout(100);
  }

  async clickBackToGames() {
    await this.backBtn.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async sendKey(key: string) {
    await this.page.keyboard.press(key);
    await this.page.waitForTimeout(100);
  }

  async getScoreText(): Promise<string> {
    return (await this.score.textContent()) ?? '0';
  }

  async getHighScoreText(): Promise<string> {
    return (await this.highscore.textContent()) ?? '0';
  }

  async waitForScoreChange(initialScore: string, maxWaitMs = 5000): Promise<string> {
    const deadline = Date.now() + maxWaitMs;
    while (Date.now() < deadline) {
      const current = await this.getScoreText();
      if (current !== initialScore) return current;
      await this.page.waitForTimeout(200);
    }
    return await this.getScoreText();
  }
}
