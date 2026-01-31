import ServerAuthGuard from "@/components/auth/ServerAuthGuard";
import dynamic from "next/dynamic";

// Dynamic import for client layout
const CandidatClientLayout = dynamic(() => import("./client-layout"), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
});

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
