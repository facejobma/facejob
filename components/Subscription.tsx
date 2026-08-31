"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import { apiRequest, handleApiError } from "@/lib/apiUtils";

export default function Subscription() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError("Veuillez saisir une adresse email valide.");
      return;
    }

    setEmailError("");
    setIsLoading(true);
    try {
      const result = await apiRequest("/api/v1/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail, source: "homepage_subscription" }),
      });

      if (result.success) {
        setEmail("");
        const responseData = result.data ?? {};
        toast.success(responseData.already_subscribed ? "Vous êtes déjà abonné à notre newsletter." : responseData.reactivated ? "Votre abonnement a été réactivé." : "Votre inscription à la newsletter est confirmée.");
      } else {
        const validationMessage = result.errors?.email?.[0] || result.details?.email?.[0];
        setEmailError(validationMessage || result.error || "Impossible de valider votre inscription.");
        handleApiError(result, toast);
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setEmailError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-700 via-emerald-700 to-emerald-900 px-6 py-10 shadow-[0_20px_55px_rgba(5,150,105,0.16)] sm:px-10 lg:grid lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-12 lg:px-14 lg:py-12">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-lime-300/20 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-emerald-300/15 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-100"><Sparkles className="h-4 w-4 text-lime-300" aria-hidden="true" /> Restez informé</span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">Les nouvelles opportunités, directement dans votre boîte mail</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/85 sm:text-base">Recevez les actualités FaceJob et une sélection d’offres. Pas de contenu inutile.</p>
          </div>

          <form onSubmit={handleSubscribe} className="relative mt-7 lg:mt-0" noValidate>
            <label htmlFor="newsletter-email" className="sr-only">Adresse email</label>
            <div className={`flex flex-col gap-3 rounded-2xl bg-white p-2 shadow-xl shadow-emerald-950/10 ring-1 sm:flex-row ${emailError ? "ring-red-300" : "ring-white/70 focus-within:ring-lime-300"}`}>
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <Mail className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                <input id="newsletter-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setEmailError(""); }} disabled={isLoading} placeholder="vous@exemple.com" autoComplete="email" aria-invalid={Boolean(emailError)} aria-describedby={emailError ? "newsletter-error" : undefined} className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed" />
              </div>
              <button type="submit" disabled={isLoading} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                {isLoading ? "Inscription…" : "S’inscrire"}<ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {emailError && <p id="newsletter-error" role="alert" className="mt-2 text-sm font-medium text-red-100">{emailError}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
