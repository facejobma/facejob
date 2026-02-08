import ServerAuthGuard from "@/components/auth/ServerAuthGuard";
import dynamic from "next/dynamic";
import SimpleLoadingBar from "@/components/SimpleLoadingBar";

// Dynamic import for client layout
const EntrepriseClientLayout = dynamic(() => import("./client-layout"), {
  loading: () => <SimpleLoadingBar />
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
