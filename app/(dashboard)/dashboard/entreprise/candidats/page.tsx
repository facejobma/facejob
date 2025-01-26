"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ResumePDF from "@/components/ResumePDF";
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
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null,
  );
  const [loadingPDF, setLoadingPDF] = useState<{ [key: number]: boolean }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateToConsume, setCandidateToConsume] =
    useState<Candidate | null>(null);
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

      // console.log("sector, ", sector.jobs);
      // console.log("filtered Jobs, ", filteredJobs);

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

  const fetchLastPayment = async () => {
    try {
      // setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/${companyId}/last`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      setLastPayment(data);
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
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/postule/all",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();
        setCandidates(data);
        // console.log("data, ", data);
      } catch (error) {
        console.error("Error fetching candidates:", error);
        toast.error("Error fetching candidates!");
      }
    };

    fetchCandidates();
    fetchSectors();
    fetchLastPayment();
    // setLoading(false);
  }, [authToken, companyId]);

  const handleGenerateCV = (candidateId: number) => {
    setLoadingPDF((prev) => ({ ...prev, [candidateId]: true }));
    setSelectedCandidate(candidateId);

    setTimeout(() => {
      setLoadingPDF((prev) => ({ ...prev, [candidateId]: false }));
    }, 500); // Simulating loading time
  };

  const handleConsumeClick = (candidate: Candidate) => {
    if (
      lastPayment &&
      lastPayment.status != "pending" &&
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
        // Check if the video has already been consumed by the enterprise
        const checkResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/check-consumption-status`,
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
          toast.error(
            "This video has already been consumed by your enterprise.",
          );
          return;
        }

        // If not consumed, proceed to consume the video
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/consume_cv_video",
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
          toast.success("Video consommée !");
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
    // Redirect to the upgrade plan page
    window.location.href = "/dashboard/entreprise/services";
  };

  const filteredCandidates = candidates.filter((candidate) => {
    return (
      candidate.is_verified === "Accepted" &&
      // lastPayment &&
      // lastPayment.cv_video_remaining > 0 &&
      (!selectedSector ||
        candidate.job?.sector_id === Number(selectedSector)) &&
      (!selectedJob || candidate.job.id === Number(selectedJob))
    );
  });

  // console.log("filteredCandidates, ", filteredCandidates);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 bg-gradient-to-br from-white to-gray-300 rounded-lg shadow-xl ">
      <BreadCrumb items={breadcrumbItems} />
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Vidéos des candidats
        </h1>
        <p className="text-gray-600 mb-4">
          Parcourez les vidéos pour trouver votre candidat idéal
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
          <div className="relative">
            <select
              className="block appearance-none w-full md:w-64 bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded-lg shadow focus:outline-none focus:shadow-outline"
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
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </div>
          </div>
          <div className="relative">
            <select
              className="block appearance-none w-full md:w-64 bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded-lg shadow focus:outline-none focus:shadow-outline"
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
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[calc(80vh-220px)]">
          <Circles
            height={80}
            width={80}
            color="#4fa94d"
            ariaLabel="circles-loading"
            visible={true}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <div
              key={`${candidate.cv_id}`}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-transform transform hover:-translate-y-1 duration-300"
            >
              {/* Video Section */}
              <div className="relative group">
                <video
                  src={candidate.link}
                  className="w-full h-56 object-cover"
                  controls
                >
                  Your browser does not support the video tag.
                </video>
                {/* Play Icon Hover Effect */}
                {/* <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-white text-2xl font-semibold">🎥</div>
                </div> */}
              </div>

              {/* Candidate Details Section */}
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-800">
                  {candidate.first_name[0]}. {candidate.last_name[0]}.
                </h3>
                <p className="text-gray-600">{candidate.job?.name}</p>
                <p className="text-gray-500 text-sm">
                  {candidate.nb_experiences} ans d'expérience
                </p>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
                  {selectedCandidate === candidate.id &&
                  !loadingPDF[candidate.id] ? (
                    <PDFDownloadLink
                      document={<ResumePDF candidateId={candidate.id} />}
                      fileName={`resume-${candidate.first_name}-${candidate.last_name}.pdf`}
                      className="bg-primary hover:bg-primary text-white font-medium py-2 px-4 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2"
                    >
                      {({ loading }) =>
                        loading ? (
                          <>
                            <div className="loader w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Génération...
                          </>
                        ) : (
                          "Consulter CV"
                        )
                      }
                    </PDFDownloadLink>
                  ) : (
                    <button
                      onClick={() => handleGenerateCV(candidate.id)}
                      className={`bg-gradient-to-b from-primary to-primary-2 hover:from-primary hover:to-primary text-white font-medium py-2 px-4 rounded-full transition-all duration-300 flex items-center gap-2 ${
                        loadingPDF[candidate.id] ? "cursor-wait opacity-75" : ""
                      }`}
                    >
                      {loadingPDF[candidate.id] ? (
                        <>
                          <div className="loader w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Génération...
                        </>
                      ) : (
                        "Extraire CV"
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleConsumeClick(candidate)}
                    className="bg-white hover:bg-gray-100 text-primary font-semibold py-2 px-4 rounded-full shadow-lg border border-primary transition-all duration-300 flex items-center gap-2"
                  >
                    Consommer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-8 rounded-lg shadow-lg z-10">
            <h2 className="text-xl font-semibold mb-8">
              Êtes-vous sûr de vouloir consommer cette vidéo de CV ?
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCancelConsume}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmConsume}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
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

export default Hiring;
