"use client";

import { useRouter } from "next/navigation";
import HeaderEntreprise from "@/components/layout/header-entreprise";
import Sidebar from "@/components/layout/sidebar";
import { useEffect } from "react";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import DashboardPageWrapper from "@/components/layout/DashboardPageWrapper";

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

  // Add dashboard-page class to body
  useEffect(() => {
    document.body.classList.add('dashboard-page');
    return () => {
      document.body.classList.remove('dashboard-page');
    };
  }, []);

  // Fallback client-side check - server-side auth should handle most cases
  useEffect(() => {
    if (!userData) {
      router.push(`/auth/login-entreprise`);
    }
  }, [userData, router]);

  return (
    <div className="dashboard-layout min-h-screen font-sans bg-gray-50 flex flex-col">
      <HeaderEntreprise />

      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main className={`flex-1 transition-all duration-300 ${isOpen ? 'md:ml-64' : 'md:ml-0'}`}>
          <DashboardPageWrapper>
            {children}
          </DashboardPageWrapper>
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
