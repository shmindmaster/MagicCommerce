import { test, expect } from '@playwright/test';

test.describe('User Authentication Flow', () => {
  const newUser = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
  };

  test('should allow a user to register, log out, and log back in', async ({ page }) => {
    // 1. Navigate to the login page
    await page.goto('/auth');

    // 2. Click the "Register" link/button
    await page.click('text=Or, register a new account');

    // 3. Fill out the registration form
    await page.fill('input[name="name"]', newUser.name);
    await page.fill('input[name="email"]', newUser.email);
    await page.fill('input[name="password"]', newUser.password);
    await page.fill('input[name="confirmPassword"]', newUser.password);

    // 4. Submit the form
    await page.click('button[type="submit"]');

    // 5. Verify redirection and logged-in state
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Log out')).toBeVisible();

    // 6. Log out
    await page.click('text=Log out');
    await expect(page.locator('text=Log in')).toBeVisible();

    // 7. Log back in
    await page.goto('/auth');
    await page.fill('input[name="email"]', newUser.email);
    await page.fill('input[name="password"]', newUser.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Log out')).toBeVisible();
  });
});
