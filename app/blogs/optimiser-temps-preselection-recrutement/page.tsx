import React from "react";
import NavBar from "../../../components/NavBar";
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
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-1 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-4">
              <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                ⏱️ Optimisation RH
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Recrutement : Comment diviser votre temps de pré-sélection par deux ?
            </h1>
            <div className="flex items-center justify-center text-white/80 text-sm">
              <span>20 Janvier 2026</span>
              <span className="mx-3">•</span>
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
                  <div className="text-3xl mb-3">⚡</div>
                  <h3 className="font-bold text-primary mb-2">Le filtre immédiat</h3>
                  <p className="text-sm text-gray-600">Visionner une vidéo de 60 secondes est 5 fois plus rapide que de lire un CV et d'essayer d'imaginer la personne derrière.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-3xl mb-3">🎯</div>
                  <h3 className="font-bold text-primary-1 mb-2">La fin des "erreurs de casting"</h3>
                  <p className="text-sm text-gray-600">Vous ne recevez en entretien que les candidats dont vous avez déjà validé le savoir-être (soft skills).</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-3xl mb-3">🚀</div>
                  <h3 className="font-bold text-primary-2 mb-2">Une marque employeur moderne</h3>
                  <p className="text-sm text-gray-600">Au Maroc, la guerre des talents est réelle. Proposer un processus innovant attire les profils les plus dynamiques.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-primary-light text-primary rounded-full w-8 h-8 flex items-center justify-center text-lg mr-3">🔧</span>
                Comment intégrer FaceJob dans votre routine ?
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Pas besoin de changer vos habitudes. Sur <strong>FaceJob.ma</strong>, nous avons conçu une interface qui s'adapte aux PME Marocaines :
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="bg-primary-light text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">📁</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Accès centralisé</h3>
                    <p className="text-gray-600">Toutes les vidéos de vos candidats sont au même endroit.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-primary-1 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">👥</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Partage collaboratif</h3>
                    <p className="text-gray-600">Envoyez les vidéos qui vous plaisent à vos managers en un clic pour obtenir leur avis immédiat.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-primary-2 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">📍</span>
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
            <div className="bg-gradient-to-r from-primary to-primary-1 text-white rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Conclusion</h2>
              <p className="text-lg leading-relaxed mb-6">
                Le recrutement de demain au Maroc ne se lit pas, il se regarde. Êtes-vous prêt à optimiser votre temps et à sécuriser vos embauches ?
              </p>
              <Link 
                href="/auth/signup-entreprise" 
                className="inline-flex items-center bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                👉 Découvrez nos offres entreprises sur FaceJob.ma et publiez vos premières annonces gratuitement
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
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

export default Blog2Page;
