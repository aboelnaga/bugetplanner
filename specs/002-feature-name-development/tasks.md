# Tasks: Development Guidelines for Solo Development

**Input**: Design documents from `/specs/002-feature-name-development/`
**Prerequisites**: plan.md (required), spec.md
**Tech Stack**: Vue.js 3, PrimeVue, Tailwind CSS, Supabase, TypeScript (preferred), Pinia, Chart.js

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Extract: tech stack, libraries, structure ✓
2. Load optional design documents:
   → spec.md: Extract requirements and constraints ✓
3. Generate tasks by category:
   → Setup: file analysis, pattern research
   → Tests: validation tests for extracted guidelines
   → Core: extraction and analysis tasks
   → Integration: consolidation and updates
   → Polish: validation and testing
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Research before extraction
5. Number tasks sequentially (T001, T030...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All source files analyzed?
   → All patterns extracted?
   → All files updated?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Source files**: `src/`, `.cursorrules`, `.specify/memory/constitution.md`
- **Output files**: Updated `.cursorrules`, `.specify/memory/constitution.md`, consolidated reference
- **Analysis files**: `specs/002-feature-name-development/` for documentation

## Phase 3.1: Setup & Research
- [ ] T001 [P] Analyze .cursorrules file and extract existing Cursor rules
- [ ] T002 [P] Analyze .specify/memory/constitution.md and extract current principles
- [ ] T003 [P] Analyze package.json and extract dependency information and usage patterns
- [ ] T004 [P] Research Vue.js 3 Composition API patterns in existing components
- [ ] T005 [P] Research PrimeVue component usage patterns across the codebase
- [ ] T006 [P] Research Tailwind CSS usage patterns and utility classes
- [ ] T007 [P] Research Supabase integration patterns and real-time subscriptions
- [ ] T008 [P] Research Pinia store patterns and state management approaches
- [ ] T009 [P] Research error handling patterns from existing try-catch blocks
- [ ] T010 [P] Research testing patterns from existing test files

## Phase 3.2: Core Extraction (ONLY after research complete)
- [ ] T011 [P] Extract PrimeVue component usage patterns from existing components
- [ ] T012 [P] Extract Vue.js composition patterns from composables and stores
- [ ] T013 [P] Extract Supabase integration patterns from lib/supabase.js
- [ ] T014 [P] Extract state management patterns from Pinia stores
- [ ] T015 [P] Extract error handling patterns from existing try-catch blocks
- [ ] T016 [P] Extract testing patterns from existing test files
- [ ] T017 [P] Extract Islamic finance compliance patterns from Zakat implementations
- [ ] T018 [P] Extract Chart.js usage patterns from existing charts
- [ ] T019 [P] Extract TypeScript usage patterns from existing files
- [ ] T020 [P] Extract routing and navigation patterns

## Phase 3.3: Pattern Analysis (ONLY after extraction complete)
- [ ] T021 [P] Analyze component composition patterns from Vue components
- [ ] T022 [P] Extract real-time subscription patterns from Supabase channels
- [ ] T023 [P] Analyze error handling and user feedback patterns
- [ ] T024 [P] Analyze authentication and authorization patterns
- [ ] T025 [P] Analyze data validation and form handling patterns

## Phase 3.4: Consolidation (ONLY after analysis complete)
- [ ] T026 Update .cursorrules file with extracted rules and new pragmatic solo development rules
- [ ] T027 Update .specify/memory/constitution.md with extracted principles from codebase
- [ ] T028 Add new pragmatic solo development guidelines not found in current codebase
- [ ] T029 Create consolidated reference document for AI and human consumption
- [ ] T030 Validate completeness and consistency of all updated guidelines

## Dependencies
- Research tasks (T001-T010) can run in parallel
- Extraction tasks (T011-T020) depend on research completion
- Analysis tasks (T021-T025) depend on extraction completion
- Consolidation tasks (T026-T030) depend on analysis completion
- T026 and T027 can run in parallel (different files)
- T028 depends on T026 and T027 completion
- T029 depends on T028 completion
- T030 depends on T029 completion

## Parallel Execution Examples

### Phase 3.1: Research (T001-T010) - All can run in parallel
```bash
# Launch all research tasks together:
Task: "Analyze .cursorrules file and extract existing Cursor rules"
Task: "Analyze .specify/memory/constitution.md and extract current principles"
Task: "Analyze package.json and extract dependency information and usage patterns"
Task: "Research Vue.js 3 Composition API patterns in existing components"
Task: "Research PrimeVue component usage patterns across the codebase"
Task: "Research Tailwind CSS usage patterns and utility classes"
Task: "Research Supabase integration patterns and real-time subscriptions"
Task: "Research Pinia store patterns and state management approaches"
Task: "Research error handling patterns from existing try-catch blocks"
Task: "Research testing patterns from existing test files"
```

### Phase 3.2: Extraction (T011-T020) - All can run in parallel
```bash
# Launch all extraction tasks together:
Task: "Extract PrimeVue component usage patterns from existing components"
Task: "Extract Vue.js composition patterns from composables and stores"
Task: "Extract Supabase integration patterns from lib/supabase.js"
Task: "Extract state management patterns from Pinia stores"
Task: "Extract error handling patterns from existing try-catch blocks"
Task: "Extract testing patterns from existing test files"
Task: "Extract Islamic finance compliance patterns from Zakat implementations"
Task: "Extract Chart.js usage patterns from existing charts"
Task: "Extract TypeScript usage patterns from existing files"
Task: "Extract routing and navigation patterns"
```

### Phase 3.3: Analysis (T021-T025) - All can run in parallel
```bash
# Launch all analysis tasks together:
Task: "Analyze component composition patterns from Vue components"
Task: "Extract real-time subscription patterns from Supabase channels"
Task: "Analyze error handling and user feedback patterns"
Task: "Analyze authentication and authorization patterns"
Task: "Analyze data validation and form handling patterns"
```

### Phase 3.4: Consolidation (T026-T030) - Sequential with some parallel
```bash
# T026 and T027 can run in parallel:
Task: "Update .cursorrules file with extracted rules and new pragmatic solo development rules"
Task: "Update .specify/memory/constitution.md with extracted principles from codebase"

# Then T028, T029, T030 sequentially:
Task: "Add new pragmatic solo development guidelines not found in current codebase"
Task: "Create consolidated reference document for AI and human consumption"
Task: "Validate completeness and consistency of all updated guidelines"
```

## File Paths for Each Task

### Research Tasks (T001-T010)
- **T001**: `.cursorrules` → Extract Cursor rules
- **T002**: `.specify/memory/constitution.md` → Extract current principles
- **T003**: `package.json` → Extract dependencies and usage patterns
- **T004**: `src/components/`, `src/views/` → Vue.js 3 Composition API patterns
- **T005**: `src/components/` → PrimeVue component usage patterns
- **T006**: `src/`, `src/assets/` → Tailwind CSS usage patterns
- **T007**: `src/lib/supabase.js`, `src/stores/` → Supabase integration patterns
- **T008**: `src/stores/` → Pinia store patterns
- **T009**: `src/composables/`, `src/stores/` → Error handling patterns
- **T010**: `tests/` → Testing patterns

### Extraction Tasks (T011-T020)
- **T011**: `src/components/` → PrimeVue component patterns
- **T012**: `src/composables/`, `src/stores/` → Vue.js composition patterns
- **T013**: `src/lib/supabase.js` → Supabase integration patterns
- **T014**: `src/stores/` → State management patterns
- **T015**: `src/composables/`, `src/stores/` → Error handling patterns
- **T016**: `tests/` → Testing patterns
- **T017**: `src/composables/useIslamicLawCompliance.js`, `src/views/Zakat.vue` → Islamic finance patterns
- **T018**: `src/components/` → Chart.js usage patterns
- **T019**: `src/` → TypeScript usage patterns
- **T020**: `src/router/`, `src/views/` → Routing patterns

### Analysis Tasks (T021-T025)
- **T021**: `src/components/` → Component composition patterns
- **T022**: `src/lib/supabase.js`, `src/stores/` → Real-time subscription patterns
- **T023**: `src/composables/useErrorHandler.js` → Error handling patterns
- **T024**: `src/lib/auth.js`, `src/stores/auth.js` → Authentication patterns
- **T025**: `src/components/` → Data validation patterns

### Consolidation Tasks (T026-T030)
- **T026**: `.cursorrules` → Update with extracted rules and new pragmatic guidelines
- **T027**: `.specify/memory/constitution.md` → Update with extracted principles
- **T028**: `specs/002-feature-name-development/` → Add new pragmatic guidelines
- **T029**: `specs/002-feature-name-development/` → Create consolidated reference
- **T030**: All updated files → Validate completeness and consistency

## Notes
- [P] tasks = different files, no dependencies
- Research must complete before extraction
- Extraction must complete before analysis
- Analysis must complete before consolidation
- T026 and T027 can run in parallel (different files)
- Commit after each major phase
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Plan.md**:
   - Each research area → research task [P]
   - Each extraction area → extraction task [P]
   - Each analysis area → analysis task [P]

2. **From Spec.md**:
   - Each requirement → validation task
   - Each constraint → compliance check

3. **Ordering**:
   - Research → Extraction → Analysis → Consolidation
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] All source files analyzed (T001-T010)
- [ ] All patterns extracted (T011-T020)
- [ ] All patterns analyzed (T021-T025)
- [ ] All files updated (T026-T030)
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task
- [ ] Dependencies properly ordered
- [ ] Consolidated reference document created
- [ ] AI assistance tested with updated guidelines
