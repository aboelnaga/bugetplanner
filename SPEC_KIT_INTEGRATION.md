# Spec Kit Integration for Budgrt

## Overview
This project now includes [Spec Kit](https://github.com/github/spec-kit) for Spec-Driven Development, enabling structured feature development with AI assistance.

## What is Spec Kit?
Spec Kit is a toolkit that helps you build high-quality software faster through Spec-Driven Development. It provides:
- Structured templates for feature specifications
- AI-assisted development workflows
- Integration with Claude Code for automated implementation
- Consistent development processes

## Project Structure
```
budgrt/
├── .specify/                    # Spec Kit configuration
│   ├── memory/
│   │   ├── constitution.md      # Project constitution (customized for Budgrt)
│   │   └── constitution_update_checklist.md
│   ├── scripts/                 # Automation scripts
│   └── templates/               # Spec templates
├── .cursor/                     # Cursor integration
│   └── commands/                # Custom commands for Cursor
├── specs/                       # Feature specifications
│   └── 001-feature-name-zakat/  # Example: Zakat Hawl continuity fix
└── SPEC_KIT_INTEGRATION.md      # This file
```

## Constitution
The project constitution (`.specify/memory/constitution.md`) defines our core principles:
1. **Islamic Finance Compliance** - All calculations must follow Sharia law
2. **Vue.js Best Practices** - Use Composition API and TypeScript
3. **Supabase Integration** - Use Supabase MCP for all database operations
4. **Test-First Development** - TDD mandatory for all features
5. **User Experience Excellence** - Intuitive interfaces and clear financial data

## Using Spec Kit with Cursor

### 1. Creating New Features
Use the `/specify` command in Cursor to create new feature specifications:

```
/specify Create a new investment tracking feature with real-time portfolio updates
```

This will:
- Create a new feature branch
- Generate a specification document
- Set up the development structure

### 2. Planning Implementation
Use the `/plan` command to create implementation plans:

```
/plan Generate implementation plan for the investment tracking feature using Vue.js, Supabase, and Chart.js
```

### 3. Generating Tasks
Use the `/tasks` command to break down implementation into specific tasks:

```
/tasks Create detailed tasks for implementing the investment tracking feature
```

## Available Commands

### Cursor Commands
- `/specify` - Create feature specifications
- `/plan` - Generate implementation plans
- `/tasks` - Create detailed task lists

### Spec Kit Scripts
- `create-new-feature.sh` - Create new feature branches and specs
- `setup-plan.sh` - Set up implementation plans
- `check-task-prerequisites.sh` - Validate task requirements

## Example Workflow

### 1. Feature Specification
```bash
# Create a new feature
./.specify/scripts/bash/create-new-feature.sh --json '{"feature_name": "budget-forecasting", "description": "Add 12-month budget forecasting with trend analysis"}'
```

### 2. Implementation Planning
```bash
# Set up implementation plan
./.specify/scripts/bash/setup-plan.sh
```

### 3. Development
Use Claude Code with the generated specifications to implement features following the constitution principles.

## Integration with Existing Project

### Vue.js Integration
- All new components must follow Vue.js 3 Composition API patterns
- Use TypeScript for type safety
- Follow the existing component structure in `src/components/`

### Supabase Integration
- Use Supabase MCP for all database operations
- Implement proper RLS policies
- Replace localStorage with Supabase where appropriate

### Islamic Finance Features
- All financial calculations must comply with Islamic law
- Use existing composables in `src/composables/` for Zakat and Hawl calculations
- Follow the established patterns for Islamic calendar integration

## Best Practices

### 1. Specification Quality
- Write clear, testable requirements
- Focus on user value, not implementation details
- Mark ambiguities with `[NEEDS CLARIFICATION]`

### 2. Development Process
- Follow TDD: Write tests first
- Ensure Islamic finance compliance
- Use existing project patterns and conventions

### 3. Code Review
- Verify compliance with constitution
- Check Islamic finance accuracy
- Ensure proper Supabase integration

## Troubleshooting

### Common Issues
1. **Scripts not executable**: Run `chmod +x .specify/scripts/bash/*.sh`
2. **Git branch issues**: Ensure you're in a clean working directory
3. **Template not found**: Verify `.specify/templates/` directory exists

### Getting Help
- Check the [Spec Kit documentation](https://github.com/github/spec-kit)
- Review the constitution for project-specific guidelines
- Use Cursor's built-in help and AI assistance

## Next Steps

1. **Review the Constitution**: Understand the project principles
2. **Try a Simple Feature**: Create a small feature specification
3. **Integrate with Development**: Use Spec Kit for your next major feature
4. **Customize Templates**: Adapt templates for your specific needs

## Example: Zakat Hawl Continuity Fix

A complete example specification has been created at `specs/001-feature-name-zakat/spec.md` demonstrating:
- Proper Islamic finance compliance requirements
- Clear user stories and acceptance criteria
- Technical requirements aligned with project stack
- Implementation phases and testing strategy

This serves as a template for future feature specifications in the Budgrt project.
