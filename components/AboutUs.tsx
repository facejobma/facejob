import React from "react";
import Link from "next/link";

type Props = {};

export default function AboutUs({}: Props) {
  return (
    <section className="flex flex-col-reverse md:flex-row w-full p-8 mt-8 md:mt-32 mb-8 md:mb-16 bg-white max-w-7xl mx-auto gap-8 md:gap-12">
      {/* Right Text Section */}
      <div className="w-full md:w-1/2 mt-4 md:mt-8 bg-white">
        <div className="text-center text-gray-800 md:text-start">
          <h2 className="my-4 text-3xl md:text-5xl font-bold text-center text-gray-800 font-default">
            À propos de nous
          </h2>
          <div className="md:px-10">
            <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-12 px-5 md:px-1 py-2 md:py-4 leading-relaxed">
              Bienvenue sur{" "}
              <span className="text-primary font-semibold">FaceJob</span>, Notre
              philosophie est simple : Offrir à toutes les entreprises, à tous
              les chercheurs d'emploi la chance de s'entrecroiser, de se
              connecter de la manière la plus facile que jamais, la plus
              efficace que jamais.
            </p>
          </div>

          <div className="w-full md:w-1/2 lg:w-1/3 relative mx-auto mt-6 md:mt-8 font-default">
            <Link 
              href="/apropsdenous"
              className="bg-gradient-to-r from-primary to-primary-1 hover:shadow-xl text-white font-bold py-3 px-6 rounded-lg inline-flex items-center justify-center w-full transition-all duration-300 active:scale-95 min-h-[48px] touch-manipulation"
            >
              <span>Lire plus</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 md:mt-10">
        <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-2xl">
          <video
            className="rounded-2xl w-full h-full object-cover"
            controls
            muted
            playsInline
            poster="/videos/videoImage.png"
          >
            <source src="/videos/Facejob_VF_WEB.mp4" type="video/mp4" />
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        </div>
      </div>
    </section>
  );
}
