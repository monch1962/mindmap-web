import { describe, it, expect } from 'vitest';
import { sanitizeHtml, stripHtml } from './sanitize';

describe('sanitizeHtml', () => {
  it('should allow safe HTML tags', () => {
    const input = '<b>bold</b> and <i>italic</i>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<b>bold</b>');
    expect(result).toContain('<i>italic</i>');
  });

  it('should remove script tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('<p>Hello</p>');
  });

  it('should remove event handlers', () => {
    const input = '<p onclick="alert("xss")">Click me</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onclick');
  });

  it('should remove iframe tags', () => {
    const input = '<p>Text</p><iframe src="evil.com"></iframe>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<iframe>');
  });

  it('should allow links with safe attributes', () => {
    const input = '<a href="https://example.com">Link</a>';
    const result = sanitizeHtml(input);
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('>Link<');
  });

  it('should remove javascript: links', () => {
    const input = '<a href="javascript:alert("xss")">Click</a>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('javascript:');
  });

  it('should handle empty string', () => {
    const result = sanitizeHtml('');
    expect(result).toBe('');
  });

  it('should handle null input gracefully', () => {
    const result = sanitizeHtml(null as unknown as string);
    expect(result).toBe('');
  });
});

describe('stripHtml', () => {
  it('should remove all HTML tags', () => {
    const input = '<p>Hello <b>world</b></p>';
    const result = stripHtml(input);
    expect(result).toBe('Hello world');
  });

  it('should handle nested tags', () => {
    const input = '<div><p><strong>Bold text</strong></p></div>';
    const result = stripHtml(input);
    expect(result).toBe('Bold text');
  });

  it('should handle empty string', () => {
    const result = stripHtml('');
    expect(result).toBe('');
  });

  it('should preserve text content', () => {
    const input = 'Just plain text';
    const result = stripHtml(input);
    expect(result).toBe('Just plain text');
  });

  it('should handle line breaks', () => {
    const input = '<p>Line 1</p><p>Line 2</p>';
    const result = stripHtml(input);
    expect(result).toContain('Line 1');
    expect(result).toContain('Line 2');
  });
});
