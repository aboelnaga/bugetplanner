# Quickstart: Run Linting and Fix Errors

**Feature**: 004-feature-name-run  
**Date**: 2025-01-27  
**Status**: Ready for Implementation

## Prerequisites

- Node.js and npm installed
- ESLint and Prettier configured
- Vue.js project structure
- Git repository with current branch

## Quick Start (10 minutes)

### Step 1: Identify Issues (1 minute)
```bash
# Run linting to see all errors and warnings
npm run lint:errors

# Expected output: ~20 errors across multiple files
```

### Step 2: Fix Critical Errors (6 minutes)
```bash
# Try auto-fixing first
npm run lint:fix

# Check remaining errors
npm run lint:errors

# Manual fixes for remaining errors:
# 1. Fix syntax errors (BaseTooltip.vue)
# 2. Resolve indentation conflicts (InvestmentDetails.vue)
# 3. Add missing imports (auth.js)
# 4. Fix variable scope issues (useBudgetModals.js)
# 5. Remove duplicate keys (budget.js)
```

### Step 3: Address Warnings (2 minutes)
```bash
# Fix remaining warnings
npm run lint:fix

# Update ESLint rules for acceptable warnings
# Edit eslint.config.js to disable specific rules
```

### Step 4: Validate Success (1 minute)
```bash
# Verify all errors are resolved
npm run lint:errors

# Test that dev server starts
npm run dev

# Should start without linting errors
```

## Error Fixing Guide

### Syntax Errors
- **BaseTooltip.vue**: Fix unterminated expression on line 56
- **Solution**: Add missing closing quote or parenthesis

### Indentation Conflicts
- **InvestmentDetails.vue**: Resolve vue/script-indent vs indent rule conflict
- **Solution**: Update ESLint config to disable general indent rule for Vue files

### Variable Issues
- **auth.js**: Add missing Vue imports for 'ref' and 'readonly'
- **useBudgetModals.js**: Fix undefined 'oldYear' variable
- **Solution**: Add proper import statements or fix variable declarations

### Structure Issues
- **budget.js**: Remove duplicate keys (addLoading, editLoading, deleteLoading)
- **Solution**: Remove duplicate property definitions

### Function Issues
- **BudgetActionCenter.vue**: Fix undefined 'loadBudgetItems' function
- **Solution**: Add missing function or import

## ESLint Configuration Updates

### Disable Conflicting Rules
```javascript
// In eslint.config.js
{
  files: ['**/*.vue'],
  rules: {
    'indent': 'off', // Disable general indent for Vue files
    'vue/script-indent': ['error', 2] // Use Vue-specific indent
  }
}
```

### Ignore Acceptable Warnings
```javascript
// Add to rules section
rules: {
  'no-console': 'warn', // Allow console.log in development
}
```

## Validation Checklist

- [ ] All ESLint errors resolved (`npm run lint:errors` returns clean)
- [ ] Dev server starts successfully (`npm run dev` works)
- [ ] No functionality broken (manual testing)
- [ ] Code formatting consistent (Prettier applied)
- [ ] ESLint rules updated for acceptable warnings
- [ ] All fixes completed within 10 minutes

## Troubleshooting

### If Dev Server Still Fails
1. Check for remaining syntax errors
2. Verify all imports are correct
3. Ensure no missing dependencies
4. Check for TypeScript compilation errors

### If Auto-fix Doesn't Work
1. Manually fix syntax errors first
2. Resolve indentation conflicts
3. Add missing imports
4. Fix variable scope issues

### If Time Runs Out
1. Focus on critical errors only
2. Skip warnings and minor issues
3. Document remaining issues for later
4. Ensure dev server can start

## Success Metrics

- **Errors Fixed**: 20/20 ESLint errors resolved
- **Warnings Addressed**: 0+ warnings fixed or ignored
- **Time Taken**: ≤10 minutes
- **Functionality**: Dev server starts without errors
- **Code Quality**: Improved maintainability and consistency
