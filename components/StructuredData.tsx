"use client";

import { useEffect, useState } from 'react';

interface JobPosting {
  id: number;
  titre: string;
  description: string;
  company_name: string;
  sector_name: string;
  job_name: string;
  location: string;
  contractType: string;
  date_debut: string;
  date_fin: string;
  created_at: string;
}

export function JobListingStructuredData({ offers }: { offers: JobPosting[] }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://facejob.ma';

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Offres d'emploi FaceJob",
    "description": "Liste des offres d'emploi disponibles sur FaceJob au Maroc",
    "url": `${baseUrl}/offres`,
    "numberOfItems": offers.length,
    "itemListElement": offers.slice(0, 20).map((offer, index) => ({
      "@type": "JobPosting",
      "position": index + 1,
      "title": offer.titre,
      "description": offer.description,
      "datePosted": offer.created_at,
      "validThrough": offer.date_fin,
      "employmentType": offer.contractType === "CDI" ? "FULL_TIME" : 
                      offer.contractType === "CDD" ? "TEMPORARY" : 
                      offer.contractType === "Stage" ? "INTERN" : "OTHER",
      "hiringOrganization": {
        "@type": "Organization",
        "name": offer.company_name
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": offer.location,
          "addressCountry": "MA"
        }
      },
      "industry": offer.sector_name,
      "occupationalCategory": offer.job_name,
      "url": `${baseUrl}/offres?offerId=${offer.id}`,
      "applicationContact": {
        "@type": "ContactPoint",
        "contactType": "HR",
        "url": `${baseUrl}/auth/login-candidate?returnUrl=/dashboard/candidat/offres&offerId=${offer.id}`
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function OrganizationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://facejob.ma';

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FaceJob",
    "alternateName": "FaceJob.ma",
    "description": "Plateforme d'emploi innovante au Maroc permettant aux candidats de postuler avec leur CV vidéo et aux entreprises de découvrir les talents cachés",
    "url": baseUrl,
    "logo": `${baseUrl}/facejobLogo.png`,
    "image": `${baseUrl}/facejobLogo.png`,
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "url": `${baseUrl}/contact`,
        "availableLanguage": ["French", "Arabic"]
      },
      {
        "@type": "ContactPoint",
        "contactType": "technical support",
        "email": "contact@facejob.ma",
        "availableLanguage": ["French", "Arabic"]
      }
    ],
    "sameAs": [
      "https://www.linkedin.com/company/facejob-ma",
      "https://www.facebook.com/people/facejob/100085933744117/",
      "https://www.instagram.com/facejob.ma/",
      "https://twitter.com/facejob_"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "MA",
      "addressLocality": "Casablanca",
      "addressRegion": "Casablanca-Settat"
    },
    "foundingDate": "2023",
    "industry": "Human Resources Services",
    "numberOfEmployees": "10-50",
    "serviceArea": {
      "@type": "Country",
      "name": "Morocco"
    },
    "knowsAbout": [
      "Video CV",
      "Job Search",
      "Recruitment",
      "Employment in Morocco",
      "Career Development"
    ],
    "makesOffer": {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "CV Vidéo et Recherche d'Emploi",
        "description": "Service gratuit de création de CV vidéo et de recherche d'emploi au Maroc"
      },
      "price": "0",
      "priceCurrency": "MAD"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function WebSiteStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://facejob.ma';

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "FaceJob",
    "alternateName": "FaceJob.ma",
    "description": "Plateforme d'emploi avec CV vidéo au Maroc - Trouvez votre emploi idéal",
    "url": baseUrl,
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/offres?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    ],
    "publisher": {
      "@type": "Organization",
      "name": "FaceJob",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/facejobLogo.png`,
        "width": 200,
        "height": 200
      }
    },
    "inLanguage": "fr-MA",
    "copyrightYear": "2023",
    "copyrightHolder": {
      "@type": "Organization",
      "name": "FaceJob"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function FAQStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Qu'est-ce que FaceJob ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "FaceJob est la première plateforme d'emploi au Maroc qui permet aux candidats de créer leur CV vidéo gratuitement et aux entreprises de découvrir les talents cachés. Notre solution met le pouvoir des réseaux sociaux et du digital entre les mains des recruteurs et des chercheurs d'emploi."
        }
      },
      {
        "@type": "Question",
        "name": "Comment créer un CV vidéo sur FaceJob ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "C'est simple : 1) Créez votre compte candidat gratuitement, 2) Enregistrez votre vidéo de présentation de 2 minutes maximum, 3) Publiez votre profil et postulez aux offres qui vous intéressent. Plus de 783 candidats ont déjà trouvé leur emploi grâce à FaceJob."
        }
      },
      {
        "@type": "Question",
        "name": "Quels sont les avantages du CV vidéo ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Le CV vidéo vous permet de vous démarquer des autres candidats, de montrer votre personnalité et votre dynamisme, de tester vos compétences linguistiques, et de créer une connexion directe avec les recruteurs. C'est une manière originale et efficace de présenter votre profil professionnel."
        }
      },
      {
        "@type": "Question",
        "name": "FaceJob est-il gratuit ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Oui, FaceJob est 100% gratuit pour les candidats. Vous pouvez créer votre compte, enregistrer votre CV vidéo et postuler aux offres sans aucun frais. L'inscription ne prend que 2 minutes."
        }
      },
      {
        "@type": "Question",
        "name": "Dans quelles villes FaceJob est-il disponible au Maroc ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "FaceJob est disponible dans tout le Maroc, avec des offres d'emploi dans les principales villes comme Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir et bien d'autres. Notre plateforme couvre tous les secteurs d'activité au niveau national."
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://facejob.ma';
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${baseUrl}${item.url}`
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}