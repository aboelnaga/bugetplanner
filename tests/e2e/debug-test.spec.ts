import { test, expect } from '@playwright/test';
import { loginBeforeTest } from './utils/auth-helpers';

test.describe('Debug Edit Modal Data Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginBeforeTest(page);
    await page.waitForSelector('[data-testid="budget-table"]', { timeout: 10000 });
  });

  test('should debug edit modal data loading', async ({ page }) => {
    // Listen for console logs
    page.on('console', msg => {
      console.log('Browser console:', msg.text());
    });
    
    // Create a budget with specific data
    await page.click('[data-testid="add-budget-btn"]');
    await page.waitForSelector('[data-testid="add-budget-modal"]');
    
    const uniqueName = `Debug Test Budget ${Date.now()}`;
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
    
    // Log the form data before submission
    console.log('Form data before submission:');
    console.log('Name:', await page.locator('[data-testid="budget-name-input"]').inputValue());
    console.log('Start Month:', await page.locator('[data-testid="start-month-select"]').inputValue());
    console.log('Start Year:', await page.locator('[data-testid="start-year-select"]').inputValue());
    console.log('End Month:', await page.locator('[data-testid="end-month-select"]').inputValue());
    console.log('End Year:', await page.locator('[data-testid="end-year-select"]').inputValue());
    
    await page.click('[data-testid="submit-budget-btn"]');
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible();
    
    // Wait for the budget to appear in the table
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName);
    
    // Debug: Check if budget was created properly
    const budgetRows = page.locator('[data-testid="budget-table"]').locator('tr')
    const rowCount = await budgetRows.count()
    console.log('Total budget rows:', rowCount)
    
    // Debug: Get all budget names in the table
    const budgetNames = await page.evaluate(() => {
      const rows = document.querySelectorAll('[data-testid="budget-table"] tr')
      const names: string[] = []
      rows.forEach(row => {
        const nameCell = row.querySelector('td:first-child')
        if (nameCell && nameCell.textContent) {
          names.push(nameCell.textContent.trim())
        }
      })
      return names
    })
    console.log('Budget names in table:', budgetNames)
    
    // Find and click the edit button for the specific budget we just created
    const budgetRow = page.locator('[data-testid="budget-table"]').locator('tr').filter({ hasText: uniqueName });
    await budgetRow.locator('[data-testid="edit-budget-btn"]').first().click();
    await page.waitForSelector('[data-testid="edit-budget-modal"]');
    
    // Wait a bit for the form to initialize
    await page.waitForTimeout(1000);
    
    // Log the form data after loading
    console.log('Form data after loading:');
    console.log('Name:', await page.locator('[data-testid="budget-name-input"]').inputValue());
    console.log('Start Month:', await page.locator('[data-testid="start-month-select"]').inputValue());
    console.log('Start Year:', await page.locator('[data-testid="start-year-select"]').inputValue());
    console.log('End Month:', await page.locator('[data-testid="end-month-select"]').inputValue());
    console.log('End Year:', await page.locator('[data-testid="end-year-select"]').inputValue());
    
    // Wait a bit to see the console output
    await page.waitForTimeout(2000);
  });

  test('should debug quarterly interval calculation', async ({ page }) => {
    // Navigate to the budget planner
    await page.goto('/')
    
    // Wait for login if needed
    const loginButton = page.locator('text=Login')
    if (await loginButton.isVisible()) {
      console.log('Not logged in, proceeding with login')
      await loginButton.click()
      await page.waitForURL('**/auth')
      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await page.fill('[data-testid="password-input"]', 'password123')
      await page.click('[data-testid="login-btn"]')
      await page.waitForURL('**/budget-planner')
    }
    
    // Create a test budget
    await page.click('[data-testid="add-budget-btn"]')
    await page.waitForSelector('[data-testid="add-budget-modal"]')
    
    const uniqueName = `Quarterly Debug Budget ${Date.now()}`
    await page.fill('[data-testid="budget-name-input"]', uniqueName)
    await page.selectOption('[data-testid="budget-type-select"]', 'income')
    await page.selectOption('[data-testid="budget-category-select"]', 'Salary')
    await page.fill('[data-testid="default-amount-input"]', '5000')
    await page.selectOption('[data-testid="frequency-select"]', 'repeats')
    await page.selectOption('[data-testid="start-month-select"]', '8')
    await page.selectOption('[data-testid="start-year-select"]', '2025')
    await page.selectOption('[data-testid="end-month-select"]', '11')
    await page.selectOption('[data-testid="end-year-select"]', '2025')
    
    await page.click('[data-testid="submit-budget-btn"]')
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible()
    
    // Wait for the budget to appear in the table
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName)
    
    // Find and click the edit button for the specific budget we just created
    const budgetRow = page.locator('[data-testid="budget-table"]').locator('tr').filter({ hasText: uniqueName })
    await budgetRow.locator('[data-testid="edit-budget-btn"]').first().click()
    await page.waitForSelector('[data-testid="edit-budget-modal"]')
    
    // Check initial schedule preview
    const initialPreview = await page.locator('[data-testid="schedule-preview"]').textContent()
    console.log('Initial schedule preview:', initialPreview)
    
    // Change to quarterly (interval 3)
    await page.selectOption('[data-testid="recurrence-interval-select"]', '3')
    
    // Wait a moment for the preview to update
    await page.waitForTimeout(1000)
    
    // Check updated schedule preview
    const updatedPreview = await page.locator('[data-testid="schedule-preview"]').textContent()
    console.log('Updated schedule preview (quarterly):', updatedPreview)
    
    // Check the active months count
    const activeMonthsText = await page.locator('[data-testid="schedule-preview"]').textContent()
    console.log('Active months text:', activeMonthsText)
    
    // Verify the preview shows the expected number of active months
    expect(activeMonthsText).toContain('2 active months')
  })

  test('should debug form submission issue', async ({ page }) => {
    // Navigate to the budget planner
    await page.goto('/')
    
    // Wait for login if needed
    const loginButton = page.locator('text=Login')
    if (await loginButton.isVisible()) {
      console.log('Not logged in, proceeding with login')
      await loginButton.click()
      await page.waitForURL('**/auth')
      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await page.fill('[data-testid="password-input"]', 'password123')
      await page.click('[data-testid="login-btn"]')
      await page.waitForURL('**/budget-planner')
    }
    
    // Create a test budget
    await page.click('[data-testid="add-budget-btn"]')
    await page.waitForSelector('[data-testid="add-budget-modal"]')
    
    const uniqueName = `Submit Debug Budget ${Date.now()}`
    await page.fill('[data-testid="budget-name-input"]', uniqueName)
    await page.selectOption('[data-testid="budget-type-select"]', 'income')
    await page.selectOption('[data-testid="budget-category-select"]', 'Salary')
    await page.fill('[data-testid="default-amount-input"]', '5000')
    await page.selectOption('[data-testid="frequency-select"]', 'repeats')
    await page.selectOption('[data-testid="start-month-select"]', '8')
    await page.selectOption('[data-testid="start-year-select"]', '2025')
    await page.selectOption('[data-testid="end-month-select"]', '11')
    await page.selectOption('[data-testid="end-year-select"]', '2025')
    
    await page.click('[data-testid="submit-budget-btn"]')
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible()
    
    // Wait for the budget to appear in the table
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName)
    
    // Find and click the edit button for the specific budget we just created
    const budgetRow = page.locator('[data-testid="budget-table"]').locator('tr').filter({ hasText: uniqueName })
    await budgetRow.locator('[data-testid="edit-budget-btn"]').first().click()
    await page.waitForSelector('[data-testid="edit-budget-modal"]')
    
    // Change to quarterly (interval 3)
    await page.selectOption('[data-testid="recurrence-interval-select"]', '3')
    
    // Wait a moment for the preview to update
    await page.waitForTimeout(1000)
    
    // Check if submit button is enabled
    const submitButton = page.locator('[data-testid="submit-edit-btn"]')
    const isEnabled = await submitButton.isEnabled()
    console.log('Submit button enabled:', isEnabled)
    
    // Check for any validation errors
    const errorMessages = await page.locator('.text-red-500, .text-red-600').allTextContents()
    console.log('Error messages:', errorMessages)
    
    // Check if the form has a submit handler
    const formHasSubmitHandler = await page.evaluate(() => {
      const form = document.querySelector('[data-testid="edit-budget-modal"] form') as HTMLFormElement
      if (!form) return false
      return form.onsubmit !== null || form.getAttribute('data-has-submit') !== null
    })
    console.log('Form has submit handler:', formHasSubmitHandler)
    
    // Check the form structure
    const formStructure = await page.evaluate(() => {
      const form = document.querySelector('[data-testid="edit-budget-modal"] form') as HTMLFormElement
      if (!form) return null
      
      return {
        action: form.action,
        method: form.method,
        onsubmit: form.onsubmit !== null,
        hasSubmitButton: form.querySelector('button[type="submit"]') !== null,
        submitButtonText: form.querySelector('button[type="submit"]')?.textContent?.trim()
      }
    })
    console.log('Form structure:', formStructure)
    
    // Try to submit the form directly instead of clicking the button
    await page.evaluate(() => {
      const form = document.querySelector('[data-testid="edit-budget-modal"] form') as HTMLFormElement
      if (form) {
        console.log('Submitting form directly')
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      }
    })
    
    // Wait a moment and check if modal is still visible
    await page.waitForTimeout(2000)
    let modalVisible = await page.locator('[data-testid="edit-budget-modal"]').isVisible()
    console.log('Modal still visible after form submit:', modalVisible)
    
    // Try clicking the submit button directly
    await submitButton.click()
    
    // Wait a moment and check if modal is still visible
    await page.waitForTimeout(2000)
    modalVisible = await page.locator('[data-testid="edit-budget-modal"]').isVisible()
    console.log('Modal still visible after button click:', modalVisible)
    
    // Check for any alerts or error messages
    const alerts = await page.locator('.alert, .error, [role="alert"]').allTextContents()
    console.log('Alerts:', alerts)
    
    // Check if there are any validation errors in the form
    const validationErrors = await page.locator('.text-red-500, .text-red-600, .error-message').allTextContents()
    console.log('Validation errors:', validationErrors)
    
    // Check the form data to see if it's valid
    const formData = await page.evaluate(() => {
      const form = document.querySelector('[data-testid="edit-budget-modal"] form') as HTMLFormElement
      if (!form) return null
      
      const formData = new FormData(form)
      const data = {}
      for (let [key, value] of formData.entries()) {
        data[key] = value
      }
      return data
    })
    console.log('Form data:', formData)
    
    // Check current year and month from the page
    const currentYearMonth = await page.evaluate(() => {
      // Try to get current year and month from the page
      const yearElements = document.querySelectorAll('[data-testid*="year"]')
      const monthElements = document.querySelectorAll('[data-testid*="month"]')
      
      return {
        yearElements: Array.from(yearElements).map(el => ({ id: el.id, value: (el as HTMLSelectElement).value })),
        monthElements: Array.from(monthElements).map(el => ({ id: el.id, value: (el as HTMLSelectElement).value }))
      }
    })
    console.log('Current year/month elements:', currentYearMonth)
  })

  test('should debug Vue event handlers', async ({ page }) => {
    // Navigate to the budget planner
    await page.goto('/')
    
    // Wait for login if needed
    const loginButton = page.locator('text=Login')
    if (await loginButton.isVisible()) {
      console.log('Not logged in, proceeding with login')
      await loginButton.click()
      await page.waitForURL('**/auth')
      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await page.fill('[data-testid="password-input"]', 'password123')
      await page.click('[data-testid="login-btn"]')
      await page.waitForURL('**/budget-planner')
    }
    
    // Create a test budget
    await page.click('[data-testid="add-budget-btn"]')
    await page.waitForSelector('[data-testid="add-budget-modal"]')
    
    const uniqueName = `Vue Debug Budget ${Date.now()}`
    await page.fill('[data-testid="budget-name-input"]', uniqueName)
    await page.selectOption('[data-testid="budget-type-select"]', 'income')
    await page.selectOption('[data-testid="budget-category-select"]', 'Salary')
    await page.fill('[data-testid="default-amount-input"]', '5000')
    await page.selectOption('[data-testid="frequency-select"]', 'repeats')
    await page.selectOption('[data-testid="start-month-select"]', '8')
    await page.selectOption('[data-testid="start-year-select"]', '2025')
    await page.selectOption('[data-testid="end-month-select"]', '11')
    await page.selectOption('[data-testid="end-year-select"]', '2025')
    
    await page.click('[data-testid="submit-budget-btn"]')
    await expect(page.locator('[data-testid="add-budget-modal"]')).not.toBeVisible()
    
    // Wait for the budget to appear in the table
    await expect(page.locator('[data-testid="budget-table"]')).toContainText(uniqueName)
    
    // Debug: Check if budget was created properly
    const budgetRows = page.locator('[data-testid="budget-table"]').locator('tr')
    const rowCount = await budgetRows.count()
    console.log('Total budget rows:', rowCount)
    
    // Debug: Get all budget names in the table
    const budgetNames = await page.evaluate(() => {
      const rows = document.querySelectorAll('[data-testid="budget-table"] tr')
      const names = []
      rows.forEach(row => {
        const nameCell = row.querySelector('td:first-child')
        if (nameCell) {
          names.push(nameCell.textContent?.trim())
        }
      })
      return names
    })
    console.log('Budget names in table:', budgetNames)
    
    // Find and click the edit button for the specific budget we just created
    const budgetRow = page.locator('[data-testid="budget-table"]').locator('tr').filter({ hasText: uniqueName })
    await budgetRow.locator('[data-testid="edit-budget-btn"]').first().click()
    await page.waitForSelector('[data-testid="edit-budget-modal"]')
    
    // Try clicking the cancel button to see if Vue events work at all
    const cancelButton = page.locator('[data-testid="edit-budget-modal"]').locator('button').filter({ hasText: 'Cancel' }).first()
    await cancelButton.click()
    
    // Check if modal closed
    const modalVisible = await page.locator('[data-testid="edit-budget-modal"]').isVisible()
    console.log('Modal visible after cancel click:', modalVisible)
    
    // If cancel worked, try the edit button again
    if (!modalVisible) {
      await budgetRow.locator('[data-testid="edit-budget-btn"]').first().click()
      await page.waitForSelector('[data-testid="edit-budget-modal"]')
    }
    
    // Now try the submit button
    const submitButton = page.locator('[data-testid="submit-edit-btn"]')
    
    // Check if button is enabled and visible
    const isEnabled = await submitButton.isEnabled()
    const isVisible = await submitButton.isVisible()
    console.log('Submit button enabled:', isEnabled)
    console.log('Submit button visible:', isVisible)
    
    // Check button properties
    const buttonProps = await submitButton.evaluate((el) => ({
      type: (el as HTMLButtonElement).type,
      disabled: (el as HTMLButtonElement).disabled,
      className: el.className,
      textContent: el.textContent?.trim()
    }))
    console.log('Submit button properties:', buttonProps)
    
    await submitButton.click()
    
    // Wait and check if modal closed
    await page.waitForTimeout(2000)
    const modalStillVisible = await page.locator('[data-testid="edit-budget-modal"]').isVisible()
    console.log('Modal visible after submit click:', modalStillVisible)
    
    // Check for any alerts or error messages
    const alerts = await page.locator('.alert, .error, [role="alert"]').allTextContents()
    console.log('Alerts:', alerts)
    
    // Check if there are any validation errors in the form
    const validationErrors = await page.locator('.text-red-500, .text-red-600, .error-message').allTextContents()
    console.log('Validation errors:', validationErrors)
    
    // Check the form data to see if it's valid
    const formData = await page.evaluate(() => {
      const form = document.querySelector('[data-testid="edit-budget-modal"] form') as HTMLFormElement
      if (!form) return null
      
      const formData = new FormData(form)
      const data = {}
      for (let [key, value] of formData.entries()) {
        data[key] = value
      }
      return data
    })
    console.log('Form data:', formData)

      // Click submit button
      await page.click('[data-testid="submit-edit-btn"]');
      
      // Wait a bit for any processing
      await page.waitForTimeout(1000);
      
      // Check modal visibility after submit
      const modalVisibleAfterSubmit = await page.locator('[data-testid="edit-budget-modal"]').isVisible();
      console.log('Modal visible after submit click:', modalVisibleAfterSubmit);
      
      // Get console logs
      const consoleMessages = await page.evaluate(() => {
        return (window as any).consoleMessages || [];
      });
      console.log('Console messages:', consoleMessages);
      
      // Get alerts
      const alertsAfterSubmit = await page.evaluate(() => {
        return (window as any).alerts || [];
      });
      console.log('Alerts after submit:', alertsAfterSubmit);
      
      // Get validation errors
      const validationErrorsAfterSubmit = await page.evaluate(() => {
        const errorElements = document.querySelectorAll('.text-red-500, .text-red-600, [class*="error"], [class*="Error"]');
        return Array.from(errorElements).map(el => el.textContent?.trim()).filter(Boolean);
      });
      console.log('Validation errors after submit:', validationErrorsAfterSubmit);
      
      // Get form data
      const formDataAfterSubmit = await page.evaluate(() => {
        const form = document.querySelector('form');
        if (!form) return null;
        
        const formData = new FormData(form);
        const data = {};
        for (const [key, value] of formData.entries()) {
          data[key] = value;
        }
        return data;
      });
      console.log('Form data after submit:', formDataAfterSubmit);
      
      // Get budget object
      const budgetObject = await page.evaluate(() => {
        // Try to get the budget object from Vue devtools or component state
        const vueApp = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__?.apps?.[0];
        if (vueApp) {
          const components = vueApp.$options?.components || {};
          const editModal = Object.values(components).find((comp: any) => 
            comp?.name === 'EditBudgetModal' || comp?.__file?.includes('EditBudgetModal')
          ) as any;
          if (editModal) {
            return editModal.props?.budget || editModal.data?.budget;
          }
        }
        return null;
      });
      console.log('Budget object:', budgetObject);
      
      // Check console logs for form submission
      const consoleLogs = await page.evaluate(() => {
        return (window as any).consoleLogs || [];
      });
      console.log('Console logs:', consoleLogs);
      
      // Check if any logs contain our debug messages
      const hasFormSubmissionLog = consoleLogs.some((log: string) => 
        log.includes('FORM SUBMISSION TRIGGERED') || 
        log.includes('EditBudgetModal handleFormSubmit called')
      );
      console.log('Has form submission log:', hasFormSubmissionLog);
      
      // Check if any logs contain editBudget logs
      const hasEditBudgetLog = consoleLogs.some((log: string) => 
        log.includes('editBudget called with budget')
      );
      console.log('Has editBudget log:', hasEditBudgetLog);
      
      // Check Vue component state directly
      const vueState = await page.evaluate(() => {
        // Try to access Vue component state
        const vueApp = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__?.apps?.[0];
        if (vueApp) {
          // Get all components
          const components = vueApp.$options?.components || {};
          console.log('Vue components found:', Object.keys(components));
          
          // Try to find EditBudgetModal component
          const editModal = Object.values(components).find((comp: any) => 
            comp?.name === 'EditBudgetModal' || comp?.__file?.includes('EditBudgetModal')
          ) as any;
          
          if (editModal) {
            console.log('EditBudgetModal component found');
            return {
              props: editModal.props,
              data: editModal.data,
              budget: editModal.props?.budget || editModal.data?.budget
            };
          }
        }
        return null;
      });
      console.log('Vue state:', vueState);
  })

  test('should debug budget items data loading', async ({ page }) => {
  await page.goto('http://localhost:3000')
  
  // Wait for login and page load
  await page.waitForSelector('[data-testid="budget-table"]', { timeout: 15000 })
  
  // Wait for loading to finish
  await page.waitForFunction(() => {
    const loadingElement = document.querySelector('[data-testid="budget-table"]')
    return loadingElement && !loadingElement.classList.contains('loading')
  }, { timeout: 10000 })
  
  // Wait a bit more for data to load
  await page.waitForTimeout(2000)
  
  // Debug: Check what budget items are loaded
  const budgetItems = await page.evaluate(() => {
    // Try to access the budget store or component data
    const budgetRows = document.querySelectorAll('[data-testid="budget-table"] tr')
    const items: any[] = []
    
    budgetRows.forEach((row, index) => {
      if (index === 0) return // Skip header row
      
      const cells = row.querySelectorAll('td')
      if (cells.length > 0) {
        const name = cells[0]?.textContent?.trim()
        const category = cells[1]?.textContent?.trim()
        const amount = cells[2]?.textContent?.trim()
        const schedule = cells[3]?.textContent?.trim()
        
        items.push({
          name,
          category,
          amount,
          schedule,
          rowIndex: index
        })
      }
    })
    
    return items
  })
  
  console.log('Loaded budget items:', budgetItems)
  
  // Debug: Check if there are any budget items to edit
  if (budgetItems.length === 0) {
    console.log('No budget items found to edit')
    return
  }
  
  // Try to click the edit button on the first budget item
  const firstEditButton = page.locator('[data-testid="budget-table"] tr').nth(1).locator('[data-testid="edit-budget-btn"]')
  
  // Debug: Check if edit button exists
  const editButtonExists = await firstEditButton.count()
  console.log('Edit buttons found:', editButtonExists)
  
  if (editButtonExists === 0) {
    console.log('No edit buttons found')
    return
  }
  
  // Click edit button
  await firstEditButton.click()
  
  // Wait for modal to open
  await page.waitForSelector('[data-testid="edit-budget-modal"]', { timeout: 5000 })
  
  // Debug: Check what data is loaded in the modal
  const modalData = await page.evaluate(() => {
    const modal = document.querySelector('[data-testid="edit-budget-modal"]')
    if (!modal) return null
    
    // Get form data
    const nameInput = modal.querySelector('[data-testid="budget-name-input"]') as HTMLInputElement
    const typeSelect = modal.querySelector('[data-testid="budget-type-select"]') as HTMLSelectElement
    const categorySelect = modal.querySelector('[data-testid="budget-category-select"]') as HTMLSelectElement
    const amountInput = modal.querySelector('[data-testid="budget-amount-input"]') as HTMLInputElement
    const startMonthSelect = modal.querySelector('[data-testid="start-month-select"]') as HTMLSelectElement
    const yearInput = modal.querySelector('[data-testid="year-input"]') as HTMLInputElement
    
    return {
      name: nameInput?.value,
      type: typeSelect?.value,
      category: categorySelect?.value,
      amount: amountInput?.value,
      startMonth: startMonthSelect?.value,
      year: yearInput?.value
    }
  })
  
  console.log('Modal loaded data:', modalData)
  
  // Debug: Check the schedule preview
  const schedulePreview = await page.locator('[data-testid="schedule-preview"]').textContent()
  console.log('Schedule preview:', schedulePreview)
  
  // Debug: Check current month vs loaded month
  const currentMonth = await page.evaluate(() => {
    const now = new Date()
    return now.getMonth() + 1 // JavaScript months are 0-indexed
  })
  
  console.log('Current month:', currentMonth)
  console.log('Loaded start month:', modalData?.startMonth)
  
  // Check if loaded month is less than current month
  if (modalData?.startMonth && parseInt(modalData.startMonth) < currentMonth) {
    console.log('⚠️ ISSUE: Loaded start month is less than current month!')
    console.log(`Current month: ${currentMonth}, Loaded month: ${modalData.startMonth}`)
  }
  
  // Close modal
  await page.click('button:has-text("Cancel")')
})

test('should debug budget object structure', async ({ page }) => {
  await page.goto('http://localhost:3000')
  
  // Wait for login and page load
  await page.waitForSelector('[data-testid="budget-table"]', { timeout: 15000 })
  
  // Wait for loading to finish
  await page.waitForFunction(() => {
    const loadingElement = document.querySelector('[data-testid="budget-table"]')
    return loadingElement && !loadingElement.classList.contains('loading')
  }, { timeout: 10000 })
  
  // Wait a bit more for data to load
  await page.waitForTimeout(2000)
  
  // Try to click the edit button on the first budget item
  const firstEditButton = page.locator('[data-testid="budget-table"] tr').nth(1).locator('[data-testid="edit-budget-btn"]')
  
  // Debug: Check if edit button exists
  const editButtonExists = await firstEditButton.count()
  console.log('Edit buttons found:', editButtonExists)
  
  if (editButtonExists === 0) {
    console.log('No edit buttons found')
    return
  }
  
  // Click edit button
  await firstEditButton.click()
  
  // Wait for modal to open
  await page.waitForSelector('[data-testid="edit-budget-modal"]', { timeout: 5000 })
  
  // Debug: Get the budget object that was passed to the modal
  const budgetObject = await page.evaluate(() => {
    // Try to access the budget object from Vue component
    const modal = document.querySelector('[data-testid="edit-budget-modal"]')
    if (!modal) return null
    
    // Try to get the budget prop from the Vue component
    const vueApp = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__?.apps?.[0]
    if (vueApp) {
      // Look for the EditBudgetModal component
      const components = vueApp.$options?.components || {}
      const editModal = Object.values(components).find((comp: any) => 
        comp?.name === 'EditBudgetModal' || comp?.__file?.includes('EditBudgetModal')
      ) as any
      
      if (editModal) {
        return editModal.props?.budget || editModal.data?.budget
      }
    }
    
    return null
  })
  
  console.log('Budget object passed to modal:', budgetObject)
  
  // Debug: Check what properties the budget object has
  if (budgetObject) {
    console.log('Budget object properties:')
    console.log('- id:', budgetObject.id)
    console.log('- name:', budgetObject.name)
    console.log('- start_month:', budgetObject.start_month)
    console.log('- startMonth:', budgetObject.startMonth)
    console.log('- end_month:', budgetObject.end_month)
    console.log('- endMonth:', budgetObject.endMonth)
    console.log('- year:', budgetObject.year)
    console.log('- frequency:', budgetObject.frequency)
    console.log('- recurrence:', budgetObject.recurrence)
    console.log('- recurrence_interval:', budgetObject.recurrence_interval)
    console.log('- recurrenceInterval:', budgetObject.recurrenceInterval)
  }
  
  // Close modal
  await page.click('button:has-text("Cancel")')
})

test('should debug budget object from table row', async ({ page }) => {
  await page.goto('http://localhost:3000')
  
  // Wait for login and page load
  await page.waitForSelector('[data-testid="budget-table"]', { timeout: 15000 })
  
  // Wait for loading to finish
  await page.waitForFunction(() => {
    const loadingElement = document.querySelector('[data-testid="budget-table"]')
    return loadingElement && !loadingElement.classList.contains('loading')
  }, { timeout: 10000 })
  
  // Wait a bit more for data to load
  await page.waitForTimeout(2000)
  
  // Try to click the edit button on the first budget item
  const firstEditButton = page.locator('[data-testid="budget-table"] tr').nth(1).locator('[data-testid="edit-budget-btn"]')
  
  // Debug: Check if edit button exists
  const editButtonExists = await firstEditButton.count()
  console.log('Edit buttons found:', editButtonExists)
  
  if (editButtonExists === 0) {
    console.log('No edit buttons found')
    return
  }
  
  // Capture the budget object before clicking
  const budgetObject = await page.evaluate(() => {
    // Get the first budget row
    const firstRow = document.querySelector('[data-testid="budget-table"] tr:nth-child(2)')
    if (!firstRow) return null
    
    // Try to get the budget object from the Vue component
    const vueApp = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__?.apps?.[0]
    if (vueApp) {
      // Look for BudgetTableRow components
      const components = vueApp.$options?.components || {}
      const budgetTableRow = Object.values(components).find((comp: any) => 
        comp?.name === 'BudgetTableRow' || comp?.__file?.includes('BudgetTableRow')
      ) as any
      
      if (budgetTableRow) {
        return budgetTableRow.props?.budget || budgetTableRow.data?.budget
      }
    }
    
    return null
  })
  
  console.log('Budget object from table row:', budgetObject)
  
  // Click edit button
  await firstEditButton.click()
  
  // Wait for modal to open
  await page.waitForSelector('[data-testid="edit-budget-modal"]', { timeout: 5000 })
  
  // Debug: Get the budget object that was passed to the modal
  const modalBudgetObject = await page.evaluate(() => {
    // Try to access the budget object from Vue component
    const modal = document.querySelector('[data-testid="edit-budget-modal"]')
    if (!modal) return null
    
    // Try to get the budget prop from the Vue component
    const vueApp = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__?.apps?.[0]
    if (vueApp) {
      // Look for the EditBudgetModal component
      const components = vueApp.$options?.components || {}
      const editModal = Object.values(components).find((comp: any) => 
        comp?.name === 'EditBudgetModal' || comp?.__file?.includes('EditBudgetModal')
      ) as any
      
      if (editModal) {
        return editModal.props?.budget || editModal.data?.budget
      }
    }
    
    return null
  })
  
  console.log('Budget object passed to modal:', modalBudgetObject)
  
  // Close modal
  await page.click('button:has-text("Cancel")')
})

test('should debug budget items in store', async ({ page }) => {
  await page.goto('http://localhost:3000')
  
  // Wait for login and page load
  await page.waitForSelector('[data-testid="budget-table"]', { timeout: 15000 })
  
  // Wait for loading to finish
  await page.waitForFunction(() => {
    const loadingElement = document.querySelector('[data-testid="budget-table"]')
    return loadingElement && !loadingElement.classList.contains('loading')
  }, { timeout: 10000 })
  
  // Wait a bit more for data to load
  await page.waitForTimeout(2000)
  
  // Debug: Check what budget items are in the store
  const budgetItems = await page.evaluate(() => {
    // Try to access the budget store
    const vueApp = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__?.apps?.[0]
    if (vueApp) {
      // Look for the budget store
      const stores = vueApp.$options?.stores || {}
      const budgetStore = stores.budget || stores.budgetStore
      
      if (budgetStore) {
        return {
          budgetItems: budgetStore.budgetItems,
          loading: budgetStore.loading,
          error: budgetStore.error
        }
      }
    }
    
    return null
  })
  
  console.log('Budget store data:', budgetItems)
  
  // Debug: Check if there are any budget items
  if (budgetItems && budgetItems.budgetItems) {
    console.log('Number of budget items:', budgetItems.budgetItems.length)
    if (budgetItems.budgetItems.length > 0) {
      console.log('First budget item:', budgetItems.budgetItems[0])
    }
  }
  
  // Try to click the edit button on the first budget item
  const firstEditButton = page.locator('[data-testid="budget-table"] tr').nth(1).locator('[data-testid="edit-budget-btn"]')
  
  // Debug: Check if edit button exists
  const editButtonExists = await firstEditButton.count()
  console.log('Edit buttons found:', editButtonExists)
  
  if (editButtonExists === 0) {
    console.log('No edit buttons found')
    return
  }
  
  // Click edit button
  await firstEditButton.click()
  
  // Wait for modal to open
  await page.waitForSelector('[data-testid="edit-budget-modal"]', { timeout: 5000 })
  
  // Debug: Get the budget object that was passed to the modal
  const modalBudgetObject = await page.evaluate(() => {
    // Try to access the budget object from Vue component
    const modal = document.querySelector('[data-testid="edit-budget-modal"]')
    if (!modal) return null
    
    // Try to get the budget prop from the Vue component
    const vueApp = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__?.apps?.[0]
    if (vueApp) {
      // Look for the EditBudgetModal component
      const components = vueApp.$options?.components || {}
      const editModal = Object.values(components).find((comp: any) => 
        comp?.name === 'EditBudgetModal' || comp?.__file?.includes('EditBudgetModal')
      ) as any
      
      if (editModal) {
        return editModal.props?.budget || editModal.data?.budget
      }
    }
    
    return null
  })
  
  console.log('Budget object passed to modal:', modalBudgetObject)
  
  // Close modal
  await page.click('button:has-text("Cancel")')
})

test('should debug budget table DOM content', async ({ page }) => {
  await page.goto('http://localhost:3000')
  
  // Wait for login and page load
  await page.waitForSelector('[data-testid="budget-table"]', { timeout: 15000 })
  
  // Wait for loading to finish
  await page.waitForFunction(() => {
    const loadingElement = document.querySelector('[data-testid="budget-table"]')
    return loadingElement && !loadingElement.classList.contains('loading')
  }, { timeout: 10000 })
  
  // Wait a bit more for data to load
  await page.waitForTimeout(2000)
  
  // Debug: Check the actual DOM content of the budget table
  const tableContent = await page.evaluate(() => {
    const table = document.querySelector('[data-testid="budget-table"]')
    if (!table) return null
    
    const rows = table.querySelectorAll('tr')
    const rowData: any[] = []
    
    rows.forEach((row, index) => {
      const cells = row.querySelectorAll('td, th')
      const cellTexts: string[] = []
      
      cells.forEach(cell => {
        cellTexts.push(cell.textContent?.trim() || '')
      })
      
      rowData.push({
        rowIndex: index,
        cellTexts,
        hasEditButton: row.querySelector('[data-testid="edit-budget-btn"]') !== null
      })
    })
    
    return rowData
  })
  
  console.log('Budget table DOM content:', tableContent)
  
  // Debug: Check if there are any budget items in the table
  if (tableContent && tableContent.length > 1) {
    console.log('Number of rows in table:', tableContent.length)
    console.log('First data row:', tableContent[1])
    console.log('Second data row:', tableContent[2])
  }
  
  // Try to click the edit button on the first budget item
  const firstEditButton = page.locator('[data-testid="budget-table"] tr').nth(1).locator('[data-testid="edit-budget-btn"]')
  
  // Debug: Check if edit button exists
  const editButtonExists = await firstEditButton.count()
  console.log('Edit buttons found:', editButtonExists)
  
  if (editButtonExists === 0) {
    console.log('No edit buttons found')
    return
  }
  
  // Click edit button
  await firstEditButton.click()
  
  // Wait for modal to open
  await page.waitForSelector('[data-testid="edit-budget-modal"]', { timeout: 5000 })
  
  // Debug: Get the budget object that was passed to the modal
  const modalBudgetObject = await page.evaluate(() => {
    // Try to access the budget object from Vue component
    const modal = document.querySelector('[data-testid="edit-budget-modal"]')
    if (!modal) return null
    
    // Try to get the budget prop from the Vue component
    const vueApp = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__?.apps?.[0]
    if (vueApp) {
      // Look for the EditBudgetModal component
      const components = vueApp.$options?.components || {}
      const editModal = Object.values(components).find((comp: any) => 
        comp?.name === 'EditBudgetModal' || comp?.__file?.includes('EditBudgetModal')
      ) as any
      
      if (editModal) {
        return editModal.props?.budget || editModal.data?.budget
      }
    }
    
    return null
  })
  
  console.log('Budget object passed to modal:', modalBudgetObject)
  
  // Close modal
  await page.click('button:has-text("Cancel")')
})
}); 