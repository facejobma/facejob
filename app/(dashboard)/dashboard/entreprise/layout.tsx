"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import HeaderEntreprise from "@/components/layout/header-entreprise";
import Sidebar from "@/components/layout/sidebar";
import RouteGuard from "@/components/auth/RouteGuard";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

function DashboardLayoutContent({ children, params }: LayoutProps) {
  return (
    <>
      <div className="font-sans bg-gray-50 min-h-screen">
        <HeaderEntreprise />

        <div className={`flex h-screen`}>
          <Sidebar />
          <main className="flex-1 pt-20 overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

function DashboardLayout({ children, params }: LayoutProps) {
  return (
    <RouteGuard requiredRole="entreprise">
      <DashboardLayoutContent params={params}>{children}</DashboardLayoutContent>
    </RouteGuard>
  );
}

export default dynamic(() => Promise.resolve(DashboardLayout), { ssr: false });
