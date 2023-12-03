import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion } from "framer-motion";
// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/scrollbar";

// import required modules
import { EffectCards, Scrollbar } from "swiper";

type Props = {};

export default function Testimonials({}: Props) {
  return (
    <section className="w-full md:px-16 pb-10 mx-auto mb-20">
      <div className="relative flex flex-col p-10 items-center justify-between w-full gap-10 md:gap-20 md:flex-row">
        <motion.div
          initial={{ x: -10 }}
          transition={{ duration: 1 }}
          whileInView={{ x: 0 }}
          viewport={{ once: true }}
          className="max-w-lg  text-gray-800 md:text-start font-default"
        >
          <img
            src="/img3.jpg"
            className="-mt-2 rounded-3xl md-10 p-7 md:p-2 md:ml-20 md:w-2/6 md:left-6 md:top-4 md:absolute "
            alt="girl record video"
          />
        </motion.div>
        <motion.div
          initial={{ x: 100 }}
          transition={{ duration: 1 }}
          whileInView={{ x: 0 }}
          viewport={{ once: true }}
          className="max-w-sm md:max-w-md md:mt-14 md:mr-20"
        >
          <motion.div
            initial={{ x: -100 }}
            transition={{ duration: 1 }}
            whileInView={{ x: 0 }}
            viewport={{ once: true }}
            className="max-w-lg text-center mb-32 text-gray-800 md:text-start font-default"
          >
            <p className="text-gray-600">Ce que disent les gens</p>
            <h2 className="my-4 text-3xl font-bold text-gray-800 md:text-5xl font-default">
              Témoignages
            </h2>
          </motion.div>

          <Swiper
            scrollbar={{
              hide: true,
            }}
            effect={"cards"}
            grabCursor={true}
            modules={[EffectCards, Scrollbar]}
            className="mySwiper"
          >
            <SwiperSlide>
              <div className="relative flex flex-col mt-8 mx-8 mb-4 py-6 px-8 font-poppins bg-white rounded-lg shadow-lg text-[#5E6282]">
                <img
                  src="/images/Sohaib MANAH.png"
                  alt="Sohaib MANAH image"
                  className="absolute object-cover rounded-full w-14 h-14 -left-6 -top-6"
                />
                <p className="">
                  "A l'ère où tout devient digitalisé et en tant qu’ingénieur
                  logiciel junior … facejob était la solution la plus adéquate
                  et la plus simple pour moi pour pénétrer le marché du
                  travail."
                </p>
                <p className="mt-6">Sohaib MANAH</p>
                <p className="mt-2 text-sm">Maroc</p>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="relative flex flex-col mt-8 mx-8 mb-4 py-6 px-8 font-poppins bg-white rounded-lg shadow-lg text-[#5E6282]">
                <img
                  src="/images/Mariam BEN DAOUED.jpg"
                  alt="Mariam BEN DAOUED image"
                  className="absolute rounded-full w-14 h-14 -left-6 -top-6"
                />
                <p className="">
                  "j’ai été attirée par le côté innovateur de l’idée, j’ai
                  enregistré mon CV Vidéo et quelques jours après … mon
                  téléphone a commencé à sonner déjà et j’ai réussi à décrocher
                  mon 1er entretien grâce à facejob."
                </p>
                <p className="mt-6">Mariam BEN DAOUED</p>
                <p className="mt-2 text-sm">Maroc</p>
              </div>
            </SwiperSlide>
          </Swiper>
        </motion.div>
      </div>
    </section>
  );
}
