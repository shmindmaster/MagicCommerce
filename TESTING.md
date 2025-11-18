# MagicCommerce E2E Test Plan

This document outlines the end-to-end (E2E) test cases for the MagicCommerce platform. The test suite is designed with a **mobile-first mindset** to ensure a high-quality user experience on the most common devices.

## Testing Framework

- **Framework**: [Playwright](https://playwright.dev/)
- **Browsers**: Chromium (for automated tests), with manual verification for Safari (WebKit) and Firefox.
- **Default Viewport**: Mobile (emulating a Pixel 5)

## How to Run Tests

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment Variables**:
   ```bash
   cp .env.example .env
   # Fill in the required variables
   ```

3. **Run the E2E Tests**:
   ```bash
   npm run test:e2e
   ```

---

## Test Cases

### 1. Core E-commerce Flow (Anonymous User)

| Field                   | Details                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID & Title**  | `E2E-C1-001`: View and Add Product to Cart                                                                                                                           |
| **Preconditions / Setup** | The application is running, and the database is seeded with products.                                                                                               |
| **Test Steps**            | 1. Navigate to the home page. <br> 2. Verify that a list of products is displayed. <br> 3. Click on a product to view its details. <br> 4. Click the "Add To Cart" button. <br> 5. Verify that the cart icon in the header updates with the correct item count. <br> 6. Navigate to the cart page. |
| **Test Data**             | N/A                                                                                                                                                                 |
| **Expected Result**     | The selected product should be added to the cart, and the cart should display the correct product, quantity, and total price.                                         |
| **Pass/Fail Criteria**    | **Pass**: The product is successfully added to the cart, and the cart's state is updated correctly. <br> **Fail**: The product is not added, or the cart's state is incorrect. |
| **Type of Testing**       | Functional, UI/UX (Mobile & Desktop)                                                                                                                                |

---

### 2. User Authentication

| Field                   | Details                                                                                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID & Title**  | `E2E-A1-001`: User Registration and Login                                                                                                                            |
| **Preconditions / Setup** | The application is running.                                                                                                                                        |
| **Test Steps**            | 1. Navigate to the login page. <br> 2. Click the "Register" link. <br> 3. Fill out the registration form with valid data. <br> 4. Submit the form. <br> 5. Verify that the user is redirected to the home page and is in a logged-in state. <br> 6. Log out. <br> 7. Log back in with the newly created credentials. |
| **Test Data**             | - Username: `testuser` <br> - Email: `test@example.com` <br> - Password: `password123`                                                                                  |
| **Expected Result**     | The user should be able to register a new account, log out, and log back in successfully.                                                                            |
| **Pass/Fail Criteria**    | **Pass**: The user can register and log in. <br> **Fail**: Registration or login fails.                                                                              |
| **Type of Testing**       | Functional                                                                                                                                                         |

---

### 3. Authenticated Checkout Flow

| Field                   | Details                                                                                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID & Title**  | `E2E-C2-001`: Complete Checkout Process                                                                                                                              |
| **Preconditions / Setup** | The user is logged in and has at least one item in their cart.                                                                                                       |
| **Test Steps**            | 1. Navigate to the cart page. <br> 2. Click the "Checkout" button. <br> 3. Fill in the shipping address form. <br> 4. Proceed to the payment step. <br> 5. Enter mock payment details. <br> 6. Complete the purchase. |
| **Test Data**             | - Shipping Address: 123 Main St, Anytown, USA <br> - Mock Payment Info (e.g., Stripe's test card numbers)                                                              |
| **Expected Result**     | The user should be able to complete the checkout process and be redirected to a success page. A new order should be created and visible in the user's order history. |
| **Pass/Fail Criteria**    | **Pass**: Checkout is successful, and an order is created. <br> **Fail**: Checkout fails at any step.                                                                 |
| **Type of Testing**       | Functional, Data Validation                                                                                                                                        |
