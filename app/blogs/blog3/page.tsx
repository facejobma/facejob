import React from "react";
import NavBar from "../../../components/NavBar";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brillez devant l'objectif : 5 secrets pour oublier la caméra et décrocher votre job au Maroc | FaceJob",
  description: "Découvrez nos 5 astuces pour transformer votre stress en charisme et captiver les recruteurs avec votre CV vidéo. Conseils pratiques pour réussir votre présentation vidéo.",
  keywords: "cv vidéo conseils, présentation vidéo, stress caméra, recrutement maroc, candidature vidéo, conseils emploi maroc",
  openGraph: {
    title: "Brillez devant l'objectif : 5 secrets pour oublier la caméra et décrocher votre job au Maroc",
    description: "Découvrez nos 5 astuces pour transformer votre stress en charisme et captiver les recruteurs",
    type: "article",
    locale: "fr_FR",
  },
};

const Blog3Page: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-4">
              <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                🎥 Conseils Candidats
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Brillez devant l'objectif : 5 secrets pour oublier la caméra et décrocher votre job au Maroc
            </h1>
            <div className="flex items-center justify-center text-white/80 text-sm">
              <span>15 Janvier 2026</span>
              <span className="mx-3">•</span>
              <span>6 min de lecture</span>
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
              src="/img3.jpg" 
              alt="Conseils pour réussir son CV vidéo au Maroc"
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>

          {/* Article Body */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-purple-50 border-l-4 border-purple-500 p-6 mb-8 rounded-r-lg">
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                Imaginez la scène : un recruteur à Casablanca ou Tanger reçoit 200 CVs pour une seule offre d'emploi. 199 sont des documents PDF en noir et blanc, souvent identiques. Le vôtre est une vidéo. En moins d'une minute, vous avez souri, vous avez montré votre énergie et prouvé votre motivation.
              </p>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              Avant même de vous rencontrer, le recruteur a déjà envie de travailler avec vous. <strong>C'est ça, la puissance de FaceJob.ma.</strong>
            </p>

            <div className="bg-orange-50 rounded-xl p-6 mb-8 border-l-4 border-orange-400">
              <p className="text-gray-700 leading-relaxed">
                On ne va pas se mentir : se retrouver face à l'œil noir de son smartphone ou de son ordinateur pour parler de soi, ça peut être intimidant. On bafouille, on se trouve bizarre, on a soudainement l'impression d'avoir oublié son propre nom.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
                Voici nos 5 astuces pour transformer votre stress en charisme et captiver les recruteurs.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-lg mr-4">1</span>
                Parlez à un ami, pas à un robot 🤖
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                L'astuce ultime ? Ne regardez pas votre téléphone comme un appareil électronique. Imaginez que vous expliquez votre parcours à un ami assis juste derrière l'écran, dans votre café préféré de la ville.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 font-semibold">
                  💡 Le petit plus : Souriez dès le début. Le sourire s'entend même dans votre ton de voix et rend votre présentation instantanément plus humaine.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-green-100 text-green-600 rounded-full w-10 h-10 flex items-center justify-center text-lg mr-4">2</span>
                La technique du "Post-it" magique 📝
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ne lisez jamais un texte. Ça se voit, et c'est ennuyeux. À la place, collez un petit Post-it juste à côté de l'objectif de votre caméra avec 3 mots-clés :
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-yellow-100 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">🎓</div>
                  <p className="font-semibold text-gray-800">Votre formation</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">🏆</div>
                  <p className="font-semibold text-gray-800">Votre plus grande réussite</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">💼</div>
                  <p className="font-semibold text-gray-800">Ce que vous voulez apporter</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                Cela vous servira de boussole sans vous transformer en présentateur météo robotisé.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-purple-100 text-purple-600 rounded-full w-10 h-10 flex items-center justify-center text-lg mr-4">3</span>
                Le regard : visez le point vert ! 👀
              </h2>
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <p className="text-red-800 font-semibold mb-2">❌ L'erreur classique :</p>
                <p className="text-red-700">Regarder son propre visage sur l'écran pendant qu'on filme. Résultat ? Sur la vidéo, on a l'impression que vous regardez ailleurs.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 font-semibold mb-2">✅ Le secret :</p>
                <p className="text-green-700">Fixez l'objectif de la caméra (le petit point noir ou vert). C'est là que se trouvent les yeux du recruteur. En faisant cela, vous créez un véritable "contact visuel".</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-orange-100 text-orange-600 rounded-full w-10 h-10 flex items-center justify-center text-lg mr-4">4</span>
                La règle du "Troisième essai" 🎬
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Personne ne réussit du premier coup.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">1</span>
                  <div>
                    <p className="font-semibold text-gray-800">Prise 1 : C'est l'échauffement</p>
                    <p className="text-gray-600">(on bafouille, c'est normal)</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="bg-yellow-100 text-yellow-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">2</span>
                  <div>
                    <p className="font-semibold text-gray-800">Prise 2 : On commence à être à l'aise</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">3</span>
                  <div>
                    <p className="font-semibold text-gray-800">Prise 3 : C'est souvent la bonne !</p>
                    <p className="text-gray-600">C'est là que vous êtes naturel et que votre énergie ressort vraiment.</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <p className="text-blue-800 font-semibold">
                  💡 Ne cherchez pas la perfection, cherchez l'authenticité.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-pink-100 text-pink-600 rounded-full w-10 h-10 flex items-center justify-center text-lg mr-4">5</span>
                Soignez le décor (mais restez vous-même) 🏙️
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Pas besoin d'un studio pro. Voici les essentiels :
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-3">✅</span>
                    <span>Un mur clair</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-3">✅</span>
                    <span>Belle lumière naturelle d'une fenêtre</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-3">✅</span>
                    <span>Environnement calme</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-red-500 mr-3">❌</span>
                    <span>Contre-jour</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-red-500 mr-3">❌</span>
                    <span>Pile de linge en arrière-plan</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-red-500 mr-3">❌</span>
                    <span>Bruits parasites</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700">
                  <strong>Astuce :</strong> Un cadre propre montre votre sérieux et votre sens du détail.
                </p>
              </div>
            </div>

            {/* Le mot de la fin */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Le mot de la fin</h2>
              <p className="text-lg leading-relaxed mb-4">
                Le CV Vidéo n'est pas un concours d'acteur. C'est une porte ouverte sur votre avenir. Les recruteurs au Maroc ne cherchent pas des stars de cinéma, ils cherchent des collaborateurs motivés, clairs et authentiques.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                Prêt à faire la différence ? Prenez votre téléphone, suivez ces conseils et téléchargez votre vidéo sur FaceJob.ma dès aujourd'hui. Le job de vos rêves au Maroc n'attend que votre présentation !
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/auth/signup-candidate" 
                  className="inline-flex items-center justify-center bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Créer mon CV vidéo maintenant
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Workshop CTA */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                🎯 Besoin d'un coup de pouce ?
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Passez nous voir lors de notre prochain atelier FaceJob (date et lieu à communiquer), on vous aide à enregistrer votre vidéo en direct !
              </p>
              <Link 
                href="/contact" 
                className="inline-flex items-center text-yellow-700 hover:text-yellow-800 font-semibold transition-colors"
              >
                Nous contacter pour plus d'infos
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Back to Blog */}
            <div className="mt-12 text-center">
              <Link 
                href="/blogs" 
                className="inline-flex items-center text-purple-600 hover:text-purple-800 font-semibold transition-colors"
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

export default Blog3Page;
