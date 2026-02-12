"use client";

import Head from "next/head";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Logo } from "./Logo";

export default function NavBar() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Head>
        <title>facejob</title>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="shortcut icon" href="/images/favicon.png" />
        <meta
          name="description"
          content="Notre philosophie est simple : Offrir à toutes les entreprises, à tous les chercheurs d’emploi la chance de s’entrecroiser, de se connecter de la manière la plus facile que jamais, la plus efficace que jamais."
        />
        <link rel="canonical" href="https://facejob.ma/" />

        <meta property="og:locale" content="en_US" />
        <meta property="og:type”" content="website" />
        <meta
          property="og:title"
          content="facejob –  trouvez votre job même depuis chez vous."
        />
        <meta
          property="og:description"
          content="Notre philosophie est simple : Offrir à toutes les entreprises, à tous les chercheurs d’emploi la chance de s’entrecroiser, de se connecter de la manière la plus facile que jamais, la plus efficace que jamais."
        />
        <meta property="og:url" content="https://www.facejob.vercel.app/" />
        <meta property="og:site_name" content="facejob Travel Agency" />
        <meta property="og:image" content="" />
        <meta property="og:image:secure_url" content="" />
        <meta property="og:image:width" content="400" />
        <meta property="og:image:height" content="400" />
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:description"
          content="facejob –  trouvez votre job même depuis chez vous."
        />
        <meta
          name="twitter:title"
          content="facejob –  trouvez votre job même depuis chez vous."
        />
        <meta name="twitter:site" content="@facejob" />
        <meta name="twitter:image" content="todo" />
        <meta name="twitter:creator" content="@facejob" />

        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
      </Head>

      <motion.nav
        initial={{ y: -20 }}
        transition={{ duration: 1 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
      >
        <div className="w-full px-6 md:px-10 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-7">
              <div>
                <Logo />
              </div>
              <ul className="hidden md:flex gap-10 text-base font-medium text-secondary font-poppins">
                <li className="transition-all duration-300 ease-in-out hover:text-primary">
                  <Link href="/">Accueil</Link>
                </li>
                <li className="transition-all duration-300 ease-in-out hover:text-primary">
                  <Link href="/offres">Offres d'emploi</Link>
                </li>
                <li className="transition-all duration-300 ease-in-out hover:text-primary">
                  <Link href="/contact">Contact</Link>
                </li>
                <li className="transition-all duration-300 ease-in-out hover:text-primary">
                  <Link href="/blogs">Blogs</Link>
                </li>
              </ul>
            </div>
            <ul className="hidden md:flex gap-5 font-bold text-sm">
              <li>
                <Link
                  href="/auth/login-candidate"
                  className="px-6 py-3 rounded-[15px] border-[2px] border-primary text-primary font-default"
                >
                  Candidat
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/login-enterprise"
                  className="px-6 py-3 rounded-[15px] bg-primary text-white font-default"
                >
                  Entreprise
                </Link>
              </li>
            </ul>
            <div className="flex items-center md:hidden">
              <button
                className="outline-none"
                id="btn-mobile-menu"
                onClick={() => {
                  setOpen(!open);
                }}
              >
                <svg
                  className="w-6 h-6 text-gray-500 hover:text-primary"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div
          id="mobile-menu"
          className={`transition transform duration-300 ease-linear ${
            open ? "flex" : "hidden"
          }`}
        >
          <ul
            className={`flex flex-col items-center w-full p-4 mx-4 space-y-5 text-sm md:hidden font-poppins`}
          >
            <li className={"flex gap-2 mb-2"}>
              <div>
                <Link
                  href="/auth/login-candidate"
                  className="px-8 py-3 rounded-[15px] border-[2px] border-primary text-primary font-default"
                >
                  Candidat
                </Link>
              </div>
              <div>
                <Link
                  href="/auth/login-enterprise"
                  className="px-8 py-3 rounded-[15px] bg-primary text-white font-default"
                >
                  Entreprise
                </Link>
              </div>
            </li>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/offres">Offres d'emploi</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/blogs">Blogs</Link>
            </li>
          </ul>
        </div>
      </motion.nav>
    </>
  );
}
