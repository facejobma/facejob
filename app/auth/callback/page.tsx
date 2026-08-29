"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { getAuthenticatedUser, getSafeReturnUrl, resetAuthCache } from "@/lib/auth";
import { FullPageLoading } from "@/components/ui/loading";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const processCallback = async () => {
      try {
        const token = searchParams.get("token");
        const provider = searchParams.get("provider");
        const oauthError = searchParams.get("error");

        if (oauthError) throw new Error(oauthError);
        if (!token) throw new Error("Données d’authentification manquantes.");

        Cookies.set("authToken", token, { expires: 7, sameSite: "lax", secure: window.location.protocol === "https:" });
        resetAuthCache();
        const user = await getAuthenticatedUser();
        if (!user) throw new Error("Impossible de récupérer le compte authentifié.");
        if (cancelled) return;

        Cookies.set("userRole", user.role, { expires: 7, sameSite: "lax", secure: window.location.protocol === "https:" });
        sessionStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("userRole", user.role);
        sessionStorage.setItem("authToken", token);
        if (user.id) sessionStorage.setItem("userId", String(user.id));

        toast.success(`Connexion réussie via ${provider === "linkedin" ? "LinkedIn" : "Google"}.`);
        const returnUrl = getSafeReturnUrl(sessionStorage.getItem("oauthReturnUrl"));
        sessionStorage.removeItem("oauthReturnUrl");
        if (returnUrl) {
          router.replace(returnUrl);
          return;
        }

        const dashboardMap = { candidat: "/dashboard/candidat", entreprise: "/dashboard/entreprise", admin: "/dashboard/admin" } as const;
        router.replace(dashboardMap[user.role] || "/");
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "Erreur lors du traitement de la connexion.";
        setErrorMessage(message);
        toast.error(message);
      }
    };

    processCallback();
    return () => { cancelled = true; };
  }, [router, searchParams]);

  if (errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Connexion impossible</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{errorMessage}</p>
          <button onClick={() => router.replace("/auth/login-candidate")} className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Retour à la connexion</button>
        </div>
      </div>
    );
  }

  return <FullPageLoading message="Finalisation de la connexion" submessage="Nous vérifions votre compte…" showLogo />;
}

export default function AuthCallback() {
  return <Suspense fallback={<FullPageLoading message="Connexion en cours" submessage="Veuillez patienter…" showLogo />}><AuthCallbackContent /></Suspense>;
}
