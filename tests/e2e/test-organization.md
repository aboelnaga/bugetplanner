# E2E Test Organization Plan

## Current Issues
1. Missing data-testid attributes in components
2. Form submission using `.submit()` instead of `.click()`
3. Validation error display not working
4. Schedule preview text mismatches
5. Tests are too large and not focused

## Proposed Test Structure

### 1. Core Tests (smoke-test.spec.ts)
- ✅ Basic page loading
- ✅ Modal opening
- ✅ Default values

### 2. Budget Creation Tests (budget-creation.spec.ts)
- Single year budget creation
- Multi-year budget creation
- Different frequency types (repeats, once, custom)
- Validation during creation

### 3. Budget Editing Tests (budget-editing.spec.ts)
- Edit single year budget
- Edit multi-year budget
- Convert between single/multi-year
- Form data preservation

### 4. Validation Tests (budget-validation.spec.ts)
- Required field validation
- Amount limits
- Date range validation
- Occurrence limits

### 5. UI/UX Tests (budget-ui.spec.ts)
- Conditional field visibility
- Preview updates
- Modal behavior
- Form interactions

### 6. Edge Cases (budget-edge-cases.spec.ts)
- Boundary conditions
- Performance tests
- Concurrent operations
- Error scenarios

### 7. Integration Tests (budget-integration.spec.ts)
- Investment linking
- Year filtering
- Data persistence
- Cross-page functionality

## Immediate Fixes Needed

### 1. Add Missing data-testid Attributes
- `[data-testid="name-error"]`
- `[data-testid="amount-error"]`
- `[data-testid="occurrences-error"]`
- `[data-testid="start-date-section"]`
- `[data-testid="end-date-section"]`
- `[data-testid="due-date-section"]`
- `[data-testid="investment-direction-section"]`
- `[data-testid="submit-edit-btn"]`

### 2. Fix Form Submission
- Replace `.submit()` with `.click()`
- Use proper button selectors

### 3. Fix Validation Display
- Ensure validation errors show in modal
- Add proper error message selectors

### 4. Fix Schedule Preview
- Update test expectations to match actual preview text
- Make tests more flexible with text matching

## Test File Splitting Strategy

1. **Keep existing files** but fix the issues
2. **Create new focused files** for better organization
3. **Move tests** to appropriate files
4. **Add proper test data** and cleanup

## Priority Order
1. Fix critical issues (data-testid, form submission)
2. Split large test files
3. Add missing test coverage
4. Improve test reliability 