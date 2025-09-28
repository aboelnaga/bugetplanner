# Implementation Plan: Fix npm run lint warnings mainly the unused variables

**Branch**: `006-fix-npm-run` | **Date**: 2024-12-19 | **Spec**: [link]
**Input**: Feature specification from `/specs/006-fix-npm-run/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Fix all 149 ESLint warnings in the Vue.js budget planning application, with primary focus on unused variables, imports, and prop validation issues. The solution involves systematic code cleanup while maintaining all existing functionality and following Vue.js best practices.

## Technical Context

**Language/Version**: JavaScript ES6+, Vue.js 3.3.4  
**Primary Dependencies**: ESLint 9.35.0, Vue.js, PrimeVue, Tailwind CSS  
**Storage**: N/A (code cleanup only)  
**Testing**: ESLint validation, manual testing  
**Target Platform**: Web browser (Vue.js SPA)  
**Project Type**: web (Vue.js frontend application)  
**Performance Goals**: Zero ESLint warnings, maintain code readability  
**Constraints**: Must preserve all existing functionality, follow Vue.js best practices  
**Scale/Scope**: 149 warnings across ~50 files in Vue.js application

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Islamic Finance Compliance

- ✅ **PASS**: No impact on Islamic finance calculations or Zakat features
- ✅ **PASS**: Code cleanup maintains existing financial calculation integrity

### Vue.js Best Practices

- ✅ **PASS**: Follows Vue.js 3 Composition API patterns during cleanup
- ✅ **PASS**: Maintains proper component structure and separation of concerns
- ✅ **PASS**: Preserves existing component reusability and documentation

### Supabase Integration

- ✅ **PASS**: No changes to Supabase operations or RLS policies
- ✅ **PASS**: Maintains existing database integration patterns

### Pragmatic Development

- ✅ **PASS**: Focuses on rapid cleanup with minimal disruption
- ✅ **PASS**: Uses existing ESLint configuration and patterns
- ✅ **PASS**: Manual testing approach for validation

### User Experience Excellence

- ✅ **PASS**: Improves developer experience by eliminating warnings
- ✅ **PASS**: Maintains all existing user-facing functionality
- ✅ **PASS**: Preserves financial data visualization and workflows

### Linting and Code Quality Requirements

- ✅ **PASS**: Directly addresses constitution requirement to fix ESLint errors
- ✅ **PASS**: Aligns with "AI Assistants must fix all ESLint errors before marking code as complete"
- ✅ **PASS**: Uses `npm run lint:fix` for automatic fixes where possible

**Constitution Check Result**: ✅ **PASS** - All requirements met

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
src/
├── components/           # Vue.js components (main cleanup target)
│   ├── AccountCard.vue
│   ├── AddBudgetModal.vue
│   ├── AddInvestmentAssetModal.vue
│   ├── AddTransactionModal.vue
│   ├── BaseModal.vue
│   ├── BaseTooltip.vue
│   ├── BudgetCell.vue
│   ├── BudgetControlPanel.vue
│   ├── BudgetDataTable.vue
│   ├── BudgetSummaryExpenses.vue
│   ├── BudgetSummaryIncome.vue
│   ├── BudgetSummaryNet.vue
│   ├── BudgetSummaryRow.vue
│   ├── BudgetSummaryRowHelper.vue
│   ├── CloseMonthModal.vue
│   ├── CurrencyInput.vue
│   ├── EditAccountModal.vue
│   ├── ExpenseBreakdownChart.vue
│   ├── FooterDualModeCell.vue
│   ├── HistoryModal.vue
│   ├── MonthlyTrendChart.vue
│   ├── ProjectionChart.vue
│   ├── StatCard.vue
│   └── TransferModal.vue
├── composables/          # Vue.js composables (cleanup target)
│   ├── useAutoCloseFeedback.js
│   ├── useBudgetCalculations.js
│   ├── useBudgetDataTable.js
│   ├── useBudgetFilters.js
│   ├── useBudgetHistory.js
│   ├── useBudgetModals.js
│   ├── useBudgetSummaries.js
│   ├── useErrorHandler.js
│   ├── useIslamicCalendar.js
│   ├── useIslamicLawCompliance.js
│   ├── useNisabCalculation.js
│   ├── useSmartRefresh.js
│   ├── useTooltipBuilder.js
│   ├── useTransactionFilters.js
│   ├── useTransactionModals.js
│   ├── useZakatAssets.js
│   ├── useZakatBudgetIntegration.js
│   └── useZakatPayments.js
├── stores/               # Pinia stores (cleanup target)
│   ├── accounts.js
│   ├── budget.js
│   ├── hawlStore.js
│   ├── transactions.js
│   └── yearlySummaries.js
├── views/                # Vue.js views (cleanup target)
│   ├── BudgetActionCenter.vue
│   ├── BudgetPlanner.vue
│   ├── InvestmentDetails.vue
│   └── Zakat.vue
├── lib/                  # Utility libraries (cleanup target)
│   ├── auth.js
│   ├── migration.js
│   └── supabase.js
├── utils/                # Utility functions (cleanup target)
│   └── budgetUtils.js
└── layout/               # Layout components (cleanup target)
    └── AppTopbar.vue

tests/
├── e2e/                  # End-to-end tests
└── supabase/             # Supabase tests
```

**Structure Decision**: Single Vue.js web application with component-based architecture. All source files in `src/` directory are targets for ESLint warning cleanup, with primary focus on components, composables, stores, and views.

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh cursor`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each file with warnings → cleanup task [P]
- Each warning category → category-specific cleanup task
- Each verification step → verification task
- Auto-fix tasks before manual cleanup tasks

**Ordering Strategy**:

- Priority order: unused-vars > prop-validation > security > import > other
- File order: components > composables > stores > views > utilities
- Auto-fix before manual cleanup
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 15-20 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
