import React from "react";

type Props = {};

export default function AboutUs({}: Props) {
  return (
    <section className="w-full p-8 md:p-20 mx-auto mt-32 mb-16 bg-white">
      <div className="w-full md:w-3/5 mx-auto text-center text-gray-800 md:text-start">
        <h2 className="my-4 text-3xl md:text-5xl font-bold text-center text-gray-800 font-default">
          À propos de nous
        </h2>
        <div className="md:px-10">
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-12 px-5 md:px-1 py-2 md:py-4">
            Bienvenue sur{" "}
            <span className="text-primary font-semibold">FaceJob</span>, une
            plateforme de pointe engagée à révolutionner l'expérience de
            candidature à un emploi. Au cœur de notre mission se trouve notre
            engagement à mettre en relation des individus exceptionnellement
            talentueux avec des opportunités de carrière passionnantes, en
            transformant le processus de recrutement traditionnel en un
            processus fluide, transparent et finalement gratifiant.
          </p>
          <p className="text-third text-start font-default font-medium text-base md:text-xl px-5 md:px-1 py-2">
            Né d'une passion commune pour l'innovation et d'une croyance dans le
            pouvoir transformateur d'un emploi valorisant, FaceJob est plus
            qu'un simple portail d'emploi.
          </p>
        </div>

        <div className="w-[180px] h-[42px] relative mx-auto mt-12">
          <button className="w-[202px] h-[68px] left-0 top-0 absolute bg-optional1 rounded-[15px] border border-primary focus:outline-none">
            <div className="w-[175.36px] h-[29.33px] left-0 top-[16px] absolute text-right pr-2 text-primary text-[23px] font-bold font-default leading-normal">
              Savoir plus
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
