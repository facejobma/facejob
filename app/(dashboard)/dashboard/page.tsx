"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { BriefcaseBusiness } from "lucide-react";

export default function DashboardGatewayPage() {
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      let role = sessionStorage.getItem("userRole");
      try {
        const cached = sessionStorage.getItem("user");
        const user = cached ? JSON.parse(cached) : null;
        role ||= user?.role || user?.user_type || null;
      } catch {}

      if (role === "entreprise" || role === "candidat") {
        router.replace(`/dashboard/${role}`);
        return;
      }

      const token = Cookies.get("authToken")?.replace(/["']/g, "");
      if (!token) {
        router.replace("/auth/login");
        return;
      }
      try {
        const response = await fetch("/api/v1/user", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        });
        const payload = await response.json();
        const user = payload?.data ?? payload?.user ?? payload;
        const resolvedRole = user?.role || user?.user_type;
        if (resolvedRole === "entreprise" || resolvedRole === "candidat") {
          sessionStorage.setItem("user", JSON.stringify(user));
          sessionStorage.setItem("userRole", resolvedRole);
          router.replace(`/dashboard/${resolvedRole}`);
          return;
        }
      } catch {}
      router.replace("/auth/login");
    };
    void redirect();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
          <BriefcaseBusiness className="h-6 w-6" />
        </span>
        <div className="mx-auto mt-5 h-1.5 w-36 overflow-hidden rounded-full bg-emerald-100">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-600" />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-600">
          Ouverture de votre espace…
        </p>
      </div>
    </main>
  );
}
