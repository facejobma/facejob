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
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/offres`);
        if (response.ok) {
          const data = await response.json();
          
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
          
          setStats({
            totalOffers: data.length,
            newThisWeek,
            totalCompanies: uniqueCompanies
          });
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
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
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Offres d'emploi récentes
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Découvrez les dernières opportunités d'emploi au Maroc
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary mr-2" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOffers}</p>
                  <p className="text-sm text-gray-600">Offres disponibles</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary-1 mr-2" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.newThisWeek}</p>
                  <p className="text-sm text-gray-600">Nouvelles cette semaine</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center">
                <Building className="h-6 w-6 text-primary-2 mr-2" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
                  <p className="text-sm text-gray-600">Entreprises partenaires</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Offers Grid */}
        {offers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {offers.map((offer) => (
                <Card key={offer.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {offer.titre}
                        </CardTitle>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Building className="h-4 w-4 mr-1" />
                          <span className="font-medium">{offer.company_name}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        <Clock className="h-3 w-3 mr-1" />
                        {getDaysAgo(offer.created_at)}j
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="h-4 w-4 mr-2 text-primary" />
                        <span>{offer.sector_name} • {offer.job_name}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-primary-1" />
                        <span>{offer.location}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-primary-2" />
                        <span>{offer.contractType}</span>
                      </div>

                      <p className="text-sm text-gray-700 line-clamp-3">
                        {stripHtmlTags(offer.description)}
                      </p>

                      <div className="pt-4">
                        <Button 
                          onClick={() => handleApply(offer.id)}
                          className="w-full bg-primary hover:bg-primary-1 text-white group-hover:bg-primary-1 transition-colors"
                        >
                          Postuler maintenant
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-primary to-primary-1 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">
                  Plus de {stats.totalOffers} offres vous attendent !
                </h3>
                <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                  Explorez toutes nos offres d'emploi et trouvez l'opportunité parfaite pour votre carrière. 
                  Postulez facilement avec votre CV vidéo.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/offres">
                    <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                      <Briefcase className="h-5 w-5 mr-2" />
                      Voir toutes les offres
                    </Button>
                  </Link>
                  <Link href="/auth/signup-candidate">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                      <Users className="h-5 w-5 mr-2" />
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