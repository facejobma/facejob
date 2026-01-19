import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
import Image from "next/image";

type Props = {};

export default function Footer({}: Props) {
  return (
    <footer className="w-full bg-optional1 p-10 pt-20 pb-10 mx-auto mt-10 md:w-full md:px-32 md:p-10 md:mx-auto">
      <motion.div
        initial={{ y: 100 }}
        transition={{ duration: 1.2 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        className="flex flex-wrap justify-center gap-20"
      >
        <div className="md:max-w-[14rem] text-center md:text-start">
          <h2 className="text-5xl font-default text-secondary">
            <Image
              src={"/facejobLogo.png"}
              alt={"facejob_client logo"}
              width={100}
              height={100}
              className="mx-auto md:mx-0"
            />
          </h2>
          {/* <p className="mt-5 text-xs text-gray-600 font-poppins">
                        Villa 11, Résidence Ryqd Al andalous, Ville Nouvelle Ibn Battouta,
                        Tanger.
                    </p> */}
          <p className="mt-3 text-xs text-gray-600 font-poppins">
            www.facejob.ma
          </p>
          <p className="mt-3 text-xs text-gray-600 font-poppins">
            +212 8 08588918
          </p>
          <p className="mt-3 text-xs text-gray-600 font-poppins">
            contact@facejob.ma
          </p>
        </div>

        <div className="flex flex-col mb-10 sm:mb-0 font-default">
          <h4 className="font-bold text-secondary">Entreprise</h4>
          <ul className="space-y-2 text-sm font-light text-gray-600">
            <li className="mt-4">
              <Link href="/apropsdenous">À propos</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col mb-10 sm:mb-0 font-default">
          <h6 className="font-bold text-secondary">
            Conditions générales d'utilisation
            <br />& protection des données
          </h6>
          <ul className="space-y-2 text-sm font-light text-gray-600">
            <li className="mt-4">
              <Link href="/termes/entreprise">Partenaires</Link>
            </li>
            <li>
              <Link href="/termes/candidats">Candidats</Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col mb-10 sm:mb-0 font-default">
          <h6 className="font-bold text-secondary">Plus</h6>
          <ul className="space-y-2 text-sm font-light text-gray-600">
            <li className="mt-4">
              <Link href="/blogs">Blogs</Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col items-center col-span-2  md:items-start sm:mb-0 md:ml-8">
          <ul className="flex gap-6 font-light text-gray-600">
            <li>
              <Link
                href="https://www.facebook.com/people/facejob/100085933744117/"
                className="grid w-10 h-10 bg-white rounded-full md:w-8 md:h-8 drop-shadow-2xl place-items-center"
                aria-label="Facebook Icon"
                target={"_blank"}
                rel="noopener noreferrer"
              >
                <FaFacebook />
              </Link>
            </li>
            <li>
              <Link
                href="https://www.instagram.com/facejob.ma/"
                className="grid w-10 h-10 bg-white rounded-full md:w-8 md:h-8 drop-shadow-2xl place-items-center"
                aria-label="Instagram icon"
                target={"_blank"}
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </Link>
            </li>
            <li>
              <Link
                href="https://twitter.com/facejob_/facejob.ma/"
                className="grid w-10 h-10 bg-white rounded-full md:w-8 md:h-8 drop-shadow-2xl place-items-center"
                aria-label="Twitter icon"
                target={"_blank"}
                rel="noopener noreferrer"
              >
                <FaTwitter />
              </Link>
            </li>
            <li>
              <Link
                href="https://www.linkedin.com/company/facejob-ma/"
                className="grid w-10 h-10 bg-white rounded-full md:w-8 md:h-8 drop-shadow-2xl place-items-center"
                aria-label="Linked icon"
                target={"_blank"}
                rel="noopener noreferrer"
              >
                <FaLinkedinIn />
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4 text-sm font-default">
          <p className="mt-2 text-sm font-default">
            Tous droits réservés facejob.ma
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
