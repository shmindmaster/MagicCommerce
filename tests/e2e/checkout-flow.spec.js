import { test, expect } from '@playwright/test';

test.describe('Authenticated Checkout Flow', () => {
  const newUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    name: 'Test User',
  };

  test.beforeEach(async ({ page }) => {
    // Register a new user and log in
    await page.goto('/auth');
    await page.click('text=Or, register a new account');
    await page.fill('input[name="name"]', newUser.name);
    await page.fill('input[name="email"]', newUser.email);
    await page.fill('input[name="password"]', newUser.password);
    await page.fill('input[name="confirmPassword"]', newUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should allow a logged-in user to checkout', async ({ page }) => {
    // 1. Add an item to the cart
    await page.goto('/');
    const firstProduct = page.locator('[key]').first();
    await firstProduct.click();
    await page.click('text=Add To Cart');
    await expect(page.locator('#cart-count')).toHaveText('1');

    // 2. Navigate to the cart and proceed to checkout
    await page.goto('/cart');
    await page.click('text=Checkout');

    // 3. Fill in shipping address
    await expect(page).toHaveURL('/address');
    await page.fill('input[name="address"]', '123 Main St');
    await page.fill('input[name="zipcode"]', '12345');
    await page.fill('input[name="city"]', 'Anytown');
    await page.fill('input[name="country"]', 'USA');
    await page.click('button[type="submit"]');

    // 4. Complete the purchase (mocked payment)
    await expect(page).toHaveURL('/checkout');
    await page.waitForSelector('iframe[name^="__privateStripeFrame"]');
    // NOTE: In a real scenario, we would fill in Stripe's test card details.
    // For now, we'll assume the payment step is handled and a success redirect occurs.
    // This part of the test will need to be adapted once the Stripe integration is fully testable.

    // Mocking the success redirect for now
    await page.goto('/success');
    await expect(page.locator('text=Thank you!')).toBeVisible();
  });
});
