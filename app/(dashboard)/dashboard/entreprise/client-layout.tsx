"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import HeaderEntreprise from "@/components/layout/header-entreprise";
import Sidebar from "@/components/layout/sidebar";
import { useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

function DashboardLayoutContent({ children, params }: LayoutProps) {
  const router = useRouter();

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
    <>
      <div className="font-sans bg-gray-50 min-h-screen overflow-x-hidden w-full max-w-[100vw]">
        <HeaderEntreprise />

        <div className={`flex h-screen overflow-x-hidden`}>
          <Sidebar />
          <main className="flex-1 pt-20 overflow-auto overflow-x-hidden w-full">
            <div className="p-4 sm:p-6 max-w-full overflow-x-hidden">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default function EntrepriseClientLayout({ children, params }: LayoutProps) {
  return <DashboardLayoutContent params={params}>{children}</DashboardLayoutContent>;
}