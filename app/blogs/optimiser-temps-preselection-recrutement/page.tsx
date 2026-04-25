import React from "react";
import NavBar from "../../../components/NavBar";
import Footer from "../../../components/Footer";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Optimiser le Temps de Pré-sélection en Recrutement : Diviser par Deux avec le CV Vidéo | FaceJob",
  description: "Découvrez comment diviser par deux votre temps de pré-sélection en recrutement au Maroc. Le CV vidéo révolutionne le processus RH et optimise l'efficacité des recruteurs.",
  keywords: "optimiser recrutement maroc, temps pré-sélection, cv vidéo recrutement, efficacité rh maroc, processus recrutement, recruteurs maroc, pme maroc recrutement",
  openGraph: {
    title: "Optimiser le Temps de Pré-sélection en Recrutement : Diviser par Deux avec le CV Vidéo",
    description: "Dans le dynamisme économique actuel du Maroc, le temps est la ressource la plus précieuse des recruteurs",
    type: "article",
    locale: "fr_FR",
    url: "https://facejob.ma/blogs/optimiser-temps-preselection-recrutement",
  },
  alternates: {
    canonical: "https://facejob.ma/blogs/optimiser-temps-preselection-recrutement",
  },
};

const Blog2Page: React.FC = () => {
  return (
    <div className="min-h-screen bg-optional1">
      <NavBar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-white via-optional1 to-green-50/30 pt-20 pb-16 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-primary/20 to-green-400/20 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <span className="bg-gradient-to-r from-primary/10 to-green-100/50 backdrop-blur-sm border border-primary/20 text-primary px-5 py-2 rounded-full text-sm font-semibold font-accent shadow-sm inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Optimisation RH
              </span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold text-secondary mb-6 leading-tight tracking-tight">
              Recrutement : Comment diviser votre temps de pré-sélection par deux ?
            </h1>
            <div className="flex items-center justify-center text-gray-600 font-body">
              <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>20 Janvier 2026</span>
              <span className="mx-3">•</span>
              <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>4 min de lecture</span>
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
              src="/img2.jpg" 
              alt="Optimisation du temps de recrutement avec le CV vidéo"
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>

          {/* Article Body */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-primary-light border-l-4 border-primary p-6 mb-8 rounded-r-lg">
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                Dans le dynamisme économique actuel du Maroc, le temps est la ressource la plus précieuse des recruteurs. Pourtant, beaucoup passent encore des heures à trier des piles de CV papier qui se ressemblent tous.
              </p>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              Le constat est souvent le même : un candidat peut être parfait sur le papier, mais l'entretien physique révèle en 2 minutes que le "fit" culturel n'est pas là. <strong>Et si vous pouviez avoir ce flash dès la première étape ?</strong>
            </p>

            <div className="bg-red-50 rounded-xl shadow-lg p-8 mb-8 border-l-4 border-red-500">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                ❌ Le problème : Le "CV Papier" ne parle pas
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Le CV traditionnel est un outil statique. Il liste des diplômes et des dates, mais il est incapable de vous montrer :
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-700">
                  <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">✗</span>
                  L'aisance relationnelle du candidat
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">✗</span>
                  Sa capacité à s'exprimer (essentielle pour les postes de vente ou de management)
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">✗</span>
                  Son énergie et sa motivation réelle
                </li>
              </ul>
              <div className="bg-red-100 p-4 rounded-lg">
                <p className="text-red-800 font-semibold">
                  <strong>Résultat :</strong> Vous invitez 10 personnes en entretien pour n'en retenir qu'une, perdant ainsi des journées entières.
                </p>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl shadow-lg p-8 mb-8 border-l-4 border-primary">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                ✅ La solution : La pré-qualification par le CV Vidéo
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                C'est ici que <strong>FaceJob</strong> transforme votre quotidien. En demandant un CV Vidéo dès la candidature, vous changez de paradigme.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-primary mb-2">Le filtre immédiat</h3>
                  <p className="text-sm text-gray-600">Visionner une vidéo de 60 secondes est 5 fois plus rapide que de lire un CV et d'essayer d'imaginer la personne derrière.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-primary-1 mb-2">La fin des "erreurs de casting"</h3>
                  <p className="text-sm text-gray-600">Vous ne recevez en entretien que les candidats dont vous avez déjà validé le savoir-être (soft skills).</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-primary-2 mb-2">Une marque employeur moderne</h3>
                  <p className="text-sm text-gray-600">Au Maroc, la guerre des talents est réelle. Proposer un processus innovant attire les profils les plus dynamiques.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-gradient-to-br from-primary/10 to-green-100/50 text-primary rounded-xl w-10 h-10 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                Comment intégrer FaceJob dans votre routine ?
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Pas besoin de changer vos habitudes. Sur <strong>FaceJob.ma</strong>, nous avons conçu une interface qui s'adapte aux PME Marocaines :
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="bg-gradient-to-br from-primary/10 to-green-100/50 text-primary rounded-xl w-10 h-10 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Accès centralisé</h3>
                    <p className="text-gray-600">Toutes les vidéos de vos candidats sont au même endroit.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-gradient-to-br from-blue-500/10 to-blue-100/50 text-blue-600 rounded-xl w-10 h-10 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Partage collaboratif</h3>
                    <p className="text-gray-600">Envoyez les vidéos qui vous plaisent à vos managers en un clic pour obtenir leur avis immédiat.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-gradient-to-br from-purple-500/10 to-purple-100/50 text-purple-600 rounded-xl w-10 h-10 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Filtres locaux</h3>
                    <p className="text-gray-600">Ciblez spécifiquement les talents résidant dans votre ville ou prêts à s'y installer.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Ce qu'en disent les recruteurs
              </h2>
              <blockquote className="text-center">
                <p className="text-lg text-gray-700 italic mb-4 leading-relaxed">
                  "Depuis que nous utilisons la vidéo pour nos recrutements au Maroc, nous avons réduit nos entretiens physiques de 40%. On ne voit plus que la 'crème de la crème'."
                </p>
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-4">
                    RH
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Directeur RH</p>
                    <p className="text-sm text-gray-500">PME Casablancaise</p>
                  </div>
                </div>
              </blockquote>
            </div>

            {/* Conclusion */}
            <div className="bg-gradient-to-r from-primary to-green-600 text-white rounded-2xl p-8 mb-8 shadow-lg">
              <h2 className="font-heading text-2xl font-bold mb-4">Conclusion</h2>
              <p className="font-body text-lg leading-relaxed mb-6">
                Le recrutement de demain au Maroc ne se lit pas, il se regarde. Êtes-vous prêt à optimiser votre temps et à sécuriser vos embauches ?
              </p>
              <Link 
                href="/auth/signup-entreprise" 
                className="group inline-flex items-center bg-white text-primary px-6 py-3 rounded-xl font-accent font-bold hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Découvrez nos offres entreprises sur FaceJob.ma et publiez vos premières annonces gratuitement
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
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

export default Blog2Page;
