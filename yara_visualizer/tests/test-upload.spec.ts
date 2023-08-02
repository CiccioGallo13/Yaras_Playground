import { test, expect } from '@playwright/test';


test.beforeEach(async ({page})=> {
  await page.goto('http://localhost:1313/');
  await page.waitForSelector("body[data-load='complete']");
})

test('rulesTextAreaUpload', async ({ page }) => {
    const fileChooserPromise = page.waitForEvent('filechooser');
    
    await page.locator('#rulesFile').click()
  
    const fileChooser = await fileChooserPromise;
  
    await fileChooser.setFiles('./tests/test-files/dataInputText.yara');
  
    await expect(page.locator('#rulesTextArea')).toHaveValue('data input test');
  });
  
  test('dataTextAreaUpload', async ({ page }) => {
    const fileChooserPromise = page.waitForEvent('filechooser');
  
    await page.locator('#dataFile').click()
    
    const fileChooser = await fileChooserPromise;
  
    await fileChooser.setFiles('./tests/test-files/dataInputText.txt');
  
    await expect(page.locator('#dataTextArea')).toHaveValue('data input test');
  });