import { test, expect } from '@playwright/test';

test.beforeEach(async ({page})=> {
    await page.goto('http://localhost:1313/');
    await page.waitForSelector("body[data-load='complete']");
    await page.getByRole('link', { name: 'Rule Editor' }).click();
    await page.getByText('Advanced').click();
});

test('line-numeration', async ({ page }) => {
const editor = page.locator('#text-area-editor');
await editor.click();
await editor.fill('\n');
await expect(page.getByText('2', { exact: true })).toBeVisible();
await editor.click();
await editor.fill('');
await expect(page.getByText('1', { exact: true })).toBeVisible();
});

test('correct-rule', async ({ page }) => {
    await page.locator('#text-area-editor').click();
    await page.locator('#text-area-editor').fill('rule Example\n{\n    meta:\n\tauthor = "Kanye West"\n\n    strings:\n        $a = { F4 23 ( 62 B4 | 56 | 45 ?? 67 ) 45 }\n\t$xor_string = "I love H....." xor\n\t$re1 = /md5: [0-9a-fA-F]{32}/\n\n    condition:\n        $a in (filesize..filesize+ 10) or $xor_string and\n\tfor all i in (1,2,3) : ( @a[i] + 10 == @re1[i] )\n}');
    await expect(page.getByText('Rule parsed successfully')).toBeVisible();
});