"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import ModernLoginForm from "../../../components/auth/login/ModernLoginForm";
import ModernAuthLayout from "../../../components/auth/ModernAuthLayout";
import AuthLoadingSpinner from "../../../components/auth/AuthLoadingSpinner";

const LoginEntreprisePage = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const user = await getAuthenticatedUser();
        
        if (!isMounted) return;
        
        if (user) {
          // User is already logged in, redirect to their dashboard
          if (user.role === "candidat") {
            router.push("/dashboard/candidat");
          } else if (user.role === "entreprise") {
            router.push("/dashboard/entreprise");
          } else if (user.role === "admin") {
            router.push("/dashboard/admin");
          }
        } else {
          // No user, show login form
          setIsChecking(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Show loading spinner while checking authentication
  if (isChecking) {
    return <AuthLoadingSpinner message="Vérification de votre session..." />;
  }

  return (
    <ModernAuthLayout
      title="Bienvenue sur FaceJob"
      subtitle="Connectez-vous pour accéder à votre espace entreprise et gérer vos recrutements"
      backgroundImage="/images/photo-login.jpg"
    >
      <ModernLoginForm loginFor="entreprise" />
    </ModernAuthLayout>
  );
};

export default LoginEntreprisePage;
