import { test, expect } from '@playwright/test';
import { loginBeforeTest } from './utils/auth-helpers';

test.describe('Budget Edge Cases and Error Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we're logged in
    await loginBeforeTest(page);
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="budget-table"]', { timeout: 10000 });
  });

  test.describe('Boundary Tests', () => {
    test('should handle year boundary transitions', async ({ page }) => {
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      await page.fill('[data-testid="budget-name-input"]', 'Year Boundary Test');
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Utilities');
      await page.fill('[data-testid="default-amount-input"]', '1000');
      
      // Set start year to current year, end year to next year
      const currentYear = new Date().getFullYear();
      await page.selectOption('[data-testid="start-year-select"]', currentYear.toString());
      await page.selectOption('[data-testid="end-year-select"]', (currentYear + 1).toString());
      
      // Verify multi-year indicator appears
      await expect(page.locator('[data-testid="multi-year-indicator"]')).toBeVisible();
      await expect(page.locator('[data-testid="multi-year-indicator"]')).toContainText('2 years');
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    });

    test('should handle month boundary transitions', async ({ page }) => {
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      await page.fill('[data-testid="budget-name-input"]', 'Month Boundary Test');
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Utilities');
      await page.fill('[data-testid="default-amount-input"]', '500');
      
      // Set start month to December, end month to January
      await page.selectOption('[data-testid="start-month-select"]', '11'); // December
      await page.selectOption('[data-testid="end-month-select"]', '0'); // January
      
      // Verify preview shows correct months
      await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('2 active months');
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    });
  });

  test.describe('Validation Tests', () => {
    test('should validate required fields', async ({ page }) => {
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      // Try to submit without filling required fields
      await page.click('[data-testid="submit-budget-btn"]');
      
      // Verify validation errors appear
      await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="amount-error"]')).toBeVisible();
    });

    test('should validate amount limits', async ({ page }) => {
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      await page.fill('[data-testid="budget-name-input"]', 'Amount Limit Test');
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Utilities');
      
      // Try to set amount above limit
      await page.fill('[data-testid="default-amount-input"]', '999999999');
      
      await page.click('[data-testid="submit-budget-btn"]');
      
      // Verify error message appears
      await expect(page.locator('[data-testid="amount-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="amount-error"]')).toContainText('Maximum amount exceeded');
    });

    test('should validate occurrence limits', async ({ page }) => {
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      await page.fill('[data-testid="budget-name-input"]', 'Occurrence Limit Test');
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Utilities');
      await page.fill('[data-testid="default-amount-input"]', '100');
      
      // Change to occurrence-based ending
      await page.selectOption('[data-testid="end-type-select"]', 'after_occurrences');
      
      // Try to set occurrences above limit
      await page.fill('[data-testid="occurrences-input"]', '150');
      
      await page.click('[data-testid="submit-budget-btn"]');
      
      // Verify error message appears
      await expect(page.locator('[data-testid="occurrences-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="occurrences-error"]')).toContainText('Maximum 120 occurrences');
    });
  });

  test.describe('Data Persistence Tests', () => {
    test('should persist budget data after page refresh', async ({ page }) => {
      // Create a budget item
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      await page.fill('[data-testid="budget-name-input"]', 'Persistence Test');
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Utilities');
      await page.fill('[data-testid="default-amount-input"]', '300');
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
      
      // Verify budget appears in table
      await expect(page.locator('[data-testid="budget-table"]')).toContainText('Persistence Test');
      
      // Refresh the page
      await page.reload();
      await page.waitForSelector('[data-testid="budget-table"]', { timeout: 10000 });
      
      // Verify budget still appears
      await expect(page.locator('[data-testid="budget-table"]')).toContainText('Persistence Test');
    });

    test('should handle concurrent edits', async ({ page, context }) => {
      // Create a budget item
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      await page.fill('[data-testid="budget-name-input"]', 'Concurrent Test');
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Utilities');
      await page.fill('[data-testid="default-amount-input"]', '400');
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
      
      // Open second tab
      const page2 = await context.newPage();
      await page2.goto('/budget-planner');
      await page2.waitForSelector('[data-testid="budget-table"]', { timeout: 10000 });
      
      // Edit in first tab
      await page.click('[data-testid="edit-budget-btn"]');
      await page.waitForSelector('[data-testid="edit-budget-modal"]');
      await page.fill('[data-testid="budget-name-input"]', 'Concurrent Test Updated');
      await page.click('[data-testid="submit-edit-btn"]');
      
      // Verify edit is reflected in second tab after refresh
      await page2.reload();
      await page2.waitForSelector('[data-testid="budget-table"]', { timeout: 10000 });
      await expect(page2.locator('[data-testid="budget-table"]')).toContainText('Concurrent Test Updated');
    });
  });

  test.describe('Performance Tests', () => {
    test('should handle many budget items', async ({ page }) => {
      // Create multiple budget items
      for (let i = 1; i <= 10; i++) {
        await page.click('[data-testid="add-budget-btn"]');
        await page.waitForSelector('[data-testid="add-budget-modal"]');
        
        await page.fill('[data-testid="budget-name-input"]', `Performance Test ${i}`);
        await page.selectOption('[data-testid="budget-type-select"]', 'expense');
        await page.selectOption('[data-testid="budget-category-select"]', 'Utilities');
        await page.fill('[data-testid="default-amount-input"]', '100');
        
        await page.click('[data-testid="submit-budget-btn"]');
        await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
      }
      
      // Verify all items are displayed
      for (let i = 1; i <= 10; i++) {
        await expect(page.locator('[data-testid="budget-table"]')).toContainText(`Performance Test ${i}`);
      }
      
      // Verify UI remains responsive
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    });

    test('should handle long multi-year spans', async ({ page }) => {
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      await page.fill('[data-testid="budget-name-input"]', 'Long Span Test');
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Utilities');
      await page.fill('[data-testid="default-amount-input"]', '100');
      
      // Set long span (10 years)
      await page.selectOption('[data-testid="start-year-select"]', '2025');
      await page.selectOption('[data-testid="end-year-select"]', '2035');
      
      // Verify preview renders correctly
      await expect(page.locator('[data-testid="multi-year-preview"]')).toBeVisible();
      await expect(page.locator('[data-testid="multi-year-preview"]')).toContainText('11 years');
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      // Verify form is usable on mobile
      await page.fill('[data-testid="budget-name-input"]', 'Mobile Test');
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Utilities');
      await page.fill('[data-testid="default-amount-input"]', '100');
      
      // Verify preview is readable on mobile
      await expect(page.locator('[data-testid="schedule-preview"]')).toBeVisible();
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    });
  });
}); 