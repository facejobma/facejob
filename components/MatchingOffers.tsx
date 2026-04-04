"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";

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
  if (percentage >= 70) {
    colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
  } else if (percentage >= 40) {
    colorClass = "bg-orange-100 text-orange-700 border-orange-200";
  }

  return (
    <span
      className={`inline-flex items-center justify-center w-14 h-14 rounded-full border-2 text-lg font-bold flex-shrink-0 ${colorClass}`}
    >
      {percentage}%
    </span>
  );
}

export default function MatchingOffers() {
  const [offers, setOffers] = useState<MatchedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = Cookies.get("authToken");

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate/matching-offers`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setOffers(data.data ?? []);
      })
      .catch(() => {
        setError("Impossible de charger les offres correspondantes.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Offres correspondantes</h2>
          <p className="text-xs text-gray-500">Les offres les plus adaptées à votre profil</p>
        </div>
        <Link
          href="/dashboard/candidat/offres-matching"
          className="ml-auto text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline flex-shrink-0"
        >
          Voir tout →
        </Link>
      </div>

      <div className="p-6">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && offers.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-sm">Aucune offre correspondante pour le moment.</p>
          </div>
        )}

        {/* Offers list */}
        {!loading && !error && offers.length > 0 && (
          <div className="space-y-3">
            {offers.map((item) => {
              const { offer, match_percentage } = item;
              const dateFin = offer.date_fin
                ? new Date(offer.date_fin).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : null;

              return (
                <button
                  key={offer.id}
                  onClick={() => window.location.href = `/dashboard/candidat/offres-matching/${offer.id}`}
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors cursor-pointer w-full text-left"
                >
                  <MatchBadge percentage={match_percentage} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {offer.titre}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {offer.entreprise.company_name}
                        </p>
                      </div>
                      {dateFin && (
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          Expire le {dateFin}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {offer.contractType && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {offer.contractType}
                        </span>
                      )}
                      {offer.location && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {offer.location}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
