import { test, expect } from '@playwright/test';
import { loginBeforeTest } from './utils/auth-helpers';
import { cleanupBeforeTest, cleanupAfterTest, TestDataTracker } from './utils/cleanup-helpers';

test.describe('Budget Creation Tests with Data Tracker', () => {
  let tracker: TestDataTracker;

  test.beforeEach(async ({ page }) => {
    await loginBeforeTest(page);
    await cleanupBeforeTest(page);
    tracker = new TestDataTracker();
  });

  test.afterEach(async ({ page }) => {
    // Clean up only the items created during this test
    await tracker.cleanup(page);
    await cleanupAfterTest(page);
  });

  test('should create a single year budget with tracking', async ({ page }) => {
    // Open add budget modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill in basic information
    const uniqueName = `Tracked Test Budget ${Date.now()}`;
    await page.fill('[data-testid="budget-name-input"]', uniqueName);
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '1000');
    
    // Submit the form
    await page.click('[data-testid="submit-budget-btn"]');
    
    // Verify modal closes and budget appears
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
    
    // Track the created item
    tracker.addItem(uniqueName);
    
    // Verify the item is tracked
    expect(tracker.getItems()).toContain(uniqueName);
  });

  test('should create multiple budget items with tracking', async ({ page }) => {
    const createdItems: string[] = [];
    
    // Create first budget item
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    const item1Name = `Tracked Item 1 ${Date.now()}`;
    await page.fill('[data-testid="budget-name-input"]', item1Name);
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '500');
    
    await page.click('[data-testid="submit-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(item1Name);
    
    tracker.addItem(item1Name);
    createdItems.push(item1Name);
    
    // Create second budget item
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    const item2Name = `Tracked Item 2 ${Date.now()}`;
    await page.fill('[data-testid="budget-name-input"]', item2Name);
    await page.selectOption('[data-testid="budget-type-select"]', 'income');
    await page.selectOption('[data-testid="budget-category-select"]', 'Salary');
    await page.fill('[data-testid="default-amount-input"]', '2000');
    
    await page.click('[data-testid="submit-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(item2Name);
    
    tracker.addItem(item2Name);
    createdItems.push(item2Name);
    
    // Verify both items are tracked
    expect(tracker.getItems()).toHaveLength(2);
    expect(tracker.getItems()).toContain(item1Name);
    expect(tracker.getItems()).toContain(item2Name);
    
    // Verify both items are in the table
    for (const itemName of createdItems) {
      await expect(page.locator('[data-testid="budget-table"]')).toContainText(itemName);
    }
  });

  test('should handle test failure gracefully', async ({ page }) => {
    // This test demonstrates that even if a test fails, cleanup still works
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    const itemName = `Failure Test Item ${Date.now()}`;
    await page.fill('[data-testid="budget-name-input"]', itemName);
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
    await page.fill('[data-testid="default-amount-input"]', '300');
    
    await page.click('[data-testid="submit-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    
    // Track the item
    tracker.addItem(itemName);
    
    // Simulate a test failure (this will be caught by the afterEach cleanup)
    // expect(page.locator('[data-testid="non-existent-element"]')).toBeVisible();
    
    // The afterEach hook will still clean up the tracked item even if this test fails
  });
}); 