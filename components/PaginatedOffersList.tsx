"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Building, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/usePagination';
import { stripHtmlTags } from '@/lib/textUtils';
import { useRouter } from 'next/navigation';

interface Offer {
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
}

interface PaginatedOffersListProps {
  className?: string;
}

const PaginatedOffersList: React.FC<PaginatedOffersListProps> = ({ className }) => {
  const router = useRouter();

  // Fetch function for pagination hook
  const fetchOffers = async (page: number, perPage: number) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offres?page=${page}&per_page=${perPage}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch offers');
    }
    
    return response.json();
  };

  const {
    data: offers,
    pagination,
    loading,
    error,
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
  } = usePagination<Offer>(fetchOffers, {
    initialPage: 1,
    initialPerPage: 12,
  });

  // Calculate days ago
  const getDaysAgo = (dateString: string) => {
    if (!dateString) return 0;
    
    const created = new Date(dateString);
    const now = new Date();
    
    if (isNaN(created.getTime())) return 0;
    
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(diffDays, 365);
  };

  // Handle apply button click
  const handleApply = (offerId: number) => {
    router.push(`/auth/login-candidate?returnUrl=/dashboard/candidat/offres&offerId=${offerId}`);
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-red-600 mb-4">Erreur lors du chargement des offres: {error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Per page selector */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Offres d'emploi ({pagination?.total || 0})
        </h2>
        <div className="flex items-center gap-2">
          <label htmlFor="perPage" className="text-sm text-gray-600">
            Afficher:
          </label>
          <select
            id="perPage"
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
          <span className="text-sm text-gray-600">par page</span>
        </div>
      </div>

      {/* Offers Grid */}
      {offers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {offers.map((offer) => (
              <Card key={offer.id} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary group bg-white h-full flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {offer.titre}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Building className="h-4 w-4 mr-1 text-primary flex-shrink-0" />
                        <span className="font-medium truncate">{offer.company_name}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20 flex-shrink-0">
                      {getDaysAgo(offer.created_at)}j
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2 text-primary-1 flex-shrink-0" />
                      <span className="truncate">{offer.sector_name} • {offer.job_name}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-primary-2 flex-shrink-0" />
                      <span className="truncate">{offer.location}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-primary-3 flex-shrink-0" />
                      <span className="truncate">{offer.contractType}</span>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {stripHtmlTags(offer.description)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2 mt-auto">
                    <Button 
                      onClick={() => router.push(`/offres/${offer.id}`)}
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      Voir les détails
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button 
                      onClick={() => handleApply(offer.id)}
                      className="w-full bg-primary hover:bg-primary-1 text-white transition-colors"
                    >
                      Postuler maintenant
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.last_page}
              onPageChange={setCurrentPage}
              showInfo={true}
              totalItems={pagination.total}
              itemsPerPage={pagination.per_page}
            />
          )}
        </>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune offre trouvée
            </h3>
            <p className="text-gray-600">
              Aucune offre d'emploi disponible pour le moment
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaginatedOffersList;