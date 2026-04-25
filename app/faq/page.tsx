"use client";
import React, { useState } from "react";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

const tabs = [
  {
    label: "Général",
    faqs: [
      {
        question: "Qu'est-ce que FaceJob ?",
        answer: "FaceJob est la première plateforme d'emploi au Maroc qui permet aux candidats de créer leur CV vidéo gratuitement et aux entreprises de découvrir les talents cachés. Notre solution met le pouvoir des réseaux sociaux et du digital entre les mains des recruteurs et des chercheurs d'emploi."
      },
      {
        question: "Dans quelles villes du Maroc FaceJob est-il disponible ?",
        answer: "FaceJob est disponible dans tout le Maroc. Nous avons des offres d'emploi dans toutes les principales villes : Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir, Meknès, Oujda, Kenitra, Tétouan et bien d'autres. Notre plateforme couvre tous les secteurs d'activité au niveau national."
      },
      {
        question: "Comment contacter le support FaceJob ?",
        answer: "Vous pouvez nous contacter via la page Contact de notre site. Notre équipe répond généralement dans les 24h ouvrées."
      }
    ]
  },
  {
    label: "Candidats",
    faqs: [
      {
        question: "Comment créer un CV vidéo sur FaceJob ?",
        answer: "C'est simple en 3 étapes : 1) Créez votre compte candidat gratuitement en 2 minutes, 2) Enregistrez votre vidéo de présentation de 2 minutes maximum où vous parlez de votre parcours et motivations, 3) Publiez votre profil et postulez aux offres qui vous intéressent."
      },
      {
        question: "Quels sont les avantages du CV vidéo pour les candidats ?",
        answer: "Démarquez-vous des autres candidats avec votre personnalité, montrez votre aisance orale et communication non verbale, créez une connexion directe avec les recruteurs, et testez vos compétences linguistiques."
      },
      {
        question: "Puis-je modifier mon CV vidéo après l'avoir créé ?",
        answer: "Oui, vous pouvez modifier votre CV vidéo à tout moment depuis votre espace candidat. Cliquez sur 'Ma liste des vidéos' puis sur 'Modifier' pour la vidéo concernée."
      },
      {
        question: "Comment suivre mes candidatures ?",
        answer: "Toutes vos candidatures sont visibles dans votre espace candidat. Vous recevrez également des notifications par email pour les mises à jour importantes."
      }
    ]
  },
  {
    label: "Entreprises",
    faqs: [
      {
        question: "Comment publier une offre d'emploi sur FaceJob ?",
        answer: "Créez votre compte entreprise, accédez à votre espace recruteur, puis cliquez sur 'Publier une offre'. Remplissez les informations du poste et votre offre sera visible par tous les candidats."
      },
      {
        question: "Quels sont les avantages du CV vidéo pour les entreprises ?",
        answer: "Évitez les piles interminables de CV traditionnels, rencontrez les candidats en avant-première, dénichez les talents cachés plus facilement et réduisez le nombre d'entretiens physiques."
      },
      {
        question: "Comment accéder aux profils des candidats ?",
        answer: "Depuis votre espace entreprise, vous pouvez parcourir les profils candidats, visionner leurs CV vidéo et les contacter directement via la plateforme."
      }
    ]
  },
  {
    label: "Tarifs",
    faqs: [
      {
        question: "FaceJob est-il gratuit ?",
        answer: "Oui, FaceJob est 100% gratuit pour les candidats. Vous pouvez créer votre compte, enregistrer votre CV vidéo, postuler aux offres et être contacté par les recruteurs sans aucun frais."
      },
      {
        question: "Y a-t-il des frais cachés ?",
        answer: "Non, il n'y a aucun frais caché. L'inscription ne prend que 2 minutes et vous avez accès à toutes les fonctionnalités gratuitement."
      },
      {
        question: "Quels sont les tarifs pour les entreprises ?",
        answer: "Contactez notre équipe commerciale via la page Contact pour obtenir nos offres adaptées à vos besoins de recrutement."
      }
    ]
  }
];

function Accordion({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="space-y-4">
      {faqs.map((faq, i) => (
        <div key={i} className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300">
          <button
            className="flex w-full items-center justify-between py-5 px-6 text-left font-heading font-bold text-secondary hover:bg-gradient-to-r hover:from-primary/5 hover:to-green-50/50 transition-all duration-300 focus:outline-none group"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            aria-expanded={openIndex === i}
          >
            <span className="pr-4 group-hover:text-primary transition-colors">{faq.question}</span>
            <div className={`w-8 h-8 bg-gradient-to-br from-primary/10 to-green-100/50 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${openIndex === i ? "rotate-180 bg-primary" : ""}`}>
              <svg
                className={`w-5 h-5 transition-colors ${openIndex === i ? "text-white" : "text-primary"}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          <div className={`transition-all duration-300 ease-in-out ${openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
            <p className="px-6 pb-6 font-body text-gray-600 leading-relaxed">{faq.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-optional1 flex flex-col">
      <NavBar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-white via-optional1 to-green-50/30 pt-20 pb-16 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-primary/20 to-green-400/20 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-green-100/50 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6 shadow-sm">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-primary">Support & Aide</span>
            </div>

            <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-secondary mb-4 leading-tight tracking-tight">
              Questions fréquentes
            </h1>
            <p className="font-body text-lg text-gray-600 leading-relaxed">
              Trouvez rapidement les réponses à vos questions sur FaceJob
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1 pb-20 px-4">
        <div className="max-w-3xl mx-auto -mt-8">
          {/* Tabs */}
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`px-6 py-3 rounded-xl font-accent font-semibold transition-all duration-300 ${
                  activeTab === i
                    ? "bg-gradient-to-r from-primary to-green-600 text-white shadow-lg scale-105"
                    : "bg-white border-2 border-gray-200 text-gray-600 hover:border-primary hover:text-primary hover:shadow-md"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <Accordion faqs={tabs[activeTab].faqs} />

          {/* CTA */}
          <div className="text-center mt-12 p-8 bg-gradient-to-br from-white to-optional1 rounded-2xl border-2 border-gray-100 shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-green-100/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-primary/20">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="font-heading text-2xl font-bold text-secondary mb-3">Vous avez d'autres questions ?</h3>
            <p className="font-body text-gray-600 mb-6">Notre équipe est là pour vous aider.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white font-accent font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                Nous contacter
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/auth/signup-candidate" className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white font-accent font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md">
                Commencer maintenant
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
