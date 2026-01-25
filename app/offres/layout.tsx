import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offres d'Emploi au Maroc | FaceJob - Trouvez votre emploi idéal",
  description: "Découvrez des milliers d'offres d'emploi au Maroc sur FaceJob. Postulez facilement avec votre CV vidéo et trouvez l'emploi de vos rêves dans tous les secteurs.",
  keywords: [
    "emploi maroc",
    "offres emploi",
    "travail maroc",
    "recrutement maroc",
    "cv video",
    "facejob",
    "job maroc",
    "carrière maroc",
    "opportunités emploi",
    "recherche emploi"
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
    canonical: '/offres',
  },
  openGraph: {
    title: "Offres d'Emploi au Maroc | FaceJob",
    description: "Découvrez des milliers d'offres d'emploi au Maroc. Postulez avec votre CV vidéo sur FaceJob.",
    url: '/offres',
    siteName: 'FaceJob',
    images: [
      {
        url: '/images/facejobLogo.png',
        width: 1200,
        height: 630,
        alt: 'FaceJob - Offres d\'emploi au Maroc',
      },
    ],
    locale: 'fr_MA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Offres d'Emploi au Maroc | FaceJob",
    description: "Découvrez des milliers d'offres d'emploi au Maroc. Postulez avec votre CV vidéo sur FaceJob.",
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

export default function OffresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}