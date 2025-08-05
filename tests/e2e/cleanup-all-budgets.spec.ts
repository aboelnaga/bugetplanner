import { test, expect } from '@playwright/test';
import { loginBeforeTest } from './utils/auth-helpers';
import { deleteAllBudgetItems } from './utils/cleanup-helpers';

test.describe('Cleanup All Budget Items', () => {
  test('should delete all budget items for current user', async ({ page }) => {
    // Login first
    await loginBeforeTest(page);
    
    // Navigate to budget planner
    await page.goto('/');
    await page.waitForSelector('[data-testid="budget-table"]', { timeout: 10000 });
    
    // Get initial count of budget items
    const deleteButtons = page.locator('[data-testid="delete-budget-btn"]');
    const initialCount = await deleteButtons.count();
    
    console.log(`Found ${initialCount} budget items to delete`);
    
    if (initialCount === 0) {
      console.log('No budget items to delete');
      return;
    }
    
    // Delete all budget items
    await deleteAllBudgetItems(page);
    
    // Verify all items are deleted
    const remainingDeleteButtons = page.locator('[data-testid="delete-budget-btn"]');
    const finalCount = await remainingDeleteButtons.count();
    
    console.log(`Cleanup completed. Remaining items: ${finalCount}`);
    
    // Verify that all items were deleted
    expect(finalCount).toBe(0);
  });
}); 