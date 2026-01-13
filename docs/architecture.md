# Architecture Overview

This document provides a comprehensive overview of the Mind Map Web Application architecture, including component hierarchy, data flow, state management, and key design patterns.

## Table of Contents

- [High-Level Architecture](#high-level-architecture)
- [Component Hierarchy](#component-hierarchy)
- [Data Flow](#data-flow)
- [State Management](#state-management)
- [Key Design Patterns](#key-design-patterns)
- [Performance Considerations](#performance-considerations)
- [Security Considerations](#security-considerations)
- [Technology Stack](#technology-stack)

---

## High-Level Architecture

The application follows a **component-based architecture** with React as the UI framework. The core architecture consists of:

```
┌─────────────────────────────────────────────────────────────┐
│                         Application                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   MindMap    │  │   Panels     │  │   Modals     │   │
│  │   Canvas     │  │  (Metadata,  │  │  (Search,    │   │
│  │              │  │   Notes,     │  │   Export,    │   │
│  │              │  │   AI, etc.)  │  │   Settings)   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│         │                  │                  │            │
│         └──────────────────┴──────────────────┘            │
│                            │                                │
│                   ┌────────▼────────┐                      │
│                   │  State Manager  │                      │
│                   │  (React Hooks)  │                      │
│                   └────────┬────────┘                      │
│                            │                                │
│         ┌──────────────────┴──────────────────┐            │
│         │                                          │            │
│  ┌──────▼──────┐  ┌─────────────┐  ┌──────────▼───┐  │
│  │ localStorage │  │   IndexedDB │  │  File System  │  │
│  │   (Auto)     │  │  (Offline)  │  │   (Export)   │  │
│  └─────────────┘  └─────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

### Root Components

```
App
└── MindMapCanvas
    ├── ReactFlow (Canvas)
    │   ├── MindMapNode (Custom Nodes)
    │   └── Background
    ├── Controls (Top Bar)
    │   ├── Add Button
    │   ├── Export Dropdown
    │   ├── Undo/Redo Buttons
    │   └── Zoom Controls
    ├── Panels (Side Panels)
    │   ├── MetadataPanel
    │   ├── NotesPanel
    │   ├── SearchPanel
    │   ├── AIAssistantPanel
    │   ├── CommentsPanel
    │   ├── WebhookIntegrationPanel
    │   ├── CalendarExportPanel
    │   └── EmailIntegrationPanel
    ├── Modals (Dialogs)
    │   ├── KeyboardShortcutsModal
    │   ├── IconPicker
    │   ├── TemplatesPanel
    │   ├── ThemeSettingsPanel
    │   ├── PresentationMode
    │   └── ThreeDView
    └── Overlays
        ├── Minimap
        ├── StatsPanel
        ├── HistoryPanel
        ├── SaveHistoryPanel
        └── BulkOperationsPanel
```

### Component Responsibilities

#### MindMapCanvas (Main Container)

- **Responsibility**: Orchestrates all mind map functionality
- **State**: Nodes, edges, selection, panels visibility, history
- **Props**: `initialData?: MindMapTree`, `onDataChange?: (data) => void`
- **Dependencies**: ReactFlow, custom hooks for all features

#### MindMapNode (Individual Nodes)

- **Responsibility**: Renders individual mind map nodes
- **Props**: `data: MindMapNodeData`, `selected: boolean`
- **Features**: Icon display, cloud background, metadata indicators, styling

#### Panels

- **MetadataPanel**: Node metadata (URL, description, notes, tags, attachments)
- **NotesPanel**: Rich text notes editing
- **SearchPanel**: Search and filter nodes
- **AIAssistantPanel**: AI-powered mind map generation
- **CommentsPanel**: Collaborative commenting
- **HistoryPanel**: Undo/redo visualization
- **StatisticsPanel**: Mind map statistics and metrics

#### Modals

- **KeyboardShortcutsModal**: Display all keyboard shortcuts
- **IconPicker**: Select icons for nodes
- **PresentationMode**: Fullscreen presentation mode
- **ThreeDView**: 3D visualization
- **TemplatesPanel**: Pre-built mind map templates
- **ThemeSettingsPanel**: Theme customization

---

## Data Flow

### Initialization Flow

```
User loads app
    ↓
MindMapCanvas mounts
    ↓
Check localStorage for saved data
    ↓
Data exists? → Yes → Parse JSON → Initialize state
    ↓
     No → Create default root node
    ↓
Render initial mind map
```

### Node Creation Flow

```
User presses Tab/Enter
    ↓
handleKeyDown captures event
    ↓
Create new node object
    ↓
Add to tree structure (parent/child)
    ↓
Convert tree to ReactFlow format (nodes + edges)
    ↓
Update ReactFlow state
    ↓
Add to undo/redo history
    ↓
Trigger auto-save
```

### Export Flow

```
User clicks export button
    ↓
Select format (JSON, FreeMind, etc.)
    ↓
Call format converter (e.g., generateFreeMind)
    ↓
Convert tree to target format
    ↓
Create Blob with MIME type
    ↓
Trigger download via <a> element
```

### Collaboration Flow (Real-time)

```
User A edits node
    ↓
Local state updates
    ↓
Send to WebSocket server
    ↓
Broadcast to other clients
    ↓
User B receives update
    ↓
Update local state
    ↓
Re-render with changes
```

---

## State Management

The application uses **React hooks** for state management without a global state library. State is distributed across components using:

### Local Component State

```tsx
function MindMapCanvas() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  // ...
}
```

### Custom Hooks for Complex Logic

```tsx
// Auto-save
useAutoSave(data, 30000)

// Undo/redo
const { past, future, undo, redo } = useUndoRedo<MindMapTree>(50)

// Keyboard shortcuts
useKeyboardShortcuts(state, callbacks)

// File operations
const { handleSaveToJSON, handleLoadFromJSON } = useFileOperations(data)
```

### State Synchronization

State flows **unidirectionally** from parent to children:

```
Parent (MindMapCanvas)
    ↓ props
Child (MetadataPanel)
    ↓ callback
Parent updates state
    ↓ props
Child re-renders
```

---

## Key Design Patterns

### 1. Container/Presentational Pattern

**Container Component** (`MindMapCanvas`):

- Manages state
- Handles business logic
- Passes data to children

**Presentational Components** (`MindMapNode`, `MetadataPanel`):

- Receive data via props
- Render UI
- Call callbacks for events

### 2. Custom Hooks Pattern

Complex logic is extracted into reusable hooks:

```tsx
// Instead of inline useEffect for auto-save
useEffect(() => {
  const interval = setInterval(() => save(data), 30000)
  return () => clearInterval(interval)
}, [data])

// Use a reusable hook
useAutoSave(data, 30000)
```

### 3. Converter Pattern

Format converters follow a consistent pattern:

```tsx
interface FormatConverter<T> {
  parse(input: string): T
  generate(data: T): string
}
```

**Example**: `freemindFormat.ts`

```tsx
export function parseFreeMind(xml: string): MindMapTree {
  /* ... */
}
export function generateFreeMind(tree: MindMapTree): string {
  /* ... */
}
```

### 4. Strategy Pattern for Export

Different export formats use the same interface:

```tsx
const exporters = {
  json: stringifyJSON,
  freemind: generateFreeMind,
  opml: generateOPML,
  markdown: generateMarkdown,
  yaml: generateYAML,
  d2: generateD2,
}

const exporter = exporters[format]
const result = exporter(tree)
```

### 5. Error Boundary Pattern

Each feature has its own error boundary:

```tsx
<FeatureErrorBoundary name="AIAssistant">
  <AIAssistantPanel />
</FeatureErrorBoundary>
```

---

## Performance Considerations

### React Flow Optimization

- **Lazy loading**: Panels are loaded on-demand
- **Memoization**: Expensive computations use `useMemo`
- **Debouncing**: Search input is debounced (300ms)
- **Virtual scrolling**: Planned for 1000+ nodes

### State Updates

- **Batch updates**: Multiple state updates are batched
- **useCallback**: Event handlers are memoized
- **Minimal re-renders**: Components only re-render when props change

### Auto-Save

- **Debounced**: Saves every 30 seconds, not on every keystroke
- **localStorage**: Fast synchronous access
- **IndexedDB**: For large files, uses async storage

### Bundle Size

Current bundle: **184 KB gzipped**

Optimizations:

- Tree-shaking removes unused code
- Code splitting for panels
- Lazy loading for heavy components
- Minimal dependencies (only React, React Flow)

---

## Security Considerations

### Data Privacy

- **Client-side only**: No server sends data
- **localStorage**: Data stays on user's device
- **API keys**: AI assistant API keys stored in localStorage
- **No tracking**: No analytics or telemetry

### XSS Prevention

- **Sanitization**: Rich text editor sanitizes HTML
- **React**: Built-in XSS protection via JSX
- **DOMPurify**: Used for user-generated content

### File Operations

- **Read-only**: File API only reads user-selected files
- **No file system access**: Cannot modify user's file system
- **Download-only**: Export creates downloads, doesn't modify files

---

## Technology Stack

### Frontend Framework

- **React 19.2**: UI framework with hooks
- **TypeScript 5.8**: Type safety and developer experience

### Build Tools

- **Vite 7.2**: Fast build tool and dev server
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting

### Visualization

- **React Flow 11**: Mind map node graph visualization
  - Drag-and-drop
  - Custom node types
  - Background patterns
  - Minimap

### Testing

- **Vitest**: Unit testing framework
- **React Testing Library**: Component testing
- **jsdom**: DOM simulation

### Storage

- **localStorage**: Auto-save, settings, API keys
- **IndexedDB**: Large files, offline storage
- **Blob API**: File generation for exports

### State Management

- **React Hooks**: useState, useEffect, useContext, useCallback, useMemo
- **Custom Hooks**: Reusable stateful logic

### Import/Export Libraries

- **None**: All formats implemented in pure TypeScript
- Lightweight: No heavy parser dependencies

---

## Component Communication

### Parent to Child (Props)

```tsx
<MindMapCanvas initialData={tree} />
```

### Child to Parent (Callbacks)

```tsx
<MetadataPanel
  onUpdateMetadata={metadata => {
    setNodes(updateNode(nodes, nodeId, { metadata }))
  }}
/>
```

### Sibling Communication (via Parent)

```tsx
// Parent
const [sharedData, setSharedData] = useState(null)

return (
  <>
    <ComponentA data={sharedData} onChange={setSharedData} />
    <ComponentB data={sharedData} onChange={setSharedData} />
  </>
)
```

### Cross-Component Events (Keyboard Shortcuts)

```tsx
// Global hook
useKeyboardShortcuts(state, {
  onClosePanels: () => {
    setShowSearch(false)
    setShowNotes(false)
    // ...
  },
})
```

---

## Data Structures

### MindMapTree (Recursive)

```tsx
interface MindMapTree {
  id: string
  content: string
  children: MindMapTree[]
  metadata?: NodeMetadata
  icon?: string
  cloud?: { color?: string }
}
```

**Usage**: Core data structure, easy to traverse and manipulate.

### ReactFlow Format

```tsx
interface Node {
  id: string
  position: { x: number; y: number }
  data: MindMapNodeData
}

interface Edge {
  id: string
  source: string
  target: string
  type: string
}
```

**Usage**: Visualization, drag-and-drop.

---

## Error Handling

### Error Boundaries

```tsx
<ErrorBoundary fallback={<ErrorFallback message="Failed to load mind map" />}>
  <MindMapCanvas />
</ErrorBoundary>
```

### Error Tracking

```tsx
try {
  await riskyOperation()
} catch (error) {
  trackError(error, 'ContextName')
  showErrorToast(error.message)
}
```

### Async Error Handling

```tsx
const { execute } = useAsyncOperation()

const handleClick = async () => {
  await execute(async () => {
    await saveToAPI(data)
  })
}
```

---

## Accessibility Architecture

### ARIA Labels

All interactive elements have ARIA labels:

```tsx
<button aria-label="Add child node" aria-pressed={false}>
  Add Node
</button>
```

### Keyboard Navigation

- **useKeyboardNavigation**: Focus trap for modals
- **Tab cycles**: Logical tab order
- **Escape closes**: All panels close on Escape
- **Shortcuts**: Comprehensive keyboard shortcuts

### Screen Reader Support

- **role="dialog"**: Modals and panels
- **aria-live**: Dynamic content updates
- **aria-label**: Descriptive labels
- **aria-describedby**: Additional context

---

## Extension Points

### Adding New Export Formats

1. Create converter in `src/utils/formats/`
2. Implement `parse()` and `generate()` functions
3. Add to export dropdown in `MindMapCanvas`
4. Add tests

Example:

```tsx
// src/utils/formats/customFormat.ts
export function parseCustom(input: string): MindMapTree {
  /* ... */
}
export function generateCustom(tree: MindMapTree): string {
  /* ... */
}
```

### Adding New Panels

1. Create component in `src/components/`
2. Add visibility state to `MindMapCanvas`
3. Add toggle button/shortcut
4. Integrate with keyboard shortcuts hook

Example:

```tsx
// src/components/MyPanel.tsx
export default function MyPanel({ visible, onClose }) {
  const panelRef = useKeyboardNavigation({
    isOpen: visible,
    onClose,
  })

  if (!visible) return null

  return (
    <div ref={panelRef} role="dialog" aria-modal="true">
      {/* Panel content */}
    </div>
  )
}
```

### Adding Custom Hooks

Create in `src/hooks/` and follow the pattern:

```tsx
export function useCustomHook<T>(options: Options) {
  const [state, setState] = useState<T>(initialState)

  useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    }
  }, [])

  return {
    state,
    actions: {
      /* ... */
    },
  }
}
```

---

## Testing Strategy

### Unit Tests

- **Utilities**: Format converters, validators
- **Hooks**: Custom hook behavior
- **Components**: Component rendering and interaction

### Integration Tests

- **Workflows**: Full user journeys
- **Format conversion**: Round-trip parsing and generation

### E2E Tests (Planned)

- **Critical paths**: Create, edit, export mind map
- **Cross-browser**: Chrome, Firefox, Safari

---

## Deployment Architecture

### Build Process

```
Source Code
    ↓
Vite Build
    ↓
Bundle & Minify
    ↓
Generate dist/index.html
    ↓
Deploy to Static Hosting
```

### Hosting Options

- **Vercel/Netlify**: Recommended for easy deployment
- **GitHub Pages**: Free hosting for documentation
- **AWS S3 + CloudFront**: CDN with caching
- **Any static host**: Single HTML file, no server required

---

## Future Architecture Improvements

### Planned Enhancements

1. **Virtual Scrolling**: Support 10,000+ nodes
2. **Web Workers**: Offload heavy computation
3. **IndexedDB Sync**: Background sync across devices
4. **PWA**: Installable as desktop app
5. **Real-time Collaboration**: WebSocket-based editing

### Scalability Considerations

- **Large mind maps**: Implement virtualization
- **Concurrent users**: Use operational transformation (OT)
- **Data storage**: Compression for localStorage, IndexedDB for large data

---

For questions about the architecture, please open an issue on GitHub.
