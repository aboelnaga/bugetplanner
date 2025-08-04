import { test, expect } from '@playwright/test';
import { loginBeforeTest } from './utils/auth-helpers';

test.describe('Budget UI Tests (Mocked Data)', () => {
  test.beforeEach(async ({ page }) => {
    await loginBeforeTest(page);
    
    // Mock all Supabase API calls
    await page.route('**/rest/v1/budget_items**', async route => {
      const url = route.request().url();
      
      if (route.request().method() === 'GET') {
        // Mock GET response - return empty array for clean state
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      } else if (route.request().method() === 'POST') {
        // Mock POST response - return created budget item
        const requestBody = JSON.parse(route.request().postData() || '{}');
        const mockResponse = {
          id: 'mock-budget-id-' + Date.now(),
          ...requestBody,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(mockResponse)
        });
      } else if (route.request().method() === 'PATCH') {
        // Mock PATCH response - return updated budget item
        const requestBody = JSON.parse(route.request().postData() || '{}');
        const mockResponse = {
          id: 'mock-budget-id-updated',
          ...requestBody,
          updated_at: new Date().toISOString()
        };
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockResponse)
        });
      } else if (route.request().method() === 'DELETE') {
        // Mock DELETE response
        await route.fulfill({
          status: 204,
          body: ''
        });
      }
    });

    // Mock user session
    await page.route('**/auth/v1/user**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-user-id',
          email: 'test@example.com',
          user_metadata: { name: 'Test User' }
        })
      });
    });
  });

  test('should open add budget modal and show form fields', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Click add budget button
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Verify form fields are present
    await expect(page.locator('[data-testid="budget-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="budget-type-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="budget-category-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="default-amount-input"]')).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Open modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Submit empty form
    await page.click('[data-testid="submit-budget-btn"]');
    
    // Verify validation errors appear
    await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error-item"]')).toContainText('Name is required');
  });

  test('should show conditional fields based on frequency selection', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Open modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Select 'once' frequency
    await page.selectOption('[data-testid="frequency-select"]', 'once');
    
    // Verify one-time fields appear
    await expect(page.locator('[data-testid="one-time-month-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="one-time-year-select"]')).toBeVisible();
    
    // Verify recurring fields are hidden
    await expect(page.locator('[data-testid="recurrence-interval-select"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="start-month-select"]')).not.toBeVisible();
    
    // Switch back to 'repeats'
    await page.selectOption('[data-testid="frequency-select"]', 'repeats');
    
    // Verify recurring fields appear
    await expect(page.locator('[data-testid="recurrence-interval-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="start-month-select"]')).toBeVisible();
    
    // Verify one-time fields are hidden
    await expect(page.locator('[data-testid="one-time-month-select"]')).not.toBeVisible();
  });

  test('should show conditional fields based on payment schedule', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Open modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Select 'specific_date' payment schedule
    await page.selectOption('[data-testid="payment-schedule-select"]', 'specific_date');
    
    // Verify due date field appears
    await expect(page.locator('[data-testid="due-date-section"]')).toBeVisible();
    
    // Switch to 'throughout_month'
    await page.selectOption('[data-testid="payment-schedule-select"]', 'throughout_month');
    
    // Verify due date field is hidden
    await expect(page.locator('[data-testid="due-date-section"]')).not.toBeVisible();
  });

  test('should show conditional fields based on budget type', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Open modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Select 'income' type
    await page.selectOption('[data-testid="budget-type-select"]', 'income');
    
    // Verify investment direction section appears
    await expect(page.locator('[data-testid="investment-direction-section"]')).toBeVisible();
    
    // Switch to 'expense'
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    
    // Verify investment direction section is hidden
    await expect(page.locator('[data-testid="investment-direction-section"]')).not.toBeVisible();
  });

  test('should update preview when form changes', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Open modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill basic info
    await page.fill('[data-testid="budget-name-input"]', 'Test Budget');
    await page.fill('[data-testid="default-amount-input"]', '1000');
    
    // Verify preview updates
    await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('Test Budget');
    await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('EGP 1,000');
  });

  test('should show multi-year indicator for multi-year budgets', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Open modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Set multi-year dates
    await page.selectOption('[data-testid="start-year-select"]', '2025');
    await page.selectOption('[data-testid="end-year-select"]', '2026');
    
    // Verify multi-year indicator appears
    await expect(page.locator('[data-testid="multi-year-indicator"]')).toBeVisible();
  });

  test('should show end date options based on end type', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Open modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Select 'occurrences' end type
    await page.selectOption('[data-testid="end-type-select"]', 'occurrences');
    
    // Verify occurrences field appears
    await expect(page.locator('[data-testid="occurrences-input"]')).toBeVisible();
    
    // Switch to 'specific_date'
    await page.selectOption('[data-testid="end-type-select"]', 'specific_date');
    
    // Verify end date fields appear
    await expect(page.locator('[data-testid="end-date-section"]')).toBeVisible();
  });

  test('should show custom months selection for custom frequency', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Open modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Select 'custom' frequency
    await page.selectOption('[data-testid="frequency-select"]', 'custom');
    
    // Verify custom months section appears
    await expect(page.locator('[data-testid="custom-months-section"]')).toBeVisible();
    
    // Select some months
    await page.check('[data-testid="custom-month-0"]'); // January
    await page.check('[data-testid="custom-month-5"]'); // June
    
    // Verify selected months are checked
    await expect(page.locator('[data-testid="custom-month-0"]')).toBeChecked();
    await expect(page.locator('[data-testid="custom-month-5"]')).toBeChecked();
  });

  test('should close modal on cancel button', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Open modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Click cancel button
    await page.click('[data-testid="cancel-btn"]');
    
    // Verify modal is closed
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
  });

  test('should show reminder options when reminder is enabled', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Open modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Enable reminder
    await page.check('[data-testid="reminder-enabled-checkbox"]');
    
    // Verify reminder days field appears
    await expect(page.locator('[data-testid="reminder-days-input"]')).toBeVisible();
    
    // Disable reminder
    await page.uncheck('[data-testid="reminder-enabled-checkbox"]');
    
    // Verify reminder days field is hidden
    await expect(page.locator('[data-testid="reminder-days-input"]')).not.toBeVisible();
  });

  test('should show fixed expense option', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Open modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Verify fixed expense checkbox is present
    await expect(page.locator('[data-testid="fixed-expense-checkbox"]')).toBeVisible();
    
    // Check fixed expense
    await page.check('[data-testid="fixed-expense-checkbox"]');
    
    // Verify it's checked
    await expect(page.locator('[data-testid="fixed-expense-checkbox"]')).toBeChecked();
  });
}); 