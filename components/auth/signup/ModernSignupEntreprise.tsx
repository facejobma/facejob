"use client";

import { FC, FormEvent, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Cookies from "js-cookie";
import { Eye, EyeOff, Mail, Lock, Building2, Phone, Check, CheckCircle, XCircle } from "lucide-react";
import google from "@/public/svg/google.svg";
import linkedin from "@/public/svg/linkedin.svg";
import { apiRequest, handleApiError } from "@/lib/apiUtils";

interface ModernSignupEntrepriseProps {
  onNextStep: () => void;
}

const ModernSignupEntreprise: FC<ModernSignupEntrepriseProps> = ({ onNextStep }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    tel: "",
    email: "",
    password: "",
    passwordConfirm: "",
    acceptTerms: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

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

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return false;
    }
    if (!/(?=.*[a-z])/.test(value)) {
      toast.error("Le mot de passe doit contenir au moins une lettre minuscule.");
      return false;
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      toast.error("Le mot de passe doit contenir au moins une lettre majuscule.");
      return false;
    }
    if (!/(?=.*\d)/.test(value)) {
      toast.error("Le mot de passe doit contenir au moins un chiffre.");
      return false;
    }
    if (!/(?=.*[@$!%*?&])/.test(value)) {
      toast.error("Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&).");
      return false;
    }
    return true;
  };

  const getPasswordRequirements = (password: string) => {
    return {
      minLength: password.length >= 8,
      hasLowercase: /(?=.*[a-z])/.test(password),
      hasUppercase: /(?=.*[A-Z])/.test(password),
      hasNumber: /(?=.*\d)/.test(password),
      hasSpecialChar: /(?=.*[@$!%*?&])/.test(password)
    };
  };

  const validateFields = () => {
    const { companyName, tel, email, password, passwordConfirm, acceptTerms } = formData;
    
    if (!companyName.trim()) {
      toast.error("Veuillez entrer le nom de l'entreprise.");
      return false;
    }
    if (!tel.trim()) {
      toast.error("Veuillez entrer votre numéro de téléphone.");
      return false;
    }
    if (!validateEmail(email)) {
      return false;
    }
    if (!validatePassword(password)) {
      return false;
    }
    if (password !== passwordConfirm) {
      toast.error("Les mots de passe ne correspondent pas.");
      return false;
    }
    if (!acceptTerms) {
      toast.error("Veuillez accepter les conditions d'utilisation.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;

    setIsLoading(true);
    setFieldErrors({}); // Clear previous errors
    
    try {
      const result = await apiRequest(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/auth/entreprise/register",
        {
          method: "POST",
          body: JSON.stringify(formData),
        }
      );

      if (result.success) {
        // Store user ID for profile completion
        sessionStorage.setItem("userId", result.data.user_id);
        
        // Store authentication token
        if (result.data.token) {
          // Store in cookies for persistence
          Cookies.set("authToken", result.data.token, { expires: 7 }); // 7 days
          // Also store in sessionStorage as backup
          sessionStorage.setItem("authToken", result.data.token);
        }
        
        toast.success("Votre compte entreprise a été créé avec succès !");
        onNextStep();
      } else {
        // Handle validation errors specifically
        if (result.errorType === 'validation' && result.errors) {
          // Map backend field names to frontend field names if needed
          const mappedErrors: Record<string, string> = {};
          Object.keys(result.errors).forEach(field => {
            const errorMessages = result.errors![field];
            mappedErrors[field] = Array.isArray(errorMessages) ? errorMessages[0] : errorMessages;
          });
          setFieldErrors(mappedErrors);
          
          // Show the first validation error as toast
          const firstErrorField = Object.keys(result.errors)[0];
          const firstErrorMessage = result.errors[firstErrorField][0];
          toast.error(firstErrorMessage);
        } else {
          handleApiError(result, toast);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await apiRequest(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/auth/entreprise/google"
      );
      
      if (result.success) {
        window.location.href = result.data.url;
      } else {
        handleApiError(result, toast);
      }
    } catch (error) {
      console.error("Google signup error:", error);
      toast.error("Une erreur inattendue s'est produite");
    }
  };

  const handleLinkedinSignup = async () => {
    try {
      const result = await apiRequest(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/auth/entreprise/linkedin"
      );
      
      if (result.success) {
        window.location.href = result.data.url;
      } else {
        handleApiError(result, toast);
      }
    } catch (error) {
      console.error("LinkedIn signup error:", error);
      toast.error("Une erreur inattendue s'est produite");
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-secondary mb-2">
          Créer votre compte entreprise
        </h1>
        <p className="text-third">
          Rejoignez FaceJob et trouvez vos futurs collaborateurs
        </p>
      </div>

      {/* Social Signup Buttons */}
      <div className="space-y-3 mb-6">
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Image src={google} alt="Google" className="w-5 h-5 mr-3" />
          S'inscrire avec Google
        </button>
        
        <button
          type="button"
          onClick={handleLinkedinSignup}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Image src={linkedin} alt="LinkedIn" className="w-5 h-5 mr-3" />
          S'inscrire avec LinkedIn
        </button>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Ou créez votre compte</span>
        </div>
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Name Field */}
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
            Nom de l'entreprise *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="companyName"
              type="text"
              value={formData.companyName}
              onChange={(e) => updateFormData("companyName", e.target.value)}
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                fieldErrors.companyName 
                  ? "border-red-300 focus:ring-red-500" 
                  : "border-gray-300 focus:ring-green-500"
              }`}
              placeholder="Raison sociale de votre entreprise"
              disabled={isLoading}
              required
            />
          </div>
          {fieldErrors.companyName && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.companyName}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="tel" className="block text-sm font-medium text-gray-700 mb-1">
            Téléphone *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="tel"
              type="tel"
              value={formData.tel}
              onChange={(e) => updateFormData("tel", e.target.value)}
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                fieldErrors.tel 
                  ? "border-red-300 focus:ring-red-500" 
                  : "border-gray-300 focus:ring-green-500"
              }`}
              placeholder="+212 5XX XXX XXX"
              disabled={isLoading}
              required
            />
          </div>
          {fieldErrors.tel && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.tel}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Adresse email professionnelle *
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
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                fieldErrors.email 
                  ? "border-red-300 focus:ring-red-500" 
                  : "border-gray-300 focus:ring-green-500"
              }`}
              placeholder="contact@entreprise.com"
              disabled={isLoading}
              required
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe *
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
                onFocus={() => setShowPasswordRequirements(true)}
                onBlur={() => setShowPasswordRequirements(false)}
                className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                  fieldErrors.password 
                    ? "border-red-300 focus:ring-red-500" 
                    : "border-gray-300 focus:ring-green-500"
                }`}
                placeholder="••••••••"
                disabled={isLoading}
                required
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
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer *
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
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Password Requirements - Under both password fields */}
        {(showPasswordRequirements || formData.password) && (
          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="text-xs font-medium text-gray-700 mb-2">Exigences du mot de passe :</p>
            {(() => {
              const requirements = getPasswordRequirements(formData.password);
              return (
                <div className="space-y-1">
                  <div className="flex items-center text-xs">
                    {requirements.minLength ? (
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500 mr-2" />
                    )}
                    <span className={requirements.minLength ? "text-green-700" : "text-red-700"}>
                      Au moins 8 caractères
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    {requirements.hasLowercase ? (
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500 mr-2" />
                    )}
                    <span className={requirements.hasLowercase ? "text-green-700" : "text-red-700"}>
                      Une lettre minuscule (a-z)
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    {requirements.hasUppercase ? (
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500 mr-2" />
                    )}
                    <span className={requirements.hasUppercase ? "text-green-700" : "text-red-700"}>
                      Une lettre majuscule (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    {requirements.hasNumber ? (
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500 mr-2" />
                    )}
                    <span className={requirements.hasNumber ? "text-green-700" : "text-red-700"}>
                      Un chiffre (0-9)
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    {requirements.hasSpecialChar ? (
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500 mr-2" />
                    )}
                    <span className={requirements.hasSpecialChar ? "text-green-700" : "text-red-700"}>
                      Un caractère spécial (@$!%*?&)
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Terms Checkbox */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="acceptTerms"
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) => updateFormData("acceptTerms", e.target.checked)}
              className="sr-only"
              disabled={isLoading}
              required
            />
            <div 
              onClick={() => updateFormData("acceptTerms", !formData.acceptTerms)}
              className={`w-5 h-5 border-2 rounded cursor-pointer flex items-center justify-center transition-colors ${
                formData.acceptTerms 
                  ? "border-green-500 bg-green-500" 
                  : "border-gray-300"
              }`}
            >
              {formData.acceptTerms && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="acceptTerms" className="text-gray-700">
              J'accepte les{" "}
              <Link href="/termes/entreprise" className="text-green-600 hover:text-green-500 font-medium">
                conditions d'utilisation
              </Link>{" "}
              de FaceJob
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Création du compte...
            </div>
          ) : (
            "Créer mon compte entreprise"
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Vous avez déjà un compte ?{" "}
          <Link
            href="/auth/login-enterprise"
            className="font-medium text-green-600 hover:text-green-500 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ModernSignupEntreprise;