// Mock components for testing
import { vi } from 'vitest'
import React from 'react'

/**
 * Mock for AIAssistantPanel (lazy-loaded component)
 */
export const MockAIAssistantPanel = vi.fn((props: any) => {
  return React.createElement('div', { 'data-testid': 'ai-assistant-panel' }, [
    React.createElement('h3', { key: 'title' }, 'AI Assistant Panel'),
    React.createElement('div', { key: 'visible' }, `Visible: ${props.visible ? 'true' : 'false'}`),
    React.createElement('div', { key: 'node' }, `Selected Node: ${props.selectedNodeId || 'none'}`),
    React.createElement('button', { key: 'close', onClick: props.onClose }, 'Close'),
  ])
})

/**
 * Mock for PresentationMode (lazy-loaded component)
 */
export const MockPresentationMode = vi.fn((props: any) => {
  return React.createElement('div', { 'data-testid': 'presentation-mode' }, [
    React.createElement('h3', { key: 'title' }, 'Presentation Mode'),
    React.createElement('div', { key: 'active' }, `Active: ${props.isActive ? 'true' : 'false'}`),
    React.createElement('button', { key: 'exit', onClick: props.onExit }, 'Exit'),
  ])
})

/**
 * Mock for ThreeDView (lazy-loaded component)
 */
export const MockThreeDView = vi.fn((props: any) => {
  return React.createElement('div', { 'data-testid': 'three-d-view' }, [
    React.createElement('h3', { key: 'title' }, '3D View'),
    React.createElement('div', { key: 'active' }, `Active: ${props.isActive ? 'true' : 'false'}`),
    React.createElement('button', { key: 'exit', onClick: props.onExit }, 'Exit 3D'),
  ])
})

/**
 * Mock for CommentsPanel (lazy-loaded component)
 */
export const MockCommentsPanel = vi.fn((props: any) => {
  return React.createElement('div', { 'data-testid': 'comments-panel' }, [
    React.createElement('h3', { key: 'title' }, 'Comments Panel'),
    React.createElement('div', { key: 'node' }, `Node ID: ${props.nodeId || 'none'}`),
    React.createElement('button', { key: 'close', onClick: props.onClose }, 'Close Comments'),
  ])
})

/**
 * Mock for RichTextEditor
 */
export const MockRichTextEditor = vi.fn((props: any) => {
  return React.createElement('div', { 'data-testid': 'rich-text-editor' }, [
    React.createElement('textarea', {
      key: 'textarea',
      'data-testid': 'editor-textarea',
      defaultValue: props.content,
      onChange: (e: any) => props.onSave?.(e.target.value),
    }),
    React.createElement(
      'button',
      {
        key: 'save',
        onClick: () => props.onSave?.(props.content),
      },
      'Save'
    ),
  ])
})

/**
 * Setup component mocks for testing
 */
export const setupComponentMocks = () => {
  vi.mock('../../components/AIAssistantPanel', () => ({
    default: MockAIAssistantPanel,
  }))

  vi.mock('../../components/PresentationMode', () => ({
    default: MockPresentationMode,
  }))

  vi.mock('../../components/ThreeDView', () => ({
    default: MockThreeDView,
  }))

  vi.mock('../../components/CommentsPanel', () => ({
    default: MockCommentsPanel,
  }))

  vi.mock('../../components/RichTextEditor', () => ({
    default: MockRichTextEditor,
  }))
}
