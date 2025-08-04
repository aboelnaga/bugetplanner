import { test, expect } from '@playwright/test';
import { loginBeforeTest } from './utils/auth-helpers';

test.describe('Budget Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginBeforeTest(page);
  });

  test('should validate required fields', async ({ page }) => {
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

  test('should validate amount limits', async ({ page }) => {
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
    expect(inputValue).toBeTruthy();
    expect(parseInt(inputValue) || 0).toBeLessThanOrEqual(9999999999);
  });

  test('should validate occurrence limits', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill in basic information
    await page.fill('[data-testid="budget-name-input"]', 'Occurrence Limit Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Change to occurrence-based ending
    await page.selectOption('[data-testid="end-type-select"]', 'after_occurrences');
    
    // Try to set occurrences above limit
    await page.fill('[data-testid="occurrences-input"]', '150');
    
    // Submit the form
    await page.click('[data-testid="submit-budget-btn"]');
    
    // Verify validation errors appear
    await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error-item"]')).toContainText('Occurrences must be between 1 and 120');
  });

  test('should validate date ranges', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill in basic information
    await page.fill('[data-testid="budget-name-input"]', 'Date Range Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Set invalid date range (start year after end year)
    const currentYear = new Date().getFullYear();
    await page.selectOption('[data-testid="start-year-select"]', (currentYear + 2).toString());
    await page.selectOption('[data-testid="end-year-select"]', currentYear.toString());
    
    // Submit the form
    await page.click('[data-testid="submit-budget-btn"]');
    
    // Verify validation errors appear
    await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error-item"]')).toContainText('Start year cannot be after end year');
  });

  test('should validate past months for current year', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill in basic information
    await page.fill('[data-testid="budget-name-input"]', 'Past Month Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Set start month to a past month (assuming current month is August = 7)
    await page.selectOption('[data-testid="start-month-select"]', '5'); // June (past month)
    
    // Submit the form
    await page.click('[data-testid="submit-budget-btn"]');
    
    // Verify validation errors appear
    await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error-item"]')).toContainText('Start month cannot be in the past for the current year');
  });

  test('should validate custom months selection', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill in basic information
    await page.fill('[data-testid="budget-name-input"]', 'Custom Months Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Change to custom frequency
    await page.selectOption('[data-testid="frequency-select"]', 'custom');
    
    // Submit without selecting any custom months
    await page.click('[data-testid="submit-budget-btn"]');
    
    // Verify validation errors appear
    await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error-item"]')).toContainText('Please select at least one custom month');
  });

  test('should validate one-time month selection', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill in basic information
    await page.fill('[data-testid="budget-name-input"]', 'One-Time Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Change to once frequency
    await page.selectOption('[data-testid="frequency-select"]', 'once');
    
    // Submit without selecting one-time month
    await page.click('[data-testid="submit-budget-btn"]');
    
    // Verify validation errors appear
    await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error-item"]')).toContainText('Please select a month for one-time frequency');
  });

  test('should validate recurrence interval', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill in basic information
    await page.fill('[data-testid="budget-name-input"]', 'Recurrence Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Clear recurrence interval
    await page.selectOption('[data-testid="recurrence-interval-select"]', '');
    
    // Submit the form
    await page.click('[data-testid="submit-budget-btn"]');
    
    // Verify validation errors appear
    await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error-item"]')).toContainText('Please select a recurrence interval');
  });
}); 