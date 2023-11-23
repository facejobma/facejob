import Head from "next/head";
import React from "react";
import { motion } from "framer-motion";

type Props = {};

export default function Header({}: Props) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Head>
        <title>Facejob</title>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="shortcut icon" href="./images/favicon.png" />
        <meta
          name="description"
          content="Jadoo Travel agency is one of the leading agencies that has smooth process and provides affordable pricing."
        />
        <link
          rel="canonical"
          href="https://www.jadoo-travel-agency.vercel.app/"
        />

        <meta property="og:locale" content="en_US" />
        <meta property="og:type”" content="website" />
        <meta
          property="og:title"
          content="Jadoo – Travel with the best travel agency for a lovely travel experience."
        />
        <meta
          property="og:description"
          content="Jadoo Travel agency is one of the leading agencies that has smooth process and provides affordable pricing."
        />
        <meta
          property="og:url"
          content="https://www.jadoo-travel-agency.vercel.app/"
        />
        <meta property="og:site_name" content="Jadoo Travel Agency" />
        <meta property="og:image" content="" />
        <meta property="og:image:secure_url" content="" />
        <meta property="og:image:width" content="400" />
        <meta property="og:image:height" content="400" />
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:description"
          content="Jadoo Travel agency is one of the leading agencies that has smooth
    process and provides affordable pricing."
        />
        <meta
          name="twitter:title"
          content="Jadoo – Travel with the best travel agency for a lovely travel experience."
        />
        <meta name="twitter:site" content="@imaisam" />
        <meta name="twitter:image" content="" />
        <meta name="twitter:creator" content="@imaisam" />

        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
      </Head>

      <header className="relative w-full py-4 bg-optional1">
        <motion.nav
          initial={{ y: -20 }}
          transition={{ duration: 1 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
        >
          <div className="w-full px-10 mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-7">
                <div>
                  <a href="#" className="flex items-center px-2 py-4">
                    <img
                      src="/facejobLogo.png"
                      alt="Logo"
                      className="w-3/4 mr-2"
                    />
                  </a>
                </div>
                <ul className="flex gap-10 text-sm md:flex font-medium text-secondary font-poppins">
                  <li>
                    <a href="#">Home</a>
                  </li>
                  <li>
                    <a href="#">Services</a>
                  </li>
                  <li>
                    <a href="#">Categories</a>
                  </li>
                  <li>
                    <a href="#">Contact</a>
                  </li>
                  <li>
                    <a href="#">Blogs</a>
                  </li>
                </ul>
              </div>
              <ul className="flex gap-5 text-sm md:flex">
                <li>
                  <a
                    href="#"
                    className="px-6 py-2 rounded-[15px] border-[2px] border-primary text-primary font-poppins"
                  >
                    Login
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="px-6 py-2 rounded-[15px] bg-primary text-white font-poppins"
                  >
                    Find Job
                  </a>
                </li>
                {/* TODO: Languages later */}
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
                    x-show="!showMenu"
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
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">Services</a>
              </li>
              <li>
                <a href="#">Categories</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
              <li>
                <a href="#">Blogs</a>
              </li>
              <li>
                <a href="/#">Login</a>
              </li>
              <li className="-ml-2">
                <a
                  href="#"
                  className="px-2 py-2 rounded-md inline-block border-[2px] border-gray-300"
                >
                  Find Job
                </a>
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
        {/* <div className="absolute -top-[16rem] -right-[16.5rem] -z-10 rotate-10 h-[872px] w-[786px] bg-hero bg-no-repeat bg-cover" /> */}
        <div className="flex flex-col my-20 md:mx-12 md:flex-row">
          <motion.div
            initial={{ x: -20 }}
            transition={{ duration: 1.5 }}
            whileInView={{ x: 0 }}
            viewport={{ once: true }}
            className="flex-1 mx-8 md:mt-2"
          >
            {/* <img src="/toggle1.png" alt="Logo" className="w-1/6 mr-2" /> */}
            {/* <p className="text-lg font-medium text-secondary font-poppins">
              Find Your Dream Job
            </p> */}
            <div className="flex items-center">
              <img
                className="w-12 h-auto mr-4"
                src="/toggle1.png"
                alt="Toggle"
              />
              <p className="font-semibold text-lg text-secondary font-default">
                Find Your Dream Job
              </p>
            </div>

            <div className="my-10 text-4xl leading-10 space-y-4 font-bold font-default text-secondary md:text-6xl">
              <p>Make Your Dream</p> <p>Career With Facejob</p>
            </div>

            <p className="w-5/6 text-lg text-third font-semibold font-default">
              The easiest way to get your dream job, create trackable resumes
              and enrich your application employer will find you
            </p>

            <div className="flex flex-col mt-10 items-center gap-6 sm:flex-row">
              <div className="w-full sm:w-[590px] h-auto bg-white rounded-[31px] border border-slate-200">
                <div className="mt-2 ml-3 mb-2 flex flex-col sm:flex-row">
                  <div className="w-full sm:w-[444.47px] h-auto sm:h-[44.99px] bg-white bg-opacity-70 rounded-tl-[20px] sm:rounded-bl-[20px] border border-zinc-100 mb-4 sm:mb-0 sm:mr-4">
                    <input
                      type="text"
                      className="w-full h-full pl-4 text-third text-base opacity-70 font-semibold font-default focus:outline-none"
                      placeholder="Email Address"
                    />
                  </div>
                  <div className="w-1/2 items-center sm:w-[110px] h-auto sm:h-[45px] p-2 text-center bg-primary rounded-tr-[37px] sm:rounded-br-[37px] flex-col justify-center sm:items-center gap-2.5">
                    <button className="text-white text-base font-bold font-default leading-7 focus:outline-none">
                      Find Job
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center mt-14">
              <img src="/Arrow.png" alt="" className="mr-2" />
              <a
                href="#scroll-target"
                className="flex items-center w-[211px] h-[35px] text-third text-[17px] font-medium font-default "
              >
                Scroll down
              </a>
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
              src="/businessMan.png"
              className="-mt-2 md:w-[620px] md:h-[575px] md:left-20 md:absolute"
              // className="-mt-14 w-[750px]  md:w-full md:right-7 md:absolute"
              alt="girl travelling"
            />
            <img
              src="/message.png"
              alt="plane"
              className="absolute -top-52 left-6   w-[245px] h-[82.97px] md:left-[5rem] mt-36 md:right-[5rem] md:top-2"
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
