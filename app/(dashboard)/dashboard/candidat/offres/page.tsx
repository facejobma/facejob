"use client";

import React, { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import { FullPageLoading } from "@/components/ui/loading";
import OffreCard from "@/components/offreCard";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { Search, Briefcase, Building, Grid3x3, X, Filter, MapPin, Calendar, TrendingUp, ChevronDown } from "lucide-react";
import { fetchSectors, fetchEnterprises, fetchOffers } from "@/lib/api";

const OffresPage: React.FC = () => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const [offres, setOffres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectors, setSectors] = useState<any[]>([]);
  const [entreprises, setEntreprises] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [selectedEntreprise, setSelectedEntreprise] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedApplicationStatus, setSelectedApplicationStatus] = useState<string>("");
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalOffers, setTotalOffers] = useState<number>(0);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const sortedEntreprises = Array.isArray(entreprises) 
    ? [...entreprises].sort((a, b) => a.company_name.localeCompare(b.company_name))
    : [];

  const entrepriseOptions = sortedEntreprises.map((entreprise) => ({
    value: entreprise.id,
    label: entreprise.company_name,
  }));

  const customSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderRadius: '8px',
      borderColor: state.isFocused ? '#4f46e5' : '#d1d5db',
      borderWidth: '1px',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(79, 70, 229, 0.1)' : 'none',
      padding: '0px',
      minHeight: '42px',
      height: '42px',
      backgroundColor: 'white',
      '&:hover': {
        borderColor: '#4f46e5',
      },
    }),
    valueContainer: (base: any) => ({
      ...base,
      padding: '2px 12px',
      height: '42px',
    }),
    input: (base: any) => ({
      ...base,
      margin: '0px',
      padding: '0px',
    }),
    indicatorsContainer: (base: any) => ({
      ...base,
      height: '42px',
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? '#4f46e5' 
        : state.isFocused 
        ? '#f3f4f6' 
        : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      padding: '12px 16px',
      '&:active': {
        backgroundColor: '#4f46e5',
      },
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#6b7280',
      fontWeight: '400',
    }),
  };

  useEffect(() => {
    if (selectedSector) {
      const sector = sectors.find((sec) => sec.id === Number(selectedSector));
      setFilteredJobs(sector ? sector.jobs : []);
      setSelectedJob("");
    } else {
      setFilteredJobs([]);
    }
  }, [selectedSector, sectors]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Log authentication info
        const user = typeof window !== "undefined" ? window.sessionStorage?.getItem("user") : null;
        const userId = user ? JSON.parse(user).id : null;
        console.log('🔐 Fetching offers with auth:', {
          hasToken: !!authToken,
          userId: userId,
          tokenPreview: authToken ? `${authToken.substring(0, 20)}...` : 'none'
        });

        // Fetch all data in parallel including profile analysis
        const [offersResult, sectorsData, entreprisesData, profileData] = await Promise.all([
          fetchOffers(currentPage, 15), // Fetch with pagination and authentication
          fetchSectors(),
          fetchEnterprises(),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate-profile`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }).then(res => res.ok ? res.json() : null)
        ]);

        console.log('📊 Offers result:', {
          totalOffers: offersResult.data?.length || 0,
          sampleHasApplied: offersResult.data?.[0]?.has_applied,
          pagination: offersResult.pagination
        });

        // Set offers with pagination info
        const offersData = offersResult.data || [];
        const pagination = offersResult.pagination || {};
        
        setOffres(Array.isArray(offersData) ? offersData : []);
        setTotalPages(pagination.last_page || 1);
        setTotalOffers(pagination.total || 0);

        // Set sectors
        setSectors(Array.isArray(sectorsData) ? sectorsData : []);

        // Set entreprises
        setEntreprises(Array.isArray(entreprisesData) ? entreprisesData : []);

        // Check profile completion once for all cards
        if (profileData) {
          const requiredFields = ["bio", "projects", "skills", "experiences"];
          const missingFields = requiredFields.filter(
            (field) => !profileData[field] || profileData[field].length === 0
          );
          setIsProfileComplete(missingFields.length === 0);
        } else {
          setIsProfileComplete(false);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Erreur lors du chargement des données");
        // Set empty arrays on error
        setOffres([]);
        setSectors([]);
        setEntreprises([]);
        setIsProfileComplete(false);
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchAllData();
    }
  }, [authToken, currentPage]);

  // Function to refresh offers after application
  const refreshOffers = async () => {
    try {
      const offersResult = await fetchOffers(currentPage, 15);
      const offersData = offersResult.data || [];
      setOffres(Array.isArray(offersData) ? offersData : []);
    } catch (error) {
      console.error("Error refreshing offers:", error);
    }
  };

  const filteredOffers = useMemo(() => {
    return offres.filter((offre) => {
      // Search filter
      const matchesSearch = !debouncedSearchQuery || 
        offre.titre?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        offre.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        offre.company_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        offre.sector_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        offre.job_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        offre.location?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        offre.contractType?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      // City filter
      const matchesCity = !selectedCity || offre.location === selectedCity;

      // Application status filter
      const matchesApplicationStatus = 
        !selectedApplicationStatus || 
        (selectedApplicationStatus === "applied" && offre.has_applied) ||
        (selectedApplicationStatus === "not_applied" && !offre.has_applied);

      // Other filters
      const matchesSector = !selectedSector || offre.sector_id === Number(selectedSector);
      const matchesJob = !selectedJob || offre.job_id === Number(selectedJob);
      const matchesEntreprise = !selectedEntreprise || offre.entreprise_id === Number(selectedEntreprise);

      return matchesSearch && matchesCity && matchesApplicationStatus && matchesSector && matchesJob && matchesEntreprise;
    });
  }, [offres, debouncedSearchQuery, selectedCity, selectedApplicationStatus, selectedSector, selectedJob, selectedEntreprise]);

  // Get unique cities from offers
  const availableCities = useMemo(() => {
    const cities = Array.from(new Set(offres.map(offre => offre.location).filter(Boolean)));
    return cities.sort();
  }, [offres]);

  const clearAllFilters = () => {
    setSelectedSector("");
    setSelectedJob("");
    setSelectedEntreprise("");
    setSearchQuery("");
    setSelectedCity("");
    setSelectedApplicationStatus("");
  };

  const hasActiveFilters = selectedSector || selectedJob || selectedEntreprise || searchQuery || selectedCity || selectedApplicationStatus;

  if (loading) {
    return (
      <FullPageLoading 
        message="Chargement des offres"
        submessage="Découvrez les meilleures opportunités"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Offres d'emploi
            </h1>
            <p className="text-gray-600 mt-1">
              {offres.length} offre{offres.length > 1 ? 's' : ''} disponible{offres.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {offres.filter(o => new Date(o.created_at) > new Date(Date.now() - 7*24*60*60*1000)).length}
              </div>
              <div className="text-sm text-gray-600">Cette semaine</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {new Set(offres.map(o => o.entreprise_id)).size}
              </div>
              <div className="text-sm text-gray-600">Entreprises</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Effacer tous les filtres
            </button>
          )}
        </div>

        {/* Search Bar and Status Filter - Same line */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
          
          <div>
            <Select
              options={[
                { value: "", label: "Toutes les offres" },
                { value: "applied", label: "Déjà postulé" },
                { value: "not_applied", label: "Non postulé" },
              ]}
              value={
                selectedApplicationStatus === "applied"
                  ? { value: "applied", label: "Déjà postulé" }
                  : selectedApplicationStatus === "not_applied"
                  ? { value: "not_applied", label: "Non postulé" }
                  : { value: "", label: "Toutes les offres" }
              }
              onChange={(selected) => setSelectedApplicationStatus(selected?.value || "")}
              placeholder="Toutes les offres"
              isClearable
              styles={customSelectStyles}
              className="w-full"
              noOptionsMessage={() => "Aucune option trouvée"}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Secteur Filter with react-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secteur d'activité
            </label>
            <Select
              options={[
                { value: "", label: "Tous les secteurs" },
                ...sectors.map((sector) => ({
                  value: sector.id.toString(),
                  label: sector.name,
                }))
              ]}
              value={
                selectedSector
                  ? { value: selectedSector, label: sectors.find((s) => s.id.toString() === selectedSector)?.name || "" }
                  : { value: "", label: "Tous les secteurs" }
              }
              onChange={(selected) => setSelectedSector(selected?.value || "")}
              placeholder="Tous les secteurs"
              isClearable
              styles={customSelectStyles}
              className="w-full"
              noOptionsMessage={() => "Aucun secteur trouvé"}
            />
          </div>

          {/* Poste Filter with react-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de poste
            </label>
            <Select
              options={[
                { value: "", label: selectedSector ? "Tous les postes" : "Sélectionnez d'abord un secteur" },
                ...filteredJobs.map((job) => ({
                  value: job.id.toString(),
                  label: job.name,
                }))
              ]}
              value={
                selectedJob
                  ? { value: selectedJob, label: filteredJobs.find((j) => j.id.toString() === selectedJob)?.name || "" }
                  : { value: "", label: selectedSector ? "Tous les postes" : "Sélectionnez d'abord un secteur" }
              }
              onChange={(selected) => setSelectedJob(selected?.value || "")}
              placeholder={selectedSector ? "Tous les postes" : "Sélectionnez d'abord un secteur"}
              isClearable
              isDisabled={!selectedSector}
              styles={customSelectStyles}
              className="w-full"
              noOptionsMessage={() => "Aucun poste trouvé"}
            />
          </div>

          {/* Entreprise Filter - Already using react-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entreprise
            </label>
            <Select
              options={entrepriseOptions}
              value={entrepriseOptions.find((opt) => opt.value === selectedEntreprise) || null}
              onChange={(selected) => setSelectedEntreprise(selected ? selected.value : "")}
              placeholder="Toutes les entreprises"
              isClearable
              styles={customSelectStyles}
              className="w-full"
              noOptionsMessage={() => "Aucune entreprise trouvée"}
            />
          </div>

          {/* City Filter with react-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ville
            </label>
            <Select
              options={[
                { value: "", label: "Toutes les villes" },
                ...availableCities.map((city) => ({
                  value: city,
                  label: city,
                }))
              ]}
              value={
                selectedCity
                  ? { value: selectedCity, label: selectedCity }
                  : { value: "", label: "Toutes les villes" }
              }
              onChange={(selected) => setSelectedCity(selected?.value || "")}
              placeholder="Toutes les villes"
              isClearable
              styles={customSelectStyles}
              className="w-full"
              noOptionsMessage={() => "Aucune ville trouvée"}
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600 font-medium">Filtres actifs:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedCity && (
                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {selectedCity}
                  <button
                    onClick={() => setSelectedCity("")}
                    className="hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedSector && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {sectors.find((s) => s.id === Number(selectedSector))?.name}
                  <button
                    onClick={() => setSelectedSector("")}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedJob && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                  {filteredJobs.find((j) => j.id === Number(selectedJob))?.name}
                  <button
                    onClick={() => setSelectedJob("")}
                    className="hover:bg-emerald-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedEntreprise && (
                <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm">
                  {entrepriseOptions.find((e) => e.value === selectedEntreprise)?.label}
                  <button
                    onClick={() => setSelectedEntreprise("")}
                    className="hover:bg-teal-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedApplicationStatus && (
                <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                  {selectedApplicationStatus === "applied" ? "Déjà postulé" : "Non postulé"}
                  <button
                    onClick={() => setSelectedApplicationStatus("")}
                    className="hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-900">{filteredOffers.length}</span> offre{filteredOffers.length > 1 ? 's' : ''} trouvée{filteredOffers.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Job Offers List */}
      {filteredOffers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredOffers.map((offre) => (
              <OffreCard
                key={offre.id}
                offreId={offre.id}
                titre={offre.titre}
                entreprise_name={offre.company_name}
                sector_name={offre.sector_name}
                job_name={offre.job_name}
                location={offre.location}
                contract_type={offre.contractType}
                date_debut={offre.date_debut}
                date_fin={offre.date_fin}
                description={offre.description}
                applications_count={offre.applications_count}
                views_count={offre.views_count}
                isProfileComplete={isProfileComplete}
                hasAlreadyApplied={offre.has_applied || false}
                onApplicationSuccess={refreshOffers}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-green-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune offre trouvée
          </h3>
          <p className="text-gray-600 mb-6">
            Essayez de modifier vos critères de recherche pour découvrir plus d'opportunités.
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OffresPage;