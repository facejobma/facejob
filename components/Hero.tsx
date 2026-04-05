import React from "react";
import NavBar from "./NavBar";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <header className="relative w-full min-h-screen bg-gradient-to-br from-white via-gray-50 to-green-50 overflow-hidden">
      {/* Subtle background blobs */}
      <div className="absolute -top-32 -right-32 w-72 h-72 bg-green-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 -left-32 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <NavBar />

      <div className="relative container mx-auto px-4 sm:px-6 max-w-6xl pt-24 sm:pt-32 pb-16 flex items-center min-h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">

          {/* Left — Text */}
          <div className="order-2 lg:order-1 flex flex-col gap-6 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary leading-tight">
              Osez la{" "}
              <span className="bg-gradient-to-r from-primary via-green-600 to-primary-1 bg-clip-text text-transparent">
                différence !
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
              En un instant, créez votre CV vidéo, rapide, impactant et prêt à séduire les recruteurs…
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/auth/signup-candidate"
                className="inline-flex items-center justify-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-lg transition-colors duration-200 shadow-sm"
              >
                Créer mon CV vidéo gratuit
              </Link>
              <Link
                href="/offres"
                className="inline-flex items-center justify-center px-5 py-2.5 border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold text-sm rounded-lg transition-colors duration-200"
              >
                Voir les offres
              </Link>
            </div>

            {/* Scroll link */}
            <button
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hidden lg:flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 transition-colors w-fit mx-auto lg:mx-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              Découvrir comment ça marche
            </button>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-sm">
              {[
                { label: "100% Gratuit", color: "text-green-600" },
                { label: "Inscription en 2 min", color: "text-blue-600" },
                { label: "783+ recrutés", color: "text-green-600" },
              ].map(({ label, color }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 bg-white border border-gray-100 shadow-sm px-3 py-1.5 rounded-full font-medium text-gray-700"
                >
                  <svg className={`w-4 h-4 flex-shrink-0 ${color}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Image */}
          <div className="order-1 lg:order-2">
            <div className="relative max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl blur-2xl opacity-10" />
              <Image
                src="/img1.jpg"
                alt="Professionnelle enregistrant son CV vidéo sur FaceJob"
                className="relative rounded-3xl w-full h-auto shadow-xl"
                width={700}
                height={520}
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
