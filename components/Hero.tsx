import Head from "next/head";
import React from "react";
import {motion} from "framer-motion";
import NavBar from "./NavBar";

type Props = {};

export default function Hero({}: Props) {
    return (
        <>
            <header className="relative w-full py-4 bg-optional1">
                <NavBar/>
                {/* <div className="absolute -top-[16rem] -right-[16.5rem] -z-10 rotate-10 h-[872px] w-[786px] bg-hero bg-no-repeat bg-cover" /> */}
                <div className="flex flex-col my-20 md:mx-12 md:flex-row">
                    <motion.div
                        initial={{x: -20}}
                        transition={{duration: 1.5}}
                        whileInView={{x: 0}}
                        viewport={{once: true}}
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

                        <div
                            className="my-10 text-4xl leading-10 space-y-4 font-bold font-default text-secondary md:text-6xl">
                            <p>Make Your Dream</p> <p>Career With Facejob</p>
                        </div>

                        <p className="w-5/6 text-lg text-third font-semibold font-default">
                            The easiest way to get your dream job, create trackable resumes
                            and enrich your application employer will find you
                        </p>

                        <div className="flex flex-col mt-10 items-center gap-6 sm:flex-row">
                            <div className="w-full sm:w-[590px] h-auto bg-white rounded-[31px] border border-slate-200">
                                <div className="mt-2 ml-3 mb-2 flex flex-col sm:flex-row">
                                    <div
                                        className="w-full sm:w-[444.47px] h-auto sm:h-[44.99px] bg-white bg-opacity-70 rounded-tl-[20px] sm:rounded-bl-[20px] border border-zinc-100 mb-4 sm:mb-0 sm:mr-4">
                                        <input
                                            type="text"
                                            className="w-full h-full pl-4 text-third text-base opacity-70 font-semibold font-default focus:outline-none"
                                            placeholder="Email Address"
                                        />
                                    </div>
                                    <div
                                        className="w-1/2 items-center sm:w-[110px] h-auto sm:h-[45px] p-2 text-center bg-primary rounded-tr-[37px] sm:rounded-br-[37px] flex-col justify-center sm:items-center gap-2.5">
                                        <button
                                            className="text-white text-base font-bold font-default leading-7 focus:outline-none">
                                            Find Job
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center mt-14">
                            <img src="/Arrow.png" alt="" className="mr-2"/>
                            <a
                                href="#scroll-target"
                                className="flex items-center w-[211px] h-[35px] text-third text-[17px] font-medium font-default "
                            >
                                Scroll down
                            </a>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{x: 100}}
                        transition={{duration: 1.5}}
                        whileInView={{x: 0}}
                        viewport={{once: true}}
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
