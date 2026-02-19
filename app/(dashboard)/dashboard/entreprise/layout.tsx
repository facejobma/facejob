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
  // Note: Removed ServerAuthGuard to prevent redirect loops
  // Authentication is now handled client-side in the client-layout
  return (
    <EntrepriseClientLayout params={params}>
      {children}
    </EntrepriseClientLayout>
  );
}
