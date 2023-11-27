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
                  src="./images/mike.png"
                  alt="Profile image of a man"
                  className="absolute rounded-full w-14 h-14 -left-6 -top-6"
                />
                <p className="">
                  "Sur les fenêtres, on parle de pâturages peints, mais ses
                  parties expresses utilisent. Bien sûr, le dernier sur lui est
                  le même que celui qui a connu ensuite. De cru ou détourné
                  non."
                </p>
                <p className="mt-6">Mohamed El</p>
                <p className="mt-2 text-sm">Maroc, TG</p>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="relative flex flex-col mt-8 mx-8 mb-4 py-6 px-8 font-poppins bg-white rounded-lg shadow-lg text-[#5E6282]">
                <img
                  src="./images/person-2.jpg"
                  alt="Profile image of a man"
                  className="absolute object-cover rounded-full w-14 h-14 -left-6 -top-6"
                />
                <p className="">
                  "Sur les fenêtres, on parle de pâturages peints, mais ses
                  parties expresses utilisent. Bien sûr, le dernier sur lui est
                  le même que celui qui a connu ensuite. De cru ou détourné
                  non."
                </p>
                <p className="mt-6">Mike taylor</p>
                <p className="mt-2 text-sm">US, CA</p>
              </div>
            </SwiperSlide>
          </Swiper>
        </motion.div>
      </div>
    </section>
  );
}
