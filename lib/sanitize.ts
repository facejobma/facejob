/**
 * HTML Sanitization Utility
 * Prevents XSS attacks by sanitizing HTML content
 */

import DOMPurify from 'dompurify';

// Create a safe DOMPurify instance
let purify: typeof DOMPurify;

if (typeof window !== 'undefined') {
  // Client-side: use browser's window
  purify = DOMPurify(window);
} else {
  // Server-side: use a minimal implementation
  // For server-side rendering, we'll use a simple fallback
  purify = {
    sanitize: (dirty: string) => dirty,
    setConfig: () => {},
    clearConfig: () => {},
    isSupported: false,
    removed: [],
    version: '0.0.0',
    addHook: () => {},
    removeHook: () => {},
    removeHooks: () => {},
    removeAllHooks: () => {},
  } as any;
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows only safe HTML tags and attributes
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  
  // Only sanitize on client-side where DOMPurify works properly
  if (typeof window === 'undefined') {
    // Server-side: return as-is, will be sanitized on client
    return dirty;
  }
  
  // Configure DOMPurify with strict settings
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
    RETURN_TRUSTED_TYPE: false,
  };

  // Sanitize the HTML
  const clean = purify.sanitize(dirty, config);
  
  return clean;
}

/**
 * Strip all HTML tags from content
 * Use this for plain text display
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  
  // Only strip on client-side
  if (typeof window === 'undefined') {
    return html;
  }
  
  const clean = purify.sanitize(html, { 
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true 
  });
  
  return clean;
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return url;
  } catch {
    return '';
  }
}
