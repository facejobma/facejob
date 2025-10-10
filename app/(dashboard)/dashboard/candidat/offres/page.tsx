"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Circles } from "react-loader-spinner";
import OffreCard from "@/components/offreCard";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { Search, Briefcase, Building, Grid3x3, X, Filter } from "lucide-react";

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
      borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      padding: '0.25rem',
      '&:hover': {
        borderColor: '#3b82f6',
      },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? '#3b82f6' 
        : state.isFocused 
        ? '#eff6ff' 
        : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      '&:active': {
        backgroundColor: '#3b82f6',
      },
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

  const filteredOffers = offres.filter((offre) => {
    return (
      (!selectedSector || offre.sector_id === Number(selectedSector)) &&
      (!selectedJob || offre.job_id === Number(selectedJob)) &&
      (!selectedEntreprise ||
        offre.entreprise_id === Number(selectedEntreprise))
    );
  });

  const clearAllFilters = () => {
    setSelectedSector("");
    setSelectedJob("");
    setSelectedEntreprise("");
  };

  const hasActiveFilters = selectedSector || selectedJob || selectedEntreprise;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-220px)] bg-gray-50">
        <div className="text-center">
          <Circles
            height="80"
            width="80"
            color="#3b82f6"
            ariaLabel="circles-loading"
            visible={true}
          />
          <p className="mt-4 text-gray-600 font-medium">Chargement des offres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary bg-opacity-10 rounded-xl p-3">
              <Briefcase className="text-primary" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Offres d'emploi</h1>
              <p className="text-gray-600 mt-1">
                Découvrez {offres.length} opportunité{offres.length > 1 ? 's' : ''} disponible{offres.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-primary" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Filtres de recherche</h2>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="ml-auto flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
              >
                <X size={16} />
                Effacer tous les filtres
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Secteur Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Grid3x3 size={16} className="text-primary" />
                Secteur
              </label>
              <div className="relative">
                <select
                  className="w-full bg-white border-2 border-gray-200 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 px-4 py-3 pr-10 rounded-xl shadow-sm leading-tight focus:outline-none transition-all duration-200 appearance-none"
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
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Briefcase size={16} className="text-primary" />
                Poste
              </label>
              <div className="relative">
                <select
                  className="w-full bg-white border-2 border-gray-200 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 px-4 py-3 pr-10 rounded-xl shadow-sm leading-tight focus:outline-none transition-all duration-200 appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building size={16} className="text-primary" />
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
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-600 font-medium">Filtres actifs:</span>
                {selectedSector && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {sectors.find((s) => s.id === Number(selectedSector))?.name}
                    <button
                      onClick={() => setSelectedSector("")}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {selectedJob && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    {filteredJobs.find((j) => j.id === Number(selectedJob))?.name}
                    <button
                      onClick={() => setSelectedJob("")}
                      className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {selectedEntreprise && (
                  <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                    {entrepriseOptions.find((e) => e.value === selectedEntreprise)?.label}
                    <button
                      onClick={() => setSelectedEntreprise("")}
                      className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="mb-4">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-800">{filteredOffers.length}</span> offre{filteredOffers.length > 1 ? 's' : ''} trouvée{filteredOffers.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Offers List */}
        {filteredOffers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Aucune offre trouvée
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche pour trouver plus d'opportunités.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
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