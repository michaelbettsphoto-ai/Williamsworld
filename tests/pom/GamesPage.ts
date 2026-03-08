import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

type GameName = 'snake' | '2048' | 'tetris' | 'checkers' | 'chess';

export class GamesPage extends BasePage {
  readonly gameCards: Locator;
  readonly backBtn: Locator;
  readonly gameGrid: Locator;

  constructor(page: Page) {
    super(page);
    this.gameCards = page.locator('.game-card');
    this.backBtn = page.locator('a[href="../index.html"]');
    this.gameGrid = page.locator('.game-grid');
  }

  async goto() {
    await super.goto('games/index.html');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getGameScore(game: GameName): Promise<string> {
    const scoreEl = this.page.locator(`#${game}-score`);
    return (await scoreEl.textContent()) ?? '';
  }

  async clickGame(game: GameName) {
    const card = this.page.locator(`.game-card[href*="${game}"]`);
    await card.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getGameCount(): Promise<number> {
    return this.gameCards.count();
  }

  async getGridColumnCount(): Promise<number> {
    return this.page.evaluate(() => {
      const grid = document.querySelector('.game-grid');
      if (!grid) return 0;
      const style = getComputedStyle(grid);
      const cols = style.gridTemplateColumns;
      return cols.split(' ').filter(Boolean).length;
    });
  }
}
