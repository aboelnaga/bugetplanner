import { test, expect } from '@playwright/test';
import { loginBeforeTest } from './utils/auth-helpers';

test.describe('Budget UI/UX Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginBeforeTest(page);
  });

  test('should show conditional fields based on frequency', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill basic information
    await page.fill('[data-testid="budget-name-input"]', 'Frequency Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Test repeats frequency - date fields should be visible
    await page.selectOption('[data-testid="frequency-select"]', 'repeats');
    await expect(page.locator('[data-testid="start-date-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="end-date-section"]')).toBeVisible();
    
    // Test once frequency - one-time fields should be visible
    await page.selectOption('[data-testid="frequency-select"]', 'once');
    await expect(page.locator('[data-testid="one-time-month-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="one-time-year-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="start-date-section"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="end-date-section"]')).not.toBeVisible();
    
    // Test custom frequency - custom months should be visible
    await page.selectOption('[data-testid="frequency-select"]', 'custom');
    await expect(page.locator('[data-testid="custom-months-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="start-date-section"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="end-date-section"]')).not.toBeVisible();
  });

  test('should show conditional fields based on payment schedule', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill basic information
    await page.fill('[data-testid="budget-name-input"]', 'Payment Schedule Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Test custom dates payment schedule - due date should be visible
    await page.selectOption('[data-testid="payment-schedule-select"]', 'custom_dates');
    await expect(page.locator('[data-testid="due-date-section"]')).toBeVisible();
    
    // Test other payment schedules - due date should be hidden
    await page.selectOption('[data-testid="payment-schedule-select"]', 'start_of_month');
    await expect(page.locator('[data-testid="due-date-section"]')).not.toBeVisible();
    
    await page.selectOption('[data-testid="payment-schedule-select"]', 'throughout_month');
    await expect(page.locator('[data-testid="due-date-section"]')).not.toBeVisible();
  });

  test('should show conditional fields based on budget type', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill basic information
    await page.fill('[data-testid="budget-name-input"]', 'Budget Type Test');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Test investment type - investment direction should be visible
    await page.selectOption('[data-testid="budget-type-select"]', 'investment');
    await expect(page.locator('[data-testid="investment-direction-section"]')).toBeVisible();
    
    // Test other types - investment direction should be hidden
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await expect(page.locator('[data-testid="investment-direction-section"]')).not.toBeVisible();
    
    await page.selectOption('[data-testid="budget-type-select"]', 'income');
    await expect(page.locator('[data-testid="investment-direction-section"]')).not.toBeVisible();
  });

  test('should update preview when form changes', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill basic information
    await page.fill('[data-testid="budget-name-input"]', 'Preview Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Verify initial preview shows correct amount
    await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('EGP 100');
    
    // Change amount and verify preview updates
    await page.fill('[data-testid="default-amount-input"]', '200');
    await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('EGP 200');
    
    // Change frequency and verify preview updates
    await page.selectOption('[data-testid="recurrence-interval-select"]', '3');
    await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('active months');
  });

  test('should show multi-year indicator for multi-year budgets', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill basic information
    await page.fill('[data-testid="budget-name-input"]', 'Multi-Year Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Set multi-year range
    const currentYear = new Date().getFullYear();
    await page.selectOption('[data-testid="end-year-select"]', (currentYear + 2).toString());
    
    // Verify multi-year indicator appears
    await expect(page.locator('[data-testid="multi-year-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="multi-year-indicator"]')).toContainText('3 years');
  });

  test('should show end date options based on end type', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill basic information
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

  test('should show custom months selection for custom frequency', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill basic information
    await page.fill('[data-testid="budget-name-input"]', 'Custom Months Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Change to custom frequency
    await page.selectOption('[data-testid="frequency-select"]', 'custom');
    
    // Verify custom months section is visible
    await expect(page.locator('[data-testid="custom-months-section"]')).toBeVisible();
    
    // Select some custom months
    await page.click('[data-testid="custom-month-jan"]');
    await page.click('[data-testid="custom-month-mar"]');
    await page.click('[data-testid="custom-month-dec"]');
    
    // Verify preview updates
    await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('3 active months');
  });

  test('should show reminder options when reminder is enabled', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill basic information
    await page.fill('[data-testid="budget-name-input"]', 'Reminder Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Enable reminder
    await page.click('[data-testid="reminder-enabled-checkbox"]');
    
    // Verify reminder options appear
    await expect(page.locator('[data-testid="reminder-days-before-input"]')).toBeVisible();
    
    // Set reminder days
    await page.fill('[data-testid="reminder-days-before-input"]', '3');
    
    // Verify the value is set
    await expect(page.locator('[data-testid="reminder-days-before-input"]')).toHaveValue('3');
  });

  test('should show fixed expense option', async ({ page }) => {
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill basic information
    await page.fill('[data-testid="budget-name-input"]', 'Fixed Expense Test');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '100');
    
    // Enable fixed expense
    await page.click('[data-testid="fixed-expense-checkbox"]');
    
    // Verify the checkbox is checked
    await expect(page.locator('[data-testid="fixed-expense-checkbox"]')).toBeChecked();
  });
}); 