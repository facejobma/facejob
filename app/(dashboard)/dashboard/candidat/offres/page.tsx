"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Circles } from "react-loader-spinner";
import OffreCard from "@/components/offreCard";
import { toast } from "react-hot-toast";
import Select from "react-select";

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
  // Trier les entreprises par ordre alphabétique
  const sortedEntreprises = [...entreprises].sort((a, b) =>
    a.company_name.localeCompare(b.company_name)
  );

  // Transformer en format compatible avec react-select
  const options = sortedEntreprises.map((entreprise) => ({
    value: entreprise.id,
    label: entreprise.company_name,
  }));

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
        // console.log("Offres data:", data);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-220px)]">
        <Circles
          height="80"
          width="80"
          color="#4fa94d"
          ariaLabel="circles-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto bg-gray-100 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center space-x-4 mb-8">
          <div className="relative w-64">
            <select
              className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
            >
              <option value="">Sélectionner le Secteur</option>
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </div>
          </div>
          <div className="relative w-64">
            <select
              className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
            >
              <option value="">Sélectionner le Poste</option>
              {filteredJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </div>
          </div>
          <div className="relative w-64">
           <Select
      options={options}
      value={options.find((opt) => opt.value === selectedEntreprise) || null}
      onChange={(selected) => setSelectedEntreprise(selected ? selected.value : "")}
      placeholder="Sélectionner l’Entreprise"
      isClearable
      className="w-full"
    />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-6">Offres</h1>
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
    </div>
  );
};

export default OffresPage;
