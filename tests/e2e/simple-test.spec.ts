import { test, expect } from '@playwright/test';
import { loginBeforeTest } from './utils/auth-helpers';

test.describe('Simple Tests', () => {
  test('should connect to the application', async ({ page }) => {
    // This test will only work if the dev server is running manually
    try {
      // Ensure we're logged in
      await loginBeforeTest(page);
      
      // Navigate to budget planner
      await page.goto('/');
      
      // Wait for the page to load
      await page.waitForLoadState('networkidle');
      
      // Check if the page loaded successfully
      await expect(page).toHaveTitle(/Budget/);
      
      console.log('✅ Successfully connected to the application');
    } catch (error) {
      console.log('❌ Failed to connect to the application');
      console.log('Make sure to run: npm run dev');
      throw error;
    }
  });

  test('should show budget planner page', async ({ page }) => {
    // Use the improved login utility
    await loginBeforeTest(page);
    
    // Check for key elements - look for the second h1 element which should be "Budget Planner"
    await expect(page.locator('h1').nth(1)).toContainText('Budget Planner');
    
    // Check if add budget button is present
    const addButton = page.locator('[data-testid="add-budget-btn"]');
    if (await addButton.isVisible()) {
      console.log('✅ Add budget button is visible');
    } else {
      console.log('⚠️ Add budget button not found - check data-testid attributes');
    }
  });
}); 