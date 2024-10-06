import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaUserPlus, FaVideo } from "react-icons/fa";
import { MdOutlineWork } from "react-icons/md";
import { useEffect, useState } from 'react';


type Props = {};


export default function HowWorks({}: Props) {
  const [offre, setOffre] = useState({
    titre: "",
    contractType: "",
    location: "",
  });

  useEffect(() => {
    const fetchRandomOffre = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/random/`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("data", data);
        setOffre(data);
      } catch (error) {
        console.error("Error fetching the random offer:", error);
      }
    };

    fetchRandomOffre();
  }, []);

// export default function HowWorks({}: Props) {
  return (
    <section className="w-3/4 pb-10 mx-auto mt-32 mb-16 font-default">
      <div className="max-w-lg text-center text-gray-800 md:text-start ">
        <p className="text-gray-600">Facile et rapide</p>
        <h2 className="my-4 text-4xl font-bold text-gray-800 md:text-5xl">
          Explorez les étapes suivantes .
        </h2>
      </div>

      <div className="relative flex flex-col gap-20 my-24 md:flex-row md:gap-36 md:justify-between">
        <motion.div
          initial={{ x: -100 }}
          transition={{ duration: 1 }}
          whileInView={{ x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col gap-12"
        >
          <div className="flex items-center  max-w-md">
            <div className="grid p-3 rounded-xl w-16 h-[3.2rem] bg-primary-3 place-items-center">
              <FaUserPlus color={"#fff"} />
            </div>
            <div className="flex flex-col mx-4 text-[#5E6282] break-words font-poppins w-max">
              <h3 className="font-bold font-poppins"> Créer un compte</h3>
              <p className="mt-1 text-sm">
                Tout d&apos;abord, vous devez créer un compte
              </p>
            </div>
          </div>
          <div className="flex items-center  max-w-md">
            <div className="grid p-3 rounded-xl w-16 h-[3.2rem] bg-primary-2 place-items-center">
              <FaVideo color={"#fff"} />
            </div>
            <div className="flex flex-col mx-4 text-[#5E6282] break-words font-poppins w-max">
              <h5 className="font-semibold"> Enregistrer une vidéo</h5>
              <p className="mt-1 text-sm">
                Ensuite, enregistrez une vidéo et parlez de votre carrière{" "}
              </p>
            </div>
          </div>
          <div className="flex items-center  max-w-md">
            <div className="grid p-3 rounded-xl w-16 h-[3.2rem] bg-primary-1 place-items-center">
              <MdOutlineWork color={"#fff"} />
            </div>
            <div className="flex flex-col mx-4 text-[#5E6282] break-words font-poppins w-max">
              <h5 className="font-semibold">Obtenez un emploi</h5>
              <p className="mt-1 text-sm"> Enfin, obtenez votre emploi </p>
            </div>
          </div>
        </motion.div>
        <div className="absolute -right-28 bottom-32 md:-top-44 md:-right-32">
          <Image
            src="/images/blue-circle.png"
            className="z-0 w-96 h-96"
            role="presentation"
            width={96}
            height={96}
            alt={"icon"}
          />
        </div>
        <motion.div
          initial={{ x: 100 }}
          transition={{ duration: 1 }}
          whileInView={{ x: 0 }}
          viewport={{ once: true }}
          className="z-20 p-6 mt-6 bg-white shadow-xl md:-mt-16 rounded-2xl"
        >
          <div className="flex flex-col mt-0 font-poppins">
            <Image
              src="/img4.jpg"
              className="z-10 object-cover"
              alt="image of a girl that got a job"
              width={1000}
              height={50}
            />
            <p className="mt-4 text-lg">
            {offre.titre || 'Titre par défaut'}
            </p>
            <div className="flex text-[#64636e] font-poppins text-base my-2">
              <p className="mx-1">{offre.contractType || 'Type de contrat par défaut'}</p>
              <p className="mx-2">|</p>
              <p>par Facejob</p>
              <p className="mx-2">|</p>
              <p>{offre.location || 'ville par défaut'}</p>

            </div>
            <div className="flex gap-4 mt-2 mb-8">
              <div className="grid w-10 h-10 rounded-full place-items-center bg-[#F5F5F5] cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13.952"
                  height="14"
                  viewBox="0 0 13.952 14"
                >
                  <g
                    id="leaf_1"
                    data-name="leaf 1"
                    transform="translate(-0.024 0)"
                  >
                    <g id="Group">
                      <g id="Group-2" data-name="Group">
                        <path
                          id="Vector"
                          d="M13.63.151C13.261.043,4.238-.855,1.07,3.426c-1.4,1.9-1.425,4.5-.07,7.727A16.264,16.264,0,0,0,.11,13.409a.456.456,0,1,0,.871.27C3.4,5.87,11.245,2.093,13.652,1.138,13.886,1.045,14.2.317,13.63.151Z"
                          transform="translate(0.024 0)"
                          fill="#84829a"
                        />
                      </g>
                    </g>
                    <g id="Group-3" data-name="Group">
                      <g id="Group-4" data-name="Group">
                        <path
                          id="Vector-2"
                          data-name="Vector"
                          d="M0,9.833a9.984,9.984,0,0,0,3.827.829,6.455,6.455,0,0,0,2.987-.68,6.133,6.133,0,0,0,3.12-5.068A27.5,27.5,0,0,1,10.857,0C8.262,1.2,2.7,4.3,0,9.833Z"
                          transform="translate(2.472 2.297)"
                          fill="#84829a"
                        />
                      </g>
                    </g>
                  </g>
                </svg>
              </div>
              <div className="grid w-10 h-10 rounded-full place-items-center bg-[#F5F5F5] cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                >
                  <g
                    id="map_1"
                    data-name="map 1"
                    transform="translate(-0.001 0)"
                  >
                    <g id="Group">
                      <g id="Group-2" data-name="Group">
                        <path
                          id="Vector"
                          d="M13.5,0a.5.5,0,0,0-.224.053L9.487,1.948,5.2.043,5.18.037A.5.5,0,0,0,5.121.019a.519.519,0,0,0-.06-.013.744.744,0,0,0-.122,0,.519.519,0,0,0-.06.013.5.5,0,0,0-.059.018L4.8.043l-4.5,2A.5.5,0,0,0,0,2.5v11a.5.5,0,0,0,.7.457L5,12.047l4.3,1.91c.007,0,.015,0,.023,0a.441.441,0,0,0,.378-.008c.008,0,.017,0,.025-.006l4-2A.5.5,0,0,0,14,11.5V.5A.5.5,0,0,0,13.5,0Zm-9,11.175L1,12.731V2.825L4.5,1.27ZM9,12.731,5.5,11.175V1.27L9,2.825Zm4-1.539-3,1.5V2.809l3-1.5v9.882Z"
                          transform="translate(0.001 0)"
                          fill="#84829a"
                        />
                      </g>
                    </g>
                  </g>
                </svg>
              </div>

              <div className="grid w-10 h-10 rounded-full place-items-center bg-[#F5F5F5] cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="11.596"
                  height="11.563"
                  viewBox="0 0 11.596 11.563"
                >
                  <g
                    id="send_2"
                    data-name="send 2"
                    transform="translate(-1.186 -1.219)"
                  >
                    <path
                      id="Vector"
                      d="M11.157.023,4.84,6.364a1.353,1.353,0,0,0-.228-.105L.442,4.848a.583.583,0,0,1,0-1.132L10.79.035A.659.659,0,0,1,11,0a.49.49,0,0,1,.158.023Z"
                      transform="translate(1.186 1.219)"
                      fill="#84829a"
                    />
                    <path
                      id="Vector-2"
                      data-name="Vector"
                      d="M6.341.368,2.66,10.728a.583.583,0,0,1-.583.4.583.583,0,0,1-.583-.408L.105,6.545A1.353,1.353,0,0,0,0,6.318L6.353,0a.583.583,0,0,1-.012.368Z"
                      transform="translate(6.405 1.657)"
                      fill="#84829a"
                    />
                  </g>
                </svg>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 16 16"
                >
                  <g id="Group" transform="translate(-840 -2843)">
                    <g id="Group-2" data-name="Group">
                      <g id="Group-3" data-name="Group">
                        <path
                          id="Vector"
                          d="M15.733-15.467h-1.6v8.8a.267.267,0,0,1-.267.267H10.133V-.267A.267.267,0,0,1,9.867,0H2.933a.267.267,0,0,1-.267-.267v-15.2H.267A.267.267,0,0,1,0-15.733.267.267,0,0,1,.267-16H15.733a.267.267,0,0,1,.267.267A.267.267,0,0,1,15.733-15.467Zm-10.133,0H4.533v2.4A.267.267,0,0,0,4.8-12.8h.533a.267.267,0,0,0,.267-.267Zm1.067,8.8v-8.8H6.133v2.4a.8.8,0,0,1-.8.8H4.8a.8.8,0,0,1-.8-.8v-2.4H3.2V-.533H9.6V-6.4H6.933A.267.267,0,0,1,6.667-6.667Zm6.933-8.8H7.2v8.533h6.4Z"
                          transform="translate(856 2843) rotate(180)"
                          fill="#84829a"
                        />
                        <path
                          id="Vector-2"
                          data-name="Vector"
                          d="M1.867,0H.267A.267.267,0,0,1,0-.267v-1.6a.267.267,0,0,1,.267-.267h1.6a.267.267,0,0,1,.267.267v1.6A.267.267,0,0,1,1.867,0ZM1.6-1.6H.533V-.533H1.6Z"
                          transform="translate(849.333 2846.733) rotate(180)"
                          fill="#84829a"
                        />
                        <path
                          id="Vector-3"
                          data-name="Vector"
                          d="M1.867,0H.267A.267.267,0,0,1,0-.267v-1.6a.267.267,0,0,1,.267-.267h1.6a.267.267,0,0,1,.267.267v1.6A.267.267,0,0,1,1.867,0ZM1.6-1.6H.533V-.533H1.6Z"
                          transform="translate(849.333 2844.067) rotate(180)"
                          fill="#84829a"
                        />
                        <path
                          id="Vector-4"
                          data-name="Vector"
                          d="M1.867,0H.267A.267.267,0,0,1,0-.267v-1.6a.267.267,0,0,1,.267-.267h1.6a.267.267,0,0,1,.267.267v1.6A.267.267,0,0,1,1.867,0ZM1.6-1.6H.533V-.533H1.6Z"
                          transform="translate(852 2846.733) rotate(180)"
                          fill="#84829a"
                        />
                        <path
                          id="Vector-5"
                          data-name="Vector"
                          d="M1.867,0H.267A.267.267,0,0,1,0-.267v-1.6a.267.267,0,0,1,.267-.267h1.6a.267.267,0,0,1,.267.267v1.6A.267.267,0,0,1,1.867,0ZM1.6-1.6H.533V-.533H1.6Z"
                          transform="translate(852 2844.067) rotate(180)"
                          fill="#84829a"
                        />
                        <path
                          id="Vector-6"
                          data-name="Vector"
                          d="M1.867,0H.267A.267.267,0,0,1,0-.267v-1.6a.267.267,0,0,1,.267-.267h1.6a.267.267,0,0,1,.267.267v1.6A.267.267,0,0,1,1.867,0ZM1.6-1.6H.533V-.533H1.6Z"
                          transform="translate(852 2849.4) rotate(180)"
                          fill="#84829a"
                        />
                        <path
                          id="Vector-7"
                          data-name="Vector"
                          d="M1.867,0H.267A.267.267,0,0,1,0-.267v-1.6a.267.267,0,0,1,.267-.267h1.6a.267.267,0,0,1,.267.267v1.6A.267.267,0,0,1,1.867,0ZM1.6-1.6H.533V-.533H1.6Z"
                          transform="translate(852 2852.067) rotate(180)"
                          fill="#84829a"
                        />
                        <path
                          id="Vector-8"
                          data-name="Vector"
                          d="M.267-2.133h1.6a.267.267,0,0,1,.267.267v1.6A.267.267,0,0,1,1.867,0H.267A.267.267,0,0,1,0-.267v-1.6A.267.267,0,0,1,.267-2.133Zm.267,1.6H1.6V-1.6H.533Z"
                          transform="translate(845.333 2853.133) rotate(180)"
                          fill="#84829a"
                        />
                        <path
                          id="Vector-9"
                          data-name="Vector"
                          d="M.267-2.133h1.6a.267.267,0,0,1,.267.267v1.6A.267.267,0,0,1,1.867,0H.267A.267.267,0,0,1,0-.267v-1.6A.267.267,0,0,1,.267-2.133Zm.267,1.6H1.6V-1.6H.533Z"
                          transform="translate(845.333 2850.467) rotate(180)"
                          fill="#84829a"
                        />
                        <path
                          id="Vector-10"
                          data-name="Vector"
                          d="M.267-2.133h1.6a.267.267,0,0,1,.267.267v1.6A.267.267,0,0,1,1.867,0H.267A.267.267,0,0,1,0-.267v-1.6A.267.267,0,0,1,.267-2.133Zm.267,1.6H1.6V-1.6H.533Z"
                          transform="translate(845.333 2855.8) rotate(180)"
                          fill="#84829a"
                        />
                        <path
                          id="Vector-11"
                          data-name="Vector"
                          d="M.267-2.133h1.6a.267.267,0,0,1,.267.267v1.6A.267.267,0,0,1,1.867,0H.267A.267.267,0,0,1,0-.267v-1.6A.267.267,0,0,1,.267-2.133Zm.267,1.6H1.6V-1.6H.533Z"
                          transform="translate(848 2853.133) rotate(180)"
                          fill="#84829a"
                        />
                        <path
                          id="Vector-12"
                          data-name="Vector"
                          d="M.267-2.133h1.6a.267.267,0,0,1,.267.267v1.6A.267.267,0,0,1,1.867,0H.267A.267.267,0,0,1,0-.267v-1.6A.267.267,0,0,1,.267-2.133Zm.267,1.6H1.6V-1.6H.533Z"
                          transform="translate(848 2850.467) rotate(180)"
                          fill="#84829a"
                        />
                        <path
                          id="Vector-13"
                          data-name="Vector"
                          d="M.267-2.133h1.6a.267.267,0,0,1,.267.267v1.6A.267.267,0,0,1,1.867,0H.267A.267.267,0,0,1,0-.267v-1.6A.267.267,0,0,1,.267-2.133Zm.267,1.6H1.6V-1.6H.533Z"
                          transform="translate(848 2855.8) rotate(180)"
                          fill="#84829a"
                        />
                      </g>
                    </g>
                  </g>
                </svg>
                <p className="text-[#64636e]">Rejoignez 10 autres personnes</p>
              </div>
              {/*<div className="relative group">*/}
              {/*    <svg*/}
              {/*        xmlns="http://www.w3.org/2000/svg"*/}
              {/*        width="20"*/}
              {/*        height="18.585"*/}
              {/*        viewBox="0 0 20 18.585"*/}
              {/*    >*/}
              {/*        <g*/}
              {/*            id="heart_6_1"*/}
              {/*            data-name="heart (6) 1"*/}
              {/*            transform="translate(-1140 -2844.708)"*/}
              {/*        >*/}
              {/*            <g id="Group">*/}
              {/*                <g id="Group-2" data-name="Group">*/}
              {/*                    <path*/}
              {/*                        id="Vector"*/}
              {/*                        d="M18.364,1.747a5.465,5.465,0,0,0-8.01,0L10,2.119l-.353-.373A5.469,5.469,0,0,0,1.92,1.462q-.147.137-.284.284a6.134,6.134,0,0,0,0,8.34l7.847,8.275a.715.715,0,0,0,1.01.027l.027-.027,7.844-8.275A6.133,6.133,0,0,0,18.364,1.747ZM17.33,9.1h0L10,16.831,2.673,9.1a4.687,4.687,0,0,1,0-6.372A4.04,4.04,0,0,1,8.382,2.5q.119.11.23.23l.871.919a.736.736,0,0,0,1.038,0l.871-.919A4.04,4.04,0,0,1,17.1,2.5q.119.11.23.23A4.644,4.644,0,0,1,17.33,9.1Z"*/}
              {/*                        transform="translate(1140 2844.708)"*/}
              {/*                        fill="#4152ca"*/}
              {/*                    />*/}
              {/*                </g>*/}
              {/*            </g>*/}
              {/*        </g>*/}
              {/*    </svg>*/}
              {/*    <div*/}
              {/*        className="hidden shadow-lg group-hover:block px-6 py-2 absolute bottom-10 -left-40 md:-left-24 bg-white rounded-md w-[263px] h-[129px]">*/}
              {/*        <div className="flex w-full">*/}
              {/*            <img*/}
              {/*                src="/img2.jpg"*/}
              {/*                className="object-cover w-12 h-12 rounded-full"*/}
              {/*                alt="Image of a minar"*/}
              {/*            />*/}
              {/*            <div className="flex flex-col w-full mx-2">*/}
              {/*                <p className="font-poppins text-sm text-[#64636e]">*/}
              {/*                    Ongoing*/}
              {/*                </p>*/}
              {/*                <p className="text-lg font-poppins">Trip to Rome</p>*/}
              {/*                <p className="mt-2 mb-2 text-sm font-poppins">*/}
              {/*                    <span className="text-[#8A79DF]">40%</span> completed*/}
              {/*                </p>*/}

              {/*                <div className="w-full bg-[#F5F5F5] h-2">*/}
              {/*                    <div className="bg-[#8A79DF] h-2 rounded-full w-[45%]"></div>*/}
              {/*                </div>*/}
              {/*            </div>*/}
              {/*        </div>*/}
              {/*    </div>*/}
              {/*</div>*/}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

