"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { resendVerification } from "@/lib/api";

const ResendVerificationPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Veuillez entrer votre adresse email");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    setIsLoading(true);

    try {
      await resendVerification(email.trim());
      setEmailSent(true);
      toast.success("Email de vérification envoyé !");
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'envoi de l'email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="pt-24">
        <section className="border-b border-gray-100 bg-gradient-to-b from-green-50/70 to-white">
          <div className="container mx-auto max-w-5xl px-4 py-10 sm:py-14">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                {emailSent ? <CheckCircle2 className="h-7 w-7" /> : <Mail className="h-7 w-7" />}
              </div>

              <h1 className="mb-3 text-3xl font-bold text-secondary sm:text-4xl">
                {emailSent ? "Email envoyé" : "Renvoyer l'email de vérification"}
              </h1>
              <p className="max-w-xl text-base leading-7 text-gray-600">
                {emailSent
                  ? "Un nouveau lien de vérification a été envoyé à votre adresse email candidat."
                  : "Cette page est réservée aux comptes candidats. Entrez votre adresse email pour recevoir un nouveau lien de vérification."}
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-4 py-10 sm:py-14">
          {emailSent ? (
            <div className="max-w-2xl">
              <div className="mb-6 border-l-4 border-green-500 bg-green-50 px-5 py-4">
                <p className="text-sm font-medium text-green-900">
                  Email envoyé à : <span className="font-bold">{email}</span>
                </p>
              </div>

              <div className="mb-8 space-y-2 text-sm leading-6 text-gray-600">
                <p>Vérifiez votre boîte de réception et cliquez sur le lien de vérification.</p>
                <p>N'oubliez pas de vérifier vos spams si vous ne recevez pas l'email.</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Renvoyer à une autre adresse
                </Button>

                <Button
                  onClick={() => router.push("/")}
                  variant="ghost"
                  className="hover:bg-gray-100"
                >
                  Retour à l'accueil
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
              <div>
                <label className="mb-3 block text-sm font-medium text-secondary">
                  Type de compte
                </label>
                <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className="rounded-lg border-2 border-primary bg-primary/10 p-4 text-left text-primary transition-colors"
                    aria-pressed="true"
                  >
                    <span className="block font-semibold">Candidat</span>
                    <span className="mt-1 block text-xs text-gray-600">Chercheur d'emploi</span>
                  </button>

                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed rounded-lg border-2 border-gray-200 bg-gray-50 p-4 text-left text-gray-400 opacity-70"
                    aria-disabled="true"
                  >
                    <span className="block font-semibold">Entreprise</span>
                    <span className="mt-1 block text-xs text-gray-500">Désactivé pour le moment</span>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-secondary">
                  Adresse email candidat
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="h-12 max-w-xl border-gray-300 focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-white hover:bg-primary-1"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                    Envoi en cours...
                  </span>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Renvoyer l'email
                  </>
                )}
              </Button>

              <p className="text-sm text-gray-600">
                Vous vous souvenez de votre mot de passe ?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/auth/login-candidate")}
                  className="font-medium text-primary hover:text-primary-1 hover:underline"
                >
                  Se connecter
                </button>
              </p>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ResendVerificationPage;
