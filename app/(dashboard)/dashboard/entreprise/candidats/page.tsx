"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import ResumePDF, { downloadResumePDF } from "@/components/ResumePDF";

import BreadCrumb from "@/components/breadcrumb";
import { Circles } from "react-loader-spinner";

const breadcrumbItems = [
  { title: "Les CVs videos de candidats", link: "/dashboard/candidats" },
];

interface Candidate {
  id: number;
  cv_id: number;
  is_verified: string;
  image: string;
  first_name: string;
  last_name: string;
  link: string;
  job_id: number;
  job: {
    id: number;
    name: string;
    sector_id: number;
  };
  nb_experiences: number;
}

interface Payment {
  id: number;
  entreprise_id: number;
  cv_video_remaining: number;
  status: string;
}

const Hiring: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [loadingPDF, setLoadingPDF] = useState<{ [key: number]: boolean }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateToConsume, setCandidateToConsume] = useState<Candidate | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const [sectors, setSectors] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const company =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user")
      : null;
  const companyId = company ? JSON.parse(company).id : null;

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
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/sectors",
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

  const fetchLastPayment = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/payments/${companyId}/last`,
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
      } else {
        console.error("Error fetching last payment:", response.status);
        toast.error("Error fetching last payment!");
      }
    } catch (error) {
      console.error("Error fetching last payment:", error);
      toast.error("Error fetching last payment!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/postule/all",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();
        setCandidates(data);
      } catch (error) {
        console.error("Error fetching candidates:", error);
        toast.error("Error fetching candidates!");
      }
    };

    fetchCandidates();
    fetchSectors();
    fetchLastPayment();
  }, [authToken, companyId]);

const handleGenerateCV = async (candidateId: number) => {
  setLoadingPDF((prev) => ({ ...prev, [candidateId]: true }));
  setSelectedCandidate(candidateId);

  try {
    await downloadResumePDF(candidateId);
  } finally {
    // Quoi qu'il arrive (succès ou erreur), on désactive le spinner
    setLoadingPDF((prev) => ({ ...prev, [candidateId]: false }));
  }
};

  const handleConsumeClick = (candidate: Candidate) => {
    if (
      lastPayment &&
      lastPayment.status !== "pending" &&
      lastPayment.cv_video_remaining > 0
    ) {
      setCandidateToConsume(candidate);
      setIsModalOpen(true);
    } else {
      setIsUpgradeModalOpen(true);
    }
  };

  const handleConfirmConsume = async () => {
    if (candidateToConsume) {
      try {
        const checkResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/check-consumption-status`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              candidat_id: candidateToConsume.id,
              entreprise_id: companyId,
            }),
          },
        );

        if (!checkResponse.ok) {
          toast.error("Failed to check consumption status.");
          return;
        }

        const checkData = await checkResponse.json();

        if (checkData.consumed) {
          toast.error("This video has already been consumed by your enterprise.");
          return;
        }

        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/consume_cv_video",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              postuler_id: candidateToConsume.cv_id,
              entreprise_id: companyId,
            }),
          },
        );

        if (response.ok) {
          toast.success("Vidéo consommée !");
          fetchLastPayment();
        } else {
          toast.error("Failed to consume video.");
        }
      } catch (error) {
        console.error("Error consuming video:", error);
        toast.error("Error consuming video!");
      }
    }
    setIsModalOpen(false);
    setCandidateToConsume(null);
  };

  const handleCancelConsume = () => {
    setIsModalOpen(false);
    setCandidateToConsume(null);
  };

  const handleUpgradePlan = () => {
    window.location.href = "/dashboard/entreprise/services";
  };

  const filteredCandidates = candidates.filter((candidate) => {
    return (
      candidate.is_verified === "Accepted" &&
      (!selectedSector || candidate.job?.sector_id === Number(selectedSector)) &&
      (!selectedJob || candidate.job.id === Number(selectedJob))
    );
  });

  return (
    <div className="space-y-8">
      {/* Header with enhanced design */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="text-2xl text-white w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Vidéos des candidats</h1>
                <p className="text-indigo-100 mt-1">Parcourez les vidéos pour trouver votre candidat idéal</p>
              </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg className="text-white text-lg w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{filteredCandidates.length}</p>
                    <p className="text-xs text-indigo-100">Candidats</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{candidates.filter(c => c.is_verified === "Accepted").length}</p>
                    <p className="text-xs text-indigo-100">Vérifiés</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/30 flex items-center justify-center">
                    <svg className="text-white w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{lastPayment?.cv_video_remaining || 0}</p>
                    <p className="text-xs text-indigo-100">CV restants</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/30 flex items-center justify-center">
                    <svg className="text-white w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{sectors.length}</p>
                    <p className="text-xs text-indigo-100">Secteurs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Filtres de recherche</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
            <div className="relative w-full md:w-72 group">
              <select
                className="w-full bg-white border-2 border-gray-200 hover:border-blue-400 px-4 py-3 pr-10 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer text-gray-700 font-medium"
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
              >
                <option value="">Sélectionner le secteur</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-blue-500 group-hover:text-blue-600 transition-colors">
                <svg className="fill-current h-5 w-5" viewBox="0 0 20 20">
                  <path d="M7 10l5 5 5-5H7z" />
                </svg>
              </div>
            </div>
            
            <div className="relative w-full md:w-72 group">
              <select
                className="w-full bg-white border-2 border-gray-200 hover:border-purple-400 px-4 py-3 pr-10 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer text-gray-700 font-medium"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
              >
                <option value="">Sélectionner le poste</option>
                {filteredJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-purple-500 group-hover:text-purple-600 transition-colors">
                <svg className="fill-current h-5 w-5" viewBox="0 0 20 20">
                  <path d="M7 10l5 5 5-5H7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[calc(80vh-220px)] gap-6">
          <div className="relative">
            <Circles
              height={80}
              width={80}
              color="#4f46e5"
              ariaLabel="circles-loading"
              visible={true}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="text-2xl text-indigo-600 animate-pulse w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 mb-2">Chargement des candidats</p>
            <p className="text-sm text-gray-500">Veuillez patienter quelques instants...</p>
          </div>
        </div>
      ) : (
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredCandidates.map((candidate) => (
            <div
              key={`${candidate.cv_id}`}
              className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-primary/30"
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="aspect-video relative group/video">
                  <video
                    src={candidate.link}
                    className="w-full h-full object-cover cursor-pointer"
                    preload="metadata"
                    playsInline
                    id={`video-${candidate.id}`}
                    onPlay={(e) => {
                      // Arrêter toutes les autres vidéos
                      document.querySelectorAll('video').forEach((vid) => {
                        if (vid !== e.currentTarget && !vid.paused) {
                          vid.pause();
                        }
                      });
                      
                      const icon = e.currentTarget.parentElement?.querySelector('.play-pause-icon');
                      if (icon) icon.innerHTML = '<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />';
                    }}
                    onPause={(e) => {
                      const icon = e.currentTarget.parentElement?.querySelector('.play-pause-icon');
                      if (icon) icon.innerHTML = '<path d="M8 5v14l11-7z" />';
                    }}
                    onClick={(e) => {
                      if (e.currentTarget.paused) {
                        e.currentTarget.play();
                      } else {
                        e.currentTarget.pause();
                      }
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 bg-black/20 transition-all duration-300 pointer-events-none" />
                  
                  {/* Play/Pause Icon */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover/video:opacity-100 transition-opacity duration-300">
                      <svg className="play-pause-icon w-6 h-6 sm:w-8 sm:h-8 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Fullscreen Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const video = document.getElementById(`video-${candidate.id}`) as HTMLVideoElement;
                      if (video) {
                        if (video.requestFullscreen) {
                          video.requestFullscreen();
                        }
                      }
                    }}
                    className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-black/70 hover:bg-black/90 backdrop-blur-md rounded-lg flex items-center justify-center text-white transition-all duration-300 opacity-0 group-hover/video:opacity-100 z-10"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/70 backdrop-blur-md text-white text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-semibold shadow-lg">
                  {candidate.nb_experiences} ans
                </div>
              </div>

              <div className="p-4 sm:p-5 lg:p-6">
                <div className="mb-3 sm:mb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                      {candidate.first_name[0]}. {candidate.last_name[0]}.
                    </h3>
                    <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary-2 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md">
                      {candidate.first_name[0]}{candidate.last_name[0]}
                    </div>
                  </div>
                  <p className="text-primary font-semibold text-sm sm:text-base line-clamp-2">
                    {candidate.job?.name}
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">
                    {candidate.nb_experiences} années d'expérience
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleGenerateCV(candidate.id)}
                    disabled={loadingPDF[candidate.id]}
                    className={`w-full bg-gradient-to-r from-primary to-primary-2 hover:from-primary-2 hover:to-primary text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 ${
                      loadingPDF[candidate.id] ? "cursor-wait opacity-75" : ""
                    }`}
                  >
                    {loadingPDF[candidate.id] ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs sm:text-sm lg:text-base">Génération...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-xs sm:text-sm lg:text-base">Extraire CV</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleConsumeClick(candidate)}
                    className="w-full bg-white hover:bg-gradient-to-r hover:from-primary hover:to-primary-2 text-primary hover:text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg border-2 border-primary transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-xs sm:text-sm lg:text-base">Consommer</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancelConsume}></div>
          <div className="bg-white p-8 rounded-2xl shadow-2xl z-10 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Confirmer la consommation
              </h2>
              <p className="text-gray-600">
                Êtes-vous sûr de vouloir consommer cette vidéo de CV ?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelConsume}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmConsume}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-2 hover:from-primary-2 hover:to-primary text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {isUpgradeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsUpgradeModalOpen(false)}></div>
          <div className="bg-white p-8 rounded-2xl shadow-2xl z-10 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Limite atteinte
              </h2>
              <p className="text-gray-600">
                Vous avez atteint la limite de votre plan, veuillez souscrire à nouveau.
              </p>
            </div>
            <button
              onClick={handleUpgradePlan}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-2 hover:from-primary-2 hover:to-primary text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
            >
              Mettre à niveau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hiring;