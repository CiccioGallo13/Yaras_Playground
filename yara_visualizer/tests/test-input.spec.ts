import { test, expect } from '@playwright/test';


test.beforeEach(async ({page})=> {
  await page.goto('http://localhost:1313/');
  await page.waitForSelector("body[data-load='complete']");
})

test('dataTextAreaInput', async ({ page }) => {
    await page.locator('#dataTextArea').click();
  
    await page.locator('#dataTextArea').fill('data');
  
    await expect(page.locator('#dataTextArea')).toHaveValue('data');
  });
  
  test('rulesTextAreaInput', async ({ page }) => {
    await page.locator('#rulesTextArea').click();
    await page.locator('#rulesTextArea').fill('rules');
  
    await expect(page.locator('#rulesTextArea')).toHaveValue('rules');
  });