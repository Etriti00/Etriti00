import { expect, test } from '@playwright/test';

test('renders the board', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Issues' })).toBeVisible();
});

test('add → state-change → remove flow', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('new issue title').fill('write the e2e suite');
  await page.getByRole('button', { name: 'Add' }).click();

  const item = page.getByText('write the e2e suite');
  await expect(item).toBeVisible();

  await page.getByLabel('state of write the e2e suite').selectOption('done');
  await expect(page.getByTestId('counter')).toContainText('1 done');

  await page.getByLabel('remove write the e2e suite').click();
  await expect(item).toBeHidden();
});
