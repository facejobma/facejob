"use client";

import React, { useEffect, useState, useMemo } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Search, Briefcase, Building, MapPin, Calendar, Filter, TrendingUp, Users, Clock, ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const offersPerPage = 12;

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
        const offersRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/offres`);
        
        if (offersRes.ok) {
          const offersData = await offersRes.json();
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
            const sectorsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sectors`);
            if (sectorsRes.ok) {
              const sectorsData = await sectorsRes.json();
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
      const matchesCompany = !selectedCompany || offer.entreprise_id === Number(selectedCompany);
      const matchesCity = !selectedCity || offer.location === selectedCity;

      return matchesSearch && matchesSector && matchesJob && matchesCompany && matchesCity;
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
    setSelectedCompany("");
    setSelectedCity("");
    setCurrentPage(1);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-primary-1 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Trouvez votre emploi idéal
              </h1>
              <p className="text-xl mb-8 text-green-100">
                Découvrez {offers.length} offres d'emploi de qualité au Maroc
              </p>
              
              {/* Quick Search */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                  <Input
                    type="text"
                    placeholder="Rechercher par titre, entreprise, secteur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-4 text-lg border-0 shadow-lg bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Briefcase className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total des offres</p>
                    <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Building className="h-8 w-8 text-primary-1" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Entreprises</p>
                    <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MapPin className="h-8 w-8 text-primary-2" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Villes</p>
                    <p className="text-2xl font-bold text-gray-900">{availableCities.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-primary-3" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Secteurs</p>
                    <p className="text-2xl font-bold text-gray-900">{sectors.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filtres de recherche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secteur
                  </label>
                  <Select
                    value={selectedSector ? { value: selectedSector, label: sectors.find(s => s.id === Number(selectedSector))?.name } : null}
                    onChange={(option) => {
                      setSelectedSector(option ? option.value : "");
                      setSelectedJob(""); // Reset job when sector changes
                    }}
                    options={sectors.map(sector => ({ value: sector.id.toString(), label: sector.name }))}
                    placeholder="Tous les secteurs"
                    isClearable
                    styles={customSelectStyles}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Métier
                  </label>
                  <Select
                    value={selectedJob ? { value: selectedJob, label: availableJobs.find(j => j.id === Number(selectedJob))?.name } : null}
                    onChange={(option) => setSelectedJob(option ? option.value : "")}
                    options={availableJobs.map(job => ({ value: job.id.toString(), label: job.name }))}
                    placeholder="Tous les métiers"
                    isClearable
                    isDisabled={!selectedSector}
                    styles={customSelectStyles}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entreprise
                  </label>
                  <Select
                    value={selectedCompany ? { value: selectedCompany, label: companies.find(c => c.id === Number(selectedCompany))?.company_name } : null}
                    onChange={(option) => setSelectedCompany(option ? option.value : "")}
                    options={companies.map(company => ({ value: company.id.toString(), label: company.company_name }))}
                    placeholder="Toutes les entreprises"
                    isClearable
                    styles={customSelectStyles}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <Select
                    value={selectedCity ? { value: selectedCity, label: selectedCity } : null}
                    onChange={(option) => setSelectedCity(option ? option.value : "")}
                    options={availableCities.map(city => ({ value: city, label: city }))}
                    placeholder="Toutes les villes"
                    isClearable
                    styles={customSelectStyles}
                  />
                </div>
              </div>

              {(selectedSector || selectedJob || selectedCompany || selectedCity || searchQuery) && (
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {filteredOffers.length} offre(s) trouvée(s)
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {paginatedOffers.map((offer) => (
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
                            {getDaysAgo(offer.id)}j
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
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Aucune offre trouvée
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Essayez de modifier vos critères de recherche
                    </p>
                    <Button onClick={clearFilters} variant="outline">
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
                  >
                    Précédent
                  </Button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className="w-10 h-10"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
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