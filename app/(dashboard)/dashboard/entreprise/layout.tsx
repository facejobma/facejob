import ServerAuthGuard from "@/components/auth/ServerAuthGuard";
import EntrepriseClientLayout from "./client-layout";

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
