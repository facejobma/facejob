import React from "react";
import {motion} from "framer-motion";
import Image from "next/image";

type Props = {};

export default function Category({}: Props) {
    return (
        <section className="w-full  mx-auto mt-[6rem] pb-12">
            <div className="relative text-center font-default pb-14">
                <h2 className="my-4 text-5xl font-bold text-gray-800">
                    Explorer par <span className="text-primary">catégorie</span>
                </h2>
                <Image
                    src="/images/pluses.png"
                    className="absolute right-1 top-32 md:right-20 md:top-1"
                    role="presentation"
                    width={200}
                    height={200}
                    alt={"les catégories"}/>
            </div>
            <motion.div
                initial={{y: 100}}
                transition={{duration: 1.5}}
                whileInView={{y: 0}}
                viewport={{once: true}}
                className="flex flex-wrap justify-center mt-20 gap-32 font-default"
            >
                <div className="relative group">
                    <div
                        className="opacity-0 group-hover:opacity-100 transition duration-200 delay-100 ease-in absolute -bottom-9 -left-10 w-20 h-20 rounded-bl-sm rounded-tl-[2rem] bg-primary rounded-br-md"></div>
                    <div
                        className="grid px-3 pt-4 pb-10 transition transform place-items-center rounded-[2rem] hover:scale-110 hover:bg-white hover:drop-shadow-2xl cursor-default">
                        <div className="relative flex mb-4 w-max">
                            <Image width={200} height={200} src="/dev.png" className="z-10 w-20" role="presentation"
                                   alt={"developer"}/>
                            <div
                                className="absolute w-12 h-12 rounded-tr-sm rounded-bl-sm -bottom-1 -right-8 bg-primary-light rounded-br-2xl"></div>
                        </div>
                        <div className="text-center">
                            <h3 className="font-sans text-lg font-semibold text-secondary">
                                Développeur de logiciels
                            </h3>
                            <p className="max-w-[11rem] text-gray-500 mt-3 text-base">
                                Créer et maintenir des solutions logicielles avec une expertise
                                en programmation.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative group">
                    <div
                        className="opacity-0 group-hover:opacity-100 transition duration-200 delay-100 ease-in absolute -bottom-9 -left-10 w-20 h-20 rounded-bl-sm rounded-tl-[2rem] bg-primary rounded-br-md"></div>
                    <div
                        className="grid px-3 pt-4 pb-10 transition transform place-items-center rounded-[2rem] hover:scale-110 hover:bg-white hover:drop-shadow-2xl cursor-default">
                        <div className="relative flex mb-4 w-max">
                            <img src="/design.png" className="z-10 w-20" alt="Plane image"/>
                            <div
                                className="absolute w-12 h-12 rounded-bl-2xl rounded-tr-2xl -top-2 left-6 bg-primary-light rounded-br-md"></div>
                        </div>
                        <div className="text-center">
                            <h4 className="font-sans font-semibold text-lg text-secondary">
                                designer graphique
                            </h4>
                            <p className="max-w-[11rem] text-gray-500 mt-3 text-base">
                                Créez des interfaces conviviales pour une expérience positive.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative group">
                    <div
                        className="opacity-0 group-hover:opacity-100 transition duration-200 delay-100 ease-in absolute -bottom-9 -left-10 w-20 h-20 rounded-bl-sm rounded-tl-[2rem] bg-primary rounded-br-md"></div>
                    <div
                        className="grid px-3 pt-4 pb-10 transition transform place-items-center rounded-[2rem] hover:scale-110 hover:bg-white hover:drop-shadow-2xl cursor-default">
                        <div className="relative flex mb-4 w-max">
                            <Image width={200} height={200} src="/projectm.png" className="z-10 w-20" alt="Mic image"/>
                            <div
                                className="absolute w-10 h-10 rounded-br-sm rounded-tr-xl rounded-bl-xl -top-2 -right-4 bg-primary-light"></div>
                        </div>
                        <div className="text-center">
                            <h4 className="font-sans font-semibold text-lg text-secondary">
                                Chef de projet
                            </h4>
                            <p className="max-w-[11rem] text-gray-500 mt-3 text-base">
                                Mener les projets vers le succès, en garantissant les objectifs
                                de temps et de budget.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative group">
                    <div
                        className="opacity-0 group-hover:opacity-100 transition duration-200 delay-100 ease-in absolute -bottom-6 -left-10 w-20 h-20 rounded-bl-sm rounded-tl-[2rem] bg-primary rounded-br-md"></div>
                    <div
                        className="grid px-3 pt-4 pb-10 transition transform place-items-center rounded-[2rem] hover:scale-110 hover:bg-white hover:drop-shadow-2xl cursor-default">
                        <div className="relative flex mb-4 w-max">
                            <Image
                                src="/videoEd.png"
                                className="z-10 w-20"
                                alt="power supply image"
                                width={200}
                                height={200}
                            />
                            <div
                                className="absolute w-10 h-10 rounded-tr-sm rounded-br-sm rounded-bl-xl -bottom-2 -right-6 bg-primary-light"></div>
                        </div>
                        <div className="text-center">
                            <h4 className="font-sans font-semibold text-secondary text-lg">
                                Éditeur de vidéo
                            </h4>
                            <p className="max-w-[11rem] text-gray-500 mt-3 text-base">
                                Montez et perfectionnez des vidéos en tant qu'éditeur vidéo
                                professionnel.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
