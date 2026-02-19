"use client";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { JobRequests } from "@/components/tables/job-tables/requests";
import { Plus, Search, Users, Briefcase, Clock, CheckCircle, XCircle, LayoutGrid, Table as TableIcon, Building, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Job } from "@/constants/data";

export default function UsersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
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
            process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/offres/by-owner/${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            },
          );
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Ensure data is an array
          if (Array.isArray(data)) {
            setJobs(data);
          } else {
            console.error("API returned non-array data:", data);
            setJobs([]);
            toast({
              title: "Erreur",
              variant: "destructive",
              description: "Format de données invalide.",
            });
          }
        } catch (error) {
          console.error("Error fetching jobs:", error);
          setJobs([]); // Set empty array on error
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-220px)] gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-1">Chargement de vos offres</p>
          <p className="text-sm text-gray-500">Veuillez patienter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simple Header */}
      <div className="bg-green-50 rounded-lg border-2 border-green-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Mes offres d'emploi</h1>
            <p className="text-gray-600">Gérez et consultez toutes vos offres publiées</p>
          </div>
          
          <Button 
            onClick={() => router.push('/dashboard/entreprise/publier')}
            className="bg-green-600 hover:bg-green-700 text-white transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle offre
          </Button>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Briefcase className="text-green-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-600">Total offres</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="text-green-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stats.verified}</p>
                <p className="text-xs text-gray-600">Validées</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Clock className="text-green-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-xs text-gray-600">En attente</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <XCircle className="text-green-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stats.declined}</p>
                <p className="text-xs text-gray-600">Refusées</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="text-green-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stats.totalApplications}</p>
                <p className="text-xs text-gray-600">Candidatures</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Filtrer vos offres</h2>
            <p className="text-sm text-gray-600">Recherchez et filtrez vos offres d'emploi</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm border-gray-300 text-gray-700">
              {filteredJobs.length} offre{filteredJobs.length !== 1 ? 's' : ''} trouvée{filteredJobs.length !== 1 ? 's' : ''}
            </Badge>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "table" 
                    ? "bg-white text-green-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Vue tableau"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "cards" 
                    ? "bg-white text-green-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Vue cartes"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par titre ou secteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              size="sm"
              className={filterStatus === "all" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
            >
              Toutes
            </Button>
            <Button
              variant={filterStatus === "verified" ? "default" : "outline"}
              onClick={() => setFilterStatus("verified")}
              size="sm"
              className={filterStatus === "verified" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Validées
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              onClick={() => setFilterStatus("pending")}
              size="sm"
              className={filterStatus === "pending" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
            >
              <Clock className="w-4 h-4 mr-1" />
              En attente
            </Button>
            <Button
              variant={filterStatus === "declined" ? "default" : "outline"}
              onClick={() => setFilterStatus("declined")}
              size="sm"
              className={filterStatus === "declined" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Refusées
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Briefcase className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm || filterStatus !== "all" ? "Aucune offre trouvée" : "Aucune offre publiée"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== "all" 
              ? "Essayez de modifier vos critères de recherche ou de filtrage."
              : "Commencez par publier votre première offre d'emploi pour attirer des candidats."
            }
          </p>
          {(!searchTerm && filterStatus === "all") && (
            <Button 
              onClick={() => router.push('/dashboard/entreprise/publier')}
              className="bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Publier ma première offre
            </Button>
          )}
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <JobRequests data={filteredJobs} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-green-300 hover:shadow-lg transition-all"
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">
                      {job.titre}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" />
                      {job.company_name}
                    </p>
                  </div>
                  
                  {/* Status Badge */}
                  <Badge 
                    className={`ml-2 ${
                      job.is_verified === "Accepted" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : job.is_verified === "Pending"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    } border`}
                  >
                    {job.is_verified === "Accepted" ? "Validée" : 
                     job.is_verified === "Pending" ? "En attente" : "Refusée"}
                  </Badge>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="w-4 h-4 text-gray-400" />
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {job.sector?.name || "Non spécifié"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      {job.created_at 
                        ? new Date(job.created_at).toLocaleDateString("fr-FR")
                        : "Date non disponible"
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {job.postuler_offres_count || 0} candidature{(job.postuler_offres_count || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/dashboard/entreprise/mes-offres/${job.id}?mode=edit`)}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-green-600 border-green-300 hover:bg-green-50"
                    onClick={() => router.push(`/dashboard/entreprise/mes-offres/${job.id}`)}
                  >
                    Voir l'offre
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
