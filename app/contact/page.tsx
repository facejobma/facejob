"use client";

import React, { useState, FormEvent } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Mail, User, MessageSquare, Send, CheckCircle } from "lucide-react";
import { apiRequest, handleApiError } from "@/lib/apiUtils";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  message?: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateField = (field: keyof FormData, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return "Le nom est obligatoire.";
        if (value.trim().length < 2) return "Le nom doit contenir au moins 2 caractères.";
        if (value.length > 255) return "Le nom ne peut pas dépasser 255 caractères.";
        break;
      
      case 'email':
        if (!value.trim()) return "L'adresse email est obligatoire.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "L'adresse email doit être valide.";
        if (value.length > 255) return "L'adresse email ne peut pas dépasser 255 caractères.";
        break;
      
      case 'message':
        if (!value.trim()) return "Le message est obligatoire.";
        if (value.trim().length < 10) return "Le message doit contenir au moins 10 caractères.";
        if (value.length > 2000) return "Le message ne peut pas dépasser 2000 caractères.";
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof FormData>).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiRequest(
        (typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL) + "/api/v1/contact",
        {
          method: "POST",
          body: JSON.stringify(formData),
        }
      );

      if (result.success) {
        toast.success("Votre message a été envoyé avec succès !");
        setFormData({ name: "", email: "", message: "" });
        setIsSubmitted(true);
        
        // Reset success state after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        // Handle backend validation errors
        if ((result.error === 'validation' || result.errors) && (result.errors || result.details)) {
          const backendErrors: ValidationErrors = {};
          const apiErrors = result.errors || result.details || {};
          Object.keys(apiErrors).forEach(field => {
            if (apiErrors?.[field] && apiErrors[field].length > 0) {
              backendErrors[field as keyof FormData] = apiErrors[field][0];
            }
          });
          setValidationErrors(backendErrors);
          toast.error("Veuillez corriger les erreurs dans le formulaire.");
        } else {
          handleApiError(result, toast);
        }
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Une erreur inattendue s'est produite. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const getCharacterCount = (field: keyof FormData) => {
    const value = formData[field];
    const maxLength = field === 'message' ? 2000 : 255;
    return `${value.length}/${maxLength}`;
  };

  const getCharacterCountColor = (field: keyof FormData) => {
    const value = formData[field];
    const maxLength = field === 'message' ? 2000 : 255;
    const percentage = (value.length / maxLength) * 100;
    
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 75) return "text-yellow-500";
    return "text-gray-400";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-emerald-50/50 to-white pb-14 pt-20">
        {/* Background decorations */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Support & Contact</span>
            </div>

            <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Contactez-nous
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Nous aimerions avoir de vos nouvelles ! Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          {/* Left Side - Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)] sm:p-8 lg:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold text-emerald-700">Écrivez-nous</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Parlez-nous de votre demande</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Les champs marqués d’un astérisque sont obligatoires.</p>
            </div>

            {/* Success Message */}
            {isSubmitted && (
              <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl flex items-center shadow-sm">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
                <p className="font-body text-green-700 font-medium">
                  Message envoyé avec succès ! Nous vous répondrons bientôt.
                </p>
              </div>
            )}

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-secondary mb-2 font-body">
                  Nom complet *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    className={`block w-full rounded-xl border py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
                      validationErrors.name 
                        ? "border-red-300 bg-red-50" 
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    placeholder="Votre nom complet"
                    disabled={isLoading}
                    maxLength={255}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  {validationErrors.name && (
                    <p className="text-sm text-red-600 font-body">{validationErrors.name}</p>
                  )}
                  <p className={`text-xs ml-auto font-body ${getCharacterCountColor('name')}`}>
                    {getCharacterCount('name')}
                  </p>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-secondary mb-2 font-body">
                  Adresse email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className={`block w-full rounded-xl border py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
                      validationErrors.email 
                        ? "border-red-300 bg-red-50" 
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    placeholder="votre@email.com"
                    disabled={isLoading}
                    maxLength={255}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  {validationErrors.email && (
                    <p className="text-sm text-red-600 font-body">{validationErrors.email}</p>
                  )}
                  <p className={`text-xs ml-auto font-body ${getCharacterCountColor('email')}`}>
                    {getCharacterCount('email')}
                  </p>
                </div>
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-secondary mb-2 font-body">
                  Message *
                </label>
                <div className="relative">
                  <textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => updateFormData("message", e.target.value)}
                    className={`block w-full resize-none rounded-xl border px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
                      validationErrors.message 
                        ? "border-red-300 bg-red-50" 
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    placeholder="Décrivez votre demande ou votre question en détail..."
                    disabled={isLoading}
                    maxLength={2000}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  {validationErrors.message && (
                    <p className="text-sm text-red-600 font-body">{validationErrors.message}</p>
                  )}
                  <p className={`text-xs ml-auto font-body ${getCharacterCountColor('message')}`}>
                    {getCharacterCount('message')}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group flex w-full items-center justify-center rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                    Envoyer le message
                  </div>
                )}
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t-2 border-gray-100">
              <p className="text-sm font-body text-gray-600 text-center">
                Vous pouvez également nous contacter directement à{" "}
                <a 
                  href="mailto:contact@facejob.ma" 
                  className="text-primary hover:text-primary-1 font-semibold transition-colors"
                >
                  contact@facejob.ma
                </a>
              </p>
            </div>
          </div>

          {/* Right Side - Image and Info */}
          <aside>
            <div className="relative h-full min-h-[520px] overflow-hidden rounded-2xl border border-slate-200 shadow-[0_10px_35px_rgba(15,23,42,0.08)]">
              <Image
                src="/img1.jpg"
                alt="Contact FaceJob"
                className="absolute inset-0 h-full w-full object-cover"
                width={600}
                height={800}
                priority
              />
              
              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end">
                <div className="p-8 text-white">
                  <h2 className="font-heading text-3xl font-bold mb-4">
                    Nous sommes là pour vous aider
                  </h2>
                  <p className="font-body text-lg opacity-90 mb-6">
                    Notre équipe est dédiée à vous offrir la meilleure expérience possible sur FaceJob.
                  </p>
                  
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                        <Mail className="w-5 h-5" />
                      </div>
                      <span className="font-body">contact@facejob.ma</span>
                    </div>
                    <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <span className="font-body">Réponse sous 24h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ContactPage;
