import type { MindMapTree } from '../../types'

interface SVGNode {
  id: string
  content: string
  x: number
  y: number
  width: number
  height: number
  style?: MindMapTree['style']
  link?: string
  icon?: string
  cloud?: MindMapTree['cloud']
  edgeStyle?: MindMapTree['edgeStyle']
  collapsed?: boolean
  children: SVGNode[]
}

interface LayoutConfig {
  nodeWidth: number
  nodeHeight: number
  horizontalSpacing: number
  verticalSpacing: number
  edgeColor: string
  edgeWidth: number
  fontSize: number
  fontFamily: string
  padding: number
}

/**
 * Convert mind map tree to SVG format
 * Creates a visual representation of the mind map as SVG
 */
export function toSVG(tree: MindMapTree): string {
  // Calculate layout
  const rootNode = calculateLayout(tree)

  // Generate SVG
  return generateSVG(rootNode)
}

/**
 * Default layout configuration
 */
const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  nodeWidth: 120,
  nodeHeight: 40,
  horizontalSpacing: 80,
  verticalSpacing: 60,
  edgeColor: '#666666',
  edgeWidth: 2,
  fontSize: 14,
  fontFamily: 'Arial, sans-serif',
  padding: 20,
}

/**
 * Calculate hierarchical layout for SVG
 */
function calculateLayout(
  tree: MindMapTree,
  depth = 0,
  xOffset = 0,
  config = DEFAULT_LAYOUT_CONFIG
): SVGNode {
  const { nodeWidth, nodeHeight, verticalSpacing, horizontalSpacing } = config

  // Calculate position
  const x = xOffset
  const y = depth * (nodeHeight + verticalSpacing)

  // Create SVG node
  const svgNode: SVGNode = {
    id: tree.id,
    content: tree.content,
    x,
    y,
    width: nodeWidth,
    height: nodeHeight,
    style: tree.style,
    link: tree.link,
    icon: tree.icon,
    cloud: tree.cloud,
    edgeStyle: tree.edgeStyle,
    collapsed: tree.collapsed,
    children: [],
  }

  // Calculate children positions (if not collapsed)
  if (!tree.collapsed && tree.children && tree.children.length > 0) {
    let childXOffset = xOffset - ((tree.children.length - 1) * (nodeWidth + horizontalSpacing)) / 2

    for (const child of tree.children) {
      const childNode = calculateLayout(child, depth + 1, childXOffset, config)
      svgNode.children.push(childNode)
      childXOffset += nodeWidth + horizontalSpacing
    }
  }

  return svgNode
}

/**
 * Generate SVG string from layout
 */
function generateSVG(rootNode: SVGNode, config = DEFAULT_LAYOUT_CONFIG): string {
  const { edgeColor, edgeWidth, fontSize, fontFamily, padding } = config

  // Calculate total bounds
  const bounds = calculateBounds(rootNode)
  const width = bounds.maxX - bounds.minX + 2 * padding
  const height = bounds.maxY - bounds.minY + 2 * padding

  const svgParts: string[] = []

  // XML declaration and SVG opening
  svgParts.push('<?xml version="1.0" encoding="UTF-8"?>')
  svgParts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`
  )

  // Add styles
  svgParts.push('<defs>')
  svgParts.push('  <style type="text/css"><![CDATA[')
  svgParts.push('    .node-text {')
  svgParts.push(`      font-family: ${fontFamily};`)
  svgParts.push(`      font-size: ${fontSize}px;`)
  svgParts.push('      fill: #333333;')
  svgParts.push('      text-anchor: middle;')
  svgParts.push('      dominant-baseline: middle;')
  svgParts.push('    }')
  svgParts.push('    .node-link {')
  svgParts.push('      cursor: pointer;')
  svgParts.push('    }')
  svgParts.push('  ]]></style>')
  svgParts.push('</defs>')

  // Recursively add nodes and edges
  function addNode(node: SVGNode, parentX?: number, parentY?: number) {
    // Adjust coordinates with padding
    const x = node.x - bounds.minX + padding
    const y = node.y - bounds.minY + padding

    // Add edge from parent if exists
    if (parentX !== undefined && parentY !== undefined) {
      const edgeColorValue = node.edgeStyle?.color || edgeColor
      const edgeWidthValue = node.edgeStyle?.width || edgeWidth

      svgParts.push(
        `  <line x1="${parentX}" y1="${parentY + node.height / 2}" x2="${x}" y2="${y}" stroke="${edgeColorValue}" stroke-width="${edgeWidthValue}" />`
      )
    }

    // Add cloud if present
    if (node.cloud) {
      const cloudColor = node.cloud.color || '#e0e0e0'
      const cloudWidth = node.width + 20
      const cloudHeight = node.height + 20
      const cloudX = x - 10
      const cloudY = y - 10

      svgParts.push(
        `  <rect x="${cloudX}" y="${cloudY}" width="${cloudWidth}" height="${cloudHeight}" rx="10" ry="10" fill="${cloudColor}" opacity="0.3" />`
      )
    }

    // Add node rectangle
    const fillColor = node.style?.backgroundColor || '#ffffff'
    const strokeColor = node.style?.color || '#333333'

    svgParts.push(
      `  <rect x="${x}" y="${y}" width="${node.width}" height="${node.height}" rx="5" ry="5" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1" />`
    )

    // Add icon if present
    if (node.icon) {
      const iconX = x + 10
      const iconY = y + node.height / 2
      svgParts.push(
        `  <text x="${iconX}" y="${iconY}" font-family="Arial" font-size="12" fill="${strokeColor}">${escapeSVG(node.icon)}</text>`
      )
    }

    // Add text
    const textX = x + node.width / 2
    const textY = y + node.height / 2
    const fontWeight = node.style?.bold ? 'bold' : 'normal'
    const fontStyle = node.style?.italic ? 'italic' : 'normal'
    const fontSizeValue = node.style?.fontSize || fontSize
    const textColor = node.style?.color || '#333333'

    let textElement = `<text x="${textX}" y="${textY}" class="node-text" font-weight="${fontWeight}" font-style="${fontStyle}" font-size="${fontSizeValue}" fill="${textColor}">${escapeSVG(node.content)}</text>`

    // Wrap in link if URL present
    if (node.link) {
      textElement = `<a href="${escapeSVG(node.link)}" target="_blank" class="node-link">${textElement}</a>`
    }

    svgParts.push(`  ${textElement}`)

    // Add children
    for (const child of node.children) {
      addNode(child, x + node.width / 2, y + node.height)
    }
  }

  // Start adding from root
  addNode(rootNode)

  // Close SVG
  svgParts.push('</svg>')

  return svgParts.join('\n')
}

/**
 * Calculate bounds of all nodes
 */
function calculateBounds(node: SVGNode): {
  minX: number
  maxX: number
  minY: number
  maxY: number
} {
  let minX = node.x
  let maxX = node.x + node.width
  let minY = node.y
  let maxY = node.y + node.height

  for (const child of node.children) {
    const childBounds = calculateBounds(child)
    minX = Math.min(minX, childBounds.minX)
    maxX = Math.max(maxX, childBounds.maxX)
    minY = Math.min(minY, childBounds.minY)
    maxY = Math.max(maxY, childBounds.maxY)
  }

  return { minX, maxX, minY, maxY }
}

/**
 * Escape special characters for SVG
 */
function escapeSVG(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Parse SVG format to mind map tree (basic support)
 * This would parse SVG back to tree structure (challenging but possible for simple SVGs)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function parseSVG(_svgString: string): MindMapTree {
  throw new Error(
    'SVG import is not yet supported. Please use JSON, FreeMind, OPML, or Markdown formats for importing.'
  )
}
