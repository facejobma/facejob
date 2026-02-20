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

  const fetchSectorsData = async () => {
    try {
      const data = await fetchSectors();
      // Ensure data is an array
      setSectors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      toast.error("Error fetching sectors!");
      setSectors([]); // Set empty array on error
    }
  };

  const fetchEntreprisesData = async () => {
    try {
      const data = await fetchEnterprises();
      // Ensure data is an array
      setEntreprises(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching entreprises:", error);
      toast.error("Error fetching entreprises!");
      setEntreprises([]); // Set empty array on error
    }
  };

  useEffect(() => {
    const fetchOffresData = async () => {
      try {
        const result = await fetchOffers();
        const data = result.data || result; // Handle both old and new API response formats
        setOffres(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching offers:", error);
        setLoading(false);
      }
    };

    fetchOffresData();
    fetchSectorsData();
    fetchEntreprisesData();
  }, [authToken]);

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

      // Other filters
      const matchesSector = !selectedSector || offre.sector_id === Number(selectedSector);
      const matchesJob = !selectedJob || offre.job_id === Number(selectedJob);
      const matchesEntreprise = !selectedEntreprise || offre.entreprise_id === Number(selectedEntreprise);

      return matchesSearch && matchesCity && matchesSector && matchesJob && matchesEntreprise;
    });
  }, [offres, debouncedSearchQuery, selectedCity, selectedSector, selectedJob, selectedEntreprise]);

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
  };

  const hasActiveFilters = selectedSector || selectedJob || selectedEntreprise || searchQuery || selectedCity;

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

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par titre, entreprise, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Secteur Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secteur d'activité
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
            >
              <option value="">Tous les secteurs</option>
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
          </div>

          {/* Poste Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de poste
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              disabled={!selectedSector}
            >
              <option value="">
                {selectedSector ? "Tous les postes" : "Sélectionnez d'abord un secteur"}
              </option>
              {filteredJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.name}
                </option>
              ))}
            </select>
          </div>

          {/* Entreprise Filter */}
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

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ville
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">Toutes les villes</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            />
          ))}
        </div>
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