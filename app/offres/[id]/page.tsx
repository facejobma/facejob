"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SafeHtmlDisplay from "@/components/SafeHtmlDisplay";
import {
  ArrowLeft, Briefcase, Building, MapPin, Calendar,
  Users, Share2, AlertCircle, CheckCircle, Eye
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

// Cache key for scroll position
const SCROLL_POSITION_KEY = 'facejob_scroll_position';

interface OfferDetail {
  id: number;
  titre: string;
  description: string;
  company_name: string;
  sector_name: string | null;
  job_name: string | null;
  location: string | null;
  contractType: string | null;
  date_debut: string | null;
  date_fin: string | null;
  created_at: string | null;
  sector_id: number;
  job_id: number | null;
  entreprise_id: number;
  salaire?: string;
  company_description?: string;
  is_verified?: string | boolean;
  applications_count?: number;
  views_count?: number;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string | null;
  experience_required?: number | null;
  required_skills?: string[] | null;
  required_languages?: string[] | null;
  benefits?: string[] | null;
}

const asStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
};

const OfferDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedOffers, setRelatedOffers] = useState<OfferDetail[]>([]);
  const [daysAgo, setDaysAgo] = useState(0);
  const offerId = params.id as string;

  useEffect(() => {
    const fetchOfferDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/offres/${offerId}`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) {
            const normalizedOffer: OfferDetail = {
              ...data,
              titre: data.titre || "Offre sans titre",
              description: data.description || "Aucune description disponible.",
              company_name: data.company_name || "Entreprise confidentielle",
              required_skills: asStringList(data.required_skills),
              required_languages: asStringList(data.required_languages),
              benefits: asStringList(data.benefits),
            };
            setOffer(normalizedOffer);
            const allRes = await fetch(`${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/offres`, {
              headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            if (allRes.ok) {
              const result = await allRes.json();
              const all = Array.isArray(result.data) ? result.data : [];
              setRelatedOffers(all.filter((o: OfferDetail) => o?.id && o.id !== normalizedOffer.id && o.sector_id === normalizedOffer.sector_id).slice(0, 3));
            }
          } else {
            toast.error("Offre non trouvée");
            router.push("/offres");
          }
        } else throw new Error();
      } catch {
        toast.error("Erreur lors du chargement de l'offre");
        router.push("/offres");
      } finally {
        setLoading(false);
      }
    };
    if (offerId) fetchOfferDetail();
  }, [offerId, router]);

  useEffect(() => {
    if (offer?.created_at) {
      const created = new Date(offer.created_at);
      if (!Number.isNaN(created.getTime())) {
        const diff = Math.max(0, new Date().getTime() - created.getTime());
        setDaysAgo(Math.min(Math.floor(diff / 86400000), 365));
      }
    }
  }, [offer?.created_at]);

  const handleApply = async () => {
    const dashboardOfferUrl = `/dashboard/candidat/offres/${offerId}`;
    const loginUrl = `/auth/login-candidate?returnUrl=${encodeURIComponent(dashboardOfferUrl)}`;

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauthReturnUrl', dashboardOfferUrl);
    }

    // Vérifier si l'utilisateur est connecté en vérifiant le token
    try {
      const authToken = document.cookie.split('authToken=')[1]?.split(';')[0]?.replace(/['"]/g, '');
      
      if (!authToken) {
        // Pas de token, rediriger vers la connexion avec returnUrl vers la page de détail de l'offre
        router.push(loginUrl);
        return;
      }
      
      const response = await fetch(`${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/candidate-profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Utilisateur connecté, rediriger vers la page de détail de l'offre dans le dashboard
        sessionStorage.removeItem('oauthReturnUrl');
        router.push(dashboardOfferUrl);
      } else {
        // Utilisateur non connecté, rediriger vers la page de connexion
        router.push(loginUrl);
      }
    } catch (error) {
      // En cas d'erreur, rediriger vers la page de connexion par sécurité
      router.push(loginUrl);
    }
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      try { await navigator.share({ title: offer?.titre, url: window.location.href }); } catch {}
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié !");
    }
  };

  const formatDate = (d?: string | null) => {
    if (!d) return "Non renseignée";
    const date = new Date(d);
    return Number.isNaN(date.getTime()) ? "Non renseignée" : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) return (
    <>
      <NavBar />
      <div className="min-h-screen bg-optional1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
      <Footer />
    </>
  );

  if (!offer) return (
    <>
      <NavBar />
      <div className="min-h-screen bg-optional1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-secondary mb-3">Offre non trouvée</h2>
          <p className="font-body text-gray-600 mb-8">Cette offre n'existe pas ou a été supprimée.</p>
          <Link href="/offres" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-green-600 text-white rounded-xl font-accent font-semibold hover:from-green-600 hover:to-primary transition-all duration-300 shadow-lg">
            <ArrowLeft className="h-4 w-4" />
            Retour aux offres
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-slate-50">

        {/* Hero banner */}
        <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-emerald-50/50 to-white pb-12 pt-20">
          {/* Background decorations */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          <div className="container mx-auto px-4 max-w-6xl relative">
            <button onClick={() => router.back()} className="group flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-all duration-300 mb-8 font-body">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
              Retour aux offres
            </button>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <div className="h-1 bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-400" />
              <div className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex items-start gap-5 flex-1">
                   <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 shadow-sm">
                     <Building className="h-7 w-7 text-emerald-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="mb-2 text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">{offer.titre}</h1>
                    <p className="mb-4 text-base font-semibold text-slate-600">{offer.company_name || "Entreprise confidentielle"}</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {offer.location && (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full font-medium font-body border border-purple-100">
                          <MapPin className="h-3.5 w-3.5" />{offer.location}
                        </span>
                      )}
                      {offer.contractType && (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full font-medium font-body border border-orange-100">
                          <Calendar className="h-3.5 w-3.5" />{offer.contractType}
                        </span>
                      )}
                      {offer.sector_name && (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium font-body border border-blue-100">
                          <Briefcase className="h-3.5 w-3.5" />{offer.sector_name}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium font-body">
                        Publié il y a {daysAgo}j
                      </span>
                    </div>

                    {/* Stats inline */}
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-body">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </div>
                        <span><span className="font-semibold text-gray-900">{offer.views_count || 0}</span> vues</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-body">
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                          <Users className="h-4 w-4 text-purple-600" />
                        </div>
                        <span><span className="font-semibold text-gray-900">{offer.applications_count || 0}</span> candidatures</span>
                      </div>
                      {offer.is_verified && (
                        <div className="flex items-center gap-2 text-sm text-green-600 font-body font-medium">
                          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <span>Offre vérifiée</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:w-64 flex-shrink-0">
                  <button
                    onClick={handleApply}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    Postuler maintenant
                    <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button onClick={handleShare} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                    <Share2 className="h-4 w-4" /> Partager l'offre
                  </button>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main */}
            <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">

              {/* Description */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-heading text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  Description du poste
                </h2>
                <SafeHtmlDisplay html={offer.description} className="font-body text-gray-600 leading-relaxed prose prose-sm max-w-none" />
              </div>

              {/* Details */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-heading text-lg font-bold text-secondary mb-5 flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  Détails de l'offre
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Date de début", value: offer.date_debut ? formatDate(offer.date_debut) : null, icon: <Calendar className="h-4 w-4 text-primary" /> },
                    { label: "Date de fin", value: offer.date_fin ? formatDate(offer.date_fin) : null, icon: <Calendar className="h-4 w-4 text-primary" /> },
                    { label: "Secteur", value: offer.sector_name, icon: <Briefcase className="h-4 w-4 text-primary" /> },
                    { label: "Métier", value: offer.job_name, icon: <Users className="h-4 w-4 text-primary" /> },
                  ].map(({ label, value, icon }) => value ? (
                    <div key={label} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        {icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-500 text-xs mb-1 font-body font-medium">{label}</p>
                        <p className="font-semibold text-gray-900 font-body text-sm leading-snug break-words">{value}</p>
                      </div>
                    </div>
                  ) : null)}
                </div>
              </div>

              {(offer.salary_min != null || offer.salary_max != null || offer.experience_required != null || (offer.required_skills?.length ?? 0) > 0 || (offer.required_languages?.length ?? 0) > 0 || (offer.benefits?.length ?? 0) > 0) && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-5 flex items-center gap-2 font-heading text-lg font-bold text-secondary">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><CheckCircle className="h-4 w-4 text-primary" /></div>
                    Conditions et critères
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(offer.salary_min != null || offer.salary_max != null) && (
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                        <p className="mb-1 text-xs font-medium text-emerald-700">Rémunération</p>
                        <p className="font-semibold text-emerald-950">
                          {offer.salary_min != null && offer.salary_max != null
                            ? `${Number(offer.salary_min).toLocaleString("fr-FR")} – ${Number(offer.salary_max).toLocaleString("fr-FR")} ${offer.currency || "MAD"}`
                            : offer.salary_min != null
                            ? `À partir de ${Number(offer.salary_min).toLocaleString("fr-FR")} ${offer.currency || "MAD"}`
                            : `Jusqu’à ${Number(offer.salary_max).toLocaleString("fr-FR")} ${offer.currency || "MAD"}`}
                        </p>
                      </div>
                    )}
                    {offer.experience_required != null && (
                      <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                        <p className="mb-1 text-xs font-medium text-amber-700">Expérience requise</p>
                        <p className="font-semibold text-amber-950">{offer.experience_required} an(s)</p>
                      </div>
                    )}
                  </div>
                  {[
                    { label: "Compétences", values: offer.required_skills ?? [], className: "bg-sky-50 text-sky-700 border-sky-100" },
                    { label: "Langues", values: offer.required_languages ?? [], className: "bg-violet-50 text-violet-700 border-violet-100" },
                    { label: "Avantages", values: offer.benefits ?? [], className: "bg-teal-50 text-teal-700 border-teal-100" },
                  ].map((group) => group.values.length > 0 && (
                    <div key={group.label} className="mt-5">
                      <p className="mb-2 text-sm font-semibold text-slate-800">{group.label}</p>
                      <div className="flex flex-wrap gap-2">{group.values.map((value) => <span key={`${group.label}-${value}`} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${group.className}`}>{value}</span>)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6 order-1 lg:order-2">

              {/* Company */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
                <h3 className="font-heading text-xl font-bold text-secondary mb-5 flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  À propos de l'entreprise
                </h3>
                <div className="mb-5 flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-green-100/50 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Building className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-secondary text-lg">{offer.company_name}</p>
                    <p className="text-sm text-gray-600 font-body">{offer.sector_name}</p>
                  </div>
                </div>
                <p className="font-body text-sm text-gray-600 leading-relaxed mb-6">
                  {offer.company_description || "Les informations détaillées de l’entreprise sont communiquées aux candidats dans le cadre du processus de candidature."}
                </p>

                {/* Quick info */}
                <div className="space-y-2 pt-5 border-t-2 border-gray-100">
                  {[
                    { label: "Secteur", value: offer.sector_name, icon: <Briefcase className="h-3.5 w-3.5 text-primary" /> },
                    { label: "Métier", value: offer.job_name, icon: <Users className="h-3.5 w-3.5 text-primary" /> },
                    { label: "Localisation", value: offer.location, icon: <MapPin className="h-3.5 w-3.5 text-primary" /> },
                    { label: "Type de contrat", value: offer.contractType, icon: <Calendar className="h-3.5 w-3.5 text-primary" /> },
                  ].map(({ label, value, icon }) => value ? (
                    <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                        {icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 font-body mb-0.5">{label}</p>
                        <p className="text-sm font-bold text-secondary font-body leading-snug break-words">{value}</p>
                      </div>
                    </div>
                  ) : null)}
                </div>
              </div>
            </div>
          </div>

          {/* Related offers */}
          {relatedOffers.length > 0 && (
            <div className="mt-12">
              <h2 className="font-heading text-2xl font-bold text-secondary mb-6">Offres similaires</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedOffers.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/offres/${rel.id}`}
                    className="group flex cursor-pointer flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-green-100/50 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Building className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading text-base font-bold text-secondary line-clamp-2 group-hover:text-primary transition-colors mb-1">{rel.titre}</h3>
                        <p className="font-body text-sm text-gray-600 truncate">{rel.company_name}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {rel.location && (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium font-body border border-purple-100">
                          <MapPin className="h-3 w-3" />{rel.location}
                        </span>
                      )}
                      {rel.contractType && (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full font-medium font-body border border-orange-100">
                          <Calendar className="h-3 w-3" />{rel.contractType}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OfferDetailPage;
