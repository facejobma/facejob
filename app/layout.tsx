import Providers from "@/components/layout/providers";
// import { Toaster } from "@/components/ui/toaster";
// import "@uploadthing/react/styles.css";
import "./globals.css";
// import "../styles/globals.css";
// import React from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "react-hot-toast";
import localFont from "next/font/local";
import { Metadata } from "next";

const inter = localFont({
  src: [
    {
      path: "../public/fonts/Inter-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Inter-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "CV Vidéo Maroc | Trouvez votre emploi avec FaceJob",
    template: "%s | FaceJob - Emploi au Maroc"
  },
  description: "Créez votre CV vidéo gratuit et trouvez votre emploi idéal au Maroc. Plus de 1000 offres d'emploi et recruteurs qui vous attendent. Démarquez-vous avec FaceJob.ma",
  keywords: [
    "cv vidéo maroc",
    "emploi maroc",
    "recrutement vidéo",
    "job maroc",
    "offres emploi casablanca",
    "travail rabat",
    "plateforme emploi maroc",
    "candidature vidéo",
    "facejob",
    "carrière maroc",
    "recherche emploi",
    "recrutement casablanca",
    "emploi rabat",
    "job casablanca",
    "travail maroc"
  ],
  authors: [{ name: "FaceJob", url: "https://facejob.ma" }],
  creator: "FaceJob",
  publisher: "FaceJob",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://facejob.ma'),
  alternates: {
    canonical: '/',
    languages: {
      'fr-MA': '/',
      'ar-MA': '/ar',
    },
  },
  openGraph: {
    title: "CV Vidéo Maroc | Trouvez votre emploi avec FaceJob",
    description: "Créez votre CV vidéo gratuit et trouvez votre emploi idéal au Maroc. Plus de 1000 offres d'emploi et recruteurs qui vous attendent.",
    url: '/',
    siteName: 'FaceJob',
    images: [
      {
        url: '/images/facejobLogo.png',
        width: 1200,
        height: 630,
        alt: 'FaceJob - Plateforme d\'emploi avec CV vidéo au Maroc',
      },
    ],
    locale: 'fr_MA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "CV Vidéo Maroc | Trouvez votre emploi avec FaceJob",
    description: "Créez votre CV vidéo gratuit et trouvez votre emploi idéal au Maroc. Démarquez-vous avec votre CV vidéo.",
    images: ['/images/facejobLogo.png'],
    creator: '@facejob_ma',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  category: 'Employment',
  classification: 'Job Search Platform',
  other: {
    'geo.region': 'MA',
    'geo.country': 'Morocco',
    'geo.placename': 'Morocco',
    'ICBM': '31.7917, -7.0926',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = "tmpSession";
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans">
        <Toaster position="top-center" />
        <Providers session={session}>
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS!!} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
