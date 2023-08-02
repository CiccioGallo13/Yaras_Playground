import { test, expect } from '@playwright/test';


test.beforeEach(async ({page})=> {
  await page.goto('http://localhost:1313/');
  await page.waitForSelector("body[data-load='complete']");
})

test('title', async ({ page }) => {
  await expect(page.getByText('YARA VISUALIZER')).toBeVisible();
});

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

/*
test('theme', async ({ page }) => {
await page.getByRole('button', { name: 'Dark' }).click();
await expect(page.getByRole('button', { name: 'Scan' })).toHaveCSS('background-color', 'rgb(255, 255, 255)');

await page.getByRole('button', { name: 'Light' }).click();
await expect(page.getByRole('button', { name: 'Scan' })).toHaveCSS('background-color', 'rgb(0, 0, 0)');

});
*/

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

test('test rule', async ({ page }) => {
  // Mock the API response
  const mockApiResponse = {
    matches: [
      {
        rule: 'test',
        meta: "{}",
        string_match: [
          {
            instances: [
              {
                offset: 0,
                matched_length: 4,
                matched_data: "test",
              },
            ],
          },
        ],
      },
    ],
  };


  // Intercept the API call and return the mockApiResponse
  await page.route('**/set/json/', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify(mockApiResponse),
    });
  });

  await page.locator('#rulesTextArea').fill("rule test {strings: $a = \"test\" condition: $a}");
  await page.locator('#dataTextArea').fill("test");
  
  await page.getByRole('button', { name: 'Scan' }).click();
  

  await expect(page.getByRole('row', { name: "test", exact: true})).toBeVisible();
});

