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
            <span className="text-primary font-semibold">FaceJob</span>, Notre
            philosophie est simple : Offrir à toutes les entreprises, à tous les
            chercheurs d’emploi la chance de s’entrecroiser, de se connecter de
            la manière la plus facile que jamais, la plus efficace que jamais
          </p>
          <p className="text-third text-start font-default font-medium text-base md:text-xl px-5 md:px-1 py-2">
            Pendant des années nous avons écouté les besoins, recueilli les
            confidences, cherché des solutions aux problèmes du recrutement … et
            avons découvert que la plus simple étape consistant à
            l’entrecroisement entre les entreprises et les chercheurs d’emploi,
            était souvent la plus fondamentale mais souvent la plus négligée.
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
