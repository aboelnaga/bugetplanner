# Data Model: Fix npm run lint warnings mainly the unused variables

**Feature**: 006-fix-npm-run  
**Date**: 2024-12-19  
**Status**: Complete

## Entities

### ESLintWarning

**Purpose**: Represents a single ESLint warning that needs to be addressed

**Fields**:

- `filePath`: String - Path to the file containing the warning
- `lineNumber`: Number - Line number where warning occurs
- `ruleName`: String - ESLint rule that triggered the warning
- `message`: String - Human-readable warning message
- `severity`: String - Warning level (warning/error)
- `category`: String - Type of warning (unused-vars, prop-validation, security, etc.)
- `fixable`: Boolean - Whether warning can be auto-fixed
- `status`: String - Current status (pending, in-progress, fixed, verified)

**Validation Rules**:

- filePath must be valid file path
- lineNumber must be positive integer
- ruleName must be valid ESLint rule
- category must be one of: unused-vars, prop-validation, security, import, other
- status must be one of: pending, in-progress, fixed, verified

**State Transitions**:

- pending → in-progress (when cleanup starts)
- in-progress → fixed (when warning resolved)
- fixed → verified (when change tested)

### CodeFile

**Purpose**: Represents a source code file that needs ESLint warning cleanup

**Fields**:

- `path`: String - File path relative to project root
- `type`: String - File type (component, composable, store, view, utility, layout)
- `warningCount`: Number - Total number of warnings in file
- `unusedVarsCount`: Number - Number of unused variable warnings
- `propValidationCount`: Number - Number of prop validation warnings
- `securityCount`: Number - Number of security warnings
- `otherCount`: Number - Number of other warnings
- `lastModified`: Date - Last modification timestamp
- `cleanupStatus`: String - Current cleanup status

**Validation Rules**:

- path must be valid file path
- type must be one of: component, composable, store, view, utility, layout
- warningCount must be non-negative integer
- cleanupStatus must be one of: pending, in-progress, complete, verified

**State Transitions**:

- pending → in-progress (when cleanup starts)
- in-progress → complete (when all warnings fixed)
- complete → verified (when changes tested)

### CleanupTask

**Purpose**: Represents a specific cleanup task for a file or group of warnings

**Fields**:

- `id`: String - Unique task identifier
- `filePath`: String - Target file for cleanup
- `warningType`: String - Type of warnings to address
- `priority`: Number - Task priority (1=high, 2=medium, 3=low)
- `estimatedEffort`: String - Estimated time to complete
- `dependencies`: Array<String> - IDs of prerequisite tasks
- `status`: String - Current task status
- `assignedTo`: String - Person or tool assigned to task

**Validation Rules**:

- id must be unique
- filePath must be valid file path
- warningType must be one of: unused-vars, prop-validation, security, import, other
- priority must be 1, 2, or 3
- status must be one of: pending, in-progress, complete, blocked

**State Transitions**:

- pending → in-progress (when work starts)
- in-progress → complete (when task finished)
- in-progress → blocked (when dependency not met)
- blocked → pending (when dependency resolved)

## Relationships

### ESLintWarning → CodeFile

- **Type**: Many-to-One
- **Description**: Each warning belongs to one file
- **Cardinality**: Many warnings can exist in one file

### CodeFile → CleanupTask

- **Type**: One-to-Many
- **Description**: Each file can have multiple cleanup tasks
- **Cardinality**: One file can have multiple tasks

### CleanupTask → CleanupTask

- **Type**: Many-to-Many (self-referencing)
- **Description**: Tasks can have dependencies on other tasks
- **Cardinality**: Tasks can depend on multiple other tasks

## Business Rules

1. **File Processing Order**: Process files by warning count (highest first)
2. **Warning Priority**: unused-vars > prop-validation > security > import > other
3. **Dependency Management**: Files with dependencies must be processed after dependencies
4. **Verification Required**: All changes must be verified with `npm run lint`
5. **Functionality Preservation**: No changes that break existing functionality
6. **Code Quality**: Maintain or improve code readability during cleanup

## Data Integrity

- **File Path Consistency**: All file paths must be relative to project root
- **Warning Count Accuracy**: Warning counts must be updated after each fix
- **Status Synchronization**: Task status must reflect actual progress
- **Dependency Validation**: Circular dependencies are not allowed
- **Change Tracking**: All changes must be tracked and reversible
