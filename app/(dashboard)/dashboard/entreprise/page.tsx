"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Bar } from "react-chartjs-2";
import Cookies from "js-cookie";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";
import { Circles } from "react-loader-spinner";
import { HiOutlineOfficeBuilding, HiOutlineCollection } from "react-icons/hi";
import { FaBriefcase, FaUsers, FaChartBar, FaEye } from "react-icons/fa";

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

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    offres: [],
    candidatures: [],
    candidaturesByOffre: [],
    totalCandidatures: 0,
    totalOffres: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    const userData = typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user") || '{}'
      : '{}'

    const user = JSON.parse(userData);
    const userId = user.id;

    if (!userId) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "User ID not found in session storage.",
      });
      setLoading(false);
      return;
    }

    async function getStats() {
      try {
        setLoading(true);
        const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + `/api/entrepirse-stats/${userId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
        const result: Stats = await response.json();
        setStats(result);
      } catch (error: any) {
        toast({
          title: "Whoops!",
          variant: "destructive",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    }

    getStats();
  }, [toast, authToken]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-220px)] gap-6">
        <div className="relative">
          <Circles
            height={80}
            width={80}
            color="#4f46e5"
            ariaLabel="circles-loading"
            visible={true}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <HiOutlineOfficeBuilding className="text-2xl text-indigo-600 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">Chargement du tableau de bord</p>
          <p className="text-sm text-gray-500">Préparation de vos statistiques...</p>
        </div>
      </div>
    );
  }

  const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);

  const offresData = {
    labels: allMonths.map(m => new Date(0, m - 1).toLocaleString('fr', { month: 'short' })),
    datasets: [{
      label: "Offres d'emploi diffusées",
      data: allMonths.map(month => {
        const found = stats.offres.find(o => o.month === month);
        return found ? found.sum : 0;
      }),
      backgroundColor: 'rgba(79, 70, 229, 0.8)',
      borderColor: 'rgb(79, 70, 229)',
      borderWidth: 1,
      borderRadius: 8
    }]
  };

  const candidaturesData = {
    labels: allMonths.map(m => new Date(0, m - 1).toLocaleString('fr', { month: 'short' })),
    datasets: [{
      label: "Candidatures reçues",
      data: allMonths.map(month => {
        const found = stats.candidatures.find(c => c.month === month);
        return found ? found.sum : 0;
      }),
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderColor: 'rgb(16, 185, 129)',
      borderWidth: 1,
      borderRadius: 8
    }]
  };

  const candidaturesByOffreData = {
    labels: stats.candidaturesByOffre.map(c => c.titre),
    datasets: [{
      label: "Candidatures reçues par offre",
      data: stats.candidaturesByOffre.map(c => c.sum),
      backgroundColor: 'rgba(147, 51, 234, 0.8)',
      borderColor: 'rgb(147, 51, 234)',
      borderWidth: 1,
      borderRadius: 8
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
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
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with enhanced design */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <HiOutlineOfficeBuilding className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Tableau de bord</h1>
                <p className="text-indigo-100 mt-1">Suivez vos performances et gérez vos recrutements</p>
              </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <FaBriefcase className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalOffres}</p>
                    <p className="text-xs text-indigo-100">Offres publiées</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                    <FaUsers className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalCandidatures}</p>
                    <p className="text-xs text-indigo-100">Candidatures</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/30 flex items-center justify-center">
                    <FaChartBar className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.candidaturesByOffre.length}</p>
                    <p className="text-xs text-indigo-100">Offres actives</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                    <FaEye className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalCandidatures > 0 ? Math.round(stats.totalCandidatures / Math.max(stats.totalOffres, 1)) : 0}</p>
                    <p className="text-xs text-indigo-100">Moy. par offre</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <FaBriefcase className="text-indigo-600 text-sm" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Total des offres d'emploi</h2>
          </div>
          <p className="text-4xl font-bold text-indigo-600">{stats.totalOffres}</p>
          <p className="text-sm text-gray-500 mt-2">Offres publiées au total</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <FaUsers className="text-emerald-600 text-sm" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Total des candidatures</h2>
          </div>
          <p className="text-4xl font-bold text-emerald-600">{stats.totalCandidatures}</p>
          <p className="text-sm text-gray-500 mt-2">Candidatures reçues au total</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <FaChartBar className="text-blue-600 text-sm" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Offres diffusées par mois</h3>
            </div>
            <div className="h-64">
              <Bar data={offresData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <FaUsers className="text-emerald-600 text-sm" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Candidatures par mois</h3>
            </div>
            <div className="h-64">
              <Bar data={candidaturesData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <HiOutlineCollection className="text-purple-600 text-sm" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Candidatures par offre</h3>
            </div>
            <div className="h-64">
              <Bar data={candidaturesByOffreData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return <Dashboard />;
}