"use client";

import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Building, Mail, CheckCircle, Clock, Users, Briefcase, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";

export default function EntrepriseBientotPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/entreprise-waitlist/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          email: email,
          source: 'coming_soon_page'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
        toast.success(data.data?.message || "Merci ! Nous vous contacterons bientôt.");
        setEmail("");
      } else {
        if (data.data?.already_subscribed) {
          toast.info("Vous êtes déjà inscrit sur la liste d'attente");
          setIsSubmitted(true);
          setEmail("");
        } else {
          toast.error(data.message || "Une erreur est survenue");
        }
      }
    } catch (error) {
      console.error('Waitlist subscription error:', error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-optional1 flex flex-col">
      <NavBar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-white via-optional1 to-green-50/30 pt-20 pb-16 overflow-hidden flex-1 flex items-center">
        {/* Background decorations */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-primary/20 to-green-400/20 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto">
            
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-green-400/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-primary/10 to-green-100/50 border-2 border-primary/20 rounded-2xl flex items-center justify-center shadow-xl">
                  <Building className="w-12 h-12 text-primary" />
                </div>
              </div>
            </div>

            {/* Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-green-100/50 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 shadow-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Bientôt disponible</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-secondary mb-6 leading-tight tracking-tight text-center">
              Espace Entreprise
              <br />
              <span className="relative inline-block mt-2">
                <span className="bg-gradient-to-r from-primary via-green-600 to-primary-1 bg-clip-text text-transparent">
                  Arrive Bientôt
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 10C50 2 150 2 198 10" stroke="#60894B" strokeWidth="3" strokeLinecap="round" opacity="0.3"/>
                </svg>
              </span>
            </h1>

            <p className="font-body text-lg md:text-xl text-gray-600 leading-relaxed text-center mb-12 max-w-2xl mx-auto">
              Nous travaillons activement sur l'espace entreprise pour vous offrir la meilleure expérience de recrutement avec les CV vidéo.
            </p>

            {/* Features and Form in Row */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              
              {/* Features Preview */}
              <div className="space-y-4">
                {[
                  {
                    icon: Users,
                    title: "Accès aux talents",
                    description: "Découvrez des candidats qualifiés avec leurs CV vidéo"
                  },
                  {
                    icon: Briefcase,
                    title: "Gestion des offres",
                    description: "Publiez et gérez vos offres d'emploi facilement"
                  },
                  {
                    icon: TrendingUp,
                    title: "Statistiques",
                    description: "Suivez les performances de vos recrutements"
                  }
                ].map((feature, index) => (
                  <div key={index} className="bg-white rounded-xl border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 p-5 flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-green-100/50 border-2 border-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-base font-bold text-secondary mb-1">{feature.title}</h3>
                      <p className="font-body text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Email Form */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-xl p-8 flex flex-col justify-center">
                <h2 className="font-heading text-2xl font-bold text-secondary mb-3 text-center">
                  Soyez informé du lancement
                </h2>
                <p className="font-body text-gray-600 mb-6 text-center">
                  Inscrivez-vous pour être parmi les premiers à accéder à l'espace entreprise
                </p>

                {isSubmitted ? (
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
                    <p className="font-body text-green-700 font-medium">
                      Merci ! Nous vous contacterons dès le lancement.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="font-body block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:border-gray-300"
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group w-full flex items-center justify-center py-4 px-6 bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white font-accent font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Envoi en cours...
                        </div>
                      ) : (
                        <>
                          M'informer du lancement
                          <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

            </div>

            {/* Contact CTA */}
            <div className="mt-12 text-center">
              <p className="font-body text-gray-600 mb-4">
                Vous avez des questions ? Notre équipe est là pour vous aider.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-1 font-accent font-semibold transition-colors"
              >
                Contactez-nous
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
