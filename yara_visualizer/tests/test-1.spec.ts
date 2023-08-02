import { test, expect } from '@playwright/test';
import { dataTextArea, rulesTextArea } from './../src/lib/stores';
import { get } from 'svelte/store';

test.beforeEach(async ({page})=> {
  await page.goto('http://localhost:1313/');
})

test('title', async ({ page }) => {
  await expect(page.getByText('YARA VISUALIZER')).toBeVisible();
});

test('dataTextAreaInput', async ({ page }) => {
  await page.getByAltText('dataTextArea').click();
  await page.getByAltText('dataTextArea').fill('data');

  await expect(page.getByAltText('dataTextArea')).toHaveValue('data');
});

test('rulesTextAreaInput', async ({ page }) => {
  await page.getByAltText('rulesTextArea').click();
  await page.getByAltText('rulesTextArea').fill('rules');

  await expect(page.getByAltText('rulesTextArea')).toHaveValue('rules');
});

/*
test('theme', async ({ page }) => {
await page.getByRole('button', { name: 'Dark' }).click();
await expect(page.getByRole('button', { name: 'Scan' })).toHaveCSS('background-color', 'rgb(255, 255, 255)');

await page.getByRole('button', { name: 'Light' }).click();
await expect(page.getByRole('button', { name: 'Scan' })).toHaveCSS('background-color', 'rgb(0, 0, 0)');

});
*/

/*
test('rulesTextAreaUpload', async ({ page }) => {
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByAltText("rulesInput").click()
  ]);
  await fileChooser.setFiles('./tests/test-files/dataInputText.yara');
  await page.waitForTimeout(1000);

  await expect(page.getByAltText('rulesTextArea')).toHaveValue('data input test');
});
*/
test('rulesTextAreaUpload', async ({ page }) => {
  const fileChooserPromise = page.waitForEvent('filechooser');
  
  await page.getByAltText("rulesInput").click()

  const fileChooser = await fileChooserPromise;

  await fileChooser.setFiles('./tests/test-files/dataInputText.yara');
  await page.waitForTimeout(1000);

  await expect(page.getByAltText('rulesTextArea')).toHaveValue('data input test');
});

test('dataTextAreaUpload', async ({ page }) => {
  const fileChooserPromise = page.waitForEvent('filechooser');

  await page.getByAltText("dataInput").click()
  
  const fileChooser = await fileChooserPromise;

  await fileChooser.setFiles('./tests/test-files/dataInputText.txt');
  await page.waitForTimeout(1000);

  await expect(page.getByAltText('dataTextArea')).toHaveValue('data input test');
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

  await page.getByLabel('Rules', { exact: true }).fill("rule test {strings: $a = \"test\" condition: $a}");
  rulesTextArea.set("rule test {strings: $a = \"test\" condition: $a}");
  await page.getByLabel('Data', { exact: true}).fill("test");
  dataTextArea.set("test");
  await page.waitForTimeout(1000);
  
  await page.getByRole('button', { name: 'Scan' }).click();
  
  await page.waitForTimeout(2000);

  await expect(page.getByRole('row', { name: "test", exact: true})).toBeVisible();
});

