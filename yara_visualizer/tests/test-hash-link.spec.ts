import { test, expect } from '@playwright/test';

test('check-url-hash', async ({ page }) => {
    await page.goto('http://localhost:1313/#state=eJxLrfSqTAmvyEmu9DTzzA0ziQw3LE9yDwsGiXlmlmdGubsZRAajyLlGRgRleOYZ2AIAhkYUZA==');
    await page.waitForSelector("body[data-load='complete']");
    await expect(page.locator('#rulesTextArea')).toHaveValue('exampleRule');
    await expect(page.locator('#dataTextArea')).toHaveValue('exampleData');
  });