"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import ModernLoginForm from "../../../components/auth/login/ModernLoginForm";
import ModernAuthLayout from "../../../components/auth/ModernAuthLayout";
import AuthLoadingSpinner from "../../../components/auth/AuthLoadingSpinner";

const LoginCandidatPage = () => {
  const router = useRouter();
  const { isLoading, user } = useAuthGuard({});

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (!isLoading && user) {
      const dashboardMap: Record<string, string> = {
        candidat: '/dashboard/candidat',
        entreprise: '/dashboard/entreprise',
        admin: '/dashboard/admin',
      };
      const redirectPath = dashboardMap[user.role] || '/';
      console.log('🔄 User already logged in, redirecting to:', redirectPath);
      router.replace(redirectPath);
    }
  }, [isLoading, user, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <AuthLoadingSpinner message="Vérification de votre session..." />;
  }

  // If user is logged in, show loading while redirecting
  if (user) {
    return <AuthLoadingSpinner message="Redirection..." />;
  }

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
