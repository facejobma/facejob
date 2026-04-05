"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    name: "Sohaib MANAH",
    role: "Ingénieur Logiciel • Casablanca",
    tag: "Recruté en 3 semaines",
    initials: "SM",
    color: "bg-green-600",
    image: "/images/Sohaib MANAH.png",
    quote: "À l'ère où tout devient digitalisé et en tant qu'ingénieur logiciel junior, FaceJob était la solution la plus adéquate et la plus simple pour moi pour pénétrer le marché du travail. Mon CV vidéo m'a permis de me démarquer !",
  },
  {
    name: "Mariam BEN DAOUED",
    role: "Marketing Digital • Rabat",
    tag: "Recrutée en 1 semaine",
    initials: "MB",
    color: "bg-pink-500",
    image: "/images/Mariam BEN DAOUED.jpg",
    quote: "J'ai été attirée par le côté innovateur de l'idée. J'ai enregistré mon CV vidéo et quelques jours après, mon téléphone a commencé à sonner ! J'ai réussi à décrocher mon premier entretien grâce à FaceJob.",
  },
  {
    name: "Ahmed KHALIL",
    role: "RH Manager • Tanger",
    tag: "Utilisateur entreprise",
    initials: "AK",
    color: "bg-primary",
    quote: "En tant que recruteur, FaceJob m'a fait gagner un temps précieux. Je peux maintenant évaluer la personnalité et les compétences linguistiques des candidats avant même de les rencontrer.",
  },
  {
    name: "Youssef BENHADDOU",
    role: "Développeur Web • Casablanca",
    tag: "Recruté en 10 jours",
    initials: "YB",
    color: "bg-green-700",
    quote: "Je cherchais un emploi depuis 4 mois sans succès. Après avoir créé mon CV vidéo sur FaceJob, j'ai reçu 3 propositions en moins de 10 jours. La différence est incroyable !",
  },
  {
    name: "Sara ALAOUI",
    role: "Chargée de communication • Marrakech",
    tag: "Recrutée en 2 semaines",
    initials: "SA",
    color: "bg-purple-600",
    quote: "FaceJob m'a permis de montrer ma vraie personnalité aux recruteurs. Mon CV papier ne reflétait pas qui j'étais vraiment. Aujourd'hui je travaille dans l'entreprise de mes rêves !",
  },
  {
    name: "Karim MOUSSAOUI",
    role: "Directeur RH • Casablanca",
    tag: "Utilisateur entreprise",
    initials: "KM",
    color: "bg-blue-600",
    quote: "En tant que DRH, FaceJob a révolutionné notre processus de recrutement. Nous réduisons de 60% le temps passé en entretiens préliminaires. Je recommande à toutes les entreprises.",
  },
  {
    name: "Nadia EL FASSI",
    role: "Comptable • Fès",
    tag: "Recrutée en 5 jours",
    initials: "NE",
    color: "bg-orange-500",
    quote: "Simple, rapide et efficace. J'ai enregistré ma vidéo en 15 minutes et le lendemain j'avais déjà un message d'un recruteur. FaceJob c'est vraiment la plateforme qu'il manquait au Maroc.",
  },
];

function Stars() {
  return (
    <div className="flex text-yellow-400 gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const current = testimonials[active];

  return (
    <section className="w-full px-4 sm:px-6 py-12 sm:py-16 bg-optional1">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left"
          >
            <p className="text-primary font-semibold text-base mb-3">Ce qu'ils disent de nous</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-default">
              Témoignages de nos utilisateurs
            </h2>
            <p className="text-base text-gray-600 max-w-md mx-auto lg:mx-0 mb-8">
              Découvrez comment FaceJob a aidé des centaines de candidats à trouver leur emploi idéal au Maroc.
            </p>

            <div className="relative max-w-sm mx-auto lg:mx-0">
              <Image
                src="/img3.jpg"
                className="rounded-2xl shadow-xl w-full h-auto"
                alt="Candidate enregistrant son CV vidéo sur FaceJob"
                width={400}
                height={300}
              />
              <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Stars />
                  <span className="text-xs text-gray-500">5.0/5</span>
                </div>
                <p className="text-xs text-gray-700 font-medium max-w-[160px]">
                  "Grâce à FaceJob, j'ai trouvé mon emploi en 2 semaines !"
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right — testimonial card */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1 w-full max-w-md mx-auto lg:mx-0"
          >
            {/* Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
              <div className="flex items-center gap-4 mb-4">
                {current.image ? (
                  <Image
                    src={current.image}
                    alt={current.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                    width={56}
                    height={56}
                  />
                ) : (
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${current.color}`}>
                    {current.initials}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-secondary">{current.name}</p>
                  <p className="text-xs text-gray-500">{current.role}</p>
                  <span className="text-xs text-primary font-medium">{current.tag}</span>
                </div>
              </div>
              <Stars />
              <blockquote className="mt-4 text-gray-600 text-sm leading-relaxed">
                "{current.quote}"
              </blockquote>
            </div>

            {/* Navigation dots */}
            <div className="flex items-center justify-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`rounded-full transition-all duration-200 ${
                    i === active ? "w-6 h-2.5 bg-primary" : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Témoignage ${i + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next */}
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => setActive((active - 1 + testimonials.length) % testimonials.length)}
                className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:border-primary hover:text-primary flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setActive((active + 1) % testimonials.length)}
                className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:border-primary hover:text-primary flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
