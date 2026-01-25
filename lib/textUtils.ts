/**
 * Utility functions for text processing
 */

/**
 * Strips HTML tags and converts HTML content to plain text (SSR-safe)
 * @param html - HTML string to convert
 * @returns Plain text string
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  
  // Handle common HTML entities first
  const entityMap: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&hellip;': '...',
    '&mdash;': '—',
    '&ndash;': '–',
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&rdquo;': '"',
    '&ldquo;': '"',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
  };

  // Decode HTML entities
  let text = html;
  Object.keys(entityMap).forEach(entity => {
    const regex = new RegExp(entity, 'g');
    text = text.replace(regex, entityMap[entity]);
  });

  // Remove HTML tags using regex (SSR-safe)
  text = text.replace(/<[^>]*>/g, '');
  
  // Handle common HTML structures for better formatting
  text = text.replace(/<\/p>/gi, '\n\n'); // Paragraphs
  text = text.replace(/<br\s*\/?>/gi, '\n'); // Line breaks
  text = text.replace(/<\/h[1-6]>/gi, '\n\n'); // Headings
  text = text.replace(/<\/li>/gi, '\n'); // List items
  text = text.replace(/<\/div>/gi, '\n'); // Divs
  
  // Clean up extra whitespace and normalize line breaks
  text = text.replace(/\s+/g, ' '); // Multiple spaces to single space
  text = text.replace(/\n\s+/g, '\n'); // Remove spaces after line breaks
  text = text.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive line breaks
  text = text.trim();
  
  return text;
};

/**
 * Truncates text to a specified length and adds ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length of the text
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  
  // Find the last space before the max length to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};

/**
 * Extracts a preview/summary from HTML content
 * @param html - HTML content
 * @param maxLength - Maximum length of the preview
 * @returns Plain text preview
 */
export const getTextPreview = (html: string, maxLength: number = 200): string => {
  const plainText = stripHtmlTags(html);
  return truncateText(plainText, maxLength);
};