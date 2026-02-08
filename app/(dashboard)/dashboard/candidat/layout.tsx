"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import dynamic from "next/dynamic";

// Dynamic import for client layout
const CandidatClientLayout = dynamic(() => import("./client-layout"), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
});

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

export default function CandidatLayout({ children, params }: LayoutProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getAuthenticatedUser();
        
        if (!user) {
          // No user, redirect to login
          router.push("/auth/login-candidate");
          return;
        }

        if (user.role !== "candidat") {
          // Wrong role, redirect to appropriate dashboard
          if (user.role === "entreprise") {
            router.push("/dashboard/entreprise");
          } else if (user.role === "admin") {
            router.push("/dashboard/admin");
          } else {
            router.push("/");
          }
          return;
        }

        // User is authorized
        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/auth/login-candidate");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <CandidatClientLayout params={params}>
      {children}
    </CandidatClientLayout>
  );
}
