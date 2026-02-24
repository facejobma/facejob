"use client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import CandidatClientLayout from "./client-layout";
import SimpleLoadingBar from "@/components/SimpleLoadingBar";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

export default function CandidatLayout({ children, params }: LayoutProps) {
  const { isLoading, isAuthorized } = useAuthGuard({
    requiredRole: 'candidat',
    redirectTo: '/auth/login-candidate',
  });

  if (isLoading) {
    return <SimpleLoadingBar />;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <CandidatClientLayout params={params}>
      {children}
    </CandidatClientLayout>
  );
}
