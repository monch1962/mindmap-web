import { vi } from 'vitest'
import type { ReactNode } from 'react'

// Mock ReactFlow component
export const ReactFlow = vi.fn(({ children, nodes, edges, ...props }: any) => {
  return {
    type: 'ReactFlow',
    props: { ...props, nodes, edges },
    children,
  }
})

// Mock ReactFlowProvider
export const ReactFlowProvider = vi.fn(({ children }: { children: ReactNode }) => {
  return children
})

// Mock Handle component
export const Handle = vi.fn((props: any) => {
  return {
    type: 'Handle',
    props,
  }
})

// Mock Position enum
export const Position = {
  Top: 'top',
  Right: 'right',
  Bottom: 'bottom',
  Left: 'left',
} as const

// Mock BaseEdge component
export const BaseEdge = vi.fn((props: any) => {
  return {
    type: 'BaseEdge',
    props,
  }
})

// Mock EdgeLabelRenderer component
export const EdgeLabelRenderer = vi.fn(({ children }: { children: ReactNode }) => {
  return children
})

// Mock getBezierPath function
export const getBezierPath = vi.fn(() => {
  return ['M0,0 C10,10 20,20 30,30', 15, 15]
})

// Mock useReactFlow hook
export const useReactFlow = vi.fn(() => ({
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
  fitView: vi.fn(),
  getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
  setViewport: vi.fn(),
  zoomTo: vi.fn(),
  setNodes: vi.fn(),
  setEdges: vi.fn(),
  getNodes: vi.fn(() => []),
  getEdges: vi.fn(() => []),
  getNode: vi.fn(() => null),
  getEdge: vi.fn(() => null),
  addNodes: vi.fn(),
  addEdges: vi.fn(),
  updateNode: vi.fn(),
  updateEdge: vi.fn(),
  deleteElements: vi.fn(),
  toObject: vi.fn(() => ({ nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } })),
}))

// Mock types
export type Node = {
  id: string
  position: { x: number; y: number }
  data: any
  type?: string
  style?: any
}

export type Edge = {
  id: string
  source: string
  target: string
  type?: string
  label?: string
  style?: any
}

export type NodeProps = {
  id: string
  data: any
  selected?: boolean
  dragging?: boolean
}

export type EdgeProps = {
  id: string
  source: string
  target: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: string
  targetPosition: string
  selected?: boolean
  label?: string
  labelStyle?: any
  labelShowBg?: boolean
  labelBgStyle?: any
}

// Mock default export
export default {
  ReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
}
