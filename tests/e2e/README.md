# E2E Testing with Playwright

This directory contains end-to-end tests for the budget planner application using Playwright.

## Test Structure

- `smoke-test.spec.ts` - Basic smoke tests to verify the application loads
- `budget-flows.spec.ts` - Comprehensive tests for budget creation and editing flows
- `budget-edge-cases.spec.ts` - Tests for edge cases, validation, and error scenarios
- `utils/test-helpers.ts` - Helper utilities for common test operations

## Running Tests

### All Tests
```bash
npm test
```

### Interactive UI Mode
```bash
npm run test:ui
```

### Headed Mode (with browser visible)
```bash
npm run test:headed
```

### Debug Mode
```bash
npm run test:debug
```

### Specific Test File
```bash
npx playwright test budget-flows.spec.ts
```

### Specific Test
```bash
npx playwright test -g "should create monthly single year budget"
```

## Test Coverage

### Budget Creation Flows
- ✅ Monthly single year budget
- ✅ Quarterly single year budget
- ✅ One-time budget
- ✅ Custom frequency budget
- ✅ Multi-year budget
- ✅ Occurrence-based ending

### Budget Editing Flows
- ✅ Single year to multi-year conversion
- ✅ Multi-year to single year conversion
- ✅ Frequency changes (monthly to quarterly, etc.)
- ✅ Frequency changes (repeats to once)

### Validation & Error Handling
- ✅ Required field validation
- ✅ Amount limit validation
- ✅ Occurrence limit validation
- ✅ Invalid date range validation

### UI/UX Tests
- ✅ Conditional field visibility
- ✅ Default values
- ✅ Preview updates
- ✅ Mobile responsiveness

### Edge Cases
- ✅ Year boundary transitions
- ✅ Month boundary transitions
- ✅ Data persistence
- ✅ Concurrent edits
- ✅ Performance with many items
- ✅ Long multi-year spans

## Data Test IDs

The following data-testid attributes are used in the components:

### AddBudgetModal.vue
- `add-budget-modal` - Modal container
- `budget-name-input` - Name input field
- `budget-type-select` - Budget type dropdown
- `budget-category-select` - Category dropdown
- `default-amount-input` - Amount input field
- `payment-schedule-select` - Payment schedule dropdown
- `frequency-select` - Frequency dropdown
- `recurrence-interval-select` - Recurrence interval dropdown
- `submit-budget-btn` - Submit button

### BudgetPlanner.vue
- `add-budget-btn` - Add budget button
- `budget-table` - Budget table container

## Test Helpers

The `BudgetTestHelpers` class provides common operations:

```typescript
const helpers = new BudgetTestHelpers(page);

// Navigate to budget planner
await helpers.navigateToBudgetPlanner();

// Open add budget modal
await helpers.openAddBudgetModal();

// Fill basic budget info
await helpers.fillBasicBudgetInfo('Test Budget', 'expense', 'Utilities', '100');

// Set frequency
await helpers.setFrequency('repeats', '3');

// Submit form
await helpers.submitBudgetForm();

// Verify budget in table
await helpers.verifyBudgetInTable('Test Budget');
```

## Browser Support

Tests run on:
- Chromium
- Firefox
- WebKit (Safari)
- Mobile Chrome
- Mobile Safari

## CI/CD Integration

The tests are configured to run in CI environments with:
- Retry logic for flaky tests
- Screenshot capture on failure
- Video recording on failure
- Trace collection for debugging

## Debugging

### View Test Results
```bash
npx playwright show-report
```

### Debug Failed Tests
```bash
npx playwright test --debug
```

### Record New Test
```bash
npx playwright codegen http://localhost:5173/budget-planner
```

## Adding New Tests

1. Create a new test file in `tests/e2e/`
2. Use the existing test structure and helpers
3. Add appropriate data-testid attributes to components
4. Run tests to verify they work
5. Update this README with new test coverage

## Best Practices

- Use descriptive test names
- Group related tests in describe blocks
- Use test helpers for common operations
- Add appropriate assertions
- Handle async operations properly
- Use data-testid attributes for reliable element selection 