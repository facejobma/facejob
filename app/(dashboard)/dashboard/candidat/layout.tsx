"use client";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import dynamic from "next/dynamic";
import HeaderCandidat from "@/components/layout/header-candidat";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

function DashboardLayout({ children, params }: LayoutProps) {
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
      <div className="font-sans">
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
