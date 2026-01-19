"use client";

import React, { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import { Circles } from "react-loader-spinner";
import OffreCard from "@/components/offreCard";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { Search, Briefcase, Building, Grid3x3, X, Filter, MapPin, Calendar, TrendingUp } from "lucide-react";

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

  const sortedEntreprises = [...entreprises].sort((a, b) =>
    a.company_name.localeCompare(b.company_name)
  );

  const entrepriseOptions = sortedEntreprises.map((entreprise) => ({
    value: entreprise.id,
    label: entreprise.company_name,
  }));

  const customSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderRadius: '0.75rem',
      borderColor: state.isFocused ? '#10b981' : '#e5e7eb',
      borderWidth: '2px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none',
      padding: '0.25rem',
      minHeight: '48px',
      '&:hover': {
        borderColor: '#10b981',
      },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? '#10b981' 
        : state.isFocused 
        ? '#ecfdf5' 
        : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      padding: '12px 16px',
      '&:active': {
        backgroundColor: '#10b981',
      },
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#9ca3af',
      fontWeight: '500',
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

  const fetchSectors = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/sectors",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      setSectors(data);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      toast.error("Error fetching sectors!");
    }
  };

  const fetchEntreprises = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/entreprises",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      setEntreprises(data);
    } catch (error) {
      console.error("Error fetching entreprises:", error);
      toast.error("Error fetching entreprises!");
    }
  };

  useEffect(() => {
    const fetchOffres = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/offres`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch offers");
        }

        const data = await response.json();
        setOffres(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching offers:", error);
        setLoading(false);
      }
    };

    fetchOffres();
    fetchSectors();
    fetchEntreprises();
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
      <div className="flex items-center justify-center h-[calc(100vh-220px)] bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="text-center">
          <div className="relative">
            <Circles
              height="80"
              width="80"
              color="#10b981"
              ariaLabel="circles-loading"
              visible={true}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full opacity-20 animate-pulse"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium text-lg">Chargement des offres...</p>
          <p className="mt-2 text-gray-500 text-sm">Découvrez les meilleures opportunités</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 shadow-lg">
                <Briefcase className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Offres d'emploi
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Découvrez <span className="font-semibold text-green-600">{offres.length}</span> opportunité{offres.length > 1 ? 's' : ''} disponible{offres.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <TrendingUp size={16} />
                  <span className="text-sm font-medium">Nouvelles offres</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{offres.filter(o => new Date(o.created_at) > new Date(Date.now() - 7*24*60*60*1000)).length}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <Building size={16} />
                  <span className="text-sm font-medium">Entreprises</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{new Set(offres.map(o => o.entreprise_id)).size}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-10 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-2">
                <Filter className="text-green-600" size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Filtres de recherche</h2>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 font-medium transition-all duration-200 rounded-xl"
              >
                <X size={16} />
                Effacer tous les filtres
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <div className="bg-blue-100 rounded-lg p-1">
                <Search size={14} className="text-blue-600" />
              </div>
              Recherche globale
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par titre, entreprise, description, ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 px-4 py-3 pl-12 rounded-xl shadow-sm leading-tight focus:outline-none transition-all duration-200 font-medium"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="text-gray-400" size={18} />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Secteur Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div className="bg-green-100 rounded-lg p-1">
                  <Grid3x3 size={14} className="text-green-600" />
                </div>
                Secteur d'activité
              </label>
              <div className="relative">
                <select
                  className="w-full bg-white border-2 border-gray-200 hover:border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 px-4 py-3 pr-10 rounded-xl shadow-sm leading-tight focus:outline-none transition-all duration-200 appearance-none font-medium"
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
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="fill-current h-5 w-5" viewBox="0 0 20 20">
                    <path d="M7 10l5 5 5-5H7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Poste Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div className="bg-emerald-100 rounded-lg p-1">
                  <Briefcase size={14} className="text-emerald-600" />
                </div>
                Type de poste
              </label>
              <div className="relative">
                <select
                  className="w-full bg-white border-2 border-gray-200 hover:border-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 px-4 py-3 pr-10 rounded-xl shadow-sm leading-tight focus:outline-none transition-all duration-200 appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
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
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="fill-current h-5 w-5" viewBox="0 0 20 20">
                    <path d="M7 10l5 5 5-5H7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Entreprise Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div className="bg-teal-100 rounded-lg p-1">
                  <Building size={14} className="text-teal-600" />
                </div>
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
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div className="bg-purple-100 rounded-lg p-1">
                  <MapPin size={14} className="text-purple-600" />
                </div>
                Ville
              </label>
              <div className="relative">
                <select
                  className="w-full bg-white border-2 border-gray-200 hover:border-purple-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3 pr-10 rounded-xl shadow-sm leading-tight focus:outline-none transition-all duration-200 appearance-none font-medium"
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
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="fill-current h-5 w-5" viewBox="0 0 20 20">
                    <path d="M7 10l5 5 5-5H7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-sm text-gray-600 font-semibold">Filtres actifs:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                    <Search size={12} />
                    "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery("")}
                      className="hover:bg-blue-300 rounded-full p-1 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedCity && (
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                    <MapPin size={12} />
                    {selectedCity}
                    <button
                      onClick={() => setSelectedCity("")}
                      className="hover:bg-purple-300 rounded-full p-1 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedSector && (
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-green-200 text-green-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                    <Grid3x3 size={12} />
                    {sectors.find((s) => s.id === Number(selectedSector))?.name}
                    <button
                      onClick={() => setSelectedSector("")}
                      className="hover:bg-green-300 rounded-full p-1 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedJob && (
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                    <Briefcase size={12} />
                    {filteredJobs.find((j) => j.id === Number(selectedJob))?.name}
                    <button
                      onClick={() => setSelectedJob("")}
                      className="hover:bg-emerald-300 rounded-full p-1 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedEntreprise && (
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-100 to-teal-200 text-teal-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                    <Building size={12} />
                    {entrepriseOptions.find((e) => e.value === selectedEntreprise)?.label}
                    <button
                      onClick={() => setSelectedEntreprise("")}
                      className="hover:bg-teal-300 rounded-full p-1 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-lg">
              <span className="font-bold text-gray-800 text-xl">{filteredOffers.length}</span> offre{filteredOffers.length > 1 ? 's' : ''} trouvée{filteredOffers.length > 1 ? 's' : ''}
            </p>
            {filteredOffers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={16} />
                <span>Mis à jour récemment</span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Offers List */}
        {filteredOffers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredOffers.map((offre, index) => (
              <div 
                key={offre.id}
                className="transform transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <OffreCard
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
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center border border-white/20">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Search className="text-gray-400" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Aucune offre trouvée
            </h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Essayez de modifier vos critères de recherche pour découvrir plus d'opportunités passionnantes.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 hover:shadow-xl transform hover:scale-105"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OffresPage;