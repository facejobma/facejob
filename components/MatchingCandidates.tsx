"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface MatchedCandidate {
  match_percentage: number;
  matched_criteria: {
    sector: boolean;
    job_title: boolean;
    experience: boolean;
    skills: string[];
    languages: string[];
    location: boolean;
    contract_type: boolean;
  };
  candidate: {
    id: number;
    full_name: string;
    image: string | null;
    job_title: string | null;
    sector: string | null;
    years_of_experience: number | null;
    availability_status: string;
    skills: string[];
    languages: string[];
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
    <span className={`inline-flex items-center justify-center w-14 h-14 rounded-full border-2 text-lg font-bold flex-shrink-0 ${colorClass}`}>
      {percentage}%
    </span>
  );
}

function AvailabilityBadge({ status }: { status: string }) {
  const getStatusInFrench = (s: string): string => {
    switch (s) {
      case 'available':
        return 'Disponible';
      case 'unavailable':
        return 'Non disponible';
      default:
        return s;
    }
  };
  
  const frenchStatus = getStatusInFrench(status);
  const isAvailable = status === "available" || status === "disponible";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isAvailable ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-50 text-gray-500 border border-gray-200"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-gray-400"}`} />
      {frenchStatus}
    </span>
  );
}

interface MatchingCandidatesProps {
  offreId: number;
  offreTitre?: string;
}

export default function MatchingCandidates({ offreId, offreTitre }: MatchingCandidatesProps) {
  const router = useRouter();
  const [candidates, setCandidates] = useState<MatchedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

  useEffect(() => {
    const token = Cookies.get("authToken");
    fetch(
      `${backendUrl}/api/v1/entreprise/matching-candidates?offre_id=${offreId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setCandidates(data.data ?? []);
      })
      .catch(() => {
        setError("Impossible de charger les candidats correspondants.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [offreId, backendUrl]);

  const handleCandidateClick = (candidateId: number) => {
    router.push(`/dashboard/entreprise/matching-candidates/${candidateId}?offre_id=${offreId}`);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-900">Candidats correspondants</h2>
          {offreTitre && (
            <p className="text-xs text-gray-500 truncate">Pour l'offre : {offreTitre}</p>
          )}
        </div>
      </div>

      <div className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {!loading && !error && candidates.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm">Aucun candidat correspondant pour le moment.</p>
          </div>
        )}

        {!loading && !error && candidates.length > 0 && (
          <div className="space-y-3">
            {candidates.map((item) => {
              const { candidate, match_percentage } = item;
              const visibleSkills = candidate.skills.slice(0, 3);
              const extraSkills = candidate.skills.length - 3;

              return (
                <button
                  key={candidate.id}
                  onClick={() => handleCandidateClick(candidate.id)}
                  className="w-full text-left flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors cursor-pointer"
                >
                  <MatchBadge percentage={match_percentage} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{candidate.full_name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {[candidate.job_title, candidate.sector].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <AvailabilityBadge status={candidate.availability_status} />
                    </div>

                    {candidate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {visibleSkills.map((skill) => (
                          <span key={skill} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {skill}
                          </span>
                        ))}
                        {extraSkills > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-500 border border-gray-100">
                            +{extraSkills}
                          </span>
                        )}
                      </div>
                    )}
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
