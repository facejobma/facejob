"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import HeaderEntreprise from "@/components/layout/header-entreprise";
import Sidebar from "@/components/layout/sidebar";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

function DashboardLayout({ children, params }: LayoutProps) {
  const router = useRouter();

  const userDataString =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user")
      : null;
  const userData = userDataString ? JSON.parse(userDataString) : null;

  if (!userData) {
    router.push(`/`);
  }

  return (
    <>
    <div className="font-sans">
      <HeaderEntreprise />
      <div className={`flex h-screen`}>
        <Sidebar />
        <main className="w-full pt-16">{children}</main>
      </div>
      </div>
    </>
  );
}

export default dynamic(() => Promise.resolve(DashboardLayout), { ssr: false });
