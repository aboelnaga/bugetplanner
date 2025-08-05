import { Page, expect } from '@playwright/test';

export class AuthHelpers {
  constructor(private page: Page) {}

  async login(email: string = 'aboalnga1+1@gmail.com', password: string = '12345678') {
    // Navigate to the auth page
    await this.page.goto('/auth');
    
    // Wait for the auth page to load
    await this.page.waitForLoadState('networkidle');
    
    // Fill in the login form
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    
    // Click the login button
    await this.page.click('[data-testid="login-btn"]');
    
    // Wait for successful login (redirect to main page)
    await this.page.waitForURL('**/', { timeout: 10000 });
    
    // Wait for the page to load completely
    await this.page.waitForLoadState('networkidle');
    
    // Wait a bit more for the page to fully render
    await this.page.waitForTimeout(1000);
    
    // Verify we're logged in by checking for user-specific elements
    await expect(this.page.locator('h1').nth(1)).toContainText('Budget Planner');
  }

  async ensureLoggedIn() {
    // Check if we're already on the budget planner page
    const currentUrl = this.page.url();
    if (currentUrl.includes('/') && !currentUrl.includes('/auth')) {
      // We're already logged in and on the right page
      return;
    }
    
    // Try to navigate to budget planner
    await this.page.goto('/');
    
    // If we get redirected to auth, we need to login
    if (this.page.url().includes('/auth')) {
      await this.login();
    }
  }

  async loginAndSaveState() {
    // Navigate to main page first to check if already logged in
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
    
    // Check if we're already logged in by looking for the budget planner heading
    try {
      await expect(this.page.locator('h1').nth(1)).toContainText('Budget Planner');
      console.log('Already logged in, skipping login process');
      return; // Already logged in
    } catch (error) {
      console.log('Not logged in, proceeding with login');
      // Navigate to auth page and login
      await this.login();
    }
  }

  async setupAuthForTests() {
    // This is the main function to call before each test
    await this.loginAndSaveState();
  }
}

export async function loginBeforeTest(page: Page) {
  const auth = new AuthHelpers(page);
  await auth.setupAuthForTests();
}

export async function quickLogin(page: Page) {
  const auth = new AuthHelpers(page);
  await auth.login();
} 