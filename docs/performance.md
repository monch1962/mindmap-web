# Performance Guide

This document provides comprehensive guidance on performance optimization, monitoring, and best practices for the Mind Map Web Application.

## Table of Contents

- [Performance Metrics](#performance-metrics)
- [Bundle Optimization](#bundle-optimization)
- [Runtime Performance](#runtime-performance)
- [Memory Management](#memory-management)
- [Large-Scale Mind Maps](#large-scale-mind-maps)
- [Mobile Performance](#mobile-performance)
- [Monitoring](#monitoring)
- [Best Practices](#best-practices)

---

## Performance Metrics

### Current Performance (v1.0.0)

#### Bundle Size

- **JavaScript**: 629 KB (uncompressed)
- **Gzipped**: 184 KB
- **Target**: < 200 KB gzipped ✓

#### Load Time

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

#### Runtime Performance

- **Canvas rendering**: 60 FPS with < 100 nodes
- **Node creation**: < 16ms per node
- **Auto-save**: < 50ms for typical mind maps
- **Export generation**: < 500ms for large maps

---

## Bundle Optimization

### Current Strategy

The application uses several optimization techniques:

#### 1. Tree Shaking

Vite automatically removes unused code:

```tsx
// Good: Import only what you need
import { MindMapCanvas } from './components/MindMapCanvas';

// Bad: Import entire library
import * from './components';
```

#### 2. Code Splitting

Heavy panels are lazy-loaded:

```tsx
// In MindMapCanvas.tsx
const AIAssistantPanel = lazy(() => import('./AIAssistantPanel'))
const ThreeDView = lazy(() => import('./ThreeDView'))
const PresentationMode = lazy(() => import('./PresentationMode'))

// Wrapped in Suspense and ErrorBoundary
;<Suspense fallback={<LoadingSpinner />}>
  <AIAssistantPanel />
</Suspense>
```

#### 3. Dynamic Imports

Format converters are loaded on demand:

```tsx
// Load format converter only when needed
const loadConverter = async (format: string) => {
  const { parseFreeMind } = await import('./utils/formats/freemindFormat')
  return parseFreeMind(xml)
}
```

#### 4. Minimal Dependencies

The application has minimal external dependencies:

- **React**: Core UI framework
- **React Flow**: Node graph visualization
- **No heavy libraries**: All format parsers implemented in-house

### Optimization Techniques

#### Reduce Bundle Size

```tsx
// ❌ Avoid: Large libraries
import moment from 'moment' // 67 KB

// ✅ Use: Native APIs or smaller alternatives
import { format } from 'date-fns' // Tree-shakeable
```

#### Use Production Build

```bash
# Development: Includes source maps, HMR, debugging
npm run dev

# Production: Minified, optimized, smaller
npm run build
```

#### Analyze Bundle

```bash
# Visualize bundle composition
npm run build -- --mode=analyze

# Or use rollup-plugin-visualizer in vite.config.ts
```

---

## Runtime Performance

### React Flow Optimization

#### Node Rendering

React Flow handles rendering efficiently, but you can optimize:

```tsx
// Memoize expensive computations
const nodeData = useMemo(
  () => ({
    label: node.content,
    icon: getIconEmoji(node.icon),
    metadata: node.metadata,
  }),
  [node.content, node.icon, node.metadata]
)

// Use React.memo for custom nodes
const MindMapNode = React.memo(({ data, selected }) => {
  // Render node
})
```

#### Edge Rendering

```tsx
// Reduce edge re-renders
const edges = useMemo(() => {
  return treeToEdges(treeData)
}, [treeData])
```

### State Updates

#### Batch State Updates

```tsx
// ❌ Bad: Multiple re-renders
setNodes([...nodes, newNode])
setEdges([...edges, newEdge])

// ✅ Good: Batch updates
React.startTransition(() => {
  setNodes([...nodes, newNode])
  setEdges([...edges, newEdge])
})
```

#### Debounce Expensive Operations

```tsx
// Debounce search input
const debouncedSearch = useMemo(
  () =>
    debounce((query: string) => {
      performSearch(query)
    }, 300),
  []
)
```

### Auto-Save Optimization

```tsx
// Save only when data changes, not on every keystroke
useAutoSave(data, 30000) // 30 seconds

// Or use a dirty flag
const [isDirty, setIsDirty] = useState(false)

useEffect(() => {
  if (isDirty) {
    const timeout = setTimeout(() => {
      saveData(data)
      setIsDirty(false)
    }, 5000)

    return () => clearTimeout(timeout)
  }
}, [isDirty, data])
```

---

## Memory Management

### Memory Leaks to Avoid

#### 1. Event Listeners

```tsx
// ❌ Bad: Never cleaned up
useEffect(() => {
  window.addEventListener('resize', handleResize)
}, [])

// ✅ Good: Proper cleanup
useEffect(() => {
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])
```

#### 2. Timers and Intervals

```tsx
// ❌ Bad: Timer not cleared
useEffect(() => {
  const interval = setInterval(() => {
    saveData(data)
  }, 30000)
}, [])

// ✅ Good: Cleanup timer
useEffect(() => {
  const interval = setInterval(() => {
    saveData(data)
  }, 30000)

  return () => clearInterval(interval)
}, [])
```

#### 3. Subscriptions

```tsx
// ❌ Bad: WebSocket not closed
const ws = new WebSocket('ws://example.com')
ws.onmessage = e => handleMessage(e)

// ✅ Good: Clean up WebSocket
useEffect(() => {
  const ws = new WebSocket('ws://example.com')
  ws.onmessage = e => handleMessage(e)

  return () => ws.close()
}, [])
```

### Memory Monitoring

```tsx
// Monitor memory usage in development
if (import.meta.env.DEV) {
  setInterval(() => {
    if (performance.memory) {
      const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory
      const usage = (usedJSHeapSize / jsHeapSizeLimit) * 100
      console.log(`Memory usage: ${usage.toFixed(2)}%`)
    }
  }, 30000)
}
```

---

## Large-Scale Mind Maps

### Current Limitations

- **Recommended max nodes**: 1,000 for smooth performance
- **Rendering**: All nodes rendered in DOM
- **Auto-save**: Can be slow with large data

### Scaling Strategies

#### 1. Virtual Scrolling (Planned)

```tsx
// Render only visible nodes
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualMindMap({ nodes }: { nodes: Node[] }) {
  const virtualizer = useVirtualizer({
    count: nodes.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 100, // Average node height
    overscan: 5,
  })

  return (
    <div ref={scrollRef} style={{ height: '600px', overflow: 'auto' }}>
      {virtualizer.getVirtualItems().map(virtualRow => (
        <MindMapNode
          key={nodes[virtualRow.index].id}
          node={nodes[virtualRow.index]}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualRow.size}px`,
            transform: `translateY(${virtualRow.start}px)`,
          }}
        />
      ))}
    </div>
  )
}
```

#### 2. Lazy Rendering

```tsx
// Render child nodes only when parent is expanded
{
  node.collapsed ? null : node.children.map(child => <MindMapNode key={child.id} node={child} />)
}
```

#### 3. Data Pagination

```tsx
// Load large mind maps in chunks
function loadMindMapInChunks(url: string) {
  const chunkSize = 100
  let offset = 0

  async function loadChunk() {
    const chunk = await fetch(`${url}?offset=${offset}&limit=${chunkSize}`)
    const nodes = await chunk.json()
    addNodes(nodes)
    offset += chunkSize

    if (nodes.length === chunkSize) {
      await loadChunk()
    }
  }

  loadChunk()
}
```

#### 4. Web Workers

```tsx
// Offload heavy computation to worker
const worker = new Worker(new URL('./mindMapWorker.ts', import.meta.url))

worker.postMessage({ type: 'parse', data: largeXML })

worker.onmessage = e => {
  if (e.data.type === 'parsed') {
    setTree(e.data.tree)
  }
}
```

---

## Mobile Performance

### Touch Gesture Optimization

```tsx
// Debounce rapid touch events
const handleGesture = useMemo(
  () =>
    debounce((gesture: Gesture) => {
      handleZoom(gesture.scale)
      handlePan(gesture.dx, gesture.dy)
    }, 16), // 60fps
  []
)
```

### Responsive Images

```tsx
// Use appropriate image sizes for mobile
const iconSize = window.innerWidth < 768 ? 16 : 24

;<Icon size={iconSize} />
```

### Reduce Animations

```tsx
// Disable animations on low-end devices
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

;<NodeAnimation disabled={prefersReducedMotion} />
```

---

## Monitoring

### Web Vitals Tracking

```tsx
// src/utils/performance.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function reportWebVitals() {
  getCLS(console.log)
  getFID(console.log)
  getFCP(console.log)
  getLCP(console.log)
  getTTFB(console.log)
}
```

### Performance Profiling

```tsx
// Measure component render time
function MindMapCanvas() {
  const renderStart = performance.now()

  useEffect(() => {
    const renderEnd = performance.now()
    console.log(`Render time: ${(renderEnd - renderStart).toFixed(2)}ms`)
  })
}
```

### Custom Metrics

```tsx
// Track custom performance metrics
export function trackMetric(name: string, value: number) {
  if (import.meta.env.PROD) {
    // Send to analytics service
    analytics.track('metric', { name, value })
  } else {
    console.log(`[Metric] ${name}: ${value}ms`)
  }
}

// Usage
trackMetric('node_creation', performance.now() - startTime)
```

---

## Best Practices

### Component Design

#### 1. Use React.memo Wisely

```tsx
// ✅ Good: Memoize expensive components
const ExpensiveNode = React.memo(
  ({ data }) => {
    const result = expensiveComputation(data)
    return <div>{result}</div>
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return (
      prevProps.data.id === nextProps.data.id && prevProps.data.version === nextProps.data.version
    )
  }
)
```

#### 2. Avoid Inline Functions in Render

```tsx
// ❌ Bad: Creates new function every render
<div onClick={() => handleClick(node)} />

// ✅ Good: Use useCallback or data attributes
<div onClick={handleClick} data-node-id={node.id} />
```

#### 3. Optimize Re-Renders

```tsx
// Split large components into smaller pieces
function LargeComponent({ data }) {
  return (
    <>
      <StaticHeader />
      <ExpensiveList data={data.items} />
      <StaticFooter />
    </>
  )
}
```

### Data Structures

#### Use Immutable Patterns

```tsx
// ✅ Good: Create new objects
const newState = {
  ...prevState,
  nodes: [...prevState.nodes, newNode],
}

// ❌ Bad: Mutate state
prevState.nodes.push(newNode)
```

#### Optimize Deep Comparisons

```tsx
// Use shallow comparisons when possible
const areNodesEqual = (nodes1: Node[], nodes2: Node[]) => {
  if (nodes1.length !== nodes2.length) return false
  return nodes1.every((n1, i) => n1.id === nodes2[i]?.id)
}
```

### CSS Performance

#### Use CSS Transforms

```css
/* ❌ Bad: Layout thrashing */
.node {
  left: 100px;
  transition: left 0.3s;
}

/* ✅ Good: GPU acceleration */
.node {
  transform: translateX(100px);
  transition: transform 0.3s;
  will-change: transform;
}
```

#### Avoid Large Paints

```css
/* ✅ Use containment */
.canvas {
  contain: layout style paint;
}
```

### Network Performance

#### Lazy Load Resources

```tsx
// Load heavy libraries on demand
const loadChartLibrary = async () => {
  const { Chart } = await import('chart.js')
  return Chart
}
```

#### Cache API Responses

```tsx
// Cache expensive computations
const parseCache = new Map<string, MindMapTree>()

function parseXML(xml: string) {
  if (parseCache.has(xml)) {
    return parseCache.get(xml)
  }

  const tree = parseFreemind(xml)
  parseCache.set(xml, tree)
  return tree
}
```

---

## Performance Testing

### Load Testing

```bash
# Test bundle load time
npm run build
npx serve dist
# Test in Chrome DevTools Network tab
```

### Stress Testing

```tsx
// Create large mind map for testing
function createLargeMindMap(nodeCount: number): MindMapTree {
  const root: MindMapTree = {
    id: 'root',
    content: 'Root',
    children: [],
  }

  for (let i = 0; i < nodeCount; i++) {
    root.children.push({
      id: `node-${i}`,
      content: `Node ${i}`,
      children: [],
    })
  }

  return root
}

// Test with 1000 nodes
const largeMap = createLargeMindMap(1000)
```

### Profiling

```tsx
// Use React Profiler
<Profiler
  id="MindMapCanvas"
  onRender={(id, phase, actualDuration) => {
    console.log(`[Profiler] ${id} ${phase} took ${actualDuration}ms`)
  }}
>
  <MindMapCanvas />
</Profiler>
```

---

## Performance Budgets

### Recommended Budgets

```js
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          reactflow: ['reactflow'],
        },
      },
    },
  },
})
```

### Budget Enforcement

```bash
# Set budgets in package.json
{
  "scripts": {
    "build": "vite build && npx bundlesize"
  }
}
```

---

## Performance Checklist

- [ ] Bundle size < 200 KB gzipped
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] No memory leaks (check Chrome DevTools)
- [ ] 60 FPS during typical operations
- [ ] Auto-save < 100ms
- [ ] Export generation < 1s for large maps
- [ ] Web Vitals in "Good" range
- [ ] No layout shifts (CLS < 0.1)
- [ ] Minimal main thread work

---

## Troubleshooting Performance Issues

### Slow Initial Load

**Symptoms**: Long load time, large bundle

**Solutions**:

1. Check bundle size: `npm run build`
2. Use code splitting for heavy components
3. Lazy load format converters
4. Enable production build

### Laggy Canvas

**Symptoms**: Low FPS, choppy animations

**Solutions**:

1. Reduce number of visible nodes
2. Enable collapsed state for deep trees
3. Use `React.memo` for nodes
4. Debounce expensive operations

### High Memory Usage

**Symptoms**: Browser tab uses > 1GB RAM

**Solutions**:

1. Check for memory leaks (event listeners, timers)
2. Limit undo/redo history
3. Clear localStorage periodically
4. Use IndexedDB instead of localStorage for large data

### Slow Export

**Symptoms**: Export takes > 5 seconds

**Solutions**:

1. Use Web Workers for processing
2. Stream large exports instead of generating all at once
3. Optimize format converters
4. Show progress indicator

---

## Performance Tools

### Chrome DevTools

- **Performance Tab**: Record and analyze runtime performance
- **Memory Tab**: Detect memory leaks and usage
- **Network Tab**: Analyze load times
- **Coverage Tab**: Find unused JavaScript/CSS

### React DevTools

- **Profiler**: Identify expensive components
- **Component Tree**: Inspect component hierarchy
- **Props/State**: Debug component data

### Lighthouse

```bash
# Run Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

### webpack-bundle-analyzer

```bash
# Analyze bundle composition
npm run build
npx rollup-plugin-visualizer
```

---

For performance questions or to report issues, please open an issue on GitHub.
