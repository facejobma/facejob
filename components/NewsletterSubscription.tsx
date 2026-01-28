"use client";

import { FC, FormEvent, useState } from "react";
import { toast } from "react-hot-toast";
import { Mail, Check, Loader2 } from "lucide-react";
import { apiRequest, handleApiError } from "@/lib/apiUtils";

interface NewsletterSubscriptionProps {
  source?: string;
  placeholder?: string;
  buttonText?: string;
  className?: string;
  showName?: boolean;
  variant?: 'default' | 'compact' | 'inline';
}

const NewsletterSubscription: FC<NewsletterSubscriptionProps> = ({
  source = 'homepage',
  placeholder = "Votre adresse email",
  buttonText = "S'abonner",
  className = "",
  showName = false,
  variant = 'default'
}) => {
  const [formData, setFormData] = useState({
    email: "",
    name: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast.error("Veuillez entrer votre adresse email");
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    if (showName && !formData.name.trim()) {
      toast.error("Veuillez entrer votre nom");
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiRequest(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/newsletter/subscribe`,
        {
          method: "POST",
          body: JSON.stringify({
            email: formData.email,
            name: showName ? formData.name : null,
            source: source
          }),
        }
      );

      if (result.success) {
        setIsSubscribed(true);
        setFormData({ email: "", name: "" });
        
        if (result.data.already_subscribed) {
          toast.success("Vous êtes déjà abonné à notre newsletter !");
        } else if (result.data.reactivated) {
          toast.success("Votre abonnement a été réactivé avec succès !");
        } else {
          toast.success("Merci pour votre abonnement ! Vous recevrez bientôt nos actualités.");
        }
      } else {
        handleApiError(result, toast);
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubscribed) {
    return (
      <div className={`flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <Check className="w-5 h-5 text-green-600 mr-2" />
        <span className="text-green-700 font-medium">
          Abonnement confirmé !
        </span>
      </div>
    );
  }

  // Compact variant for footers or sidebars
  if (variant === 'compact') {
    return (
      <div className={`space-y-3 ${className}`}>
        <form onSubmit={handleSubmit} className="space-y-2">
          {showName && (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Votre nom"
              disabled={isLoading}
            />
          )}
          <div className="flex space-x-2">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={placeholder}
              disabled={isLoading}
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                buttonText
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Inline variant for within content
  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={`flex items-center space-x-2 ${className}`}>
        {showName && (
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateFormData("name", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Nom"
            disabled={isLoading}
          />
        )}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData("email", e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={placeholder}
            disabled={isLoading}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 font-medium text-white bg-primary hover:bg-primary-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            buttonText
          )}
        </button>
      </form>
    );
  }

  // Default variant
  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {showName && (
          <div>
            <label htmlFor="newsletter-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom
            </label>
            <input
              id="newsletter-name"
              type="text"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="Votre nom"
              disabled={isLoading}
              required
            />
          </div>
        )}
        
        <div>
          <label htmlFor="newsletter-email" className="block text-sm font-medium text-gray-700 mb-1">
            Adresse email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="newsletter-email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder={placeholder}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Abonnement en cours...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              {buttonText}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default NewsletterSubscription;