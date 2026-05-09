"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import ModernLoginForm from "../../../components/auth/login/ModernLoginForm";
import ModernAuthLayout from "../../../components/auth/ModernAuthLayout";
import AuthLoadingSpinner from "../../../components/auth/AuthLoadingSpinner";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, user } = useAuthGuard({});

  // Get redirect parameters from URL
  const returnUrl = searchParams.get('returnUrl');

  // Redirect logged-in users to their dashboard or returnUrl
  useEffect(() => {
    if (!isLoading && user) {
      // If we have a returnUrl, use that
      if (returnUrl) {
        console.log('🔄 User already logged in, redirecting to returnUrl:', returnUrl);
        router.replace(returnUrl);
        return;
      }

      // Default dashboard redirection
      const dashboardMap: Record<string, string> = {
        candidat: '/dashboard/candidat',
        entreprise: '/dashboard/entreprise',
        admin: '/dashboard/admin',
      };
      const redirectPath = dashboardMap[user.role] || '/';
      console.log('🔄 User already logged in, redirecting to:', redirectPath);
      router.replace(redirectPath);
    }
  }, [isLoading, user, router, returnUrl]);

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
      <ModernLoginForm 
        loginFor="candidate" 
        returnUrl={returnUrl}
      />
    </ModernAuthLayout>
  );
}

const LoginCandidatPage = () => {
  return (
    <Suspense fallback={<AuthLoadingSpinner message="Chargement de la page..." />}>
      <LoginContent />
    </Suspense>
  );
};

export default LoginCandidatPage;
