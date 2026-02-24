"use client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import EntrepriseClientLayout from "./client-layout";
import SimpleLoadingBar from "@/components/SimpleLoadingBar";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

export default function EntrepriseLayout({ children, params }: LayoutProps) {
  const { isLoading, isAuthorized } = useAuthGuard({
    requiredRole: 'entreprise',
    redirectTo: '/auth/login-entreprise',
  });

  if (isLoading) {
    return <SimpleLoadingBar />;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <EntrepriseClientLayout params={params}>
      {children}
    </EntrepriseClientLayout>
  );
}
