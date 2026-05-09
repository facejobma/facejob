"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Cookies from "js-cookie";
import { FullPageLoading } from "@/components/ui/loading";
import OffreCard from "@/components/offreCard";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { Search, X, Loader2 } from "lucide-react";
import { fetchSectors } from "@/lib/api";
import { useSearchParams } from "next/navigation";

const UI_STATE_KEY = 'facejob_dashboard_offres_ui_state';
const PAGE_SIZE = 12;

function readSavedState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(UI_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const OffresPage: React.FC = () => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const searchParams = useSearchParams();
  const offerIdFromUrl = searchParams.get('offerId');
  
  const [offres, setOffres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sectors, setSectors] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalOffers, setTotalOffers] = useState(0);
  const [autoOpenOfferId, setAutoOpenOfferId] = useState<number | null>(null);

  // Check profile completion on component mount
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!authToken) return;
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate-profile`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
        
        if (response.ok) {
          const profileData = await response.json();
          const requiredFields = ["bio", "projects", "skills", "experiences"];
          const missingFields = requiredFields.filter(
            (field) => !profileData[field] || profileData[field].length === 0
          );
          setIsProfileComplete(missingFields.length === 0);
          console.log('Profile completion checked on mount:', missingFields.length === 0);
        } else {
          setIsProfileComplete(false);
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
        setIsProfileComplete(false);
      }
    };

    checkProfileCompletion();
  }, [authToken]);

  // Handle offerId from URL (when redirected from public page)
  useEffect(() => {
    if (offerIdFromUrl) {
      const offerId = parseInt(offerIdFromUrl);
      if (!isNaN(offerId)) {
        console.log('Auto-opening application popup for offer:', offerId);
        setAutoOpenOfferId(offerId);
        
        // Clean up URL by removing the offerId parameter
        const url = new URL(window.location.href);
        url.searchParams.delete('offerId');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [offerIdFromUrl]);

  // Initialize all filter state from sessionStorage to survive back navigation
  const saved = useRef(readSavedState());
  const [selectedSector, setSelectedSector] = useState<string>(saved.current?.selectedSector ?? "");
  const [selectedJob, setSelectedJob] = useState<string>(saved.current?.selectedJob ?? "");
  const [searchQuery, setSearchQuery] = useState<string>(saved.current?.searchQuery ?? "");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>(saved.current?.searchQuery ?? "");
  const [selectedCity, setSelectedCity] = useState<string>(saved.current?.selectedCity ?? "");
  const [selectedApplicationStatus, setSelectedApplicationStatus] = useState<string>(saved.current?.selectedApplicationStatus ?? "");

  const sentinelRef = useRef<HTMLDivElement>(null);

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

  // Persist UI state on every change
  useEffect(() => {
    try {
      sessionStorage.setItem(UI_STATE_KEY, JSON.stringify({
        selectedSector,
        selectedJob,
        searchQuery,
        selectedCity,
        selectedApplicationStatus,
      }));
    } catch { /* quota exceeded */ }
  }, [selectedSector, selectedJob, searchQuery, selectedCity, selectedApplicationStatus]);

  const isFirstSectorEffect = useRef(true);
  useEffect(() => {
    if (selectedSector) {
      const sector = sectors.find((sec) => sec.id === Number(selectedSector));
      setFilteredJobs(sector ? sector.jobs : []);
      // Don't reset selectedJob on first render (restoring from cache)
      if (!isFirstSectorEffect.current) {
        setSelectedJob("");
      }
      isFirstSectorEffect.current = false;
    } else {
      setFilteredJobs([]);
      isFirstSectorEffect.current = false;
    }
  }, [selectedSector, sectors]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setOffres([]);
    setHasMore(true);
  }, [debouncedSearchQuery, selectedSector, selectedJob, selectedCity, selectedApplicationStatus]);

  // Load data progressively from backend
  useEffect(() => {
    const loadPage = async () => {
      try {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);

        // Build query parameters for filters
        const params = new URLSearchParams({
          page: currentPage.toString(),
          per_page: PAGE_SIZE.toString(),
        });

        if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
        if (selectedSector) params.append('sector_id', selectedSector);
        if (selectedJob) params.append('job_id', selectedJob);
        if (selectedCity) params.append('location', selectedCity);

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offres?${params}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error('Failed to fetch offers');
        
        const result = await response.json();
        const offersData = result.data || [];
        const pagination = result.pagination || {};

        if (currentPage === 1) {
          setOffres(offersData);
          
          // Fetch filter metadata only on first load
          try {
            // Fetch all filter metadata in one call
            const metadataRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offres/filter-metadata`, {
              headers: { 
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
                'ngrok-skip-browser-warning': 'true'
              }
            });

            if (metadataRes.ok) {
              const metadata = await metadataRes.json();
              setSectors(Array.isArray(metadata.sectors) ? metadata.sectors : []);
              setAvailableCities(Array.isArray(metadata.cities) ? metadata.cities : []);
              console.log('Filter metadata loaded:', metadata);
            } else {
              // Fallback: load all cities from a separate call
              try {
                const allOffersRes = await fetch(
                  `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offres?per_page=1000`,
                  { headers: { 
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                    'ngrok-skip-browser-warning': 'true'
                  } }
                );
                if (allOffersRes.ok) {
                  const allOffersData = await allOffersRes.json();
                  const cities = Array.from(
                    new Set((allOffersData.data || []).map((o: any) => o.location).filter(Boolean))
                  ).sort() as string[];
                  setAvailableCities(cities);
                  console.log('Cities loaded from all offers:', cities);
                } else {
                  // Final fallback: extract from current offers
                  const cities = Array.from(
                    new Set(offersData.map((o: any) => o.location).filter(Boolean))
                  ).sort() as string[];
                  setAvailableCities(cities);
                }
              } catch {
                const cities = Array.from(
                  new Set(offersData.map((o: any) => o.location).filter(Boolean))
                ).sort() as string[];
                setAvailableCities(cities);
              }
              
              // Fallback to old method for sectors
              const sectorsData = await fetchSectors();
              setSectors(Array.isArray(sectorsData) ? sectorsData : []);
            }

          } catch (error) {
            console.error('Error loading filter metadata:', error);
            // Fallback: extract data from current offers
            try {
              const sectorsData = await fetchSectors();
              setSectors(Array.isArray(sectorsData) ? sectorsData : []);
            } catch { /* ignore */ }
            
            const cities = Array.from(
              new Set(offersData.map((o: any) => o.location).filter(Boolean))
            ).sort() as string[];
            setAvailableCities(cities);
          }
        } else {
          setOffres(prev => [...prev, ...offersData]);
        }

        setHasMore(pagination.current_page < pagination.last_page);
        setTotalOffers(pagination.total || 0);

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Erreur lors du chargement des données");
        if (currentPage === 1) {
          setOffres([]);
          setSectors([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    if (authToken) {
      loadPage();
    }
  }, [authToken, currentPage, debouncedSearchQuery, selectedSector, selectedJob, selectedCity, selectedApplicationStatus]);

  // Function to update a specific offer's application status
  const updateOfferApplicationStatus = (offerId: number, hasApplied: boolean) => {
    setOffres(prevOffres => 
      prevOffres.map(offre => 
        offre.id === offerId 
          ? { ...offre, has_applied: hasApplied }
          : offre
      )
    );
  };

  // Function to refresh offers after application
  const refreshOffers = async () => {
    try {
      // Instead of clearing all offers and reloading, just update the local state
      // The OffreCard component already updates its local state (setLocalHasApplied)
      // So we don't need to do anything here to avoid disrupting the user experience
      console.log('Application submitted successfully - local state updated');
    } catch (error) {
      console.error("Error refreshing offers:", error);
    }
  };

  // Filter offers by application status only (other filters handled by backend)
  const displayedOffers = useMemo(() => {
    if (!selectedApplicationStatus) return offres;
    
    return offres.filter((offre) => {
      return (selectedApplicationStatus === "applied" && offre.has_applied) ||
             (selectedApplicationStatus === "not_applied" && !offre.has_applied);
    });
  }, [offres, selectedApplicationStatus]);

  // IntersectionObserver for infinite scroll - load next page from backend
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && !loading) {
          setCurrentPage(prev => prev + 1);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading]);

  const clearAllFilters = () => {
    setSelectedSector("");
    setSelectedJob("");
    setSearchQuery("");
    setSelectedCity("");
    setSelectedApplicationStatus("");
  };

  const hasActiveFilters = selectedSector || selectedJob || searchQuery || selectedCity || selectedApplicationStatus;

  if (!authToken) {
    return (
      <FullPageLoading 
        message="Authentification requise"
        submessage="Redirection en cours..."
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
              {(selectedSector || selectedJob || selectedCity || searchQuery || selectedApplicationStatus) ? 
                `${totalOffers} offre${totalOffers > 1 ? 's' : ''} trouvée${totalOffers > 1 ? 's' : ''}` : 
                `${totalOffers} offre${totalOffers > 1 ? 's' : ''} disponible${totalOffers > 1 ? 's' : ''}`
              }
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <span className="font-semibold text-gray-900">{displayedOffers.length}</span> offre{displayedOffers.length > 1 ? 's' : ''} trouvée{displayedOffers.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Job Offers List */}
      {displayedOffers.length > 0 ? (
        <>
          {/* Loading state for initial load */}
          {loading && offres.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
                <p className="text-gray-600">Chargement des offres...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayedOffers.map((offre, index) => (
                <OffreCard
                  key={`${offre.id}-${index}`}
                  offreId={offre.id}
                  titre={offre.titre}
                  entreprise_name={offre.company_name}
                  entreprise_logo={offre.company_logo}
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
                  onApplicationSuccess={() => updateOfferApplicationStatus(offre.id, true)}
                  autoOpenModal={autoOpenOfferId === offre.id}
                  onModalOpened={() => setAutoOpenOfferId(null)}
                />
              ))}
            </div>
          )}

          {/* Sentinel for infinite scroll */}
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center items-center py-10">
              {loadingMore && <Loader2 className="h-8 w-8 animate-spin text-green-600" />}
            </div>
          )}

          {/* End of results */}
          {!hasMore && displayedOffers.length > 0 && (
            <p className="text-center text-sm text-gray-400 py-10">
              Toutes les offres ont été chargées ({displayedOffers.length})
            </p>
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