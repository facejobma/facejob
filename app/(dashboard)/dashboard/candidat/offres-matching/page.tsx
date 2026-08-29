"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { ArrowRight, Briefcase, MapPin, Calendar, Building2, DollarSign, TrendingUp, CheckCircle2 } from "lucide-react";
import { getBrowserImageSrc } from "@/lib/images";

interface MatchedCriteria {
  sector: boolean;
  job_title: boolean | null;
  experience: boolean;
  skills?: string[] | null;
  languages?: string[] | null;
  location: boolean;
  contract_type: boolean;
}

interface MatchedOffer {
  match_percentage: number;
  matched_criteria: MatchedCriteria;
  offer: {
    id: number;
    titre: string;
    slug: string;
    description: string;
    contractType: string | null;
    location: string | null;
    salary_min: number | null;
    salary_max: number | null;
    currency?: string | null;
    date_fin: string | null;
    experience_required: number | null;
    required_skills?: string[] | null;
    required_languages?: string[] | null;
    benefits?: string[] | null;
    entreprise?: { id: number | null; company_name: string | null; logo: string | null } | null;
    sector?: { id: number | null; name: string | null } | null;
    job?: { id: number | null; name: string | null } | null;
  };
}

const asStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
};

function MatchBadge({ percentage }: { percentage: number }) {
  const score = Math.max(0, Math.min(100, Math.round(percentage || 0)));
  const color = score >= 70 ? "#059669" : score >= 40 ? "#d97706" : "#e11d48";
  const label = score >= 70 ? "Excellent" : score >= 40 ? "Bon match" : "À améliorer";
  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5" aria-label={`Compatibilité ${score}%`}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full p-1" style={{ background: `conic-gradient(${color} ${score * 3.6}deg, #e2e8f0 0deg)` }}>
        <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-base font-bold text-slate-900">{score}%</div>
      </div>
      <span className="text-[10px] font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

function CompanyLogo({ logo, name }: { logo: string | null; name: string }) {
  const [imgError, setImgError] = useState(false);
  const logoSrc = getBrowserImageSrc(logo);
  if (logoSrc && !imgError) {
    return (
      <img
        src={logoSrc}
        alt={name}
        className="w-full h-full object-contain p-1"
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-lg font-bold">
      {name?.[0]?.toUpperCase() || "E"}
    </div>
  );
}

export default function OffresMatchingPage() {
  const [offers, setOffers] = useState<MatchedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = Cookies.get("authToken");
    fetch(`${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/candidate/matching-offers`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((payload) => {
        const data = payload?.data ?? payload;
        setOffers(Array.isArray(data) ? data.filter((item: any) => item?.offer?.id) : []);
      })
      .catch(() => setError("Impossible de charger les offres correspondantes."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="flex items-center gap-4">
       
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 shadow-sm">
            <TrendingUp className="text-white w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Matching personnalisé</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">Offres pour moi</h1>
            <p className="text-slate-500 text-sm">
              {!loading && !error ? `${offers.length} offre${offers.length > 1 ? "s" : ""} correspondante${offers.length > 1 ? "s" : ""}` : "Les offres les plus adaptées à votre profil"}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
          {loading && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Chargement des offres correspondantes">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 shadow-sm">{error}</div>
          )}

          {!loading && !error && offers.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100"><Briefcase className="h-7 w-7 text-emerald-600" /></div>
              <p className="text-base font-semibold text-slate-800">Aucune offre correspondante pour le moment.</p>
              <p className="mt-1 text-sm text-slate-500">Complétez votre profil pour obtenir de meilleures suggestions.</p>
              <Link href="/dashboard/candidat/profile" className="mt-5 inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Compléter mon profil</Link>
            </div>
          )}

          {!loading && !error && offers.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {offers.map((item) => {
                const { offer, match_percentage } = item;
                const matched_criteria = item.matched_criteria || {
                  sector: false, job_title: null, experience: false, skills: [], languages: [], location: false, contract_type: false,
                };
                const dateFin = offer.date_fin
                  ? new Date(offer.date_fin).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                  : null;
                const currency = offer.currency || "MAD";
                const salary = offer.salary_min != null && offer.salary_max != null
                  ? `${Number(offer.salary_min).toLocaleString()} - ${Number(offer.salary_max).toLocaleString()} ${currency}`
                  : offer.salary_min != null
                  ? `Dès ${Number(offer.salary_min).toLocaleString()} ${currency}`
                  : offer.salary_max != null
                  ? `Jusqu’à ${Number(offer.salary_max).toLocaleString()} ${currency}`
                  : null;
                const companyName = offer.entreprise?.company_name || "Entreprise confidentielle";
                const requiredSkills = asStringList(offer.required_skills);
                const requiredLanguages = asStringList(offer.required_languages);
                const benefits = asStringList(offer.benefits);
                const matchedLabels = [
                  matched_criteria.sector && "Secteur",
                  matched_criteria.job_title && "Métier",
                  matched_criteria.experience && "Expérience",
                  matched_criteria.location && "Localisation",
                  matched_criteria.contract_type && "Contrat",
                  (matched_criteria.skills?.length ?? 0) > 0 && `${matched_criteria.skills?.length} compétence${(matched_criteria.skills?.length ?? 0) > 1 ? "s" : ""}`,
                  (matched_criteria.languages?.length ?? 0) > 0 && "Langues",
                ].filter((label): label is string => Boolean(label));

                return (
                  <Link
                    key={offer.id}
                    href={`/dashboard/candidat/offres/${offer.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
                  >
                    {/* Card Header with logo */}
                    <div className="flex items-start gap-3 border-b border-slate-100 bg-gradient-to-br from-emerald-50/60 via-white to-white p-5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <CompanyLogo logo={offer.entreprise?.logo || null} name={companyName} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="line-clamp-2 text-base font-bold leading-6 text-slate-950 transition-colors group-hover:text-emerald-700">
                          {offer.titre}
                        </h3>
                        <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                          <Building2 className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{companyName}</span>
                        </div>
                      </div>
                      <MatchBadge percentage={match_percentage} />
                    </div>

                    {/* Card Body */}
                    <div className="flex flex-1 flex-col gap-4 p-5">
                      {/* Tags */}
                      <div className="flex max-h-20 flex-wrap gap-1.5 overflow-hidden">
                        {offer.contractType && (
                          <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                            {offer.contractType}
                          </span>
                        )}
                        {offer.sector?.name && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {offer.sector.name}
                          </span>
                        )}
                        {offer.job?.name && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                            {offer.job.name}
                          </span>
                        )}
                        {offer.experience_required != null && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                            {offer.experience_required} an(s) d’expérience
                          </span>
                        )}
                        {requiredSkills.slice(0, 2).map((skill) => (
                          <span key={`skill-${offer.id}-${skill}`} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">{skill}</span>
                        ))}
                        {requiredLanguages.slice(0, 2).map((language) => (
                          <span key={`language-${offer.id}-${language}`} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100">{language}</span>
                        ))}
                        {benefits.slice(0, 2).map((benefit) => (
                          <span key={`benefit-${offer.id}-${benefit}`} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100">{benefit}</span>
                        ))}
                      </div>

                      {/* Info row */}
                      <div className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                        {offer.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                            <span>{offer.location}</span>
                          </div>
                        )}
                        {salary && (
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                            <span className="font-medium text-gray-700">{salary}</span>
                          </div>
                        )}
                        {dateFin && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                            <span>Expire le {dateFin}</span>
                          </div>
                        )}
                      </div>

                      {/* Matched criteria */}
                      <div className="mt-auto rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-900"><CheckCircle2 className="h-3.5 w-3.5" />Points forts du matching</p>
                        <div className="flex flex-wrap gap-1.5">
                          {matchedLabels.length > 0 ? matchedLabels.map((label) => (
                            <span key={`${offer.id}-${label}`} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">{label}</span>
                          )) : <span className="text-xs text-slate-500">Compatibilité calculée à partir de votre profil global.</span>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-semibold text-emerald-700">
                        <span>Voir l'offre</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}
