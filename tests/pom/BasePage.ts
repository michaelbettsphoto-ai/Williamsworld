import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string = '') {
    // Intercept external resources that block DOMContentLoaded in this sandboxed env.
    // Fonts stylesheet: return empty CSS so Chrome marks it loaded immediately.
    await this.page.route(/fonts\.googleapis\.com/, (route) =>
      route.fulfill({ status: 200, contentType: 'text/css', body: '/* fonts blocked for testing */' })
    );
    await this.page.route(/fonts\.gstatic\.com/, (route) =>
      route.fulfill({ status: 200, contentType: 'font/woff2', body: '' })
    );
    // Howler.js CDN: stub with minimal API so hub.js audio code doesn't throw
    await this.page.route(/cdnjs\.cloudflare\.com.*howler/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: 'window.Howl=function(o){this.play=function(){};this.stop=function(){};this.volume=function(){return this;};this.seek=function(){return 0;};this.playing=function(){return false;};};window.Howler={volume:function(){},ctx:null};',
      })
    );
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
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
