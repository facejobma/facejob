"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, Mail, XCircle } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/lib/api";

const statusConfig = {
  loading: { icon: Loader2, iconClass: "animate-spin text-emerald-700", iconBg: "bg-emerald-50", title: "Vérification en cours...", description: "Nous vérifions votre adresse email." },
  success: { icon: CheckCircle, iconClass: "text-emerald-700", iconBg: "bg-emerald-100", title: "Email vérifié", description: "Votre adresse email a été confirmée avec succès." },
  error: { icon: XCircle, iconClass: "text-red-600", iconBg: "bg-red-100", title: "Erreur de vérification", description: "Une erreur s’est produite lors de la vérification." },
} as const;

type VerificationStatus = keyof typeof statusConfig;

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("");
  const [userType, setUserType] = useState("");

  useEffect(() => {
    let cancelled = false;
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage("Lien de vérification invalide. Token ou email manquant.");
      return;
    }

    verifyEmail(token, email)
      .then((response) => {
        if (cancelled) return;
        const data = response?.data ?? response;
        setStatus("success");
        setMessage(data?.message || response?.message || "Email vérifié avec succès !");
        setUserType(data?.user_type || data?.role || "");
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Erreur lors de la vérification de l’email.");
      });

    return () => { cancelled = true; };
  }, [searchParams]);

  const handleContinue = () => {
    router.push(userType === "entreprise" || userType === "enterprise" ? "/auth/login-enterprise" : "/auth/login-candidate");
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <main className="pt-24">
      <section className="border-b border-emerald-100 bg-gradient-to-b from-emerald-50/80 to-white">
        <div className="container mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <div className="max-w-2xl">
            <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full ${config.iconBg}`}><StatusIcon className={`h-7 w-7 ${config.iconClass}`} /></div>
            <h1 className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl">{config.title}</h1>
            <p className="max-w-xl text-base leading-7 text-slate-600">{config.description}</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="max-w-2xl">
          {message && <div className={`mb-8 border-l-4 px-5 py-4 ${status === "success" ? "border-emerald-500 bg-emerald-50 text-emerald-900" : status === "error" ? "border-red-500 bg-red-50 text-red-900" : "border-emerald-600 bg-emerald-50/70 text-slate-700"}`}><p className="text-sm font-medium">{message}</p></div>}
          {status === "loading" && <p className="text-sm text-slate-600">Veuillez patienter...</p>}
          {status === "success" && <div className="space-y-5"><p className="text-sm leading-6 text-slate-600">Vous pouvez maintenant vous connecter à votre compte.</p><Button onClick={handleContinue} className="bg-slate-900 text-white hover:bg-emerald-700">Se connecter</Button></div>}
          {status === "error" && <div className="flex flex-col gap-3 sm:flex-row"><Button onClick={() => router.push("/auth/resend-verification")} variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-700 hover:text-white"><Mail className="mr-2 h-4 w-4" />Renvoyer l’email de vérification</Button><Button onClick={() => router.push("/")} variant="ghost" className="text-slate-600 hover:bg-slate-100">Retour à l’accueil</Button></div>}
        </div>
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <Suspense fallback={<main className="pt-24"><section className="container mx-auto max-w-5xl px-4 py-14"><div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50"><Loader2 className="h-7 w-7 animate-spin text-emerald-700" /></div><p className="mt-4 text-slate-600">Vérification en cours...</p></section></main>}><VerifyEmailContent /></Suspense>
      <Footer />
    </div>
  );
}
