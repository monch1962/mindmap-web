import { describe, it, expect } from 'vitest'
import { sanitizeHtml, sanitizeHtmlWithLinks, stripHtml } from './sanitize'

describe('sanitizeHtml', () => {
  it('should allow safe HTML tags', () => {
    const input = '<b>bold</b> and <i>italic</i>'
    const result = sanitizeHtml(input)
    expect(result).toContain('<b>bold</b>')
    expect(result).toContain('<i>italic</i>')
  })

  it('should remove script tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>'
    const result = sanitizeHtml(input)
    expect(result).not.toContain('<script>')
    expect(result).toContain('<p>Hello</p>')
  })

  it('should remove event handlers', () => {
    const input = '<p onclick="alert("xss")">Click me</p>'
    const result = sanitizeHtml(input)
    expect(result).not.toContain('onclick')
  })

  it('should remove iframe tags', () => {
    const input = '<p>Text</p><iframe src="evil.com"></iframe>'
    const result = sanitizeHtml(input)
    expect(result).not.toContain('<iframe>')
  })

  it('should allow links with safe attributes', () => {
    const input = '<a href="https://example.com">Link</a>'
    const result = sanitizeHtml(input)
    expect(result).toContain('href="https://example.com"')
    expect(result).toContain('>Link<')
  })

  it('should remove javascript: links', () => {
    const input = '<a href="javascript:alert("xss")">Click</a>'
    const result = sanitizeHtml(input)
    expect(result).not.toContain('javascript:')
  })

  it('should handle empty string', () => {
    const result = sanitizeHtml('')
    expect(result).toBe('')
  })

  it('should handle null input gracefully', () => {
    const result = sanitizeHtml(null as unknown as string)
    expect(result).toBe('')
  })
})

describe('stripHtml', () => {
  it('should remove all HTML tags', () => {
    const input = '<p>Hello <b>world</b></p>'
    const result = stripHtml(input)
    expect(result).toBe('Hello world')
  })

  it('should handle nested tags', () => {
    const input = '<div><p><strong>Bold text</strong></p></div>'
    const result = stripHtml(input)
    expect(result).toBe('Bold text')
  })

  it('should handle empty string', () => {
    const result = stripHtml('')
    expect(result).toBe('')
  })

  it('should preserve text content', () => {
    const input = 'Just plain text'
    const result = stripHtml(input)
    expect(result).toBe('Just plain text')
  })

  it('should handle line breaks', () => {
    const input = '<p>Line 1</p><p>Line 2</p>'
    const result = stripHtml(input)
    expect(result).toContain('Line 1')
    expect(result).toContain('Line 2')
  })
})

describe('sanitizeHtmlWithLinks', () => {
  it('should allow safe HTML tags including links', () => {
    const input = '<b>bold</b> and <a href="https://example.com">link</a>'
    const result = sanitizeHtmlWithLinks(input)
    expect(result).toContain('<b>bold</b>')
    expect(result).toContain('<a href="https://example.com">link</a>')
  })

  it('should remove script tags even with links allowed', () => {
    const input = '<a href="https://example.com">Link</a><script>alert("xss")</script>'
    const result = sanitizeHtmlWithLinks(input)
    expect(result).not.toContain('<script>')
    expect(result).toContain('<a href="https://example.com">Link</a>')
  })

  it('should remove javascript: links', () => {
    const input = '<a href="javascript:alert("xss")">Click me</a>'
    const result = sanitizeHtmlWithLinks(input)
    expect(result).not.toContain('javascript:')
  })

  it('should remove dangerous attributes from links', () => {
    const input =
      '<a href="https://example.com" onclick="alert("xss")" onmouseover="evil()">Link</a>'
    const result = sanitizeHtmlWithLinks(input)
    expect(result).toContain('href="https://example.com"')
    expect(result).not.toContain('onclick')
    expect(result).not.toContain('onmouseover')
  })

  it('should handle empty string', () => {
    const result = sanitizeHtmlWithLinks('')
    expect(result).toBe('')
  })

  it('should handle null input gracefully', () => {
    const result = sanitizeHtmlWithLinks(null as unknown as string)
    expect(result).toBe('')
  })

  it('should preserve safe link attributes', () => {
    const input =
      '<a href="https://example.com" title="Example" target="_blank" rel="noopener">Link</a>'
    const result = sanitizeHtmlWithLinks(input)
    expect(result).toContain('href="https://example.com"')
    expect(result).toContain('title="Example"')
    expect(result).toContain('target="_blank"')
    expect(result).toContain('rel="noopener"')
  })

  it('should remove data: URLs from links', () => {
    const input = '<a href="data:text/html,<script>alert("xss")</script>">Malicious</a>'
    const result = sanitizeHtmlWithLinks(input)
    expect(result).not.toContain('data:')
  })

  it('should remove vbscript: URLs from links', () => {
    const input = '<a href="vbscript:alert("xss")">VBScript</a>'
    const result = sanitizeHtmlWithLinks(input)
    expect(result).not.toContain('vbscript:')
  })
})

// Advanced XSS attack tests
describe('XSS attack prevention', () => {
  it('should prevent classic script injection', () => {
    const attacks = [
      '<script>alert("XSS")</script>',
      '<img src="x" onerror="alert("XSS")">',
      '<svg onload="alert("XSS")">',
      '<iframe src="javascript:alert("XSS")">',
      '<body onload="alert("XSS")">',
      '<input type="image" src="x" onerror="alert("XSS")">',
      '<video><source onerror="alert("XSS")">',
      '<audio><source onerror="alert("XSS")">',
    ]

    attacks.forEach(attack => {
      const result = sanitizeHtml(attack)
      expect(result).not.toContain('alert')
      expect(result).not.toContain('onerror')
      expect(result).not.toContain('onload')
      expect(result).not.toContain('javascript:')
    })
  })

  it('should prevent encoded XSS attacks', () => {
    const attacks = [
      '&lt;script&gt;alert("XSS")&lt;/script&gt;', // HTML entities should remain as text
      '%3Cscript%3Ealert("XSS")%3C/script%3E', // URL encoded should remain as text
      String.fromCharCode(60) +
        'script' +
        String.fromCharCode(62) +
        'alert("XSS")' +
        String.fromCharCode(60) +
        '/script' +
        String.fromCharCode(62), // Char codes should be sanitized
      '<scr<script>ipt>alert("XSS")</scr</script>ipt>', // Nested script tags should be removed
    ]

    attacks.forEach((attack, index) => {
      const result = sanitizeHtml(attack)

      if (index === 0) {
        // HTML entities should remain as text (not decoded)
        expect(result).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;') // Should remain as text
        expect(result).not.toContain('<script>') // Should not become actual script tag
      } else if (index === 1) {
        // URL encoded should remain as text (not decoded)
        expect(result).toBe('%3Cscript%3Ealert("XSS")%3C/script%3E') // Should remain as text
        expect(result).not.toContain('<script>') // Should not become actual script tag
      } else if (index === 2) {
        // Character codes should be sanitized (removed since they create actual tags)
        expect(result).not.toContain('<script>')
        // The result should not contain actual script tags
        expect(result).not.toMatch(/<script[^>]*>/i)
        expect(result).not.toMatch(/<\/script>/i)
        // Text like "alert" may remain but it's just plain text, not executable code
      } else if (index === 3) {
        // Nested script tags should be removed
        // DOMPurify removes script tags but may leave text content as plain text
        // This is secure because script tags are removed
        expect(result).not.toContain('<script>')
        // The result should not contain actual script tags
        expect(result).not.toMatch(/<script[^>]*>/i)
        expect(result).not.toMatch(/<\/script>/i)
        // Text like "alert" may remain but it's just plain text, not executable code
      }
    })
  })

  it('should prevent CSS-based XSS', () => {
    const attacks = [
      '<div style="background: url(javascript:alert("XSS"))">',
      '<style>@import "javascript:alert("XSS")";</style>',
      '<link rel="stylesheet" href="javascript:alert("XSS")">',
    ]

    attacks.forEach(attack => {
      const result = sanitizeHtml(attack)
      expect(result).not.toContain('javascript:')
      expect(result).not.toContain('@import')
    })
  })

  it('should prevent DOM clobbering attacks', () => {
    const attack = '<form id="test"><input name="parentNode" value="clobbered"></form>'
    const result = sanitizeHtml(attack)
    expect(result).not.toContain('<form')
    expect(result).not.toContain('<input')
  })
})

// File upload security tests
describe('file upload security', () => {
  it('should prevent SVG-based XSS', () => {
    const maliciousSVG = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert("XSS")"></svg>'
    const result = sanitizeHtml(maliciousSVG)
    expect(result).not.toContain('<svg')
    expect(result).not.toContain('onload')
  })

  it('should prevent HTML entity bypass attacks', () => {
    const attacks = [
      '&lt;img src=x onerror=alert("XSS")&gt;',
      '&#60;img src=x onerror=alert("XSS")&#62;',
      '&#x3c;img src=x onerror=alert("XSS")&#x3e;',
    ]

    attacks.forEach(attack => {
      const result = sanitizeHtml(attack)
      // HTML entities should remain as text, not be decoded
      // So they should contain the literal text 'onerror' and 'alert' as part of the entity
      expect(result).toBe(attack) // Should remain unchanged as text
      expect(result).not.toContain('<img') // Should not become actual img tag
    })
  })
})
