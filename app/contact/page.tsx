"use client";

import React, { useState, FormEvent } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Mail, User, MessageSquare, Send, CheckCircle } from "lucide-react";
import { apiRequest, handleApiError } from "@/lib/apiUtils";
import NavBar from "@/components/NavBar";

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
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/contact",
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
        if (result.error === 'validation' && result.details) {
          const backendErrors: ValidationErrors = {};
          Object.keys(result.details).forEach(field => {
            if (result.details?.[field] && result.details[field].length > 0) {
              backendErrors[field as keyof FormData] = result.details[field][0];
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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <NavBar />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
          {/* Left Side - Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-secondary mb-2">
                Contactez-nous
              </h1>
              <p className="text-third text-lg">
                Nous aimerions avoir de vos nouvelles ! Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
              </p>
            </div>

            {/* Success Message */}
            {isSubmitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <p className="text-green-700 font-medium">
                  Message envoyé avec succès ! Nous vous répondrons bientôt.
                </p>
              </div>
            )}

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-secondary mb-2">
                  Nom complet *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                      validationErrors.name 
                        ? "border-red-300 bg-red-50" 
                        : "border-gray-300"
                    }`}
                    placeholder="Votre nom complet"
                    disabled={isLoading}
                    maxLength={255}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  {validationErrors.name && (
                    <p className="text-sm text-red-600">{validationErrors.name}</p>
                  )}
                  <p className={`text-xs ml-auto ${getCharacterCountColor('name')}`}>
                    {getCharacterCount('name')}
                  </p>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                  Adresse email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                      validationErrors.email 
                        ? "border-red-300 bg-red-50" 
                        : "border-gray-300"
                    }`}
                    placeholder="votre@email.com"
                    disabled={isLoading}
                    maxLength={255}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  {validationErrors.email && (
                    <p className="text-sm text-red-600">{validationErrors.email}</p>
                  )}
                  <p className={`text-xs ml-auto ${getCharacterCountColor('email')}`}>
                    {getCharacterCount('email')}
                  </p>
                </div>
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-secondary mb-2">
                  Message *
                </label>
                <div className="relative">
                  <textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => updateFormData("message", e.target.value)}
                    className={`block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none ${
                      validationErrors.message 
                        ? "border-red-300 bg-red-50" 
                        : "border-gray-300"
                    }`}
                    placeholder="Décrivez votre demande ou votre question en détail..."
                    disabled={isLoading}
                    maxLength={2000}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  {validationErrors.message && (
                    <p className="text-sm text-red-600">{validationErrors.message}</p>
                  )}
                  <p className={`text-xs ml-auto ${getCharacterCountColor('message')}`}>
                    {getCharacterCount('message')}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le message
                  </div>
                )}
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-third text-center">
                Vous pouvez également nous contacter directement à{" "}
                <a 
                  href="mailto:contact@facejob.ma" 
                  className="text-primary hover:text-primary-1 font-medium"
                >
                  contact@facejob.ma
                </a>
              </p>
            </div>
          </div>

          {/* Right Side - Image and Info */}
          <div className="mt-12 lg:mt-0">
            <div className="relative">
              <Image
                src="/img1.jpg"
                alt="Contact FaceJob"
                className="w-full h-96 lg:h-full object-cover rounded-2xl shadow-lg"
                width={600}
                height={800}
                priority
              />
              
              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl flex items-end">
                <div className="p-8 text-white">
                  <h2 className="text-2xl font-bold mb-4">
                    Nous sommes là pour vous aider
                  </h2>
                  <p className="text-lg opacity-90 mb-6">
                    Notre équipe est dédiée à vous offrir la meilleure expérience possible sur FaceJob.
                  </p>
                  
                  {/* Contact Info */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 mr-3" />
                      <span>contact@facejob.ma</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-3" />
                      <span>Réponse sous 24h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;