import { test, expect } from '@playwright/test';
import { loginBeforeTest } from './utils/auth-helpers';

test.describe('Budget UI Advanced Tests (Mocked Data)', () => {
  test.beforeEach(async ({ page }) => {
    await loginBeforeTest(page);
    
    // Mock budget items with different scenarios
    await page.route('**/rest/v1/budget_items**', async route => {
      const url = route.request().url();
      
      if (route.request().method() === 'GET') {
        // Mock different GET responses based on query parameters
        if (url.includes('year=2025')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              {
                id: 'budget-1',
                name: 'Monthly Rent',
                type: 'expense',
                category: 'Essential',
                default_amount: 5000,
                frequency: 'repeats',
                start_year: 2025,
                end_year: 2025,
                created_at: '2025-01-01T00:00:00Z'
              },
              {
                id: 'budget-2',
                name: 'Salary',
                type: 'income',
                category: 'Primary',
                default_amount: 15000,
                frequency: 'repeats',
                start_year: 2025,
                end_year: 2025,
                created_at: '2025-01-01T00:00:00Z'
              }
            ])
          });
        } else if (url.includes('year=2026')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              {
                id: 'budget-3',
                name: 'Future Investment',
                type: 'expense',
                category: 'Investment',
                default_amount: 2000,
                frequency: 'repeats',
                start_year: 2026,
                end_year: 2026,
                created_at: '2025-01-01T00:00:00Z'
              }
            ])
          });
        } else {
          // Default empty response
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([])
          });
        }
      } else if (route.request().method() === 'POST') {
        // Mock successful creation
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
        // Mock successful update
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

  test('should filter budget items by year', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Verify 2025 items are shown by default
    await expect(page.locator('[data-testid="budget-table"]')).toContainText('Monthly Rent');
    await expect(page.locator('[data-testid="budget-table"]')).toContainText('Salary');
    
    // Change year filter to 2026
    await page.selectOption('[data-testid="year-filter-select"]', '2026');
    await page.waitForLoadState('networkidle');
    
    // Verify 2026 items are shown
    await expect(page.locator('[data-testid="budget-table"]')).toContainText('Future Investment');
    await expect(page.locator('[data-testid="budget-table"]')).not.toContainText('Monthly Rent');
  });

  test('should show budget summary calculations', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Verify summary cards are present
    await expect(page.locator('[data-testid="total-income"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-expenses"]')).toBeVisible();
    await expect(page.locator('[data-testid="net-amount"]')).toBeVisible();
    
    // Verify calculations (mocked data: income 15000, expenses 5000)
    await expect(page.locator('[data-testid="total-income"]')).toContainText('EGP 15,000');
    await expect(page.locator('[data-testid="total-expenses"]')).toContainText('EGP 5,000');
    await expect(page.locator('[data-testid="net-amount"]')).toContainText('EGP 10,000');
  });

  test('should edit existing budget item', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Find and click edit button for first budget item
    const firstRow = page.locator('[data-testid="budget-table"] tbody tr').first();
    await firstRow.locator('[data-testid="edit-budget-btn"]').click();
    
    // Verify edit modal opens
    await expect(page.locator('[data-testid="edit-budget-modal"]')).toBeVisible();
    
    // Verify form is pre-filled
    await expect(page.locator('[data-testid="budget-name-input"]')).toHaveValue('Monthly Rent');
    await expect(page.locator('[data-testid="budget-type-select"]')).toHaveValue('expense');
    
    // Modify the budget
    await page.fill('[data-testid="budget-name-input"]', 'Updated Rent');
    await page.fill('[data-testid="default-amount-input"]', '6000');
    
    // Submit the edit
    await page.click('[data-testid="submit-edit-btn"]');
    
    // Verify modal closes
    await expect(page.locator('[data-testid="edit-budget-modal"]')).not.toBeVisible();
  });

  test('should delete budget item with confirmation', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Find and click delete button for first budget item
    const firstRow = page.locator('[data-testid="budget-table"] tbody tr').first();
    await firstRow.locator('[data-testid="delete-budget-btn"]').click();
    
    // Verify confirmation dialog appears
    await expect(page.locator('[data-testid="delete-confirmation-modal"]')).toBeVisible();
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete-btn"]');
    
    // Verify confirmation dialog closes
    await expect(page.locator('[data-testid="delete-confirmation-modal"]')).not.toBeVisible();
  });

  test('should handle form validation for complex scenarios', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Open modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill form with invalid data
    await page.fill('[data-testid="budget-name-input"]', ''); // Empty name
    await page.fill('[data-testid="default-amount-input"]', '-100'); // Negative amount
    await page.selectOption('[data-testid="end-type-select"]', 'occurrences');
    await page.fill('[data-testid="occurrences-input"]', '0'); // Invalid occurrences
    
    // Submit form
    await page.click('[data-testid="submit-budget-btn"]');
    
    // Verify multiple validation errors
    await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error-item"]')).toContainText('Name is required');
    await expect(page.locator('[data-testid="validation-error-item"]')).toContainText('Amount must be positive');
    await expect(page.locator('[data-testid="validation-error-item"]')).toContainText('Occurrences must be at least 1');
  });

  test('should handle multi-year budget creation with complex schedule', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Open modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill basic info
    await page.fill('[data-testid="budget-name-input"]', 'Multi-Year Project');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    await page.selectOption('[data-testid="budget-category-select"]', 'Investment');
    await page.fill('[data-testid="default-amount-input"]', '5000');
    
    // Set multi-year schedule
    await page.selectOption('[data-testid="start-year-select"]', '2025');
    await page.selectOption('[data-testid="end-year-select"]', '2027');
    await page.selectOption('[data-testid="start-month-select"]', '1'); // January
    await page.selectOption('[data-testid="end-month-select"]', '12'); // December
    
    // Verify multi-year indicator
    await expect(page.locator('[data-testid="multi-year-indicator"]')).toBeVisible();
    
    // Verify schedule preview shows multiple years
    await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('2025');
    await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('2026');
    await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('2027');
  });

  test('should handle custom frequency with specific months', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Open modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Select custom frequency
    await page.selectOption('[data-testid="frequency-select"]', 'custom');
    
    // Select specific months (Q1)
    await page.check('[data-testid="custom-month-0"]'); // January
    await page.check('[data-testid="custom-month-1"]'); // February
    await page.check('[data-testid="custom-month-2"]'); // March
    
    // Fill other required fields
    await page.fill('[data-testid="budget-name-input"]', 'Q1 Budget');
    await page.fill('[data-testid="default-amount-input"]', '3000');
    
    // Verify custom months are selected
    await expect(page.locator('[data-testid="custom-month-0"]')).toBeChecked();
    await expect(page.locator('[data-testid="custom-month-1"]')).toBeChecked();
    await expect(page.locator('[data-testid="custom-month-2"]')).toBeChecked();
    
    // Verify preview shows selected months
    await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('January');
    await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('February');
    await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('March');
  });

  test('should handle investment linking for income budgets', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Open modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Select income type
    await page.selectOption('[data-testid="budget-type-select"]', 'income');
    
    // Verify investment direction section appears
    await expect(page.locator('[data-testid="investment-direction-section"]')).toBeVisible();
    
    // Select investment direction
    await page.selectOption('[data-testid="investment-direction-select"]', 'incoming');
    
    // Verify investment direction is selected
    await expect(page.locator('[data-testid="investment-direction-select"]')).toHaveValue('incoming');
  });

  test('should handle reminder settings', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Open modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Enable reminder
    await page.check('[data-testid="reminder-enabled-checkbox"]');
    
    // Set reminder days
    await page.fill('[data-testid="reminder-days-input"]', '3');
    
    // Verify reminder settings
    await expect(page.locator('[data-testid="reminder-enabled-checkbox"]')).toBeChecked();
    await expect(page.locator('[data-testid="reminder-days-input"]')).toHaveValue('3');
  });

  test('should handle form state persistence', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for page to load
    
    // Open modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Fill some data
    await page.fill('[data-testid="budget-name-input"]', 'Test Budget');
    await page.fill('[data-testid="default-amount-input"]', '1000');
    await page.selectOption('[data-testid="budget-type-select"]', 'expense');
    
    // Close modal
    await page.click('[data-testid="cancel-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    
    // Reopen modal
    await page.click('[data-testid="add-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).toBeVisible();
    
    // Verify form is reset (empty)
    await expect(page.locator('[data-testid="budget-name-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="default-amount-input"]')).toHaveValue('');
  });
}); 