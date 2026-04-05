import { Page, Locator } from '@playwright/test';
import { GamePage } from './GamePage';

export class SnakePage extends GamePage {
  readonly canvas: Locator;
  readonly dpadUp: Locator;
  readonly dpadDown: Locator;
  readonly dpadLeft: Locator;
  readonly dpadRight: Locator;

  constructor(page: Page) {
    super(page);
    this.canvas = page.locator('#gameCanvas');
    this.dpadUp = page.locator('#dpadUp');
    this.dpadDown = page.locator('#dpadDown');
    this.dpadLeft = page.locator('#dpadLeft');
    this.dpadRight = page.locator('#dpadRight');
  }

  async goto() {
    await this.gotoGame('snake');
  }

  async pressDirection(dir: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') {
    await this.page.keyboard.press(dir);
    await this.page.waitForTimeout(100);
  }
}
