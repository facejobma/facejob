"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import dynamic from "next/dynamic";
import SimpleLoadingBar from "@/components/SimpleLoadingBar";

// Dynamic import for client layout
const CandidatClientLayout = dynamic(() => import("./client-layout"), {
  loading: () => <SimpleLoadingBar />
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
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const user = await getAuthenticatedUser();
        
        // Only update state if component is still mounted
        if (!isMounted) return;
        
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
        if (isMounted) {
          router.push("/auth/login-candidate");
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    checkAuth();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isChecking) {
    return <SimpleLoadingBar />;
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
