import { Metadata } from "next";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: offerId } = await params;
  
  // In a real app, you'd fetch the offer data here
  // For now, we'll use a generic title
  return {
    title: `Offre d'emploi #${offerId} | FaceJob`,
    description: `Découvrez cette offre d'emploi sur FaceJob. Postulez facilement avec votre CV vidéo.`,
    keywords: [
      "offre emploi",
      "job maroc",
      "recrutement",
      "cv video",
      "facejob",
      "carrière maroc"
    ],
    openGraph: {
      title: `Offre d'emploi #${offerId} | FaceJob`,
      description: `Découvrez cette offre d'emploi sur FaceJob. Postulez facilement avec votre CV vidéo.`,
      url: `/offres/${offerId}`,
      siteName: 'FaceJob',
      images: [
        {
          url: '/images/facejobLogo.png',
          width: 1200,
          height: 630,
          alt: 'FaceJob - Offre d\'emploi',
        },
      ],
      locale: 'fr_MA',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Offre d'emploi #${offerId} | FaceJob`,
      description: `Découvrez cette offre d'emploi sur FaceJob. Postulez facilement avec votre CV vidéo.`,
      images: ['/images/facejobLogo.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function OfferDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}