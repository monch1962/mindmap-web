# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mind Map Web Application - An interactive mind mapping tool with a Freemind-style workflow. Users create nodes quickly via keyboard shortcuts, then reorganize via drag-and-drop. Supports import/export in multiple formats.

## Development Commands

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

# Run tests in watch mode (TDD)
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## TDD Workflow

This project uses **Test-Driven Development**. When adding new features:

1. **Write the test first** - Create a test file in `src/` alongside the source file (e.g., `utils.ts` → `utils.test.ts`)
2. **Run the test** - It should fail (red)
3. **Implement the feature** - Write minimum code to pass the test
4. **Run the test again** - It should pass (green)
5. **Refactor** - Clean up the code while keeping tests green
6. **Repeat** - Add more tests for edge cases

**Testing Framework**: Vitest with React Testing Library and jsdom

**Test Files**: Use `.test.ts` or `.test.tsx` suffix for test files

## Git Branching Strategy

Use **feature branches** for all functionality changes:

1. **main** - Stable, production-ready code
2. **feature/*** - New features (e.g., `feature/svg-export`, `feature/keyboard-shortcuts`)
3. **bugfix/* ** - Bug fixes (e.g., `bugfix/drag-drop-issue`)
4. **refactor/* ** - Code refactoring (e.g., `refactor/state-management`)

**Workflow**:
```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes and commit frequently
git add .
git commit -m "Describe your changes"

# Run tests before committing
npm run test:run

# After completing the feature, merge to main
git checkout main
git merge feature/your-feature-name
git branch -d feature/your-feature-name
```

**Commit Message Format**:
- Use clear, descriptive messages
- Examples: "Add SVG export functionality", "Fix keyboard shortcut conflict", "Refactor metadata panel"

## Tech Stack

- **Framework**: React 19.2 with TypeScript
- **Build Tool**: Vite 7.2
- **Canvas/Diagram**: React Flow (for node graph visualization and interaction)
- **Linting**: ESLint with React-specific plugins

## Format Strategy

**Internal Editable Format: JSON**
```json
{
  "id": "root",
  "content": "Central Topic",
  "children": [
    { "id": "1", "content": "Branch 1", "children": [] },
    { "id": "2", "content": "Branch 2", "children": [] }
  ],
  "position": { "x": 400, "y": 300 },
  "collapsed": false,
  "style": { "color": "#ff0000", "fontSize": 16 }
}
```

**Import/Export Formats:**
- **FreeMind (.mm)** - XML-based, widely compatible with mind map tools
- **OPML** - Outline Processor Markup Language, for outline tools
- **Markdown/indented text** - Simple, human-editable text format
- **D2** - Declarative Diagramming format (export only)
- **SVG/PNG** - Visual export
- **PDF** - For sharing

## User Workflow (Freemind-style)

1. **Keyboard Capture Phase** - Rapid content entry:
   - `Enter` - Create sibling node
   - `Insert` or `Tab` - Create child node
   - `Delete` or `Backspace` - Remove node
   - Arrow keys - Navigate between nodes
   - `F2` - Edit node content
   - Space/Ctrl+Space - Toggle collapse/expand

2. **Drag-and-Drop Phase** - Reorganize spatially:
   - Drag nodes to reorganize hierarchy
   - Support both auto-layout and manual positioning
   - Visual feedback during drag operations

## Project Structure

- `src/App.tsx` - Main application component
- `src/main.tsx` - Application entry point
- `src/index.css` - Global styles
- `src/components/` - React components (MindMapCanvas, MindMapNode, MetadataPanel)
- `src/types.ts` - TypeScript type definitions
- `src/utils/` - Utility functions (converters, format parsers)
- `src/test/` - Test setup and utilities
- `vite.config.ts` - Vite configuration (React plugin enabled)
- `vitest.config.ts` - Vitest testing configuration

## Architecture Notes

- TypeScript configuration split across `tsconfig.json`, `tsconfig.app.json`, and `tsconfig.node.json`
- ESLint configured in flat config format (`eslint.config.js`)
- React Flow will handle the canvas, node rendering, and drag-drop interactions
- State management should handle the tree structure, keyboard shortcuts, and import/export logic
- Consider using React Context, Zustand, or Jotai for state (to be determined)
- Format parsers/converter will be needed for each import/export format
