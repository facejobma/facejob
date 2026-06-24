"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { CheckCircle, Loader2, Mail, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/lib/api";

const statusConfig = {
  loading: {
    icon: Loader2,
    iconClass: "animate-spin text-primary",
    iconBg: "bg-primary/10",
    title: "Vérification en cours...",
    description: "Nous vérifions votre adresse email.",
  },
  success: {
    icon: CheckCircle,
    iconClass: "text-green-600",
    iconBg: "bg-green-100",
    title: "Email vérifié",
    description: "Votre adresse email a été confirmée avec succès.",
  },
  error: {
    icon: XCircle,
    iconClass: "text-red-600",
    iconBg: "bg-red-100",
    title: "Erreur de vérification",
    description: "Une erreur s'est produite lors de la vérification.",
  },
} as const;

type VerificationStatus = keyof typeof statusConfig;

const VerifyEmailContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("");
  const [userType, setUserType] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage("Lien de vérification invalide. Token ou email manquant.");
      return;
    }

    const verifyEmailAsync = async () => {
      try {
        const data = await verifyEmail(token, email);
        setStatus("success");
        setMessage(data.message || "Email vérifié avec succès !");
        setUserType(data.user_type || "");
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Erreur lors de la vérification de l'email.");
      }
    };

    verifyEmailAsync();
  }, [searchParams]);

  const handleContinue = () => {
    if (userType === "candidat") {
      router.push("/auth/login-candidate");
    } else if (userType === "entreprise") {
      router.push("/auth/login-enterprise");
    } else {
      router.push("/auth/login");
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <main className="pt-24">
      <section className="border-b border-gray-100 bg-gradient-to-b from-green-50/70 to-white">
        <div className="container mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <div className="max-w-2xl">
            <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full ${config.iconBg}`}>
              <StatusIcon className={`h-7 w-7 ${config.iconClass}`} />
            </div>

            <h1 className="mb-3 text-3xl font-bold text-secondary sm:text-4xl">
              {config.title}
            </h1>
            <p className="max-w-xl text-base leading-7 text-gray-600">
              {config.description}
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="max-w-2xl">
          {message && (
            <div
              className={`mb-8 border-l-4 px-5 py-4 ${
                status === "success"
                  ? "border-green-500 bg-green-50 text-green-900"
                  : status === "error"
                    ? "border-red-500 bg-red-50 text-red-900"
                    : "border-primary bg-green-50/70 text-gray-700"
              }`}
            >
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}

          {status === "loading" && (
            <p className="text-sm text-gray-600">Veuillez patienter...</p>
          )}

          {status === "success" && (
            <div className="space-y-5">
              <p className="text-sm leading-6 text-gray-600">
                Vous pouvez maintenant vous connecter à votre compte.
              </p>
              <Button onClick={handleContinue} className="bg-primary text-white hover:bg-primary-1">
                Se connecter
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => router.push("/auth/resend-verification")}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white"
              >
                <Mail className="mr-2 h-4 w-4" />
                Renvoyer l'email de vérification
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="ghost"
                className="hover:bg-gray-100"
              >
                Retour à l'accueil
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

const VerifyEmailPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <Suspense
        fallback={
          <main className="pt-24">
            <section className="container mx-auto max-w-5xl px-4 py-14">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
              <p className="mt-4 text-gray-600">Vérification en cours...</p>
            </section>
          </main>
        }
      >
        <VerifyEmailContent />
      </Suspense>

      <Footer />
    </div>
  );
};

export default VerifyEmailPage;
