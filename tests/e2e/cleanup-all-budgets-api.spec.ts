import { test, expect } from '@playwright/test';
import { loginBeforeTest } from './utils/auth-helpers';
import { deleteAllBudgetItemsAPI, getAllBudgetItemsAPI } from './utils/api-cleanup-helpers';

test.describe('API Cleanup All Budget Items', () => {
  test('should delete all budget items for current user using API', async ({ page }) => {
    // Login first
    await loginBeforeTest(page);
    
    // Get initial count of budget items
    const initialItems = await getAllBudgetItemsAPI(page);
    const initialCount = initialItems.length;
    
    console.log(`API Cleanup: Found ${initialCount} budget items to delete`);
    
    if (initialCount === 0) {
      console.log('API Cleanup: No budget items to delete');
      return;
    }
    
    // Delete all budget items using API
    await deleteAllBudgetItemsAPI(page);
    
    // Verify all items are deleted
    const finalItems = await getAllBudgetItemsAPI(page);
    const finalCount = finalItems.length;
    
    console.log(`API Cleanup: Remaining items: ${finalCount}`);
    
    // Verify that all items were deleted
    expect(finalCount).toBe(0);
  });
}); 