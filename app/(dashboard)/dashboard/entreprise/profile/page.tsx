"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ProfileEntrepHeader from "@/components/ProfileEntrepriseHeader";
import BioEntrepSection from "@/components/BioEntrep";
import ContactSection from "@/components/contactSection";
import Cookies from "js-cookie";
import { useUser } from "@/hooks/useUser";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface CompanyProfileData {
  id: number;
  company_name: string;
  sector_name: string;
  site_web: string;
  linkedin: string;
  phone: string;
  email: string;
  email_verified_at: string | null;
  is_verified: boolean;
  creationDate: string;
  adresse: string;
  description: string;
  image: string | null;
  logo: string | null;
}

const CompanyProfile = () => {
  const { user, isLoading: userLoading } = useUser();
  const [companyProfile, setCompanyProfile] =
    useState<CompanyProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchCompanyData = useCallback(
    async (signal?: AbortSignal) => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(null);
      const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

      try {
        const response = await fetch(`/api/v1/enterprise/${user.id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          signal,
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(
            payload?.message || "Impossible de charger le profil entreprise.",
          );
        }
        const companyData = payload?.data ?? payload;
        if (!companyData?.id) throw new Error("Réponse invalide du serveur.");

        setCompanyProfile({
          id: companyData.id,
          company_name: companyData.company_name || "Entreprise",
          sector_name: companyData.sector?.name || "Secteur non renseigné",
          site_web: companyData.site_web || "",
          linkedin: companyData.linkedin || "",
          phone: companyData.phone || "",
          email: companyData.email || "",
          email_verified_at: companyData.email_verified_at || null,
          is_verified:
            companyData.is_verified === true ||
            companyData.is_verified === 1 ||
            String(companyData.is_verified).toLowerCase() === "accepted",
          creationDate: companyData.created_at?.split("T")[0] || "",
          adresse: companyData.adresse || "",
          description: companyData.description || "",
          image: companyData.image || null,
          logo: companyData.logo || companyData.image || null,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        const message =
          error instanceof Error
            ? error.message
            : "Impossible de charger le profil entreprise.";
        console.error("Error fetching company data:", error);
        setLoadError(message);
        setCompanyProfile(null);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    if (userLoading) return;
    const controller = new AbortController();
    void fetchCompanyData(controller.signal);
    return () => controller.abort();
  }, [fetchCompanyData, userLoading]);

  const profileStats = useMemo(() => {
    if (!companyProfile) return { completed: 0, percentage: 0 };
    const values = [
      companyProfile.description,
      companyProfile.site_web,
      companyProfile.linkedin,
      companyProfile.phone,
      companyProfile.adresse,
      companyProfile.logo,
    ];
    const completed = values.filter((value) => Boolean(value?.trim?.())).length;
    return {
      completed,
      percentage: Math.round((completed / values.length) * 100),
    };
  }, [companyProfile]);

  if (userLoading || loading) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
        <div className="text-center">
          <p className="font-semibold text-slate-900">
            Chargement du profil entreprise
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Récupération de vos informations…
          </p>
        </div>
      </div>
    );
  }

  if (loadError || !companyProfile) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-950">
          Profil indisponible
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {loadError || "Votre profil n'a pas pu être récupéré."}
        </p>
        <button
          type="button"
          onClick={() => void fetchCompanyData()}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <RefreshCw className="h-4 w-4" /> Réessayer
        </button>
      </div>
    );
  }

  const accountAge = companyProfile.creationDate
    ? Math.max(
        0,
        new Date().getFullYear() -
          new Date(`${companyProfile.creationDate}T12:00:00`).getFullYear(),
      )
    : 0;

  const verification = !companyProfile.email_verified_at
    ? {
        icon: AlertTriangle,
        title: "Email non vérifié",
        text: "Vérifiez votre adresse email pour sécuriser le compte et activer toutes les fonctionnalités.",
        classes: "border-amber-200 bg-amber-50 text-amber-900",
        iconClasses: "bg-amber-100 text-amber-700",
      }
    : !companyProfile.is_verified
      ? {
          icon: Sparkles,
          title: "Profil en cours de vérification",
          text: "Notre équipe examine actuellement les informations de votre entreprise.",
          classes: "border-blue-200 bg-blue-50 text-blue-900",
          iconClasses: "bg-blue-100 text-blue-700",
        }
      : {
          icon: CheckCircle2,
          title: "Entreprise vérifiée",
          text: "Votre profil est validé et toutes les fonctionnalités sont disponibles.",
          classes: "border-emerald-200 bg-emerald-50 text-emerald-900",
          iconClasses: "bg-emerald-100 text-emerald-700",
        };
  const VerificationIcon = verification.icon;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 p-5 text-white shadow-lg shadow-emerald-100 sm:p-7">
        <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-white/10" />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                Espace entreprise
              </p>
              <h1 className="mt-1 break-words text-2xl font-bold sm:text-3xl">
                Profil de {companyProfile.company_name}
              </h1>
              <p className="mt-1 text-sm text-emerald-50">
                Gérez votre identité, votre présentation et vos coordonnées.
              </p>
            </div>
          </div>
          <div className="w-full max-w-sm rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="text-emerald-50">Profil complété</span>
              <strong>{profileStats.percentage}%</strong>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/15">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${profileStats.percentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-emerald-100">
              {profileStats.completed} informations sur 6 renseignées
            </p>
          </div>
        </div>
      </section>

      <div
        className={`flex items-start gap-3 rounded-2xl border p-4 shadow-sm ${verification.classes}`}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${verification.iconClasses}`}
        >
          <VerificationIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold">{verification.title}</p>
          <p className="mt-0.5 text-sm opacity-90">{verification.text}</p>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            icon: BadgeCheck,
            value: `${profileStats.percentage}%`,
            label: "Profil complété",
            color: "text-emerald-700 bg-emerald-50",
          },
          {
            icon: Building2,
            value:
              companyProfile.sector_name !== "Secteur non renseigné"
                ? "Renseigné"
                : "À compléter",
            label: "Secteur",
            color: "text-blue-700 bg-blue-50",
          },
          {
            icon: CalendarDays,
            value:
              accountAge === 0
                ? "Cette année"
                : `${accountAge} an${accountAge > 1 ? "s" : ""}`,
            label: "Ancienneté du compte",
            color: "text-violet-700 bg-violet-50",
          },
          {
            icon: MapPin,
            value: companyProfile.adresse ? "Renseignée" : "À compléter",
            label: "Localisation",
            color: "text-amber-700 bg-amber-50",
          },
        ].map(({ icon: Icon, value, label, color }) => (
          <div
            key={label}
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <p className="mt-3 break-words text-lg font-bold text-slate-950">
              {value}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <h2 className="font-bold text-slate-950">
            Informations de l'entreprise
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Ces informations apparaissent sur vos offres et votre profil public.
          </p>
        </div>
        <div className="space-y-5 p-4 sm:p-6">
          <ProfileEntrepHeader
            id={companyProfile.id}
            company_name={companyProfile.company_name}
            companyLogoUrl={companyProfile.logo || undefined}
            sector_name={companyProfile.sector_name}
            website={companyProfile.site_web}
            creationDate={companyProfile.creationDate}
            siegeSocial={companyProfile.adresse}
            image={companyProfile.image || undefined}
            onProfileUpdate={() => void fetchCompanyData()}
          />
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <BioEntrepSection
              id={companyProfile.id}
              bio={companyProfile.description}
              onUpdated={() => {
                toast.success("Présentation mise à jour");
                void fetchCompanyData();
              }}
            />
            <ContactSection
              id={companyProfile.id}
              email={companyProfile.email}
              phone={companyProfile.phone}
              linkedin={companyProfile.linkedin}
              adresse={companyProfile.adresse}
              onUpdated={() => {
                toast.success("Coordonnées mises à jour");
                void fetchCompanyData();
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CompanyProfile;
