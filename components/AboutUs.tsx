import Link from "next/link";
import React from "react";

type Props = {};

export default function AboutUs({}: Props) {
  return (
    <section className="flex flex-col-reverse md:flex-row w-full mt-8 md:mt-32 mb-8 md:mb-16 bg-white">
      

      {/* Right Text Section */}
      <div className="w-full md:w-1/2 p-8 md:p-16 bg-white">
        <div className="text-center text-gray-800 md:text-start">
          <h2 className="my-4 text-3xl md:text-5xl font-bold text-center text-gray-800 font-default">
            À propos de nous
          </h2>
          <div className="md:px-10">
            <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-12 px-5 md:px-1 py-2 md:py-4">
              Bienvenue sur{" "}
              <span className="text-primary font-semibold">FaceJob</span>, Notre
              philosophie est simple : Offrir à toutes les entreprises, à tous
              les chercheurs d’emploi la chance de s’entrecroiser, de se
              connecter de la manière la plus facile que jamais, la plus
              efficace que jamais
            </p>
            <p className="text-third text-start font-default font-medium text-base md:text-xl px-5 md:px-1 py-2">
              Pendant des années nous avons écouté les besoins, recueilli les
              confidences, cherché des solutions aux problèmes du recrutement …
              et avons découvert que la plus simple étape consistant à
              l’entrecroisement entre les entreprises et les chercheurs
              d’emploi, était souvent la plus fondamentale mais souvent la plus
              négligée.
            </p>
          </div>

          <div className="w-1/2 md:w-[180px] h-[42px] relative mx-auto mt-12">
            <button className="w-full md:w-[202px] h-[68px] left-0 top-0 absolute bg-optional1 rounded-[15px] border border-primary focus:outline-none">
              <div className="w-full pr-2 h-[29.33px] left-0 top-[16px] absolute text-center md:text-right md:pr-8 text-primary text-[23px] font-bold font-default leading-normal">
                <Link href="/about">Savoir plus</Link>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 md:mt-32 md:mr-16">
        <iframe
          width="100%"
          height="70%"
          className="rounded-2xl"
          src="/videos/Facejob_VF_WEB.mp4"
          title="facejob video"
          // frameBorder="1"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </section>
  );
}
