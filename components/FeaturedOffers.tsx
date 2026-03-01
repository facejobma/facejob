"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Building, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  TrendingUp,
  Users,
  Clock
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { stripHtmlTags } from "@/lib/textUtils";

interface Offer {
  id: number;
  titre: string;
  description: string;
  company_name: string;
  sector_name: string;
  job_name: string;
  location: string;
  contractType: string;
  created_at: string;
}

const FeaturedOffers: React.FC = () => {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOffers: 0,
    newThisWeek: 0,
    totalCompanies: 0
  });

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        // Check if we have cached data
        const cachedData = sessionStorage.getItem('featured_offers');
        const cacheTime = sessionStorage.getItem('featured_offers_time');
        const now = Date.now();
        
        // Use cache if less than 5 minutes old
        if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 300000) {
          const cached = JSON.parse(cachedData);
          setOffers(cached.offers);
          setStats(cached.stats);
          setLoading(false);
          return;
        }
        
        // Use AbortController for request timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offres`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const result = await response.json();
          const data = result.data;
          
          // Get latest 6 offers for featured section
          const sortedOffers = data
            .sort((a: Offer, b: Offer) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 6);
          
          setOffers(sortedOffers);
          
          // Calculate stats
          const now = new Date();
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const newThisWeek = data.filter((offer: Offer) => 
            new Date(offer.created_at) >= oneWeekAgo
          ).length;
          
          const uniqueCompanies = Array.from(new Set(data.map((offer: Offer) => offer.company_name))).length;
          
          const statsData = {
            totalOffers: data.length,
            newThisWeek,
            totalCompanies: uniqueCompanies
          };
          
          setStats(statsData);
          
          // Cache the data
          sessionStorage.setItem('featured_offers', JSON.stringify({
            offers: sortedOffers,
            stats: statsData
          }));
          sessionStorage.setItem('featured_offers_time', Date.now().toString());
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoading(false);
      }
    };

    // Defer API call slightly to prioritize above-the-fold content
    const timer = setTimeout(() => {
      fetchOffers();
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  const handleApply = (offerId: number) => {
    router.push(`/auth/login-candidate?returnUrl=/dashboard/candidat/offres&offerId=${offerId}`);
  };

  const getDaysAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-gray-50 ">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Offres d'emploi récentes
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 px-4">
            Découvrez les dernières opportunités d'emploi au Maroc
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto mb-6 sm:mb-8">
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-center gap-2">
                <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalOffers}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Offres disponibles</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary-1 flex-shrink-0" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.newThisWeek}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Nouvelles cette semaine</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-center gap-2">
                <Building className="h-5 w-5 sm:h-6 sm:w-6 text-primary-2 flex-shrink-0" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Entreprises partenaires</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Offers Grid */}
        {offers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
              {offers.map((offer) => (
                <Card key={offer.id} className="group relative overflow-hidden bg-white hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-green-300">
                  {/* Accent bar */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-green-600"></div>
                  
                  <CardHeader className="pb-4 pl-6">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors leading-tight">
                          {offer.titre}
                        </CardTitle>
                        <div className="flex items-center text-xs text-gray-700 font-medium">
                          <div className="h-6 w-6 rounded-lg bg-green-50 flex items-center justify-center mr-1.5 flex-shrink-0">
                            <Building className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="truncate">{offer.company_name}</span>
                        </div>
                      </div>
                      <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 flex-shrink-0 text-xs px-2 py-0.5">
                        <Clock className="h-2.5 w-2.5 mr-0.5" />
                        {getDaysAgo(offer.created_at)}j
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 pl-6 space-y-2.5">
                    {/* Job details */}
                    <div className="space-y-1.5">
                      <div className="flex items-center text-xs text-gray-600">
                        <div className="h-5 w-5 rounded-md bg-blue-50 flex items-center justify-center mr-1.5 flex-shrink-0">
                          <Briefcase className="h-2.5 w-2.5 text-blue-600" />
                        </div>
                        <span className="truncate">{offer.sector_name} • {offer.job_name}</span>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-600">
                        <div className="h-5 w-5 rounded-md bg-purple-50 flex items-center justify-center mr-1.5 flex-shrink-0">
                          <MapPin className="h-2.5 w-2.5 text-purple-600" />
                        </div>
                        <span className="truncate">{offer.location}</span>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-600">
                        <div className="h-5 w-5 rounded-md bg-orange-50 flex items-center justify-center mr-1.5 flex-shrink-0">
                          <Calendar className="h-2.5 w-2.5 text-orange-600" />
                        </div>
                        <span className="truncate">{offer.contractType}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="pt-1">
                      <p className="text-xs text-gray-600 line-clamp-1 leading-relaxed">
                        {stripHtmlTags(offer.description)}
                      </p>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-2">
                      <Button 
                        onClick={() => handleApply(offer.id)}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-sm hover:shadow-md transition-all text-sm py-2"
                      >
                        Postuler maintenant
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center px-4">
              <div className="bg-gradient-to-r from-primary to-primary-1 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                  Plus de {stats.totalOffers} offres vous attendent !
                </h3>
                <p className="text-green-100 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
                  Explorez toutes nos offres d'emploi et trouvez l'opportunité parfaite pour votre carrière. 
                  Postulez facilement avec votre CV vidéo.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link href="/offres">
                    <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto">
                      <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Voir toutes les offres
                    </Button>
                  </Link>
                  <Link href="/auth/signup-candidate">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary w-full sm:w-auto">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Créer mon profil
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune offre disponible pour le moment
            </h3>
            <p className="text-gray-600">
              Revenez bientôt pour découvrir de nouvelles opportunités !
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedOffers;