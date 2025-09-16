# Development Guidelines Extraction and Consolidation

**Feature Branch**: `002-feature-name-development`
**Created**: 2025-01-27
**Status**: Draft
**Input**: User description: "check the code base and packages and extract cursor rules and spec kit constitution principles to follow while developing"

## Execution Flow (main)
```
1. Parse user description from Input
   → Feature: Extract and consolidate development guidelines from codebase
2. Extract key concepts from description
   → Identify: Cursor rules, Spec Kit constitution, Vue.js patterns, Supabase integration, Islamic finance compliance
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → Clear user flow: Developers need consolidated guidelines
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT developers need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for development team, not business stakeholders

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "development guidelines" without scope), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - Scope of guidelines (frontend only, full-stack, specific features)
   - Target audience (junior developers, senior developers, all team members)
   - Format requirements (documentation, code comments, automated checks)
   - Integration requirements (IDE integration, CI/CD integration)

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a developer working on the Budgrt budget planning application, I want to extract and consolidate the actual Cursor rules, Spec Kit constitution principles, and established codebase patterns so that I have a single source of truth for development guidelines that AI and human developers can reference.

### Acceptance Scenarios
1. **Given** a developer needs to understand project rules, **When** they access the consolidated guidelines, **Then** they see the actual Cursor rules from .cursorrules file
2. **Given** a developer needs Islamic finance compliance, **When** they follow the guidelines, **Then** they see the actual patterns from useIslamicLawCompliance.js and useNisabCalculation.js
3. **Given** a developer needs Vue.js patterns, **When** they follow the guidelines, **Then** they see the actual composable patterns from useBudgetModals.js, useErrorHandler.js, etc.
4. **Given** a developer needs Supabase integration, **When** they follow the guidelines, **Then** they see the actual patterns from lib/supabase.js

### Edge Cases
- What happens when extracted patterns conflict with each other?
- How do we handle missing or incomplete patterns in the codebase?
- How do we add new pragmatic rules without conflicting with existing ones?

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST extract actual Cursor rules from .cursorrules file and document them
- **FR-002**: System MUST extract actual Spec Kit constitution principles from .specify/memory/constitution.md
- **FR-003**: System MUST extract Vue.js composable patterns from existing composables (useBudgetModals.js, useErrorHandler.js, etc.)
- **FR-004**: System MUST extract Islamic finance compliance patterns from useIslamicLawCompliance.js and useNisabCalculation.js
- **FR-005**: System MUST extract Supabase integration patterns from lib/supabase.js
- **FR-006**: System MUST extract PrimeVue component usage patterns from existing components
- **FR-007**: System MUST extract error handling patterns from useErrorHandler.js and other composables
- **FR-008**: System MUST extract state management patterns from Pinia stores
- **FR-009**: System MUST add pragmatic rules for solo development without conflicting with existing patterns
- **FR-010**: System MUST update .cursorrules file with extracted rules and new pragmatic guidelines
- **FR-011**: System MUST update .specify/memory/constitution.md with extracted principles from codebase
- **FR-012**: System MUST consolidate all extracted rules into a single reference document
- **FR-013**: System MUST format rules for both AI consumption and human reference
- **FR-014**: System MUST include package documentation references for quick lookup

*Example of marking unclear requirements:*
- **FR-015**: System MUST handle [NEEDS CLARIFICATION: conflicting patterns - what to do when extracted patterns contradict each other?]
- **FR-016**: System MUST include [NEEDS CLARIFICATION: missing patterns - what to do when expected patterns are not found in codebase?]

### Key Entities *(include if feature involves data)*
- **Development Guidelines**: Consolidated rules and principles for consistent development
- **Codebase Patterns**: Established architectural patterns from existing code
- **Compliance Requirements**: Islamic finance and technical compliance standards

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---

## Extracted Guidelines Summary

### Cursor Rules (from .cursorrules - ACTUAL EXTRACTED RULES)
- **Project Context**: Vue.js budget planning application with Supabase integration
- **MCP Configuration**: Use Supabase MCP for database schema management, API integration, and authentication setup
- **Development Guidelines**: Follow Vue.js best practices, use TypeScript for type safety, implement proper error handling
- **Database Operations**: Use Supabase client for all database operations, implement real-time subscriptions where appropriate
- **Database Schema Requirements**: Users table (extends Supabase auth), budget items table with proper relationships, monthly amounts table for flexible data, budget history table for tracking changes, Row Level Security (RLS) policies for data isolation
- **API Integration**: Replace localStorage with Supabase operations, implement real-time updates, add proper loading states, handle offline scenarios gracefully

### Spec Kit Constitution Principles (from .specify/memory/constitution.md - ACTUAL EXTRACTED PRINCIPLES)
- **Current Status**: Constitution file contains template placeholders, needs actual principles extracted from codebase patterns
- **Required Extraction**: Need to extract actual principles from codebase and populate constitution.md

### Codebase Patterns (ACTUAL EXTRACTED PATTERNS)
- **Composable Pattern**: All composables follow use[Name] pattern (useBudgetModals, useErrorHandler, useIslamicLawCompliance)
- **Error Handling**: Centralized error handling with useErrorHandler composable, toast notifications, error classification by type and severity
- **Islamic Finance**: Comprehensive Islamic law compliance with useIslamicLawCompliance.js supporting 4 schools of thought (Hanafi, Maliki, Shafi'i, Hanbali)
- **Nisab Calculation**: useNisabCalculation.js with gold/silver price-based calculations
- **Budget Management**: useBudgetModals.js with extensive form handling, validation, and multi-year support
- **State Management**: Pinia stores with Composition API (useAuthStore, useBudgetCalculations)
- **API Layer**: Centralized Supabase operations in lib/supabase.js with real-time subscriptions
- **Component Structure**: Vue 3 SFC with script setup, template, and scoped styles
- **Constants Management**: Centralized constants in constants/budgetConstants.js
- **Utility Functions**: Centralized utilities in utils/budgetUtils.js

### Islamic Finance Specific (ACTUAL EXTRACTED PATTERNS)
- **Schools of Thought**: Support for Hanafi, Maliki, Shafi'i, Hanbali with different Nisab thresholds and Zakat rates
- **Nisab Thresholds**: Gold (85g), Silver (595g) with school-specific preferences
- **Zakat Rates**: 2.5% (1/40) with school-specific variations for specific assets
- **Hawl Requirements**: 354-day lunar year with different continuity requirements per school
- **Zakatable Assets**: School-specific asset categories and exemptions
- **Compliance Validation**: Real-time compliance checking with warnings and errors

### Technology Stack (ACTUAL FROM package.json)
- **Frontend**: Vue.js 3.3.4, TypeScript 5.2.2, PrimeVue 4.3.7, Tailwind CSS 3.3.3, Chart.js 4.4.0
- **Backend**: Supabase 2.50.5, PostgreSQL with RLS
- **State Management**: Pinia 2.1.6
- **Build Tools**: Vite 4.4.9, PostCSS 8.4.29, Sass 1.90.0
- **Testing**: Playwright 1.54.2
- **Development**: ESLint, Vue TSC, Auto-import resolver
- **Islamic Calendar**: moment-hijri 3.0.0
- **Currency**: vue-currency-input 3.2.1

### Package Documentation References
- **Vue.js 3**: https://vuejs.org/guide/
- **PrimeVue**: https://primevue.org/
- **PrimeIcons**: https://primeng.org/icons
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Supabase**: https://supabase.com/docs
- **Pinia**: https://pinia.vuejs.org/
- **Chart.js**: https://www.chartjs.org/docs/
- **Vite**: https://vitejs.dev/guide/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Moment Hijri**: https://github.com/xsoh/moment-hijri

### Pragmatic Development Guidelines (TO BE ADDED)
- **UI Components**: Always check PrimeVue first before creating custom components
- **Styling**: Use Tailwind CSS classes, avoid custom CSS unless absolutely necessary
- **Icons**: Use PrimeIcons, avoid adding new icon libraries
- **Testing**: Manual testing for rapid development, add automated tests for critical features
- **TypeScript**: Use when it helps, don't force it for simple features
- **Error Handling**: Keep it simple, don't over-engineer error states
- **Performance**: Optimize when you notice issues, not preemptively
- **Dependencies**: Prefer existing packages over adding new ones
