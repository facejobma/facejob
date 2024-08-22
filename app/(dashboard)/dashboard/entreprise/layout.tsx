"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import HeaderEntreprise from "@/components/layout/header-entreprise";
import Sidebar from "@/components/layout/sidebar";

const inter = Inter({ subsets: ["latin"] });

function DashboardLayout({ children }: { children: React.ReactNode }) {
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
      <HeaderEntreprise />
      <div className={`flex h-screen ${inter.className}`}>
        <Sidebar />
        <main className="w-full pt-16">{children}</main>
      </div>
    </>
  );
}

export default dynamic(() => Promise.resolve(DashboardLayout), { ssr: false });
