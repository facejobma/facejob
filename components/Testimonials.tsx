import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion } from "framer-motion";
// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/scrollbar";

// import required modules
import { EffectCards, Scrollbar } from "swiper/modules";
import Image from "next/image";

type Props = {};

export default function Testimonials({}: Props) {
  return (
    <section className="w-full px-6 py-16 mx-auto mb-20 bg-optional1">
      <div className="container mx-auto max-w-6xl">
        <div className="relative flex flex-col lg:flex-row items-center justify-between w-full gap-12 lg:gap-20">
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            transition={{ duration: 1 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="mb-8">
              <p className="text-primary font-semibold text-lg mb-4">Ce qu'ils disent de nous</p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-default">
                Témoignages de nos utilisateurs
              </h2>
              <p className="text-xl text-gray-600 max-w-lg">
                Découvrez comment FaceJob a aidé des centaines de candidats à trouver leur emploi idéal au Maroc
              </p>
            </div>
            
            <div className="relative w-full max-w-md mx-auto lg:mx-0">
              <Image
                src="/img3.jpg"
                className="rounded-3xl shadow-2xl w-full h-auto"
                alt="Candidate enregistrant son CV vidéo sur FaceJob"
                width={400}
                height={300}
                priority={false}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
              
              {/* Floating testimonial preview */}
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">5.0/5</span>
                </div>
                <p className="text-sm text-gray-700 font-medium">
                  "Grâce à FaceJob, j'ai trouvé mon emploi en 2 semaines !"
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 100, opacity: 0 }}
            transition={{ duration: 1 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="flex-1 max-w-md mx-auto lg:mx-0"
          >
            <Swiper
              scrollbar={{
                hide: true,
              }}
              effect={"cards"}
              grabCursor={true}
              modules={[EffectCards, Scrollbar]}
              className="mySwiper h-96"
            >
              <SwiperSlide>
                <div className="relative flex flex-col h-full p-8 font-poppins bg-white rounded-2xl shadow-xl text-[#5E6282]">
                  <Image
                    src="/images/Sohaib MANAH.png"
                    alt="Photo de profil de Sohaib MANAH"
                    className="absolute object-cover rounded-full w-16 h-16 -left-8 -top-8 border-4 border-white shadow-lg"
                    width={64}
                    height={64}
                  />
                  
                  <div className="flex text-yellow-400 mb-4 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  
                  <blockquote className="flex-1 text-base leading-relaxed mb-6">
                    "À l'ère où tout devient digitalisé et en tant qu'ingénieur logiciel junior, 
                    FaceJob était la solution la plus adéquate et la plus simple pour moi pour 
                    pénétrer le marché du travail. Mon CV vidéo m'a permis de me démarquer !"
                  </blockquote>
                  
                  <div className="mt-auto">
                    <p className="font-semibold text-secondary text-lg">Sohaib MANAH</p>
                    <p className="text-sm text-gray-500">Ingénieur Logiciel • Casablanca</p>
                    <p className="text-xs text-primary font-medium mt-1">Recruté en 3 semaines</p>
                  </div>
                </div>
              </SwiperSlide>
              
              <SwiperSlide>
                <div className="relative flex flex-col h-full p-8 font-poppins bg-white rounded-2xl shadow-xl text-[#5E6282]">
                  <Image
                    src="/images/Mariam BEN DAOUED.jpg"
                    alt="Photo de profil de Mariam BEN DAOUED"
                    className="absolute object-cover rounded-full w-16 h-16 -left-8 -top-8 border-4 border-white shadow-lg"
                    width={64}
                    height={64}
                  />
                  
                  <div className="flex text-yellow-400 mb-4 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  
                  <blockquote className="flex-1 text-base leading-relaxed mb-6">
                    "J'ai été attirée par le côté innovateur de l'idée. J'ai enregistré mon CV vidéo 
                    et quelques jours après, mon téléphone a commencé à sonner ! J'ai réussi à 
                    décrocher mon premier entretien grâce à FaceJob."
                  </blockquote>
                  
                  <div className="mt-auto">
                    <p className="font-semibold text-secondary text-lg">Mariam BEN DAOUED</p>
                    <p className="text-sm text-gray-500">Marketing Digital • Rabat</p>
                    <p className="text-xs text-primary font-medium mt-1">Recrutée en 1 semaine</p>
                  </div>
                </div>
              </SwiperSlide>
              
              <SwiperSlide>
                <div className="relative flex flex-col h-full p-8 font-poppins bg-white rounded-2xl shadow-xl text-[#5E6282]">
                  <div className="absolute w-16 h-16 -left-8 -top-8 bg-primary rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-white font-bold text-lg">A.K</span>
                  </div>
                  
                  <div className="flex text-yellow-400 mb-4 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  
                  <blockquote className="flex-1 text-base leading-relaxed mb-6">
                    "En tant que recruteur, FaceJob m'a fait gagner un temps précieux. 
                    Je peux maintenant évaluer la personnalité et les compétences 
                    linguistiques des candidats avant même de les rencontrer."
                  </blockquote>
                  
                  <div className="mt-auto">
                    <p className="font-semibold text-secondary text-lg">Ahmed KHALIL</p>
                    <p className="text-sm text-gray-500">RH Manager • Tanger</p>
                    <p className="text-xs text-primary font-medium mt-1">Utilisateur entreprise</p>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
          </motion.div>
        </div>
        
        {/* Statistics Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-primary mb-2">783+</div>
            <div className="text-gray-600">Candidats recrutés</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-primary mb-2">95%</div>
            <div className="text-gray-600">Taux de satisfaction</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-primary mb-2">2 min</div>
            <div className="text-gray-600">Temps d'inscription</div>
          </div>
        </div>
      </div>
    </section>
  );
}