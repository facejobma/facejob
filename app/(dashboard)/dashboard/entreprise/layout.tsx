"use client";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

import { Inter } from "next/font/google";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //!!!
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const userDataString =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user")
      : null;
  const userData = userDataString ? JSON.parse(userDataString) : null;

  if (!userData) {
    router.push(`/`);
  }

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <Header />{" "}
      {isClient ? (
        <div className={`flex h-screen ${inter.className}`}>
          <Sidebar />

          <main className="w-full pt-16">{children}</main>
        </div>
      ) : (
        <p>There are some issues during loading the page !</p>
      )}
    </>
  );
}
