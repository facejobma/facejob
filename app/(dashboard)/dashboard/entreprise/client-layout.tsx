"use client";

import HeaderEntreprise from "@/components/layout/header-entreprise";
import Sidebar from "@/components/layout/sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import DashboardPageWrapper from "@/components/layout/DashboardPageWrapper";
import Cookies from "js-cookie";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

function DashboardLayoutInner({ children, params }: LayoutProps) {
  const router = useRouter();
  const { isOpen } = useSidebar();
  const [isChecking, setIsChecking] = useState(true);

  // Add dashboard-page class to body
  useEffect(() => {
    document.body.classList.add('dashboard-page');
    return () => {
      document.body.classList.remove('dashboard-page');
    };
  }, []);

  // Simple auth check - only check once on mount
  useEffect(() => {
    const authToken = Cookies.get("authToken");
    
    if (!authToken) {
      // No token, redirect to login
      router.replace("/auth/login-entreprise");
    } else {
      // Token exists, allow access
      setIsChecking(false);
    }
  }, []); // Empty deps - only run once

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

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
