import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

type Props = {};

export default function Category({}: Props) {
  return (
    <section className="w-full  mx-auto mt-36 pb-12" id={"section2"}>
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
          alt={"les catégories"}
        />
      </div>
      <motion.div
        initial={{ y: 100 }}
        transition={{ duration: 1.5 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        className="flex flex-wrap justify-center mt-20 gap-x-56 gap-y-20 font-default"
      >
        <div className="relative group">
          <div className="opacity-0 group-hover:opacity-100 transition duration-200 delay-100 ease-in absolute -bottom-9 -left-10 w-20 h-20 rounded-bl-sm rounded-tl-[2rem] bg-primary rounded-br-md"></div>
          <div className="grid px-3 pt-4 pb-10 transition transform place-items-center rounded-[2rem] hover:scale-110 hover:bg-white hover:drop-shadow-2xl cursor-default">
            <div className="relative flex mb-4 w-max">
              <Image
                width={200}
                height={200}
                src="/logist.png"
                className="z-10 w-20"
                role="presentation"
                alt={"developer"}
              />
              <div className="absolute w-12 h-12 rounded-tr-sm rounded-bl-sm -bottom-1 -right-8 bg-primary-light rounded-br-2xl"></div>
            </div>
            <div className="text-center">
              <h3 className="font-sans text-lg font-semibold text-secondary">
                Logisticien
              </h3>
              <p className="max-w-[11rem] text-gray-500 mt-3 text-base">
                Objectif numéro un : réduire les stocks, les délais et les
                coûts. C'est avant tout un organisateur et un manager.
              </p>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="opacity-0 group-hover:opacity-100 transition duration-200 delay-100 ease-in absolute -bottom-9 -left-10 w-20 h-20 rounded-bl-sm rounded-tl-[2rem] bg-primary rounded-br-md"></div>
          <div className="grid px-3 pt-4 pb-10 transition transform place-items-center rounded-[2rem] hover:scale-110 hover:bg-white hover:drop-shadow-2xl cursor-default">
            <div className="relative flex mb-4 w-max">
              <Image
                width={200}
                height={200}
                src="/projectm.png"
                className="z-10 w-20"
                alt="Mic image"
              />
              <div className="absolute w-10 h-10 rounded-br-sm rounded-tr-xl rounded-bl-xl -top-2 -right-4 bg-primary-light"></div>
            </div>
            <div className="text-center">
              <h4 className="font-sans font-semibold text-lg text-secondary">
                Contrôleur de gestion
              </h4>
              <p className="max-w-[11rem] text-gray-500 mt-3 text-base">
                réalise des budgets prévisionnels et élabore les outils
                nécessaires au suivi des résultats (tableaux de bord,
                indicateurs).
              </p>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="opacity-0 group-hover:opacity-100 transition duration-200 delay-100 ease-in absolute -bottom-6 -left-10 w-20 h-20 rounded-bl-sm rounded-tl-[2rem] bg-primary rounded-br-md"></div>
          <div className="grid px-3 pt-4 pb-10 transition transform place-items-center rounded-[2rem] hover:scale-110 hover:bg-white hover:drop-shadow-2xl cursor-default">
            <div className="relative flex mb-4 w-max">
              <Image
                src="/agent.png"
                className="z-10 w-20"
                alt="power supply image"
                width={200}
                height={200}
              />
              <div className="absolute w-10 h-10 rounded-tr-sm rounded-br-sm rounded-bl-xl -bottom-2 -right-6 bg-primary-light"></div>
            </div>
            <div className="text-center">
              <h4 className="font-sans font-semibold text-secondary text-lg">
                Agent de restauration
              </h4>
              <p className="max-w-[11rem] text-gray-500 mt-3 text-base">
                occupe dans la restauration collective ou la restauration «
                rapide » des fonctions polyvalentes.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
