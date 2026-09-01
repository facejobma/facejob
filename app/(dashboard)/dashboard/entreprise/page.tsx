"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Bar } from "react-chartjs-2";
import Cookies from "js-cookie";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";
import { FaBriefcase, FaUsers, FaChartBar, FaEye } from "react-icons/fa";
import MatchingCandidates from "@/components/MatchingCandidates";
import Link from "next/link";
import { Plus } from "lucide-react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

interface Stat {
  month: number;
  sum: number;
}

interface CandidatureByOffre {
  titre: string;
  sum: number;
}

interface Stats {
  offres: Stat[];
  candidatures: Stat[];
  candidaturesByOffre: CandidatureByOffre[];
  totalCandidatures: number;
  totalOffres: number;
}

interface ActiveOffer {
  id: number;
  titre: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    offres: [],
    candidatures: [],
    candidaturesByOffre: [],
    totalCandidatures: 0,
    totalOffres: 0
  });
  const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  // Fetch stats on mount
  useEffect(() => {
    async function getStats() {
      if (!authToken) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "User not authenticated",
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch((typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL) + `/api/v1/entreprise-stats`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.status}`);
        }
        
        const result: Stats = await response.json();
        
        // Ensure all required fields exist with defaults
        setStats({
          offres: result.offres || [],
          candidatures: result.candidatures || [],
          candidaturesByOffre: result.candidaturesByOffre || [],
          totalCandidatures: result.totalCandidatures || 0,
          totalOffres: result.totalOffres || 0
        });

        // Fetch user info to get entreprise ID, then fetch active offers
        const userRes = await fetch(
          `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/user`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        if (userRes.ok) {
          const userData = await userRes.json();
          const entrepriseId = userData?.id ?? userData?.user?.id;
          if (entrepriseId) {
            const offresRes = await fetch(
              `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/offres/by-owner/${entrepriseId}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
                  "ngrok-skip-browser-warning": "true",
                },
              }
            );
            if (offresRes.ok) {
              const offresData = await offresRes.json();
              const offers: ActiveOffer[] = (offresData?.data ?? offresData ?? [])
                .slice(0, 3)
                .map((o: any) => ({ id: o.id, titre: o.titre }));
              setActiveOffers(offers);
            }
          }
        }
      } catch (error: any) {
        toast({
          title: "Whoops!",
          variant: "destructive",
          description: error.message,
        });
        // Keep default empty stats on error
      } finally {
        setLoading(false);
      }
    }

    getStats();
  }, [toast, authToken]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Chargement des statistiques...</p>
      </div>
    );
  }

  const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);

  const offresData = {
    labels: allMonths.map(m => new Date(0, m - 1).toLocaleString('fr', { month: 'short' })),
    datasets: [{
      label: "Offres publiées",
      data: allMonths.map(month => {
        const found = stats.offres?.find(o => o.month === month);
        return found ? found.sum : 0;
      }),
      backgroundColor: 'rgba(16, 185, 129, 0.7)',
      borderColor: 'rgb(16, 185, 129)',
      borderWidth: 1,
      borderRadius: 6
    }]
  };

  const candidaturesData = {
    labels: allMonths.map(m => new Date(0, m - 1).toLocaleString('fr', { month: 'short' })),
    datasets: [{
      label: "Candidatures reçues",
      data: allMonths.map(month => {
        const found = stats.candidatures?.find(c => c.month === month);
        return found ? found.sum : 0;
      }),
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1,
      borderRadius: 6
    }]
  };

  const candidaturesByOffreData = {
    labels: stats.candidaturesByOffre?.map(c => c.titre) || [],
    datasets: [{
      label: "Candidatures par offre",
      data: stats.candidaturesByOffre?.map(c => c.sum) || [],
      backgroundColor: 'rgba(168, 85, 247, 0.7)',
      borderColor: 'rgb(168, 85, 247)',
      borderWidth: 1,
      borderRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { 
        position: 'top' as const,
        labels: {
          font: {
            size: 12
          },
          padding: 12,
          usePointStyle: true
        }
      },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
          callback: function(value: any) {
            return Number.isInteger(value) ? value : null;
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="space-y-6 md:space-y-7">
      {/* Header Simple et Élégant */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-5 shadow-lg shadow-emerald-100 sm:p-7">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
            <FaChartBar className="text-white text-xl" />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">Espace recruteur</p>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Tableau de bord</h1>
            <p className="mt-1 text-sm text-emerald-50">Pilotez vos offres et suivez vos candidatures en un coup d'œil.</p>
          </div>
          </div>
          <Link href="/dashboard/entreprise/publier" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50"><Plus className="h-4 w-4" />Nouvelle offre</Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md md:p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <FaBriefcase className="text-green-600 text-base md:text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xl md:text-3xl font-bold text-gray-900 leading-none mb-1">{stats.totalOffres}</p>
              <p className="text-xs md:text-sm text-gray-600">Offres publiées</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md md:p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FaUsers className="text-blue-600 text-base md:text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xl md:text-3xl font-bold text-gray-900 leading-none mb-1">{stats.totalCandidatures}</p>
              <p className="text-xs md:text-sm text-gray-600">Candidatures reçues</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md md:p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <FaChartBar className="text-purple-600 text-base md:text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xl md:text-3xl font-bold text-gray-900 leading-none mb-1">{stats.candidaturesByOffre.length}</p>
              <p className="text-xs md:text-sm text-gray-600">Offres actives</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md md:p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <FaEye className="text-amber-600 text-base md:text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xl md:text-3xl font-bold text-gray-900 leading-none mb-1">
                {stats.totalCandidatures > 0 ? Math.round(stats.totalCandidatures / Math.max(stats.totalOffres, 1)) : 0}
              </p>
              <p className="text-xs md:text-sm text-gray-600">Moyenne par offre</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section - Design épuré */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <FaBriefcase className="text-green-600 text-sm" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Offres par mois</h3>
          </div>
          <div className="h-64">
            <Bar data={offresData} options={chartOptions} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <FaUsers className="text-blue-600 text-sm" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Candidatures par mois</h3>
          </div>
          <div className="h-64">
            <Bar data={candidaturesData} options={chartOptions} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <FaChartBar className="text-purple-600 text-sm" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Candidatures par offre</h3>
          </div>
          <div className="h-64">
            <Bar data={candidaturesByOffreData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Matching Candidates Section */}
      {activeOffers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <FaUsers className="text-emerald-600 text-sm" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Candidats correspondants à vos offres</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {activeOffers.map((offre) => (
              <MatchingCandidates key={offre.id} offreId={offre.id} offreTitre={offre.titre} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EntrepriseDashboardPage() {
  return <Dashboard />;
}
