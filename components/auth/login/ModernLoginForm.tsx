"use client";

import { FormEvent, useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, User, Building2 } from "lucide-react";
import google from "@/public/svg/google.svg";
import linkedin from "@/public/svg/linkedin.svg";
import { secureLogin } from "@/lib/auth";

interface ModernLoginFormProps {
  loginFor: "candidate" | "entreprise";
}

const ModernLoginForm = ({ loginFor }: ModernLoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value: string) => {
    if (!value) {
      toast.error("Veuillez entrer une adresse email.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      toast.error("L'adresse mail est invalide.");
      return false;
    }
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) {
      toast.error("Veuillez entrer votre mot de passe.");
      return false;
    }
    if (value.length < 8) {
      toast.error("Le mot de passe doit comporter au moins 8 caractères.");
      return false;
    }
    return true;
  };

  const validateFields = () => {
    let isValid = true;
    if (!validateEmail(email)) isValid = false;
    if (!validatePassword(password)) isValid = false;
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;

    setIsLoading(true);
    try {
      const result = await secureLogin(email, password, loginFor);
      
      if (result.success) {
        toast.success("Connecté avec succès");
      } else {
        // Handle different error types with appropriate messages
        switch (result.errorType) {
          case 'credentials':
            toast.error("Email ou mot de passe incorrect");
            break;
          case 'verification':
            toast.error("Votre adresse e-mail doit être vérifiée avant de vous connecter");
            break;
          case 'validation':
            toast.error(result.error || "Données de connexion invalides");
            break;
          case 'network':
            toast.error("Erreur de connexion, vérifiez votre connexion internet");
            break;
          case 'server':
            toast.error("Erreur du serveur, veuillez réessayer plus tard");
            break;
          default:
            toast.error(result.error || "Une erreur s'est produite lors de la connexion");
        }
      }
    } catch (error: any) {
      console.error('Unexpected login error:', error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const endpoint = loginFor === "candidate" 
        ? "/api/v1/auth/candidate/google" 
        : "/api/v1/auth/entreprise/google";
        
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + endpoint);

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Erreur lors de la connexion avec Google");
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error("Erreur de connexion, vérifiez votre connexion internet");
    }
  };

  const handleLinkedinLogin = async () => {
    try {
      const endpoint = loginFor === "candidate" 
        ? "/api/v1/auth/candidate/linkedin" 
        : "/api/v1/auth/entreprise/linkedin";
        
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + endpoint);

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Erreur lors de la connexion avec LinkedIn");
      }
    } catch (error: any) {
      console.error("LinkedIn login error:", error);
      toast.error("Erreur de connexion, vérifiez votre connexion internet");
    }
  };

  const themeClasses = {
    candidate: {
      iconBg: "bg-green-100",
      iconColor: "text-primary",
      focusRing: "focus:ring-primary",
      buttonBg: "bg-primary hover:bg-primary-1",
      buttonFocus: "focus:ring-primary",
      linkColor: "text-primary hover:text-primary-1"
    },
    enterprise: {
      iconBg: "bg-green-100", 
      iconColor: "text-primary",
      focusRing: "focus:ring-primary",
      buttonBg: "bg-primary hover:bg-primary-1",
      buttonFocus: "focus:ring-primary",
      linkColor: "text-primary hover:text-primary-1"
    }
  };

  const currentTheme = loginFor === "candidate" ? themeClasses.candidate : themeClasses.enterprise;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${currentTheme.iconBg}`}>
          {loginFor === "candidate" ? (
            <User className={`w-8 h-8 ${currentTheme.iconColor}`} />
          ) : (
            <Building2 className={`w-8 h-8 ${currentTheme.iconColor}`} />
          )}
        </div>
        <h1 className="text-2xl font-bold text-secondary mb-2">
          {loginFor === "candidate" ? "Espace Candidat" : "Espace Entreprise"}
        </h1>
        <p className="text-third">
          {loginFor === "candidate" 
            ? "Connectez-vous pour accéder à votre tableau de bord" 
            : "Gérez vos offres d'emploi et candidatures"
          }
        </p>
      </div>

      {/* Social Login Buttons */}
      <div className="space-y-3 mb-4">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-secondary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Image src={google} alt="Google" className="w-5 h-5 mr-3" />
          Continuer avec Google
        </button>
        
        <button
          type="button"
          onClick={handleLinkedinLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-secondary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Image src={linkedin} alt="LinkedIn" className="w-5 h-5 mr-3" />
          Continuer avec LinkedIn
        </button>
      </div>

      {/* Divider */}
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-third">Ou continuez avec votre email</span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1">
            Adresse email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${currentTheme.focusRing} focus:border-transparent transition-colors`}
              placeholder="votre@email.com"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-secondary mb-1">
            Mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${currentTheme.focusRing} focus:border-transparent transition-colors`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <Link
            href={`/auth/${loginFor}/forget-password`}
            className={`text-sm ${currentTheme.linkColor} font-medium`}
          >
            Mot de passe oublié ?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${currentTheme.buttonBg} ${currentTheme.buttonFocus}`}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Connexion...
            </div>
          ) : (
            "Se connecter"
          )}
        </button>
      </form>

      {/* Sign Up Link */}
      <div className="mt-4 text-center">
        <p className="text-sm text-third">
          Pas encore de compte ?{" "}
          <Link
            href={`/auth/signup-${loginFor}`}
            className={`font-medium hover:underline ${currentTheme.linkColor}`}
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ModernLoginForm;