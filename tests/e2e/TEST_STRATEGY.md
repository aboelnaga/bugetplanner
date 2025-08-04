# Test Strategy: E2E vs Mocked Tests

## Overview

We now have a **hybrid test strategy** that combines:

1. **E2E Tests with Real APIs** - For critical user flows and data persistence
2. **UI Tests with Mocked Data** - For UI automation and faster feedback

## Test Categories

### 🔴 **E2E Tests (Real APIs)**
**Purpose:** Test complete user flows with real backend integration
**Files:**
- `smoke-test.spec.ts` - Basic page loading and navigation
- `budget-creation.spec.ts` - Core budget creation flows
- `budget-simple.spec.ts` - Basic UI interactions

**Characteristics:**
- ✅ Tests real API calls and database operations
- ✅ Validates complete user workflows
- ✅ Catches integration issues
- ❌ Slower execution (API calls)
- ❌ Requires database cleanup
- ❌ Can be flaky due to network issues

### 🟢 **Mocked Tests (UI Focus)**
**Purpose:** Fast UI automation without backend dependencies
**Files:**
- `budget-ui-mocked.spec.ts` - Basic UI interactions with mocked data
- `budget-ui-advanced.spec.ts` - Complex UI scenarios with mocked data

**Characteristics:**
- ✅ Very fast execution (no API calls)
- ✅ No database pollution
- ✅ Reliable and consistent
- ✅ Focus purely on UI behavior
- ❌ Doesn't test real API integration
- ❌ Doesn't validate data persistence

## Test Commands

```bash
# Run only E2E tests (real APIs)
npm run test:e2e

# Run only mocked tests (UI focus)
npm run test:mocked

# Run all tests (both strategies)
npm run test:all

# Run specific test files
npm run test tests/e2e/budget-ui-mocked.spec.ts
```

## Mocking Strategy

### Network Interception
We use Playwright's `page.route()` to intercept API calls:

```typescript
// Mock all Supabase API calls
await page.route('**/rest/v1/budget_items**', async route => {
  if (route.request().method() === 'GET') {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockData)
    });
  }
});
```

### Mocked Scenarios
- **Empty State:** No budget items
- **Populated State:** Multiple budget items with different types
- **Year Filtering:** Different data for different years
- **CRUD Operations:** Mock successful create/update/delete

## Test Coverage

### E2E Tests Coverage
- ✅ User authentication
- ✅ Real budget creation
- ✅ Data persistence
- ✅ API error handling
- ✅ Database cleanup

### Mocked Tests Coverage
- ✅ Form validation
- ✅ Conditional field visibility
- ✅ UI state management
- ✅ User interactions
- ✅ Preview updates
- ✅ Modal behavior
- ✅ Form reset behavior

## When to Use Each Strategy

### Use E2E Tests When:
- Testing critical user workflows
- Validating data persistence
- Testing API integration
- Testing authentication flows
- Testing real error scenarios

### Use Mocked Tests When:
- Testing UI interactions
- Testing form validation
- Testing conditional logic
- Testing user experience
- Fast feedback during development
- Testing edge cases without data pollution

## Benefits of Hybrid Approach

### 🚀 **Performance**
- Mocked tests run 3-5x faster
- E2E tests focus on critical paths only
- Parallel execution possible

### 🛡️ **Reliability**
- Mocked tests are deterministic
- No network dependencies
- No database state issues

### 🎯 **Focus**
- E2E tests: Integration and data
- Mocked tests: UI and user experience

### 💰 **Cost Efficiency**
- Fewer API calls in CI/CD
- Faster feedback loops
- Reduced infrastructure costs

## Best Practices

### For E2E Tests:
1. Keep tests focused on critical user flows
2. Use API-based cleanup for reliability
3. Test real error scenarios
4. Validate data persistence

### For Mocked Tests:
1. Test all UI interactions
2. Mock realistic data scenarios
3. Test edge cases and validation
4. Focus on user experience

### General:
1. Use descriptive test names
2. Group related tests together
3. Keep tests independent
4. Use data-testid attributes consistently

## Test Data Strategy

### E2E Test Data:
- Real user accounts
- Real database operations
- API-based cleanup
- Minimal test data

### Mocked Test Data:
- Realistic mock scenarios
- Various data combinations
- Edge case data
- No persistence concerns

## CI/CD Integration

```yaml
# Example GitHub Actions workflow
- name: Run E2E Tests
  run: npm run test:e2e

- name: Run Mocked Tests
  run: npm run test:mocked

- name: Run All Tests
  run: npm run test:all
```

## Future Enhancements

### Planned Improvements:
1. **Visual Regression Tests** - Screenshot comparisons
2. **Performance Tests** - Load time and responsiveness
3. **Accessibility Tests** - Screen reader compatibility
4. **Mobile Tests** - Responsive design validation

### Potential Additions:
1. **API Contract Tests** - Validate API responses
2. **Database Migration Tests** - Schema changes
3. **Security Tests** - Authentication and authorization
4. **Load Tests** - Performance under stress

## Troubleshooting

### Common Issues:

#### E2E Test Failures:
- **Network timeouts:** Increase timeout values
- **Database state:** Use API cleanup
- **Authentication:** Check session management

#### Mocked Test Failures:
- **Missing data-testid:** Add to components
- **Mock data mismatch:** Update mock responses
- **UI state issues:** Check component logic

### Debug Commands:
```bash
# Debug E2E tests
npm run test:debug tests/e2e/budget-creation.spec.ts

# Debug mocked tests
npm run test:debug tests/e2e/budget-ui-mocked.spec.ts

# Run with UI mode
npm run test:ui
```

## Conclusion

This hybrid approach gives us:
- **Fast feedback** for UI development
- **Reliable integration** testing
- **Comprehensive coverage** of user flows
- **Cost-effective** test execution
- **Maintainable** test suite

The combination ensures we catch both UI issues quickly and integration problems thoroughly. 