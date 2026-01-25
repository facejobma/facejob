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

  // Vérifier si l'URL actuelle nécessite une redirection
  if (blogRedirects[pathname]) {
    const url = request.nextUrl.clone()
    url.pathname = blogRedirects[pathname]
    return NextResponse.redirect(url, 301) // Redirection permanente pour le SEO
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/blogs/blog1',
    '/blogs/blog2', 
    '/blogs/blog3',
  ]
}