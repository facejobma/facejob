"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FullPageLoading } from "@/components/ui/loading";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { getUserFromToken, redirectToDashboard } from "@/lib/auth";

function GoogleCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        const userType = urlParams.get("user_type");
        const error = urlParams.get("error");
        const provider = urlParams.get("provider");

        console.log("Google callback - URL PARAMS:", urlParams.toString());
        console.log("Google callback - Token:", token);
        console.log("Google callback - User Type:", userType);
        console.log("Google callback - Error:", error);

        // Check if there was an OAuth error
        if (error) {
          throw new Error(`Erreur OAuth: ${decodeURIComponent(error)}`);
        }

        // Check if we have the required data from backend redirect
        if (!token || !userType) {
          throw new Error("Données d'authentification manquantes. Veuillez réessayer.");
        }

        // Store auth token
        Cookies.set("authToken", token, { expires: 7 });

        console.log("Access Token OAuth:", token);

        // Get user data from backend using the token
        const authenticatedUser = await getUserFromToken();
        
        if (!authenticatedUser) {
          throw new Error("Impossible de récupérer les données utilisateur");
        }

        // Store user data
        sessionStorage.setItem("user", JSON.stringify(authenticatedUser));

        // Show success message
        toast.success("Connexion Google réussie !");

        // Redirect to appropriate dashboard based on user type
        setTimeout(() => {
          redirectToDashboard(userType);
        }, 1000); // Small delay to show success message

      } catch (error: any) {
        console.error("Google authentication error:", error);
        setError(error.message);
        toast.error(error.message || "Erreur lors de l'authentification avec Google");
        
        // Redirect to login page after error
        setTimeout(() => {
          router.push("/auth/login-candidate"); // Default to candidate login
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleGoogleCallback();
  }, [router]);

  if (loading) {
    return (
      <FullPageLoading 
        message="Connexion avec Google en cours"
        submessage="Authentification en cours..."
        showLogo={true}
      />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-220px)] space-y-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur d'authentification</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-220px)] space-y-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Connexion réussie !</h2>
        <p className="text-gray-600">Redirection vers votre tableau de bord...</p>
      </div>
    </div>
  );
}

export default GoogleCallback;
