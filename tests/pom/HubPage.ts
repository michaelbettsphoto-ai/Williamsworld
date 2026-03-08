import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HubPage extends BasePage {
  readonly williamCard: Locator;
  readonly williamCardFlipper: Locator;
  readonly questCards: Locator;
  readonly checkItems: Locator;
  readonly questProgressBars: Locator;
  readonly nightHighScoreBtn: Locator;
  readonly morningHighScoreBtn: Locator;
  readonly backpackHighScoreBtn: Locator;
  readonly weatherToggle: Locator;
  readonly weatherMenu: Locator;
  readonly audioToggle: Locator;
  readonly audioSettings: Locator;
  readonly enemyDeckGrid: Locator;
  readonly awardBtns: Locator;
  readonly parentModeBtn: Locator;
  readonly hsModals: Locator;
  readonly topbar: Locator;
  readonly mainWrapper: Locator;
  readonly contentWithSidebar: Locator;
  readonly questSidebar: Locator;
  readonly mainContent: Locator;

  constructor(page: Page) {
    super(page);
    this.williamCard = page.locator('#williamActiveCard');
    this.williamCardFlipper = page.locator('.wcard-flipper');
    this.questCards = page.locator('.questCard');
    this.checkItems = page.locator('.checkItem');
    this.questProgressBars = page.locator('.questProgress');
    this.nightHighScoreBtn = page.locator('#nightHighScoreBtn');
    this.morningHighScoreBtn = page.locator('#morningHighScoreBtn');
    this.backpackHighScoreBtn = page.locator('#backpackHighScoreBtn');
    this.weatherToggle = page.locator('#weatherToggle');
    this.weatherMenu = page.locator('#weatherMenu');
    this.audioToggle = page.locator('#audioToggle');
    this.audioSettings = page.locator('#audioSettings');
    this.enemyDeckGrid = page.locator('#enemyDeckGrid');
    this.awardBtns = page.locator('.awardBtn');
    this.parentModeBtn = page.locator('#parentModeBtn');
    this.hsModals = page.locator('.hsModal');
    this.topbar = page.locator('.topbar');
    this.mainWrapper = page.locator('#ww');
    this.contentWithSidebar = page.locator('.contentWithSidebar');
    this.questSidebar = page.locator('.questSidebar');
    this.mainContent = page.locator('.mainContent');
  }

  async goto() {
    await super.goto('');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickWilliamCard() {
    await this.williamCard.click();
    await this.page.waitForTimeout(700);
  }

  async navigateTo(section: 'home' | 'tracker' | 'party' | 'map' | 'deck') {
    await this.page.locator(`[data-section="${section}"]`).click();
    await this.page.waitForTimeout(300);
  }

  async openHighScoreModal(quest: 'night' | 'morning' | 'backpack') {
    const btnMap = {
      night: this.nightHighScoreBtn,
      morning: this.morningHighScoreBtn,
      backpack: this.backpackHighScoreBtn,
    };
    await btnMap[quest].click();
    await this.page.waitForTimeout(400);
  }

  async closeHighScoreModal() {
    const closeBtn = this.page.locator('.hsModal .hsClose, .hsModal [class*="close"]').first();
    await closeBtn.click();
    await this.page.waitForTimeout(300);
  }

  async getXP(): Promise<string> {
    const xpEl = this.page.locator('[id*="xp"], [class*="xp"]').first();
    return (await xpEl.textContent()) ?? '0';
  }

  async getLevel(): Promise<string> {
    const levelEl = this.page.locator('[id*="level"], [class*="level-val"]').first();
    return (await levelEl.textContent()) ?? '1';
  }

  async getStreak(): Promise<string> {
    const streakEl = this.page.locator('[id*="streak"], [class*="streak"]').first();
    return (await streakEl.textContent()) ?? '0';
  }

  async checkTask(index: number = 0) {
    const task = this.checkItems.nth(index);
    await task.click();
    await this.page.waitForTimeout(200);
  }

  async getQuestProgressPercent(index: number = 0): Promise<number> {
    const bar = this.questProgressBars.nth(index);
    const style = await bar.getAttribute('style') ?? '';
    const match = style.match(/width:\s*([\d.]+)%/);
    return match ? parseFloat(match[1]) : 0;
  }

  async navigateToExternal(href: 'games/index.html' | 'battle.html') {
    await this.page.locator(`[data-nav-href="${href}"]`).click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
