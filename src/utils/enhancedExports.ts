/**
 * Enhanced export utilities for MindMap application
 * Supports PDF, PowerPoint, Notion/Obsidian, and Google Docs formats
 */

import type { MindMapTree } from '../types';

/**
 * Export mind map to PDF (using browser print with PDF optimization)
 */
export function exportToPDF(tree: MindMapTree): void {
  // Create a print-friendly version
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = generatePrintableHTML(tree);
  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}

/**
 * Generate printable HTML for PDF export
 */
function generatePrintableHTML(tree: MindMapTree): string {
  const renderNode = (node: MindMapTree, level: number = 0): string => {
    const indent = level * 20;
    const children = node.children
      .map(child => renderNode(child, level + 1))
      .join('');

    return `
      <div style="margin-left: ${indent}px; margin-bottom: 8px;">
        <strong>${escapeHtml(node.content)}</strong>
      </div>
      ${children}
    `;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Mind Map Export</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          line-height: 1.6;
        }
        h1 {
          color: #333;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>Mind Map: ${escapeHtml(tree.content)}</h1>
      <div>${renderNode(tree)}</div>
      <div class="no-print" style="margin-top: 40px; text-align: center;">
        <button onclick="window.print()" style="
          padding: 12px 24px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        ">Print / Save as PDF</button>
      </div>
    </body>
    </html>
  `;
}

/**
 * Export mind map to PowerPoint (PPTX) format
 * Generates a downloadable file
 */
export async function exportToPowerPoint(tree: MindMapTree): Promise<void> {
  // For PPTX, we'll create a simple HTML presentation that can be opened in PowerPoint
  const slides = generatePowerPointSlides(tree);

  const blob = new Blob([slides], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mindmap.ppt';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate PowerPoint-compatible HTML slides
 */
function generatePowerPointSlides(tree: MindMapTree): string {
  const renderSlide = (node: MindMapTree): string => {
    const children = node.children.slice(0, 6); // Max 6 bullet points per slide
    const bullets = children
      .map(child => `<li>${escapeHtml(child.content)}</li>`)
      .join('');

    return `
      <div style="slide: true;">
        <h1 style="font-size: 44pt; color: #333;">${escapeHtml(node.content)}</h1>
        <ul style="font-size: 28pt; margin-left: 60px;">
          ${bullets}
        </ul>
      </div>
    `;
  };

  return `
    <!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:powerpoint">
    <head>
      <meta charset="utf-8">
      <title>Mind Map Presentation</title>
      <style>
        body { font-family: Arial, sans-serif; }
        div[slide=true] {
          page-break-after: always;
          padding: 40px;
          min-height: 100vh;
        }
      </style>
    </head>
    <body>
      ${renderSlide(tree)}
      ${tree.children.map((child) => renderSlide(child)).join('')}
    </body>
    </html>
  `;
}

/**
 * Export mind map to Notion/Obsidian markdown format
 */
export function exportToNotionObsidian(tree: MindMapTree, format: 'notion' | 'obsidian'): string {
  const lines: string[] = [];

  if (format === 'notion') {
    lines.push(`# ${tree.content}`);
    lines.push('');
    renderNodeForNotion(tree, lines, 0);
  } else {
    // Obsidian format with wikilinks
    lines.push(`# ${tree.content}`);
    lines.push('');
    renderNodeForObsidian(tree, lines, 0);
  }

  return lines.join('\n');
}

/**
 * Render node for Notion format
 */
function renderNodeForNotion(node: MindMapTree, lines: string[], level: number): void {
  const indent = '  '.repeat(level);
  const prefix = level === 0 ? '' : `${indent}- `;

  lines.push(`${prefix}${node.content}`);

  if (node.children.length > 0) {
    node.children.forEach(child => renderNodeForNotion(child, lines, level + 1));
  }
}

/**
 * Render node for Obsidian format
 */
function renderNodeForObsidian(node: MindMapTree, lines: string[], level: number): void {
  const indent = level > 0 ? '\t'.repeat(level) : '';
  const prefix = level === 0 ? '' : '-';

  lines.push(`${indent}${prefix} ${node.content}`);

  if (node.children.length > 0) {
    node.children.forEach(child => renderNodeForObsidian(child, lines, level + 1));
  }
}

/**
 * Export mind map as downloadable markdown file
 */
export function downloadMarkdown(tree: MindMapTree, filename: string = 'mindmap.md'): void {
  const markdown = exportToNotionObsidian(tree, 'obsidian');
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import from Google Docs format
 * Google Docs exports to HTML, which we can parse
 */
export async function importFromGoogleDocs(htmlContent: string): Promise<MindMapTree> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // Try to extract structure from headings and lists
  const rootContent = doc.querySelector('h1')?.textContent || 'Imported Mind Map';

  const buildTreeFromElement = (element: Element): MindMapTree => {
    const children: MindMapTree[] = [];

    // Process list items
    const listItems = element.querySelectorAll(':scope > li, :scope > p');
    listItems.forEach(item => {
      const text = item.textContent?.trim();
      if (text) {
        children.push({
          id: Date.now().toString() + Math.random(),
          content: text,
          children: [],
        });
      }
    });

    return {
      id: Date.now().toString(),
      content: rootContent,
      children,
    };
  };

  return buildTreeFromElement(doc.body);
}

/**
 * Helper function to escape HTML
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Create a presentation from mind map (series of slides)
 */
export function createPresentation(tree: MindMapTree): void {
  const slides: string[] = [];

  const createSlide = (node: MindMapTree): void => {
    const children = node.children.slice(0, 5);
    const bulletPoints = children
      .map(child => `  - ${child.content}`)
      .join('\n');

    slides.push(`
---
# ${node.content}

${bulletPoints}
`);

    node.children.forEach(child => createSlide(child));
  };

  createSlide(tree);

  // Download as markdown presentation
  const markdown = slides.join('\n');
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mindmap-presentation.md';
  a.click();
  URL.revokeObjectURL(url);
}
