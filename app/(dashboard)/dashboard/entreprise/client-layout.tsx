"use client";

import { useRouter } from "next/navigation";
import HeaderEntreprise from "@/components/layout/header-entreprise";
import Sidebar from "@/components/layout/sidebar";
import { useEffect } from "react";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

function DashboardLayoutInner({ children, params }: LayoutProps) {
  const router = useRouter();
  const { isOpen } = useSidebar();

  const userDataString =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user")
      : null;
  const userData = userDataString ? JSON.parse(userDataString) : null;

  // Fallback client-side check - server-side auth should handle most cases
  useEffect(() => {
    if (!userData) {
      router.push(`/auth/login-entreprise`);
    }
  }, [userData, router]);

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <HeaderEntreprise />

      <div className={`flex h-screen`}>
        <Sidebar />
        <main className={`flex-1 pt-20 overflow-auto transition-all duration-300 ${isOpen ? 'md:ml-64' : 'md:ml-0'}`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function EntrepriseClientLayout({ children, params }: LayoutProps) {
  return (
    <SidebarProvider>
      <DashboardLayoutInner params={params}>{children}</DashboardLayoutInner>
    </SidebarProvider>
  );
}
