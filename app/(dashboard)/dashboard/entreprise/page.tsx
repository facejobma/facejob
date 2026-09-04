"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
import {
  ArrowRight,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CircleCheckBig,
  Clock3,
  Plus,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

interface MonthlyStat {
  month: number;
  year?: number;
  sum: number;
}
interface OfferStat {
  offre_id?: number;
  titre: string;
  sum: number;
}
interface Stats {
  offres: MonthlyStat[];
  candidatures: MonthlyStat[];
  candidaturesByOffre: OfferStat[];
  totalCandidatures: number;
  totalOffres: number;
}
interface Offer {
  id: number;
  titre: string;
  status?: string | null;
  is_verified?: string | null;
  date_fin?: string | null;
  created_at?: string | null;
  applications_count?: number;
  sector?: { name?: string | null } | null;
}

const EMPTY_STATS: Stats = {
  offres: [],
  candidatures: [],
  candidaturesByOffre: [],
  totalCandidatures: 0,
  totalOffres: 0,
};
const MONTHS = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(
    new Date(2026, index),
  ),
);

const isActive = (offer: Offer) => {
  if ((offer.status || offer.is_verified) !== "Accepted") return false;
  if (!offer.date_fin) return true;
  const end = new Date(`${offer.date_fin.slice(0, 10)}T23:59:59`);
  return Number.isNaN(end.getTime()) || end >= new Date();
};

const statusMeta = (offer: Offer) => {
  if (isActive(offer))
    return {
      label: "Active",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    };
  const status = offer.status || offer.is_verified;
  if (status === "Accepted")
    return {
      label: "Expirée",
      className: "bg-slate-100 text-slate-600 ring-slate-200",
    };
  if (status === "Declined")
    return {
      label: "Refusée",
      className: "bg-red-50 text-red-700 ring-red-200",
    };
  return {
    label: "En attente",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  };
};

export default function EntrepriseDashboardPage() {
  const { user, isLoading: userLoading } = useUser();
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadDashboard = useCallback(
    async (signal: AbortSignal) => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const token = Cookies.get("authToken")?.replace(/["']/g, "");
        if (!token)
          throw new Error("Votre session a expiré. Veuillez vous reconnecter.");
        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        };
        const [statsResponse, offersResponse] = await Promise.all([
          fetch("/api/v1/entreprise-stats", {
            signal,
            headers,
            cache: "no-store",
          }),
          fetch(`/api/v1/offres/by-owner/${user.id}`, {
            signal,
            headers,
            cache: "no-store",
          }),
        ]);
        const [statsPayload, offersPayload] = await Promise.all([
          statsResponse.json().catch(() => null),
          offersResponse.json().catch(() => null),
        ]);
        if (!statsResponse.ok)
          throw new Error(
            statsPayload?.message ||
              statsPayload?.error ||
              "Impossible de charger les statistiques.",
          );
        if (!offersResponse.ok)
          throw new Error(
            offersPayload?.message || "Impossible de charger vos offres.",
          );
        const statsData = statsPayload?.data ?? statsPayload;
        setStats({
          offres: Array.isArray(statsData?.offres) ? statsData.offres : [],
          candidatures: Array.isArray(statsData?.candidatures)
            ? statsData.candidatures
            : [],
          candidaturesByOffre: Array.isArray(statsData?.candidaturesByOffre)
            ? statsData.candidaturesByOffre
            : [],
          totalCandidatures: Number(statsData?.totalCandidatures) || 0,
          totalOffres: Number(statsData?.totalOffres) || 0,
        });
        const rows = offersPayload?.data ?? offersPayload;
        setOffers(Array.isArray(rows) ? rows : []);
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
    void loadDashboard(controller.signal);
    return () => controller.abort();
  }, [loadDashboard, reloadKey, user?.id, userLoading]);

  const activeOffers = useMemo(() => offers.filter(isActive), [offers]);
  const recentOffers = useMemo(
    () =>
      [...offers]
        .sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime(),
        )
        .slice(0, 5),
    [offers],
  );
  const average = stats.totalOffres
    ? Math.round((stats.totalCandidatures / stats.totalOffres) * 10) / 10
    : 0;
  const currentYear = new Date().getFullYear();
  const monthly = (rows: MonthlyStat[]) =>
    Array.from({ length: 12 }, (_, index) => {
      const row = rows.find(
        (item) =>
          Number(item.month) === index + 1 &&
          (!item.year || Number(item.year) === currentYear),
      );
      return Number(row?.sum) || 0;
    });
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { displayColors: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: "rgba(148,163,184,.14)" },
        border: { display: false },
      },
      x: { grid: { display: false }, border: { display: false } },
    },
  };
  const chartData = (rows: MonthlyStat[], color: string) => ({
    labels: MONTHS,
    datasets: [
      {
        data: monthly(rows),
        backgroundColor: color,
        borderRadius: 7,
        borderSkipped: false,
        maxBarThickness: 24,
      },
    ],
  });

  if (loading || userLoading)
    return (
      <div
        className="flex min-h-[520px] items-center justify-center"
        role="status"
      >
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
        <span className="sr-only">Chargement du tableau de bord</span>
      </div>
    );

  if (error)
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <RefreshCw className="h-6 w-6 text-red-600" />
        </span>
        <h1 className="mt-4 text-lg font-semibold text-slate-900">
          Tableau de bord indisponible
        </h1>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <button
          type="button"
          onClick={() => setReloadKey((key) => key + 1)}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </button>
      </div>
    );

  const companyName = user?.company_name || "votre entreprise";
  const cards = [
    {
      label: "Offres publiées",
      value: stats.totalOffres,
      note: "depuis la création du compte",
      icon: BriefcaseBusiness,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Offres actives",
      value: activeOffers.length,
      note: "approuvées et non expirées",
      icon: CircleCheckBig,
      tone: "bg-teal-50 text-teal-700",
    },
    {
      label: "Candidatures reçues",
      value: stats.totalCandidatures,
      note: "hors candidatures retirées",
      icon: Users,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Moyenne par offre",
      value: average,
      note: "candidatures par publication",
      icon: TrendingUp,
      tone: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 p-6 text-white shadow-xl shadow-emerald-950/10 sm:p-8">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-teal-300/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50">
              <Sparkles className="h-3.5 w-3.5" />
              Espace recruteur
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Bonjour, {companyName}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50 sm:text-base">
              Suivez vos recrutements et accédez rapidement aux actions
              importantes de votre entreprise.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/dashboard/entreprise/mes-offres"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/15"
            >
              <BriefcaseBusiness className="h-4 w-4" />
              Voir mes offres
            </Link>
            <Link
              href="/dashboard/entreprise/publier"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-emerald-800 shadow-sm hover:bg-emerald-50"
            >
              <Plus className="h-4 w-4" />
              Publier une offre
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, icon: Icon, tone }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  {value}
                </p>
              </div>
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}
              >
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-400">{note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Offres publiées</h2>
              <p className="mt-1 text-xs text-slate-500">
                Évolution mensuelle en {currentYear}
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
              <ChartNoAxesCombined className="h-4 w-4 text-emerald-600" />
            </span>
          </div>
          <div className="h-64">
            <Bar
              data={chartData(stats.offres, "rgba(5,150,105,.78)")}
              options={chartOptions}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Candidatures reçues
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Évolution mensuelle en {currentYear}
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
              <Users className="h-4 w-4 text-blue-600" />
            </span>
          </div>
          <div className="h-64">
            <Bar
              data={chartData(stats.candidatures, "rgba(37,99,235,.72)")}
              options={chartOptions}
            />
          </div>
        </div>
      </section>

      <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">Offres récentes</h2>
              <p className="mt-1 text-xs text-slate-500">
                Statut et candidatures de vos dernières publications
              </p>
            </div>
            <Link
              href="/dashboard/entreprise/mes-offres"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Tout afficher
            </Link>
          </div>
          {recentOffers.length ? (
            <div className="divide-y divide-slate-100">
              {recentOffers.map((offer) => {
                const meta = statusMeta(offer);
                return (
                  <Link
                    key={offer.id}
                    href={`/dashboard/entreprise/mes-offres/${offer.id}`}
                    className="group flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <BriefcaseBusiness className="h-4 w-4 text-slate-600" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900">
                        {offer.titre}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>
                          {offer.sector?.name || "Secteur non renseigné"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {Number(offer.applications_count) || 0} candidature
                          {Number(offer.applications_count) > 1 ? "s" : ""}
                        </span>
                      </span>
                    </span>
                    <span
                      className={`hidden rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset sm:inline-flex ${meta.className}`}
                    >
                      {meta.label}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <BriefcaseBusiness className="mx-auto h-8 w-8 text-slate-300" />
              <h3 className="mt-3 text-sm font-semibold text-slate-900">
                Aucune offre publiée
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Publiez votre première opportunité pour commencer.
              </p>
            </div>
          )}
        </div>
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-semibold text-slate-900">
              Trouver les bons profils
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Comparez vos critères avec les profils actifs et disponibles, sans
              charger plusieurs analyses sur cette page.
            </p>
            <Link
              href="/dashboard/entreprise/matching-candidates"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Ouvrir le matching
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Activité par offre</h2>
            <div className="mt-4 space-y-4">
              {[...stats.candidaturesByOffre]
                .sort((a, b) => b.sum - a.sum)
                .slice(0, 4)
                .map((item) => {
                  const max = Math.max(
                    ...stats.candidaturesByOffre.map(
                      (entry) => Number(entry.sum) || 0,
                    ),
                    1,
                  );
                  return (
                    <div key={`${item.offre_id}-${item.titre}`}>
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                        <span className="truncate font-medium text-slate-700">
                          {item.titre}
                        </span>
                        <span className="shrink-0 font-semibold text-slate-900">
                          {item.sum}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width: `${Math.max(6, (Number(item.sum) / max) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              {stats.candidaturesByOffre.length === 0 && (
                <div className="py-5 text-center text-xs text-slate-500">
                  <Clock3 className="mx-auto mb-2 h-5 w-5 text-slate-300" />
                  Aucune candidature reçue pour le moment.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
