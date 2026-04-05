import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class BattlePage extends BasePage {
  readonly backBtn: Locator;
  readonly navTitle: Locator;
  readonly zoneChips: Locator;
  readonly lockedZoneChips: Locator;

  constructor(page: Page) {
    super(page);
    this.backBtn = page.locator('.back-btn').first();
    this.navTitle = page.locator('.nav-title');
    this.zoneChips = page.locator('.zone-chip');
    this.lockedZoneChips = page.locator('.zone-chip.locked');
  }

  async goto() {
    await super.goto('battle.html');
    await this.backBtn.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  }

  async goBackToHub() {
    await this.backBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async getNavTitleText(): Promise<string> {
    return (await this.navTitle.textContent()) ?? '';
  }

  async getTypeColorVariable(typeName: string): Promise<string> {
    return this.page.evaluate((name) => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(`--type-${name}`)
        .trim();
    }, typeName);
  }
}
