"use client";

import { FC, FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Lock, Eye, EyeOff, Shield, Mail } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const ModernResetPassword: FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [token, setToken] = useState<string>("");
  const [actor, setActor] = useState<string>("");
  const [tokenValid, setTokenValid] = useState(false);
  
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params && typeof params.token === "string" && typeof params.actor === "string") {
      setToken(params.token);
      setActor(params.actor);
      // Fetch email from backend using token
      fetchTokenInfo(params.token, params.actor);
    }
  }, [params]);

  const fetchTokenInfo = async (tokenParam: string, actorParam: string) => {
    setIsLoadingToken(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/reset-token-info?token=${encodeURIComponent(tokenParam)}&actor=${encodeURIComponent(actorParam)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, email: data.email }));
        setTokenValid(true);
      } else {
        setTokenValid(false);
        toast.error("Lien de réinitialisation invalide ou expiré");
        // Don't redirect - just show error and disable form
      }
    } catch (error) {
      console.error("Token validation error:", error);
      setTokenValid(false);
      toast.error("Erreur de connexion, veuillez réessayer");
    } finally {
      setIsLoadingToken(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return false;
    }
    return true;
  };

  const validateFields = () => {
    const { password, passwordConfirm } = formData;
    
    if (!validatePassword(password)) {
      return false;
    }
    if (password !== passwordConfirm) {
      toast.error("Les mots de passe ne correspondent pas.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Prevent submission if token is invalid
    if (!tokenValid) {
      toast.error("Impossible de soumettre avec un lien invalide");
      return;
    }
    
    if (!validateFields()) return;

    if (!token || !actor) {
      toast.error("Lien de réinitialisation invalide ou expiré");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            password: formData.password,
            password_confirmation: formData.passwordConfirm,
            actor,
            // Note: email is NOT sent - backend gets it from token for security
          }),
        }
      );

      if (response.ok) {
        toast.success("Mot de passe réinitialisé avec succès !");
        
        // Convert French actor terms back to English for URL routing
        const loginActor = actor === 'candidat' ? 'candidate' : 'enterprise';
        router.push(`/auth/login-${loginActor}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 400) {
          toast.error("Lien de réinitialisation invalide ou expiré");
        } else if (response.status === 422) {
          if (errorData.errors) {
            // Display first validation error
            const firstError = Object.values(errorData.errors)[0];
            if (Array.isArray(firstError)) {
              toast.error(firstError[0]);
            } else {
              toast.error(String(firstError));
            }
          } else {
            toast.error(errorData.message || "Données invalides");
          }
        } else if (response.status >= 500) {
          toast.error("Erreur du serveur, veuillez réessayer plus tard");
        } else {
          toast.error(errorData.message || "Échec de la réinitialisation du mot de passe");
        }
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Erreur de connexion, vérifiez votre connexion internet");
    } finally {
      setIsLoading(false);
    }
  };

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
      {/* Header */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-16 h-16 ${themeClasses.iconBg} rounded-full mb-4`}>
          <Shield className={`w-8 h-8 ${themeClasses.iconColor}`} />
        </div>
        <h1 className="text-2xl font-bold text-secondary mb-2">
          Nouveau mot de passe
        </h1>
        <p className="text-third">
          Choisissez un nouveau mot de passe sécurisé pour votre compte
        </p>
      </div>

      {/* Loading State */}
      {isLoadingToken ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification du lien de réinitialisation...</p>
        </div>
      ) : !tokenValid ? (
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <Shield className="w-12 h-12 mx-auto mb-2" />
          </div>
          <h2 className="text-lg font-semibold text-red-600 mb-2">Lien invalide ou expiré</h2>
          <p className="text-gray-600 mb-4">Ce lien de réinitialisation n'est plus valide.</p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Les liens de réinitialisation expirent après 60 minutes pour votre sécurité.
            </p>
            <Link
              href={`/auth/${actor}/forget-password`}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-1 transition-colors"
            >
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field - Read Only */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1">
                Compte associé
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="text"
                  value={formData.email}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  disabled
                  readOnly
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Shield className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                ✓ Compte vérifié par lien sécurisé
              </p>
            </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-secondary mb-1">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => updateFormData("password", e.target.value)}
              className={`block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${themeClasses.focusRing} focus:border-transparent transition-colors`}
              placeholder="••••••••"
              disabled={isLoading || !tokenValid}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={!tokenValid}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Au moins 8 caractères
          </p>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="passwordConfirm" className="block text-sm font-medium text-secondary mb-1">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="passwordConfirm"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.passwordConfirm}
              onChange={(e) => updateFormData("passwordConfirm", e.target.value)}
              className={`block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${themeClasses.focusRing} focus:border-transparent transition-colors`}
              placeholder="••••••••"
              disabled={isLoading || !tokenValid}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={!tokenValid}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !tokenValid}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
            !tokenValid 
              ? 'bg-gray-400 cursor-not-allowed' 
              : themeClasses.buttonBg
          } focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeClasses.buttonFocus} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Réinitialisation...
            </div>
          ) : !tokenValid ? (
            "Lien invalide - Impossible de continuer"
          ) : (
            "Réinitialiser le mot de passe"
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-third">
          Retour à la{" "}
          <Link
            href={`/auth/login-${actor === 'candidat' ? 'candidate' : 'enterprise'}`}
            className={`font-medium ${themeClasses.linkColor} hover:underline`}
          >
            page de connexion
          </Link>
        </p>
      </div>
      </>
      )}
    </div>
  );
};

export default ModernResetPassword;