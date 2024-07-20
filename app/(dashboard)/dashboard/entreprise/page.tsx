"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bar } from "react-chartjs-2";
import Cookies from "js-cookie";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";

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
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    const userData=typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user") || '{}'
      : '{}'

    const user = JSON.parse(  userData);
    const userId = user.id;

    if (!userId) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "User ID not found in session storage.",
      });
      return;
    }

    async function getStats() {
      await fetch(`http://localhost:8000/api/entrepirse-stats/${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((result: Stats) => {
          setStats(result);
        })
        .catch((error) => {
          toast({
            title: "Whoops!",
            variant: "destructive",
            description: error.message,
          });
        });
    }

    getStats();
  }, [toast, authToken]);

  const allMonths = Array.from({ length: 12 }, (_, i) => i + 1); // [1, 2, ..., 12]

  const offresData = {
    labels: allMonths.map(m => new Date(0, m - 1).toLocaleString('fr', { month: 'short' })),
    datasets: [{
      label: 'Offres d’emploi diffusés',
      data: allMonths.map(month => {
        const found = stats.offres.find(o => o.month === month);
        return found ? found.sum : 0;
      }),
      backgroundColor: 'rgb(112, 149, 93)',
      borderColor: 'rgb(112, 149, 93)',
      borderWidth: 1,
      borderRadius: 3
    }]
  };

  const candidaturesData = {
    labels: allMonths.map(m => new Date(0, m - 1).toLocaleString('fr', { month: 'short' })),
    datasets: [{
      label: 'Candidatures reçues',
      data: allMonths.map(month => {
        const found = stats.candidatures.find(c => c.month === month);
        return found ? found.sum : 0;
      }),
      backgroundColor: 'rgb(112, 149, 93)',
      borderColor: 'rgb(112, 149, 93)',
      borderWidth: 1,
      borderRadius: 3
    }]
  };

  const candidaturesByOffreData = {
    labels: stats.candidaturesByOffre.map(c => c.titre),
    datasets: [{
      label: 'Candidatures reçues par offre',
      data: stats.candidaturesByOffre.map(c => c.sum),
      backgroundColor: 'rgb(112, 149, 93)',
      borderColor: 'rgb(112, 149, 93)',
      borderWidth: 1,
      borderRadius: 3
    }]
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Bonjour, bon retour 👋</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Total des offres d’emploi diffusés</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stats.totalOffres}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total des candidatures reçues</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stats.totalCandidatures}</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Nombre des offres d’emploi diffusés / mois</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar 
                data={offresData} 
                options={{ 
                  responsive: true, 
                  plugins: { 
                    legend: { position: 'top' }, 
                    title: { display: false } 
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                        precision: 0,
                        callback: function(value) {
                          return Number.isInteger(value) ? value : null;
                        }
                      }
                    }
                  }
                }} 
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Nombre des candidatures reçues / mois</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar 
                data={candidaturesData} 
                options={{ 
                  responsive: true, 
                  plugins: { 
                    legend: { position: 'top' }, 
                    title: { display: false } 
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                        precision: 0,
                        callback: function(value) {
                          return Number.isInteger(value) ? value : null;
                        }
                      }
                    }
                  }
                }} 
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Nombre des candidatures reçues / offre d’emploi</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar 
                data={candidaturesByOffreData} 
                options={{ 
                  responsive: true, 
                  plugins: { 
                    legend: { position: 'top' }, 
                    title: { display: false } 
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                        precision: 0,
                        callback: function(value) {
                          return Number.isInteger(value) ? value : null;
                        }
                      }
                    }
                  }
                }} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}

export default function Page() {
  return <Dashboard />;
}
