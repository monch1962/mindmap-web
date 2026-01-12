import { useCallback } from 'react'
import type { Node, Edge } from 'reactflow'
import type { MindMapTree, MindMapNodeData, MindMapNode } from '../types'
import { flowToTree, treeToFlow } from '../utils/mindmapConverter'
import {
  stringifyJSON,
  parseJSON,
  parseFreeMind,
  toFreeMind,
  parseOPML,
  toOPML,
  parseMarkdown,
  toMarkdown,
  toD2,
  toYaml,
  parseYaml,
} from '../utils/formats'
import { exportToPDF, exportToPowerPoint, createPresentation } from '../utils/enhancedExports'

export type FileExportFormat =
  | 'json'
  | 'freemind'
  | 'opml'
  | 'markdown'
  | 'd2'
  | 'yaml'
  | 'pdf'
  | 'powerpoint'
  | 'presentation'

export type FileImportFormat = 'json' | 'freemind' | 'opml' | 'markdown' | 'yaml'

interface UseFileOperationsOptions {
  nodes: Node<MindMapNodeData>[]
  edges: Edge[]
  setNodes: (nodes: Node<MindMapNodeData>[]) => void
  setEdges: (edges: Edge[]) => void
  fitView: (options?: { padding?: number; duration?: number }) => void
}

/**
 * Custom hook for file import/export operations
 * Handles loading and saving mind maps in various formats
 */
export function useFileOperations({
  nodes,
  edges,
  setNodes,
  setEdges,
  fitView,
}: UseFileOperationsOptions) {
  /**
   * Export mind map to various file formats
   */
  const saveToFile = useCallback(
    (format: FileExportFormat) => {
      const tree = flowToTree(nodes as MindMapNode[], edges)
      if (!tree) return

      // Handle special export formats
      if (format === 'pdf') {
        exportToPDF(tree)
        return
      }

      if (format === 'powerpoint') {
        exportToPowerPoint(tree)
        return
      }

      if (format === 'presentation') {
        createPresentation(tree)
        return
      }

      let content: string
      let filename: string
      let mimeType: string

      switch (format) {
        case 'json':
          content = stringifyJSON(tree)
          filename = 'mindmap.json'
          mimeType = 'application/json'
          break
        case 'freemind':
          content = toFreeMind(tree)
          filename = 'mindmap.mm'
          mimeType = 'application/xml'
          break
        case 'opml':
          content = toOPML(tree)
          filename = 'mindmap.opml'
          mimeType = 'application/xml'
          break
        case 'markdown':
          content = toMarkdown(tree)
          filename = 'mindmap.md'
          mimeType = 'text/markdown'
          break
        case 'd2':
          content = toD2(tree)
          filename = 'mindmap.d2'
          mimeType = 'text/plain'
          break
        case 'yaml':
          content = toYaml(tree)
          filename = 'mindmap.yaml'
          mimeType = 'text/yaml'
          break
        default:
          return
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    },
    [nodes, edges]
  )

  /**
   * Import mind map from various file formats
   */
  const loadFromFile = useCallback(
    (format: FileImportFormat) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept =
        format === 'json'
          ? '.json'
          : format === 'freemind'
            ? '.mm'
            : format === 'opml'
              ? '.opml'
              : format === 'yaml'
                ? '.yaml,.yml'
                : '.md'

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        const text = await file.text()
        let tree: MindMapTree

        try {
          switch (format) {
            case 'json':
              tree = parseJSON(text)
              break
            case 'freemind':
              tree = parseFreeMind(text)
              break
            case 'opml':
              tree = parseOPML(text)
              break
            case 'markdown':
              tree = parseMarkdown(text)
              break
            case 'yaml':
              tree = parseYaml(text)
              break
          }

          const { nodes: newNodes, edges: newEdges } = treeToFlow(tree, true) // Use auto-layout for imports
          setNodes(newNodes as Node<MindMapNodeData>[])
          setEdges(newEdges)

          // Fit view to show all nodes after a short delay to ensure rendering
          setTimeout(() => fitView({ padding: 0.2 }), 100)
        } catch (error) {
          alert(`Error loading file: ${error}`)
        }
      }

      input.click()
    },
    [fitView, setNodes, setEdges]
  )

  /**
   * Export mind map as PNG image
   */
  const exportAsPNG = useCallback(() => {
    // Create a canvas element
    const canvas = document.createElement('canvas')
    canvas.width = 1920
    canvas.height = 1080
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // For simplicity, we'll create an SVG first and then draw it to canvas
    // This is a basic implementation - a more robust solution would use html2canvas
    const svgElement = document.querySelector('.react-flow__viewport') as SVGElement
    if (!svgElement) return

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const img = new Image()
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)

      // Download the image
      const pngUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = pngUrl
      a.download = 'mindmap.png'
      a.click()
    }

    img.src = url
  }, [])

  /**
   * Export mind map as SVG image
   */
  const exportAsSVG = useCallback(() => {
    const svgElement = document.querySelector('.react-flow__viewport') as SVGElement
    if (!svgElement) return

    const serializer = new XMLSerializer()
    let source = serializer.serializeToString(svgElement)

    // Add namespaces
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
    }
    if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"')
    }

    // Add XML declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source

    // Create blob and download
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mindmap.svg'
    a.click()
  }, [])

  return {
    saveToFile,
    loadFromFile,
    exportAsPNG,
    exportAsSVG,
  }
}
