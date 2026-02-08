"use client";

import React from 'react';
import { sanitizeHtml } from '@/lib/sanitize';

interface SafeHtmlDisplayProps {
  html: string;
  className?: string;
}

/**
 * SafeHtmlDisplay Component
 * Safely renders HTML content by sanitizing it first
 * Use this instead of dangerouslySetInnerHTML
 */
const SafeHtmlDisplay: React.FC<SafeHtmlDisplayProps> = ({ html, className = '' }) => {
  const sanitized = sanitizeHtml(html);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};

export default SafeHtmlDisplay;
