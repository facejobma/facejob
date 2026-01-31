import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirections SEO pour les anciens URLs de blog
  const blogRedirects: { [key: string]: string } = {
    '/blogs/blog1': '/blogs/maroc-2026-recrutement-transformation',
    '/blogs/blog2': '/blogs/optimiser-temps-preselection-recrutement',
    '/blogs/blog3': '/blogs/cv-video-conseils-reussir-candidature',
  }

  // Vérifier si l'URL actuelle nécessite une redirection SEO
  if (blogRedirects[pathname]) {
    const url = request.nextUrl.clone()
    url.pathname = blogRedirects[pathname]
    return NextResponse.redirect(url, 301) // Redirection permanente pour le SEO
  }

  // Add security headers for all responses
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}

export const config = {
  matcher: [
    // Blog redirects
    '/blogs/blog1',
    '/blogs/blog2', 
    '/blogs/blog3',
    // Apply security headers to all routes except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}