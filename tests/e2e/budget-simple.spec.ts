import { test, expect } from '@playwright/test';
import { loginBeforeTest } from './utils/auth-helpers';
import { cleanupBeforeTestAPI, cleanupAfterTestAPI } from './utils/api-cleanup-helpers';

test.describe('Budget Simple Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginBeforeTest(page);
    await cleanupBeforeTestAPI(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupAfterTestAPI(page);
  });

  test('should create a basic budget', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    const uniqueName = `Simple Test ${Date.now()}`;
    await page.fill('[data-testid="budget-name-input"]', uniqueName);
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '500');
    
    await page.click('[data-testid="submit-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Submit without filling required fields
    await page.click('[data-testid="submit-budget-btn"]');
    
    // Verify validation errors appear
    await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();
  });

  test('should enforce amount limits', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    await page.fill('[data-testid="budget-name-input"]', 'Amount Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    
    // Try to enter a large amount
    await page.fill('[data-testid="default-amount-input"]', '10000000000');
    
    // Check that the input value is capped
    const inputValue = await page.locator('[data-testid="default-amount-input"]').inputValue();
    console.log('Input value after entering large number:', inputValue);
    
    expect(inputValue).toBeTruthy();
    expect(parseInt(inputValue) || 0).toBeLessThanOrEqual(9999999999);
  });

  test('should show conditional fields based on frequency', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    await page.fill('[data-testid="budget-name-input"]', 'Frequency Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Test repeats frequency
    await page.selectOption('[data-testid="frequency-select"]', 'repeats');
    await expect(page.locator('[data-testid="start-date-section"]')).toBeVisible();
    
    // Test once frequency
    await page.selectOption('[data-testid="frequency-select"]', 'once');
    await expect(page.locator('[data-testid="one-time-month-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="one-time-year-select"]')).toBeVisible();
  });

  test('should show conditional fields based on payment schedule', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    await page.fill('[data-testid="budget-name-input"]', 'Payment Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Test custom dates payment schedule
    await page.selectOption('[data-testid="payment-schedule-select"]', 'custom_dates');
    await expect(page.locator('[data-testid="due-date-section"]')).toBeVisible();
  });

  test('should show conditional fields based on budget type', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    await page.fill('[data-testid="budget-name-input"]', 'Type Test');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Test investment type
    await page.selectOption('[data-testid="budget-type-select"]', 'investment');
    await expect(page.locator('[data-testid="investment-direction-section"]')).toBeVisible();
  });

  test('should update preview when form changes', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    await page.fill('[data-testid="budget-name-input"]', 'Preview Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Verify preview shows correct amount
    await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('EGP 100');
    
    // Change amount and verify preview updates
    await page.fill('[data-testid="default-amount-input"]', '200');
    await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('EGP 200');
  });

  test('should show multi-year indicator', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    await page.fill('[data-testid="budget-name-input"]', 'Multi-Year Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Set multi-year range
    const currentYear = new Date().getFullYear();
    await page.selectOption('[data-testid="end-year-select"]', (currentYear + 2).toString());
    
    // Verify multi-year indicator appears
    await expect(page.locator('[data-testid="multi-year-indicator"]')).toBeVisible();
  });

  test('should show end date options based on end type', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    await page.fill('[data-testid="budget-name-input"]', 'End Type Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Test specific date end type
    await page.selectOption('[data-testid="end-type-select"]', 'specific_date');
    await expect(page.locator('[data-testid="end-date-section"]')).toBeVisible();
    
    // Test occurrences end type
    await page.selectOption('[data-testid="end-type-select"]', 'after_occurrences');
    await expect(page.locator('[data-testid="end-date-section"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="occurrences-input"]')).toBeVisible();
  });

  test('should show custom months selection', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    await page.fill('[data-testid="budget-name-input"]', 'Custom Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Change to custom frequency
    await page.selectOption('[data-testid="frequency-select"]', 'custom');
    
    // Verify that custom months are available (check for December which should always be available)
    await expect(page.locator('[data-testid="custom-month-11"]')).toBeVisible();
  });
}); 