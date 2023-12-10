import React from "react";
import { motion } from "framer-motion";
import NavBar from "./NavBar";
import Image from "next/image";
import Link from "next/link";

type Props = {};

export default function Hero({}: Props) {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    const section2 = document.getElementById("section2");

    if (section2) {
      section2.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="relative w-full py-4 pb-20 bg-optional1">
        <NavBar />
        {/* <div className="absolute -top-[16rem] -right-[16.5rem] -z-10 rotate-10 h-[872px] w-[786px] bg-hero bg-no-repeat bg-cover" /> */}
        <div className="flex flex-col my-20 md:mx-12 md:flex-row">
          <motion.div
            initial={{ x: -20 }}
            transition={{ duration: 1.5 }}
            whileInView={{ x: 0 }}
            viewport={{ once: true }}
            className="flex-1 mx-8 md:mt-2"
          >
            {/* <img src="/toggle.png" alt="Logo" className="w-1/6 mr-2" /> */}
            {/* <p className="text-lg font-medium text-secondary font-poppins">
              Find Your Dream Job
            </p> */}
            <div className="flex items-center">
              <Image
                className="w-12 h-auto mr-4"
                src="/toggle.png"
                alt="Toggle"
                width={100}
                height={100}
              />
              <p className="font-semibold text-lg text-secondary font-default">
                Trouvez votre emploi de rêve.
              </p>
            </div>

            <div className="my-5 text-2xl leading-10 space-y-2 font-bold font-default text-secondary md:text-4xl md:px-2">
              <p>
                Vous êtes une entreprise ... rencontrez en avant-première les
                candidats et de nicher les talents caches
              </p>
            </div>

            <p className="w-5/6 text-2xl text-third font-bold font-default md:px-1 md:mt-8">
              Vous êtes un candidat en recherche d'emploi ... rencontrez vous et
              trouvez votre job même depuis chez vous
            </p>

            <div className="flex items-center mt-16">
              <img src="/Arrow.png" alt="" className="mr-2" />
              <Link
                href="#section2"
                className="flex items-center w-[211px] h-[35px] text-third text-[17px] font-medium font-default"
                onClick={handleScroll}
              >
                Faites défiler
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ x: 100 }}
            transition={{ duration: 1.5 }}
            whileInView={{ x: 0 }}
            viewport={{ once: true }}
            className="relative flex-1 mt-24 md:mt-0"
          >
            <img
              src="/img1.jpg"
              className="-mt-2 rounded-3xl md-10 p-7 md:p-0 md:w-full md:left-2 md:top-4 md:absolute"
              // className="-mt-14 w-[750px]  md:w-full md:right-7 md:absolute"
              alt="girl travelling"
            />
            <img
              src="/message.png"
              alt="plane"
              className="absolute -top-52 left-24 w-[200px] h-[75.97px] md:left-[28rem] mt-36 md:mt-72"
            />
            {/* <img
              src="/images/plane.png"
              alt="plane"
              className="absolute right-0 -top-12 md:top-12"
            /> */}
            {/* <div className="w-[163px] h-[44.99px] bg-white bg-opacity-70 rounded-[20px] right-0 -top-12 md:top-12"></div> */}
          </motion.div>
        </div>
      </header>
    </>
  );
}
