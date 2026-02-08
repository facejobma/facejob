#!/bin/bash

# Install Security Dependencies for Offer Creation System
# This script installs the required npm packages for secure HTML editing and sanitization

echo "🔒 Installing security dependencies for offer creation system..."
echo ""

# Check if we're in the facejob directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the facejob directory."
    exit 1
fi

echo "📦 Installing Tiptap rich text editor..."
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder

echo ""
echo "🧹 Installing DOMPurify for HTML sanitization..."
npm install isomorphic-dompurify

echo ""
echo "📝 Installing type definitions..."
npm install --save-dev @types/dompurify

echo ""
echo "✅ All security dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Review the SECURITY_IMPROVEMENTS_OFFER_CREATION.md file"
echo "2. Test the offer creation form at /dashboard/entreprise/publier"
echo "3. Verify HTML sanitization is working correctly"
echo ""
