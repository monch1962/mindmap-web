/**
 * Options for file download
 */
export interface DownloadOptions {
  /** MIME type of the file (default: 'text/plain') */
  mimeType?: string
  /** Whether to revoke the object URL after download (default: true) */
  revokeUrl?: boolean
  /** Additional attributes to set on the anchor element */
  anchorAttributes?: Record<string, string>
}

/**
 * Downloads a file with the given content and filename
 * Replaces duplicated file download code across the codebase
 *
 * @param content - The file content as string, Blob, or ArrayBuffer
 * @param filename - The name of the file to download
 * @param options - Optional download configuration
 */
export function downloadFile(
  content: string | Blob | ArrayBuffer,
  filename: string,
  options: DownloadOptions = {}
): void {
  const { mimeType = 'text/plain', revokeUrl = true, anchorAttributes = {} } = options

  // Convert content to Blob if needed
  let blob: Blob
  if (content instanceof Blob) {
    blob = content
  } else if (content instanceof ArrayBuffer) {
    blob = new Blob([content], { type: mimeType })
  } else {
    blob = new Blob([content], { type: mimeType })
  }

  // Create object URL
  const url = URL.createObjectURL(blob)

  // Create anchor element
  const a = document.createElement('a')
  a.href = url
  a.download = filename

  // Set additional attributes if provided
  Object.entries(anchorAttributes).forEach(([key, value]) => {
    a.setAttribute(key, value)
  })

  // Trigger download
  a.click()

  // Clean up
  if (revokeUrl) {
    URL.revokeObjectURL(url)
  }
}

/**
 * Downloads a JSON file with pretty-printed content
 *
 * @param data - The data to serialize as JSON
 * @param filename - The name of the file to download (default: 'data.json')
 */
export function downloadJSON(data: unknown, filename: string = 'data.json'): void {
  const content = JSON.stringify(data, null, 2)
  downloadFile(content, filename, { mimeType: 'application/json' })
}

/**
 * Downloads an HTML file
 *
 * @param html - The HTML content
 * @param filename - The name of the file to download (default: 'document.html')
 */
export function downloadHTML(html: string, filename: string = 'document.html'): void {
  downloadFile(html, filename, { mimeType: 'text/html' })
}

/**
 * Downloads a CSV file
 *
 * @param csv - The CSV content
 * @param filename - The name of the file to download (default: 'data.csv')
 */
export function downloadCSV(csv: string, filename: string = 'data.csv'): void {
  downloadFile(csv, filename, { mimeType: 'text/csv;charset=utf-8' })
}

/**
 * Downloads a Markdown file
 *
 * @param markdown - The Markdown content
 * @param filename - The name of the file to download (default: 'document.md')
 */
export function downloadMarkdown(markdown: string, filename: string = 'document.md'): void {
  downloadFile(markdown, filename, { mimeType: 'text/markdown' })
}

/**
 * Downloads a text file
 *
 * @param text - The text content
 * @param filename - The name of the file to download (default: 'document.txt')
 */
export function downloadText(text: string, filename: string = 'document.txt'): void {
  downloadFile(text, filename, { mimeType: 'text/plain' })
}

/**
 * Downloads an image file from a data URL
 *
 * @param dataUrl - The data URL of the image
 * @param filename - The name of the file to download (default: 'image.png')
 */
export function downloadImageFromDataURL(dataUrl: string, filename: string = 'image.png'): void {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

/**
 * Downloads an image file from a Blob
 *
 * @param blob - The image Blob
 * @param filename - The name of the file to download (default: 'image.png')
 */
export function downloadImage(blob: Blob, filename: string = 'image.png'): void {
  downloadFile(blob, filename)
}
