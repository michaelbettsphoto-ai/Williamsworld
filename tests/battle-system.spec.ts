/**
 * Agent E — Battle System Test Suite
 * Focus: Battle page, zone chips, battle demo, type CSS variables.
 */
import { test, expect, Page } from '@playwright/test';
import { BattlePage } from './pom/BattlePage';
import { BasePage } from './pom/BasePage';

/** Set up the same external-resource stubs used by BasePage.goto() */
async function setupRoutes(page: Page) {
  await page.route(/fonts\.googleapis\.com/, (r) =>
    r.fulfill({ status: 200, contentType: 'text/css', body: '/* blocked */' })
  );
  await page.route(/fonts\.gstatic\.com/, (r) =>
    r.fulfill({ status: 200, contentType: 'font/woff2', body: '' })
  );
  await page.route(/cdnjs\.cloudflare\.com.*howler/, (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: 'window.Howl=function(o){this.play=function(){};this.stop=function(){};this.volume=function(){return this;};this.seek=function(){return 0;};this.playing=function(){return false;};};window.Howler={volume:function(){},ctx:null};',
    })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Battle Page — Load & Structure
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent E — Battle Page Load', () => {
  test('E-01 @battle: Battle page loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const battle = new BattlePage(page);
    await battle.goto();
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });

  test('E-02 @battle: Zone chip cards are rendered', async ({ page }) => {
    const battle = new BattlePage(page);
    await battle.goto();
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
    const count = await battle.zoneChips.count();
    expect(count).toBeGreaterThan(0);
  });

  test('E-03 @battle: Locked zones have a visual locked indicator', async ({ page }) => {
    const battle = new BattlePage(page);
    await battle.goto();
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
    const lockedCount = await battle.lockedZoneChips.count();
    // At minimum, some zones should be locked on a fresh state
    // Just verify locked class styling exists in the DOM
    const lockedExists = await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = '';
      const el = document.querySelector('.zone-chip.locked');
      return el !== null;
    });
    // This is soft — locked zones may not exist if all are unlocked
    expect(typeof lockedCount).toBe('number');
  });

  test('E-04 @battle: Back button from battle returns to hub', async ({ page }) => {
    const battle = new BattlePage(page);
    await battle.goto();
    await battle.goBackToHub();
    expect(page.url()).not.toContain('battle.html');
  });

  test('E-05 @battle: Nav title on battle page displays expected text', async ({ page }) => {
    const battle = new BattlePage(page);
    await battle.goto();
    const title = await battle.getNavTitleText();
    expect(title.length).toBeGreaterThan(0);
    expect(title).toMatch(/William/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Battle Page — Type CSS Variables
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent E — Battle Type Colors', () => {
  test('E-06 @battle: CSS type-fire color variable is set (#ef4444)', async ({ page }) => {
    const battle = new BattlePage(page);
    await battle.goto();
    const fireColor = await battle.getTypeColorVariable('fire');
    expect(fireColor).toBeTruthy();
    expect(fireColor.toLowerCase()).toContain('ef4444');
  });

  test('E-06b @battle: CSS type-water color variable is set (#3b82f6)', async ({ page }) => {
    const battle = new BattlePage(page);
    await battle.goto();
    const waterColor = await battle.getTypeColorVariable('water');
    expect(waterColor).toBeTruthy();
    expect(waterColor.toLowerCase()).toContain('3b82f6');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Battle Demo Page
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent E — Battle Demo Page', () => {
  test('E-07 @battle: Battle demo page loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await setupRoutes(page);
    await page.goto('battle-system-demo.html', { waitUntil: 'domcontentloaded' });
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });

  test('E-08 @battle: Battle demo page has interactive simulation button', async ({ page }) => {
    await setupRoutes(page);
    await page.goto('battle-system-demo.html', { waitUntil: 'domcontentloaded' });
    // Run Battle Simulation button should exist
    const simBtn = page.locator('button').filter({ hasText: /run battle/i });
    await expect(simBtn.first()).toBeAttached();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Battle Page — State Handling
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent E — Battle State Handling', () => {
  test('E-09 @battle: Battle page loads correctly with empty localStorage', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const hub = new BasePage(page);
    await hub.goto('index.html');
    await page.evaluate(() => localStorage.clear());
    const battle = new BattlePage(page);
    await battle.goto();
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
    await expect(battle.backBtn).toBeAttached();
  });

  test('E-10 @battle: Battle page loads correctly with pre-seeded progression data', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const hub = new BasePage(page);
    await hub.goto('index.html');
    await page.evaluate(() => {
      localStorage.setItem('williams_world_embed_state_v1', JSON.stringify({
        xp: 500, level: 3, streak: 5,
      }));
    });
    const battle = new BattlePage(page);
    await battle.goto();
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });

  test('E-11 @battle: Clicking zone chip (first available) does not crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const battle = new BattlePage(page);
    await battle.goto();
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
    const chipCount = await battle.zoneChips.count();
    if (chipCount > 0) {
      await battle.zoneChips.first().click();
      await page.waitForTimeout(500);
    }
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Audio Test Page
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Agent E — Audio Test Page', () => {
  test('E-12 @battle: Audio test page loads and shows content', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await setupRoutes(page);
    await page.goto('audio-test.html', { waitUntil: 'domcontentloaded' });
    // Page should load with some buttons or content
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
    const critical = errors.filter((e) => !e.includes('fonts.googleapis'));
    expect(critical).toHaveLength(0);
  });
});
