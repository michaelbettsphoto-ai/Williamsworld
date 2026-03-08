import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string = '') {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  async getLocalStorageItem(key: string): Promise<string | null> {
    return this.page.evaluate((k) => localStorage.getItem(k), key);
  }

  async setLocalStorageItem(key: string, value: string): Promise<void> {
    await this.page.evaluate(
      ([k, v]) => localStorage.setItem(k, v),
      [key, value]
    );
  }

  async getConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    return errors;
  }

  async collectConsoleErrors(fn: () => Promise<void>): Promise<string[]> {
    const errors: string[] = [];
    const handler = (msg: import('@playwright/test').ConsoleMessage) => {
      if (msg.type() === 'error') errors.push(msg.text());
    };
    this.page.on('console', handler);
    await fn();
    this.page.off('console', handler);
    return errors;
  }

  async collectPageErrors(fn: () => Promise<void>): Promise<Error[]> {
    const errors: Error[] = [];
    const handler = (err: Error) => errors.push(err);
    this.page.on('pageerror', handler);
    await fn();
    this.page.off('pageerror', handler);
    return errors;
  }
}
