# E2E Test Cleanup Guide

## Overview

This guide explains how to use the cleanup functionality in the E2E tests to automatically delete budget items created during tests.

## Two Cleanup Approaches

### 1. UI-Based Cleanup (Legacy)
Uses browser interactions to delete items through the UI. Located in `tests/e2e/utils/cleanup-helpers.ts`

### 2. API-Based Cleanup (Recommended)
Uses direct Supabase API calls for faster, more reliable cleanup. Located in `tests/e2e/utils/api-cleanup-helpers.ts`

**✅ Recommended: Use API-based cleanup for better performance and reliability**

## API-Based Cleanup Utilities (Recommended)

### Location
API-based cleanup utilities are located in `tests/e2e/utils/api-cleanup-helpers.ts`

### Available Functions

#### 1. `deleteAllBudgetItemsAPI(page: Page)`
Deletes all budget items for the current user using direct API calls.

**Usage:**
```typescript
import { deleteAllBudgetItemsAPI } from './utils/api-cleanup-helpers';

// Delete all budget items using API
await deleteAllBudgetItemsAPI(page);
```

#### 2. `deleteBudgetItemByIdAPI(page: Page, budgetItemId: string)`
Deletes a specific budget item by ID using direct API calls.

**Usage:**
```typescript
import { deleteBudgetItemByIdAPI } from './utils/api-cleanup-helpers';

// Delete a specific budget item by ID
await deleteBudgetItemByIdAPI(page, 'budget-item-id');
```

#### 3. `cleanupBeforeTestAPI(page: Page)`
Cleans up all budget items before running a test using direct API calls.

**Usage:**
```typescript
import { cleanupBeforeTestAPI } from './utils/api-cleanup-helpers';

test.beforeEach(async ({ page }) => {
  await loginBeforeTest(page);
  await cleanupBeforeTestAPI(page); // Clean up before test
});
```

#### 4. `cleanupAfterTestAPI(page: Page)`
Cleans up all budget items after running a test using direct API calls.

**Usage:**
```typescript
import { cleanupAfterTestAPI } from './utils/api-cleanup-helpers';

test.afterEach(async ({ page }) => {
  await cleanupAfterTestAPI(page); // Clean up after test
});
```

#### 5. `deleteBudgetItemsByNameAPI(page: Page, itemNames: string[])`
Deletes specific budget items by name using direct API calls.

**Usage:**
```typescript
import { deleteBudgetItemsByNameAPI } from './utils/api-cleanup-helpers';

const itemNames = ['Budget Item 1', 'Budget Item 2'];
await deleteBudgetItemsByNameAPI(page, itemNames);
```

## API Test Data Tracker

### `APITestDataTracker` Class
A utility class for tracking budget items created during tests and cleaning them up automatically using API calls.

**Usage:**
```typescript
import { APITestDataTracker } from './utils/api-cleanup-helpers';

test.describe('Budget Tests', () => {
  let tracker: APITestDataTracker;

  test.beforeEach(async ({ page }) => {
    await loginBeforeTest(page);
    await cleanupBeforeTestAPI(page);
    tracker = new APITestDataTracker();
  });

  test.afterEach(async ({ page }) => {
    await tracker.cleanup(page); // Clean up tracked items
    await cleanupAfterTestAPI(page);
  });

  test('should create budget with tracking', async ({ page }) => {
    // Create budget item
    const itemName = `Test Budget ${Date.now()}`;
    // ... create budget logic ...
    
    // Track the created item
    tracker.addItemByName(itemName);
  });
});
```

## Standalone API Cleanup Script

### `cleanup-all-budgets-api.spec.ts`
A standalone test file that can be run manually to delete all budget items using API calls.

**Run with:**
```bash
npm run test tests/e2e/cleanup-all-budgets-api.spec.ts
```

## Integration with Existing Tests

### Current Implementation
All main test files now include automatic API-based cleanup:

- `smoke-test.spec.ts` - ✅ API Cleanup integrated
- `budget-creation.spec.ts` - ✅ API Cleanup integrated  
- `budget-simple.spec.ts` - ✅ API Cleanup integrated
- `budget-editing.spec.ts` - ✅ API Cleanup integrated

### How It Works

1. **Before Each Test**: `cleanupBeforeTestAPI()` deletes all existing budget items using direct API calls
2. **After Each Test**: `cleanupAfterTestAPI()` deletes all budget items created during the test using direct API calls
3. **API Efficiency**: Uses direct Supabase API calls instead of UI interactions
4. **Error Handling**: Continues cleanup even if individual deletions fail

## Benefits

### ✅ **Prevents Test Data Accumulation**
- No leftover budget items between test runs
- Clean test environment for each test

### ✅ **API-Based Efficiency**
- Uses direct Supabase API calls instead of UI interactions
- Much faster and more reliable than UI-based cleanup

### ✅ **Robust Error Handling**
- Continues cleanup even if some deletions fail
- Logs all cleanup activities for debugging

### ✅ **Flexible Usage**
- Can clean up all items or specific items
- Can be used before tests, after tests, or manually

## Example Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { loginBeforeTest } from './utils/auth-helpers';
import { cleanupBeforeTestAPI, cleanupAfterTestAPI } from './utils/api-cleanup-helpers';

test.describe('Budget Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginBeforeTest(page);
    await cleanupBeforeTestAPI(page); // Clean slate using API
  });

  test.afterEach(async ({ page }) => {
    await cleanupAfterTestAPI(page); // Clean up after test using API
  });

  test('should create budget item', async ({ page }) => {
    // Test logic here
    // Cleanup happens automatically in afterEach
  });
});
```

## Manual Cleanup

If you need to manually clean up budget items:

1. **Run the standalone API cleanup script:**
   ```bash
   npm run test tests/e2e/cleanup-all-budgets-api.spec.ts
   ```

2. **Or use the API cleanup utility in a test:**
   ```typescript
   import { deleteAllBudgetItemsAPI } from './utils/api-cleanup-helpers';
   
   test('manual cleanup', async ({ page }) => {
     await loginBeforeTest(page);
     await deleteAllBudgetItemsAPI(page);
   });
   ```

## Troubleshooting

### Common Issues

1. **Authentication errors**: Make sure the user is properly logged in before running API cleanup.

2. **API errors**: Check that the Supabase API is accessible and the user has proper permissions.

3. **Timeout errors**: API cleanup is much faster than UI cleanup, but if it takes too long, it will timeout but the test will still pass.

### Debugging

- All API cleanup activities are logged to the console
- Check the console output for cleanup messages
- Look for "API Cleanup:", "Found X budget items", and "All budget items deleted successfully" messages

## Best Practices

1. **Always use API cleanup in beforeEach/afterEach** for consistent test environment
2. **Use APITestDataTracker for complex tests** that create multiple items
3. **Run cleanup-all-budgets-api.spec.ts** if you need to manually clean up
4. **Check console logs** for cleanup activity confirmation
5. **API cleanup is much faster and more reliable** than UI-based cleanup 