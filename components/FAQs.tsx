"use client"
import React, { useState } from "react";

const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const faqData = [
    {
      question: "Qu'est-ce que FaceJob ?",
      answer: "FaceJob est la première plateforme d'emploi au Maroc qui permet aux candidats de créer leur CV vidéo gratuitement et aux entreprises de découvrir les talents cachés. Notre solution met le pouvoir des réseaux sociaux et du digital entre les mains des recruteurs et des chercheurs d'emploi."
    },
    {
      question: "Comment créer un CV vidéo sur FaceJob ?",
      answer: "C'est simple en 3 étapes : 1) Créez votre compte candidat gratuitement en 2 minutes, 2) Enregistrez votre vidéo de présentation de 2 minutes maximum où vous parlez de votre parcours et motivations, 3) Publiez votre profil et postulez aux offres qui vous intéressent. Plus de 783 candidats ont déjà trouvé leur emploi grâce à cette méthode."
    },
    {
      question: "Quels sont les avantages du CV vidéo pour les candidats et entreprises ?",
      answer: `<div class="space-y-4">
        <div>
          <strong>Pour les candidats :</strong>
          <ul class="list-disc list-inside mt-2 space-y-1">
            <li>Démarquez-vous des autres candidats avec votre personnalité</li>
            <li>Montrez votre aisance orale et communication non verbale</li>
            <li>Créez une connexion directe avec les recruteurs</li>
            <li>Testez vos compétences linguistiques</li>
          </ul>
        </div>
        <div>
          <strong>Pour les entreprises :</strong>
          <ul class="list-disc list-inside mt-2 space-y-1">
            <li>Évitez les piles interminables de CV traditionnels</li>
            <li>Rencontrez les candidats en avant-première</li>
            <li>Dénichez les talents cachés plus facilement</li>
            <li>Réduisez le nombre d'entretiens physiques</li>
          </ul>
        </div>
      </div>`
    },
    {
      question: "FaceJob est-il gratuit ? Y a-t-il des frais cachés ?",
      answer: "Oui, FaceJob est 100% gratuit pour les candidats. Vous pouvez créer votre compte, enregistrer votre CV vidéo, postuler aux offres et être contacté par les recruteurs sans aucun frais. Il n'y a aucun frais caché. L'inscription ne prend que 2 minutes et vous avez accès à toutes les fonctionnalités."
    },
    {
      question: "Dans quelles villes du Maroc FaceJob est-il disponible ?",
      answer: "FaceJob est disponible dans tout le Maroc. Nous avons des offres d'emploi dans toutes les principales villes : Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir, Meknès, Oujda, Kenitra, Tétouan et bien d'autres. Notre plateforme couvre tous les secteurs d'activité au niveau national."
    }
  ];

  return (
    <section className="container mx-auto px-6 py-24 max-w-4xl font-default" id="faq">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Questions fréquemment posées
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Trouvez rapidement les réponses à vos questions sur FaceJob et le CV vidéo
        </p>
      </div>

      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <div 
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="mb-0">
              <button
                className="group relative flex w-full items-center justify-between py-6 px-6 text-left text-lg font-semibold transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                type="button"
                onClick={() => handleToggle(index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="text-secondary pr-4">{faq.question}</span>
                <span
                  className={`flex-shrink-0 w-6 h-6 text-primary transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={`faq-answer-${index}`}
              className={`transition-all duration-300 ease-in-out ${
                openIndex === index 
                  ? "max-h-96 opacity-100" 
                  : "max-h-0 opacity-0 overflow-hidden"
              }`}
              aria-labelledby={`faq-question-${index}`}
            >
              <div 
                className="px-6 pb-6 text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="text-center mt-16 p-8 bg-optional1 rounded-2xl">
        <h3 className="text-2xl font-bold text-secondary mb-4">
          Vous avez d'autres questions ?
        </h3>
        <p className="text-gray-600 mb-6">
          Notre équipe est là pour vous aider. Contactez-nous pour plus d'informations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-1 transition-colors duration-300"
          >
            Nous contacter
          </a>
          <a
            href="/auth/signup-candidate"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors duration-300"
          >
            Commencer maintenant
          </a>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;