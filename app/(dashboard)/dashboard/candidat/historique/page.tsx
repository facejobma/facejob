"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { FullPageLoading } from "@/components/ui/loading";
import { 
  FaEye, 
  FaBuilding, 
  FaCalendarAlt, 
  FaFilter,
  FaClock,
  FaTimesCircle,
  FaPlay,
  FaBriefcase,
  FaFileVideo,
  FaTimes,
  FaSearch,
  FaCheckCircle
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

interface Application {
  id: number;
  type: 'job_offer' | 'video_cv';
  title: string;
  company: string;
  company_logo?: string;
  description: string;
  status: 'not_viewed' | 'viewed' | 'accepted' | 'rejected';
  viewed_by_recruiter?: boolean;
  viewed_at?: string;
  applied_at: string;
  video_link?: string;
  offre_id?: number;
  job_name?: string;
  sector_name?: string;
  experiences?: number;
  location?: string;
  contractType?: string;
  date_debut?: string;
  date_fin?: string;
}

interface Statistics {
  total: number;
  not_viewed: number;
  viewed: number;
  accepted: number;
  rejected: number;
  job_offers: number;
  video_cvs: number;
}

const ApplicationHistory: React.FC = () => {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    not_viewed: 0,
    viewed: 0,
    accepted: 0,
    rejected: 0,
    job_offers: 0,
    video_cvs: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState<string>("");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  useEffect(() => {
    fetchApplicationHistory();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, statusFilter, dateFilter, appliedSearchQuery]);

  const fetchApplicationHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate/application-history`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
        setStatistics(data.statistics);
      } else {
        toast.error("Erreur lors du chargement de l'historique");
      }
    } catch (error) {
      console.error("Error fetching application history:", error);
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Filter by date range
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(app => {
        const appliedDate = new Date(app.applied_at);
        const diffDays = Math.floor((now.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case "today":
            return diffDays === 0;
          case "week":
            return diffDays <= 7;
          case "month":
            return diffDays <= 30;
          case "3months":
            return diffDays <= 90;
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (appliedSearchQuery.trim()) {
      const query = appliedSearchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.title.toLowerCase().includes(query) ||
        app.company.toLowerCase().includes(query) ||
        app.description?.toLowerCase().includes(query) ||
        app.job_name?.toLowerCase().includes(query) ||
        app.sector_name?.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'viewed':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
            <FaEye className="w-3 h-3 mr-1" />
            Vue
          </Badge>
        );
      case 'accepted':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
            <FaCheckCircle className="w-3 h-3 mr-1" />
            Acceptée
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
            <FaTimesCircle className="w-3 h-3 mr-1" />
            Refusée
          </Badge>
        );
      default: // not_viewed
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">
            <FaClock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'job_offer' ? (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <FaBriefcase className="w-3 h-3 mr-1" />
        Offre d'emploi
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
        <FaFileVideo className="w-3 h-3 mr-1" />
        CV Vidéo
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVideoPreview = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
  };

  const handleOfferView = (application: Application) => {
    if (application.offre_id) {
      router.push(`/dashboard/candidat/offres/${application.offre_id}`);
    }
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setDateFilter("all");
    setSearchQuery("");
    setAppliedSearchQuery("");
  };

  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setAppliedSearchQuery("");
  };

  const hasActiveFilters = statusFilter !== "all" || dateFilter !== "all" || appliedSearchQuery.trim() !== "";

  if (loading) {
    return (
      <FullPageLoading 
        message="Chargement de l'historique"
        submessage="Récupération de vos candidatures..."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Historique des candidatures</h1>
        <p className="text-gray-600 mt-1">Suivez toutes vos candidatures et leur statut</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <FaBriefcase className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <FaClock className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statistics.not_viewed}</p>
              <p className="text-sm text-gray-600">Non vues</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FaEye className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statistics.viewed}</p>
              <p className="text-sm text-gray-600">Vues</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <FaTimesCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statistics.rejected}</p>
              <p className="text-sm text-gray-600">Refusées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <FaTimes className="h-3 w-3 mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="flex flex-col gap-2 md:block">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par titre, entreprise, secteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                className="w-full pl-10 pr-10 md:pr-32 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 md:right-28 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Effacer la recherche"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleSearch}
                className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 md:flex"
              >
                <FaSearch className="h-3.5 w-3.5" />
                <span>Rechercher</span>
              </button>
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 md:hidden"
            >
              <FaSearch className="h-4 w-4" />
              <span>Rechercher</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="not_viewed">
                  <div className="flex items-center gap-2">
                    <FaClock className="h-3 w-3 text-gray-600" />
                    <span>Non vues</span>
                  </div>
                </SelectItem>
                <SelectItem value="viewed">
                  <div className="flex items-center gap-2">
                    <FaEye className="h-3 w-3 text-blue-600" />
                    <span>Vues</span>
                  </div>
                </SelectItem>
                <SelectItem value="accepted">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="h-3 w-3 text-green-600" />
                    <span>Acceptées</span>
                  </div>
                </SelectItem>
                <SelectItem value="rejected">
                  <div className="flex items-center gap-2">
                    <FaTimesCircle className="h-3 w-3 text-red-600" />
                    <span>Refusées</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période
            </label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Toutes les périodes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les périodes</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois-ci</SelectItem>
                <SelectItem value="3months">3 derniers mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-green-600">{filteredApplications.length}</span> candidature(s) trouvée(s)
            </p>
          </div>
        )}
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FaBriefcase className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {applications.length === 0 ? "Aucune candidature" : "Aucun résultat"}
            </h3>
            <p className="text-gray-600 mb-6">
              {applications.length === 0 
                ? "Vous n'avez pas encore postulé à des offres. Commencez à explorer les opportunités disponibles!"
                : "Aucune candidature ne correspond aux filtres sélectionnés. Essayez de modifier vos critères de recherche."
              }
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} className="bg-green-600 hover:bg-green-700">
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div 
              key={`${application.type}-${application.id}`} 
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-green-200 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    {getTypeBadge(application.type)}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.title}
                    </h3>
                    {getStatusBadge(application.status)}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <FaBuilding className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{application.company}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FaCalendarAlt className="h-4 w-4 text-blue-600" />
                      <span>{formatDate(application.applied_at)}</span>
                    </div>
                  </div>

                  <div 
                    className="text-gray-700 mb-3 line-clamp-2 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: application.description || "Aucune description disponible." }}
                  />

                  {(application.job_name || application.sector_name) && (
                    <div className="flex flex-wrap gap-2">
                      {application.job_name && (
                        <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                          <FaBriefcase className="h-3 w-3 mr-1" />
                          {application.job_name}
                        </Badge>
                      )}
                      {application.sector_name && (
                        <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
                          {application.sector_name}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {application.video_link && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVideoPreview(application.video_link!)}
                      className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                    >
                      <FaPlay className="h-3 w-3" />
                      <span>Voir vidéo</span>
                    </Button>
                  )}
                  
                  {application.offre_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOfferView(application)}
                      className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <FaEye className="h-3 w-3" />
                      <span>Voir offre</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && mounted && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl max-w-4xl w-full shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-lg font-semibold text-gray-900">Votre CV Vidéo</h3>
              <button
                onClick={closeVideoModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <video
                src={selectedVideo}
                controls
                className="w-full rounded-lg"
                autoPlay
              >
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ApplicationHistory;
