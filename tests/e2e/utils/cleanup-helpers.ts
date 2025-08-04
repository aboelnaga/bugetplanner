import { Page } from '@playwright/test';

/**
 * Cleanup utility functions for E2E tests
 */

/**
 * Delete all budget items for the current user
 * This is useful for cleaning up after tests or before tests
 */
export async function deleteAllBudgetItems(page: Page): Promise<void> {
  try {
    console.log('Cleaning up: Deleting all budget items...');
    
    // Navigate to budget planner if not already there
    await page.goto('/');
    await page.waitForSelector('[data-testid="budget-table"]', { timeout: 10000 });
    
    // Get all delete buttons
    const deleteButtons = page.locator('[data-testid="delete-budget-btn"]');
    const count = await deleteButtons.count();
    
    if (count === 0) {
      console.log('No budget items to delete');
      return;
    }
    
    console.log(`Found ${count} budget items to delete`);
    
    // Set up dialog handler once
    page.on('dialog', async dialog => {
      console.log('Dialog message:', dialog.message());
      await dialog.accept();
    });
    
    // Delete each budget item with a timeout
    for (let i = 0; i < count; i++) {
      try {
        // Click the first delete button (they get re-indexed after each deletion)
        await page.locator('[data-testid="delete-budget-btn"]').first().click();
        
        // Wait for the item to be removed from the table
        await page.waitForTimeout(500);
        
        console.log(`Deleted budget item ${i + 1}/${count}`);
      } catch (error) {
        console.log(`Error deleting budget item ${i + 1}:`, error);
        // Continue with next item
      }
    }
    
    console.log('Cleanup completed');
  } catch (error) {
    console.log('Error during cleanup:', error);
  }
}

/**
 * Delete a specific budget item by name
 */
export async function deleteBudgetItemByName(page: Page, itemName: string): Promise<void> {
  try {
    console.log(`Cleaning up: Deleting budget item "${itemName}"...`);
    
    // Find the row containing the budget item
    const budgetRow = page.locator('[data-testid="budget-table"]')
      .locator('tr')
      .filter({ hasText: itemName });
    
    if (await budgetRow.count() === 0) {
      console.log(`Budget item "${itemName}" not found`);
      return;
    }
    
    // Set up dialog handler
    page.on('dialog', async dialog => {
      console.log('Dialog message:', dialog.message());
      await dialog.accept();
    });
    
    // Click delete button in that row
    await budgetRow.locator('[data-testid="delete-budget-btn"]').first().click();
    
    // Wait for the item to be removed
    await page.waitForTimeout(500);
    
    console.log(`Successfully deleted budget item "${itemName}"`);
  } catch (error) {
    console.log(`Error deleting budget item "${itemName}":`, error);
  }
}

/**
 * Clean up test data before running tests
 * This ensures a clean state for tests
 */
export async function cleanupBeforeTest(page: Page): Promise<void> {
  console.log('Running pre-test cleanup...');
  await deleteAllBudgetItems(page);
}

/**
 * Clean up test data after running tests
 * This prevents test data accumulation
 */
export async function cleanupAfterTest(page: Page): Promise<void> {
  console.log('Running post-test cleanup...');
  await deleteAllBudgetItems(page);
}

/**
 * Delete budget items created during a test
 * Call this at the end of tests that create budget items
 */
export async function cleanupTestData(page: Page, createdItems: string[]): Promise<void> {
  console.log('Cleaning up test data...');
  
  for (const itemName of createdItems) {
    await deleteBudgetItemByName(page, itemName);
  }
  
  console.log('Test data cleanup completed');
}

/**
 * Test data tracker for managing created items during tests
 */
export class TestDataTracker {
  private createdItems: string[] = [];

  /**
   * Add an item to the tracker
   */
  addItem(itemName: string): void {
    this.createdItems.push(itemName);
    console.log(`Added "${itemName}" to test data tracker`);
  }

  /**
   * Get all tracked items
   */
  getItems(): string[] {
    return [...this.createdItems];
  }

  /**
   * Clear the tracker
   */
  clear(): void {
    this.createdItems = [];
  }

  /**
   * Clean up all tracked items
   */
  async cleanup(page: Page): Promise<void> {
    if (this.createdItems.length === 0) {
      console.log('No tracked items to clean up');
      return;
    }

    console.log(`Cleaning up ${this.createdItems.length} tracked items...`);
    await cleanupTestData(page, this.createdItems);
    this.clear();
  }
} 