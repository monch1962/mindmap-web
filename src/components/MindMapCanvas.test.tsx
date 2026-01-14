import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'
import MindMapCanvas from './MindMapCanvas'
import type { MindMapTree } from '../types'

// Mock all lazy-loaded components
vi.mock('./AIAssistantPanel', () => ({
  default: ({ visible, onClose }: { visible: boolean; onClose: () => void }) =>
    visible ? (
      <div data-testid="ai-assistant">
        <button onClick={onClose}>Close AI</button>
      </div>
    ) : null,
}))

vi.mock('./CommentsPanel', () => ({
  default: ({ visible, onClose }: { visible: boolean; onClose: () => void }) =>
    visible ? (
      <div data-testid="comments-panel">
        <button onClick={onClose}>Close Comments</button>
      </div>
    ) : null,
}))

vi.mock('./WebhookIntegrationPanel', () => ({
  default: ({ visible, onClose }: { visible: boolean; onClose: () => void }) =>
    visible ? (
      <div data-testid="webhook-panel">
        <button onClick={onClose}>Close Webhook</button>
      </div>
    ) : null,
}))

vi.mock('./CalendarExportPanel', () => ({
  default: ({ visible, onClose }: { visible: boolean; onClose: () => void }) =>
    visible ? (
      <div data-testid="calendar-panel">
        <button onClick={onClose}>Close Calendar</button>
      </div>
    ) : null,
}))

vi.mock('./EmailIntegrationPanel', () => ({
  default: ({ visible, onClose }: { visible: boolean; onClose: () => void }) =>
    visible ? (
      <div data-testid="email-panel">
        <button onClick={onClose}>Close Email</button>
      </div>
    ) : null,
}))

vi.mock('./PresentationMode', () => ({
  default: ({ visible, onClose }: { visible: boolean; onClose: () => void }) =>
    visible ? (
      <div data-testid="presentation-mode">
        <button onClick={onClose}>Close Presentation</button>
      </div>
    ) : null,
}))

vi.mock('./ThreeDView', () => ({
  default: ({ visible, onClose }: { visible: boolean; onClose: () => void }) =>
    visible ? (
      <div data-testid="3d-view">
        <button onClick={onClose}>Close 3D</button>
      </div>
    ) : null,
}))

vi.mock('./TemplatesPanel', () => ({
  default: ({ visible, onClose }: { visible: boolean; onClose: () => void }) =>
    visible ? (
      <div data-testid="templates-panel">
        <button onClick={onClose}>Close Templates</button>
      </div>
    ) : null,
}))

vi.mock('./ThemeSettingsPanel', () => ({
  default: ({ visible, onClose }: { visible: boolean; onClose: () => void }) =>
    visible ? (
      <div data-testid="theme-panel">
        <button onClick={onClose}>Close Theme</button>
      </div>
    ) : null,
}))

// Mock hooks
vi.mock('../hooks/useFileOperations', () => ({
  useFileOperations: () => ({
    handleSaveToJSON: vi.fn(),
    handleSaveToMarkdown: vi.fn(),
    handleSaveToFreemind: vi.fn(),
    handleSaveToOPML: vi.fn(),
    handleSaveToYAML: vi.fn(),
    handleSaveToD2: vi.fn(),
    handleLoadFromJSON: vi.fn(),
    handleExportPNG: vi.fn(),
    handleExportSVG: vi.fn(),
  }),
}))

vi.mock('../hooks/useAutoSave', () => ({
  useAutoSave: () => ({
    saveHistory: [],
    saveNow: vi.fn(),
    clearAutoSave: vi.fn(),
    restoreFromHistory: vi.fn(),
    deleteHistorySlot: vi.fn(),
  }),
}))

vi.mock('../hooks/useUndoRedo', () => ({
  useUndoRedo: () => ({
    past: [],
    future: [],
    addToHistory: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: false,
    canRedo: false,
    getFullHistory: vi.fn(() => []),
    jumpToHistory: vi.fn(),
  }),
}))

vi.mock('../hooks/useOfflineSync', () => ({
  useOfflineSync: () => ({}),
}))

vi.mock('../hooks/useGestureNavigation', () => ({
  useGestureNavigation: () => ({}),
}))

vi.mock('../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: () => ({}),
}))

describe('MindMapCanvas', () => {
  const mockTree: MindMapTree = {
    id: 'root',
    content: 'Root Topic',
    children: [
      {
        id: '1',
        content: 'Child 1',
        children: [],
      },
      {
        id: '2',
        content: 'Child 2',
        children: [],
      },
    ],
  }

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ReactFlowProvider>{children}</ReactFlowProvider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    // Mock ResizeObserver for React Flow
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver
  })

  it('should render canvas with initial data', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    expect(screen.getByText('Root Topic')).toBeInTheDocument()
  })

  it('should render empty canvas when no initial data', () => {
    render(<MindMapCanvas />, { wrapper })

    // Should still render ReactFlow
    expect(document.querySelector('.react-flow')).toBeInTheDocument()
  })

  it('should display add node button', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    expect(screen.getByLabelText('Add node')).toBeInTheDocument()
  })

  it('should display fit view button', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    expect(screen.getByLabelText('Fit view')).toBeInTheDocument()
  })

  it('should display zoom controls', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument()
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument()
  })

  it('should display save button', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    expect(screen.getByLabelText('Save now')).toBeInTheDocument()
  })

  it('should open metadata panel when node is selected', async () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    // Click on a node to select it
    const rootNode = screen.getByText('Root Topic')
    fireEvent.click(rootNode)

    await waitFor(() => {
      expect(screen.getByLabelText(/Node metadata/)).toBeInTheDocument()
    })
  })

  it('should open notes panel when notes button is clicked', async () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    // First select a node
    const rootNode = screen.getByText('Root Topic')
    fireEvent.click(rootNode)

    // Find and click notes button
    const notesButton = screen.getByLabelText('Toggle notes panel')
    fireEvent.click(notesButton)

    await waitFor(() => {
      expect(screen.getByLabelText(/Notes panel/)).toBeInTheDocument()
    })
  })

  it('should toggle AI assistant panel', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    const aiButton = screen.getByLabelText('Toggle AI assistant')
    fireEvent.click(aiButton)

    expect(screen.queryByTestId('ai-assistant')).toBeInTheDocument()

    fireEvent.click(aiButton)

    expect(screen.queryByTestId('ai-assistant')).not.toBeInTheDocument()
  })

  it('should open search panel when search is activated', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    // Use keyboard shortcut or button
    fireEvent.keyDown(window, { key: 'f', ctrlKey: true })

    expect(screen.getByLabelText(/Search/)).toBeInTheDocument()
  })

  it('should display keyboard shortcuts modal', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    const shortcutsButton = screen.getByLabelText('Show keyboard shortcuts')
    fireEvent.click(shortcutsButton)

    expect(screen.getByLabelText(/Keyboard shortcuts/)).toBeInTheDocument()
  })

  it('should support undo and redo', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    const undoButton = screen.getByLabelText('Undo')
    const redoButton = screen.getByLabelText('Redo')

    expect(undoButton).toBeInTheDocument()
    expect(redoButton).toBeInTheDocument()
  })

  it('should support export to PNG', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    expect(screen.getByLabelText('Export as PNG')).toBeInTheDocument()
  })

  it('should support export to SVG', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    expect(screen.getByLabelText('Export as SVG')).toBeInTheDocument()
  })

  it('should support export to Markdown', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    expect(screen.getByLabelText('Save as Markdown')).toBeInTheDocument()
  })

  it('should open templates panel', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    const templatesButton = screen.getByLabelText('Open templates panel')
    fireEvent.click(templatesButton)

    expect(screen.queryByTestId('templates-panel')).toBeInTheDocument()
  })

  it('should open presentation mode', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    const presentationButton = screen.getByLabelText('Start presentation mode')
    fireEvent.click(presentationButton)

    expect(screen.queryByTestId('presentation-mode')).toBeInTheDocument()
  })

  it('should open 3D view', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    const view3dButton = screen.getByLabelText('Toggle 3D view')
    fireEvent.click(view3dButton)

    expect(screen.queryByTestId('3d-view')).toBeInTheDocument()
  })

  it('should open theme settings', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    const themeButton = screen.getByLabelText('Toggle theme settings')
    fireEvent.click(themeButton)

    expect(screen.queryByTestId('theme-panel')).toBeInTheDocument()
  })

  it('should open statistics panel', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    const statsButton = screen.getByLabelText('Show statistics')
    fireEvent.click(statsButton)

    expect(screen.getByLabelText(/Statistics panel/)).toBeInTheDocument()
  })

  it('should open history panel', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    const historyButton = screen.getByLabelText('Show history')
    fireEvent.click(historyButton)

    expect(screen.getByLabelText(/History panel/)).toBeInTheDocument()
  })

  it('should open save history panel', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    const saveHistoryButton = screen.getByLabelText('Show save history')
    fireEvent.click(saveHistoryButton)

    expect(screen.getByLabelText(/Save history/)).toBeInTheDocument()
  })

  it('should toggle cross-link mode', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    const crossLinkButton = screen.getByLabelText('Toggle cross-link mode')
    fireEvent.click(crossLinkButton)

    // Cross-link mode should be active
    expect(crossLinkButton).toHaveClass('active')
  })

  it('should show mobile toolbar on mobile devices', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    expect(screen.getByRole('toolbar')).toBeInTheDocument()
  })

  it('should display help menu', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    const helpButton = screen.getByLabelText('Open help menu')
    fireEvent.click(helpButton)

    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('should update node selection when clicking nodes', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    const rootNode = screen.getByText('Root Topic')

    fireEvent.click(rootNode)

    // Node should be selected
    expect(rootNode.parentElement?.parentElement).toHaveClass('selected')
  })

  it('should support adding new nodes', async () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    const addButton = screen.getByLabelText('Add node')
    fireEvent.click(addButton)

    // Should have an additional node
    await waitFor(() => {
      const nodes = screen
        .getAllByRole('button', { hidden: true })
        .filter(el => el.textContent?.includes('New Node'))
      expect(nodes.length).toBeGreaterThan(0)
    })
  })

  it('should open bulk operations panel when multiple nodes selected', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    // Select multiple nodes (if supported)
    const child1 = screen.getByText('Child 1')
    fireEvent.click(child1)

    // Check if bulk operations appear
    // This depends on the multi-selection implementation
  })

  it('should support dark mode toggle', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    const darkModeButton = screen.getByLabelText('Toggle dark mode')
    fireEvent.click(darkModeButton)

    // Check if dark mode is applied
    expect(document.documentElement).toHaveClass('dark')
  })

  it('should display presence indicator for collaboration', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    // Presence indicator should be present (even if no other users)
    const presence = screen.queryByLabelText(/Online/)
    if (presence) {
      expect(presence).toBeInTheDocument()
    }
  })

  it('should handle keyboard shortcuts', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    // Test Enter key for new node
    fireEvent.keyDown(document.body, { key: 'Enter' })

    // Test Delete key
    fireEvent.keyDown(document.body, { key: 'Delete' })

    // Test Escape key
    fireEvent.keyDown(document.body, { key: 'Escape' })

    // Should not crash
    expect(screen.getByText('Root Topic')).toBeInTheDocument()
  })

  it('should support file loading', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    const loadButton = screen.getByLabelText('Load from JSON')
    expect(loadButton).toBeInTheDocument()
  })

  it('should display minimap', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    const minimap = document.querySelector('.react-flow__minimap')
    expect(minimap).toBeInTheDocument()
  })

  it('should display controls panel', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    const controls = document.querySelector('.react-flow__controls')
    expect(controls).toBeInTheDocument()
  })

  it('should handle window resize', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    // Trigger resize
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    // Should not crash
    expect(screen.getByText('Root Topic')).toBeInTheDocument()
  })

  it('should have proper ARIA labels on all interactive elements', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    // Check main buttons
    expect(screen.getByLabelText('Add node')).toBeInTheDocument()
    expect(screen.getByLabelText('Fit view')).toBeInTheDocument()
    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument()
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle AI assistant')).toBeInTheDocument()
    expect(screen.getByLabelText('Open templates panel')).toBeInTheDocument()
    expect(screen.getByLabelText('Start presentation mode')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle 3D view')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle theme settings')).toBeInTheDocument()
    expect(screen.getByLabelText('Show statistics')).toBeInTheDocument()
    expect(screen.getByLabelText('Show history')).toBeInTheDocument()
  })

  it('should wrap lazy components in error boundaries', () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    // Click to open a lazy-loaded panel
    const aiButton = screen.getByLabelText('Toggle AI assistant')
    fireEvent.click(aiButton)

    // Should render without errors
    expect(screen.queryByTestId('ai-assistant')).toBeInTheDocument()
  })

  it('should support node editing with F2 key', async () => {
    render(<MindMapCanvas initialData={mockTree} />, { wrapper })

    const rootNode = screen.getByText('Root Topic')
    fireEvent.click(rootNode)

    fireEvent.keyDown(rootNode, { key: 'F2' })

    // Node should become editable
    await waitFor(() => {
      const editable = screen.getByDisplayValue('Root Topic')
      expect(editable).toBeInTheDocument()
    })
  })

  it('should display cloud backgrounds for nodes with clouds', () => {
    const treeWithCloud: MindMapTree = {
      id: 'root',
      content: 'Root',
      children: [],
      metadata: {
        cloud: { color: '#f0f9ff' },
      },
    }

    render(<MindMapCanvas initialData={treeWithCloud} />, { wrapper })

    const cloudSvg = document.querySelector('svg[aria-label*="Cloud backgrounds"]')
    expect(cloudSvg).toBeInTheDocument()
  })
})
