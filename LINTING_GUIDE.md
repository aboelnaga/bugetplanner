# Linting Guide for Budgrt

This guide explains the linting setup and available scripts for the Budgrt budget planning application.

## Available Scripts

### Development Scripts
- **`npm run dev`**: Runs linting (errors only) then starts development server
- **`npm run dev:watch`**: Runs linting on file changes + development server (recommended)
- **`npm run dev:eslint-watch`**: Uses ESLint's built-in watch mode + development server
- **`npm run build`**: Runs linting (errors only) then builds for production
- **`npm run dev:no-lint`**: Starts development server without linting
- **`npm run build:no-lint`**: Builds for production without linting

### Linting Scripts
- **`npm run lint`**: Shows all linting issues (errors + warnings)
- **`npm run lint:check`**: Strict check - fails on any warnings (0 warnings allowed)
- **`npm run lint:errors`**: Only shows errors (ignores warnings) - used by dev/build
- **`npm run lint:watch`**: Watches for file changes and runs linting automatically
- **`npm run lint:fix`**: Automatically fixes fixable issues
- **`npm run lint:warn`**: Allows up to 50 warnings (useful for gradual cleanup)

## Current Status

### Errors (20 total) - Must be fixed
These prevent the dev/build scripts from running:

1. **Parsing Errors** (1):
   - `BaseTooltip.vue`: Unexpected end of expression

2. **Case Block Declarations** (7):
   - `FooterDualModeCell.vue`: 2 errors
   - `useTransactionFilters.js`: 2 errors  
   - `migration.js`: 3 errors

3. **Undefined Variables** (6):
   - `useBudgetModals.js`: `oldYear` not defined
   - `auth.js`: `ref` and `readonly` not defined (4 errors)
   - `BudgetActionCenter.vue`: `loadBudgetItems` not defined (2 errors)

4. **Duplicate Keys** (3):
   - `budget.js`: Duplicate loading state keys

5. **Indentation** (2):
   - `InvestmentDetails.vue`: Vue script indentation issues

6. **Vue Parsing** (1):
   - `BaseTooltip.vue`: Template parsing error

### Warnings (497 total) - Can be addressed gradually
- Console statements: ~400 instances
- Unused variables: ~50 instances
- Missing prop defaults: ~10 instances
- Other code quality issues: ~37 instances

## Recommended Workflow

### For Development with Auto-Linting
1. **Start with**: `npm run dev:watch` (recommended for development)
   - Runs linting on file changes automatically
   - Shows linting results in real-time as you code
   - Development server runs alongside linting
2. **Alternative**: `npm run dev:eslint-watch` (uses ESLint's built-in watch)
3. **Fix errors**: Linting will show errors as you make changes
4. **Auto-fix**: Use `npm run lint:fix` for fixable issues

### For Development without Auto-Linting
1. **Start with**: `npm run dev` (will fail if errors exist)
2. **Fix errors**: Use `npm run lint:errors` to see only errors
3. **Auto-fix**: Use `npm run lint:fix` for fixable issues
4. **Continue development**: Once errors are fixed, dev server will start

### For Production
1. **Build**: `npm run build` (will fail if errors exist)
2. **Fix errors**: Same process as development
3. **Deploy**: Once errors are fixed, build will succeed

### For Code Quality Improvement
1. **Check warnings**: `npm run lint` to see all issues
2. **Gradual cleanup**: Use `npm run lint:warn` to allow some warnings
3. **Full cleanup**: Eventually work toward `npm run lint:check`

## Quick Fixes

### Auto-fixable Issues
```bash
npm run lint:fix
```

### Common Error Fixes

#### Case Block Declarations
Wrap case block content in braces:
```javascript
// Before
case 'value':
  const variable = 'something'
  break

// After  
case 'value': {
  const variable = 'something'
  break
}
```

#### Undefined Variables
Add proper imports or define variables:
```javascript
// Add missing imports
import { ref, readonly } from 'vue'
```

#### Duplicate Keys
Remove duplicate object keys in state definitions.

## IDE Integration

The project includes VS Code configuration for:
- **ESLint**: Real-time error detection
- **Prettier**: Code formatting on save
- **Vue Language Features**: Vue.js support

## Configuration Files

- **`eslint.config.js`**: ESLint configuration with Vue.js rules
- **`.prettierrc`**: Prettier formatting rules
- **`.editorconfig`**: Editor consistency settings
- **`.vscode/settings.json`**: VS Code specific settings

## Watch Mode Features

### Real-Time Linting
- **File watching**: Automatically detects changes to `.vue`, `.js`, `.ts` files
- **Instant feedback**: Shows linting results immediately after saving files
- **Error highlighting**: Displays errors and warnings in the terminal
- **Non-blocking**: Development server continues running even with linting errors

### Two Watch Options
1. **`npm run dev:watch`**: Uses nodemon for file watching
   - More customizable with `nodemon.json` config
   - Better performance for large projects
   - Configurable delay and ignore patterns

2. **`npm run dev:eslint-watch`**: Uses ESLint's built-in watch mode
   - Native ESLint functionality
   - Simpler setup
   - Good for smaller projects

## Best Practices

1. **Use watch mode**: `npm run dev:watch` for development with auto-linting
2. **Fix errors first**: Always address errors before warnings
3. **Use auto-fix**: Run `npm run lint:fix` regularly
4. **IDE integration**: Let your IDE show linting issues in real-time
5. **Gradual improvement**: Don't try to fix all warnings at once
6. **Consistent formatting**: Use Prettier for consistent code style

## Troubleshooting

### If dev/build fails
1. Run `npm run lint:errors` to see what's blocking
2. Fix the errors shown
3. Try running dev/build again

### If too many warnings
1. Use `npm run lint:warn` to allow some warnings
2. Gradually fix warnings over time
3. Eventually work toward zero warnings

### If linting is too strict
1. Use `npm run dev:no-lint` or `npm run build:no-lint`
2. Fix linting issues separately
3. Re-enable linting once issues are resolved
