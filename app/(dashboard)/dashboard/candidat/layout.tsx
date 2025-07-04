"use client";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import HeaderCandidat from "@/components/layout/header-candidat";

const inter = Inter({ subsets: ["latin"] });

function DashboardLayout({ children }: { children: React.ReactNode }) {
  // !!!!
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
      <div className={`${inter.className}`}>
        <HeaderCandidat />

        {/* <body className={`${inter.className}`}> */}
        <div className={`flex h-screen`}>
          <Sidebar />
          <main className="w-full pt-16">{children}</main>
        </div>
      </div>
    </>
  );
}

export default dynamic(() => Promise.resolve(DashboardLayout), { ssr: false });
// export default DashboardLayout
