# Tasks: Run Linting and Fix Errors

**Input**: Design documents from `/specs/004-feature-name-run/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup
- [x] T001 Verify ESLint configuration and linting scripts are available
- [x] T002 Run initial linting scan to identify all errors and warnings
- [x] T003 [P] Configure ESLint rules to resolve indentation conflicts

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
- [x] T004 [P] Test linting fix contract - verify input validation requirements
- [x] T005 [P] Test error resolution contract - verify all error categories are handled
- [x] T006 [P] Test warning handling contract - verify warning resolution approach
- [x] T007 [P] Test functionality preservation contract - verify no functionality is broken

## Phase 3.3: Core Implementation
- [x] T008 Fix syntax errors in BaseTooltip.vue (unterminated expression)
- [x] T009 Fix indentation conflicts in InvestmentDetails.vue
- [x] T010 [P] Fix lexical declaration errors in FooterDualModeCell.vue
- [x] T011 [P] Fix undefined variable 'oldYear' in useBudgetModals.js
- [x] T012 [P] Fix lexical declaration errors in useTransactionFilters.js
- [x] T013 [P] Fix undefined variables 'ref' and 'readonly' in auth.js
- [x] T014 [P] Fix lexical declaration errors in migration.js
- [x] T015 [P] Fix duplicate keys in budget.js
- [x] T016 Fix undefined function 'loadBudgetItems' in BudgetActionCenter.vue

## Phase 3.4: Integration
- [x] T017 Run auto-fix command to resolve remaining fixable issues
- [x] T018 Update ESLint configuration to ignore acceptable warnings
- [x] T019 Validate all fixes by running linting scan
- [x] T020 Test that npm run dev executes successfully

## Phase 3.5: Polish
- [ ] T021 [P] Apply Prettier formatting for code consistency
- [ ] T022 [P] Document any skipped fixes with justification
- [ ] T023 [P] Update ESLint rules documentation
- [ ] T024 [P] Verify all files pass linting without errors

## Dependency Graph
```
T001 → T002 → T003
T002 → T004, T005, T006, T007
T003 → T008, T009
T004, T005, T006, T007 → T008, T009, T010, T011, T012, T013, T014, T015, T016
T008, T009, T010, T011, T012, T013, T014, T015, T016 → T017
T017 → T018, T019, T020
T018, T019, T020 → T021, T022, T023, T024
```

## Parallel Execution Examples

### Group 1: Contract Tests (T004-T007) [P]
```bash
# These can run in parallel - they test different contract aspects
# T004: Test linting fix contract
# T005: Test error resolution contract  
# T006: Test warning handling contract
# T007: Test functionality preservation contract
```

### Group 2: File-Specific Fixes (T010-T015) [P]
```bash
# These can run in parallel - they fix different files
# T010: Fix FooterDualModeCell.vue
# T011: Fix useBudgetModals.js
# T012: Fix useTransactionFilters.js
# T013: Fix auth.js
# T014: Fix migration.js
# T015: Fix budget.js
```

### Group 3: Polish Tasks (T021-T024) [P]
```bash
# These can run in parallel - they are independent polish tasks
# T021: Apply Prettier formatting
# T022: Document skipped fixes
# T023: Update ESLint rules documentation
# T024: Verify all files pass linting
```

## Task Details

### T001: Verify ESLint configuration and linting scripts
**File**: `eslint.config.js`, `package.json`
**Description**: Ensure ESLint is properly configured and all necessary scripts are available
**Dependencies**: None
**Validation**: ESLint config exists, package.json contains lint scripts

### T002: Run initial linting scan to identify all errors and warnings
**File**: All source files
**Description**: Execute `npm run lint:errors` to get complete list of issues
**Dependencies**: T001
**Validation**: Complete error list generated

### T003: Configure ESLint rules to resolve indentation conflicts
**File**: `eslint.config.js`
**Description**: Update ESLint config to disable general indent rule for Vue files
**Dependencies**: T001
**Validation**: No more vue/script-indent vs indent conflicts

### T004: Test linting fix contract - verify input validation requirements
**File**: `contracts/linting-fix-contract.md`
**Description**: Verify all input validation requirements are met
**Dependencies**: T002
**Validation**: All input contract requirements satisfied

### T005: Test error resolution contract - verify all error categories are handled
**File**: `contracts/linting-fix-contract.md`
**Description**: Verify all error categories from research are addressed
**Dependencies**: T002
**Validation**: All error categories covered

### T006: Test warning handling contract - verify warning resolution approach
**File**: `contracts/linting-fix-contract.md`
**Description**: Verify warning handling approach is implemented
**Dependencies**: T002
**Validation**: Warning handling approach validated

### T007: Test functionality preservation contract - verify no functionality is broken
**File**: `contracts/linting-fix-contract.md`
**Description**: Verify functionality preservation requirements
**Dependencies**: T002
**Validation**: Functionality preservation approach validated

### T008: Fix syntax errors in BaseTooltip.vue
**File**: `src/components/BaseTooltip.vue`
**Description**: Fix unterminated expression on line 56
**Dependencies**: T003
**Validation**: No parsing errors

### T009: Fix indentation conflicts in InvestmentDetails.vue
**File**: `src/views/InvestmentDetails.vue`
**Description**: Resolve vue/script-indent vs indent rule conflict
**Dependencies**: T003
**Validation**: No indentation conflicts

### T010: Fix lexical declaration errors in FooterDualModeCell.vue
**File**: `src/components/FooterDualModeCell.vue`
**Description**: Fix lexical declaration in case block (2 errors)
**Dependencies**: T003
**Validation**: No lexical declaration errors

### T011: Fix undefined variable 'oldYear' in useBudgetModals.js
**File**: `src/composables/useBudgetModals.js`
**Description**: Fix undefined variable 'oldYear'
**Dependencies**: T003
**Validation**: No undefined variable errors

### T012: Fix lexical declaration errors in useTransactionFilters.js
**File**: `src/composables/useTransactionFilters.js`
**Description**: Fix lexical declaration in case block (2 errors)
**Dependencies**: T003
**Validation**: No lexical declaration errors

### T013: Fix undefined variables 'ref' and 'readonly' in auth.js
**File**: `src/lib/auth.js`
**Description**: Add missing Vue imports for 'ref' and 'readonly' (4 errors)
**Dependencies**: T003
**Validation**: No undefined variable errors

### T014: Fix lexical declaration errors in migration.js
**File**: `src/lib/migration.js`
**Description**: Fix lexical declaration in case block (3 errors)
**Dependencies**: T003
**Validation**: No lexical declaration errors

### T015: Fix duplicate keys in budget.js
**File**: `src/stores/budget.js`
**Description**: Remove duplicate keys (addLoading, editLoading, deleteLoading)
**Dependencies**: T003
**Validation**: No duplicate key errors

### T016: Fix undefined function 'loadBudgetItems' in BudgetActionCenter.vue
**File**: `src/views/BudgetActionCenter.vue`
**Description**: Add missing function or import
**Dependencies**: T003
**Validation**: No undefined function errors

### T017: Run auto-fix command to resolve remaining fixable issues
**File**: All source files
**Description**: Execute `npm run lint:fix` for automatic fixes
**Dependencies**: T008, T009, T010, T011, T012, T013, T014, T015, T016
**Validation**: All auto-fixable issues resolved

### T018: Update ESLint configuration to ignore acceptable warnings
**File**: `eslint.config.js`
**Description**: Add rules to ignore acceptable warnings
**Dependencies**: T017
**Validation**: Acceptable warnings ignored

### T019: Validate all fixes by running linting scan
**File**: All source files
**Description**: Run `npm run lint:errors` to verify all errors resolved
**Dependencies**: T017, T018
**Validation**: No linting errors

### T020: Test that npm run dev executes successfully
**File**: All source files
**Description**: Verify development server starts without errors
**Dependencies**: T019
**Validation**: Dev server starts successfully

### T021: Apply Prettier formatting for code consistency
**File**: All source files
**Description**: Run Prettier to ensure consistent formatting
**Dependencies**: T020
**Validation**: All files properly formatted

### T022: Document any skipped fixes with justification
**File**: `LINTING_GUIDE.md`
**Description**: Document any fixes that were skipped due to time constraints
**Dependencies**: T020
**Validation**: Skipped fixes documented

### T023: Update ESLint rules documentation
**File**: `LINTING_GUIDE.md`
**Description**: Update documentation with new ESLint rule changes
**Dependencies**: T018
**Validation**: Documentation updated

### T024: Verify all files pass linting without errors
**File**: All source files
**Description**: Final verification that all files pass linting
**Dependencies**: T021, T022, T023
**Validation**: All files pass linting

## Success Criteria
- ✅ All ESLint errors resolved
- ✅ `npm run dev` executes successfully
- ✅ No functionality broken
- ✅ Completion within 10 minutes
- ✅ Code formatting consistent
- ✅ ESLint configuration optimized
