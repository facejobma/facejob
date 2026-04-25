"use client";

import React, { useEffect, useState, useMemo } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Search, Briefcase, Building, MapPin, Calendar, Filter, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Select from "react-select";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { stripHtmlTags } from "@/lib/textUtils";
import { JobListingStructuredData, WebSiteStructuredData } from "@/components/StructuredData";

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

interface Sector {
  id: number;
  name: string;
}

interface Job {
  id: number;
  name: string;
  sector_id: number;
}

interface Company {
  id: number;
  company_name: string;
}

const PublicOffersPage: React.FC = () => {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const offersPerPage = 12;

  // Fix hydration mismatch by ensuring client-side rendering for Select components
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch offers without authentication for public access
        const offersRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offres?page=1&per_page=1000`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        
        if (offersRes.ok) {
          const response = await offersRes.json();
          // Handle both old format (direct array) and new format (with pagination)
          const offersData = response.data || response;
          setOffers(offersData);
          
          // Extract unique companies from offers data
          const uniqueCompanies = Array.from(
            new Map(
              offersData
                .filter((offer: Offer) => offer.company_name && offer.entreprise_id)
                .map((offer: Offer) => [
                  offer.entreprise_id,
                  {
                    id: offer.entreprise_id,
                    company_name: offer.company_name
                  }
                ])
            ).values()
          ) as Company[];
          setCompanies(uniqueCompanies);

          // Extract unique jobs from offers data
          const uniqueJobs = Array.from(
            new Map(
              offersData
                .filter((offer: Offer) => offer.job_name && offer.job_id)
                .map((offer: Offer) => [
                  offer.job_id,
                  {
                    id: offer.job_id,
                    name: offer.job_name,
                    sector_id: offer.sector_id
                  }
                ])
            ).values()
          ) as Job[];
          setJobs(uniqueJobs);

          // Try to fetch sectors
          try {
            const sectorsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/sectors`, {
              headers: {
                'ngrok-skip-browser-warning': 'true'
              }
            });
            if (sectorsRes.ok) {
              const sectorsResponse = await sectorsRes.json();
              const sectorsData = sectorsResponse.data || sectorsResponse;
              setSectors(sectorsData);
            } else {
              console.error("Failed to fetch sectors:", sectorsRes.status);
              // Extract sectors from offers as fallback
              const uniqueSectors = Array.from(
                new Map(
                  offersData
                    .filter((offer: Offer) => offer.sector_name && offer.sector_id)
                    .map((offer: Offer) => [
                      offer.sector_id,
                      {
                        id: offer.sector_id,
                        name: offer.sector_name
                      }
                    ])
                ).values()
              ) as Sector[];
              setSectors(uniqueSectors);
            }
          } catch (sectorError) {
            console.error("Error fetching sectors:", sectorError);
          }
        } else {
          console.error("Failed to fetch offers:", offersRes.status);
          toast.error("Impossible de charger les offres d'emploi");
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter offers
  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const matchesSearch = !debouncedSearchQuery || 
        offer.titre?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        stripHtmlTags(offer.description)?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        offer.company_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        offer.sector_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        offer.job_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        offer.location?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      const matchesSector = !selectedSector || offer.sector_id === Number(selectedSector);
      const matchesJob = !selectedJob || offer.job_id === Number(selectedJob);
      const matchesCity = !selectedCity || offer.location === selectedCity;

      return matchesSearch && matchesSector && matchesJob && matchesCity;
    });
  }, [offers, debouncedSearchQuery, selectedSector, selectedJob, selectedCompany, selectedCity]);

  // Get available jobs for selected sector
  const availableJobs = useMemo(() => {
    if (!selectedSector) return jobs;
    return jobs.filter(job => job.sector_id === Number(selectedSector));
  }, [jobs, selectedSector]);

  // Get unique cities
  const availableCities = useMemo(() => {
    const cities = Array.from(new Set(offers.map(offer => offer.location).filter(Boolean)));
    return cities.sort();
  }, [offers]);

  // Pagination
  const totalPages = Math.ceil(filteredOffers.length / offersPerPage);
  const startIndex = (currentPage - 1) * offersPerPage;
  const paginatedOffers = filteredOffers.slice(startIndex, startIndex + offersPerPage);

  // Handle apply button click
  const handleApply = (offerId: number) => {
    // Redirect to login page with return URL
    router.push(`/auth/login-candidate?returnUrl=/dashboard/candidat/offres&offerId=${offerId}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSector("");
    setSelectedJob("");
    setSelectedCity("");
    setCurrentPage(1);
  };

  // State for client-side only calculations to prevent hydration issues
  const [clientSideData, setClientSideData] = useState<{[key: number]: number}>({});

  // Calculate days ago on client side only to prevent hydration issues
  useEffect(() => {
    const calculateDaysAgo = (dateString: string) => {
      if (!dateString) return 0;
      
      const created = new Date(dateString);
      const now = new Date();
      
      if (isNaN(created.getTime())) return 0;
      
      const diffTime = Math.abs(now.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.min(diffDays, 365);
    };

    // Only calculate if we have offers and haven't calculated yet
    if (offers.length > 0 && Object.keys(clientSideData).length === 0) {
      const daysAgoData: {[key: number]: number} = {};
      offers.forEach(offer => {
        daysAgoData[offer.id] = calculateDaysAgo(offer.created_at);
      });
      
      setClientSideData(daysAgoData);
    }
  }, [offers.length]); // Only depend on offers.length, not the full array

  // Get days ago for an offer (returns 0 during SSR, actual value after hydration)
  const getDaysAgo = (offerId: number) => {
    return clientSideData[offerId] || 0;
  };

  const customSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderRadius: '8px',
      borderColor: state.isFocused ? '#60894B' : '#d0d5dd',
      borderWidth: '1px',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(96, 137, 75, 0.1)' : 'none',
      padding: '4px',
      minHeight: '44px',
      backgroundColor: 'white',
      '&:hover': {
        borderColor: '#60894B',
      },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? '#60894B' : state.isFocused ? '#f0f9ff' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#60894B' : '#f0f9ff',
      },
    }),
  };

  return (
    <>
      <JobListingStructuredData offers={offers} />
      <WebSiteStructuredData />
      <NavBar />
      <div className="min-h-screen bg-optional1">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-white via-optional1 to-green-50/30 pt-20 pb-20 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-primary/20 to-green-400/20 rounded-full blur-3xl opacity-60 pointer-events-none" />
          <div className="absolute bottom-0 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          <div className="container mx-auto px-4 max-w-7xl relative">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-green-100/50 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-sm font-medium text-primary">{offers.length} offres disponibles</span>
              </div>

              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-secondary mb-6 leading-tight tracking-tight">
                Trouvez votre{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-primary via-green-600 to-primary-1 bg-clip-text text-transparent">
                    emploi idéal
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 10C50 2 150 2 198 10" stroke="#60894B" strokeWidth="3" strokeLinecap="round" opacity="0.3"/>
                  </svg>
                </span>
              </h1>
              
              <p className="font-body text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Découvrez des opportunités de qualité au Maroc et postulez avec votre CV vidéo
              </p>
              
              {/* Quick Search */}
              <div className="max-w-2xl mx-auto">
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 group-focus-within:text-primary transition-colors" />
                  <Input
                    type="text"
                    placeholder="Rechercher par titre, entreprise, secteur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-14 pr-6 py-6 text-base border-2 border-gray-200 focus:border-primary shadow-lg hover:shadow-xl bg-white text-gray-900 placeholder-gray-500 rounded-2xl transition-all duration-300 font-body"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-8 max-w-7xl">
          {/* Filters */}
          <Card className="mb-8 border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center font-heading text-xl">
                <Filter className="h-5 w-5 mr-2 text-primary" />
                Filtres de recherche
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-body">
                    Secteur
                  </label>
                  {isClient ? (
                    <Select
                      instanceId="sector-select"
                      value={selectedSector ? { value: selectedSector, label: sectors.find(s => s.id === Number(selectedSector))?.name } : null}
                      onChange={(option) => {
                        setSelectedSector(option ? option.value : "");
                        setSelectedJob(""); // Reset job when sector changes
                      }}
                      options={Array.isArray(sectors) ? sectors.map(sector => ({ value: sector.id.toString(), label: sector.name })) : []}
                      placeholder="Tous les secteurs"
                      isClearable
                      styles={customSelectStyles}
                    />
                  ) : (
                    <div className="h-[44px] border border-gray-300 rounded-lg bg-white flex items-center px-3 text-gray-500">
                      Tous les secteurs
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-body">
                    Métier
                  </label>
                  {isClient ? (
                    <Select
                      instanceId="job-select"
                      value={selectedJob ? { value: selectedJob, label: availableJobs.find(j => j.id === Number(selectedJob))?.name } : null}
                      onChange={(option) => setSelectedJob(option ? option.value : "")}
                      options={Array.isArray(availableJobs) ? availableJobs.map(job => ({ value: job.id.toString(), label: job.name })) : []}
                      placeholder="Tous les métiers"
                      isClearable
                      isDisabled={!selectedSector}
                      styles={customSelectStyles}
                    />
                  ) : (
                    <div className="h-[44px] border border-gray-300 rounded-lg bg-gray-100 flex items-center px-3 text-gray-400">
                      Tous les métiers
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-body">
                    Ville
                  </label>
                  {isClient ? (
                    <Select
                      instanceId="city-select"
                      value={selectedCity ? { value: selectedCity, label: selectedCity } : null}
                      onChange={(option) => setSelectedCity(option ? option.value : "")}
                      options={availableCities.map(city => ({ value: city, label: city }))}
                      placeholder="Toutes les villes"
                      isClearable
                      styles={customSelectStyles}
                    />
                  ) : (
                    <div className="h-[44px] border border-gray-300 rounded-lg bg-white flex items-center px-3 text-gray-500">
                      Toutes les villes
                    </div>
                  )}
                </div>
              </div>

              {(selectedSector || selectedJob || selectedCity || searchQuery) && (
                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                  <p className="text-sm text-gray-600 font-body">
                    <span className="font-semibold text-primary">{filteredOffers.length}</span> offre(s) trouvée(s)
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="font-accent hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                  >
                    Effacer les filtres
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Offers Grid */}
          {!loading && (
            <>
              {paginatedOffers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                  {paginatedOffers.map((offer) => (
                    <div
                      key={offer.id}
                      onClick={() => router.push(`/offres/${offer.id}`)}
                      className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-primary/30 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
                    >
                      <div className="p-6 flex flex-col flex-1 gap-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-green-100/50 flex items-center justify-center flex-shrink-0 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                            <Building className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading text-base font-bold text-secondary line-clamp-2 group-hover:text-primary transition-colors leading-snug mb-1">
                              {offer.titre}
                            </h3>
                            <p className="font-body text-sm text-gray-600 truncate">{offer.company_name}</p>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-1 font-body">
                            {getDaysAgo(offer.id)}j
                          </span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {offer.location && (
                            <span className="inline-flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full font-medium font-body border border-purple-100">
                              <MapPin className="h-3.5 w-3.5" />
                              {offer.location}
                            </span>
                          )}
                          {offer.contractType && (
                            <span className="inline-flex items-center gap-1.5 text-xs bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full font-medium font-body border border-orange-100">
                              <Calendar className="h-3.5 w-3.5" />
                              {offer.contractType}
                            </span>
                          )}
                          {offer.sector_name && (
                            <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium font-body border border-blue-100">
                              <Briefcase className="h-3.5 w-3.5" />
                              {offer.sector_name}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="font-body text-sm text-gray-600 line-clamp-2 leading-relaxed flex-1">
                          {stripHtmlTags(offer.description)}
                        </p>

                        {/* CTA */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleApply(offer.id); }}
                          className="group/btn w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white font-accent font-bold text-sm py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          Postuler
                          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-16 border-2 border-dashed border-gray-200">
                  <CardContent>
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Briefcase className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-secondary mb-3">
                      Aucune offre trouvée
                    </h3>
                    <p className="font-body text-gray-600 mb-6 max-w-md mx-auto">
                      Essayez de modifier vos critères de recherche pour découvrir plus d'opportunités
                    </p>
                    <Button 
                      onClick={clearFilters} 
                      className="font-accent bg-primary hover:bg-primary-1 text-white"
                    >
                      Effacer les filtres
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="font-accent hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                  >
                    Précédent
                  </Button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 font-accent ${currentPage === page ? 'bg-primary hover:bg-primary-1' : 'hover:bg-primary hover:text-white hover:border-primary'} transition-all duration-300`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="font-accent hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PublicOffersPage;