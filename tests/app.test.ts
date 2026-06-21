import { expect, test } from '@playwright/test';

test('главная страница загружается', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Выбери тип режима')).toBeVisible();
});

test('навигация через footer', async ({ page }) => {
	await page.goto('/');
	await page.getByLabel('Бегущая строка').click();
	await expect(page).toHaveURL(/\/text$/);
});
