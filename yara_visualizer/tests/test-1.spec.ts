import { test, expect } from '@playwright/test';

test('title', async ({ page }) => {
  await page.goto('http://localhost:1313/');
  await expect(page.getByText('YARA VISUALIZER')).toBeVisible();
});

test('dataTextAreaInput', async ({ page }) => {
  await page.goto('http://localhost:1313/');
  await page.getByAltText('dataTextArea').click();
  await page.getByAltText('dataTextArea').fill('data');

  await expect(page.getByAltText('dataTextArea')).toHaveValue('data');
});

test('rulesTextAreaInput', async ({ page }) => {
  await page.goto('http://localhost:1313/');
  await page.getByAltText('rulesTextArea').click();
  await page.getByAltText('rulesTextArea').fill('rules');

  await expect(page.getByAltText('rulesTextArea')).toHaveValue('rules');
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
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'), 
    page.getByAltText("rulesInput").click()
  ]);
  await fileChooser.setFiles('./tests/test-files/dataInputText.yara');
  await page.waitForTimeout(1000);

  await expect(page.getByAltText('rulesTextArea')).toHaveValue('data input test');
});



test('dataTextAreaUpload', async ({ page }) => {
  await page.goto('http://localhost:1313/');
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'), 
    page.getByAltText("dataInput").click()
  ]);
  await fileChooser.setFiles('./tests/test-files/dataInputText.txt');
  await page.waitForTimeout(1000);

  await expect(page.getByAltText('dataTextArea')).toHaveValue('data input test');
});

test('test rule', async ({ page }) => {
  await page.goto('http://localhost:1313/');
  await page.getByAltText('rulesTextArea').click();
  await page.getByAltText('rulesTextArea').fill("rule test {strings: $a = \"test\" condition: $a}");

  await page.getByAltText('dataTextArea').click();
  await page.getByAltText('dataTextArea').fill("test");

  await page.getByRole('button', { name: 'Scan' }).click();
  
  await expect(page.getByRole('row', { name: 'raw test test' })).toBeVisible();
});
