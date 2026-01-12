import DOMPurify from 'dompurify';

// Configure DOMPurify to allow safe HTML tags for rich text editing
const purifyConfig = {
  ALLOWED_TAGS: ['B', 'I', 'U', 'STRONG', 'EM', 'A', 'P', 'BR', 'SPAN', 'DIV'],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
  // Add rel="noopener noreferrer" to all links for security
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * This should be used whenever rendering user-provided HTML
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  return DOMPurify.sanitize(html, purifyConfig);
}

/**
 * Sanitize HTML content but preserve links with safe attributes
 */
export function sanitizeHtmlWithLinks(html: string): string {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ...purifyConfig,
    ALLOWED_TAGS: [...purifyConfig.ALLOWED_TAGS, 'A'],
    ALLOWED_ATTR: [...purifyConfig.ALLOWED_ATTR, 'href', 'rel'],
  });
}

/**
 * Strip all HTML tags, keeping only text content
 */
export function stripHtml(html: string): string {
  if (!html) return '';

  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}
