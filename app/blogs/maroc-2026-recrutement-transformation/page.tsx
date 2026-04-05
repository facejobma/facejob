import React from "react";
import NavBar from "../../../components/NavBar";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Le Maroc de 2026 : Transformation du Recrutement avec la Coupe du Monde | FaceJob",
  description: "Découvrez comment le Maroc de 2026 transforme le marché de l'emploi avec la Coupe du Monde, l'hydrogène vert et la Digital Factory. 350 000 jeunes sur le marché cette année.",
  keywords: "maroc 2026, recrutement maroc, coupe du monde emploi, hydrogène vert maroc, digital factory, emploi maroc, cv vidéo, transformation économique maroc",
  openGraph: {
    title: "Le Maroc de 2026 : Transformation du Recrutement avec la Coupe du Monde",
    description: "Du nord au sud, d'Agadir à Oujda, le Maroc vit une transformation sans précédent en 2026",
    type: "article",
    locale: "fr_FR",
    url: "https://facejob.ma/blogs/maroc-2026-recrutement-transformation",
  },
  alternates: {
    canonical: "https://facejob.ma/blogs/maroc-2026-recrutement-transformation",
  },
};

function BlogStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://facejob.ma';
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "Le Maroc de 2026 : Pourquoi le recrutement ne sera plus jamais comme avant",
    "description": "Du nord au sud, d'Agadir à Oujda, le Maroc vit une transformation sans précédent. En 2026, avec des projets colossaux comme l'organisation de la Coupe du Monde, le développement de l'Hydrogène vert et l'essor de la Digital Factory nationale, le marché de l'emploi explose.",
    "image": `${baseUrl}/img1.jpg`,
    "author": {
      "@type": "Organization",
      "name": "FaceJob"
    },
    "publisher": {
      "@type": "Organization",
      "name": "FaceJob",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/facejobLogo.png`
      }
    },
    "datePublished": "2026-01-25",
    "dateModified": "2026-01-25",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blogs/maroc-2026-recrutement-transformation`
    },
    "articleSection": "Marché de l'emploi",
    "keywords": ["maroc 2026", "recrutement", "coupe du monde", "hydrogène vert", "digital factory", "emploi"],
    "wordCount": 800,
    "timeRequired": "PT5M",
    "inLanguage": "fr-FR"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

const Blog1Page: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <BlogStructuredData />
      <NavBar />
      
      {/* White space for transparent navbar */}
      <div className="h-20 bg-white" />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-1 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-4">
              <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                Marché de l'emploi
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Le Maroc de 2026 : Pourquoi le recrutement ne sera plus jamais comme avant
            </h1>
            <div className="flex items-center justify-center text-white/80 text-sm">
              <span>25 Janvier 2026</span>
              <span className="mx-3">•</span>
              <span>5 min de lecture</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="/img1.jpg" 
              alt="Le Maroc de 2026 - Transformation du recrutement"
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>

          {/* Article Body */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-primary-light border-l-4 border-primary p-6 mb-8 rounded-r-lg">
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                Du nord au sud, d'Agadir à Oujda, le Maroc vit une transformation sans précédent. En 2026, avec des projets colossaux comme l'organisation de la Coupe du Monde, le développement de l'Hydrogène vert et l'essor de la "Digital Factory" nationale, le marché de l'emploi explose.
              </p>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              Mais un problème persiste : comment connecter efficacement les <strong>350 000 jeunes</strong> qui arrivent sur le marché cette année avec les entreprises qui recrutent ?
            </p>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-primary-light text-primary rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mr-3">1</span>
                La fin des frontières géographiques
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Aujourd'hui, un talent à Fès peut travailler pour une startup à Casablanca, et un ingénieur de Marrakech peut piloter des projets à Tanger. Le télétravail est désormais officiellement encadré par le Code du Travail marocain, ouvrant la voie à une mobilité nationale digitale.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold mb-2"> L'impact FaceJob :</p>
                <p className="text-green-700">
                  Le CV Vidéo permet de casser la distance. Un recruteur à Casa peut "rencontrer" virtuellement un candidat de Ouarzazate en 60 secondes, sans que personne n'ait à prendre le train.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-primary-2 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mr-3">2</span>
                L'ère des "Soft Skills" : Au-delà du diplôme
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Le Maroc de 2026 ne cherche plus seulement des têtes bien pleines, mais des personnalités agiles. Dans des secteurs en tension comme l'IT, l'hôtellerie de luxe ou les énergies renouvelables, les entreprises privilégient :
              </p>
              <ul className="space-y-3 mb-4">
                <li className="flex items-center text-gray-700">
                  <span className="bg-primary-light text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">✓</span>
                  La capacité de communication
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="bg-primary-light text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">✓</span>
                  L'esprit d'initiative
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="bg-primary-light text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">✓</span>
                  L'intelligence émotionnelle
                </li>
              </ul>
              <p className="text-gray-700 font-medium">
                Le papier ne peut pas prouver ces qualités. <span className="text-primary font-bold">La vidéo, si.</span>
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-primary-3 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mr-3">3</span>
                "Digital X.0" : Le recrutement au service de la souveraineté numérique
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Avec la stratégie nationale de digitalisation, le Maroc ambitionne de devenir un hub technologique africain. FaceJob s'inscrit dans cette vision en offrant une plateforme moderne qui utilise l'IA pour aider les candidats à mieux se présenter et les recruteurs à mieux choisir.
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mr-3">4</span>
                Les secteurs qui recrutent partout au Maroc en 2026
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <h3 className="font-bold text-primary mb-2">🌱 Transition Énergétique</h3>
                  <p className="text-sm text-gray-600">Ingénieurs et techniciens en solaire/éolien</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <h3 className="font-bold text-primary-1 mb-2">💻 Économie Numérique</h3>
                  <p className="text-sm text-gray-600">Développeurs, experts en cybersécurité et marketing digital</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <h3 className="font-bold text-primary-2 mb-2">🚚 Logistique & Transport</h3>
                  <p className="text-sm text-gray-600">Managers de supply chain pour nos ports et aéroports</p>
                </div>
              </div>
            </div>

            {/* Conclusion */}
            <div className="bg-gradient-to-r from-primary to-primary-1 text-white rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Conclusion</h2>
              <p className="text-lg leading-relaxed mb-6">
                Que vous soyez une PME à Meknès ou une multinationale à Rabat, le défi est le même : trouver l'humain derrière le dossier. FaceJob est le pont qui relie toutes les régions du Maroc pour que chaque talent, où qu'il soit, puisse briller.
              </p>
              <Link 
                href="/offres" 
                className="inline-flex items-center bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                👉 Parcourez les opportunités partout au Maroc sur FaceJob.ma
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Share Section */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Partager cet article</h3>
              <div className="flex space-x-4">
                <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-1 transition-colors">
                  Facebook
                </button>
                <button className="bg-primary-1 text-white px-4 py-2 rounded-lg hover:bg-primary-2 transition-colors">
                  Twitter
                </button>
                <button className="bg-primary-2 text-white px-4 py-2 rounded-lg hover:bg-primary-3 transition-colors">
                  LinkedIn
                </button>
              </div>
            </div>

            {/* Back to Blog */}
            <div className="mt-12 text-center">
              <Link 
                href="/blogs" 
                className="inline-flex items-center text-primary hover:text-primary-1 font-semibold transition-colors"
              >
                <svg className="w-4 h-4 mr-2 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Retour au blog
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default Blog1Page;
