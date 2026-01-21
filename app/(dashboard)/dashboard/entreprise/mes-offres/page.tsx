"use client";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { JobRequests } from "@/components/tables/job-tables/requests";
import { Circles } from "react-loader-spinner";
import { Plus, Search, Filter, Calendar, TrendingUp, Users, Briefcase, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Job } from "@/constants/data";

const breadcrumbItems = [{ title: "Offres", link: "/dashboard/jobs" }];

export default function UsersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();
  const router = useRouter();
  const authToken = Cookies.get("authToken");
  const userData = typeof window !== "undefined"
    ? window.sessionStorage?.getItem("user")
    : null;

  useEffect(() => {
    if (userData) {
      const user = JSON.parse(userData);
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_URL + `/api/offres/${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            },
          );
          const data = await response.json();
          setJobs(data);
        } catch (error) {
          toast({
            title: "Whoops!",
            variant: "destructive",
            description: "Erreur lors de la récupération des données.",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [authToken, toast]);

  // Filter jobs based on search and status
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.sector?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "verified" && job.is_verified === "Accepted") ||
                         (filterStatus === "pending" && job.is_verified === "Pending") ||
                         (filterStatus === "declined" && job.is_verified === "Declined");
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: jobs.length,
    verified: jobs.filter(job => job.is_verified === "Accepted").length,
    pending: jobs.filter(job => job.is_verified === "Pending").length,
    declined: jobs.filter(job => job.is_verified === "Declined").length,
    totalApplications: jobs.reduce((sum, job) => sum + (job.postuler_offres_count || 0), 0),
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "Pending":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "Declined":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Declined":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

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
            <Briefcase className="text-2xl text-indigo-600 animate-pulse w-6 h-6" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">Chargement de vos offres</p>
          <p className="text-sm text-gray-500">Veuillez patienter quelques instants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-20 translate-y-20"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <Briefcase className="text-3xl text-white w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Mes offres d'emploi</h1>
                  <p className="text-indigo-100 text-lg">Gérez et consultez toutes vos offres publiées</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => router.push('/dashboard/entreprise/publier')}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle offre
              </Button>
            </div>
          </div>
          
          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Briefcase className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-indigo-100">Total offres</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                    <CheckCircle className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.verified}</p>
                    <p className="text-xs text-indigo-100">Validées</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/30 flex items-center justify-center">
                    <Clock className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                    <p className="text-xs text-indigo-100">En attente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-red-500/30 flex items-center justify-center">
                    <XCircle className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.declined}</p>
                    <p className="text-xs text-indigo-100">Refusées</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/30 flex items-center justify-center">
                    <Users className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalApplications}</p>
                    <p className="text-xs text-indigo-100">Candidatures</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Search */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">Filtrer vos offres</CardTitle>
              <CardDescription>Recherchez et filtrez vos offres d'emploi</CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {filteredJobs.length} offre{filteredJobs.length !== 1 ? 's' : ''} trouvée{filteredJobs.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par titre ou secteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
                className="h-11"
              >
                Toutes
              </Button>
              <Button
                variant={filterStatus === "verified" ? "default" : "outline"}
                onClick={() => setFilterStatus("verified")}
                size="sm"
                className="h-11"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Validées
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                onClick={() => setFilterStatus("pending")}
                size="sm"
                className="h-11"
              >
                <Clock className="w-4 h-4 mr-1" />
                En attente
              </Button>
              <Button
                variant={filterStatus === "declined" ? "default" : "outline"}
                onClick={() => setFilterStatus("declined")}
                size="sm"
                className="h-11"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Refusées
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Content */}
      {filteredJobs.length === 0 ? (
        <Card className="shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterStatus !== "all" ? "Aucune offre trouvée" : "Aucune offre publiée"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== "all" 
                ? "Essayez de modifier vos critères de recherche ou de filtrage."
                : "Commencez par publier votre première offre d'emploi pour attirer des candidats."
              }
            </p>
            {(!searchTerm && filterStatus === "all") && (
              <Button 
                onClick={() => router.push('/dashboard/entreprise/publier')}
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Publier ma première offre
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-0 overflow-hidden">
          <JobRequests data={filteredJobs} />
        </Card>
      )}
    </div>
  );
}
