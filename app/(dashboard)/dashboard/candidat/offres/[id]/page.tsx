"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { FullPageLoading } from "@/components/ui/loading";
import SafeHtmlDisplay from "@/components/SafeHtmlDisplay";
import { 
  FaArrowLeft, 
  FaBuilding, 
  FaCalendarAlt, 
  FaBriefcase,
  FaMapMarkerAlt,
  FaEye,
  FaClock,
  FaCheckCircle
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OfferDetail {
  id: number;
  titre: string;
  description: string;
  company_name: string;
  company_logo?: string;
  sector_name: string;
  job_name: string;
  location: string;
  contractType: string;
  date_debut: string;
  date_fin: string;
  created_at: string;
  sector_id: number;
  job_id: number;
  entreprise_id: number;
  salaire?: string;
  experience_required?: string;
  education_level?: string;
  skills_required?: string[];
  benefits?: string[];
  company_description?: string;
  is_verified?: string | boolean;
  applications_count?: number;
  views_count?: number;
}

interface ApplicationStatus {
  has_applied: boolean;
  application_status?: 'not_viewed' | 'viewed' | 'accepted' | 'rejected';
  applied_at?: string;
  viewed_at?: string;
}

const CandidatOfferDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const offerId = params.id as string;

  useEffect(() => {
    fetchOfferDetail();
  }, [offerId]);

  const fetchOfferDetail = async () => {
    try {
      setLoading(true);
      
      // Fetch offer details
      const offerResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offres/${offerId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (offerResponse.ok) {
        const offerData = await offerResponse.json();
        setOffer(offerData);
        
        // Check application status
        const statusResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/check-application-status?offre_id=${offerId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setApplicationStatus(statusData);
        }
      } else {
        toast.error("Offre non trouvée");
        router.push("/dashboard/candidat/offres");
      }
    } catch (error) {
      console.error("Error fetching offer:", error);
      toast.error("Erreur lors du chargement de l'offre");
      router.push("/dashboard/candidat/offres");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = () => {
    if (!applicationStatus?.has_applied) return null;
    
    switch (applicationStatus.application_status) {
      case 'viewed':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
            <FaEye className="w-3 h-3 mr-1" />
            Vue par le recruteur
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
            Refusée
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">
            <FaClock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <FullPageLoading 
        message="Chargement de l'offre"
        submessage="Récupération des détails..."
      />
    );
  }

  if (!offer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Offre non trouvée</p>
          <Button onClick={() => router.push("/dashboard/candidat/offres")}>
            Retour aux offres
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <FaArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 bg-white flex items-center justify-center shadow-sm">
                {offer.company_logo ? (
                  <>
                    <img 
                      src={offer.company_logo.startsWith('http') ? offer.company_logo : `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${offer.company_logo}`}
                      alt={offer.company_name}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold" style={{ display: 'none' }}>
                      {offer.company_name?.[0]?.toUpperCase() || 'E'}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
                    {offer.company_name?.[0]?.toUpperCase() || 'E'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{offer.titre}</h1>
              <div className="flex items-center gap-2 text-lg text-gray-700 mb-4">
                <FaBuilding className="h-5 w-5 text-green-600" />
                <span className="font-semibold">{offer.company_name}</span>
              </div>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <FaBriefcase className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Secteur & Métier</p>
              <p className="font-semibold text-gray-900">{offer.sector_name}</p>
              <p className="text-xs text-gray-600">{offer.job_name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FaMapMarkerAlt className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Localisation</p>
              <p className="font-semibold text-gray-900">{offer.location}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <FaCalendarAlt className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Type de contrat</p>
              <p className="font-semibold text-gray-900">{offer.contractType}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Status */}
      {applicationStatus?.has_applied && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FaEye className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Statut de votre candidature
              </h3>
              <p className="text-blue-700 mb-2">
                {applicationStatus.application_status === 'viewed' 
                  ? 'Votre candidature a été vue par le recruteur' 
                  : applicationStatus.application_status === 'accepted'
                  ? 'Félicitations! Votre candidature a été acceptée'
                  : applicationStatus.application_status === 'rejected'
                  ? 'Votre candidature n\'a pas été retenue pour cette offre'
                  : 'Votre candidature est en attente de lecture'}
              </p>
              {applicationStatus.applied_at && (
                <p className="text-sm text-blue-600">
                  Postulé le {formatDate(applicationStatus.applied_at)}
                </p>
              )}
              {applicationStatus.viewed_at && (
                <p className="text-sm text-blue-600">
                  Vue le {formatDate(applicationStatus.viewed_at)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Description du poste</h2>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <SafeHtmlDisplay
            html={offer.description}
            className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
          />
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Détails de l'offre</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Date de début</h4>
            <p className="text-gray-700">{formatDate(offer.date_debut)}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Date de fin</h4>
            <p className="text-gray-700">{formatDate(offer.date_fin)}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
              Secteur: {offer.sector_name}
            </Badge>
            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
              Métier: {offer.job_name}
            </Badge>
            {offer.experience_required && (
              <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                Expérience: {offer.experience_required}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">À propos de l'entreprise</h2>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 bg-white flex items-center justify-center shadow-sm flex-shrink-0">
            {offer.company_logo ? (
              <>
                <img 
                  src={offer.company_logo.startsWith('http') ? offer.company_logo : `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${offer.company_logo}`}
                  alt={offer.company_name}
                  className="w-full h-full object-contain p-1.5"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold" style={{ display: 'none' }}>
                  {offer.company_name?.[0]?.toUpperCase() || 'E'}
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                {offer.company_name?.[0]?.toUpperCase() || 'E'}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{offer.company_name}</h3>
            <p className="text-gray-600">{offer.sector_name}</p>
          </div>
        </div>

        <p className="text-gray-700 leading-relaxed">
          {offer.company_description || "Une entreprise leader dans son secteur, offrant des opportunités de carrière exceptionnelles dans un environnement dynamique et innovant."}
        </p>
      </div>

      {/* Statistics */}
      {(offer.views_count || offer.applications_count) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Statistiques</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {offer.views_count !== undefined && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FaEye className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{offer.views_count}</p>
                  <p className="text-sm text-gray-600">Vues</p>
                </div>
              </div>
            )}
            
            {offer.applications_count !== undefined && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <FaBriefcase className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{offer.applications_count}</p>
                  <p className="text-sm text-gray-600">Candidatures</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatOfferDetailPage;
