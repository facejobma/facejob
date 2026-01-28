"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import ModernLoginForm from "../../../components/auth/login/ModernLoginForm";
import ModernAuthLayout from "../../../components/auth/ModernAuthLayout";

const LoginEntreprisePage = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in using secure method
    const checkAuth = async () => {
      const user = await getAuthenticatedUser();
      if (user) {
        // Redirect to appropriate dashboard based on actual role from backend
        if (user.role === "candidat") {
          router.push("/dashboard/candidat");
        } else if (user.role === "entreprise") {
          router.push("/dashboard/entreprise");
        } else if (user.role === "admin") {
          router.push("/dashboard/admin");
        }
      }
    };

    checkAuth();
  }, [router]);

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
