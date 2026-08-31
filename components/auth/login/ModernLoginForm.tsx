"use client";

import { FormEvent, useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, User, Building2, X, AlertCircle } from "lucide-react";
import google from "@/public/svg/google.svg";
import linkedin from "@/public/svg/linkedin.svg";
import { secureLogin } from "@/lib/auth";

interface ModernLoginFormProps {
  loginFor: "candidate" | "entreprise";
  returnUrl?: string | null;
}

type LoginFieldErrors = {
  email?: string;
  password?: string;
  general?: string;
};

const ModernLoginForm = ({ loginFor, returnUrl }: ModernLoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<LoginFieldErrors>({});
  const [verificationModal, setVerificationModal] = useState({
    isOpen: false,
    message: "",
  });

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
    const emailValue = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nextErrors: LoginFieldErrors = {};

    if (!emailValue) {
      nextErrors.email = "Veuillez entrer votre adresse email.";
    } else if (!emailRegex.test(emailValue)) {
      nextErrors.email = "Veuillez entrer une adresse email valide, par exemple nom@email.com.";
    }

    if (!password) {
      nextErrors.password = "Veuillez entrer votre mot de passe.";
    }

    setErrors(nextErrors);
    return !nextErrors.email && !nextErrors.password;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;

    setErrors({});
    setIsLoading(true);
    try {
      const result = await secureLogin(email, password, loginFor, returnUrl);
      
      if (result.success) {
        toast.success("Connecté avec succès");
      } else {
        // Handle different error types with appropriate messages
        // Use the error message from the backend (result.error) which already contains the proper message
        switch (result.errorType) {
          case 'verification':
            setVerificationModal({
              isOpen: true,
              message: result.error || "Votre adresse email doit etre verifiee avant de vous connecter.",
            });
            break;
          default:
            // For all other errors, just show the backend message
            setErrors({
              general: result.error || "Impossible de vous connecter. Verifiez votre email et votre mot de passe.",
            });
            toast.error(result.error || "Une erreur s'est produite lors de la connexion");
        }
      }
    } catch (error: any) {
      console.error('Unexpected login error:', error);
      setErrors({ general: "Une erreur inattendue s'est produite. Veuillez reessayer." });
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setErrors((prev) => ({ ...prev, email: undefined, general: undefined }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrors((prev) => ({ ...prev, password: undefined, general: undefined }));
  };

  const handleGoogleLogin = async () => {
    try {
      // Store returnUrl from URL params or props before OAuth redirect
      if (typeof window !== 'undefined') {
        if (returnUrl) {
          sessionStorage.setItem('oauthReturnUrl', returnUrl);
          console.log('🔐 Stored returnUrl for OAuth:', returnUrl);
        } else {
          // Also check URL params as fallback
          const urlParams = new URLSearchParams(window.location.search);
          const urlReturnUrl = urlParams.get('returnUrl');
          if (urlReturnUrl) {
            sessionStorage.setItem('oauthReturnUrl', urlReturnUrl);
            console.log('🔐 Stored returnUrl from URL for OAuth:', urlReturnUrl);
          }
        }
      }

      const endpoint = loginFor === "candidate" 
        ? "/api/v1/auth/candidate/google" 
        : "/api/v1/auth/entreprise/google";
        
      const response = await fetch((typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL) + endpoint, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

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
      // Store returnUrl from URL params or props before OAuth redirect
      if (typeof window !== 'undefined') {
        if (returnUrl) {
          sessionStorage.setItem('oauthReturnUrl', returnUrl);
          console.log('ðŸ” Stored returnUrl for OAuth:', returnUrl);
        } else {
          // Also check URL params as fallback
          const urlParams = new URLSearchParams(window.location.search);
          const urlReturnUrl = urlParams.get('returnUrl');
          if (urlReturnUrl) {
            sessionStorage.setItem('oauthReturnUrl', urlReturnUrl);
            console.log('ðŸ” Stored returnUrl from URL for OAuth:', urlReturnUrl);
          }
        }
      }

      const endpoint = loginFor === "candidate" 
        ? "/api/v1/auth/candidate/linkedin" 
        : "/api/v1/auth/entreprise/linkedin";
        
      const response = await fetch((typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL) + endpoint, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

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
  const getInputClassName = (field: "email" | "password") =>
    `block w-full py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
      errors[field]
        ? "border-red-500 bg-red-50 focus:ring-red-500"
        : `border-gray-300 ${currentTheme.focusRing}`
    }`;

  return (
    <>
      {verificationModal.isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="verification-modal-title"
        >
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setVerificationModal({ isOpen: false, message: "" })}
              className="absolute right-3 top-3 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <AlertCircle className="h-6 w-6" />
            </div>

            <h2 id="verification-modal-title" className="mb-2 text-xl font-bold text-secondary">
              Compte non activé
            </h2>
            <p className="mb-5 text-sm leading-6 text-gray-600">
              {verificationModal.message}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setVerificationModal({ isOpen: false, message: "" })}
                className="inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Fermer
              </button>
              {loginFor === "candidate" && (
                <Link
                  href="/auth/resend-verification"
                  className="inline-flex justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-1"
                >
                  Renvoyer l'email
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-md">
      {/* Header */}
      <div className="mb-7 text-left">
        <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${currentTheme.iconBg}`}>
          {loginFor === "candidate" ? (
            <User className={`h-5 w-5 ${currentTheme.iconColor}`} />
          ) : (
            <Building2 className={`h-5 w-5 ${currentTheme.iconColor}`} />
          )}
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-950">
          {loginFor === "candidate" ? "Espace Candidat" : "Espace Entreprise"}
        </h1>
        <p className="text-sm leading-6 text-slate-500">
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
          className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Image src={google} alt="Google" className="w-5 h-5 mr-3" />
          Continuer avec Google
        </button>
        
        <button
          type="button"
          onClick={handleLinkedinLogin}
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
        {errors.general && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errors.general}
          </div>
        )}

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
              onChange={(e) => handleEmailChange(e.target.value)}
              className={`${getInputClassName("email")} pl-10 pr-3`}
              placeholder="votre@email.com"
              disabled={isLoading}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="mt-1.5 text-sm font-medium text-red-600">
              {errors.email}
            </p>
          )}
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
              onChange={(e) => handlePasswordChange(e.target.value)}
              className={`${getInputClassName("password")} pl-10 pr-10`}
              placeholder="••••••••"
              disabled={isLoading}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
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
          {errors.password && (
            <p id="password-error" className="mt-1.5 text-sm font-medium text-red-600">
              {errors.password}
            </p>
          )}
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
    </>
  );
};

export default ModernLoginForm;
