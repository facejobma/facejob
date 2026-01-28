"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { 
  ArrowLeft, 
  Briefcase, 
  Building, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Share2,
  Bookmark,
  AlertCircle,
  CheckCircle,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import Link from "next/link";
import { stripHtmlTags } from "@/lib/textUtils";

interface OfferDetail {
  id: number;
  titre: string;
  description: string;
  company_name: string;
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
  is_verified?: string;
}

const OfferDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedOffers, setRelatedOffers] = useState<OfferDetail[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const offerId = params.id as string;

  useEffect(() => {
    const fetchOfferDetail = async () => {
      try {
        setLoading(true);
        
        // Fetch all offers first (since we don't have individual offer endpoint)
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offres`);
        
        if (response.ok) {
          const result = await response.json();
          
          // Extract the data array from the API response
          const allOffers = Array.isArray(result.data) ? result.data : [];
          
          const currentOffer = allOffers.find((o: OfferDetail) => o.id === parseInt(offerId));
          
          if (currentOffer) {
            setOffer(currentOffer);
            
            // Find related offers (same sector, different company)
            const related = allOffers
              .filter((o: OfferDetail) => 
                o.id !== currentOffer.id && 
                o.sector_id === currentOffer.sector_id
              )
              .slice(0, 3);
            setRelatedOffers(related);
          } else {
            toast.error("Offre non trouvée");
            router.push("/offres");
          }
        } else {
          throw new Error("Failed to fetch offer");
        }
      } catch (error) {
        console.error("Error fetching offer:", error);
        toast.error("Erreur lors du chargement de l'offre");
        router.push("/offres");
      } finally {
        setLoading(false);
      }
    };

    if (offerId) {
      fetchOfferDetail();
    }
  }, [offerId, router]);

  const handleApply = () => {
    router.push(`/auth/login-candidate?returnUrl=/dashboard/candidat/offres&offerId=${offerId}`);
  };

  const handleShare = async () => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: offer?.titre,
          text: `Découvrez cette offre d'emploi: ${offer?.titre} chez ${offer?.company_name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Lien copié dans le presse-papiers!");
      }
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Retiré des favoris" : "Ajouté aux favoris");
  };

  // State for client-side only calculations to prevent hydration issues
  const [daysAgoValue, setDaysAgoValue] = useState(0);

  // Calculate days ago on client side only
  useEffect(() => {
    if (offer?.created_at) {
      const created = new Date(offer.created_at);
      const now = new Date();
      
      if (!isNaN(created.getTime())) {
        const diffTime = Math.abs(now.getTime() - created.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysAgoValue(Math.min(diffDays, 365));
      }
    }
  }, [offer?.created_at]);

  const getDaysAgo = () => daysAgoValue;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!offer) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Offre non trouvée</h2>
            <p className="text-gray-600 mb-4">Cette offre d'emploi n'existe pas ou a été supprimée.</p>
            <Link href="/offres">
              <Button className="bg-primary hover:bg-primary-1">
                Retour aux offres
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-primary hover:text-primary-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBookmark}
                  className={`border-primary ${isBookmarked ? 'bg-primary text-white' : 'text-primary hover:bg-primary hover:text-white'}`}
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'Sauvegardé' : 'Sauvegarder'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Offer Header */}
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                        {offer.titre}
                      </CardTitle>
                      <div className="flex items-center text-lg text-gray-700 mb-4">
                        <Building className="h-5 w-5 mr-2 text-primary" />
                        <span className="font-semibold">{offer.company_name}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      <Clock className="h-3 w-3 mr-1" />
                      {getDaysAgo()} jour{getDaysAgo() > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2 text-primary-1" />
                      <div>
                        <p className="font-medium">{offer.sector_name}</p>
                        <p className="text-xs">{offer.job_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-primary-2" />
                      <div>
                        <p className="font-medium">{offer.location}</p>
                        <p className="text-xs">Maroc</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-primary-3" />
                      <div>
                        <p className="font-medium">{offer.contractType}</p>
                        <p className="text-xs">Type de contrat</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Job Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Description du poste
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {stripHtmlTags(offer.description)}
                  </div>
                </CardContent>
              </Card>

              {/* Job Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Détails de l'offre
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Date de début</h4>
                      <p className="text-gray-600">{formatDate(offer.date_debut)}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Date de fin</h4>
                      <p className="text-gray-600">{formatDate(offer.date_fin)}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Secteur d'activité</h4>
                    <Badge variant="outline" className="border-primary text-primary">
                      {offer.sector_name}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Métier</h4>
                    <Badge variant="outline" className="border-primary-1 text-primary-1">
                      {offer.job_name}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Postuler à cette offre
                  </CardTitle>
                  <CardDescription>
                    Créez votre profil et postulez avec votre CV vidéo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleApply}
                    className="w-full bg-primary hover:bg-primary-1 text-white text-lg py-3"
                    size="lg"
                  >
                    Postuler maintenant
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Vous devez créer un compte pour postuler
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Eye className="h-4 w-4 mr-2 text-primary" />
                      <span>Vu par {Math.floor(Math.random() * 100) + 50} candidats</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-primary-1" />
                      <span>{Math.floor(Math.random() * 20) + 5} candidatures</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-2 text-primary-2" />
                      <span>Offre vérifiée</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    À propos de l'entreprise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-semibold text-gray-900">{offer.company_name}</h4>
                      <p className="text-sm text-gray-600">{offer.sector_name}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-4">
                    {offer.company_description || "Une entreprise leader dans son secteur, offrant des opportunités de carrière exceptionnelles dans un environnement dynamique et innovant."}
                  </p>
                  
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                    Voir toutes les offres de cette entreprise
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Related Offers */}
          {relatedOffers.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Offres similaires
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedOffers.map((relatedOffer) => (
                  <Card key={relatedOffer.id} className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {relatedOffer.titre}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="h-4 w-4 mr-1 text-primary" />
                        <span>{relatedOffer.company_name}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-primary-1" />
                          <span>{relatedOffer.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-primary-2" />
                          <span>{relatedOffer.contractType}</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => router.push(`/offres/${relatedOffer.id}`)}
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                      >
                        Voir les détails
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OfferDetailPage;