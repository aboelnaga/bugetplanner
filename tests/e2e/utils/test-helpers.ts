import { Page, expect } from '@playwright/test';
import { loginBeforeTest } from './auth-helpers';

export class BudgetTestHelpers {
  constructor(private page: Page) {}

  async navigateToBudgetPlanner() {
    // Use the improved login utility
    await loginBeforeTest(this.page);
    
    // Navigate to budget planner
    await this.page.goto('/');
    await this.page.waitForSelector('[data-testid="budget-table"]', { timeout: 10000 });
  }

  async openAddBudgetModal() {
    await this.page.click('[data-testid="add-budget-btn"]');
    await this.page.waitForSelector('[data-testid="add-budget-modal"]');
  }

  async openEditBudgetModal() {
    await this.page.click('[data-testid="edit-budget-btn"]');
    await this.page.waitForSelector('[data-testid="edit-budget-modal"]');
  }

  async fillBasicBudgetInfo(name: string, type: string, category: string, amount: string) {
    await this.page.fill('[data-testid="budget-name-input"]', name);
    await this.page.selectOption('[data-testid="budget-type-select"]', type);
    await this.page.selectOption('[data-testid="budget-category-select"]', category);
    await this.page.fill('[data-testid="default-amount-input"]', amount);
  }

  async setFrequency(frequency: string, interval?: string) {
    await this.page.selectOption('[data-testid="frequency-select"]', frequency);
    
    if (interval && frequency === 'repeats') {
      await this.page.selectOption('[data-testid="recurrence-interval-select"]', interval);
    }
  }

  async setDateRange(startYear: string, endYear: string, startMonth?: string, endMonth?: string) {
    await this.page.selectOption('[data-testid="start-year-select"]', startYear);
    await this.page.selectOption('[data-testid="end-year-select"]', endYear);
    
    if (startMonth) {
      await this.page.selectOption('[data-testid="start-month-select"]', startMonth);
    }
    
    if (endMonth) {
      await this.page.selectOption('[data-testid="end-month-select"]', endMonth);
    }
  }

  async setOneTimeDate(month: string, year: string) {
    await this.page.selectOption('[data-testid="one-time-month-select"]', month);
    await this.page.selectOption('[data-testid="one-time-year-select"]', year);
  }

  async setCustomMonths(months: number[]) {
    for (const month of months) {
      await this.page.check(`[data-testid="custom-month-${month}"]`);
    }
  }

  async setOccurrenceEnding(occurrences: string) {
    await this.page.selectOption('[data-testid="end-type-select"]', 'after_occurrences');
    await this.page.fill('[data-testid="occurrences-input"]', occurrences);
  }

  async submitBudgetForm() {
    await this.page.click('[data-testid="submit-budget-btn"]');
    await expect(this.page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
  }

  async submitEditForm() {
    await this.page.click('[data-testid="submit-edit-btn"]');
    await expect(this.page.locator('[data-testid="edit-budget-modal"]')).not.toBeVisible();
  }

  async verifyBudgetInTable(name: string) {
    await expect(this.page.locator('[data-testid="budget-table"]')).toContainText(name);
  }

  async verifyMultiYearIndicator() {
    await expect(this.page.locator('[data-testid="multi-year-indicator"]')).toBeVisible();
  }

  async verifyPreviewShowsActiveMonths(count: string) {
    await expect(this.page.locator('[data-testid="schedule-preview"]')).toContainText(`${count} active months`);
  }

  async verifyErrorVisible(errorType: string) {
    await expect(this.page.locator(`[data-testid="${errorType}-error"]`)).toBeVisible();
  }

  async createMonthlyBudget(name: string, amount: string) {
    await this.openAddBudgetModal();
    await this.fillBasicBudgetInfo(name, 'expense', 'Utilities', amount);
    await this.setFrequency('repeats', '1');
    await this.submitBudgetForm();
    await this.verifyBudgetInTable(name);
  }

  async createQuarterlyBudget(name: string, amount: string) {
    await this.openAddBudgetModal();
    await this.fillBasicBudgetInfo(name, 'expense', 'Utilities', amount);
    await this.setFrequency('repeats', '3');
    await this.submitBudgetForm();
    await this.verifyBudgetInTable(name);
  }

  async createMultiYearBudget(name: string, amount: string, startYear: string, endYear: string) {
    await this.openAddBudgetModal();
    await this.fillBasicBudgetInfo(name, 'expense', 'Utilities', amount);
    await this.setDateRange(startYear, endYear);
    await this.verifyMultiYearIndicator();
    await this.submitBudgetForm();
    await this.verifyBudgetInTable(name);
  }
}

export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
}

export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/${name}.png` });
} 