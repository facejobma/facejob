import React from "react";
import {motion} from "framer-motion";
import Image from "next/image";

type Props = {};

export default function Category({}: Props) {
    return (
        <section className="w-full mx-auto mt-16 sm:mt-24 md:mt-36 pb-8 sm:pb-12" id={"section2"}>
            <div className="container mx-auto px-4 sm:px-6">
                <div className="relative text-center font-default pb-10 sm:pb-14">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-4">
                        Explorez les emplois par <span className="text-primary">catégorie</span>
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
                        Découvrez les opportunités d'emploi dans différents secteurs au Maroc
                    </p>
                    <Image
                        src="/images/pluses.png"
                        className="absolute right-1 top-24 sm:right-4 sm:top-28 md:right-20 md:top-1 opacity-20 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-[200px] lg:h-[200px]"
                        role="presentation"
                        width={200}
                        height={200}
                        alt=""
                    />
                </div>
                <motion.div
                    initial={{y: 100}}
                    transition={{duration: 1.5}}
                    whileInView={{y: 0}}
                    viewport={{once: true}}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12 mt-12 sm:mt-16 md:mt-20 max-w-6xl mx-auto font-default"
                >
                    <div className="relative group">
                        <div
                            className="opacity-0 group-hover:opacity-100 transition duration-200 delay-100 ease-in absolute -bottom-6 sm:-bottom-9 -left-6 sm:-left-10 w-16 h-16 sm:w-20 sm:h-20 rounded-bl-sm rounded-tl-[2rem] bg-primary rounded-br-md"></div>
                        <div
                            className="grid px-4 sm:px-6 pt-6 sm:pt-8 pb-8 sm:pb-12 transition transform place-items-center rounded-[2rem] hover:scale-105 hover:bg-white hover:drop-shadow-2xl cursor-pointer">
                            <div className="relative flex mb-4 sm:mb-6 w-max">
                                <Image
                                    width={64}
                                    height={64}
                                    src="/logist.png"
                                    className="z-10 w-16 h-16 sm:w-20 sm:h-20 object-contain"
                                    alt="Icône représentant le métier de logisticien"
                                />
                                <div
                                    className="absolute w-10 h-10 sm:w-12 sm:h-12 rounded-tr-sm rounded-bl-sm -bottom-1 -right-6 sm:-right-8 bg-primary-light rounded-br-2xl"></div>
                            </div>
                            <div className="text-center">
                                <h3 className="font-sans text-lg sm:text-xl font-semibold text-secondary mb-2 sm:mb-3">
                                    Logisticien
                                </h3>
                                <p className="max-w-[14rem] text-gray-500 text-sm sm:text-base leading-relaxed">
                                    Optimise les flux, réduit les stocks et les délais. 
                                    Un organisateur et manager expérimenté.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <div
                            className="opacity-0 group-hover:opacity-100 transition duration-200 delay-100 ease-in absolute -bottom-6 sm:-bottom-9 -left-6 sm:-left-10 w-16 h-16 sm:w-20 sm:h-20 rounded-bl-sm rounded-tl-[2rem] bg-primary rounded-br-md"></div>
                        <div
                            className="grid px-4 sm:px-6 pt-6 sm:pt-8 pb-8 sm:pb-12 transition transform place-items-center rounded-[2rem] hover:scale-105 hover:bg-white hover:drop-shadow-2xl cursor-pointer">
                            <div className="relative flex mb-4 sm:mb-6 w-max">
                                <Image
                                    width={64}
                                    height={64}
                                    src="/projectm.png"
                                    className="z-10 w-16 h-16 sm:w-20 sm:h-20 object-contain"
                                    alt="Icône représentant le métier de contrôleur de gestion"
                                />
                                <div
                                    className="absolute w-8 h-8 sm:w-10 sm:h-10 rounded-br-sm rounded-tr-xl rounded-bl-xl -top-2 -right-3 sm:-right-4 bg-primary-light"></div>
                            </div>
                            <div className="text-center">
                                <h3 className="font-sans font-semibold text-lg sm:text-xl text-secondary mb-2 sm:mb-3">
                                    Contrôleur de gestion
                                </h3>
                                <p className="max-w-[14rem] text-gray-500 text-sm sm:text-base leading-relaxed">
                                    Réalise des budgets prévisionnels et élabore les outils 
                                    de suivi des résultats et indicateurs.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <div
                            className="opacity-0 group-hover:opacity-100 transition duration-200 delay-100 ease-in absolute -bottom-4 sm:-bottom-6 -left-6 sm:-left-10 w-16 h-16 sm:w-20 sm:h-20 rounded-bl-sm rounded-tl-[2rem] bg-primary rounded-br-md"></div>
                        <div
                            className="grid px-4 sm:px-6 pt-6 sm:pt-8 pb-8 sm:pb-12 transition transform place-items-center rounded-[2rem] hover:scale-105 hover:bg-white hover:drop-shadow-2xl cursor-pointer">
                            <div className="relative flex mb-4 sm:mb-6 w-max">
                                <Image
                                    src="/agent.png"
                                    className="z-10 w-16 h-16 sm:w-20 sm:h-20 object-contain"
                                    alt="Icône représentant le métier d'agent de restauration"
                                    width={64}
                                    height={64}
                                />
                                <div
                                    className="absolute w-8 h-8 sm:w-10 sm:h-10 rounded-tr-sm rounded-br-sm rounded-bl-xl -bottom-2 -right-4 sm:-right-6 bg-primary-light"></div>
                            </div>
                            <div className="text-center">
                                <h3 className="font-sans font-semibold text-secondary text-lg sm:text-xl mb-2 sm:mb-3">
                                    Agent de restauration
                                </h3>
                                <p className="max-w-[14rem] text-gray-500 text-sm sm:text-base leading-relaxed">
                                    Occupe des fonctions polyvalentes dans la restauration 
                                    collective ou rapide.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
