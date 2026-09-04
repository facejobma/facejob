"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  ArrowRight,
  Briefcase,
  Check,
  MapPin,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";

interface MatchedCandidate {
  match_percentage: number;
  matched_criteria: {
    sector: boolean;
    job_title: boolean | null;
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
    preferred_contract_type: string | null;
    skills: string[];
    languages: string[];
  };
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";
const cleanList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim() !== "",
      )
    : [];

function MatchScore({ value }: { value: number }) {
  const score = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  const tone =
    score >= 70
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : score >= 40
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-50 text-slate-600";
  return (
    <div
      className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border ${tone}`}
    >
      <strong className="text-base leading-none">{score}%</strong>
      <span className="mt-1 text-[9px] font-semibold uppercase tracking-wide">
        match
      </span>
    </div>
  );
}

export default function MatchingCandidates({
  offreId,
  offreTitre,
}: {
  offreId: number;
  offreTitre?: string;
}) {
  const router = useRouter();
  const [candidates, setCandidates] = useState<MatchedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadCandidates = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true);
      setError(null);
      setCandidates([]);
      try {
        const token = Cookies.get("authToken")?.replace(/["']/g, "");
        if (!token)
          throw new Error("Votre session a expiré. Veuillez vous reconnecter.");
        const response = await fetch(
          `/api/v1/entreprise/matching-candidates?offre_id=${offreId}`,
          {
            signal,
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );
        const payload = await response.json().catch(() => null);
        if (!response.ok)
          throw new Error(
            payload?.message ||
              "Impossible de charger les profils correspondants.",
          );
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        setCandidates(
          rows
            .filter((row: MatchedCandidate) => row?.candidate?.id)
            .map((row: MatchedCandidate) => ({
              ...row,
              candidate: {
                ...row.candidate,
                skills: cleanList(row.candidate.skills),
                languages: cleanList(row.candidate.languages),
              },
            })),
        );
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError")
          return;
        setError(
          caught instanceof Error
            ? caught.message
            : "Une erreur inattendue est survenue.",
        );
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [offreId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadCandidates(controller.signal);
    return () => controller.abort();
  }, [loadCandidates, reloadKey]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <Users className="h-5 w-5 text-emerald-600" />
          </span>
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-900">
              Profils recommandés
            </h2>
            <p className="truncate text-xs text-slate-500">
              {offreTitre || "Offre sélectionnée"}
            </p>
          </div>
        </div>
        {!loading && !error && (
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {candidates.length} résultat{candidates.length > 1 ? "s" : ""}
          </span>
        )}
      </header>

      <div className="p-4 sm:p-5">
        {loading && (
          <div className="space-y-3" role="status">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
            <span className="sr-only">Chargement des candidats</span>
          </div>
        )}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm ring-1 ring-red-200 hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </button>
          </div>
        )}
        {!loading && !error && candidates.length === 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Sparkles className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              Aucun profil disponible
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Aucun candidat actif, disponible et suffisamment renseigné ne
              correspond actuellement à cette offre.
            </p>
          </div>
        )}
        {!loading && !error && candidates.length > 0 && (
          <div className="space-y-3">
            {candidates.map(
              ({ candidate, match_percentage, matched_criteria }) => {
                const skills = candidate.skills.slice(0, 3);
                const available =
                  candidate.availability_status === "available" ||
                  candidate.availability_status === "disponible";
                return (
                  <button
                    type="button"
                    key={candidate.id}
                    onClick={() =>
                      router.push(
                        `/dashboard/entreprise/matching-candidates/${candidate.id}?offre_id=${offreId}`,
                      )
                    }
                    className="group w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-sm font-bold text-white shadow-sm">
                        {initials(candidate.full_name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-slate-900">
                              {candidate.full_name || "Candidat"}
                            </h3>
                            <p className="mt-0.5 truncate text-sm text-slate-500">
                              {[candidate.job_title, candidate.sector]
                                .filter(Boolean)
                                .join(" · ") || "Profil professionnel"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${available ? "bg-emerald-500" : "bg-slate-400"}`}
                              />
                              {available ? "Disponible" : "Indisponible"}
                            </span>
                            <MatchScore value={match_percentage} />
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                          {candidate.years_of_experience != null && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1">
                              <Briefcase className="h-3 w-3" />
                              {candidate.years_of_experience} an
                              {candidate.years_of_experience > 1 ? "s" : ""}{" "}
                              d’expérience
                            </span>
                          )}
                          {matched_criteria.location && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-emerald-700">
                              <MapPin className="h-3 w-3" />
                              Localisation compatible
                            </span>
                          )}
                          {matched_criteria.contract_type &&
                            candidate.preferred_contract_type && (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-blue-700">
                                <Check className="h-3 w-3" />
                                {candidate.preferred_contract_type}
                              </span>
                            )}
                        </div>
                        {skills.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {skills.map((skill) => (
                              <span
                                key={skill}
                                className="max-w-[180px] truncate rounded-full border border-emerald-100 bg-emerald-50/70 px-2.5 py-1 text-xs font-medium text-emerald-700"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.skills.length > 3 && (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                                +{candidate.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="mt-4 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600 sm:mt-0" />
                    </div>
                  </button>
                );
              },
            )}
          </div>
        )}
      </div>
    </section>
  );
}
