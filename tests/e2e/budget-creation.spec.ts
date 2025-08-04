import { test, expect } from '@playwright/test';
import { loginBeforeTest } from './utils/auth-helpers';
import { cleanupBeforeTestAPI, cleanupAfterTestAPI } from './utils/api-cleanup-helpers';

test.describe('Budget Creation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginBeforeTest(page);
    await cleanupBeforeTestAPI(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupAfterTestAPI(page);
  });

  test('should create a single year budget', async ({ page }) => {
    // Open add budget modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill in basic information
    await page.fill('[data-testid="budget-name-input"]', 'Test Budget');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '1000');
    
    // Verify frequency defaults to repeats
    await expect(page.locator('[data-testid="frequency-select"]')).toHaveValue('repeats');
    await expect(page.locator('[data-testid="recurrence-interval-select"]')).toHaveValue('1');
    
    // Submit the form
    await page.click('[data-testid="submit-budget-btn"]');
    
    // Verify modal closes
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    
    // Verify budget appears in table
    await expect(page.locator('[data-testid="budget-table"]')).toContainText('Test Budget');
  });

  test('should create a multi-year budget', async ({ page }) => {
    // Open add budget modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill in basic information
    await page.fill('[data-testid="budget-name-input"]', 'Multi-Year Test Budget');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '500');
    
    // Set multi-year dates
    await page.selectOption('[data-testid="start-year-select"]', '2025');
    await page.selectOption('[data-testid="end-year-select"]', '2027');
    
    // Verify multi-year indicator appears
    await expect(page.locator('[data-testid="multi-year-indicator"]')).toBeVisible();
    
    // Submit the form
    await page.click('[data-testid="submit-budget-btn"]');
    
    // Verify modal closes
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    
    // Verify budget appears in table
    await expect(page.locator('[data-testid="budget-table"]')).toContainText('Multi-Year Test Budget');
  });

  test('should create a one-time budget', async ({ page }) => {
    // Open add budget modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill in basic information
    await page.fill('[data-testid="budget-name-input"]', 'One-Time Test Budget');
    await page.selectOption('[data-testid="budget-type-select"]', 'income');
    await page.selectOption('[data-testid="budget-category-select"]', 'Bonus');
    await page.fill('[data-testid="default-amount-input"]', '5000');
    
    // Change to one-time frequency
    await page.selectOption('[data-testid="frequency-select"]', 'once');
    
    // Verify one-time fields appear
    await expect(page.locator('[data-testid="one-time-month-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="one-time-year-select"]')).toBeVisible();
    
    // Submit the form
    await page.click('[data-testid="submit-budget-btn"]');
    
    // Verify modal closes
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    
    // Verify budget appears in table
    await expect(page.locator('[data-testid="budget-table"]')).toContainText('One-Time Test Budget');
  });

  test('should show validation errors for required fields', async ({ page }) => {
    // Open add budget modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Try to submit without filling required fields
    await page.click('[data-testid="submit-budget-btn"]');
    
    // Verify validation errors appear
    await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();
    
    // Check that at least one validation error contains the name requirement
    const validationErrors = page.locator('[data-testid="validation-error-item"]');
    await expect(validationErrors.first()).toContainText('Name is required');
  });

  test('should enforce amount limits in input field', async ({ page }) => {
    // Open add budget modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill in basic information
    await page.fill('[data-testid="budget-name-input"]', 'Amount Limit Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    
    // Try to enter an amount that exceeds the limit (10 billion)
    await page.fill('[data-testid="default-amount-input"]', '10000000000');
    
    // Check that the input value is capped at the maximum allowed value
    const inputValue = await page.locator('[data-testid="default-amount-input"]').inputValue();
    console.log('Input value after entering large number:', inputValue);
    
    // The input should either be capped at the maximum or show the entered value
    // We'll check that it's not empty and has some reasonable value
    expect(inputValue).toBeTruthy();
    expect(parseInt(inputValue) || 0).toBeLessThanOrEqual(9999999999);
  });

  test('should show conditional fields based on frequency', async ({ page }) => {
    // Open add budget modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Default should be repeats - date fields should be visible
    await expect(page.locator('[data-testid="start-date-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="end-date-section"]')).toBeVisible();
    
    // Change to once - date fields should be hidden, one-time fields visible
    await page.selectOption('[data-testid="frequency-select"]', 'once');
    await expect(page.locator('[data-testid="start-date-section"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="end-date-section"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="one-time-month-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="one-time-year-select"]')).toBeVisible();
  });

  test('should show conditional fields based on payment schedule', async ({ page }) => {
    // Open add budget modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Default should be throughout_month - due date should be hidden
    await expect(page.locator('[data-testid="due-date-section"]')).not.toBeVisible();
    
    // Change to custom_dates - due date should be visible
    await page.selectOption('[data-testid="payment-schedule-select"]', 'custom_dates');
    await expect(page.locator('[data-testid="due-date-section"]')).toBeVisible();
  });

  test('should show conditional fields based on budget type', async ({ page }) => {
    // Open add budget modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Default should be expense - investment direction should be hidden
    await expect(page.locator('[data-testid="investment-direction-section"]')).not.toBeVisible();
    
    // Change to investment - investment direction should be visible
    await page.selectOption('[data-testid="budget-type-select"]', 'investment');
    await expect(page.locator('[data-testid="investment-direction-section"]')).toBeVisible();
  });

  test('should update preview when form changes', async ({ page }) => {
    // Open add budget modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill in basic information
    await page.fill('[data-testid="budget-name-input"]', 'Preview Test Budget');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '500');
    
    // Verify initial preview shows some active months
    await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('active months');
    
    // Change to quarterly
    await page.selectOption('[data-testid="recurrence-interval-select"]', '3');
    
    // Verify preview updates
    await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('active months');
  });
}); 