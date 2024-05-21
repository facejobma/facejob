"use client";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";


function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // useEffect(() => {
  const userDataString =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user")
      : null;
  const userData = userDataString ? JSON.parse(userDataString) : null;

  if (!userData) {
    router.push(`/`);
    // return null;
  }
  // }, [router]);

  return (
    <>
      <Header />

      {/*<body className={`${inter.className}`}>*/}
        <div className="flex h-screen">
          <Sidebar />
          <main className="w-full pt-16">{children}</main>
        </div>
      {/*</body>*/}
    </>
  );
}

export default dynamic(() => Promise.resolve(DashboardLayout), { ssr: false });
// export default DashboardLayout
