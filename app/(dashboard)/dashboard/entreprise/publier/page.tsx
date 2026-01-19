"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { Send } from "lucide-react";

interface Job {
  id: number;
  name: string;
}

interface Sector {
  id: number;
  name: string;
  jobs: Job[];
}

interface Payment {
  id: number;
  entreprise_id: number;
  job_remaining: number;
  job_posted: number;
  status: string;
}

const PublishOffer: React.FC = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [contractType, setContractType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const company = typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
  const companyId = company ? JSON.parse(company).id : null;

  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const userData =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user") || "{}"
      : "{}";

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/sectors",
        );
        const data = await response.json();
        setSectors(data);
      } catch (error) {
        console.error("Error fetching sectors:", error);
        toast.error("Error fetching sectors!");
      }
    };

    fetchSectors();
    fetchLastPayment();
  }, [authToken, companyId]);

  // Filter jobs based on selected sector
  const filteredJobs =
    sectors.find((sector) => sector.id === parseInt(selectedSector))?.jobs ||
    [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields
    if (
      !title ||
      !location ||
      !contractType ||
      !startDate ||
      !selectedSector ||
      !selectedJob
    ) {
      toast.error("Please fill in all required fields!");
      return;
    }

    if (
      lastPayment &&
      lastPayment.status == "Accepted" &&
      lastPayment.job_remaining > 0
    ) {
      setUploadStatus("uploading");

      try {
        const user = JSON.parse(userData);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/offre/create`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              titre: title,
              location,
              contractType,
              date_debut: startDate,
              date_fin: contractType === "CDD" ? endDate : ".",
              description,
              sector_id: selectedSector,
              job_id: selectedJob,
              entreprise_id: user.id,
            }),
          },
        );

        const responseData = await response.json();
        if (response.ok) {
          toast.success("Offer published successfully!");
          setUploadStatus("completed");
        } else {
          console.error("Response error:", responseData);
          toast.error("Failed to publish offer!");
          setUploadStatus("failed");
        }
      } catch (error) {
        console.error("Error publishing offer:", error);
        toast.error("An error occurred while publishing the offer!");
        setUploadStatus("failed");
      }
    } else {
      setIsUpgradeModalOpen(true);
    }
  };

  const fetchLastPayment = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/${companyId}/last`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      
      if (response.ok) {
        const data = await response.json();
        setLastPayment(data);
      } else if (response.status === 404) {
        // Handle "No payment found for this entreprise" case
        console.log("No payment found for this enterprise");
        setLastPayment(null);
        // Don't show error toast for new enterprises without payment
      } else {
        console.error("Error fetching last payment:", response.status);
        toast.error("Error fetching last payment!");
      }
    } catch (error) {
      console.error("Error fetching last payment:", error);
      toast.error("Error fetching last payment!");
    }
  };

  const handleUpgradePlan = () => {
    window.location.href = "/dashboard/entreprise/services";
  };

  return (
    <div className="space-y-8">
      {/* Header with enhanced design */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="text-2xl text-white w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Publier une offre</h1>
                <p className="text-indigo-100 mt-1">Créez et publiez votre offre d'emploi pour attirer les meilleurs candidats</p>
              </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg className="text-white text-lg w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{lastPayment?.job_remaining || 0}</p>
                    <p className="text-xs text-indigo-100">Offres restantes</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{lastPayment?.job_posted || 0}</p>
                    <p className="text-xs text-indigo-100">Publiées</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/30 flex items-center justify-center">
                    <svg className="text-white w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{sectors.length}</p>
                    <p className="text-xs text-indigo-100">Secteurs</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/30 flex items-center justify-center">
                    <svg className="text-white w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{lastPayment?.status === "Accepted" ? "Actif" : "Inactif"}</p>
                    <p className="text-xs text-indigo-100">Plan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="max-w-2xl mx-auto p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                className="block text-sm font-bold mb-2 text-gray-700"
                htmlFor="title"
              >
                Titre du poste
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Entrez le titre du poste"
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-sm font-bold mb-2 text-gray-700"
                htmlFor="location"
              >
                Lieu
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Entrez le lieu"
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-sm font-bold mb-2 text-gray-700"
                htmlFor="contractType"
              >
                Type de contrat
              </label>
              <select
                id="contractType"
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Sélectionnez le type de contrat</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Intérim ">Intérim</option>
                <option value="Contrat de chantier">Contrat de chantier</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div className="mb-6">
              <label
                className="block text-sm font-bold mb-2 text-gray-700"
                htmlFor="startDate"
              >
                Date de début
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {contractType === "CDD" && (
              <div className="mb-6">
                <label
                  className="block text-sm font-bold mb-2 text-gray-700"
                  htmlFor="endDate"
                >
                  Date de fin
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            <div className="mb-6">
              <label
                className="block text-sm font-bold mb-2 text-gray-700"
                htmlFor="secteur"
              >
                Secteur
              </label>
              <select
                id="secteur"
                value={selectedSector}
                onChange={(e) => {
                  setSelectedSector(e.target.value);
                  setSelectedJob("");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Sélectionnez un secteur</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label
                className="block text-sm font-bold mb-2 text-gray-700"
                htmlFor="job"
              >
                Métier
              </label>
              <select
                id="job"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Sélectionnez un métier</option>
                {filteredJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.name}
                  </option>
                ))}
                <option value={1}>Autre</option>
              </select>
            </div>

            <div className="mb-6">
              <label
                className="block text-sm font-bold mb-2 text-gray-700"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Entrez la description de l'offre"
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={uploadStatus === "uploading"}
                className={`group relative overflow-hidden w-full py-4 px-8 font-bold text-lg rounded-2xl shadow-xl transition-all duration-300 transform ${
                  uploadStatus === "uploading"
                    ? "bg-gray-400 cursor-not-allowed scale-95"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 hover:shadow-2xl active:scale-95"
                } text-white focus:outline-none focus:ring-4 focus:ring-green-300/50`}
              >
                {/* Background Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                {/* Content */}
                <div className="relative flex items-center justify-center gap-3">
                  {uploadStatus === "uploading" ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="tracking-wide">Publication en cours...</span>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <Send className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                        <div className="absolute inset-0 bg-white/30 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500"></div>
                      </div>
                      <span className="tracking-wide font-extrabold">Publier l'offre</span>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full group-hover:bg-white transition-colors duration-300"></div>
                        <div className="w-2 h-2 bg-white/40 rounded-full group-hover:bg-white/80 transition-colors duration-300 delay-75"></div>
                        <div className="w-2 h-2 bg-white/20 rounded-full group-hover:bg-white/60 transition-colors duration-300 delay-150"></div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/0 via-emerald-400/0 to-green-400/0 group-hover:from-green-400/20 group-hover:via-emerald-400/20 group-hover:to-green-400/20 transition-all duration-500"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-8 rounded-lg shadow-lg z-10">
            <h2 className="text-xl font-semibold mb-8">
              Vous avez atteint la limite de votre plan, veuillez souscrire à
              nouveau.
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleUpgradePlan}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                Mettre à niveau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishOffer;