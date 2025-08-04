import { test, expect } from '@playwright/test';
import { loginBeforeTest } from './utils/auth-helpers';
import { cleanupBeforeTestAPI, cleanupAfterTestAPI } from './utils/api-cleanup-helpers';

test.describe('Budget Editing Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginBeforeTest(page);
    await cleanupBeforeTestAPI(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupAfterTestAPI(page);
  });

  test('should edit a single year budget', async ({ page }) => {
    // Create a budget first
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    const uniqueName = `Edit Test Budget ${Date.now()}`;
    await page.fill('[data-testid="budget-name-input"]', uniqueName);
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '1000');
    
    await page.click('[data-testid="submit-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    
    // Wait for budget to appear in table
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
    
    // Find and click edit button
    const budgetRow = page.locator('[data-testid="budget-table"]').locator('tr').filter({ hasText: uniqueName });
    await budgetRow.locator('[data-testid="edit-budget-btn"]').first().click();
    await expect(page.locator('[data-testid="edit-budget-modal"]')).toBeVisible();
    
    // Modify the budget
    await page.fill('[data-testid="budget-name-input"]', `${uniqueName} - Edited`);
    await page.fill('[data-testid="default-amount-input"]', '1500');
    
    // Submit the edit
    await page.click('[data-testid="submit-edit-btn"]');
    await expect(page.locator('[data-testid="edit-budget-modal"]')).not.toBeVisible();
    
    // Verify the edit was saved
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(`${uniqueName} - Edited`);
  });

  test('should convert single year to multi-year budget', async ({ page }) => {
    // Create a single year budget first
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    const uniqueName = `Single Year Test ${Date.now()}`;
    await page.fill('[data-testid="budget-name-input"]', uniqueName);
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '500');
    
    await page.click('[data-testid="submit-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    
    // Wait for budget to appear in table
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
    
    // Find and click edit button
    const budgetRow = page.locator('[data-testid="budget-table"]').locator('tr').filter({ hasText: uniqueName });
    await budgetRow.locator('[data-testid="edit-budget-btn"]').first().click();
    await expect(page.locator('[data-testid="edit-budget-modal"]')).toBeVisible();
    
    // Change to multi-year
    await page.selectOption('[data-testid="end-year-select"]', '2027');
    
    // Verify multi-year indicator appears
    await expect(page.locator('[data-testid="multi-year-indicator"]')).toBeVisible();
    
    // Submit the edit
    await page.click('[data-testid="submit-edit-btn"]');
    await expect(page.locator('[data-testid="edit-budget-modal"]')).not.toBeVisible();
    
    // Verify the budget is now multi-year
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
  });

  test('should convert multi-year to single year budget', async ({ page }) => {
    // Create a multi-year budget first
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    const uniqueName = `Multi-Year Test ${Date.now()}`;
    await page.fill('[data-testid="budget-name-input"]', uniqueName);
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '500');
    await page.selectOption('[data-testid="end-year-select"]', '2027');
    
    await page.click('[data-testid="submit-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    
    // Wait for budget to appear in table
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
    
    // Find and click edit button
    const budgetRow = page.locator('[data-testid="budget-table"]').locator('tr').filter({ hasText: uniqueName });
    await budgetRow.locator('[data-testid="edit-budget-btn"]').first().click();
    await expect(page.locator('[data-testid="edit-budget-modal"]')).toBeVisible();
    
    // Change to single year
    await page.selectOption('[data-testid="end-year-select"]', '2025');
    
    // Verify multi-year indicator disappears
    await expect(page.locator('[data-testid="multi-year-indicator"]')).not.toBeVisible();
    
    // Submit the edit
    await page.click('[data-testid="submit-edit-btn"]');
    await expect(page.locator('[data-testid="edit-budget-modal"]')).not.toBeVisible();
    
    // Verify the budget is now single year
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
  });

  test('should change frequency from monthly to quarterly', async ({ page }) => {
    // Create a monthly budget first
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    const uniqueName = `Monthly Test ${Date.now()}`;
    await page.fill('[data-testid="budget-name-input"]', uniqueName);
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '500');
    
    await page.click('[data-testid="submit-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    
    // Wait for budget to appear in table
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
    
    // Find and click edit button
    const budgetRow = page.locator('[data-testid="budget-table"]').locator('tr').filter({ hasText: uniqueName });
    await budgetRow.locator('[data-testid="edit-budget-btn"]').first().click();
    await expect(page.locator('[data-testid="edit-budget-modal"]')).toBeVisible();
    
    // Change to quarterly
    await page.selectOption('[data-testid="recurrence-interval-select"]', '3');
    
    // Verify preview updates
    await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('active months');
    
    // Submit the edit
    await page.click('[data-testid="submit-edit-btn"]');
    await expect(page.locator('[data-testid="edit-budget-modal"]')).not.toBeVisible();
    
    // Verify the budget was updated
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
  });

  test('should change frequency from repeats to once', async ({ page }) => {
    // Create a repeating budget first
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    const uniqueName = `Repeating Test ${Date.now()}`;
    await page.fill('[data-testid="budget-name-input"]', uniqueName);
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '500');
    
    await page.click('[data-testid="submit-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    
    // Wait for budget to appear in table
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
    
    // Find and click edit button
    const budgetRow = page.locator('[data-testid="budget-table"]').locator('tr').filter({ hasText: uniqueName });
    await budgetRow.locator('[data-testid="edit-budget-btn"]').first().click();
    await expect(page.locator('[data-testid="edit-budget-modal"]')).toBeVisible();
    
    // Change to once
    await page.selectOption('[data-testid="frequency-select"]', 'once');
    
    // Verify one-time fields appear
    await expect(page.locator('[data-testid="one-time-month-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="one-time-year-select"]')).toBeVisible();
    
    // Submit the edit
    await page.click('[data-testid="submit-edit-btn"]');
    await expect(page.locator('[data-testid="edit-budget-modal"]')).not.toBeVisible();
    
    // Verify the budget was updated
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
  });

  test('should preserve form data when switching between frequencies', async ({ page }) => {
    // Create a budget first
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    const uniqueName = `Preserve Test ${Date.now()}`;
    await page.fill('[data-testid="budget-name-input"]', uniqueName);
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '500');
    
    await page.click('[data-testid="submit-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    
    // Wait for budget to appear in table
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
    
    // Find and click edit button
    const budgetRow = page.locator('[data-testid="budget-table"]').locator('tr').filter({ hasText: uniqueName });
    await budgetRow.locator('[data-testid="edit-budget-btn"]').first().click();
    await expect(page.locator('[data-testid="edit-budget-modal"]')).toBeVisible();
    
    // Change amount
    await page.fill('[data-testid="default-amount-input"]', '750');
    
    // Switch to once and back to repeats
    await page.selectOption('[data-testid="frequency-select"]', 'once');
    await page.selectOption('[data-testid="frequency-select"]', 'repeats');
    
    // Verify amount is preserved
    await expect(page.locator('[data-testid="default-amount-input"]')).toHaveValue(/EGP\s*750/);
    
    // Submit the edit
    await page.click('[data-testid="submit-edit-btn"]');
    await expect(page.locator('[data-testid="edit-budget-modal"]')).not.toBeVisible();
    
    // Verify the budget was updated
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
  });
}); 