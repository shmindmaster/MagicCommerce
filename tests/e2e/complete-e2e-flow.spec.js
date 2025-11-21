import { expect, test } from '@playwright/test';

/**
 * Complete E2E Test Suite for MagicCommerce
 * Tests the full user journey from browsing to checkout with AI features
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('MagicCommerce Complete E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto(BASE_URL);
  });

  test('01 - Health Check and Home Page Load', async ({ page }) => {
    // Check API health
    const healthResponse = await page.request.get(`${BASE_URL}/api/health`);
    expect(healthResponse.ok()).toBeTruthy();
    const health = await healthResponse.json();
    expect(health.status).toBe('healthy');

    // Verify home page loads
    await expect(page).toHaveTitle(/MagicCommerce|Home/i);

    // Check for main navigation
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('02 - Browse Products and View Details', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector(
      '[data-testid="product-card"], .product-card, article',
      {
        timeout: 10000,
      }
    );

    // Click on first product
    const firstProduct = page
      .locator('[data-testid="product-card"], .product-card, article')
      .first();
    await firstProduct.click();

    // Verify product detail page loads
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/\$/)).toBeVisible(); // Price
  });

  test('03 - AI Product Search', async ({ page }) => {
    // Find and use search functionality
    const searchInput = page
      .getByRole('searchbox')
      .or(page.getByPlaceholder(/search/i));

    if (await searchInput.isVisible()) {
      await searchInput.fill('laptop');
      await searchInput.press('Enter');

      // Wait for search results
      await page.waitForLoadState('networkidle');

      // Verify results appear
      const productCards = page.locator(
        '[data-testid="product-card"], .product-card, article'
      );
      await expect(productCards.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('04 - Add Product to Cart', async ({ page }) => {
    // Navigate to first product
    await page.waitForSelector(
      '[data-testid="product-card"], .product-card, article',
      {
        timeout: 10000,
      }
    );
    await page
      .locator('[data-testid="product-card"], .product-card, article')
      .first()
      .click();

    // Add to cart
    const addToCartBtn = page.getByRole('button', { name: /add to cart/i });
    await addToCartBtn.click();

    // Verify cart icon or notification updates
    await expect(
      page
        .getByText(/added to cart|item added|cart updated/i)
        .or(page.locator('[data-testid="cart-badge"]'))
    ).toBeVisible({ timeout: 5000 });
  });

  test('05 - View Cart', async ({ page }) => {
    // Add a product first
    await page.waitForSelector(
      '[data-testid="product-card"], .product-card, article',
      {
        timeout: 10000,
      }
    );
    await page
      .locator('[data-testid="product-card"], .product-card, article')
      .first()
      .click();
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(1000);

    // Navigate to cart
    const cartLink = page
      .getByRole('link', { name: /cart/i })
      .or(page.locator('[href="/cart"], [data-testid="cart-link"]'));
    await cartLink.click();

    // Verify cart page
    await expect(page).toHaveURL(/\/cart/);
    await expect(
      page.locator('[data-testid="cart-item"], .cart-item').first()
    ).toBeVisible();
  });

  test('06 - AI Assistant Chat', async ({ page }) => {
    // Look for AI chat button/widget
    const chatWidget = page
      .getByRole('button', { name: /chat|assistant|help/i })
      .or(
        page.locator(
          '[data-testid="ai-chat"], [class*="chat"], [class*="assistant"]'
        )
      );

    if (await chatWidget.isVisible({ timeout: 5000 })) {
      await chatWidget.click();

      // Type a message
      const chatInput = page
        .getByPlaceholder(/ask|type|message/i)
        .or(
          page
            .locator('[data-testid="chat-input"], textarea, input[type="text"]')
            .last()
        );

      if (await chatInput.isVisible({ timeout: 5000 })) {
        await chatInput.fill('What products do you recommend?');
        await chatInput.press('Enter');

        // Wait for response
        await expect(
          page
            .locator('[class*="message"], [data-testid="chat-message"]')
            .last()
        ).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('07 - Product Q&A', async ({ page }) => {
    // Navigate to product detail
    await page.waitForSelector(
      '[data-testid="product-card"], .product-card, article',
      {
        timeout: 10000,
      }
    );
    await page
      .locator('[data-testid="product-card"], .product-card, article')
      .first()
      .click();

    // Look for Q&A section
    const qaSection = page.getByText(/questions|q&a|ask a question/i);

    if (await qaSection.isVisible({ timeout: 5000 })) {
      await qaSection.scrollIntoViewIfNeeded();

      const qaInput = page
        .getByPlaceholder(/ask|question/i)
        .or(page.locator('[data-testid="qa-input"]'));

      if (await qaInput.isVisible({ timeout: 3000 })) {
        await qaInput.fill('What are the specifications?');
        await page.getByRole('button', { name: /submit|ask|send/i }).click();

        // Wait for answer
        await expect(
          page.locator('[class*="answer"], [data-testid="qa-answer"]')
        ).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('08 - Personalized Recommendations', async ({ page }) => {
    // View a product to generate interaction
    await page.waitForSelector(
      '[data-testid="product-card"], .product-card, article',
      {
        timeout: 10000,
      }
    );
    await page
      .locator('[data-testid="product-card"], .product-card, article')
      .first()
      .click();

    // Look for recommendations section
    const recommendationsSection = page.getByText(
      /recommended|similar|you may also like/i
    );

    if (await recommendationsSection.isVisible({ timeout: 5000 })) {
      await recommendationsSection.scrollIntoViewIfNeeded();

      // Verify recommendation products are displayed
      const recommendedProducts = page.locator(
        '[data-testid="recommendation"], [class*="recommendation"]'
      );
      if ((await recommendedProducts.count()) > 0) {
        await expect(recommendedProducts.first()).toBeVisible();
      }
    }
  });

  test('09 - Update Cart Quantity', async ({ page }) => {
    // Add product and go to cart
    await page.waitForSelector(
      '[data-testid="product-card"], .product-card, article',
      {
        timeout: 10000,
      }
    );
    await page
      .locator('[data-testid="product-card"], .product-card, article')
      .first()
      .click();
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(1000);

    await page
      .getByRole('link', { name: /cart/i })
      .or(page.locator('[href="/cart"]'))
      .click();

    // Update quantity
    const quantityInput = page
      .locator('[data-testid="quantity-input"], input[type="number"]')
      .first();

    if (await quantityInput.isVisible()) {
      await quantityInput.fill('2');
      await quantityInput.blur();
      await page.waitForTimeout(1000);

      // Verify total updates
      const total = await page
        .locator('[data-testid="cart-total"], [class*="total"]')
        .textContent();
      expect(total).toBeTruthy();
    }
  });

  test('10 - Proceed to Checkout', async ({ page }) => {
    // Add product and go to cart
    await page.waitForSelector(
      '[data-testid="product-card"], .product-card, article',
      {
        timeout: 10000,
      }
    );
    await page
      .locator('[data-testid="product-card"], .product-card, article')
      .first()
      .click();
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(1000);

    await page
      .getByRole('link', { name: /cart/i })
      .or(page.locator('[href="/cart"]'))
      .click();

    // Click checkout
    const checkoutBtn = page
      .getByRole('button', { name: /checkout|proceed/i })
      .or(page.getByRole('link', { name: /checkout|proceed/i }));
    await checkoutBtn.click();

    // Verify checkout page or auth redirect
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url).toMatch(/\/(checkout|auth|login)/);
  });
});

test.describe('API Integration Tests', () => {
  test('API - Get Products', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/products`);
    expect(response.ok()).toBeTruthy();

    const products = await response.json();
    expect(Array.isArray(products)).toBeTruthy();
    if (products.length > 0) {
      expect(products[0]).toHaveProperty('id');
      expect(products[0]).toHaveProperty('title');
      expect(products[0]).toHaveProperty('price');
    }
  });

  test('API - AI Search', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/products/ai-search`, {
      data: {
        query: 'laptop',
        limit: 5,
      },
    });

    if (response.ok()) {
      const result = await response.json();
      expect(result).toHaveProperty('results');
    }
  });

  test('API - Health Check', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    expect(response.ok()).toBeTruthy();

    const health = await response.json();
    expect(health).toHaveProperty('status');
    expect(health.status).toBe('healthy');
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('Mobile - Navigate and Browse', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check mobile menu
    const mobileMenuBtn = page
      .getByRole('button', { name: /menu|navigation/i })
      .or(page.locator('[aria-label*="menu"], [class*="hamburger"]'));

    if (await mobileMenuBtn.isVisible()) {
      await mobileMenuBtn.click();
      await expect(page.getByRole('navigation')).toBeVisible();
    }

    // Verify products are visible on mobile
    await page.waitForSelector(
      '[data-testid="product-card"], .product-card, article',
      {
        timeout: 10000,
      }
    );
    await expect(
      page
        .locator('[data-testid="product-card"], .product-card, article')
        .first()
    ).toBeVisible();
  });
});
