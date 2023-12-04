import React from "react";
import {motion} from "framer-motion";
import Link from "next/link";
import {FaFacebook, FaInstagram, FaLinkedinIn, FaTwitter} from "react-icons/fa";
import Image from "next/image";

type Props = {};

export default function Footer({}: Props) {
    return (
        <footer className="w-full bg-optional1 p-10 pt-20 pb-10 mx-auto mt-10 md:w-full md:px-32 md:p-10 md:mx-auto">
            <motion.div
                initial={{y: 100}}
                transition={{duration: 1.2}}
                whileInView={{y: 0}}
                viewport={{once: true}}
                className="flex flex-wrap justify-center gap-20"
            >
                <div className="md:max-w-[14rem] text-center md:text-start">
                    <h2 className="text-5xl font-default text-secondary">
                        <Image src={"/facejobLogo.png"} alt={"facejob logo"} width={100} height={100}/>
                    </h2>
                    <p className="mt-5 text-xs text-gray-600 font-poppins">
                        Tangier, Av Omar Al Mokhtar, NR 20, Morocco.
                    </p>
                    <p className="mt-3 text-xs text-gray-600 font-poppins">
                        www.facejob.ma
                    </p>
                    <p className="mt-3 text-xs text-gray-600 font-poppins">
                        +212 8 08588918
                    </p>
                    <p className="mt-3 text-xs text-gray-600 font-poppins">
                        facejob@gmail.com
                    </p>
                </div>

                <div className="flex flex-col mb-10 sm:mb-0 font-default">
                    <h4 className="font-bold text-secondary">Company</h4>
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
                    <h6 className="font-bold text-secondary">Contact</h6>
                    <ul className="space-y-2 text-sm font-light text-gray-600">
                        <li className="mt-4">
                            <Link href="/termes/entreprise">Partenaires commerciaux & prospects</Link>
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
                <div className="flex flex-col items-center col-span-2 mb-16 md:items-start sm:mb-0 md:ml-8">
                    <ul className="flex gap-6 font-light text-gray-600">
                        <li>
                            <Link
                                href="https://www.facebook.com/people/facejob/100085933744117/"
                                className="grid w-10 h-10 bg-white rounded-full md:w-8 md:h-8 drop-shadow-2xl place-items-center"
                                aria-label="Facebook Icon"
                            >
                                <FaFacebook/>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="https://www.instagram.com/facejob.ma/"
                                className="grid w-10 h-10 bg-white rounded-full md:w-8 md:h-8 drop-shadow-2xl place-items-center"
                                aria-label="Instagram icon"
                            >
                                <FaInstagram/>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="https://twitter.com/facejob_/facejob.ma/"
                                className="grid w-10 h-10 bg-white rounded-full md:w-8 md:h-8 drop-shadow-2xl place-items-center"
                                aria-label="Twitter icon"
                            >
                                <FaTwitter/>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="https://www.linkedin.com/company/facejob-ma/"
                                className="grid w-10 h-10 bg-white rounded-full md:w-8 md:h-8 drop-shadow-2xl place-items-center"
                                aria-label="Linked icon"
                            >
                                <FaLinkedinIn/>
                            </Link>
                        </li>
                    </ul>
                    <p className="mt-6 mb-4 text-xs font-poppins">
                        Découvrez notre application
                    </p>
                    <div className="flex w-full">
                        <Link
                            href="#"
                            className="flex items-center justify-center p-2 pl-4 pr-5 bg-black rounded-full"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18.562"
                                height="20"
                                viewBox="0 0 18.562 20"
                            >
                                <g
                                    id="google-play_1"
                                    data-name="google-play 1"
                                    transform="translate(-0.719)"
                                >
                                    <path
                                        id="Vector"
                                        d="M10.788,9.671.745,19.342A1.709,1.709,0,0,1,0,17.917V1.426A1.709,1.709,0,0,1,.745,0Z"
                                        transform="translate(0.719 0.331)"
                                        fill="#2196f3"
                                    />
                                    <path
                                        id="Vector-2"
                                        data-name="Vector"
                                        d="M13.558,6.624,10.044,10,0,.331A1.339,1.339,0,0,1,.118.249,1.718,1.718,0,0,1,1.853.222Z"
                                        transform="translate(1.464 0)"
                                        fill="#4caf50"
                                    />
                                    <path
                                        id="Vector-3"
                                        data-name="Vector"
                                        d="M7.773,3.378a1.736,1.736,0,0,1-.908,1.544L3.514,6.756,0,3.378,3.514,0,6.865,1.834A1.736,1.736,0,0,1,7.773,3.378Z"
                                        transform="translate(11.507 6.624)"
                                        fill="#f0bb1f"
                                    />
                                    <path
                                        id="Vector-4"
                                        data-name="Vector"
                                        d="M13.558,3.378,1.853,9.78A1.741,1.741,0,0,1,.118,9.753,1.339,1.339,0,0,1,0,9.671L10.044,0Z"
                                        transform="translate(1.464 10.002)"
                                        fill="#f15a2b"
                                    />
                                </g>
                            </svg>
                            <div className="flex flex-col ml-2">
                                <p className="text-[10px] text-white">Disponible sur le</p>
                                <p className="text-xs text-white">Google Play</p>
                            </div>
                        </Link>

                        <Link
                            href="#"
                            className="flex items-center justify-center p-2 pl-4 pr-5 ml-2 bg-black rounded-full"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="19"
                                height="22"
                                viewBox="0 0 13.124 16"
                            >
                                <g
                                    id="apple_2_1"
                                    data-name="apple (2) 1"
                                    transform="translate(-1163.438 -4561)"
                                >
                                    <g id="Group">
                                        <path
                                            id="Vector"
                                            d="M4.351,12.314C1.97,12.3,0,7.439,0,4.964,0,.92,3.034.034,4.2.034a4.836,4.836,0,0,1,1.586.39,3.545,3.545,0,0,0,.905.26,2.818,2.818,0,0,0,.65-.211A5.206,5.206,0,0,1,9.3,0h0a4.013,4.013,0,0,1,3.358,1.7l.245.368-.352.266a2.966,2.966,0,0,0-1.422,2.446,2.761,2.761,0,0,0,1.54,2.552c.221.133.449.27.449.569,0,.2-1.56,4.393-3.826,4.393a3.077,3.077,0,0,1-1.292-.314,2.62,2.62,0,0,0-1.15-.277,2.958,2.958,0,0,0-.91.246,4.46,4.46,0,0,1-1.579.368Z"
                                            transform="translate(1163.438 4564.686)"
                                            fill="#fff"
                                        />
                                        <path
                                            id="Vector-2"
                                            data-name="Vector"
                                            d="M3.006,0A3.152,3.152,0,0,1,.024,3.511,3.39,3.39,0,0,1,3.006,0Z"
                                            transform="translate(1169.974 4561)"
                                            fill="#fff"
                                        />
                                    </g>
                                </g>
                            </svg>

                            <div className="flex flex-col ml-2">
                                <p className="text-[10px] text-white">Disponible sur le</p>
                                <p className="text-xs text-white">Apple Store</p>
                            </div>
                        </Link>
                    </div>
                </div>
                <div className="space-y-4 text-sm">
                    <p className="mt-8 text-sm font-poppins">
                        Tous droits réservés facejob.ma
                    </p>
                </div>
            </motion.div>
        </footer>
    );
}
