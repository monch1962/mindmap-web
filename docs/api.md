# API Documentation

This document provides comprehensive API documentation for the Mind Map Web Application, including all exported components, hooks, utilities, and types.

## Table of Contents

- [Components](#components)
- [Hooks](#hooks)
- [Utilities](#utilities)
- [Types](#types)
- [Format Converters](#format-converters)

---

## Components

### MindMapCanvas

The main canvas component that renders the interactive mind map.

**Props:**

```typescript
interface MindMapCanvasProps {
  initialData?: MindMapTree
  onDataChange?: (data: MindMapTree) => void
}
```

**Features:**

- Interactive node creation and editing
- Drag-and-drop reorganization
- Undo/redo support
- Auto-save functionality
- Export to multiple formats
- Keyboard shortcuts

**Example:**

```tsx
import MindMapCanvas from './components/MindMapCanvas'

function App() {
  const [data, setData] = useState<MindMapTree>({
    id: 'root',
    content: 'My Mind Map',
    children: [],
  })

  return <MindMapCanvas initialData={data} onDataChange={setData} />
}
```

---

### MindMapNode

Custom node component for React Flow.

**Props:**

```typescript
interface MindMapNodeProps {
  data: MindMapNodeData
  selected: boolean
}
```

**Node Data Structure:**

```typescript
interface MindMapNodeData {
  label: string
  icon?: string
  cloud?: { color?: string }
  metadata?: NodeMetadata
}
```

---

### MetadataPanel

Panel for editing node metadata including URLs, descriptions, notes, tags, and file attachments.

**Props:**

```typescript
interface MetadataPanelProps {
  nodeId: string | null
  nodeLabel: string
  metadata?: NodeMetadata
  icon?: string
  cloud?: { color?: string }
  onUpdateMetadata: (metadata: NodeMetadata) => void
  onUpdateIcon?: (icon: string | null) => void
  onUpdateCloud?: (cloud: { color?: string } | null) => void
}
```

**Example:**

```tsx
<MetadataPanel
  nodeId="node-1"
  nodeLabel="My Node"
  metadata={{
    url: 'https://example.com',
    description: 'Node description',
    notes: 'Detailed notes',
    tags: ['important', 'todo'],
  }}
  onUpdateMetadata={metadata => console.log(metadata)}
/>
```

---

### NotesPanel

Modal for editing rich text notes attached to nodes.

**Props:**

```typescript
interface NotesPanelProps {
  visible: boolean
  onClose: () => void
  nodeId: string | null
  notes: string
  onUpdate: (notes: string) => void
}
```

---

### SearchPanel

Panel for searching nodes by text content.

**Props:**

```typescript
interface SearchPanelProps {
  onSearch: (query: string, options: SearchOptions) => void
  onNext: () => void
  onPrevious: () => void
  resultCount: number
  currentResult: number
  availableIcons?: string[]
  availableClouds?: string[]
}
```

**Search Options:**

```typescript
interface SearchOptions {
  caseSensitive: boolean
  wholeWord: boolean
  useRegex: boolean
  searchInNotes: boolean
  filterIcon?: string
  filterCloud?: string
  filterDate?: 'hour' | 'day' | 'week' | 'month'
}
```

---

### AIAssistantPanel

AI-powered assistant for generating mind maps from text prompts.

**Props:**

```typescript
interface AIAssistantPanelProps {
  visible: boolean
  onClose: () => void
  onGenerateMindMap: (text: string) => void
  onSuggestIdeas: (nodeId: string) => void
  onSummarizeBranch: (nodeId: string) => void
  selectedNodeId: string | null
}
```

**Features:**

- Generate mind maps from text descriptions
- Suggest ideas for selected nodes
- Summarize branches
- Support for OpenAI (GPT-4) and Anthropic (Claude)

---

### PresentationMode

Fullscreen presentation mode for presenting mind maps.

**Props:**

```typescript
interface PresentationModeProps {
  visible: boolean
  onClose: () => void
  tree: MindMapTree | null
}
```

**Features:**

- Slide-based presentation
- Keyboard navigation (arrow keys, Space, Enter)
- Speaker notes display
- Progress indicator
- Slide overview

---

### ThreeDView

3D visualization of the mind map using CSS transforms.

**Props:**

```typescript
interface ThreeDViewProps {
  visible: boolean
  onClose: () => void
  tree: MindMapTree | null
}
```

**Features:**

- Interactive 3D rotation
- Zoom in/out
- Auto-rotation
- Node selection
- Keyboard navigation

---

### RichTextEditor

Rich text editor component with formatting toolbar.

**Props:**

```typescript
interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  onSave: () => void
  onCancel: () => void
  placeholder: string
}
```

**Features:**

- Bold, italic, underline
- Text colors (red, blue, green, orange)
- Link insertion
- HTML sanitization
- Keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)

---

## Hooks

### useAutoSave

Automatically saves data to localStorage at intervals.

**Signature:**

```typescript
function useAutoSave(data: MindMapTree | null, interval: number = 30000): void
```

**Example:**

```tsx
useAutoSave(mindMapData, 30000) // Save every 30 seconds
```

---

### useUndoRedo

Manages undo/redo history for mind map operations.

**Signature:**

```typescript
function useUndoRedo<T>(maxHistory?: number): {
  past: T[]
  future: T[]
  addToHistory: (state: T) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  clear: () => void
}
```

**Example:**

```tsx
function MindMapEditor() {
  const [data, setData] = useState(initialData)
  const { past, future, addToHistory, undo, redo, canUndo, canRedo } = useUndoRedo(50)

  const handleChange = (newData: MindMapTree) => {
    addToHistory(newData)
    setData(newData)
  }

  return (
    <>
      <button onClick={undo} disabled={!canUndo}>
        Undo
      </button>
      <button onClick={redo} disabled={!canRedo}>
        Redo
      </button>
      <MindMapCanvas data={data} onChange={handleChange} />
    </>
  )
}
```

---

### useKeyboardShortcuts

Handles global keyboard shortcuts for the application.

**Signature:**

```typescript
function useKeyboardShortcuts(
  state: KeyboardShortcutState,
  callbacks: KeyboardShortcutCallbacks
): void
```

**Handled Shortcuts:**

- `Tab` - Create child node
- `Enter` - Create sibling node
- `Delete/Backspace` - Delete node
- `F2` - Edit node
- `Space` - Toggle collapse
- `Ctrl+F` - Open search
- `Ctrl+Z` - Undo
- `Ctrl+Y/Shift+Z` - Redo
- `Ctrl+S` - Save
- `Escape` - Close panels
- `?` - Show shortcuts

---

### useKeyboardNavigation

Provides keyboard navigation (focus trap, Tab cycling) for modals and panels.

**Signature:**

```typescript
function useKeyboardNavigation<T extends HTMLElement>(options?: {
  isOpen: boolean
  onClose?: () => void
  trapFocus?: boolean
  autoFocus?: boolean
  restoreFocus?: boolean
}): React.RefObject<T>
```

**Example:**

```tsx
function MyModal({ isOpen, onClose }) {
  const modalRef = useKeyboardNavigation({
    isOpen,
    onClose,
    trapFocus: true,
    autoFocus: true,
    restoreFocus: true,
  })

  if (!isOpen) return null

  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      <input type="text" placeholder="Name" />
      <button>Submit</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  )
}
```

---

### useFileOperations

Handles file import/export operations.

**Signature:**

```typescript
function useFileOperations(
  data: MindMapTree | null,
  onDataChange?: (data: MindMapTree) => void
): {
  handleSaveToJSON: () => void
  handleSaveToMarkdown: () => void
  handleSaveToFreemind: () => void
  handleSaveToOPML: () => void
  handleSaveToYAML: () => void
  handleSaveToD2: () => void
  handleSaveToPNG: () => Promise<void>
  handleSaveToSVG: () => Promise<void>
  handleLoadFromJSON: () => void
}
```

---

### useOfflineSync

Manages offline storage and sync using IndexedDB and service workers.

**Signature:**

```typescript
function useOfflineSync(data: MindMapTree | null): {
  isOnline: boolean
  lastSyncTime: Date | null
  syncStatus: 'synced' | 'syncing' | 'error'
  forceSync: () => Promise<void>
}
```

---

### useGestureNavigation

Handles touch gestures for mobile navigation (pinch to zoom, drag to pan).

**Signature:**

```typescript
function useGestureNavigation(
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPan: (dx: number, dy: number) => void
): {
  containerRef: React.RefObject<HTMLDivElement>;
}
```

---

## Utilities

### Mind Map Conversion

#### `treeToFlow(tree: MindMapTree): { nodes: Node[], edges: Edge[] }`

Converts a tree structure to React Flow nodes and edges.

#### `flowToTree(nodes: Node[], edges: Edge[]): MindMapTree`

Converts React Flow nodes and edges back to a tree structure.

#### `generateId(): string`

Generates unique IDs for nodes.

---

### Icon Utilities

#### `getIconEmoji(iconName: string): string`

Returns the emoji for a given icon name.

**Available Icons:**

- 60+ FreeMind-style icons including: help, yes, no, idea, message, pencil, clipboard, etc.

---

### Accessibility Utilities

#### `getSearchLabel(resultCount: number): string`

Generates an accessible label for the search panel.

#### `getToggleLabel(panelName: string, isVisible: boolean): string`

Generates an accessible label for toggle buttons.

---

### Error Tracking

#### `trackError(error: Error, context: string): void`

Logs errors for debugging and monitoring.

---

## Types

### MindMapTree

The core data structure for mind maps.

```typescript
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
```

### NodeMetadata

Additional metadata for nodes.

```typescript
interface NodeMetadata {
  url?: string
  description?: string
  notes?: string
  tags?: string[]
  attachments?: FileAttachment[]
  code?: CodeBlock[]
}

interface FileAttachment {
  id: string
  name: string
  type: 'image' | 'file'
  mimeType: string
  data: string // base64
  size: number
}

interface CodeBlock {
  id: string
  language: string
  code: string
}
```

### NodeStyle

Styling properties for nodes.

```typescript
interface NodeStyle {
  color?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold'
  fontStyle?: 'normal' | 'italic'
}
```

---

## Format Converters

### JSON Format

**Import:** `parseJSON(json: string): MindMapTree`

**Export:** `stringifyJSON(tree: MindMapTree): string`

Native format with full feature support.

---

### FreeMind Format (.mm)

**Import:** `parseFreeMind(xml: string): MindMapTree`

**Export:** `generateFreeMind(tree: MindMapTree): string`

XML-based format compatible with FreeMind software.

---

### OPML Format

**Import:** `parseOPML(xml: string): MindMapTree`

**Export:** `generateOPML(tree: MindMapTree): string`

Outline Processor Markup Language for outline tools.

---

### Markdown Format

**Export:** `generateMarkdown(tree: MindMapTree, includeRoot: boolean): string`

Human-readable indented text format.

**Example Output:**

```markdown
# Root Topic

## Child 1

### Grandchild 1.1

## Child 2
```

---

### YAML Format

**Export:** `generateYAML(tree: MindMapTree): string`

Structured data format for developers.

---

### D2 Format

**Export:** `generateD2(tree: MindMapTree): string`

Declarative diagramming language for D2 diagrams.

---

## Keyboard Shortcuts Reference

### Full Shortcuts List

| Shortcut           | Action                  | Category        |
| ------------------ | ----------------------- | --------------- |
| `Tab`              | Create child node       | Node Operations |
| `Enter`            | Create sibling node     | Node Operations |
| `Delete/Backspace` | Delete selected node    | Node Operations |
| `F2`               | Edit node text          | Node Operations |
| `E`                | Edit node (alternative) | Node Operations |
| `Space`            | Toggle collapse state   | Node Operations |
| `Ctrl + A`         | Select all nodes        | Node Operations |
| `Ctrl +`           | Zoom in                 | Navigation      |
| `Ctrl -`           | Zoom out                | Navigation      |
| `Ctrl 0`           | Fit view                | Navigation      |
| `Ctrl F`           | Open search             | Search          |
| `Ctrl G`           | Next result             | Search          |
| `Ctrl Shift G`     | Previous result         | Search          |
| `Ctrl Z`           | Undo                    | Editing         |
| `Ctrl Y`           | Redo                    | Editing         |
| `Ctrl Shift Z`     | Redo (alternative)      | Editing         |
| `Ctrl S`           | Manual save             | Editing         |
| `Ctrl N`           | Toggle notes panel      | Panels          |
| `Ctrl H`           | Toggle save history     | Panels          |
| `Ctrl Shift H`     | Toggle history panel    | Panels          |
| `Ctrl I`           | Toggle statistics       | Panels          |
| `Ctrl Shift A`     | Toggle AI Assistant     | Panels          |
| `Ctrl Shift C`     | Toggle comments         | Panels          |
| `Ctrl Shift W`     | Toggle webhooks         | Panels          |
| `Ctrl Shift D`     | Toggle calendar         | Panels          |
| `Ctrl Shift E`     | Toggle email            | Panels          |
| `Ctrl Shift P`     | Toggle presentation     | Panels          |
| `Ctrl Shift 3`     | Toggle 3D view          | Panels          |
| `Ctrl Shift T`     | Toggle templates        | Panels          |
| `Ctrl Shift ;`     | Toggle theme settings   | Panels          |
| `Ctrl Shift L`     | Toggle dark mode        | Panels          |
| `?`                | Show keyboard shortcuts | Help            |
| `Escape`           | Close panels            | System          |

---

## Contributing to the API

When adding new features:

1. **Add TypeScript types** for all new data structures
2. **Write tests** for new utilities and components
3. **Update this documentation** with new APIs
4. **Follow existing patterns** for consistency
5. **Ensure accessibility** with ARIA labels and keyboard navigation

---

## API Stability

### Stable APIs (v1.0.0)

- MindMapCanvas component
- Core hooks (useAutoSave, useUndoRedo)
- Format converters
- Type definitions

### Beta APIs

- AIAssistantPanel (may change as AI providers evolve)
- ThreeDView (experimental features)
- OfflineSync (IndexedDB implementation details may change)

### Internal APIs

- Error tracking utilities
- Performance monitoring
- Gesture navigation internals

For questions or suggestions, please open an issue on GitHub.
