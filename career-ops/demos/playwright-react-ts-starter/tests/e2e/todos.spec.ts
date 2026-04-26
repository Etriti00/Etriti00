import { expect, test } from '@playwright/test';

test.describe('todos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible();
    await expect(page.getByTestId('counter')).toHaveText(/0 open · 0 done/);
  });

  test('add → toggle → remove flow', async ({ page }) => {
    const input = page.getByLabel('new todo title');
    await input.fill('write the e2e suite');
    await page.getByRole('button', { name: 'Add' }).click();

    const item = page.getByText('write the e2e suite');
    await expect(item).toBeVisible();
    await expect(page.getByTestId('counter')).toHaveText(/1 open · 0 done/);

    await page.getByLabel('toggle write the e2e suite').click();
    await expect(page.getByTestId('counter')).toHaveText(/0 open · 1 done/);

    await page.getByLabel('remove write the e2e suite').click();
    await expect(item).toBeHidden();
    await expect(page.getByTestId('counter')).toHaveText(/0 open · 0 done/);
  });

  test('keyboard-only flow (a11y)', async ({ page }) => {
    await page.getByLabel('new todo title').focus();
    await page.keyboard.type('keyboard accessibility');
    await page.keyboard.press('Enter');
    await expect(page.getByText('keyboard accessibility')).toBeVisible();
  });
});
