import { test, expect } from '@playwright/test';
import { loginBeforeTest } from './utils/auth-helpers';

test.describe('Budget Management Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we're logged in
    await loginBeforeTest(page);
    
    // Navigate to the budget planner page
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="budget-table"]', { timeout: 10000 });
  });

  test.describe('Add Budget Item Flows', () => {
    test('should create monthly single year budget', async ({ page }) => {
      // Click add budget button
      await page.click('[data-testid="add-budget-btn"]');
      
      // Wait for modal to appear
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      // Fill basic information
      await page.fill('[data-testid="budget-name-input"]', 'Monthly Salary');
      await page.selectOption('[data-testid="budget-type-select"]', 'income');
      await page.selectOption('[data-testid="budget-category-select"]', 'Salary');
      
      // Fill financial details
      await page.fill('[data-testid="default-amount-input"]', '5000');
      await page.selectOption('[data-testid="payment-schedule-select"]', 'start_of_month');
      
      // Verify frequency defaults to "Repeats every 1 month"
      await expect(page.locator('[data-testid="frequency-select"]')).toHaveValue('repeats');
      await expect(page.locator('[data-testid="recurrence-interval-select"]')).toHaveValue('1');
      
      // Verify preview shows monthly amounts (should be 5 months from July to December)
      await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('5 active months');
      
      // Submit the form
      await page.click('[data-testid="submit-budget-btn"]');
      
      // Verify modal closes
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
      
      // Verify budget item appears in table
      await expect(page.locator('[data-testid="budget-table"]')).toContainText('Monthly Salary');
    });

    test('should create quarterly single year budget', async ({ page }) => {
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      // Fill basic information
      await page.fill('[data-testid="budget-name-input"]', 'Quarterly Bonus');
      await page.selectOption('[data-testid="budget-type-select"]', 'income');
      await page.selectOption('[data-testid="budget-category-select"]', 'Bonus');
      await page.fill('[data-testid="default-amount-input"]', '3000');
      
      // Change frequency to quarterly
      await page.selectOption('[data-testid="frequency-select"]', 'repeats');
      await page.selectOption('[data-testid="recurrence-interval-select"]', '3');
      
      // Verify preview shows quarterly amounts (should be 2 months from July to December)
      await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('2 active months');
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="budget-table"]')).toContainText('Quarterly Bonus');
    });

    test('should create one-time budget', async ({ page }) => {
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      // Fill basic information
      await page.fill('[data-testid="budget-name-input"]', 'One-time Payment');
      await page.selectOption('[data-testid="budget-type-select"]', 'income');
      await page.selectOption('[data-testid="budget-category-select"]', 'Bonus');
      await page.fill('[data-testid="default-amount-input"]', '10000');
      
      // Change frequency to once
      await page.selectOption('[data-testid="frequency-select"]', 'once');
      
      // Verify date fields are hidden
      await expect(page.locator('[data-testid="start-date-section"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="end-date-section"]')).not.toBeVisible();
      
      // Select one-time month and year (use August since June is in the past)
      await page.selectOption('[data-testid="one-time-month-select"]', '7'); // August
      await page.selectOption('[data-testid="one-time-year-select"]', '2025');
      
      // Verify preview shows single occurrence
      await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('1 active month');
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="budget-table"]')).toContainText('One-time Payment');
    });

    test('should create custom frequency budget', async ({ page }) => {
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      // Fill basic information
      await page.fill('[data-testid="budget-name-input"]', 'Custom Expenses');
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Utilities');
      await page.fill('[data-testid="default-amount-input"]', '200');
      
      // Change frequency to custom
      await page.selectOption('[data-testid="frequency-select"]', 'custom');
      
      // Select custom months (August, September, October, November)
      await page.check('[data-testid="custom-month-7"]'); // August
      await page.check('[data-testid="custom-month-8"]'); // September
      await page.check('[data-testid="custom-month-9"]'); // October
      await page.check('[data-testid="custom-month-10"]'); // November
      
      // Verify preview shows custom months
      await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('4 active months');
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="budget-table"]')).toContainText('Custom Expenses');
    });

    test('should create multi-year budget', async ({ page }) => {
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      // Fill basic information
      await page.fill('[data-testid="budget-name-input"]', 'Multi-Year Project');
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
      await page.fill('[data-testid="default-amount-input"]', '1000');
      
      // Set multi-year dates
      await page.selectOption('[data-testid="start-year-select"]', '2025');
      await page.selectOption('[data-testid="end-year-select"]', '2027');
      
      // Verify multi-year indicator appears
      await expect(page.locator('[data-testid="multi-year-indicator"]')).toBeVisible();
      await expect(page.locator('[data-testid="multi-year-indicator"]')).toContainText('Multi-Year Budget Item');
      
      // Verify preview shows multi-year breakdown
      await expect(page.locator('[data-testid="multi-year-preview"]')).toBeVisible();
      await expect(page.locator('[data-testid="multi-year-preview"]')).toContainText('3 years');
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="budget-table"]')).toContainText('Multi-Year Project');
    });

    test('should handle dynamic month validation correctly', async ({ page }) => {
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      // Fill basic information
      await page.fill('[data-testid="budget-name-input"]', 'Dynamic Month Test');
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
      await page.fill('[data-testid="default-amount-input"]', '500');
      
      // Test one-time frequency with future year
      await page.selectOption('[data-testid="frequency-select"]', 'once');
      await page.selectOption('[data-testid="one-time-year-select"]', '2026');
      
      // Verify all months are available for future year
      const oneTimeMonthSelect = page.locator('[data-testid="one-time-month-select"]');
      await expect(oneTimeMonthSelect.locator('option[value="0"]')).toBeEnabled(); // January
      await expect(oneTimeMonthSelect.locator('option[value="11"]')).toBeEnabled(); // December
      
      // Test custom frequency (should only allow current and future months)
      await page.selectOption('[data-testid="frequency-select"]', 'custom');
      
      // Verify only current and future months are enabled for custom frequency
      const customMonthCheckboxes = page.locator('[data-testid^="custom-month-"]');
      const currentMonth = new Date().getMonth();
      
      // Check that past months are disabled
      for (let i = 0; i < currentMonth; i++) {
        await expect(page.locator(`[data-testid="custom-month-${i}"]`)).toBeDisabled();
      }
      
      // Check that current and future months are enabled
      for (let i = currentMonth; i < 12; i++) {
        await expect(page.locator(`[data-testid="custom-month-${i}"]`)).toBeEnabled();
      }
      
      // Test repeats frequency with future year
      await page.selectOption('[data-testid="frequency-select"]', 'repeats');
      await page.selectOption('[data-testid="start-year-select"]', '2026');
      await page.selectOption('[data-testid="start-month-select"]', '0'); // January
      await page.selectOption('[data-testid="end-year-select"]', '2026');
      await page.selectOption('[data-testid="end-month-select"]', '11'); // December
      
      // Verify all months are available for future year in repeats
      const startMonthSelect = page.locator('[data-testid="start-month-select"]');
      await expect(startMonthSelect.locator('option[value="0"]')).toBeEnabled(); // January
      await expect(startMonthSelect.locator('option[value="11"]')).toBeEnabled(); // December
      
      // Verify preview shows active months
      await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('12 active months');
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    });
  });

  test.describe('Edit Budget Item Flows', () => {
    test.beforeEach(async ({ page }) => {
      // Create a test budget item first
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      await page.fill('[data-testid="budget-name-input"]', 'Test Budget');
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Utilities');
      await page.fill('[data-testid="default-amount-input"]', '500');
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    });

    test('should convert single year to multi-year', async ({ page }) => {
      // Click edit on the test budget
      await page.click('[data-testid="edit-budget-btn"]');
      await page.waitForSelector('[data-testid="edit-budget-modal"]');
      
      // Change end year to future year
      await page.selectOption('[data-testid="end-year-select"]', '2027');
      
      // Verify multi-year indicator appears
      await expect(page.locator('[data-testid="multi-year-indicator"]')).toBeVisible();
      
      // Submit the edit
      await page.click('[data-testid="submit-edit-btn"]');
      await expect(page.locator('[data-testid="edit-budget-modal"]')).not.toBeVisible();
      
      // Verify the budget is now multi-year
      await expect(page.locator('[data-testid="budget-table"]')).toContainText('Multi-Year');
    });

    test('should convert multi-year to single year', async ({ page }) => {
      // First create a multi-year budget
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      await page.fill('[data-testid="budget-name-input"]', 'Multi-Year Test');
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Utilities');
      await page.fill('[data-testid="default-amount-input"]', '500');
      await page.selectOption('[data-testid="end-year-select"]', '2027');
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
      
      // Now edit it to single year
      await page.click('[data-testid="edit-budget-btn"]');
      await page.waitForSelector('[data-testid="edit-budget-modal"]');
      
      // Change end year to same as start year
      await page.selectOption('[data-testid="end-year-select"]', '2025');
      
      // Verify multi-year indicator disappears
      await expect(page.locator('[data-testid="multi-year-indicator"]')).not.toBeVisible();
      
      await page.click('[data-testid="submit-edit-btn"]');
      await expect(page.locator('[data-testid="edit-budget-modal"]')).not.toBeVisible();
    });

    test('should change frequency from monthly to quarterly', async ({ page }) => {
      // First create a monthly budget
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      const uniqueName = `Monthly Test Budget ${Date.now()}`;
      await page.fill('[data-testid="budget-name-input"]', uniqueName);
      await page.selectOption('[data-testid="budget-type-select"]', 'income');
      await page.selectOption('[data-testid="budget-category-select"]', 'Salary');
      await page.fill('[data-testid="default-amount-input"]', '5000');
      await page.selectOption('[data-testid="payment-schedule-select"]', 'start_of_month');
      await page.selectOption('[data-testid="frequency-select"]', 'repeats');
      await page.selectOption('[data-testid="recurrence-interval-select"]', '1');
      await page.selectOption('[data-testid="start-month-select"]', '8'); // September
      await page.selectOption('[data-testid="start-year-select"]', '2025');
      await page.selectOption('[data-testid="end-month-select"]', '11'); // December
      await page.selectOption('[data-testid="end-year-select"]', '2025');
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
      
      // Wait for the budget to appear in the table
      await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
      
      // Now edit the budget
      const budgetRow = page.locator('[data-testid="budget-table"]').locator('tr').filter({ hasText: uniqueName });
      await budgetRow.locator('[data-testid="edit-budget-btn"]').first().click();
      await page.waitForSelector('[data-testid="edit-budget-modal"]');
      
      // Change frequency to quarterly
      await page.selectOption('[data-testid="recurrence-interval-select"]', '3');
      
      // Verify preview updates
      await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('2 active months');
      
      await page.click('[data-testid="submit-edit-btn"]');
      await expect(page.locator('[data-testid="edit-budget-modal"]')).not.toBeVisible();
    });

    test('should change frequency from repeats to once', async ({ page }) => {
      // First create a repeating budget
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      const uniqueName = `Repeating Test Budget ${Date.now()}`;
      await page.fill('[data-testid="budget-name-input"]', uniqueName);
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
      await page.fill('[data-testid="default-amount-input"]', '1000');
      await page.selectOption('[data-testid="payment-schedule-select"]', 'throughout_month');
      await page.selectOption('[data-testid="frequency-select"]', 'repeats');
      await page.selectOption('[data-testid="recurrence-interval-select"]', '1');
      await page.selectOption('[data-testid="start-month-select"]', '8'); // September
      await page.selectOption('[data-testid="start-year-select"]', '2025');
      await page.selectOption('[data-testid="end-month-select"]', '11'); // December
      await page.selectOption('[data-testid="end-year-select"]', '2025');
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
      
      // Wait for the budget to appear in the table
      await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
      
      // Now edit the budget
      const budgetRow = page.locator('[data-testid="budget-table"]').locator('tr').filter({ hasText: uniqueName });
      await budgetRow.locator('[data-testid="edit-budget-btn"]').first().click();
      await page.waitForSelector('[data-testid="edit-budget-modal"]');
      
      // Change frequency to once
      await page.selectOption('[data-testid="frequency-select"]', 'once');
      
      // Verify one-time fields are visible
      await expect(page.locator('[data-testid="one-time-month-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="one-time-year-select"]')).toBeVisible();
      
      await page.click('[data-testid="submit-edit-btn"]');
      await expect(page.locator('[data-testid="edit-budget-modal"]')).not.toBeVisible();
    });

    test('should load edit modal with correct form data for monthly budget', async ({ page }) => {
      // Create a monthly budget with specific data
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      const uniqueName = `Monthly Test Budget ${Date.now()}`;
      await page.fill('[data-testid="budget-name-input"]', uniqueName);
      await page.selectOption('[data-testid="budget-type-select"]', 'income');
      await page.selectOption('[data-testid="budget-category-select"]', 'Salary');
      await page.fill('[data-testid="default-amount-input"]', '5000');
      await page.selectOption('[data-testid="payment-schedule-select"]', 'start_of_month');
      await page.selectOption('[data-testid="frequency-select"]', 'repeats');
      await page.selectOption('[data-testid="recurrence-interval-select"]', '1');
      await page.selectOption('[data-testid="start-month-select"]', '8'); // September
      await page.selectOption('[data-testid="start-year-select"]', '2025');
      await page.selectOption('[data-testid="end-month-select"]', '11'); // December
      await page.selectOption('[data-testid="end-year-select"]', '2025');
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
      
      // Wait for the budget to appear in the table
      await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
      
      // Find and click the edit button for the specific budget we just created
      const budgetRow = page.locator('[data-testid="budget-table"]').locator('tr').filter({ hasText: uniqueName });
      await budgetRow.locator('[data-testid="edit-budget-btn"]').first().click();
      await page.waitForSelector('[data-testid="edit-budget-modal"]');
      
      // Verify all form fields are loaded with correct values
      await expect(page.locator('[data-testid="budget-name-input"]')).toHaveValue(uniqueName);
      await expect(page.locator('[data-testid="budget-type-select"]')).toHaveValue('income');
      await expect(page.locator('[data-testid="budget-category-select"]')).toHaveValue('Salary');
      await expect(page.locator('[data-testid="default-amount-input"]')).toHaveValue(/EGP\s*5,000/);
      await expect(page.locator('[data-testid="payment-schedule-select"]')).toHaveValue('start_of_month');
      await expect(page.locator('[data-testid="frequency-select"]')).toHaveValue('repeats');
      await expect(page.locator('[data-testid="recurrence-interval-select"]')).toHaveValue('1');
      await expect(page.locator('[data-testid="start-month-select"]')).toHaveValue('8');
      await expect(page.locator('[data-testid="start-year-select"]')).toHaveValue('2025');
      await expect(page.locator('[data-testid="end-month-select"]')).toHaveValue('11');
      await expect(page.locator('[data-testid="end-year-select"]')).toHaveValue('2025');
      
      // Verify preview shows correct data
      await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('4 active months');
      await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('EGP 20,000');
      
      await page.click('[data-testid="submit-edit-btn"]');
      await expect(page.locator('[data-testid="edit-budget-modal"]')).not.toBeVisible();
    });

    test('should load edit modal with correct form data for one-time budget', async ({ page }) => {
      // Create a one-time budget with specific data
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      const uniqueName = `One-Time Test Budget ${Date.now()}`;
      await page.fill('[data-testid="budget-name-input"]', uniqueName);
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
      await page.fill('[data-testid="default-amount-input"]', '1000');
      await page.selectOption('[data-testid="frequency-select"]', 'once');
      await page.selectOption('[data-testid="one-time-month-select"]', '10'); // November
      await page.selectOption('[data-testid="one-time-year-select"]', '2026');
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
      
      // Wait for the budget to appear in the table
      await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
      
      // Find and click the edit button for the specific budget we just created
      const budgetRow = page.locator('[data-testid="budget-table"]').locator('tr').filter({ hasText: uniqueName });
      await budgetRow.locator('[data-testid="edit-budget-btn"]').first().click();
      await page.waitForSelector('[data-testid="edit-budget-modal"]');
      
      // Verify all form fields are loaded with correct values
      await expect(page.locator('[data-testid="budget-name-input"]')).toHaveValue(uniqueName);
      await expect(page.locator('[data-testid="budget-type-select"]')).toHaveValue('expense');
      await expect(page.locator('[data-testid="budget-category-select"]')).toHaveValue('Essential');
      await expect(page.locator('[data-testid="default-amount-input"]')).toHaveValue(/EGP\s*1,000/);
      await expect(page.locator('[data-testid="frequency-select"]')).toHaveValue('once');
      await expect(page.locator('[data-testid="one-time-month-select"]')).toHaveValue('10');
      await expect(page.locator('[data-testid="one-time-year-select"]')).toHaveValue('2026');
      
      // Verify preview shows correct data
      await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('1 active month');
      await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('EGP 1,000');
      
      await page.click('[data-testid="submit-edit-btn"]');
      await expect(page.locator('[data-testid="edit-budget-modal"]')).not.toBeVisible();
    });

    test('should load edit modal with correct form data for custom budget', async ({ page }) => {
      // Create a custom budget with specific data
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      const uniqueName = `Custom Test Budget ${Date.now()}`;
      await page.fill('[data-testid="budget-name-input"]', uniqueName);
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Utilities');
      await page.fill('[data-testid="default-amount-input"]', '300');
      await page.selectOption('[data-testid="frequency-select"]', 'custom');
      
      // Select specific custom months (August, October, December)
      await page.check('[data-testid="custom-month-7"]'); // August
      await page.check('[data-testid="custom-month-9"]'); // October
      await page.check('[data-testid="custom-month-11"]'); // December
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
      
      // Wait for the budget to appear in the table
      await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
      
      // Find and click the edit button for the specific budget we just created
      const budgetRow = page.locator('[data-testid="budget-table"]').locator('tr').filter({ hasText: uniqueName });
      await budgetRow.locator('[data-testid="edit-budget-btn"]').first().click();
      await page.waitForSelector('[data-testid="edit-budget-modal"]');
      
      // Verify all form fields are loaded with correct values
      await expect(page.locator('[data-testid="budget-name-input"]')).toHaveValue(uniqueName);
      await expect(page.locator('[data-testid="budget-type-select"]')).toHaveValue('expense');
      await expect(page.locator('[data-testid="budget-category-select"]')).toHaveValue('Utilities');
      await expect(page.locator('[data-testid="default-amount-input"]')).toHaveValue(/EGP\s*300/);
      await expect(page.locator('[data-testid="frequency-select"]')).toHaveValue('custom');
      
      // Verify custom months are checked
      await expect(page.locator('[data-testid="custom-month-7"]')).toBeChecked();
      await expect(page.locator('[data-testid="custom-month-9"]')).toBeChecked();
      await expect(page.locator('[data-testid="custom-month-11"]')).toBeChecked();
      
      // Verify preview shows correct data
      await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('3 active months');
      await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('EGP 900');
      
      await page.click('[data-testid="submit-edit-btn"]');
      await expect(page.locator('[data-testid="edit-budget-modal"]')).not.toBeVisible();
    });

    test('should load edit modal with correct form data for multi-year budget', async ({ page }) => {
      // Create a multi-year budget with specific data
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      const uniqueName = `Multi-Year Test Budget ${Date.now()}`;
      await page.fill('[data-testid="budget-name-input"]', uniqueName);
      await page.selectOption('[data-testid="budget-type-select"]', 'investment');
      await page.selectOption('[data-testid="budget-category-select"]', 'Real Estate Purchase');
      await page.fill('[data-testid="default-amount-input"]', '2000');
      await page.selectOption('[data-testid="payment-schedule-select"]', 'end_of_month');
      await page.selectOption('[data-testid="frequency-select"]', 'repeats');
      await page.selectOption('[data-testid="recurrence-interval-select"]', '6');
      await page.selectOption('[data-testid="start-month-select"]', '0'); // January
      await page.selectOption('[data-testid="start-year-select"]', '2025');
      await page.selectOption('[data-testid="end-month-select"]', '5'); // June
      await page.selectOption('[data-testid="end-year-select"]', '2027');
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
      
      // Wait for the budget to appear in the table
      await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
      
      // Find and click the edit button for the specific budget we just created
      const budgetRow = page.locator('[data-testid="budget-table"]').locator('tr').filter({ hasText: uniqueName });
      await budgetRow.locator('[data-testid="edit-budget-btn"]').first().click();
      await page.waitForSelector('[data-testid="edit-budget-modal"]');
      
      // Verify all form fields are loaded with correct values
      await expect(page.locator('[data-testid="budget-name-input"]')).toHaveValue(uniqueName);
      await expect(page.locator('[data-testid="budget-type-select"]')).toHaveValue('investment');
      await expect(page.locator('[data-testid="budget-category-select"]')).toHaveValue('Real Estate Purchase');
      await expect(page.locator('[data-testid="default-amount-input"]')).toHaveValue(/EGP\s*2,000/);
      await expect(page.locator('[data-testid="payment-schedule-select"]')).toHaveValue('end_of_month');
      await expect(page.locator('[data-testid="frequency-select"]')).toHaveValue('repeats');
      await expect(page.locator('[data-testid="recurrence-interval-select"]')).toHaveValue('6');
      await expect(page.locator('[data-testid="start-month-select"]')).toHaveValue('0');
      await expect(page.locator('[data-testid="start-year-select"]')).toHaveValue('2025');
      await expect(page.locator('[data-testid="end-month-select"]')).toHaveValue('5');
      await expect(page.locator('[data-testid="end-year-select"]')).toHaveValue('2027');
      
      // Verify multi-year indicator is visible
      await expect(page.locator('[data-testid="multi-year-indicator"]')).toBeVisible();
      await expect(page.locator('[data-testid="multi-year-indicator"]')).toContainText('3 years');
      
      // Verify preview shows correct data
      await expect(page.locator('[data-testid="multi-year-preview"]')).toBeVisible();
      await expect(page.locator('[data-testid="multi-year-preview"]')).toContainText('EGP 6,000');
      
      await page.click('[data-testid="submit-edit-btn"]');
      await expect(page.locator('[data-testid="edit-budget-modal"]')).not.toBeVisible();
    });

    test('should preserve form data when switching between frequencies in edit modal', async ({ page }) => {
      // Create a monthly budget
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      await page.fill('[data-testid="budget-name-input"]', 'Frequency Switch Test');
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Essential');
      await page.fill('[data-testid="default-amount-input"]', '500');
      
      await page.click('[data-testid="submit-budget-btn"]');
      await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
      
      // Edit the budget
      await page.click('[data-testid="edit-budget-btn"]');
      await page.waitForSelector('[data-testid="edit-budget-modal"]');
      
      // Verify initial data is loaded
      await expect(page.locator('[data-testid="budget-name-input"]')).toHaveValue('Frequency Switch Test');
      await expect(page.locator('[data-testid="default-amount-input"]')).toHaveValue('500');
      
      // Switch to one-time frequency
      await page.selectOption('[data-testid="frequency-select"]', 'once');
      
      // Verify basic data is preserved
      await expect(page.locator('[data-testid="budget-name-input"]')).toHaveValue('Frequency Switch Test');
      await expect(page.locator('[data-testid="default-amount-input"]')).toHaveValue('500');
      
      // Switch to custom frequency
      await page.selectOption('[data-testid="frequency-select"]', 'custom');
      
      // Verify basic data is still preserved
      await expect(page.locator('[data-testid="budget-name-input"]')).toHaveValue('Frequency Switch Test');
      await expect(page.locator('[data-testid="default-amount-input"]')).toHaveValue('500');
      
      // Switch back to repeats
      await page.selectOption('[data-testid="frequency-select"]', 'repeats');
      
      // Verify basic data is still preserved
      await expect(page.locator('[data-testid="budget-name-input"]')).toHaveValue('Frequency Switch Test');
      await expect(page.locator('[data-testid="default-amount-input"]')).toHaveValue('500');
      
      await page.click('[data-testid="submit-edit-btn"]');
      await expect(page.locator('[data-testid="edit-budget-modal"]')).not.toBeVisible();
    });
  });

  test.describe('Validation and Error Handling', () => {
    test('should show error for invalid date range', async ({ page }) => {
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      await page.fill('[data-testid="budget-name-input"]', 'Invalid Budget');
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Utilities');
      await page.fill('[data-testid="default-amount-input"]', '500');
      
      // Set invalid date range (end year < start year)
      await page.selectOption('[data-testid="start-year-select"]', '2025');
      await page.selectOption('[data-testid="end-year-select"]', '2024');
      
      await page.click('[data-testid="submit-budget-btn"]');
      
      // Verify error message appears
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('End year must be greater than or equal to start year');
    });

    test('should show error for invalid occurrences', async ({ page }) => {
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      await page.fill('[data-testid="budget-name-input"]', 'Invalid Budget');
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Utilities');
      await page.fill('[data-testid="default-amount-input"]', '500');
      
      // Change to occurrence-based ending
      await page.selectOption('[data-testid="end-type-select"]', 'after_occurrences');
      
      // Set invalid occurrences
      await page.fill('[data-testid="occurrences-input"]', '150');
      
      await page.click('[data-testid="submit-budget-btn"]');
      
      // Verify error message appears
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Occurrences must be between 1 and 120');
    });
  });

  test.describe('UI/UX Tests', () => {
    test('should show conditional fields based on frequency', async ({ page }) => {
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      // Default should be repeats - date fields should be visible
      await expect(page.locator('[data-testid="start-date-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="end-date-section"]')).toBeVisible();
      
      // Change to once - date fields should be hidden, one-time fields visible
      await page.selectOption('[data-testid="frequency-select"]', 'once');
      await expect(page.locator('[data-testid="start-date-section"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="end-date-section"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="one-time-date-section"]')).toBeVisible();
      
      // Change to custom - date fields should be hidden, custom months visible
      await page.selectOption('[data-testid="frequency-select"]', 'custom');
      await expect(page.locator('[data-testid="start-date-section"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="end-date-section"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="custom-months-section"]')).toBeVisible();
    });

    test('should show conditional fields based on payment schedule', async ({ page }) => {
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      // Default should be throughout_month - due date should be hidden
      await expect(page.locator('[data-testid="due-date-section"]')).not.toBeVisible();
      
      // Change to custom_dates - due date should be visible
      await page.selectOption('[data-testid="payment-schedule-select"]', 'custom_dates');
      await expect(page.locator('[data-testid="due-date-section"]')).toBeVisible();
    });

    test('should show conditional fields based on budget type', async ({ page }) => {
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      // Default should be expense - investment direction should be hidden
      await expect(page.locator('[data-testid="investment-direction-section"]')).not.toBeVisible();
      
      // Change to investment - investment direction should be visible
      await page.selectOption('[data-testid="budget-type-select"]', 'investment');
      await expect(page.locator('[data-testid="investment-direction-section"]')).toBeVisible();
    });

    test('should update preview when form changes', async ({ page }) => {
      await page.click('[data-testid="add-budget-btn"]');
      await page.waitForSelector('[data-testid="add-budget-modal"]');
      
      // Fill basic info
      await page.fill('[data-testid="budget-name-input"]', 'Preview Test');
      await page.selectOption('[data-testid="budget-type-select"]', 'expense');
      await page.selectOption('[data-testid="budget-category-select"]', 'Utilities');
      await page.fill('[data-testid="default-amount-input"]', '100');
      
      // Verify initial preview
      await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('12 active months');
      
      // Change to quarterly
      await page.selectOption('[data-testid="recurrence-interval-select"]', '3');
      await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('4 active months');
      
      // Change amount
      await page.fill('[data-testid="default-amount-input"]', '200');
      await expect(page.locator('[data-testid="schedule-preview"]')).toContainText('EGP 800');
    });
  });
}); 