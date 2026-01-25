import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaUserPlus, FaVideo } from "react-icons/fa";
import { MdOutlineWork } from "react-icons/md";
import { useEffect, useState } from 'react';
import { authenticatedApiCall } from '@/lib/api';


type Props = {};


export default function HowWorks({}: Props) {
  const [offre, setOffre] = useState({
    titre: "",
    contractType: "",
    location: "",
  });
  const [randomImage, setRandomImage] = useState("");

  useEffect(() => {
    const fetchRandomOffre = async () => {
      try {
        const response = await authenticatedApiCall('/api/v1/random');
        if (response.ok) {
          const data = await response.json();
          console.log("data", data);
          setOffre(data);
        } else {
          console.error("Error fetching random offer:", response.status);
          // Set fallback data if API fails
          setOffre({
            titre: "Un emploi de développeur Web",
            contractType: "CDI", 
            location: "Tanger"
          });
        }
      } catch (error) {
        console.error("Error fetching the random offer:", error);
        // Set fallback data if API fails
        setOffre({
          titre: "Un emploi de développeur Web",
          contractType: "CDI",
          location: "Tanger"
        });
      }
    };

    fetchRandomOffre();
    // Array of image paths
    const images = [
      "/LandingImages/Image 1.jpg",
      "/LandingImages/Image 2.jpg",
      "/LandingImages/Image 3.jpg",
      "/LandingImages/Image 4.jpg",
      "/LandingImages/Image 5.jpg",
      "/LandingImages/Image 6.jpg",
    ];

    // Select a random image
    const randomIndex = Math.floor(Math.random() * images.length);
    setRandomImage(images[randomIndex]);
  }, []);

  return (
    <section className="container mx-auto px-6 py-16 mt-32 mb-16 font-default">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <p className="text-primary font-semibold text-lg mb-4">Facile et rapide</p>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Comment créer votre CV vidéo en 3 étapes simples
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Rejoignez les 783+ candidats qui ont déjà trouvé leur emploi de rêve grâce à FaceJob
        </p>
      </div>

      <div className="relative flex flex-col gap-20 my-24 lg:flex-row lg:gap-36 lg:justify-between max-w-6xl mx-auto">
        <motion.div
          initial={{ x: -100 }}
          transition={{ duration: 1 }}
          whileInView={{ x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col gap-12 lg:w-1/2"
        >
          <div className="flex items-start gap-6 max-w-md">
            <div className="grid p-4 rounded-xl w-16 h-16 bg-primary-3 place-items-center flex-shrink-0">
              <FaUserPlus color={"#fff"} size={24} />
            </div>
            <div className="flex flex-col text-[#5E6282] font-poppins">
              <h3 className="text-xl font-bold mb-2 text-secondary">1. Créez votre compte candidat</h3>
              <p className="text-base leading-relaxed">
                Inscrivez-vous gratuitement en 2 minutes. Renseignez vos informations 
                professionnelles et personnelles pour créer votre profil.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-6 max-w-md">
            <div className="grid p-4 rounded-xl w-16 h-16 bg-primary-2 place-items-center flex-shrink-0">
              <FaVideo color={"#fff"} size={24} />
            </div>
            <div className="flex flex-col text-[#5E6282] font-poppins">
              <h3 className="text-xl font-bold mb-2 text-secondary">2. Enregistrez votre CV vidéo</h3>
              <p className="text-base leading-relaxed">
                Présentez-vous en 2 minutes maximum. Parlez de votre parcours, 
                vos compétences et votre motivation avec authenticité.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-6 max-w-md">
            <div className="grid p-4 rounded-xl w-16 h-16 bg-primary-1 place-items-center flex-shrink-0">
              <MdOutlineWork color={"#fff"} size={24} />
            </div>
            <div className="flex flex-col text-[#5E6282] font-poppins">
              <h3 className="text-xl font-bold mb-2 text-secondary">3. Trouvez votre emploi idéal</h3>
              <p className="text-base leading-relaxed">
                Postulez aux offres qui vous intéressent ou laissez les recruteurs 
                vous découvrir grâce à votre profil vidéo unique.
              </p>
            </div>
          </div>
        </motion.div>
        <div className="absolute -right-28 bottom-32 lg:-top-44 lg:-right-32 opacity-10">
          <Image
            src="/images/blue-circle.png"
            className="z-0 w-96 h-96"
            role="presentation"
            width={384}
            height={384}
            alt=""
          />
        </div>
        
        <motion.div
          initial={{ x: 100 }}
          transition={{ duration: 1 }}
          whileInView={{ x: 0 }}
          viewport={{ once: true }}
          className="z-20 bg-white shadow-2xl rounded-2xl overflow-hidden lg:w-1/2 max-w-md mx-auto lg:mx-0"
        >
          <div className="p-6">
            {randomImage && (
              <div className="relative mb-4 rounded-lg overflow-hidden">
                <Image
                  src={randomImage}
                  className="w-full h-48 object-cover"
                  alt="Exemple d'offre d'emploi sur FaceJob"
                  width={400}
                  height={200}
                />
              </div>
            )}
            
            <h4 className="text-lg font-semibold text-secondary mb-3 line-clamp-2">
              {offre.titre || 'Développeur Web Full Stack'}
            </h4>
            
            <div className="flex items-center text-gray-600 text-sm mb-4 flex-wrap gap-2">
              <span className="bg-primary-light px-2 py-1 rounded text-primary font-medium">
                {offre.contractType || 'CDI'}
              </span>
              <span>•</span>
              <span>FaceJob</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {offre.location || 'Casablanca'}
              </span>
            </div>
            
            <div className="flex gap-3 mb-6">
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors" aria-label="Sauvegarder l'offre">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </button>
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors" aria-label="Localiser l'entreprise">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors" aria-label="Partager l'offre">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">783+ candidats recrutés</span>
              </div>
              <Link 
                href="/offres" 
                className="text-primary font-semibold hover:text-primary-1 transition-colors text-sm"
              >
                Voir plus →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

