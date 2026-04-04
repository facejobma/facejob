"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { ArrowLeft, Briefcase, MapPin, Calendar, Building2, DollarSign, TrendingUp } from "lucide-react";

interface MatchedCriteria {
  sector: boolean;
  job_title: boolean;
  experience: boolean;
  skills: string[];
  languages: string[];
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
    currency: string;
    date_fin: string;
    entreprise: { id: number; company_name: string; logo: string | null };
    sector: { id: number; name: string };
    job: { id: number; name: string };
  };
}

function MatchBadge({ percentage }: { percentage: number }) {
  let colorClass = "bg-red-100 text-red-700 border-red-200";
  let barColor = "bg-red-400";
  if (percentage >= 70) { colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200"; barColor = "bg-emerald-500"; }
  else if (percentage >= 40) { colorClass = "bg-orange-100 text-orange-700 border-orange-200"; barColor = "bg-orange-400"; }
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <span className={`inline-flex items-center justify-center w-14 h-14 rounded-full border-2 text-lg font-bold ${colorClass}`}>
        {percentage}%
      </span>
      <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function CompanyLogo({ logo, name }: { logo: string | null; name: string }) {
  const [imgError, setImgError] = useState(false);
  if (logo && !imgError) {
    return (
      <img
        src={logo.startsWith("http") ? logo : `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${logo}`}
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
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate/matching-offers`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => setOffers(data.data ?? []))
      .catch(() => setError("Impossible de charger les offres correspondantes."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-md p-6">
        <div className="flex items-center gap-4">
       
          <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
            <TrendingUp className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Offres pour moi</h1>
            <p className="text-green-50 text-sm">
              {!loading && !error ? `${offers.length} offre${offers.length > 1 ? "s" : ""} correspondante${offers.length > 1 ? "s" : ""}` : "Les offres les plus adaptées à votre profil"}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          {!loading && !error && offers.length === 0 && (
            <div className="text-center py-16">
              <Briefcase className="w-14 h-14 mx-auto mb-4 text-gray-300" />
              <p className="text-base font-medium text-gray-600">Aucune offre correspondante pour le moment.</p>
              <p className="text-sm text-gray-400 mt-1">Complétez votre profil pour obtenir de meilleures suggestions.</p>
            </div>
          )}

          {!loading && !error && offers.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {offers.map((item) => {
                const { offer, match_percentage, matched_criteria } = item;
                const dateFin = offer.date_fin
                  ? new Date(offer.date_fin).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                  : null;
                const salary = offer.salary_min && offer.salary_max
                  ? `${Number(offer.salary_min).toLocaleString()} - ${Number(offer.salary_max).toLocaleString()} ${offer.currency}`
                  : offer.salary_min
                  ? `Dès ${Number(offer.salary_min).toLocaleString()} ${offer.currency}`
                  : null;

                return (
                  <Link
                    key={offer.id}
                    href={`/dashboard/candidat/offres/${offer.id}`}
                    className="group flex flex-col rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all bg-white overflow-hidden"
                  >
                    {/* Card Header with logo */}
                    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <CompanyLogo logo={offer.entreprise.logo} name={offer.entreprise.company_name} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors line-clamp-2 leading-tight">
                          {offer.titre}
                        </h3>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <Building2 className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{offer.entreprise.company_name}</span>
                        </div>
                      </div>
                      <MatchBadge percentage={match_percentage} />
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col gap-3">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {offer.contractType && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
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
                      </div>

                      {/* Info row */}
                      <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                        {offer.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span>{offer.location}</span>
                          </div>
                        )}
                        {salary && (
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="font-medium text-gray-700">{salary}</span>
                          </div>
                        )}
                        {dateFin && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span>Expire le {dateFin}</span>
                          </div>
                        )}
                      </div>

                      {/* Matched criteria */}
                      <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-gray-50">
                        {matched_criteria.sector && <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">✓ Secteur</span>}
                        {matched_criteria.job_title && <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">✓ Poste</span>}
                        {matched_criteria.experience && <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">✓ Expérience</span>}
                        {matched_criteria.location && <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">✓ Localisation</span>}
                        {matched_criteria.languages.length > 0 && <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">✓ Langues</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
