import { test, expect } from '@playwright/test';

test.beforeEach(async ({page})=> {
    await page.goto('http://localhost:1313/');
    await page.waitForSelector("body[data-load='complete']");
    await page.getByRole('link', { name: 'Rule Editor' }).click();
    await page.getByText('Basic').click();
})

test('checkPage', async ({ page }) => {
    await expect(page.getByText('rule', { exact: true })).toBeVisible();
});

test('emptyCondition', async ({ page }) => {
    await page.locator('#copy-button').click();
    await expect(page.getByText('Select a variable for condition')).toBeVisible();
});

test('tips', async ({ page }) => {
await page.getByRole('button', { name: 'i', exact: true }).first().click();
await expect(page.getByText('Metadata', { exact: true })).toBeVisible();
});

test('stringError', async ({ page }) => {
    await page.locator('#add-string').click();
    await page.getByRole('textbox').nth(1).click();
    await page.getByRole('textbox').nth(1).fill('var');
    await page.getByRole('textbox').nth(2).click();
    await page.getByRole('textbox').nth(2).fill('"hello world');
    await page.getByRole('combobox').selectOption('$var');
    await page.locator('#copy-button').click();
    await expect(page.getByText('Line 6 column 2.', {exact: false})).toBeVisible();
});



