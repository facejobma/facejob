"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import ModernLoginForm from "../../../components/auth/login/ModernLoginForm";
import ModernAuthLayout from "../../../components/auth/ModernAuthLayout";

const LoginCandidatPage = () => {
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
      title="Trouvez l'emploi de vos rêves"
      subtitle="Rejoignez des milliers de candidats qui ont trouvé leur emploi idéal grâce à FaceJob"
      backgroundImage="/img4.jpg"
    >
      <ModernLoginForm loginFor="candidate" />
    </ModernAuthLayout>
  );
};

export default LoginCandidatPage;
