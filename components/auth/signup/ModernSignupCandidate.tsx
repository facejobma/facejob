"use client";

import { FC, FormEvent, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, User, Phone, Check, CheckCircle, XCircle } from "lucide-react";
import google from "@/public/svg/google.svg";
import linkedin from "@/public/svg/linkedin.svg";
import { apiRequest, handleApiError } from "@/lib/apiUtils";

interface ModernSignupCandidateProps {
  onNextStep: () => void;
}

const ModernSignupCandidate: FC<ModernSignupCandidateProps> = ({ onNextStep }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    tel: "",
    sex: "",
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
    const { firstName, lastName, tel, sex, email, password, passwordConfirm, acceptTerms } = formData;
    
    if (!firstName.trim()) {
      toast.error("Veuillez entrer votre prénom.");
      return false;
    }
    if (!lastName.trim()) {
      toast.error("Veuillez entrer votre nom.");
      return false;
    }
    if (!tel.trim()) {
      toast.error("Veuillez entrer votre numéro de téléphone.");
      return false;
    }
    if (!sex) {
      toast.error("Veuillez choisir votre sexe.");
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
    setFieldErrors({});
    
    try {
      const result = await apiRequest(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/auth/candidate/register",
        {
          method: "POST",
          body: JSON.stringify(formData),
        }
      );

      if (result.success) {
        console.log("Registration successful - result:", result);
        
        // The backend response is wrapped in result.data
        const responseData = result.data;
        
        if (responseData && responseData.data) {
          const userData = responseData.data;
          
          sessionStorage.setItem("userId", userData.user_id);
          
          // Store the authentication token
          if (userData.token) {
            sessionStorage.setItem("authToken", userData.token);
            console.log("Token stored in sessionStorage");
          } else {
            console.warn("No token received from registration");
          }
        } else {
          console.error("Unexpected response structure:", responseData);
        }
        
        toast.success("Compte créé ! Veuillez vérifier votre email pour activer votre compte.");
        onNextStep();
      } else {
        if (result.errorType === 'validation' && result.errors) {
          const mappedErrors: Record<string, string> = {};
          Object.keys(result.errors).forEach(field => {
            const errorMessages = result.errors![field];
            mappedErrors[field] = Array.isArray(errorMessages) ? errorMessages[0] : errorMessages;
          });
          setFieldErrors(mappedErrors);
          
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
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/auth/candidate/google"
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
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/auth/candidate/linkedin"
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="text-center mb-4 flex-shrink-0">
        <h1 className="text-xl font-bold text-secondary mb-1">
          Créer votre compte candidat
        </h1>
        <p className="text-sm text-third">
          Rejoignez FaceJob et trouvez l'emploi de vos rêves
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {/* Social Signup Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-secondary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Image src={google} alt="Google" className="w-5 h-5 mr-2" />
              S'inscrire avec Google
            </button>
            
            <button
              type="button"
              onClick={handleLinkedinSignup}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-secondary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Image src={linkedin} alt="LinkedIn" className="w-5 h-5 mr-2" />
              S'inscrire avec LinkedIn
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-third">Ou créez votre compte</span>
            </div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-xs font-medium text-secondary mb-1">
                  Prénom *
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  className={`block w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    fieldErrors.firstName 
                      ? "border-red-300 focus:ring-red-500" 
                      : "border-gray-300 focus:ring-primary"
                  }`}
                  placeholder="Prénom"
                  disabled={isLoading}
                  required
                />
                {fieldErrors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-xs font-medium text-secondary mb-1">
                  Nom *
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  className={`block w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    fieldErrors.lastName 
                      ? "border-red-300 focus:ring-red-500" 
                      : "border-gray-300 focus:ring-primary"
                  }`}
                  placeholder="Nom"
                  disabled={isLoading}
                  required
                />
                {fieldErrors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Phone & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="tel" className="block text-xs font-medium text-secondary mb-1">
                  Téléphone *
                </label>
                <input
                  id="tel"
                  type="tel"
                  value={formData.tel}
                  onChange={(e) => updateFormData("tel", e.target.value)}
                  className={`block w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    fieldErrors.tel 
                      ? "border-red-300 focus:ring-red-500" 
                      : "border-gray-300 focus:ring-primary"
                  }`}
                  placeholder="+212 6XX XXX XXX"
                  disabled={isLoading}
                  required
                />
                {fieldErrors.tel && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.tel}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary mb-1">
                  Sexe *
                </label>
                <div className="flex space-x-4 pt-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sex"
                      value="female"
                      checked={formData.sex === "female"}
                      onChange={(e) => updateFormData("sex", e.target.value)}
                      className="sr-only"
                      disabled={isLoading}
                    />
                    <div className={`w-4 h-4 border-2 rounded-full mr-1.5 flex items-center justify-center transition-colors ${
                      formData.sex === "female" 
                        ? "border-primary bg-primary" 
                        : "border-gray-300"
                    }`}>
                      {formData.sex === "female" && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-xs text-secondary">Femme</span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sex"
                      value="male"
                      checked={formData.sex === "male"}
                      onChange={(e) => updateFormData("sex", e.target.value)}
                      className="sr-only"
                      disabled={isLoading}
                    />
                    <div className={`w-4 h-4 border-2 rounded-full mr-1.5 flex items-center justify-center transition-colors ${
                      formData.sex === "male" 
                        ? "border-primary bg-primary" 
                        : "border-gray-300"
                    }`}>
                      {formData.sex === "male" && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-xs text-secondary">Homme</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-secondary mb-1">
                Adresse email *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className={`block w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                  fieldErrors.email 
                    ? "border-red-300 focus:ring-red-500" 
                    : "border-gray-300 focus:ring-primary"
                }`}
                placeholder="votre@email.com"
                disabled={isLoading}
                required
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-secondary mb-1">
                  Mot de passe *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    onFocus={() => setShowPasswordRequirements(true)}
                    onBlur={() => setShowPasswordRequirements(false)}
                    className={`block w-full px-3 py-2 pr-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                      fieldErrors.password 
                        ? "border-red-300 focus:ring-red-500" 
                        : "border-gray-300 focus:ring-primary"
                    }`}
                    placeholder="••••••••"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="passwordConfirm" className="block text-xs font-medium text-secondary mb-1">
                  Confirmer *
                </label>
                <div className="relative">
                  <input
                    id="passwordConfirm"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.passwordConfirm}
                    onChange={(e) => updateFormData("passwordConfirm", e.target.value)}
                    className="block w-full px-3 py-2 pr-9 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="••••••••"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            {(showPasswordRequirements || formData.password) && (
              <div className="p-2.5 bg-gray-50 rounded-lg border">
                <p className="text-xs font-medium text-gray-700 mb-1.5">Exigences du mot de passe :</p>
                {(() => {
                  const requirements = getPasswordRequirements(formData.password);
                  return (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                      <div className="flex items-center text-xs">
                        {requirements.minLength ? (
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500 mr-1 flex-shrink-0" />
                        )}
                        <span className={requirements.minLength ? "text-green-700" : "text-red-700"}>
                          8+ caractères
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        {requirements.hasLowercase ? (
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500 mr-1 flex-shrink-0" />
                        )}
                        <span className={requirements.hasLowercase ? "text-green-700" : "text-red-700"}>
                          Minuscule (a-z)
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        {requirements.hasUppercase ? (
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500 mr-1 flex-shrink-0" />
                        )}
                        <span className={requirements.hasUppercase ? "text-green-700" : "text-red-700"}>
                          Majuscule (A-Z)
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        {requirements.hasNumber ? (
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500 mr-1 flex-shrink-0" />
                        )}
                        <span className={requirements.hasNumber ? "text-green-700" : "text-red-700"}>
                          Chiffre (0-9)
                        </span>
                      </div>
                      <div className="flex items-center text-xs col-span-2">
                        {requirements.hasSpecialChar ? (
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500 mr-1 flex-shrink-0" />
                        )}
                        <span className={requirements.hasSpecialChar ? "text-green-700" : "text-red-700"}>
                          Caractère spécial (@$!%*?&)
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
                  className={`w-4 h-4 border-2 rounded cursor-pointer flex items-center justify-center transition-colors ${
                    formData.acceptTerms 
                      ? "border-primary bg-primary" 
                      : "border-gray-300"
                  }`}
                >
                  {formData.acceptTerms && (
                    <Check className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
              </div>
              <div className="ml-2 text-xs">
                <label htmlFor="acceptTerms" className="text-secondary">
                  J'accepte les{" "}
                  <Link href="/termes/candidats" className="text-primary hover:text-primary-1 font-medium">
                    conditions d'utilisation
                  </Link>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </div>
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-2">
            <p className="text-xs text-third">
              Vous avez déjà un compte ?{" "}
              <Link
                href="/auth/login-candidate"
                className="font-medium text-primary hover:text-primary-1 hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSignupCandidate;
