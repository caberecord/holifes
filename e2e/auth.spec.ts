import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/login');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Login/);
});

test('login page has email and password fields', async ({ page }) => {
    await page.goto('/login');

    // Check for email input
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();

    // Check for password input
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();

    // Check for login button
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
});
