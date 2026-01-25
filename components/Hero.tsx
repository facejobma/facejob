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
        <div className="flex flex-col-reverse my-2 md:my-20 md:mx-12 md:flex-row">
          <motion.div
            initial={{ y: 20 }}
            transition={{ duration: 1.5 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            className="flex-1 mx-2 md:mx-8 md:mt-2"
          >
            {/* <div className="flex items-center mt-8 md:mt-0">
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
            </div> */}

            {/*<div className="my-5 px-1 text-2xl leading-10 space-y-2 font-bold font-default text-secondary md:text-4xl md:px-2">*/}
            {/*  <p>*/}
            {/*    Vous êtes une entreprise ... rencontrez en avant-première les*/}
            {/*    candidats et dénichez les talents cachés*/}
            {/*  </p>*/}
            {/*</div>*/}

            <p className=" md:w-5/6 px-1 text-xl md:text-2xl text-gray-600 font-bold font-default md:px-1 md:mt-8 ">
              Vous êtes une entreprise ... rencontrez en avant-première les
              candidats et dénichez les talents cachés
            </p>
            <p className=" md:w-5/6 px-1 text-xl md:text-2xl  text-gray-600 font-bold font-default md:px-1 md:mt-8">
              Vous êtes un candidat en recherche d&apos;emploi ... démarquez-vous et
              trouvez votre job même depuis chez vous
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 px-1 md:px-0">
              <Link
                href="/offres"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-1 transition-colors duration-300"
              >
                Découvrir les offres
              </Link>
              <Link
                href="/auth/signup-candidate"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors duration-300"
              >
                Créer mon profil
              </Link>
            </div>

            <div className="flex justify-center md:justify-start ml-16 md:ml-0 items-center mt-16">
              <Image
                src="/Arrow.png"
                alt=""
                className="mr-2 w-4 h-4"
                width={20}
                height={20}
              />
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
            initial={{ x: 0 }}
            transition={{ duration: 1.5 }}
            whileInView={{ x: 0 }}
            viewport={{ once: true }}
            className="relative flex-1 mt-4 md:mt-0"
          >
            <Image
              src="/img1.jpg"
              className="-mt-2 rounded-3xl  md:rounded-3xl md-10 p-4 md:p-0 md:w-full md:left-2 md:top-4 md:absolute"
              alt="girl travelling"
              width={1000}
              height={1000}
            />
            {/* <Image
              src="/message2.png"
              alt="plane"
              className="absolute -top-52 left-44  md:left-[28rem] mt-60 md:mt-72"
              width={200}
              height={200}
            /> */}
          </motion.div>
        </div>
      </header>
    </>
  );
}
