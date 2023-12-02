import React from "react";
import { motion } from "framer-motion";
type Props = {};

export default function HowWorks({}: Props) {
  return (
    <section className="w-full p-20 mx-auto mt-32 mb-16 bg-optional3">
      <div className="max-w-xl mx-auto text-center text-gray-800 md:text-start">
        <h2 className="my-4 text-4xl font-bold text-center text-gray-800 md:text-5xl font-default">
          Comment <span className="text-primary">ça</span> fonctionne
        </h2>
        <p className="text-third text-center font-default font-medium text-lg px-10 py-4">
          Explorez les étapes suivantes qui vous aideront à trouver facilement
          un emploi.{" "}
        </p>
      </div>

      <div className="relative flex flex-col gap-20 my-20 md:flex-row md:gap-10 md:justify-between">
        <motion.div
          initial={{ x: -100 }}
          transition={{ duration: 1 }}
          whileInView={{ x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col justify-center items-center gap-12 md:flex-row "
        >
          <div className="group w-[402.66px] h-[183.69px] flex px-4 bg-white rounded-[13px] transition-all duration-300 ease-in-out transform hover:shadow-lg">
            <div className="w-1/3 h-[84.94px] flex justify-center bg-primary m-5 my-12 rounded-[7px] group-hover:bg-optional2 transition-all duration-300">
              <div className="w-[55px] h-[53px] text-center text-white text-[41px] font-bold font-default leading-[75.50px] group-hover:text-primary transition-all duration-300">
                01
              </div>
            </div>
            <div className="w-2/3 my-7 px-4">
              <div className="w-[285px] h-[34px] text-neutral-700 text-[26px] font-semibold font-default leading-[33px]">
                Créer un compte
              </div>
              <div className="w-[45px] h-[0px] border-2 border-primary mb-2 mt-3"></div>
              <div className="w-[205px] h-[74px] text-neutral-400 text-lg font-semibold font-default leading-[33px]">
                Tout d'abord, vous devez créer un compte{" "}
              </div>
            </div>
          </div>

          <div className="group w-[450.66px] h-[210.69px] flex px-4 bg-white rounded-[13px] transition-all duration-300 ease-in-out transform hover:shadow-lg">
            <div className="w-1/3 h-[84.94px] flex justify-center bg-primary m-5 my-12 rounded-[7px] group-hover:bg-optional2 transition-all duration-300">
              <div className="w-[55px] h-[53px] text-center text-white text-[41px] font-bold font-default leading-[75.50px] group-hover:text-primary transition-all duration-300">
                02
              </div>
            </div>
            <div className="w-2/3 my-7 px-4">
              <div className="w-[285px] h-[34px] text-neutral-700 text-[26px] font-semibold font-default leading-[33px]">
                Enregistrer une vidéo
              </div>
              <div className="w-[45px] h-[0px] border-2 border-primary mb-2 mt-3"></div>
              <div className="w-[220px] h-[74px] text-neutral-400 text-lg font-semibold font-default leading-[33px]">
                Ensuite, enregistrez une vidéo et parlez de votre carrière{" "}
              </div>
            </div>
          </div>

          <div className="group w-[402.66px] h-[183.69px] flex px-4 bg-white rounded-[13px] transition-all duration-300 ease-in-out transform hover:shadow-lg">
            <div className="w-1/3 h-[84.94px] flex justify-center bg-primary m-5 my-12 rounded-[7px] group-hover:bg-optional2 transition-all duration-300">
              <div className="w-[55px] h-[53px] text-center text-white text-[41px] font-bold font-default leading-[75.50px] group-hover:text-primary transition-all duration-300">
                03
              </div>
            </div>
            <div className="w-2/3 my-7 px-4">
              <div className="w-[285px] h-[34px] text-neutral-700 text-[26px] font-semibold font-default leading-[33px]">
                Obtenez un emploi
              </div>
              <div className="w-[45px] h-[0px] border-2 border-primary mb-2 mt-3"></div>
              <div className="w-[205px] h-[74px] text-neutral-400 text-lg font-semibold font-default leading-[33px]">
                Enfin, obtenez votre emploi{" "}
              </div>
            </div>
          </div>

          {/* <div className="flex items-center justify-center max-w-md">
            <div className="grid p-3 rounded-xl w-16 h-[3.2rem] bg-[#F0BB1F] place-items-center">
              <img
                src="./images/selection .png"
                className="w-6 h-6"
                role="presentation"
              />
            </div>
            <div className="flex flex-col mx-4 text-[#5E6282] break-words font-poppins w-max">
              <h3 className="font-bold font-poppins">Choose Destination</h3>
              <p className="mt-1 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Urna,
                tortor tempus.
              </p>
            </div>
          </div> */}
        </motion.div>
        {/* <div className="absolute -right-28 bottom-32 md:-top-44 md:-right-32">
          <img
            src="./images/blue-circle.png"
            className="z-0 w-96 h-96"
            role="presentation"
          />
        </div> */}
        {/* <motion.div
          initial={{ x: 100 }}
          transition={{ duration: 1 }}
          whileInView={{ x: 0 }}
          viewport={{ once: true }}
          className="z-20 p-6 mt-6 bg-white shadow-xl md:-mt-16 rounded-2xl"
        >
          <div className="flex flex-row mt-4 font-poppins">
          <div className="w-[402.66px] h-[183.69px] bg-white rounded-[13px]"></div>

          </div>
        </motion.div> */}
      </div>
    </section>
  );
}
