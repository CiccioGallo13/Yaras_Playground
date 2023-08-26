import { test, expect } from '@playwright/test';

test.beforeEach(async ({page})=> {
    await page.goto('http://localhost:1313/');
    await page.waitForSelector("body[data-load='complete']");
    await page.getByRole('link', { name: 'Rule Editor' }).click();
    await page.getByText('Basic').click();
    await page.locator('#add-string').click();
    await page.getByRole('textbox').nth(1).click();
    await page.getByRole('textbox').nth(1).fill('var');
    await page.getByRole('textbox').nth(2).click();
    await page.getByRole('textbox').nth(2).fill('"hello world"');
})

test('correct-copy', async ({ page }) => {
    await page.getByRole('combobox').selectOption('$var');
    await page.locator('#copy-button').click();
    await expect(page.getByText('Rule copied to clipboard', {exact: false})).toBeVisible();
});

test('removing-string', async ({ page }) => {
    await page.getByRole('button', { name: 'remove' }).click();
    await expect(page.getByText('$ = remove')).toBeHidden();
});

test('clear-all', async ({ page }) => {
    await page.getByRole('button', { name: ' Add Meta' }).click();
    await page.locator('#add-string').click();
    await page.getByRole('textbox').nth(1).fill('meta1');
    await page.getByRole('textbox').nth(2).click();
    await page.getByRole('textbox').nth(2).fill('true');
    await page.getByRole('combobox').selectOption('$var');
    await page.locator('#clear-button').click();
    await expect(page.getByRole('textbox').nth(1)).toBeHidden();
    await expect(page.getByRole('textbox').nth(2)).toBeHidden();
    await expect(page.getByRole('textbox').nth(3)).toBeHidden();
    await expect(page.getByRole('textbox').nth(4)).toBeHidden();
    await expect(page.getByRole('combobox')).toHaveValue('');
});

test('multiple--condtition', async ({ page }) => {
    await page.locator('#add-string').click();
    await page.getByRole('textbox').nth(3).click();
    await page.getByRole('textbox').nth(3).fill('b');
    await page.getByRole('textbox').nth(4).click();
    await page.getByRole('textbox').nth(4).fill('/hello/');
    await page.getByRole('combobox').selectOption('$var');
    await page.locator('#add-cond').click();
    await page.getByRole('combobox').nth(1).selectOption('or');
    await page.getByRole('combobox').nth(2).selectOption('$b');
    await page.locator('#copy-button').click();
    await expect(page.getByText('Rule copied to clipboard', {exact: false})).toBeVisible();
});