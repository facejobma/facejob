import ServerAuthGuard from "@/components/auth/ServerAuthGuard";
import CandidatClientLayout from "./client-layout";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

export default function CandidatLayout({ children, params }: LayoutProps) {
  return (
    <ServerAuthGuard requiredRole="candidat">
      <CandidatClientLayout params={params}>
        {children}
      </CandidatClientLayout>
    </ServerAuthGuard>
  );
}

export default dynamic(() => Promise.resolve(DashboardLayout), { ssr: false });
