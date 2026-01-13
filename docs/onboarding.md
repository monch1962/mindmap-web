# Developer Onboarding Guide

Welcome to the Mind Map Web Application project! This guide will help you get started with contributing to the codebase.

## Table of Contents

- [Project Overview](#project-overview)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Style](#code-style)
- [Common Tasks](#common-tasks)
- [Resources](#resources)
- [Getting Help](#getting-help)

---

## Project Overview

### What is Mind Map Web?

A browser-based mind mapping tool with a focus on speed and simplicity. Users can:

- **Create** mind maps quickly via keyboard shortcuts (Enter, Tab, Insert)
- **Organize** nodes via drag-and-drop
- **Export** to multiple formats (FreeMind, OPML, Markdown, YAML, D2, SVG, PNG)
- **Collaborate** with real-time sync
- **Use AI** to generate mind maps from text prompts

### Key Features

- **Zero-setup**: No backend required, runs entirely in the browser
- **Privacy-focused**: All data stored locally on user's device
- **Offline-first**: Works offline via PWA with IndexedDB storage
- **Mobile-optimized**: Touch gestures, responsive design, PWA installable
- **Keyboard-driven**: Comprehensive shortcuts for power users
- **Format-agnostic**: Import/export in 6+ formats

### Technology Stack

| Technology     | Purpose                 |
| -------------- | ----------------------- |
| React 19.2     | UI framework            |
| TypeScript 5.8 | Type safety             |
| Vite 7.2       | Build tool & dev server |
| React Flow 11  | Canvas & node graph     |
| Vitest         | Testing framework       |
| ESLint         | Linting                 |
| Prettier       | Code formatting         |

---

## Development Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)
- **Git** >= 2.0 ([Download](https://git-scm.com/))
- **Code editor**: VS Code recommended ([Download](https://code.visualstudio.com/))

#### Verify Installations

```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
git --version   # Should be 2.0.0 or higher
```

---

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/mindmap-web.git

# Navigate into the project directory
cd mindmap-web
```

---

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install
```

This will install:

- React and React DOM
- React Flow (canvas library)
- TypeScript
- Vite (build tool)
- Vitest and testing libraries
- ESLint and Prettier

---

### Step 3: Start Development Server

```bash
# Start the development server
npm run dev
```

You should see:

```
  VITE v7.2.0  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Success!** You should see the Mind Map application with a default "Central Topic" node.

---

### Step 4: Verify Setup

```bash
# Run the test suite
npm run test:run

# Expected output:
# ✓ src/hooks/useUndoRedo.test.ts (15 tests)
# ✓ src/utils/formats/freemindFormat.test.ts (22 tests)
# ...
# Test Files: 22 passed, 22 total
# Tests: 358 passed, 64 skipped (see docs for details)
```

```bash
# Run the linter
npm run lint

# Expected output: No errors or warnings
```

If all checks pass, your development environment is ready!

---

## Project Structure

### Directory Layout

```
mindmap-web/
├── docs/                    # Documentation
│   ├── api.md              # API documentation
│   ├── architecture.md     # Architecture overview
│   ├── performance.md      # Performance guide
│   ├── mobile-testing.md   # Mobile testing guide
│   └── onboarding.md       # This file
│
├── public/                  # Static assets
│   ├── manifest.json       # PWA manifest
│   └── icons/              # App icons
│
├── src/
│   ├── components/         # React components
│   │   ├── MindMapCanvas.tsx       # Main canvas (1800+ lines)
│   │   ├── MindMapNode.tsx         # Individual nodes
│   │   ├── MetadataPanel.tsx       # Node metadata
│   │   ├── NotesPanel.tsx          # Rich text notes
│   │   ├── SearchPanel.tsx         # Search & filter
│   │   ├── AIAssistantPanel.tsx    # AI features
│   │   ├── PresentationMode.tsx    # Presentations
│   │   ├── ThreeDView.tsx          # 3D visualization
│   │   └── ...                    # Other components
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useAutoSave.ts         # Auto-save logic
│   │   ├── useUndoRedo.ts         # Undo/redo history
│   │   ├── useKeyboardShortcuts.ts # Keyboard shortcuts
│   │   ├── useKeyboardNavigation.ts # Focus trap for modals
│   │   ├── useFileOperations.ts   # Import/export
│   │   ├── useGestureNavigation.ts # Touch gestures
│   │   └── useOfflineSync.ts      # Offline storage
│   │
│   ├── utils/              # Utility functions
│   │   ├── formats/       # Format converters
│   │   │   ├── freemindFormat.ts    # FreeMind (.mm)
│   │   │   ├── opmlFormat.ts        # OPML
│   │   │   ├── markdownFormat.ts    # Markdown
│   │   │   ├── yamlFormat.ts        # YAML
│   │   │   └── d2Format.ts          # D2
│   │   ├── errorTracking.ts        # Error logging
│   │   ├── accessibility.ts        # ARIA utilities
│   │   └── ...
│   │
│   ├── types.ts            # TypeScript type definitions
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
│
├── .eslintrc.json          # ESLint configuration
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── vitest.config.ts        # Vitest configuration
```

---

### Key Files Explained

#### `/src/types.ts`

**Purpose**: Central type definitions for the entire application

**Key Types**:

```typescript
// Core data structure
interface MindMapTree {
  id: string
  content: string
  children: MindMapTree[]
  position?: { x: number; y: number }
  collapsed?: boolean
  style?: NodeStyle
  metadata?: NodeMetadata
  icon?: string
  cloud?: { color?: string }
}

// Node metadata
interface NodeMetadata {
  url?: string
  description?: string
  notes?: string
  tags?: string[]
  attachments?: FileAttachment[]
  code?: CodeBlock[]
}
```

---

#### `/src/components/MindMapCanvas.tsx`

**Purpose**: Main application component that orchestrates all features

**Size**: 1800+ lines

**Responsibilities**:

- Render React Flow canvas
- Handle keyboard shortcuts
- Manage panel visibility
- Coordinate state updates
- Auto-save functionality

**When to modify**: Adding new features that affect the core canvas

---

#### `/src/components/MindMapNode.tsx`

**Purpose**: Custom React Flow node component

**Responsibilities**:

- Render individual node UI
- Display icons and cloud backgrounds
- Handle node selection
- Show metadata indicators

**When to modify**: Changing how nodes appear or behave

---

#### `/src/hooks/useAutoSave.ts`

**Purpose**: Automatically save mind map data to localStorage

**Usage**:

```tsx
function MindMapCanvas() {
  const [data, setData] = useState(initialData)

  // Auto-save every 30 seconds
  useAutoSave(data, 30000)
}
```

**When to modify**: Changing save interval or storage mechanism

---

#### `/src/utils/formats/`

**Purpose**: Convert between mind map data and various file formats

**Pattern**:

```typescript
// All format converters follow this pattern:
export function parseFormatName(input: string): MindMapTree {
  /* ... */
}
export function generateFormatName(tree: MindMapTree): string {
  /* ... */
}
```

**When to modify**: Adding support for new import/export formats

---

## Development Workflow

### Git Workflow

We use a **feature branch** workflow:

```
main (production)
  ├── feature/new-export-format
  ├── bugfix/drag-drop-issue
  └── refactor/state-management
```

---

### Step 1: Create Feature Branch

```bash
# Ensure you're on main and up to date
git checkout main
git pull origin main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

**Branch naming conventions**:

- `feature/` - New features (e.g., `feature/svg-export`)
- `bugfix/` - Bug fixes (e.g., `bugfix/drag-drop-issue`)
- `refactor/` - Code refactoring (e.g., `refactor/state-management`)
- `docs/` - Documentation changes (e.g., `docs/api-updates`)
- `test/` - Test additions (e.g., `test/add-component-tests`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

---

### Step 2: Make Changes

```bash
# Make your changes
# ... edit files ...

# See what you've changed
git status

# Review changes before staging
git diff
```

---

### Step 3: Test Your Changes

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run linter
npm run lint

# Fix linting errors automatically
npm run lint -- --fix
```

**Never commit code that fails tests or has linting errors!**

---

### Step 4: Commit Changes

```bash
# Stage files for commit
git add .

# Commit with clear message
git commit -m "Add SVG export functionality

- Implement SVG generation from mind map tree
- Add export option to dropdown menu
- Add tests for SVG export
- Update API documentation"

# Good commit message format:
# <type>: <subject>
#
# <type> can be: Add, Fix, Update, Refactor, Docs, Test, Chore
# <subject> should be 50 characters or less
# Add detailed explanation in body if needed
```

**Commit message examples**:

- `Add: PDF export functionality`
- `Fix: Drag drop issue with nested nodes`
- `Update: React Flow to version 11`
- `Refactor: Extract format converters to separate module`
- `Docs: Add API documentation for new features`
- `Test: Add tests for presentation mode`
- `Chore: Update TypeScript to 5.8`

---

### Step 5: Push and Create Pull Request

```bash
# Push your branch to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
# Go to: https://github.com/yourusername/mindmap-web/compare
```

**Pull Request Template**:

```markdown
## Description

Briefly describe what this PR does and why.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests added/updated
- [ ] All tests pass (`npm run test:run`)
- [ ] Linting passes (`npm run lint`)

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings generated
```

---

### Step 6: Code Review and Merge

1. **Wait for code review** - Maintainers will review your PR
2. **Address feedback** - Make requested changes
3. **Approval** - PR approved by maintainer
4. **Merge** - Squash and merge to main
5. **Delete branch** - Clean up after merge

---

## Testing

### Test-Driven Development (TDD)

We follow TDD: **write tests first, then implement**.

#### TDD Workflow

1. **Red** - Write failing test

```bash
npm run test -- --watch
# Test fails (red)
```

2. **Green** - Write minimum code to pass

```typescript
// Implement feature
```

3. **Refactor** - Clean up code while tests stay green

```typescript
// Refactor for clarity
```

---

### Writing Tests

#### Component Tests (React Testing Library)

```typescript
// src/components/MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

#### Hook Tests

```typescript
// src/hooks/useMyHook.test.ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useMyHook } from './useMyHook'

describe('useMyHook', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.value).toBe('default')
  })

  it('should update value on action', () => {
    const { result } = renderHook(() => useMyHook())

    act(() => {
      result.current.update('new value')
    })

    expect(result.current.value).toBe('new value')
  })
})
```

---

#### Utility Tests

```typescript
// src/utils/myUtility.test.ts
import { describe, it, expect } from 'vitest'
import { myUtility } from './myUtility'

describe('myUtility', () => {
  it('should transform input correctly', () => {
    const result = myUtility('input')
    expect(result).toBe('output')
  })

  it('should handle edge cases', () => {
    expect(myUtility('')).toBe('')
    expect(myUtility(null)).toBe(null)
  })
})
```

---

### Running Tests

```bash
# Watch mode (recommended during development)
npm run test

# Run all tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests in UI mode (interactive)
npm run test:ui

# Run specific test file
npm run test -- MyComponent.test.tsx

# Run tests matching pattern
npm run test -- --grep "should render"
```

---

### Test Coverage

**Current Coverage**: 73.4%

**Target**: 90%

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html
```

**Coverage Goals**:

- [ ] All hooks have > 90% coverage
- [ ] All components have > 80% coverage
- [ ] All utilities have > 95% coverage
- [ ] Overall coverage > 90%

---

## Code Style

### TypeScript Style Guide

#### 1. Use Explicit Types

```typescript
// ❌ Bad: Implicit any
function add(a, b) {
  return a + b
}

// ✅ Good: Explicit types
function add(a: number, b: number): number {
  return a + b
}
```

---

#### 2. Avoid `any` Type

```typescript
// ❌ Bad: Using any
const data: any = fetchData()

// ✅ Good: Proper type or generic
const data: MindMapTree = fetchData()
```

---

#### 3. Use Type Guards

```typescript
// Type guard function
function isMindMapTree(value: unknown): value is MindMapTree {
  return typeof value === 'object' && value !== null && 'id' in value && 'content' in value
}

// Usage
if (isMindMapTree(data)) {
  // TypeScript knows `data` is MindMapTree here
  console.log(data.content)
}
```

---

#### 4. Use Readonly for Immutable Data

```typescript
// ✅ Good: Readonly parameters
function processTree(tree: Readonly<MindMapTree>) {
  // Cannot modify tree directly
  return {
    ...tree,
    children: tree.children.map(/* ... */),
  }
}
```

---

### React Style Guide

#### 1. Functional Components with Hooks

```typescript
// ✅ Good: Functional component
export default function MyComponent({ data }: Props) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    // Side effects
  }, []);

  return <div>{/* JSX */}</div>;
}
```

---

#### 2. Destructure Props

```typescript
// ✅ Good: Destructured props
interface Props {
  title: string;
  onSave: () => void;
}

export default function MyComponent({ title, onSave }: Props) {
  return (
    <button onClick={onSave}>{title}</button>
  );
}
```

---

#### 3. Use Memo for Expensive Computations

```typescript
// ✅ Good: Memoized computation
const sortedNodes = useMemo(() => {
  return nodes.sort((a, b) => a.content.localeCompare(b.content))
}, [nodes])
```

---

#### 4. Use Callback for Event Handlers

```typescript
// ✅ Good: Memoized callback
const handleClick = useCallback(() => {
  onSave(data)
}, [data, onSave])
```

---

### CSS Style Guide

#### 1. Use Inline Styles for Dynamic Values

```typescript
// ✅ Good: Inline styles for dynamic values
<div style={{
  position: 'absolute',
  left: `${node.x}px`,
  top: `${node.y}px`,
  background: node.color
}}>
```

---

#### 2. Use CSS Classes for Static Styles

```css
/* ✅ Good: CSS classes for static styles */
.node {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  border: 1px solid #d1d5db;
}
```

---

#### 3. CSS-in-JS for Component-Specific Styles

```typescript
// ✅ Good: Component-specific styles
const styles = {
  container: {
    padding: '16px',
    background: 'white',
    borderRadius: '8px',
  },
}
```

---

### Naming Conventions

| Type             | Convention                                 | Example                                         |
| ---------------- | ------------------------------------------ | ----------------------------------------------- |
| Components       | PascalCase                                 | `MindMapCanvas`, `MetadataPanel`                |
| Functions        | camelCase                                  | `parseFreeMind`, `generateYAML`                 |
| Constants        | UPPER_SNAKE_CASE                           | `MAX_NODES`, `DEFAULT_ZOOM`                     |
| Types/Interfaces | PascalCase                                 | `MindMapTree`, `NodeMetadata`                   |
| Files            | PascalCase (components), camelCase (utils) | `MindMapCanvas.tsx`, `freemindFormat.ts`        |
| Test files       | `.test.ts` or `.test.tsx` suffix           | `useAutoSave.test.ts`, `MindMapCanvas.test.tsx` |

---

## Common Tasks

### Task 1: Add a New Export Format

**Files to modify**:

1. `src/utils/formats/newFormat.ts` - Create converter
2. `src/components/MindMapCanvas.tsx` - Add to export menu
3. `src/utils/formats/newFormat.test.ts` - Add tests
4. `docs/api.md` - Document new format

**Steps**:

1. **Create converter** (`src/utils/formats/newFormat.ts`):

```typescript
import { MindMapTree } from '../../types'

export function parseNewFormat(input: string): MindMapTree {
  // Parse input format into MindMapTree
  const tree: MindMapTree = {
    id: 'root',
    content: 'Parsed content',
    children: [],
  }
  return tree
}

export function generateNewFormat(tree: MindMapTree): string {
  // Convert MindMapTree to output format
  return `Format output: ${tree.content}`
}
```

2. **Add tests** (`src/utils/formats/newFormat.test.ts`):

```typescript
import { describe, it, expect } from 'vitest'
import { parseNewFormat, generateNewFormat } from './newFormat'

describe('newFormat', () => {
  it('should parse NewFormat input', () => {
    const input = 'input data'
    const tree = parseNewFormat(input)
    expect(tree).toHaveProperty('id')
    expect(tree).toHaveProperty('content')
  })

  it('should generate NewFormat output', () => {
    const tree = { id: '1', content: 'Test', children: [] }
    const output = generateNewFormat(tree)
    expect(output).toContain('Test')
  })
})
```

3. **Add to export menu** (`src/components/MindMapCanvas.tsx`):

```typescript
import { generateNewFormat } from '../utils/formats/newFormat';

// In export dropdown:
<option value="newformat">New Format</option>

// In handleExport function:
case 'newformat':
  const newFormatContent = generateNewFormat(tree);
  downloadFile(newFormatContent, 'mindmap.newformat', 'text/plain');
  break;
```

4. **Update documentation** (`docs/api.md`):

```markdown
### NewFormat Format

**Import**: `parseNewFormat(input: string): MindMapTree`

**Export**: `generateNewFormat(tree: MindMapTree): string`

Description of the format...
```

---

### Task 2: Add a New Panel

**Files to modify**:

1. `src/components/MyPanel.tsx` - Create panel component
2. `src/components/MindMapCanvas.tsx` - Add panel state
3. `src/components/MindMapCanvas.tsx` - Add keyboard shortcut
4. `src/components/MyPanel.test.tsx` - Add tests

**Steps**:

1. **Create panel** (`src/components/MyPanel.tsx`):

```typescript
import { useState } from 'react';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

interface MyPanelProps {
  visible: boolean;
  onClose: () => void;
  nodeId: string | null;
}

export default function MyPanel({ visible, onClose, nodeId }: MyPanelProps) {
  const panelRef = useKeyboardNavigation({
    isOpen: visible,
    onClose,
    trapFocus: true,
    autoFocus: true,
    restoreFocus: true,
  });

  if (!visible) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="my-panel-title"
      style={{
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '400px',
        maxWidth: '90vw',
        background: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        zIndex: 1000,
      }}
    >
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <h2 id="my-panel-title">My Panel</h2>
        <button onClick={onClose} aria-label="Close panel">×</button>
      </div>
      <div style={{ padding: '16px' }}>
        {/* Panel content */}
      </div>
    </div>
  );
}
```

2. **Add state and toggle** (`src/components/MindMapCanvas.tsx`):

```typescript
const [showMyPanel, setShowMyPanel] = useState(false);
const [myPanelNodeId, setMyPanelNodeId] = useState<string | null>(null);

// In keyboard shortcuts:
case 'ctrl+m':
  setShowMyPanel(!showMyPanel);
  setMyPanelNodeId(selectedNodeId);
  break;

// Render panel:
<MyPanel
  visible={showMyPanel}
  onClose={() => setShowMyPanel(false)}
  nodeId={myPanelNodeId}
/>
```

3. **Add tests** (`src/components/MyPanel.test.tsx`):

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MyPanel from './MyPanel';

describe('MyPanel', () => {
  it('should render when visible', () => {
    const { container } = render(
      <MyPanel visible nodeId="node-1" onClose={vi.fn()} />
    );
    expect(container.querySelector('[role="dialog"]')).toBeVisible();
  });

  it('should not render when not visible', () => {
    const { container } = render(
      <MyPanel visible={false} nodeId="node-1" onClose={vi.fn()} />
    );
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    const handleClose = vi.fn();
    render(<MyPanel visible nodeId="node-1" onClose={handleClose} />);

    fireEvent.click(screen.getByLabelText('Close panel'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
```

---

### Task 3: Add a New Keyboard Shortcut

**Files to modify**:

1. `src/hooks/useKeyboardShortcuts.ts` - Add shortcut handler
2. `src/components/KeyboardShortcutsModal.tsx` - Add to shortcuts list
3. `docs/api.md` - Update documentation

**Steps**:

1. **Add shortcut handler** (`src/hooks/useKeyboardShortcuts.ts`):

```typescript
case 'ctrl+shift+m':
  if (callbacks.onToggleMyPanel) {
    callbacks.onToggleMyPanel();
  }
  break;
```

2. **Add to MindMapCanvas callbacks**:

```typescript
const handleToggleMyPanel = () => {
  setShowMyPanel(!showMyPanel)
}

useKeyboardShortcuts(
  { showMyPanel, selectedNodeId },
  {
    // ... other callbacks
    onToggleMyPanel: handleToggleMyPanel,
  }
)
```

3. **Add to shortcuts modal** (`src/components/KeyboardShortcutsModal.tsx`):

```typescript
{
  keys: ['Ctrl', 'Shift', 'M'],
  action: 'Toggle My Panel',
  category: 'Panels'
}
```

4. **Update documentation** (`docs/api.md`):

```markdown
| `Ctrl Shift M` | Toggle My Panel | Panels |
```

---

## Resources

### Documentation

- **[React Documentation](https://react.dev/)** - Official React docs
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - Learn TypeScript
- **[React Flow Docs](https://reactflow.dev/)** - Canvas library
- **[Vite Guide](https://vitejs.dev/guide/)** - Build tool
- **[Vitest Docs](https://vitest.dev/)** - Testing framework
- **[Web Dev Checklist](https://webdevchecklist.com/)** - Best practices

### Internal Documentation

- **[API Documentation](./api.md)** - Complete API reference
- **[Architecture Overview](./architecture.md)** - System design
- **[Performance Guide](./performance.md)** - Optimization tips
- **[Mobile Testing Guide](./mobile-testing.md)** - Mobile testing

---

## Getting Help

### Ask Questions

If you have questions:

1. **Check documentation first** - Most answers are in `docs/`
2. **Search existing issues** - Someone may have asked before
3. **Create a discussion** - For general questions on GitHub
4. **Join our Discord/Slack** - Real-time chat (if available)

---

### Report Bugs

When reporting bugs, include:

1. **Environment**:
   - OS and version
   - Browser and version
   - Node version

2. **Steps to reproduce**:

```markdown
1. Open the application
2. Create a new node
3. Try to drag the node
4. Node doesn't move
```

3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Screenshots/videos**: If visual issue
6. **Console errors**: Browser console output

---

### Feature Requests

When suggesting features:

1. **Use case**: What problem does this solve?
2. **Proposed solution**: How should it work?
3. **Alternatives**: What other approaches did you consider?
4. **Mockups**: Screenshots or diagrams if visual

---

## Code Review Process

### Before Submitting PR

- [ ] Tests pass locally (`npm run test:run`)
- [ ] Linting passes (`npm run lint`)
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow guidelines
- [ ] No console errors or warnings
- [ ] Tested on Chrome and Firefox
- [ ] Tested on mobile (if applicable)

---

### During Code Review

**Be open to feedback** - Code review is about learning and improving, not criticism.

**Ask questions** - If you don't understand a suggestion, ask for clarification.

**Explain your choices** - Help reviewers understand your reasoning.

**Iterate** - Make changes and request re-review as needed.

---

## First Contribution Ideas

Looking for your first contribution? Try these:

### Beginner

1. **Fix typo in documentation** - Update `docs/` files
2. **Add missing ARIA label** - Improve accessibility
3. **Write a test** - Increase test coverage
4. **Improve error message** - Make errors clearer

### Intermediate

5. **Add keyboard shortcut** - New panel toggle
6. **Add export format** - Support new file type
7. **Refactor component** - Extract reusable logic
8. **Add feature flag** - Enable/disable features

### Advanced

9. **Implement virtual scrolling** - Support large mind maps
10. **Add Web Worker** - Offload heavy computation
11. **Create new panel** - Major new feature
12. **Implement real-time sync** - Collaboration features

---

## Welcome to the Team!

Thank you for contributing to Mind Map Web! Every contribution helps make this project better.

**Remember**:

- Ask questions if you're stuck
- Start small and iterate
- Test your changes thoroughly
- Document your work
- Be patient with code review

Happy coding! 🚀

---

For additional help, please open an issue on GitHub or contact maintainers directly.
