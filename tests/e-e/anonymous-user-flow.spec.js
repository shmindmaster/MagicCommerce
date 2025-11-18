import { test, expect } from '@playwright/test';

test.describe('Anonymous User E-commerce Flow', () => {
  test('should allow a user to view products and add one to the cart', async ({ page }) => {
    // 1. Navigate to the home page
    await page.goto('/');

    // 2. Verify that a list of products is displayed
    await expect(page.locator('text=Products')).toBeVisible();
    const products = await page.locator('[key]').all();
    expect(products.length).toBeGreaterThan(0);

    // 3. Click on a product to view its details
    const firstProduct = products[0];
    await firstProduct.click();
    await expect(page).toHaveURL(/\/product\/\d+/);

    // 4. Click the "Add To Cart" button
    await page.click('text=Add To Cart');

    // 5. Verify that the cart icon in the header updates
    await expect(page.locator('#cart-count')).toHaveText('1');

    // 6. Navigate to the cart page
    await page.goto('/cart');
    await expect(page.locator('text=Shopping Cart')).toBeVisible();
  });
});
