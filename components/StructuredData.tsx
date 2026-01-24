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
    "description": "Plateforme d'emploi innovante au Maroc permettant aux candidats de postuler avec leur CV vidéo",
    "url": baseUrl,
    "logo": `${baseUrl}/images/facejobLogo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": `${baseUrl}/contact`
    },
    "sameAs": [
      "https://www.linkedin.com/company/facejob",
      "https://www.facebook.com/facejob",
      "https://twitter.com/facejob"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "MA",
      "addressLocality": "Casablanca"
    },
    "foundingDate": "2023",
    "industry": "Human Resources",
    "numberOfEmployees": "10-50",
    "serviceArea": {
      "@type": "Country",
      "name": "Morocco"
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
    "description": "Plateforme d'emploi avec CV vidéo au Maroc",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/offres?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "FaceJob",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/facejobLogo.png`
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}