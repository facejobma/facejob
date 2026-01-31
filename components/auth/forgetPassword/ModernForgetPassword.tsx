"use client";

import { FC, FormEvent, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Mail, ArrowLeft } from "lucide-react";

interface ModernForgetPasswordProps {
  actor: string;
}

const ModernForgetPassword: FC<ModernForgetPasswordProps> = ({ actor }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      toast.error("Veuillez entrer une adresse email.");
      return false;
    }
    if (!emailRegex.test(value)) {
      toast.error("Veuillez entrer une adresse email valide.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, actor }),
        }
      );

      if (response.ok) {
        toast.success("Le lien de réinitialisation a été envoyé avec succès !");
        setEmailSent(true);
        // Don't redirect - keep user on the same page
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 404) {
          toast.error("Aucun compte trouvé avec cette adresse email");
        } else if (response.status === 422) {
          toast.error(errorData.message || "Adresse email invalide");
        } else if (response.status >= 500) {
          toast.error("Erreur du serveur, veuillez réessayer plus tard");
        } else {
          toast.error(errorData.message || "Erreur lors de l'envoi du lien");
        }
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Erreur de connexion, vérifiez votre connexion internet");
    } finally {
      setIsLoading(false);
    }
  };

  const actorDisplayName = actor === "candidat" ? "candidat" : "entreprise";
  const themeClasses = {
    iconBg: "bg-green-100",
    iconColor: "text-primary",
    focusRing: "focus:ring-primary",
    buttonBg: "bg-primary hover:bg-primary-1",
    buttonFocus: "focus:ring-primary",
    linkColor: "text-primary hover:text-primary-1"
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href={`/auth/login-${actor === 'candidat' ? 'candidate' : 'enterprise'}`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la connexion
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-16 h-16 ${themeClasses.iconBg} rounded-full mb-4`}>
          <Mail className={`w-8 h-8 ${themeClasses.iconColor}`} />
        </div>
        <h1 className="text-2xl font-bold text-secondary mb-2">
          {emailSent ? "Email envoyé !" : "Mot de passe oublié ?"}
        </h1>
        <p className="text-third">
          {emailSent 
            ? "Vérifiez votre boîte email et suivez les instructions pour réinitialiser votre mot de passe"
            : "Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe"
          }
        </p>
      </div>

      {emailSent ? (
        /* Success State */
        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Lien de réinitialisation envoyé à :
                </p>
                <p className="text-sm text-green-700 font-mono">
                  {email}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Vous n'avez pas reçu l'email ? Vérifiez votre dossier spam ou cliquez ci-dessous pour renvoyer.
            </p>
            
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
              className="text-sm font-medium text-primary hover:text-primary-1 hover:underline"
            >
              Renvoyer le lien
            </button>
          </div>
        </div>
      ) : (
        /* Form State */
        <>
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${themeClasses.focusRing} focus:border-transparent transition-colors`}
                  placeholder={`votre@email${actor === "entreprise" ? "-entreprise" : ""}.com`}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${themeClasses.buttonBg} focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeClasses.buttonFocus} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Envoi en cours...
                </div>
              ) : (
                "Envoyer le lien de réinitialisation"
              )}
            </button>
          </form>
        </>
      )}

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-third">
          Vous vous souvenez de votre mot de passe ?{" "}
          <Link
            href={`/auth/login-${actor === 'candidat' ? 'candidate' : 'enterprise'}`}
            className={`font-medium ${themeClasses.linkColor} hover:underline`}
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ModernForgetPassword;