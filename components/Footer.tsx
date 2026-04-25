import React from "react";
import Link from "next/link";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaEnvelope,
  FaPhone,
  FaGlobe,
} from "react-icons/fa";
import Image from "next/image";

type Props = {};

export default function Footer({}: Props) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-br from-optional1 to-gray-50 mt-0">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 md:px-12 lg:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/facejobLogo.png"
                alt="FaceJob - Plateforme de recrutement avec CV vidéo"
                width={120}
                height={120}
                className="hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <p className="text-gray-700 text-sm leading-relaxed mb-6 font-poppins">
              La première plateforme de recrutement avec CV vidéo au Maroc. 
              Connectez talents et opportunités de manière innovante.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a 
                href="https://www.facejob.ma" 
                className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaGlobe className="text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-poppins">www.facejob.ma</span>
              </a>
              <a 
                href="tel:+212808588918" 
                className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors group"
              >
                <FaPhone className="text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-poppins">+212 8 08588918</span>
              </a>
              <a 
                href="mailto:contact@facejob.ma" 
                className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors group"
              >
                <FaEnvelope className="text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-poppins">contact@facejob.ma</span>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-secondary text-lg mb-6 font-default">
              Entreprise
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/apropsdenous" 
                  className="text-gray-600 hover:text-primary transition-colors text-sm font-poppins hover:translate-x-1 inline-block duration-200"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-600 hover:text-primary transition-colors text-sm font-poppins hover:translate-x-1 inline-block duration-200"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  href="/faq" 
                  className="text-gray-600 hover:text-primary transition-colors text-sm font-poppins hover:translate-x-1 inline-block duration-200"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-bold text-secondary text-lg mb-6 font-default">
              Conditions & Confidentialité
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/termes/entreprise" 
                  className="text-gray-600 hover:text-primary transition-colors text-sm font-poppins hover:translate-x-1 inline-block duration-200"
                >
                  CGU Partenaires
                </Link>
              </li>
              <li>
                <Link 
                  href="/termes/candidats" 
                  className="text-gray-600 hover:text-primary transition-colors text-sm font-poppins hover:translate-x-1 inline-block duration-200"
                >
                  CGU Candidats
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-bold text-secondary text-lg mb-6 font-default">
              Ressources
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/blogs" 
                  className="text-gray-600 hover:text-primary transition-colors text-sm font-poppins hover:translate-x-1 inline-block duration-200"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="/offres" 
                  className="text-gray-600 hover:text-primary transition-colors text-sm font-poppins hover:translate-x-1 inline-block duration-200"
                >
                  Offres d'emploi
                </Link>
              </li>
            </ul>

            {/* Social Media */}
            <div className="mt-8">
              <h5 className="font-semibold text-secondary text-sm mb-4 font-default">
                Suivez-nous
              </h5>
              <div className="flex gap-3">
                <Link
                  href="https://www.facebook.com/people/facejob/100085933744117/"
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-white hover:bg-[#1877F2] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1"
                  aria-label="Suivez FaceJob sur Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaFacebook size={18} />
                </Link>
                <Link
                  href="https://www.instagram.com/facejob.ma/"
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-white hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1"
                  aria-label="Suivez FaceJob sur Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram size={18} />
                </Link>
                <Link
                  href="https://www.linkedin.com/company/facejob-ma/"
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-white hover:bg-[#0A66C2] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1"
                  aria-label="Suivez FaceJob sur LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedinIn size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-white/50">
        <div className="container mx-auto px-6 md:px-12 lg:px-20 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 font-poppins text-center md:text-left">
              © {currentYear} FaceJob.ma - Tous droits réservés
            </p>
            <p className="text-xs text-gray-500 font-poppins text-center md:text-right">
              Propulsé par l'innovation marocaine 🇲🇦
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
