import { test, expect } from '@playwright/test';
import { loginBeforeTest } from './utils/auth-helpers';

test.describe('Smoke Tests', () => {
  test('should load the budget planner page', async ({ page }) => {
    // Use the improved login utility
    await loginBeforeTest(page);
    
    // Verify the page loads
    await expect(page).toHaveTitle(/Budget/);
    
    // Verify key elements are present - look for the second h1 element which should be "Budget Planner"
    await expect(page.locator('h1').nth(1)).toContainText('Budget Planner');
    await expect(page.locator('[data-testid="add-budget-btn"]')).toBeVisible();
  });

  test('should open add budget modal', async ({ page }) => {
    // Use the improved login utility
    await loginBeforeTest(page);
    
    // Click add budget button
    await page.click('[data-testid="add-budget-btn"]');
    
    // Verify modal opens
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Verify key form elements are present
    await expect(page.locator('[data-testid="budget-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="budget-type-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="budget-category-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="default-amount-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="frequency-select"]')).toBeVisible();
  });

  test('should have correct default values', async ({ page }) => {
    // Use the improved login utility
    await loginBeforeTest(page);
    
    await page.click('[data-testid="add-budget-btn"]');
    
    // Verify frequency defaults to "repeats"
    await expect(page.locator('[data-testid="frequency-select"]')).toHaveValue('repeats');
    
    // Verify recurrence interval defaults to "1"
    await expect(page.locator('[data-testid="recurrence-interval-select"]')).toHaveValue('1');
  });
}); 