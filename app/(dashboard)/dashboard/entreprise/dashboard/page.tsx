"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Bar } from "react-chartjs-2";
import Cookies from "js-cookie";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";
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
        const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/entreprise-stats`, {
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
    <div className="space-y-6">
      {/* Header Simple et Élégant */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <FaChartBar className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
            <p className="text-green-50 text-sm">Vue d'ensemble de vos statistiques</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Plus sobres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <FaBriefcase className="text-green-600 text-lg" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalOffres}</p>
          <p className="text-sm text-gray-600 mt-1">Offres publiées</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <FaUsers className="text-blue-600 text-lg" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCandidatures}</p>
          <p className="text-sm text-gray-600 mt-1">Candidatures reçues</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <FaChartBar className="text-purple-600 text-lg" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.candidaturesByOffre.length}</p>
          <p className="text-sm text-gray-600 mt-1">Offres actives</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <FaEye className="text-amber-600 text-lg" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalCandidatures > 0 ? Math.round(stats.totalCandidatures / Math.max(stats.totalOffres, 1)) : 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Moyenne par offre</p>
        </div>
      </div>

      {/* Charts Section - Design épuré */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
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

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
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

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
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
    </div>
  );
}

export default function Page() {
  return <Dashboard />;
}