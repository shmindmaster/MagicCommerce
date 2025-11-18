import { test, expect } from '@playwright/test';

test.describe('Anonymous User E-commerce Flow', () => {
  test('should allow a user to view products and add one to the cart', async ({ page }) => {
    // 1. Navigate to the home page
    await page.goto('/');

    // 2. Verify that a list of products is displayed
    await expect(page.locator('text=Products')).toBeVisible();

    // Mobile-First Validation: Check if the product grid is in a mobile-friendly layout
    const productGrid = page.locator('.grid');
    const boundingBox = await productGrid.boundingBox();
    expect(boundingBox.width).toBeLessThan(500); // A reasonable proxy for a single-column mobile layout

    const products = await page.locator('[key]').all();
    expect(products.length).toBeGreaterThan(0);

    // 3. Click on a product to view its details
    const firstProduct = products[0];
    const productName = await firstProduct.locator('div > a > div > div').innerText();
    await firstProduct.click();

    await expect(page).toHaveURL(/\/product\/\d+/);
    await expect(page.locator(`text=${productName}`)).toBeVisible();

    // 4. Click the "Add To Cart" button
    await page.click('text=Add To Cart');

    // 5. Verify that the cart icon in the header updates with the correct item count
    const cartCount = page.locator('#cart-count');
    await expect(cartCount).toHaveText('1');

    // 6. Navigate to the cart page
    await page.goto('/cart');
    await expect(page.locator(`text=${productName}`)).toBeVisible();
    await expect(page.locator('text=Shopping Cart')).toBeVisible();
  });
});
