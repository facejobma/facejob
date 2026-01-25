import React from "react";
import { motion } from "framer-motion";
import NavBar from "./NavBar";
import Image from "next/image";
import Link from "next/link";

type Props = {};

export default function Hero({}: Props) {
  const handleScroll = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();

    const section2 = document.getElementById("section2");

    if (section2) {
      section2.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="relative w-full py-4 pb-20 bg-optional1">
        <NavBar />
        <div className="container mx-auto px-6 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="order-2 md:order-1"
            >
              {/* Main Heading - Proper H1 */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-secondary mb-6 leading-tight">
                Trouvez votre emploi avec votre{" "}
                <span className="text-primary">CV vidéo</span>
              </h1>

              {/* Value Proposition */}
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
                La première plateforme d'emploi au Maroc qui permet aux candidats de se démarquer 
                avec leur CV vidéo et aux entreprises de découvrir les talents cachés
              </p>

              {/* Enhanced CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/auth/signup-candidate"
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-semibold text-lg rounded-lg hover:bg-primary-1 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 min-h-[48px]"
                  aria-label="Créer mon CV vidéo gratuit - Inscription en 2 minutes"
                >
                  Créer mon CV vidéo gratuit
                </Link>
                <Link
                  href="/offres"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary text-primary font-semibold text-lg rounded-lg hover:bg-primary hover:text-white transition-all duration-300 min-h-[48px]"
                  aria-label="Découvrir les offres d'emploi disponibles"
                >
                  Voir les offres
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">100% Gratuit</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Inscription en 2 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">783+ candidats recrutés</span>
                </div>
              </div>

              {/* Scroll Indicator */}
              <div className="flex items-center gap-3 text-third hover:text-primary transition-colors cursor-pointer" onClick={handleScroll}>
                <Image
                  src="/Arrow.png"
                  alt="Flèche vers le bas"
                  className="w-4 h-4"
                  width={16}
                  height={16}
                />
                <span className="text-sm font-medium">Découvrir comment ça marche</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 md:order-2 relative"
            >
              <div className="relative">
                <Image
                  src="/img1.jpg"
                  alt="Jeune professionnelle marocaine enregistrant son CV vidéo sur FaceJob"
                  className="rounded-3xl shadow-2xl w-full h-auto"
                  width={600}
                  height={400}
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                
                {/* Floating elements for visual interest */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary-light rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary rounded-full opacity-30 animate-bounce"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>
    </>
  );
}
