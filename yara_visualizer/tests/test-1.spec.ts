import { test, expect } from '@playwright/test';

test('title', async ({ page }) => {
  await page.goto('http://localhost:1313/');
  await expect(page.getByText('YARA VISUALIZER')).toBeVisible();
});

test('dataTextAreaInput', async ({ page }) => {
  await page.goto('http://localhost:1313/');
  await page.getByLabel('Data').click();
  await page.getByLabel('Data').fill('data');

  await expect(page.getByLabel('Data')).toHaveValue('data');
});

test('rulesTextAreaInput', async ({ page }) => {
  await page.goto('http://localhost:1313/');
  await page.getByLabel('Data').click();
  await page.getByLabel('Data').fill('rules');

  await expect(page.getByLabel('Data')).toHaveValue('rules');
});