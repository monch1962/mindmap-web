import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  downloadFile,
  downloadJSON,
  downloadHTML,
  downloadCSV,
  downloadMarkdown,
  downloadText,
  downloadImageFromDataURL,
  downloadImage,
} from './fileDownload'

describe('fileDownload utilities', () => {
  let createElementSpy: ReturnType<typeof vi.spyOn>
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>
  let clickSpy: ReturnType<typeof vi.spyOn>
  let setAttributeSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Mock DOM methods
    createElementSpy = vi.spyOn(document, 'createElement')
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL')
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL')
    clickSpy = vi.fn()
    setAttributeSpy = vi.fn()

    // Mock anchor element
    const mockAnchor = {
      href: '',
      download: '',
      click: clickSpy,
      setAttribute: setAttributeSpy,
    }
    createElementSpy.mockReturnValue(mockAnchor as unknown as HTMLAnchorElement)

    // Mock URL.createObjectURL
    createObjectURLSpy.mockReturnValue('blob:mock-url')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('downloadFile', () => {
    it('downloads a string file with default options', () => {
      const content = 'Hello, World!'
      const filename = 'test.txt'

      downloadFile(content, filename)

      expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob))
      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(clickSpy).toHaveBeenCalled()
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url')
    })

    it('downloads a Blob file', () => {
      const blob = new Blob(['test'], { type: 'text/plain' })
      const filename = 'test.txt'

      downloadFile(blob, filename)

      expect(createObjectURLSpy).toHaveBeenCalledWith(blob)
      expect(clickSpy).toHaveBeenCalled()
    })

    it('downloads an ArrayBuffer file', () => {
      const buffer = new ArrayBuffer(8)
      const filename = 'test.bin'

      downloadFile(buffer, filename)

      expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob))
      expect(clickSpy).toHaveBeenCalled()
    })

    it('uses custom MIME type', () => {
      const content = '{"key": "value"}'
      const filename = 'data.json'
      const options = { mimeType: 'application/json' }

      downloadFile(content, filename, options)

      const blob = createObjectURLSpy.mock.calls[0][0] as Blob
      expect(blob.type).toBe('application/json')
    })

    it('does not revoke URL when revokeUrl is false', () => {
      const content = 'test'
      const filename = 'test.txt'
      const options = { revokeUrl: false }

      downloadFile(content, filename, options)

      expect(revokeObjectURLSpy).not.toHaveBeenCalled()
    })

    it('sets additional anchor attributes', () => {
      const content = 'test'
      const filename = 'test.txt'
      const options = {
        anchorAttributes: {
          'data-testid': 'download-link',
          'aria-label': 'Download file',
        },
      }

      downloadFile(content, filename, options)

      expect(setAttributeSpy).toHaveBeenCalledWith('data-testid', 'download-link')
      expect(setAttributeSpy).toHaveBeenCalledWith('aria-label', 'Download file')
    })

    it('sets download filename correctly', () => {
      const content = 'test'
      const filename = 'custom-name.txt'

      downloadFile(content, filename)

      const mockAnchor = createElementSpy.mock.results[0].value
      expect(mockAnchor.download).toBe(filename)
    })
  })

  describe('downloadJSON', () => {
    it('downloads JSON with pretty formatting', () => {
      const data = { key: 'value', nested: { array: [1, 2, 3] } }
      const filename = 'data.json'

      downloadJSON(data, filename)

      expect(createObjectURLSpy).toHaveBeenCalled()
      const blob = createObjectURLSpy.mock.calls[0][0] as Blob
      expect(blob.type).toBe('application/json')
      expect(clickSpy).toHaveBeenCalled()
    })

    it('uses default filename when not provided', () => {
      const data = { test: true }

      downloadJSON(data)

      const mockAnchor = createElementSpy.mock.results[0].value
      expect(mockAnchor.download).toBe('data.json')
    })
  })

  describe('downloadHTML', () => {
    it('downloads HTML content', () => {
      const html = '<html><body>Test</body></html>'
      const filename = 'page.html'

      downloadHTML(html, filename)

      const blob = createObjectURLSpy.mock.calls[0][0] as Blob
      expect(blob.type).toBe('text/html')
    })

    it('uses default filename when not provided', () => {
      const html = '<div>Test</div>'

      downloadHTML(html)

      const mockAnchor = createElementSpy.mock.results[0].value
      expect(mockAnchor.download).toBe('document.html')
    })
  })

  describe('downloadCSV', () => {
    it('downloads CSV content with correct charset', () => {
      const csv = 'name,age\nJohn,30\nJane,25'
      const filename = 'data.csv'

      downloadCSV(csv, filename)

      const blob = createObjectURLSpy.mock.calls[0][0] as Blob
      expect(blob.type).toBe('text/csv;charset=utf-8')
    })

    it('uses default filename when not provided', () => {
      const csv = 'a,b,c\n1,2,3'

      downloadCSV(csv)

      const mockAnchor = createElementSpy.mock.results[0].value
      expect(mockAnchor.download).toBe('data.csv')
    })
  })

  describe('downloadMarkdown', () => {
    it('downloads Markdown content', () => {
      const markdown = '# Title\n\nSome content'
      const filename = 'doc.md'

      downloadMarkdown(markdown, filename)

      const blob = createObjectURLSpy.mock.calls[0][0] as Blob
      expect(blob.type).toBe('text/markdown')
    })

    it('uses default filename when not provided', () => {
      const markdown = '# Test'

      downloadMarkdown(markdown)

      const mockAnchor = createElementSpy.mock.results[0].value
      expect(mockAnchor.download).toBe('document.md')
    })
  })

  describe('downloadText', () => {
    it('downloads text content', () => {
      const text = 'Plain text content'
      const filename = 'notes.txt'

      downloadText(text, filename)

      const blob = createObjectURLSpy.mock.calls[0][0] as Blob
      expect(blob.type).toBe('text/plain')
    })

    it('uses default filename when not provided', () => {
      const text = 'Hello'

      downloadText(text)

      const mockAnchor = createElementSpy.mock.results[0].value
      expect(mockAnchor.download).toBe('document.txt')
    })
  })

  describe('downloadImageFromDataURL', () => {
    it('downloads image from data URL', () => {
      const dataUrl =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      const filename = 'image.png'

      downloadImageFromDataURL(dataUrl, filename)

      expect(createElementSpy).toHaveBeenCalledWith('a')
      const mockAnchor = createElementSpy.mock.results[0].value
      expect(mockAnchor.href).toBe(dataUrl)
      expect(mockAnchor.download).toBe(filename)
      expect(clickSpy).toHaveBeenCalled()
    })
  })

  describe('downloadImage', () => {
    it('downloads image from Blob', () => {
      const blob = new Blob(['fake image data'], { type: 'image/png' })
      const filename = 'picture.png'

      downloadImage(blob, filename)

      expect(createObjectURLSpy).toHaveBeenCalledWith(blob)
      expect(clickSpy).toHaveBeenCalled()
    })
  })
})
