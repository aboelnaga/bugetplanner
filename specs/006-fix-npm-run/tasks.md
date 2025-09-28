# Tasks: Fix npm run lint warnings mainly the unused variables

**Input**: Design documents from `/specs/006-fix-npm-run/`
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

- [x] T001 Verify current ESLint configuration and warning baseline
- [x] T002 Run initial lint check to establish 149 warning baseline
- [x] T003 [P] Categorize warnings by type (unused-vars, prop-validation, security, import, other)

## Phase 3.2: Auto-Fix Phase

- [x] T004 Run `npm run lint:fix` to auto-fix fixable warnings
- [x] T005 Re-check warning count after auto-fix
- [x] T006 Document which warnings were auto-fixed vs manual

## Phase 3.3: Manual Cleanup by Priority

- [x] T007 [P] Fix unused variables in components directory (Priority 1)
- [x] T008 [P] Fix unused variables in composables directory (Priority 1)
- [ ] T009 [P] Fix unused variables in stores directory (Priority 1)
- [ ] T010 [P] Fix unused variables in views directory (Priority 1)
- [ ] T011 [P] Fix unused variables in lib directory (Priority 1)
- [ ] T012 [P] Fix unused variables in utils directory (Priority 1)
- [ ] T013 [P] Fix unused variables in layout directory (Priority 1)

## Phase 3.4: Prop Validation Cleanup

- [ ] T014 [P] Fix prop validation warnings in AccountCard.vue
- [ ] T015 [P] Fix prop validation warnings in AddBudgetModal.vue
- [ ] T016 [P] Fix prop validation warnings in AddInvestmentAssetModal.vue
- [ ] T017 [P] Fix prop validation warnings in AddTransactionModal.vue
- [ ] T018 [P] Fix prop validation warnings in BaseModal.vue
- [ ] T019 [P] Fix prop validation warnings in BaseTooltip.vue
- [ ] T020 [P] Fix prop validation warnings in BudgetCell.vue
- [ ] T021 [P] Fix prop validation warnings in BudgetControlPanel.vue
- [ ] T022 [P] Fix prop validation warnings in BudgetDataTable.vue
- [ ] T023 [P] Fix prop validation warnings in BudgetSummaryExpenses.vue
- [ ] T024 [P] Fix prop validation warnings in BudgetSummaryIncome.vue
- [ ] T025 [P] Fix prop validation warnings in BudgetSummaryNet.vue
- [ ] T026 [P] Fix prop validation warnings in BudgetSummaryRow.vue
- [ ] T027 [P] Fix prop validation warnings in BudgetSummaryRowHelper.vue
- [ ] T028 [P] Fix prop validation warnings in CloseMonthModal.vue
- [ ] T029 [P] Fix prop validation warnings in CurrencyInput.vue
- [ ] T030 [P] Fix prop validation warnings in EditAccountModal.vue
- [ ] T031 [P] Fix prop validation warnings in ExpenseBreakdownChart.vue
- [ ] T032 [P] Fix prop validation warnings in FooterDualModeCell.vue
- [ ] T033 [P] Fix prop validation warnings in HistoryModal.vue
- [ ] T034 [P] Fix prop validation warnings in MonthlyTrendChart.vue
- [ ] T035 [P] Fix prop validation warnings in ProjectionChart.vue
- [ ] T036 [P] Fix prop validation warnings in StatCard.vue
- [ ] T037 [P] Fix prop validation warnings in TransferModal.vue

## Phase 3.5: Security Warnings Cleanup

- [ ] T038 Fix v-html security warning in BaseTooltip.vue
- [ ] T039 Review and sanitize v-html content for XSS prevention

## Phase 3.6: Import Cleanup

- [ ] T040 [P] Remove unused imports in components directory
- [ ] T041 [P] Remove unused imports in composables directory
- [ ] T042 [P] Remove unused imports in stores directory
- [ ] T043 [P] Remove unused imports in views directory
- [ ] T044 [P] Remove unused imports in lib directory
- [ ] T045 [P] Remove unused imports in utils directory
- [ ] T046 [P] Remove unused imports in layout directory

## Phase 3.7: Final Verification

- [ ] T047 Run complete lint check to verify zero warnings
- [ ] T048 Test application functionality with `npm run dev`
- [ ] T049 Run error-only check with `npm run lint:errors`
- [ ] T050 Verify all existing functionality preserved

## Phase 3.8: Polish and Documentation

- [ ] T051 [P] Update component documentation for cleaned props
- [ ] T052 [P] Add comments for intentionally unused variables (if any)
- [ ] T053 [P] Update README with linting guidelines
- [ ] T054 [P] Consider adding pre-commit hooks for future prevention

## Dependencies

- T001-T003 must complete before T004-T006 (setup before auto-fix)
- T004-T006 must complete before T007-T013 (auto-fix before manual cleanup)
- T007-T013 must complete before T014-T037 (unused vars before prop validation)
- T014-T037 must complete before T038-T039 (prop validation before security)
- T038-T039 must complete before T040-T046 (security before imports)
- T040-T046 must complete before T047-T050 (imports before verification)
- T047-T050 must complete before T051-T054 (verification before polish)

## Parallel Execution Examples

### Phase 3.3: Unused Variables Cleanup (T007-T013)

```
# Launch T007-T013 together (different directories):
Task: "Fix unused variables in components directory (Priority 1)"
Task: "Fix unused variables in composables directory (Priority 1)"
Task: "Fix unused variables in stores directory (Priority 1)"
Task: "Fix unused variables in views directory (Priority 1)"
Task: "Fix unused variables in lib directory (Priority 1)"
Task: "Fix unused variables in utils directory (Priority 1)"
Task: "Fix unused variables in layout directory (Priority 1)"
```

### Phase 3.4: Prop Validation Cleanup (T014-T037)

```
# Launch T014-T037 together (different component files):
Task: "Fix prop validation warnings in AccountCard.vue"
Task: "Fix prop validation warnings in AddBudgetModal.vue"
Task: "Fix prop validation warnings in AddInvestmentAssetModal.vue"
Task: "Fix prop validation warnings in AddTransactionModal.vue"
Task: "Fix prop validation warnings in BaseModal.vue"
Task: "Fix prop validation warnings in BaseTooltip.vue"
Task: "Fix prop validation warnings in BudgetCell.vue"
Task: "Fix prop validation warnings in BudgetControlPanel.vue"
Task: "Fix prop validation warnings in BudgetDataTable.vue"
Task: "Fix prop validation warnings in BudgetSummaryExpenses.vue"
Task: "Fix prop validation warnings in BudgetSummaryIncome.vue"
Task: "Fix prop validation warnings in BudgetSummaryNet.vue"
Task: "Fix prop validation warnings in BudgetSummaryRow.vue"
Task: "Fix prop validation warnings in BudgetSummaryRowHelper.vue"
Task: "Fix prop validation warnings in CloseMonthModal.vue"
Task: "Fix prop validation warnings in CurrencyInput.vue"
Task: "Fix prop validation warnings in EditAccountModal.vue"
Task: "Fix prop validation warnings in ExpenseBreakdownChart.vue"
Task: "Fix prop validation warnings in FooterDualModeCell.vue"
Task: "Fix prop validation warnings in HistoryModal.vue"
Task: "Fix prop validation warnings in MonthlyTrendChart.vue"
Task: "Fix prop validation warnings in ProjectionChart.vue"
Task: "Fix prop validation warnings in StatCard.vue"
Task: "Fix prop validation warnings in TransferModal.vue"
```

### Phase 3.6: Import Cleanup (T040-T046)

```
# Launch T040-T046 together (different directories):
Task: "Remove unused imports in components directory"
Task: "Remove unused imports in composables directory"
Task: "Remove unused imports in stores directory"
Task: "Remove unused imports in views directory"
Task: "Remove unused imports in lib directory"
Task: "Remove unused imports in utils directory"
Task: "Remove unused imports in layout directory"
```

### Phase 3.8: Polish and Documentation (T051-T054)

```
# Launch T051-T054 together (different files):
Task: "Update component documentation for cleaned props"
Task: "Add comments for intentionally unused variables (if any)"
Task: "Update README with linting guidelines"
Task: "Consider adding pre-commit hooks for future prevention"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify each phase completes before moving to next
- Commit after each major phase completion
- Avoid: modifying same file in parallel tasks
- Focus on preserving functionality while cleaning code

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist

_GATE: Checked by main() before returning_

- [x] All contracts have corresponding tests
- [x] All entities have model tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
