import React from "react";
import Link from "next/link";

type Props = {};

export default function AboutUs({}: Props) {
    return (
        <section className="flex flex-col-reverse md:flex-row w-full p-8 mt-8 md:mt-32 mb-8 md:mb-16 bg-white">

            {/* Right Text Section */}
            <div className="w-full md:w-1/2  mt-4 md:mt-8  bg-white">
                <div className="text-center text-gray-800 md:text-start">
                    <h2 className="my-4 text-3xl md:text-5xl font-bold text-center text-gray-800 font-default">
                        À propos de nous
                    </h2>
                    <div className="md:px-10">
                        <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-12 px-5 md:px-1 py-2 md:py-4">
                            Bienvenue sur{" "}
                            <span className="text-primary font-semibold">facejob</span>, Notre
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

                    <div className="w-1/2  relative mx-auto mt-4">
                        <button
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center w-full justify-center">
                            <Link href="/apropsdenous">
                                <span>Lire plus</span>
                            </Link>
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-full md:w-1/2 md:mt-32 md:mr-16">
                <div className="aspect-w-16 aspect-h-9">
                    <iframe
                        className="rounded-lg"
                        src="/videos/Facejob_VF_WEB.mp4"
                        title="facejob video"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </section>
    );
}
