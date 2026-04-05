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
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <button
            className="flex w-full items-center justify-between py-4 px-5 text-left text-base font-semibold text-secondary hover:bg-gray-50 transition-colors focus:outline-none"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            aria-expanded={openIndex === i}
          >
            <span className="pr-4">{faq.question}</span>
            <svg
              className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`transition-all duration-300 ease-in-out ${openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
            <p className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />
      <main className="flex-1 pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-secondary mb-3">
              Questions fréquentes
            </h1>
            <p className="text-gray-500 text-base sm:text-lg">
              Trouvez rapidement les réponses à vos questions sur FaceJob
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === i
                    ? "bg-primary text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <Accordion faqs={tabs[activeTab].faqs} />

          {/* CTA */}
          <div className="text-center mt-12 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-secondary mb-2">Vous avez d'autres questions ?</h3>
            <p className="text-gray-500 text-sm mb-4">Notre équipe est là pour vous aider.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact" className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-1 transition-colors text-sm">
                Nous contacter
              </Link>
              <Link href="/auth/signup-candidate" className="inline-flex items-center justify-center px-5 py-2.5 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors text-sm">
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
