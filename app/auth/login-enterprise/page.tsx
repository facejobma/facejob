"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import ModernLoginForm from "../../../components/auth/login/ModernLoginForm";
import ModernAuthLayout from "../../../components/auth/ModernAuthLayout";

const LoginEntreprisePage = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const authToken = Cookies.get("authToken");
    const userRole = typeof window !== "undefined" ? sessionStorage.getItem("userRole") : null;
    
    if (authToken && userRole) {
      // Redirect to appropriate dashboard based on user role
      if (userRole === "candidat") {
        router.push("/dashboard/candidat");
      } else if (userRole === "entreprise") {
        router.push("/dashboard/entreprise");
      }
    }
  }, [router]);

  return (
    <ModernAuthLayout
      title="Recrutez les meilleurs talents"
      subtitle="Accédez à des milliers de profils qualifiés et trouvez vos futurs collaborateurs"
      backgroundImage="/img6.jpg"
    >
      <ModernLoginForm loginFor="entreprise" />
    </ModernAuthLayout>
  );
};

export default LoginEntreprisePage;
