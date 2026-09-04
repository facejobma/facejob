"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  BriefcaseBusiness,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
import MatchingCandidates from "@/components/MatchingCandidates";
import { useUser } from "@/hooks/useUser";

interface Job {
  id: number;
  titre: string;
  sector?: { name?: string | null } | null;
  is_verified?: string | null;
  status?: "Pending" | "Accepted" | "Declined" | "Expired" | null;
  date_fin?: string | null;
}

function isMatchable(job: Job) {
  if ((job.status || job.is_verified) !== "Accepted") return false;
  if (!job.date_fin) return true;
  const end = new Date(`${job.date_fin.slice(0, 10)}T23:59:59`);
  return Number.isNaN(end.getTime()) || end >= new Date();
}

export default function MatchingCandidatesPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadJobs = useCallback(
    async (signal: AbortSignal) => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const token = Cookies.get("authToken")?.replace(/["']/g, "");
        if (!token)
          throw new Error("Votre session a expiré. Veuillez vous reconnecter.");
        const response = await fetch(`/api/v1/offres/by-owner/${user.id}`, {
          signal,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok)
          throw new Error(
            payload?.message || "Impossible de charger vos offres.",
          );
        const raw = payload?.data ?? payload;
        const accepted = Array.isArray(raw) ? raw.filter(isMatchable) : [];
        setJobs(accepted);
        setSelectedJob(
          (current) =>
            accepted.find((job: Job) => job.id === current?.id) ??
            accepted[0] ??
            null,
        );
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError")
          return;
        setJobs([]);
        setSelectedJob(null);
        setError(
          caught instanceof Error
            ? caught.message
            : "Une erreur inattendue est survenue.",
        );
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    if (userLoading) return;
    if (!user?.id) {
      setLoading(false);
      setError("Impossible d’identifier votre compte entreprise.");
      return;
    }
    const controller = new AbortController();
    void loadJobs(controller.signal);
    return () => controller.abort();
  }, [loadJobs, reloadKey, user?.id, userLoading]);

  if (loading || userLoading) {
    return (
      <div
        className="flex min-h-[420px] items-center justify-center"
        role="status"
      >
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
        <span className="sr-only">Chargement des offres</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 p-6 text-white shadow-lg shadow-emerald-950/10 sm:p-8">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Matching des candidats
            </h1>
            <p className="mt-2 text-sm leading-6 text-emerald-50 sm:text-base">
              Sélectionnez une offre active pour découvrir les profils
              disponibles qui correspondent le mieux à vos critères.
            </p>
          </div>
          <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <BriefcaseBusiness className="h-5 w-5 text-emerald-100" />
            <div>
              <p className="text-xl font-bold leading-none">{jobs.length}</p>
              <p className="mt-1 text-xs text-emerald-100">
                offre{jobs.length > 1 ? "s" : ""} éligible
                {jobs.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
            <RefreshCw className="h-5 w-5 text-red-600" />
          </div>
          <h2 className="mt-4 font-semibold text-slate-900">
            Chargement impossible
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
            {error}
          </p>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </button>
        </section>
      ) : jobs.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
            <BriefcaseBusiness className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-slate-900">
            Aucune offre active approuvée
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
            Le matching devient disponible dès qu’une offre est approuvée et que
            sa date de fin n’est pas dépassée.
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/entreprise/publier")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Publier une offre
            <ChevronRight className="h-4 w-4" />
          </button>
        </section>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(240px,320px)_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24">
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-sm font-semibold text-slate-900">
                Offre à analyser
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {jobs.length} offre
                {jobs.length > 1 ? "s disponibles" : " disponible"}
              </p>
            </div>
            <div className="max-h-[480px] space-y-1 overflow-y-auto p-2">
              {jobs.map((job) => {
                const selected = selectedJob?.id === job.id;
                return (
                  <button
                    type="button"
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    aria-pressed={selected}
                    className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${selected ? "bg-emerald-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-50"}`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-white/15" : "bg-emerald-50"}`}
                    >
                      <BriefcaseBusiness
                        className={`h-4 w-4 ${selected ? "text-white" : "text-emerald-600"}`}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {job.titre}
                      </span>
                      <span
                        className={`mt-0.5 block truncate text-xs ${selected ? "text-emerald-100" : "text-slate-500"}`}
                      >
                        {job.sector?.name || "Secteur non renseigné"}
                      </span>
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 ${selected ? "text-white" : "text-slate-300 group-hover:translate-x-0.5"}`}
                    />
                  </button>
                );
              })}
            </div>
          </aside>
          {selectedJob ? (
            <MatchingCandidates
              offreId={selectedJob.id}
              offreTitre={selectedJob.titre}
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              <Users className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              Sélectionnez une offre pour afficher les profils.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
