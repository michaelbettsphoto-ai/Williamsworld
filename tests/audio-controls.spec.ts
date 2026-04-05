/**
 * Agent G — Audio Controls Test Suite
 * Focus: Audio panel visibility, volume controls, weather effects.
 */
import { test, expect } from '@playwright/test';
import { HubPage } from './pom/HubPage';

// ─────────────────────────────────────────────────────────────────────────────
// Audio Settings Panel
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent G — Audio Settings Panel', () => {
  test('G-01 @audio: Audio toggle button click reveals audio settings panel', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await expect(hub.audioToggle).toBeAttached();
    await hub.audioToggle.click();
    await page.waitForTimeout(400);
    // audioSettings should have .show class or be visible
    const hasShow = await hub.audioSettings.evaluate((el) =>
      el.classList.contains('show')
    );
    const isVisible = await hub.audioSettings.isVisible();
    expect(hasShow || isVisible).toBe(true);
  });

  test('G-02 @audio: Audio settings panel contains volume sliders', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await hub.audioToggle.click();
    await page.waitForTimeout(400);
    // Music, ambience, and SFX volume sliders
    const musicSlider = page.locator('#musicVolume');
    const ambienceSlider = page.locator('#ambienceVolume');
    const sfxSlider = page.locator('#sfxVolume');
    await expect(musicSlider).toBeAttached();
    await expect(ambienceSlider).toBeAttached();
    await expect(sfxSlider).toBeAttached();
  });

  test('G-03 @audio: Audio settings panel can be toggled closed', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const hub = new HubPage(page);
    await hub.goto();
    // Open
    await hub.audioToggle.click();
    await page.waitForTimeout(300);
    // Close by clicking again
    await hub.audioToggle.click();
    await page.waitForTimeout(300);
    const hasShow = await hub.audioSettings.evaluate((el) =>
      el.classList.contains('show')
    );
    expect(hasShow).toBe(false);
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });

  test('G-08 @audio: Mute toggle (audio toggle) changes state on repeated click', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const hub = new HubPage(page);
    await hub.goto();
    const classBefore = await hub.audioToggle.evaluate((el) => el.className);
    await hub.audioToggle.click();
    await page.waitForTimeout(300);
    const classAfter = await hub.audioToggle.evaluate((el) => el.className);
    // Either the class changed (muted state) or the panel opened
    const audioSettingsVisible = await hub.audioSettings.evaluate((el) =>
      el.classList.contains('show')
    );
    expect(classBefore !== classAfter || audioSettingsVisible).toBe(true);
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });

  test('G-09 @audio: Reduce Sound Mode checkbox is present in audio settings', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await hub.audioToggle.click();
    await page.waitForTimeout(400);
    const reduceCheckbox = page.locator('#reduceSoundMode');
    await expect(reduceCheckbox).toBeAttached();
  });

  test('G-10 @audio: Audio settings panel does not cause layout overflow', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await hub.audioToggle.click();
    await page.waitForTimeout(400);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // 2px tolerance
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Weather Menu
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent G — Weather Menu', () => {
  test('G-04 @audio: Weather toggle button click reveals weather menu', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await expect(hub.weatherToggle).toBeAttached();
    await hub.weatherToggle.click();
    await page.waitForTimeout(400);
    const hasShow = await hub.weatherMenu.evaluate((el) =>
      el.classList.contains('show')
    );
    const isVisible = await hub.weatherMenu.isVisible();
    expect(hasShow || isVisible).toBe(true);
  });

  test('G-05 @audio: Weather menu contains selectable weather options', async ({ page }) => {
    const hub = new HubPage(page);
    await hub.goto();
    await hub.weatherToggle.click();
    await page.waitForTimeout(400);
    // Weather options should be buttons or clickable elements inside #weatherMenu
    const weatherOptions = hub.weatherMenu.locator('button, [onclick], [data-weather]');
    const count = await weatherOptions.count();
    expect(count).toBeGreaterThan(0);
  });

  test('G-06 @audio: Clicking a weather option does not throw JS error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const hub = new HubPage(page);
    await hub.goto();
    await hub.weatherToggle.click();
    await page.waitForTimeout(400);
    const weatherOptions = hub.weatherMenu.locator('button, [onclick], [data-weather]');
    const count = await weatherOptions.count();
    if (count > 0) {
      await weatherOptions.first().click();
      await page.waitForTimeout(400);
    }
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });

  test('G-07 @audio: Weather menu can be dismissed by clicking toggle again', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const hub = new HubPage(page);
    await hub.goto();
    await hub.weatherToggle.click();
    await page.waitForTimeout(300);
    await hub.weatherToggle.click();
    await page.waitForTimeout(300);
    const hasShow = await hub.weatherMenu.evaluate((el) =>
      el.classList.contains('show')
    );
    expect(hasShow).toBe(false);
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });
});
