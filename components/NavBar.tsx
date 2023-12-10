import Head from "next/head";
import React from "react";
import {motion} from "framer-motion";
import Link from "next/link";
import {Logo} from "./Logo";


export default function NavBar() {
    const [open, setOpen] = React.useState(false);
    return (
        <>
            <Head>
                <title>facejob</title>
                <meta charSet="UTF-8"/>
                <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <link rel="shortcut icon" href="/images/favicon.png"/>
                <meta
                    name="description"
                    content="facejob Travel agency is one of the leading agencies that has smooth process and provides affordable pricing."
                />
                <link
                    rel="canonical"
                    href="https://facejob.ma/"
                />

                <meta property="og:locale" content="en_US"/>
                <meta property="og:type”" content="website"/>
                <meta
                    property="og:title"
                    content="facejob – Travel with the best travel agency for a lovely travel experience."
                />
                <meta
                    property="og:description"
                    content="facejob Travel agency is one of the leading agencies that has smooth process and provides affordable pricing."
                />
                <meta
                    property="og:url"
                    content="https://www.facejob.vercel.app/"
                />
                <meta property="og:site_name" content="facejob Travel Agency"/>
                <meta property="og:image" content=""/>
                <meta property="og:image:secure_url" content=""/>
                <meta property="og:image:width" content="400"/>
                <meta property="og:image:height" content="400"/>
                <meta name="twitter:card" content="summary"/>
                <meta
                    name="twitter:description"
                    content="facejob Travel agency is one of the leading agencies that has smooth
    process and provides affordable pricing."
                />
                <meta
                    name="twitter:title"
                    content="facejob – Travel with the best travel agency for a lovely travel experience."
                />
                <meta name="twitter:site" content="@facejob"/>
                <meta name="twitter:image" content="todo"/>
                <meta name="twitter:creator" content="@facejob"/>

                <meta
                    name="robots"
                    content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
                />
            </Head>

            <motion.nav
                initial={{y: -20}}
                transition={{duration: 1}}
                whileInView={{y: 0}}
                viewport={{once: true}}
            >
                <div className="w-full my-3 px-10 mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-7">
                            <div>
                                <Logo/>
                            </div>
                            <ul className="flex gap-10 text-base md:flex font-medium text-secondary font-poppins">
                                <li className="transition-all duration-300 ease-in-out hover:text-primary">
                                    <Link href="/">Accueil</Link>
                                </li>


                                <li className="transition-all duration-300 ease-in-out hover:text-primary">
                                    <Link href="/contact">Contact</Link>
                                </li>
                                <li className="transition-all duration-300 ease-in-out hover:text-primary">
                                    <Link href="/blogs">Blogs</Link>
                                </li>
                            </ul>
                        </div>
                        <ul className="flex gap-5 font-bold text-sm md:flex">
                            <li>
                                <Link
                                    href="/auth/login-candidat"
                                    className="px-6 py-3 rounded-[15px] border-[2px] border-primary text-primary font-default"
                                >
                                    Candidat
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/auth/login-entreprise"
                                    className="px-6 py-3 rounded-[15px] bg-primary text-white font-default"
                                >
                                    Entreprise
                                </Link>
                            </li>
                            {/*  Languages later */}
                            {/* <li className="">
        <select
          className="px-2 py-2 bg-transparent"
          name="langs"
          id="lang-select"
          aria-label="Select site language"
        >
          <option value="en" id="en">
            EN
          </option>
          <option value="de" id="de">
            DE
          </option>
          <option value="tr" id="tr">
            TR
          </option>
        </select>
      </li> */}
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
                                    xlinkShow="!showMenu"
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
                        className={`flex flex-col p-4 mx-4 space-y-5 text-sm sm:hidden font-poppins`}
                    >
                        <li>
                            <Link href="/">Home</Link>
                        </li>
                        <li>
                            <Link href="/contact">Contact</Link>
                        </li>
                        <li>
                            <Link href="#">Blogs</Link>
                        </li>
                        <li>
                            <Link href="/#">Login</Link>
                        </li>
                        <li className="-ml-2">
                            <Link
                                href="#"
                                className="px-2 py-2 rounded-md inline-block border-[2px] border-gray-300"
                            >
                                Find Job
                            </Link>
                        </li>
                        {/* <li className="">
                <select
                  className="py-2 bg-transparent"
                  name="langs"
                  id="lang-select"
                >
                  <option value="en">EN</option>
                  <option value="de">DE</option>
                  <option value="tr">TR</option>
                </select>
              </li> */}
                    </ul>
                </div>
            </motion.nav>
        </>
    );
}
