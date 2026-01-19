"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Circles } from "react-loader-spinner";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

function LinkedinCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleLinkedInCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");
        const userRole = sessionStorage.getItem("userRole") || "candidate";

        // Check if LinkedIn returned an error
        if (error) {
          throw new Error(`LinkedIn OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error("Code d'autorisation manquant");
        }

        console.log("LinkedIn callback - Code:", code, "UserRole:", userRole);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/linkedin/callback?code=${code}`,
          {
            headers: {
              "accept": "application/json",
              "X-User-Role": userRole
            },
          },
        );

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Response error:", errorData);
          throw new Error(`Erreur du serveur: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Response data:", responseData);

        if (!responseData.user || !responseData.access_token) {
          throw new Error("Données d'authentification invalides");
        }

        // Store user data
        sessionStorage.setItem("user", JSON.stringify(responseData.user));
        sessionStorage.setItem("userRole", responseData.user_type || userRole);

        // Store auth token
        Cookies.set("authToken", responseData.access_token, { expires: 7 });

        // Show success message
        toast.success("Connexion LinkedIn réussie !");

        // Redirect to appropriate dashboard
        const redirectPath = userRole === "candidate" ? "/dashboard/candidat" : "/dashboard/entreprise";
        
        setTimeout(() => {
          router.push(redirectPath);
        }, 1000); // Small delay to show success message

      } catch (error: any) {
        console.error("LinkedIn authentication error:", error);
        setError(error.message);
        toast.error(error.message || "Erreur lors de l'authentification avec LinkedIn");
        
        // Redirect to login page after error
        setTimeout(() => {
          const userRole = sessionStorage.getItem("userRole") || "candidate";
          const loginPath = userRole === "candidate" ? "/auth/login-candidate" : "/auth/login-entreprise";
          router.push(loginPath);
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleLinkedInCallback();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-220px)] space-y-4">
        <Circles
          height={80}
          width={80}
          color="#0077B5"
          ariaLabel="circles-loading"
          visible={true}
        />
        <p className="text-gray-600">Connexion avec LinkedIn en cours...</p>
      </div>
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

export default LinkedinCallback;
