# Budgrt Constitution
<!-- Budget Planning Application with Islamic Finance Integration -->

## Core Principles

### I. Islamic Finance Compliance (NON-NEGOTIABLE)
All financial calculations must comply with Islamic law (Sharia). Zakat calculations must follow proper Hawl (lunar year) requirements, Nisab thresholds, and Islamic jurisprudence. No interest-based calculations or prohibited financial instruments.

### II. Vue.js Best Practices
Follow Vue.js 3 Composition API patterns, use TypeScript for type safety, implement proper component composition, and maintain clean separation of concerns. All components must be reusable and well-documented.

### III. Supabase Integration
Use Supabase MCP for all database operations, authentication, and real-time features. Implement proper Row Level Security (RLS) policies for data isolation. Replace localStorage with Supabase operations where appropriate.

### IV. Pragmatic Development (SOLO-FOCUSED)
Focus on rapid prototyping and fast iteration. Manual testing preferred, automated tests for critical features only. Use existing patterns, avoid reinventing the wheel. Keep documentation minimal but useful.

### V. User Experience Excellence
Prioritize intuitive interfaces, clear financial data visualization, and seamless user workflows. All financial calculations must be transparent and auditable. Provide helpful guidance for Islamic finance concepts.

## Technology Stack Requirements

### Frontend
- Vue.js 3 with Composition API
- PrimeVue for UI components (extensive component set)
- PrimeIcons for all icon needs
- Tailwind CSS for styling (utility-first approach)
- Chart.js for financial visualizations

### Backend & Database
- Supabase for backend services
- PostgreSQL with proper RLS policies
- Real-time subscriptions for live updates
- Supabase MCP for all database operations

### Islamic Finance Features
- Lunar calendar integration (Hijri dates)
- Hawl (lunar year) management
- Nisab threshold calculations
- Zakat calculation engine
- Islamic law compliance validation

## Development Workflow

### Solo Development Best Practices
- **Rapid Prototyping**: Build MVP first, iterate quickly
- **Manual Testing**: Test in browser, add automated tests later
- **Code Reuse**: Leverage existing patterns, don't reinvent
- **Documentation**: Keep it minimal but useful
- **Dependencies**: Minimize new packages, use existing ones

### PrimeVue Component Strategy
- **Form Components**: InputText, Dropdown, Calendar, Checkbox, RadioButton
- **Data Display**: DataTable, Card, Panel, Accordion
- **Navigation**: Menu, TabView, Breadcrumb, Paginator
- **Overlay**: Dialog, Sidebar, Tooltip, Toast
- **Layout**: Divider, Splitter, ScrollPanel
- **Icons**: PrimeIcons for all icon needs

### Code Review Requirements
- All changes must verify Islamic finance compliance
- Supabase integration must be tested
- Financial calculations must be validated
- User experience must be reviewed
- PrimeVue components must be used when available

### Quality Gates
- All financial calculations must have manual testing
- Zakat calculations must be verified against Islamic law
- Supabase operations must be properly secured
- Performance must be optimized for financial data
- Components must be reusable and well-documented

## Governance

Constitution supersedes all other practices. Amendments require documentation, approval, and migration plan. All development must verify compliance. Complexity must be justified with clear Islamic finance or technical requirements.

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27