# Research: Fix npm run lint warnings mainly the unused variables

**Feature**: 006-fix-npm-run  
**Date**: 2024-12-19  
**Status**: Complete

## Research Tasks

### 1. ESLint Configuration Analysis

**Task**: Research current ESLint configuration and warning patterns

**Decision**: Use existing ESLint 9.35.0 configuration with Vue.js plugin
**Rationale**:

- Current configuration is already set up and working
- ESLint 9.35.0 is latest stable version with Vue.js support
- No need to change configuration, only fix warnings

**Alternatives considered**:

- Upgrading ESLint version (rejected - current version is stable)
- Changing ESLint rules (rejected - current rules are appropriate)
- Switching to different linter (rejected - ESLint is standard for Vue.js)

### 2. Vue.js Unused Variable Patterns

**Task**: Research common patterns for unused variables in Vue.js components

**Decision**: Focus on three main categories of unused variables:

1. **Unused imports**: Remove or utilize imported modules
2. **Unused function parameters**: Remove or prefix with underscore
3. **Unused computed properties**: Remove or implement functionality

**Rationale**:

- These are the most common patterns in the current codebase
- Vue.js Composition API has specific patterns for unused variables
- Clear categorization helps systematic cleanup

**Alternatives considered**:

- Disabling ESLint rules (rejected - reduces code quality)
- Using ESLint disable comments (rejected - should fix root cause)

### 3. ESLint Auto-fix Capabilities

**Task**: Research what warnings can be automatically fixed vs manual fixes

**Decision**: Use `npm run lint:fix` for automatic fixes, manual review for complex cases
**Rationale**:

- ESLint can automatically fix many unused import warnings
- Manual review needed for unused variables that might be intentionally unused
- Some warnings require understanding of business logic

**Alternatives considered**:

- Manual fixes only (rejected - inefficient for simple cases)
- Auto-fix only (rejected - might break intentional patterns)

### 4. Vue.js Prop Validation Best Practices

**Task**: Research proper prop validation patterns for Vue.js components

**Decision**: Add default values for optional props, mark required props explicitly
**Rationale**:

- Vue.js requires default values for optional props
- Explicit prop requirements improve component API clarity
- Follows Vue.js best practices for component design

**Alternatives considered**:

- Disabling prop validation (rejected - reduces type safety)
- Using TypeScript (rejected - not in current scope)

### 5. Security Considerations for v-html

**Task**: Research security implications of v-html directive usage

**Decision**: Review v-html usage for XSS vulnerabilities, sanitize if needed
**Rationale**:

- v-html can be dangerous if content is not sanitized
- Current usage appears to be for tooltip content
- Need to ensure content is trusted or properly sanitized

**Alternatives considered**:

- Removing v-html entirely (rejected - might break functionality)
- Disabling ESLint warning (rejected - security concern should be addressed)

## Consolidated Findings

### Primary Approach

1. **Systematic cleanup**: Process files by category (components, composables, stores, views)
2. **Auto-fix first**: Use `npm run lint:fix` for automatic fixes
3. **Manual review**: Check each file for intentional unused variables
4. **Preserve functionality**: Ensure no breaking changes during cleanup

### Warning Categories to Address

1. **Unused variables** (highest priority): 149 total warnings
2. **Unused imports**: Remove unnecessary imports
3. **Prop validation**: Add default values or mark as required
4. **Security warnings**: Review v-html usage
5. **Unused function parameters**: Remove or prefix with underscore

### Tools and Commands

- `npm run lint` - Check current warnings
- `npm run lint:fix` - Auto-fix fixable warnings
- `npm run lint:errors` - Check for errors only
- Manual code review for complex cases

### Success Criteria

- Zero ESLint warnings when running `npm run lint`
- All existing functionality preserved
- Code readability maintained or improved
- No breaking changes introduced

## Research Complete

All technical unknowns resolved. Ready to proceed with Phase 1 design.
