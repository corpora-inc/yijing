import { test, expect } from '@playwright/test';

// Browser tests exercise UI and persistence; native database/coin logic is tested in Rust.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const hex = { id: 1, number: 1, binary: '111111', name_zh: '乾', name_pinyin: 'Qián', name_en: 'The Creative', name_es: 'Lo creativo', judgment_en: 'A beginning full of possibility.', judgment_zh: '元亨利貞', judgment_es: '', judgment_pinyin: '', changing_lines: [] };
    Object.defineProperty(window, '__TAURI_INTERNALS__', { value: {
      invoke: async (command: string) => {
        if (command === 'plugin:app|version') return '0.4.0';
        if (command === 'generate_reading' || command === 'rehydrate_reading') {
          if (localStorage.getItem('failReading')) throw new Error('Unable to cast. Please try again.');
          await new Promise(resolve => setTimeout(resolve, 150));
          return { consultation_code: '777777', binary: '111111', transformed_binary: null };
        }
        if (command === 'fetch_hexagram_data') return hex;
        if (command === 'fetch_all_hexagrams') return [hex];
        if (command === 'fetch_interpretation') return { text: 'A moment to reflect.\n'.repeat(100), attribution: 'Corpora' };
        return null;
      },
    } });
  });
});

test('consult, read interpretation, revisit persisted history, and delete', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Make space for an answer.' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('consultation.png'), fullPage: true });
  await page.getByLabel('What is on your mind?').fill('How can I begin well?');
  await page.getByRole('button', { name: /New Reading/ }).click();
  await expect(page.getByText('The Creative', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /View Interpretation/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page.screenshot({ path: testInfo.outputPath('interpretation.png'), fullPage: true });
  await dialog.getByRole('button', { name: 'Close', exact: true }).last().click();
  await page.reload();
  await page.getByRole('tab', { name: 'History' }).click();
  await page.getByRole('button', { name: /How can I begin well/ }).click();
  await expect(page.getByText('The Creative', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'History' }).click();
  await page.getByRole('button', { name: 'Delete reading' }).click();
  await expect(page.getByText(/No readings yet/)).toBeVisible();
});

test('failed consultation remains usable and does not create history', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('failReading', '1'));
  await page.getByRole('button', { name: /New Reading/ }).click();
  await expect(page.getByRole('alert')).toContainText('Unable to cast');
  await expect(page.getByRole('button', { name: /New Reading/ })).toBeEnabled();
  await page.getByRole('tab', { name: 'History' }).click();
  await expect(page.getByText(/No readings yet/)).toBeVisible();
});

test('language menu and browsing fit the viewport', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Languages and app information' }).click();
  await expect(page.getByRole('menu')).toBeVisible();
  await page.getByText('Español', { exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /Nueva Lectura/ })).toBeVisible();
  await page.getByRole('tab', { name: 'Browse' }).click();
  await expect(page.getByText('Hexagram List (1-64)')).toBeVisible();
  const lastCell = await page.getByRole('button', { name: 'Hexagram 58', exact: true }).boundingBox();
  expect(lastCell!.x + lastCell!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await page.getByRole('button', { name: 'Hexagram 1', exact: true }).click();
  await expect(page.getByText('The Creative', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('browse.png'), fullPage: true });
});
