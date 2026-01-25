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
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaPlay,
  FaBriefcase,
  FaFileVideo
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Application {
  id: number;
  type: 'job_offer' | 'video_cv';
  title: string;
  company: string;
  company_logo?: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  video_link?: string;
  offre_id?: number;
  job_name?: string;
  sector_name?: string;
  experiences?: number;
}

interface Statistics {
  total: number;
  pending: number;
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
    pending: 0,
    accepted: 0,
    rejected: 0,
    job_offers: 0,
    video_cvs: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  useEffect(() => {
    fetchApplicationHistory();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, statusFilter, typeFilter]);

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

    if (typeFilter !== "all") {
      filtered = filtered.filter(app => app.type === typeFilter);
    }

    setFilteredApplications(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <FaCheckCircle className="w-3 h-3 mr-1" />
            Accepté
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <FaTimesCircle className="w-3 h-3 mr-1" />
            Refusé
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
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
      <div className="flex items-center justify-between">
        <Heading
          title="Historique des candidatures"
          description="Suivez toutes vos candidatures et leur statut"
        />
      </div>

      <Separator />

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaBriefcase className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statistics.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaClock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statistics.pending}</p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaCheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statistics.accepted}</p>
                <p className="text-xs text-muted-foreground">Acceptées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaTimesCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statistics.rejected}</p>
                <p className="text-xs text-muted-foreground">Refusées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaBriefcase className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statistics.job_offers}</p>
                <p className="text-xs text-muted-foreground">Offres</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaFileVideo className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statistics.video_cvs}</p>
                <p className="text-xs text-muted-foreground">CV Vidéos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <FaFilter className="h-4 w-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="accepted">Acceptées</SelectItem>
              <SelectItem value="rejected">Refusées</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="job_offer">Offres d'emploi</SelectItem>
            <SelectItem value="video_cv">CV Vidéos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FaBriefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune candidature trouvée
              </h3>
              <p className="text-gray-500">
                {applications.length === 0 
                  ? "Vous n'avez pas encore postulé à des offres."
                  : "Aucune candidature ne correspond aux filtres sélectionnés."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {filteredApplications.map((application) => (
                <Card key={`${application.type}-${application.id}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.title}
                          </h3>
                          {getTypeBadge(application.type)}
                          {getStatusBadge(application.status)}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <FaBuilding className="h-4 w-4" />
                            <span>{application.company}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FaCalendarAlt className="h-4 w-4" />
                            <span>{formatDate(application.applied_at)}</span>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {application.description}
                        </p>

                        {application.type === 'video_cv' && (
                          <div className="flex flex-wrap gap-2 mb-4">
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
                            {application.experiences !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                {application.experiences} ans d'expérience
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {application.video_link && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVideoPreview(application.video_link!)}
                            className="flex items-center space-x-1"
                          >
                            <FaPlay className="h-3 w-3" />
                            <span>Voir vidéo</span>
                          </Button>
                        )}
                        
                        {application.type === 'job_offer' && application.offre_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/offres/${application.offre_id}`, '_blank')}
                            className="flex items-center space-x-1"
                          >
                            <FaEye className="h-3 w-3" />
                            <span>Voir offre</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default ApplicationHistory;