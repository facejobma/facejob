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
      <div className={`${inter.className} bg-gray-50 min-h-screen`}>
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

export default dynamic(() => Promise.resolve(DashboardLayout), { ssr: false });
