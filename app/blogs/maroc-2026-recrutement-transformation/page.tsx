import React from "react";
import NavBar from "../../../components/NavBar";
import Footer from "../../../components/Footer";
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
    <div className="min-h-screen bg-optional1">
      <BlogStructuredData />
      <NavBar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-white via-optional1 to-green-50/30 pt-20 pb-16 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-primary/20 to-green-400/20 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <span className="bg-gradient-to-r from-primary/10 to-green-100/50 backdrop-blur-sm border border-primary/20 text-primary px-5 py-2 rounded-full text-sm font-semibold font-accent shadow-sm">
                Marché de l'emploi
              </span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold text-secondary mb-6 leading-tight tracking-tight">
              Le Maroc de 2026 : Pourquoi le recrutement ne sera plus jamais comme avant
            </h1>
            <div className="flex items-center justify-center text-gray-600 font-body">
              <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>25 Janvier 2026</span>
              <span className="mx-3">•</span>
              <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>5 min de lecture</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          <div className="mb-12 rounded-2xl overflow-hidden shadow-xl border-2 border-gray-100">
            <img
              src="/img1.jpg" 
              alt="Le Maroc de 2026 - Transformation du recrutement"
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>

          {/* Article Body */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-gradient-to-r from-primary/5 to-green-50/50 border-l-4 border-primary p-6 mb-8 rounded-r-xl shadow-sm">
              <p className="font-body text-lg text-gray-700 leading-relaxed font-medium">
                Du nord au sud, d'Agadir à Oujda, le Maroc vit une transformation sans précédent. En 2026, avec des projets colossaux comme l'organisation de la Coupe du Monde, le développement de l'Hydrogène vert et l'essor de la "Digital Factory" nationale, le marché de l'emploi explose.
              </p>
            </div>

            <p className="font-body text-gray-700 text-lg leading-relaxed mb-8">
              Mais un problème persiste : comment connecter efficacement les <strong className="text-primary">350 000 jeunes</strong> qui arrivent sur le marché cette année avec les entreprises qui recrutent ?
            </p>

            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 p-8 mb-8">
              <h2 className="font-heading text-2xl font-bold text-secondary mb-6 flex items-center">
                <span className="bg-gradient-to-br from-primary/10 to-green-100/50 text-primary rounded-xl w-10 h-10 flex items-center justify-center text-lg font-bold mr-4 border-2 border-primary/20">1</span>
                La fin des frontières géographiques
              </h2>
              <p className="font-body text-gray-700 leading-relaxed mb-4">
                Aujourd'hui, un talent à Fès peut travailler pour une startup à Casablanca, et un ingénieur de Marrakech peut piloter des projets à Tanger. Le télétravail est désormais officiellement encadré par le Code du Travail marocain, ouvrant la voie à une mobilité nationale digitale.
              </p>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 mt-5">
                <p className="font-accent text-green-800 font-bold mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  L'impact FaceJob :
                </p>
                <p className="font-body text-green-700">
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
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-primary">Transition Énergétique</h3>
                  </div>
                  <p className="text-sm text-gray-600">Ingénieurs et techniciens en solaire/éolien</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-primary-1">Économie Numérique</h3>
                  </div>
                  <p className="text-sm text-gray-600">Développeurs, experts en cybersécurité et marketing digital</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-primary-2">Logistique & Transport</h3>
                  </div>
                  <p className="text-sm text-gray-600">Managers de supply chain pour nos ports et aéroports</p>
                </div>
              </div>
            </div>

            {/* Conclusion */}
            <div className="bg-gradient-to-r from-primary to-green-600 text-white rounded-2xl p-8 mb-8 shadow-lg">
              <h2 className="font-heading text-2xl font-bold mb-4">Conclusion</h2>
              <p className="font-body text-lg leading-relaxed mb-6">
                Que vous soyez une PME à Meknès ou une multinationale à Rabat, le défi est le même : trouver l'humain derrière le dossier. FaceJob est le pont qui relie toutes les régions du Maroc pour que chaque talent, où qu'il soit, puisse briller.
              </p>
              <Link 
                href="/offres" 
                className="group inline-flex items-center bg-white text-primary px-6 py-3 rounded-xl font-accent font-bold hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Parcourez les opportunités partout au Maroc sur FaceJob.ma
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Share Section */}
            <div className="border-t-2 border-gray-200 pt-8">
              <h3 className="font-heading text-lg font-bold mb-4 text-secondary">Partager cet article</h3>
              <div className="flex flex-wrap gap-3">
                <button className="bg-[#1877F2] text-white px-5 py-2.5 rounded-xl hover:bg-[#166FE5] transition-all duration-300 font-accent font-semibold shadow-md hover:shadow-lg">
                  Facebook
                </button>
                <button className="bg-[#1DA1F2] text-white px-5 py-2.5 rounded-xl hover:bg-[#1A8CD8] transition-all duration-300 font-accent font-semibold shadow-md hover:shadow-lg">
                  Twitter
                </button>
                <button className="bg-[#0A66C2] text-white px-5 py-2.5 rounded-xl hover:bg-[#095196] transition-all duration-300 font-accent font-semibold shadow-md hover:shadow-lg">
                  LinkedIn
                </button>
              </div>
            </div>

            {/* Back to Blog */}
            <div className="mt-12 text-center">
              <Link 
                href="/blogs" 
                className="group inline-flex items-center text-primary hover:text-primary-1 font-accent font-semibold transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2 transform rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Retour au blog
              </Link>
            </div>
          </div>
        </div>
      </article>
      
      <Footer />
    </div>
  );
};

export default Blog1Page;
