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
As a developer working on the Budgrt budget planning application, I want a consolidated set of development guidelines that combines Cursor rules, Spec Kit constitution principles, and codebase patterns so that I can develop features consistently and maintain code quality.

### Acceptance Scenarios
1. **Given** a developer starting work on a new feature, **When** they reference the consolidated guidelines, **Then** they understand the project's architectural patterns and coding standards
2. **Given** a developer implementing Islamic finance features, **When** they follow the guidelines, **Then** their code complies with Sharia law requirements
3. **Given** a developer working with Supabase, **When** they follow the guidelines, **Then** they use proper MCP integration and RLS policies
4. **Given** a developer creating Vue.js components, **When** they follow the guidelines, **Then** they use Composition API patterns and proper TypeScript types

### Edge Cases
- What happens when guidelines conflict with each other?
- How does the system handle updates to guidelines when the codebase evolves?
- How are guidelines enforced during code review?

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST provide practical development guidelines optimized for solo development and fast iteration
- **FR-002**: System MUST prioritize PrimeVue components and PrimeIcons over custom styling when possible
- **FR-003**: System MUST include Vue.js 3 Composition API patterns as preferred approach (not mandatory)
- **FR-004**: System MUST include Supabase integration patterns with practical error handling
- **FR-005**: System MUST include Islamic finance compliance requirements for Zakat and Hawl calculations
- **FR-006**: System MUST include TypeScript usage as preferred (not mandatory) for better development experience
- **FR-007**: System MUST include practical error handling patterns that don't slow down development
- **FR-008**: System MUST include real-time subscription patterns for Supabase integration
- **FR-009**: System MUST include component patterns that promote reusability without over-engineering
- **FR-010**: System MUST include state management patterns using Pinia stores
- **FR-011**: System MUST include package documentation references for quick lookup
- **FR-012**: System MUST include guidelines for when to add new dependencies vs using existing ones

*Example of marking unclear requirements:*
- **FR-013**: System MUST provide guidelines for [NEEDS CLARIFICATION: testing approach - should we focus on manual testing or gradually add automated tests?]
- **FR-014**: System MUST include [NEEDS CLARIFICATION: performance optimization - when to optimize vs when to ship fast?]

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

### Cursor Rules (from .cursorrules)
- **Project Context**: Vue.js budget planning application with Supabase integration
- **MCP Configuration**: Use Supabase MCP for database schema, API integration, and authentication
- **Development Guidelines**: Follow Vue.js best practices, use TypeScript, implement proper error handling
- **Database Requirements**: Users table, budget items, monthly amounts, budget history, RLS policies
- **API Integration**: Replace localStorage with Supabase, implement real-time updates, handle offline scenarios

### Spec Kit Constitution Principles (Adapted for Solo Development)
- **Islamic Finance Compliance**: All calculations must comply with Sharia law (NON-NEGOTIABLE)
- **Vue.js Best Practices**: Prefer Composition API, TypeScript when beneficial, focus on maintainable code
- **Supabase Integration**: Use Supabase MCP, implement RLS policies, replace localStorage gradually
- **Pragmatic Testing**: Focus on manual testing and critical path validation, add automated tests incrementally
- **User Experience Excellence**: Intuitive interfaces, clear financial data visualization, fast development cycles

### Codebase Patterns (from analysis)
- **Store Pattern**: Pinia stores with Composition API (useAuthStore, useBudgetCalculations)
- **Composable Pattern**: Reusable logic in composables (useBudgetCalculations, useIslamicLawCompliance)
- **API Layer**: Centralized Supabase operations in lib/supabase.js
- **Component Structure**: Vue 3 SFC with script setup, template, and scoped styles
- **Error Handling**: Try-catch blocks with practical error state management
- **Real-time Subscriptions**: Supabase channels for live updates
- **TypeScript Integration**: Type safety when beneficial, not mandatory for rapid development
- **UI Components**: PrimeVue components with Tailwind CSS classes for customization

### Technology Stack
- **Frontend**: Vue.js 3, TypeScript (preferred), PrimeVue (primary UI), Tailwind CSS, Chart.js
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Build Tools**: Vite, PostCSS, Sass
- **Testing**: Playwright for E2E testing (when needed), manual testing for rapid development
- **Development**: ESLint, Vue TSC, Auto-import resolver
- **UI Components**: PrimeVue components and PrimeIcons (preferred over custom styling)
- **Styling**: Tailwind CSS classes (preferred over custom CSS)

### Islamic Finance Specific
- **Zakat Calculations**: 2.5% (1/40) calculation with proper Hawl management
- **Lunar Calendar**: Hijri date integration with moment-hijri
- **Nisab Thresholds**: Gold/silver price-based calculations
- **Hawl Management**: Lunar year tracking for Zakat obligations
- **Compliance Validation**: Islamic law adherence in all financial calculations

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

### Practical Development Guidelines
- **UI Components**: Always check PrimeVue first before creating custom components
- **Styling**: Use Tailwind CSS classes, avoid custom CSS unless absolutely necessary
- **Icons**: Use PrimeIcons, avoid adding new icon libraries
- **Testing**: Manual testing for rapid development, add automated tests for critical features
- **TypeScript**: Use when it helps, don't force it for simple features
- **Error Handling**: Keep it simple, don't over-engineer error states
- **Performance**: Optimize when you notice issues, not preemptively
- **Dependencies**: Prefer existing packages over adding new ones
