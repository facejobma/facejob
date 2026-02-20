"use client";

import React, { useState, useEffect } from "react";
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
  FaFileVideo
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  useEffect(() => {
    fetchApplicationHistory();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, statusFilter]);

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

    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
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
      default: // not_viewed
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">
            <FaClock className="w-3 h-3 mr-1" />
            Pas vue
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
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  };

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
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <FaFilter className="h-4 w-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="not_viewed">Non vues</SelectItem>
              <SelectItem value="viewed">Vues par recruteur</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="rejected">Refusées</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FaBriefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune candidature trouvée
          </h3>
          <p className="text-gray-600">
            {applications.length === 0 
              ? "Vous n'avez pas encore postulé à des offres."
              : "Aucune candidature ne correspond aux filtres sélectionnés."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div key={`${application.type}-${application.id}`} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.title}
                    </h3>
                    {getStatusBadge(application.status)}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <FaBuilding className="h-4 w-4" />
                      <span>{application.company}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="h-4 w-4" />
                      <span>{formatDate(application.applied_at)}</span>
                    </div>
                  </div>

                  <div 
                    className="text-gray-700 mb-3 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: application.description || "Aucune description disponible." }}
                  />

                  {(application.job_name || application.sector_name) && (
                    <div className="flex flex-wrap gap-2">
                      {application.job_name && (
                        <Badge variant="outline" className="text-xs">
                          Poste: {application.job_name}
                        </Badge>
                      )}
                      {application.sector_name && (
                        <Badge variant="outline" className="text-xs">
                          Secteur: {application.sector_name}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {application.video_link && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVideoPreview(application.video_link!)}
                      className="flex items-center gap-1"
                    >
                      <FaPlay className="h-3 w-3" />
                      <span>Voir vidéo</span>
                    </Button>
                  )}
                  
                  {application.offre_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/offres/${application.offre_id}`, '_blank')}
                      className="flex items-center gap-1"
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
    </div>
  );
};

export default ApplicationHistory;