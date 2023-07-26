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

/*
test('theme', async ({ page }) => {

await page.goto('http://localhost:1313/');
await page.getByRole('button', { name: 'Dark' }).click();
await expect(page.getByRole('button', { name: 'Scan' })).toHaveCSS('background-color', 'rgb(255, 255, 255)');

await page.getByRole('button', { name: 'Light' }).click();
await expect(page.getByRole('button', { name: 'Scan' })).toHaveCSS('background-color', 'rgb(0, 0, 0)');

});
*/

test('rulesTextAreaUpload', async ({ page }) => {
  await page.goto('http://localhost:1313/');
  page.getByLabel('or upload your file to scan here').click();
  page.on('filechooser', async (fileChooser) => {
    await fileChooser.setFiles('./tests/test-files/dataInputText.txt');
  });
  await expect(page.getByLabel('Data')).toHaveValue('data input test');
});
