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
      <header className="relative w-full min-h-screen bg-gradient-to-br from-white via-gray-50 to-primary/5 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary-1/5 rounded-full blur-3xl"></div>
        </div>

        <NavBar />
        
        <div className="relative container mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-16 max-w-7xl min-h-[calc(100vh-80px)] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
            {/* Left Content */}
            <div className="order-2 lg:order-1 space-y-8 text-center lg:text-left">
              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-secondary leading-tight">
                Trouvez votre emploi avec votre{" "}
                <span className="bg-gradient-to-r from-primary via-green-600 to-primary-1 bg-clip-text text-transparent">
                  CV vidéo
                </span>
              </h1>

              {/* Value Proposition */}
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
                La première plateforme d'emploi au Maroc qui permet aux candidats de se démarquer 
                avec leur CV vidéo et aux entreprises de découvrir les talents cachés
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/auth/signup-candidate"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-green-600/30 transition-all duration-300 shadow-lg min-h-[56px] touch-manipulation"
                  aria-label="Créer mon CV vidéo gratuit - Inscription en 2 minutes"
                >
                  Créer mon CV vidéo gratuit
                </Link>
                <Link
                  href="/offres"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-green-600 text-green-600 font-bold text-lg rounded-xl hover:bg-green-50 transition-all duration-300 min-h-[56px] touch-manipulation shadow-md"
                  aria-label="Découvrir les offres d'emploi disponibles"
                >
                  Voir les offres
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white shadow-md px-4 py-2 rounded-full border border-gray-100">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-gray-700 whitespace-nowrap">100% Gratuit</span>
                </div>
                <div className="flex items-center gap-2 bg-white shadow-md px-4 py-2 rounded-full border border-gray-100">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-gray-700 whitespace-nowrap">Inscription en 2 min</span>
                </div>
                <div className="flex items-center gap-2 bg-white shadow-md px-4 py-2 rounded-full border border-gray-100">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-gray-700 whitespace-nowrap">783+ recrutés</span>
                </div>
              </div>

              {/* Scroll Indicator */}
              <div className="hidden lg:flex items-center gap-3 text-gray-500 hover:text-green-600 transition-colors cursor-pointer" onClick={handleScroll}>
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

            {/* Right Image */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative max-w-2xl mx-auto">
                {/* Decorative glow behind image */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-3xl blur-2xl opacity-10"></div>
                
                {/* Main image with border */}
                <div className="relative bg-gradient-to-br from-green-500/10 to-green-600/10 p-1 rounded-3xl">
                  <Image
                    src="/img1.jpg"
                    alt="Jeune professionnelle marocaine enregistrant son CV vidéo sur FaceJob"
                    className="rounded-3xl w-full h-auto shadow-2xl"
                    width={800}
                    height={600}
                    priority
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                </div>

                {/* Floating stats cards */}
                <div className="absolute -bottom-6 -left-6 bg-white shadow-xl border border-gray-100 rounded-2xl p-4 hidden md:block">
                  <div className="text-3xl font-bold text-green-600">783+</div>
                  <div className="text-sm text-gray-600">Candidats recrutés</div>
                </div>
                
                <div className="absolute -top-6 -right-6 bg-white shadow-xl border border-gray-100 rounded-2xl p-4 hidden md:block">
                  <div className="text-3xl font-bold text-green-600">100%</div>
                  <div className="text-sm text-gray-600">Gratuit</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
