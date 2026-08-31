"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getSafeReturnUrl } from "@/lib/auth";
import ModernLoginForm from "../../../components/auth/login/ModernLoginForm";
import ModernAuthLayout from "../../../components/auth/ModernAuthLayout";
import AuthLoadingSpinner from "../../../components/auth/AuthLoadingSpinner";

function LoginEnterpriseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, user } = useAuthGuard({});
  const returnUrl = getSafeReturnUrl(searchParams.get("returnUrl"));

  useEffect(() => {
    if (isLoading || !user) return;
    if (returnUrl) {
      router.replace(returnUrl);
      return;
    }
    const dashboardMap: Record<string, string> = { candidat: "/dashboard/candidat", entreprise: "/dashboard/entreprise", admin: "/dashboard/admin" };
    router.replace(dashboardMap[user.role] || "/");
  }, [isLoading, user, returnUrl, router]);

  if (isLoading) return <AuthLoadingSpinner message="Vérification de votre session..." />;
  if (user) return <AuthLoadingSpinner message="Redirection..." />;

  return (
    <ModernAuthLayout title="Recrutez les meilleurs talents" subtitle="Gérez vos offres et découvrez les profils adaptés à vos besoins" backgroundImage="/img6.jpg">
      <ModernLoginForm loginFor="entreprise" returnUrl={returnUrl} />
    </ModernAuthLayout>
  );
}

export default function LoginEnterprisePage() {
  return <Suspense fallback={<AuthLoadingSpinner message="Chargement de la page..." />}><LoginEnterpriseContent /></Suspense>;
}
