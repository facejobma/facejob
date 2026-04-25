import React from "react";
import NavBar from "../../../components/NavBar";
import Footer from "../../../components/Footer";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV Vidéo : 5 Conseils pour Réussir sa Candidature et Décrocher un Job au Maroc | FaceJob",
  description: "Maîtrisez l'art du CV vidéo avec nos 5 conseils d'experts. Transformez votre stress en charisme et captivez les recruteurs marocains. Guide complet pour candidats.",
  keywords: "cv vidéo conseils, réussir candidature maroc, présentation vidéo emploi, stress caméra, recrutement maroc, candidature vidéo, conseils emploi maroc, job maroc",
  openGraph: {
    title: "CV Vidéo : 5 Conseils pour Réussir sa Candidature et Décrocher un Job au Maroc",
    description: "Découvrez nos 5 astuces pour transformer votre stress en charisme et captiver les recruteurs",
    type: "article",
    locale: "fr_FR",
    url: "https://facejob.ma/blogs/cv-video-conseils-reussir-candidature",
  },
  alternates: {
    canonical: "https://facejob.ma/blogs/cv-video-conseils-reussir-candidature",
  },
};

const Blog3Page: React.FC = () => {
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Conseils Candidats
              </span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold text-secondary mb-6 leading-tight tracking-tight">
              Brillez devant l'objectif : 5 secrets pour oublier la caméra et décrocher votre job au Maroc
            </h1>
            <div className="flex items-center justify-center text-gray-600 font-body">
              <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>15 Janvier 2026</span>
              <span className="mx-3">•</span>
              <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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
            <div className="bg-primary-light border-l-4 border-primary p-6 mb-8 rounded-r-lg">
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                Imaginez la scène : un recruteur à Casablanca ou Tanger reçoit 200 CVs pour une seule offre d'emploi. 199 sont des documents PDF en noir et blanc, souvent identiques. Le vôtre est une vidéo. En moins d'une minute, vous avez souri, vous avez montré votre énergie et prouvé votre motivation.
              </p>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              Avant même de vous rencontrer, le recruteur a déjà envie de travailler avec vous. <strong>C'est ça, la puissance de FaceJob.ma.</strong>
            </p>

            <div className="bg-orange-50 rounded-xl p-6 mb-8 border-l-4 border-primary">
              <p className="text-gray-700 leading-relaxed">
                On ne va pas se mentir : se retrouver face à l'œil noir de son smartphone ou de son ordinateur pour parler de soi, ça peut être intimidant. On bafouille, on se trouve bizarre, on a soudainement l'impression d'avoir oublié son propre nom.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
                Voici nos 5 astuces pour transformer votre stress en charisme et captiver les recruteurs.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-primary-light text-primary rounded-full w-10 h-10 flex items-center justify-center text-lg mr-4">1</span>
                Parlez à un ami, pas à un robot
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                L'astuce ultime ? Ne regardez pas votre téléphone comme un appareil électronique. Imaginez que vous expliquez votre parcours à un ami assis juste derrière l'écran, dans votre café préféré de la ville.
              </p>
              <div className="bg-gradient-to-r from-primary/5 to-green-50/50 p-5 rounded-xl border-l-4 border-primary">
                <p className="text-primary font-semibold flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>Le petit plus : Souriez dès le début. Le sourire s'entend même dans votre ton de voix et rend votre présentation instantanément plus humaine.</span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-primary-1 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg mr-4">2</span>
                La technique du "Post-it" magique
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ne lisez jamais un texte. Ça se voit, et c'est ennuyeux. À la place, collez un petit Post-it juste à côté de l'objectif de votre caméra avec 3 mots-clés :
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-yellow-100 p-4 rounded-lg text-center border-2 border-yellow-200">
                  <div className="w-10 h-10 bg-yellow-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-800">Votre formation</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg text-center border-2 border-yellow-200">
                  <div className="w-10 h-10 bg-yellow-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-800">Votre plus grande réussite</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg text-center border-2 border-yellow-200">
                  <div className="w-10 h-10 bg-yellow-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-800">Ce que vous voulez apporter</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                Cela vous servira de boussole sans vous transformer en présentateur météo robotisé.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-primary-2 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg mr-4">3</span>
                Le regard : visez le point vert !
              </h2>
              <div className="bg-red-50 p-5 rounded-xl mb-4 border-l-4 border-red-500">
                <p className="text-red-800 font-semibold mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  L'erreur classique :
                </p>
                <p className="text-red-700">Regarder son propre visage sur l'écran pendant qu'on filme. Résultat ? Sur la vidéo, on a l'impression que vous regardez ailleurs.</p>
              </div>
              <div className="bg-green-50 p-5 rounded-xl border-l-4 border-primary">
                <p className="text-primary font-semibold mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Le secret :
                </p>
                <p className="text-primary-1">Fixez l'objectif de la caméra (le petit point noir ou vert). C'est là que se trouvent les yeux du recruteur. En faisant cela, vous créez un véritable "contact visuel".</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-primary-3 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg mr-4">4</span>
                La règle du "Troisième essai"
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
                  <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">3</span>
                  <div>
                    <p className="font-semibold text-gray-800">Prise 3 : C'est souvent la bonne !</p>
                    <p className="text-gray-600">C'est là que vous êtes naturel et que votre énergie ressort vraiment.</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-primary/5 to-green-50/50 p-5 rounded-xl mt-4 border-l-4 border-primary">
                <p className="text-primary font-semibold flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>Ne cherchez pas la perfection, cherchez l'authenticité.</span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center text-lg mr-4">5</span>
                Soignez le décor (mais restez vous-même)
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Pas besoin d'un studio pro. Voici les essentiels :
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Un mur clair</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Belle lumière naturelle d'une fenêtre</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Environnement calme</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>Contre-jour</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>Pile de linge en arrière-plan</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
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
            <div className="bg-gradient-to-r from-primary to-green-600 text-white rounded-2xl p-8 mb-8 shadow-lg">
              <h2 className="font-heading text-2xl font-bold mb-4">Le mot de la fin</h2>
              <p className="font-body text-lg leading-relaxed mb-4">
                Le CV Vidéo n'est pas un concours d'acteur. C'est une porte ouverte sur votre avenir. Les recruteurs au Maroc ne cherchent pas des stars de cinéma, ils cherchent des collaborateurs motivés, clairs et authentiques.
              </p>
              <p className="font-body text-lg leading-relaxed mb-6">
                Prêt à faire la différence ? Prenez votre téléphone, suivez ces conseils et téléchargez votre vidéo sur FaceJob.ma dès aujourd'hui. Le job de vos rêves au Maroc n'attend que votre présentation !
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/auth/signup-candidate" 
                  className="group inline-flex items-center justify-center bg-white text-primary px-6 py-3 rounded-xl font-accent font-bold hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  Créer mon CV vidéo maintenant
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Workshop CTA */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-8 mb-8 shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Besoin d'un coup de pouce ?
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Passez nous voir lors de notre prochain atelier FaceJob (date et lieu à communiquer), on vous aide à enregistrer votre vidéo en direct !
              </p>
              <Link 
                href="/contact" 
                className="group inline-flex items-center text-primary hover:text-primary-1 font-accent font-semibold transition-all duration-300"
              >
                Nous contacter pour plus d'infos
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

export default Blog3Page;
