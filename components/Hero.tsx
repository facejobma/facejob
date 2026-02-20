import React from "react";
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
      <header className="relative w-full py-4 pb-12 sm:pb-16 md:pb-20 bg-optional1">
        <NavBar />
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-20 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div className="order-2 md:order-1 animate-fade-in">
              {/* Main Heading - Proper H1 */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-secondary mb-4 sm:mb-6 leading-tight">
                Trouvez votre emploi avec votre{" "}
                <span className="text-primary">CV vidéo</span>
              </h1>

              {/* Value Proposition */}
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
                La première plateforme d'emploi au Maroc qui permet aux candidats de se démarquer 
                avec leur CV vidéo et aux entreprises de découvrir les talents cachés
              </p>

              {/* Enhanced CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Link
                  href="/auth/signup-candidate"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white font-semibold text-base sm:text-lg rounded-lg hover:bg-primary-1 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 md:hover:-translate-y-1 min-h-[48px] touch-manipulation"
                  aria-label="Créer mon CV vidéo gratuit - Inscription en 2 minutes"
                >
                  Créer mon CV vidéo gratuit
                </Link>
                <Link
                  href="/offres"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-primary text-primary font-semibold text-base sm:text-lg rounded-lg hover:bg-primary hover:text-white transition-all duration-300 min-h-[48px] touch-manipulation active:scale-95"
                  aria-label="Découvrir les offres d'emploi disponibles"
                >
                  Voir les offres
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium whitespace-nowrap">100% Gratuit</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium whitespace-nowrap">Inscription en 2 min</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium whitespace-nowrap">783+ recrutés</span>
                </div>
              </div>

              {/* Scroll Indicator - Hidden on mobile */}
              <div className="hidden sm:flex items-center gap-3 text-third hover:text-primary transition-colors cursor-pointer" onClick={handleScroll}>
                <Image
                  src="/Arrow.png"
                  alt="Flèche vers le bas"
                  className="w-4 h-4"
                  width={16}
                  height={16}
                  loading="lazy"
                />
                <span className="text-sm font-medium">Découvrir comment ça marche</span>
              </div>
            </div>

            <div className="order-1 md:order-2 relative animate-fade-in-delayed">
              <div className="relative max-w-md mx-auto md:max-w-none">
                <Image
                  src="/img1.jpg"
                  alt="Jeune professionnelle marocaine enregistrant son CV vidéo sur FaceJob"
                  className="rounded-2xl sm:rounded-3xl shadow-2xl w-full h-auto"
                  width={600}
                  height={400}
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                
                {/* Floating elements for visual interest - Smaller on mobile */}
                <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-20 sm:h-20 bg-primary-light rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-10 h-10 sm:w-16 sm:h-16 bg-primary rounded-full opacity-30 animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
