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
    default: "FaceJob - Plateforme d'emploi avec CV vidéo au Maroc",
    template: "%s | FaceJob"
  },
  description: "Trouvez votre emploi idéal au Maroc avec FaceJob. Postulez avec votre CV vidéo et connectez-vous directement avec les recruteurs. Des milliers d'offres d'emploi vous attendent.",
  keywords: [
    "emploi maroc",
    "cv video",
    "recrutement maroc",
    "offres emploi",
    "travail maroc",
    "facejob",
    "job maroc",
    "carrière maroc",
    "recherche emploi",
    "plateforme emploi"
  ],
  authors: [{ name: "FaceJob" }],
  creator: "FaceJob",
  publisher: "FaceJob",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://facejob.ma'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "FaceJob - Plateforme d'emploi avec CV vidéo au Maroc",
    description: "Trouvez votre emploi idéal au Maroc avec FaceJob. Postulez avec votre CV vidéo et connectez-vous directement avec les recruteurs.",
    url: '/',
    siteName: 'FaceJob',
    images: [
      {
        url: '/images/facejobLogo.png',
        width: 1200,
        height: 630,
        alt: 'FaceJob - Plateforme d\'emploi au Maroc',
      },
    ],
    locale: 'fr_MA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "FaceJob - Plateforme d'emploi avec CV vidéo au Maroc",
    description: "Trouvez votre emploi idéal au Maroc avec FaceJob. Postulez avec votre CV vidéo.",
    images: ['/images/facejobLogo.png'],
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
