# Testing Guide

## Testing Philosophy

This project follows strict **Test-Driven Development (TDD)** practices as outlined in AGENTS.md. All production code must be preceded by failing tests. The testing philosophy emphasizes:

- **Red-Green-Refactor**: Write failing test (RED), make it pass (GREEN), improve code (REFACTOR)
- **Comprehensive Coverage**: Target 90%+ test coverage across statements, branches, functions, and lines
- **Accessibility First**: All features must be accessible and tested for WCAG 2.1 AA compliance
- **Performance Awareness**: Tests should validate performance requirements and not degrade build times
- **Realistic Testing**: Use realistic user interactions and test data

## Test Structure

### File Organization

- Tests are **co-located** with source files: `Component.tsx` → `Component.test.tsx`
- Test files use `.test.ts` or `.test.tsx` extensions
- Test utilities are in `src/test/` directory
- User workflow tests are in `src/components/__tests__/` directory

### Directory Structure

```
src/
├── components/
│   ├── Component.tsx
│   └── Component.test.tsx      # Co-located tests
├── hooks/
│   ├── useHook.ts
│   └── useHook.test.ts         # Co-located tests
├── utils/
│   ├── utility.ts
│   └── utility.test.ts         # Co-located tests
└── test/                       # Test infrastructure
    ├── utils.ts               # Shared test utilities
    ├── factories/             # Test data factories
    ├── mocks/                 # Centralized mocks
    ├── setup/                 # Enhanced test setup
    └── types.ts               # Test type definitions
```

### User Workflow Tests

Comprehensive UI tests for all 50 user stories are organized by category:

- `src/components/__tests__/coreWorkflows.test.tsx` (Stories 1-8)
- `src/components/__tests__/nodeEnhancement.test.tsx` (Stories 9-15)
- `src/components/__tests__/aiFeatures.test.tsx` (Stories 16-19)
- `src/components/__tests__/searchNavigation.test.tsx` (Stories 20-23)
- `src/components/__tests__/importExport.test.tsx` (Stories 24-29)
- `src/components/__tests__/collaboration.test.tsx` (Stories 30-33)
- `src/components/__tests__/presentationVisualization.test.tsx` (Stories 34-37)
- `src/components/__tests__/mobileOffline.test.tsx` (Stories 38-41)
- `src/components/__tests__/historyProductivity.test.tsx` (Stories 42-50)
- `src/components/__tests__/integrationWorkflows.test.tsx` (Cross-feature tests)
- `src/components/__tests__/accessibility.test.tsx` (Accessibility compliance)

## Test Infrastructure

### Shared Utilities (`src/test/utils.ts`)

```typescript
// Custom render function with all providers
import { ReactFlowProvider } from 'reactflow'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

export const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllProviders, ...options })

// Re-export everything from testing-library
export * from '@testing-library/react'
export { customRender as render }

// Factory function imports
export * from './factories'
```

### Factory Functions (`src/test/factories/`)

Factory functions create consistent test data:

```typescript
// src/test/factories/mindmap.ts
import { MindMapTree } from '../../types'

export const createMindMap = (overrides?: Partial<MindMapTree>): MindMapTree => ({
  id: 'test-mindmap-1',
  content: 'Central Topic',
  children: [],
  position: { x: 0, y: 0 },
  ...overrides,
})

// src/test/factories/node.ts
import { MindMapNode } from '../../types'

export const createNode = (overrides?: Partial<MindMapNode>): MindMapNode => ({
  id: `node-${Date.now()}`,
  type: 'mindmap',
  position: { x: 0, y: 0 },
  data: { label: 'Test Node' },
  ...overrides,
})
```

### Mock System (`src/test/mocks/`)

Centralized mocks for consistent testing:

```typescript
// src/test/mocks/components/index.ts
import { vi } from 'vitest'

export const mockAIAssistantPanel = vi.fn(() => (
  <div data-testid="ai-assistant-panel">AI Assistant Panel</div>
))

// src/test/mocks/libraries/reactflow.ts
import { vi } from 'vitest'

export const mockReactFlow = {
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => children,
  useNodesState: vi.fn(() => [[], vi.fn()]),
  useEdgesState: vi.fn(() => [[], vi.fn()]),
  // ... other React Flow exports
}
```

### Enhanced Setup (`src/test/setup/`)

```typescript
// src/test/setup/accessibility.ts
import { axe, toHaveNoViolations } from 'jest-axe'
import '@testing-library/jest-dom'

expect.extend(toHaveNoViolations)

// Global accessibility test helper
global.testAccessibility = async (container: HTMLElement) => {
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}
```

## Writing Tests

### Component Test Pattern

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from 'src/test/utils'
import userEvent from '@testing-library/user-event'
import Component from './Component'

describe('Component', () => {
  const defaultProps = {
    onAction: vi.fn(),
    value: 'default',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with default props', () => {
    render(<Component {...defaultProps} />)

    expect(screen.getByText('Default Text')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeEnabled()
  })

  it('should call onAction when button is clicked', async () => {
    const user = userEvent.setup()
    const handleAction = vi.fn()

    render(<Component {...defaultProps} onAction={handleAction} />)

    const button = screen.getByRole('button', { name: /action/i })
    await user.click(button)

    expect(handleAction).toHaveBeenCalledTimes(1)
    expect(handleAction).toHaveBeenCalledWith('expected-value')
  })

  it('should be accessible', async () => {
    const { container } = render(<Component {...defaultProps} />)

    // Automated accessibility testing
    const results = await axe(container)
    expect(results).toHaveNoViolations()

    // Manual accessibility checks
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Action button')
  })
})
```

### Hook Test Pattern

```typescript
import { describe, it, expect, vi, act } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useHook } from './useHook'

describe('useHook', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useHook())

    expect(result.current.value).toBe('initial')
    expect(result.current.isLoading).toBe(false)
  })

  it('should update state when action is called', async () => {
    const { result } = renderHook(() => useHook())

    await act(async () => {
      await result.current.performAction('test-input')
    })

    expect(result.current.value).toBe('processed-test-input')
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useHook())

    await act(async () => {
      await result.current.performAction('error-trigger')
    })

    expect(result.current.error).toBe('Action failed')
    expect(result.current.isLoading).toBe(false)
  })
})
```

### Utility Function Test Pattern

```typescript
import { describe, it, expect } from 'vitest'
import { utilityFunction } from './utility'

describe('utilityFunction', () => {
  it('should process valid input correctly', () => {
    const result = utilityFunction('valid-input')

    expect(result).toBe('expected-output')
    expect(result).toMatch(/expected-pattern/)
  })

  it('should handle edge cases', () => {
    const result = utilityFunction('')

    expect(result).toBe('default-output')
  })

  it('should throw error for invalid input', () => {
    expect(() => utilityFunction('invalid')).toThrow('Invalid input')
  })
})
```

### User Workflow Test Pattern

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from 'src/test/utils'
import userEvent from '@testing-library/user-event'
import MindMapCanvas from '../MindMapCanvas'

describe('Core Workflow: Story 1 - Create new mind map', () => {
  it('should create mind map with central topic', async () => {
    const user = userEvent.setup()
    render(<MindMapCanvas />)

    // Verify initial state
    expect(screen.getByText('Central Topic')).toBeInTheDocument()

    // Create child node
    const centralTopic = screen.getByText('Central Topic')
    await user.click(centralTopic)
    await user.keyboard('[Tab]')

    // Verify child node creation
    const childInput = screen.getByPlaceholderText('Enter node text')
    expect(childInput).toBeInTheDocument()

    await user.type(childInput, 'First Idea')
    await user.keyboard('[Enter]')

    expect(screen.getByText('First Idea')).toBeInTheDocument()
  })
})
```

## Running Tests

### Development Commands

```bash
# Development (watch mode) - TDD workflow
npm run test

# Single test run - CI/CD
npm run test:run

# Interactive UI mode
npm run test:ui

# Coverage report
npm run test:coverage

# Run specific test file
npx vitest run src/components/Component.test.tsx

# Run tests matching pattern
npx vitest run -t "should create mind map"

# Run with verbose output
npm run test -- --reporter=verbose
```

### CI/CD Integration

Tests run automatically in CI/CD pipelines:

- **Pre-commit**: Husky hooks run linting and formatting
- **Pull Requests**: All tests must pass before merge
- **Main Branch**: Coverage must be 90%+ on main branch

### Performance Considerations

- Run tests in parallel: `vitest --maxWorkers=4`
- Use `test.skip()` for long-running integration tests during development
- Mock expensive operations (API calls, file I/O, complex calculations)
- Clean up test data after each test to prevent memory leaks

## Debugging Tests

### Common Issues & Solutions

**1. Test Times Out**

```typescript
// Problem: Test exceeds default timeout
it('should complete within timeout', async () => {
  // Solution: Increase timeout or fix async issue
}, 10000) // 10 second timeout
```

**2. act() Warnings**

```typescript
// Problem: State updates not wrapped in act()
import { act } from '@testing-library/react'

it('should update state correctly', async () => {
  await act(async () => {
    // Perform state updates here
    await result.current.performAction()
  })
})
```

**3. Missing DOM Elements**

```typescript
// Problem: Can't find element by text/role
// Solution: Use debug() to see rendered output
screen.debug()

// Solution: Use more specific selectors
screen.getByRole('button', { name: /submit/i })
screen.getByTestId('custom-element')
```

**4. Mock Issues**

```typescript
// Problem: Mock not being called
// Solution: Verify mock setup
vi.mock('./module', () => ({
  default: vi.fn(() => 'mocked-value'),
}))

// Solution: Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})
```

### Debugging Tools

- **screen.debug()**: Print DOM structure
- **--reporter=verbose**: Detailed test output
- **Vitest UI**: Interactive test debugging
- **Chrome DevTools**: Debug tests in browser

## Performance Testing

### Benchmarking Critical Workflows

```typescript
describe('Performance', () => {
  it('should render 1000 nodes within 2 seconds', () => {
    const startTime = performance.now()

    render(<MindMapCanvas nodes={largeDataSet} />)

    const endTime = performance.now()
    const renderTime = endTime - startTime

    expect(renderTime).toBeLessThan(2000) // 2 seconds
  })
})
```

### Memory Usage Monitoring

```typescript
it('should not leak memory', () => {
  const initialMemory = process.memoryUsage().heapUsed

  // Perform operations
  render(<Component />)
  unmount()

  const finalMemory = process.memoryUsage().heapUsed
  const memoryIncrease = finalMemory - initialMemory

  expect(memoryIncrease).toBeLessThan(1024 * 1024) // 1MB
})
```

## Accessibility Testing

### Automated Testing with jest-axe

```typescript
import { axe } from 'jest-axe'

describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Component />)
    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup()
    render(<Component />)

    // Tab through interactive elements
    await user.tab()
    expect(screen.getByRole('button')).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('textbox')).toHaveFocus()
  })
})
```

### Manual Accessibility Checks

- **Keyboard Navigation**: All interactive elements must be reachable via Tab
- **Screen Reader**: ARIA labels and roles must be correct
- **Color Contrast**: Text must meet WCAG contrast ratios
- **Focus Management**: Focus must be trapped in modals and restored properly

## Test Coverage

### Coverage Goals

- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 90%+

### Generating Coverage Reports

```bash
# Generate HTML report
npm run test:coverage

# Generate JSON report for CI
npx vitest run --coverage --reporter=json

# Check specific file coverage
npx vitest run --coverage src/components/Component.tsx
```

### Coverage Interpretation

- **High Coverage ≠ Good Tests**: Focus on meaningful tests, not just coverage numbers
- **Critical Paths**: Ensure 100% coverage for error handling and security-critical code
- **Edge Cases**: Test boundary conditions and error states
- **Integration Tests**: Coverage should include cross-feature interactions

## Contributing Tests

### Guidelines for New Contributors

1. **Always write tests first** (TDD)
2. **Follow existing patterns** in similar test files
3. **Use factory functions** for test data
4. **Mock external dependencies** consistently
5. **Test accessibility** for all new features
6. **Include edge cases** and error states
7. **Keep tests focused** on one behavior per test
8. **Clean up** after tests (mocks, timers, DOM)

### Test Review Checklist

- [ ] Tests follow TDD pattern (failing test first)
- [ ] All tests pass
- [ ] Coverage increases or maintains
- [ ] Accessibility tests included
- [ ] Performance considerations addressed
- [ ] Mocking strategy is appropriate
- [ ] Test data uses factory functions
- [ ] Edge cases are tested
- [ ] Error states are handled
- [ ] No console.log statements in tests

### Example: Adding Tests for New Feature

```typescript
// 1. Create failing test (RED)
describe('NewFeature', () => {
  it('should do something useful', () => {
    // Test will fail - that's expected
    expect(false).toBe(true)
  })
})

// 2. Implement minimal feature (GREEN)
// ... implement feature ...

// 3. Refactor and add comprehensive tests
describe('NewFeature', () => {
  it('should do something useful', () => {
    const result = newFeature('input')
    expect(result).toBe('expected-output')
  })

  it('should handle errors', () => {
    expect(() => newFeature('invalid')).toThrow('Error message')
  })

  it('should be accessible', async () => {
    const { container } = render(<NewFeatureComponent />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

## Best Practices

### Do's

- ✅ **Write tests first** (TDD)
- ✅ **Use descriptive test names** that explain the behavior
- ✅ **Test one behavior per test**
- ✅ **Use factory functions** for consistent test data
- ✅ **Mock external dependencies**
- ✅ **Test accessibility** for all features
- ✅ **Clean up after tests** (timers, mocks, DOM)
- ✅ **Test edge cases** and error states
- ✅ **Keep tests fast** (under 100ms each)
- ✅ **Use TypeScript** for type safety in tests

### Don'ts

- ❌ **Don't test implementation details**
- ❌ **Don't rely on test order**
- ❌ **Don't use sleep/timeouts** without good reason
- ❌ **Don't test third-party libraries**
- ❌ **Don't commit console.log statements**
- ❌ **Don't skip cleanup** (memory leaks)
- ❌ **Don't write flaky tests** (non-deterministic)
- ❌ **Don't test through UI** what can be tested directly

### Testing Anti-Patterns to Avoid

1. **Brittle Tests**: Tests that break with minor UI changes
2. **Slow Tests**: Tests that take too long to run
3. **Flaky Tests**: Tests that sometimes pass, sometimes fail
4. **Over-Mocking**: Mocking everything makes tests meaningless
5. **Under-Testing**: Missing critical paths and edge cases
6. **Test Duplication**: Same logic tested multiple times
7. **Implementation Testing**: Testing how code works instead of what it does

## Resources

### Documentation

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [User Event](https://testing-library.com/docs/user-event/intro/)
- [Jest Axe](https://github.com/nickcolley/jest-axe)

### Learning Resources

- [Testing JavaScript](https://testingjavascript.com/)
- [React Testing Library Course](https://www.udemy.com/course/react-testing-library/)
- [TDD by Example](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)

### Tools

- **Vitest**: Test runner and framework
- **React Testing Library**: Component testing utilities
- **Jest DOM**: Custom DOM matchers
- **User Event**: Realistic user interaction simulation
- **Jest Axe**: Accessibility testing
- **MSW**: API mocking
- **Testing Playground**: Visual test debugging

---

_Last Updated: 2026-02-04_  
_Test Coverage: 73.9% statements, 73.61% branches (Target: 90%)_  
_Total Tests: 1526 passing, 43 skipped_  
_Recent Improvements: Comprehensive test suite expansion completed_

### Recent Test Improvements (2026-02-04)

#### ✅ **Major Test Suite Expansion**

- **1526 tests passing** - Significant increase from original baseline
- **73.9% statement coverage** - Improved from 70.22%
- **All 50 user stories** now have comprehensive test coverage

#### ✅ **MindMapCanvas Component**

- **117 total tests** (105 passing, 12 skipped)
- **Cross-link functionality**: 8 comprehensive tests added
- **Bulk operations**: 12 edge case tests added
- **Comment system**: 11 tests for Ctrl+Shift+C functionality
- **Search functionality**: 15 tests for advanced search features

#### ✅ **Hook Coverage Improvements**

- **useFileOperations**: Improved from 56.86% to 62.74% statements
- **useUndoRedo**: Achieved 100% coverage (statements, branches, functions, lines)
- **useKeyboardNavigation**: Achieved 100% coverage
- **useOfflineSync**: Improved from 52.48% to ~80%+ coverage

#### ✅ **Component Test Coverage**

- **IconPicker**: 88.23% coverage (was 0%)
- **SearchPanel**: 82.75% coverage (was 0%)
- **AIAssistantPanel**: 86.84% coverage (was 7.5%)
- **CommentsPanel**: 100% coverage
- **EmailIntegrationPanel**: 95.55% coverage
- **TemplatesPanel**: ~85%+ coverage (was 0%)

#### ✅ **Automated CI/CD Pipeline**

- **GitHub Actions workflows** configured for automated builds
- **Self-contained artifacts** with version tracking
- **Quality gates** ensuring tests pass before artifact creation

#### ✅ **TDD Practices Followed**

- **Red-Green-Refactor** workflow for all new tests
- **Comprehensive edge case testing**
- **Accessibility testing** integrated
- **Performance considerations** addressed

### Next Phase

- **Integration tests** for real-time collaboration features
- **Performance testing** for web vitals and load testing
- **Mobile testing** for comprehensive touch gesture coverage
- **Accessibility testing** for WCAG 2.1 AA compliance verification
