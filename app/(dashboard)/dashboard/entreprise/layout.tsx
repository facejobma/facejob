import ServerAuthGuard from "@/components/auth/ServerAuthGuard";
import dynamic from "next/dynamic";

// Dynamic import for client layout
const EntrepriseClientLayout = dynamic(() => import("./client-layout"), {
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

export default function EntrepriseLayout({ children, params }: LayoutProps) {
  return (
    <ServerAuthGuard requiredRole="entreprise">
      <EntrepriseClientLayout params={params}>
        {children}
      </EntrepriseClientLayout>
    </ServerAuthGuard>
  );
}
