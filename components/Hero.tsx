import React from "react";
import NavBar from "./NavBar";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <header className="relative w-full min-h-screen bg-gradient-to-br from-white via-optional1 to-green-50/30 overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-green-400/20 rounded-full blur-3xl opacity-70 pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 -left-20 w-72 h-72 bg-gradient-to-tr from-green-300/20 to-primary/10 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none animate-bounce-slow" />
      
      {/* Decorative dots pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #60894B 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <NavBar />

      <div className="relative container mx-auto px-4 sm:px-6 max-w-7xl pt-20 sm:pt-32 pb-16 flex items-center min-h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">

          {/* Left — Text */}
          <div className="order-2 lg:order-1 flex flex-col gap-8 text-center lg:text-left animate-fade-in">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-secondary leading-[1.1] tracking-tight">
              Osez la{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary via-green-600 to-primary-1 bg-clip-text text-transparent animate-gradient">
                  différence !
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 10C50 2 150 2 198 10" stroke="#60894B" strokeWidth="3" strokeLinecap="round" opacity="0.3"/>
                </svg>
              </span>
            </h1>

            <p className="font-body text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              En un instant, créez votre CV vidéo, rapide, impactant et prêt à séduire les recruteurs…
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/auth/signup-candidate"
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white font-accent font-bold text-base rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Créer mon CV vidéo gratuit
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Link>
              <Link
                href="/offres"
                className="group inline-flex items-center justify-center px-8 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-white font-accent font-semibold text-base rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Voir les offres
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>
            </div>

            {/* Scroll link */}
            <button
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hidden lg:flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-all duration-300 w-fit mx-auto lg:mx-0 group"
            >
              <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              <span className="group-hover:underline underline-offset-4">Découvrir comment ça marche</span>
            </button>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-sm pt-4">
              {[
                { label: "100% Gratuit", color: "text-green-600", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                { label: "Inscription en 2 min", color: "text-blue-600", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                { label: "783+ recrutés", color: "text-green-600", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
              ].map(({ label, color, icon }) => (
                <span
                  key={label}
                  className="group flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-primary/30 shadow-sm hover:shadow-md px-4 py-2.5 rounded-full font-medium text-gray-700 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <svg className={`w-5 h-5 flex-shrink-0 ${color} group-hover:scale-110 transition-transform`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                  </svg>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Image */}
          <div className="order-1 lg:order-2 animate-fade-in-delayed">
            <div className="relative max-w-lg mx-auto lg:max-w-none">
              {/* Decorative elements */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-green-400/20 to-green-600/20 rounded-[2rem] blur-3xl opacity-60 animate-pulse" />
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-green-400/10 rounded-full blur-2xl" />
              
              {/* Image container with enhanced styling */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-green-600 rounded-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
                <div className="relative rounded-3xl shadow-2xl ring-1 ring-gray-900/5 group-hover:shadow-primary/20 transition-all duration-500 overflow-hidden">
                  <Image
                    src="/img1.jpg"
                    alt="Professionnelle enregistrant son CV vidéo sur FaceJob"
                    className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                    width={700}
                    height={520}
                    priority
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                  {/* Overlay gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
