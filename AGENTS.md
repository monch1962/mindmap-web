# AGENTS.md - Mind Map Web Application

This file provides essential information for AI agents working on this codebase.

## Project Overview

Mind Map Web Application - An interactive mind mapping tool with a Freemind-style workflow. Users create nodes quickly via keyboard shortcuts, then reorganize via drag-and-drop. Supports import/export in multiple formats.

## Development Commands

### Essential Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build locally
npm run preview
```

### Testing Commands

```bash
# Run tests in watch mode (TDD)
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run a single test file
npx vitest run src/path/to/test.test.ts

# Run tests matching a pattern
npx vitest run -t "test name pattern"
```

### Git Hooks & Code Quality

```bash
# Pre-commit hooks run automatically via husky
git commit  # Runs lint-staged automatically

# Manually run lint-staged
npx lint-staged

# Format code with Prettier
npx prettier --write .
```

## Tech Stack

- **Framework**: React 19.2 with TypeScript
- **Build Tool**: Vite 7.2
- **Canvas/Diagram**: React Flow 11.11.4
- **Testing**: Vitest with React Testing Library and jsdom
- **Linting**: ESLint 9.39.1 (flat config format)
- **Formatting**: Prettier 3.7.4
- **Type Checking**: TypeScript 5.9.3

## Code Style Guidelines

### TypeScript Configuration

- Strict mode enabled (`strict: true`)
- No unused locals/parameters enforced
- Verbatim module syntax enabled
- ES2022 target with ESNext modules
- React JSX transform

### Import Organization

```typescript
// External dependencies first
import React from 'react'
import { Node, Edge } from 'reactflow'

// Internal imports grouped by type
import type { MindMapTree } from '../types'
import { parseJSON } from '../utils/formats/jsonFormat'

// CSS imports last
import './styles.css'
```

### Naming Conventions

- **Types/Interfaces**: PascalCase (`MindMapNode`, `FileAttachment`)
- **Variables/Functions**: camelCase (`parseJSON`, `selectedNodeId`)
- **Constants**: UPPER_SNAKE_CASE (`EXPORT_FORMATS`, `DEFAULT_THEME`)
- **Test files**: `.test.ts` or `.test.tsx` suffix
- **Component files**: PascalCase (`MindMapCanvas.tsx`)

### Type Definitions

- Use TypeScript interfaces for data structures
- Export types from `src/types.ts`
- Use `type` keyword for type aliases
- Avoid `any` type; use `unknown` or specific types
- Use `import type` for type-only imports

### Error Handling

```typescript
// Use try-catch for operations that can fail
try {
  const data = JSON.parse(jsonString)
  return data as MindMapTree
} catch (error) {
  throw new Error('Invalid JSON format')
}

// Return result objects for file operations
export interface FileOperationResult {
  success: boolean
  message?: string
  data?: string
}
```

### React Components

- Use functional components with hooks
- Follow React 19 conventions
- Use TypeScript for props
- Export components as default when appropriate
- Use React Flow for canvas components

### Testing Patterns

- Test files live alongside source files (`utils.ts` → `utils.test.ts`)
- Use Vitest with React Testing Library
- Mock browser APIs when needed
- Follow TDD workflow: write test first, then implementation
- Test both success and error cases

### File Structure

```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
│   └── formats/   # Import/export format parsers
├── types.ts       # TypeScript type definitions
└── test/          # Test setup and utilities
```

### Formatting Rules

- 2-space indentation
- Semicolons required
- Single quotes for strings
- Trailing commas in multiline objects/arrays
- Max line length: 80 characters (enforced by Prettier)

### ESLint Configuration

- Flat config format (`eslint.config.js`)
- TypeScript ESLint with recommended rules
- React Hooks plugin
- React Refresh plugin for Vite
- Strict TypeScript rules enabled

## Git Workflow

### Branch Strategy

- **main**: Stable, production-ready code
- **feature/\***: New features (e.g., `feature/svg-export`)
- **bugfix/\***: Bug fixes (e.g., `bugfix/drag-drop-issue`)
- **refactor/\***: Code refactoring

### Commit Guidelines

- Use clear, descriptive commit messages
- Examples: "Add SVG export functionality", "Fix keyboard shortcut conflict"
- Run tests before committing (`npm run test:run`)
- Ensure linting passes (`npm run lint`)

### Pre-commit Hooks

- ESLint runs on TypeScript files
- Prettier formats code automatically
- No tests run automatically (run manually before commit)

## Project-Specific Patterns

### Mind Map Data Structure

- Internal format: JSON tree structure (`MindMapTree`)
- Nodes have `id`, `content`, `children[]`, `position`, `style`
- Support for FreeMind-style attributes: `icon`, `link`, `cloud`, `edgeStyle`
- Metadata system for extensibility

### Import/Export Formats

- **JSON**: Internal editable format
- **FreeMind (.mm)**: XML-based, widely compatible
- **OPML**: Outline Processor Markup Language
- **Markdown**: Simple, human-editable text
- **D2**: Declarative Diagramming format
- **SVG/PNG/PDF**: Visual exports

### Keyboard Shortcuts (Freemind-style)

- `Enter`: Create sibling node
- `Insert`/`Tab`: Create child node
- `Delete`/`Backspace`: Remove node
- Arrow keys: Navigate between nodes
- `F2`: Edit node content
- Space/Ctrl+Space: Toggle collapse/expand

## Agent Instructions

### Before Making Changes

1. Run existing tests: `npm run test:run`
2. Check linting: `npm run lint`
3. Understand the existing code patterns

### After Making Changes

1. Run tests: `npm run test:run`
2. Fix any linting issues: `npm run lint`
3. Ensure TypeScript compiles: `npm run build`

### When Adding New Features

1. Write tests first (TDD)
2. Follow existing patterns in similar files
3. Update type definitions in `src/types.ts` if needed
4. Add format parsers to `src/utils/formats/` for new import/export formats

### When Fixing Bugs

1. Create a failing test that reproduces the bug
2. Fix the bug
3. Verify the test passes
4. Ensure no regression in other tests

### Code Review Checklist

- [ ] Tests pass
- [ ] Linting passes
- [ ] TypeScript compiles
- [ ] Follows existing patterns
- [ ] No console.log statements in production code
- [ ] Error handling for edge cases
- [ ] Accessibility considerations
- [ ] Performance implications considered
