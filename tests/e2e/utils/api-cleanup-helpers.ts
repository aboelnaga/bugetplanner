import { Page } from '@playwright/test';

/**
 * API-based cleanup utility functions for E2E tests
 * These functions use the Supabase API directly instead of UI interactions
 */

/**
 * Get the current user ID from the browser's localStorage
 */
async function getCurrentUserId(page: Page): Promise<string> {
  // Wait for the page to be ready and user to be authenticated
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Extra wait for auth to settle
  
  const userId = await page.evaluate(() => {
    // Try multiple possible localStorage keys
    const keys = ['supabase.auth.token', 'sb-shnnbuquwnzzzudwvcdp-auth-token'];
    
    for (const key of keys) {
      const session = localStorage.getItem(key);
      if (session) {
        try {
          const parsed = JSON.parse(session);
          console.log('Found session data:', parsed);
          return parsed.currentSession?.user?.id || parsed.user?.id;
        } catch (e) {
          console.log('Error parsing session:', e);
        }
      }
    }
    
    // Log all localStorage keys for debugging
    console.log('All localStorage keys:', Object.keys(localStorage));
    return null;
  });
  
  if (!userId) {
    throw new Error('No authenticated user found');
  }
  
  return userId;
}

/**
 * Delete all budget items for the current user using API
 */
export async function deleteAllBudgetItemsAPI(page: Page): Promise<void> {
  try {
    console.log('API Cleanup: Deleting all budget items...');
    
    const userId = await getCurrentUserId(page);
    
    // Call the deleteAllBudgetItems API function
    await page.evaluate(async (userId) => {
      const { budgetAPI } = await import('/src/lib/supabase.js');
      await budgetAPI.deleteAllBudgetItems(userId);
    }, userId);
    
    console.log('API Cleanup: All budget items deleted successfully');
  } catch (error) {
    console.log('API Cleanup Error:', error);
  }
}

/**
 * Delete a specific budget item by ID using API
 */
export async function deleteBudgetItemByIdAPI(page: Page, budgetItemId: string): Promise<void> {
  try {
    console.log(`API Cleanup: Deleting budget item with ID: ${budgetItemId}`);
    
    // Call the deleteBudgetItem API function
    await page.evaluate(async (budgetItemId) => {
      const { budgetAPI } = await import('/src/lib/supabase.js');
      await budgetAPI.deleteBudgetItem(budgetItemId);
    }, budgetItemId);
    
    console.log(`API Cleanup: Budget item ${budgetItemId} deleted successfully`);
  } catch (error) {
    console.log(`API Cleanup Error deleting item ${budgetItemId}:`, error);
  }
}

/**
 * Get all budget items for the current user using API
 */
export async function getAllBudgetItemsAPI(page: Page): Promise<any[]> {
  try {
    console.log('API Cleanup: Fetching all budget items...');
    
    const userId = await getCurrentUserId(page);
    
    // Call the getAllBudgetItems API function
    const budgetItems = await page.evaluate(async (userId) => {
      const { budgetAPI } = await import('/src/lib/supabase.js');
      return await budgetAPI.getAllBudgetItems(userId);
    }, userId);
    
    console.log(`API Cleanup: Found ${budgetItems.length} budget items`);
    return budgetItems;
  } catch (error) {
    console.log('API Cleanup Error fetching items:', error);
    return [];
  }
}

/**
 * Delete budget items by name using API
 */
export async function deleteBudgetItemsByNameAPI(page: Page, itemNames: string[]): Promise<void> {
  try {
    console.log(`API Cleanup: Deleting budget items by name: ${itemNames.join(', ')}`);
    
    const userId = await getCurrentUserId(page);
    
    // Get all budget items first
    const allItems = await page.evaluate(async (userId) => {
      const { budgetAPI } = await import('/src/lib/supabase.js');
      return await budgetAPI.getAllBudgetItems(userId);
    }, userId);
    
    // Find items by name and delete them
    for (const itemName of itemNames) {
      const itemToDelete = allItems.find(item => item.name === itemName);
      if (itemToDelete) {
        await page.evaluate(async (budgetItemId) => {
          const { budgetAPI } = await import('/src/lib/supabase.js');
          await budgetAPI.deleteBudgetItem(budgetItemId);
        }, itemToDelete.id);
        console.log(`API Cleanup: Deleted budget item "${itemName}" (ID: ${itemToDelete.id})`);
      } else {
        console.log(`API Cleanup: Budget item "${itemName}" not found`);
      }
    }
  } catch (error) {
    console.log('API Cleanup Error deleting items by name:', error);
  }
}

/**
 * Clean up test data before running tests using API
 */
export async function cleanupBeforeTestAPI(page: Page): Promise<void> {
  console.log('API Cleanup: Running pre-test cleanup...');
  await deleteAllBudgetItemsAPI(page);
}

/**
 * Clean up test data after running tests using API
 */
export async function cleanupAfterTestAPI(page: Page): Promise<void> {
  console.log('API Cleanup: Running post-test cleanup...');
  await deleteAllBudgetItemsAPI(page);
}

/**
 * Test data tracker for API-based cleanup
 */
export class APITestDataTracker {
  private createdItemIds: string[] = [];

  /**
   * Add an item ID to the tracker
   */
  addItemId(itemId: string): void {
    this.createdItemIds.push(itemId);
    console.log(`API Tracker: Added item ID "${itemId}" to tracker`);
  }

  /**
   * Add an item by name (will be resolved to ID during cleanup)
   */
  addItemByName(itemName: string): void {
    // This will be resolved during cleanup
    this.createdItemIds.push(itemName);
    console.log(`API Tracker: Added item name "${itemName}" to tracker`);
  }

  /**
   * Get all tracked item IDs
   */
  getItemIds(): string[] {
    return [...this.createdItemIds];
  }

  /**
   * Clear the tracker
   */
  clear(): void {
    this.createdItemIds = [];
  }

  /**
   * Clean up all tracked items using API
   */
  async cleanup(page: Page): Promise<void> {
    if (this.createdItemIds.length === 0) {
      console.log('API Tracker: No tracked items to clean up');
      return;
    }

    console.log(`API Tracker: Cleaning up ${this.createdItemIds.length} tracked items...`);
    
    // Delete items by ID or name
    await deleteBudgetItemsByNameAPI(page, this.createdItemIds);
    this.clear();
  }
} 