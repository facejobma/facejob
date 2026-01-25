import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  XCircle,
  User,
  MapPin,
  Building,
  Briefcase,
  Calendar,
  FileText,
  ReceiptText,
  ArrowRightCircle,
  X,
  Play,
} from "lucide-react";
import { FiUser } from "react-icons/fi";
import { OfferCandidatActions } from "../OfferCandidatActions";

interface Job {
  id: number;
  name: string;
}

interface Sector {
  id: number;
  name: string;
  jobs: Job[];
}

interface Candidat {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  tel: string;
  sex: string;
  bio: string;
  years_of_experience: number;
  is_completed: number;
  job_id: number;
  image: string | null;
  created_at: string;
  updated_at: string;
  address: string | null;
  zip_code: string | null;
}

interface Postuler {
  id: number;
  link: string;
}

interface JobData {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  company_name: string;
  sector_id: number;
  job_id: number;
  location: string;
  contractType: string;
  is_verified: string;
  applications: {
    candidat: Candidat;
    link: string;
    created_at: string;
    postuler: Postuler;
  }[];
  candidats_count: number;
}

const JobForm: React.FC<{ initialData: JobData }> = ({ initialData }) => {
  const isPending = initialData.is_verified === "Pending";
  const isAccepted = initialData.is_verified === "Accepted";
  const isDeclined = initialData.is_verified === "Declined";

  const [showAllCandidates, setShowAllCandidates] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [videoLink, setVideoLink] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [sectors, setSectors] = useState<Sector[]>([]);

  const modalRef = useRef<HTMLDivElement>(null);

  const toggleShowAllCandidates = () => {
    setShowAllCandidates(!showAllCandidates);
  };

  const displayedApplications = showAllCandidates
    ? initialData.applications
    : initialData?.applications?.slice(0, 4);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/sectors`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch sectors");
        }
        const data = await response.json();
        console.log("sectors data : ", data);
        setSectors(data);
      } catch (error) {
        console.error("Error fetching sectors:", error);
      }
    };

    fetchSectors();
  }, []);

  useEffect(() => {
    if (initialData.sector_id) {
      setSelectedSector(initialData.sector_id.toString());
    }
    if (initialData.job_id) {
      setSelectedJob(initialData.job_id.toString());
    }
  }, [initialData.sector_id, initialData.job_id]);

  const getSectorName = (sectorId: number) => {
    const sector = sectors.find((s) => s.id === sectorId);
    return sector ? sector.name : "Secteur inconnu";
  };

  const getJobName = (jobId: number) => {
    const sector = sectors.find((s) => s.id === initialData.sector_id);
    const job = sector?.jobs.find((j) => j.id === jobId);
    return job ? job.name : "Métier inconnu";
  };

  const getStatusBadge = () => {
    if (isPending) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
          En attente
        </span>
      );
    }
    if (isAccepted) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          Approuvé
        </span>
      );
    }
    if (isDeclined) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          <XCircle className="w-3.5 h-3.5" />
          Refusé
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50  shadow-xl max-w-4xl mx-auto mt-8 overflow-hidden border border-gray-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex justify-between items-start mb-3">
          <h1 className="text-3xl font-bold">{initialData.titre}</h1>
          {getStatusBadge()}
        </div>
        <div className="flex items-center gap-4 text-blue-100">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span className="text-sm font-medium">{initialData.company_name}</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/30 px-3 py-1 rounded-full">
            <User className="w-4 h-4" />
            <span className="text-sm font-semibold">{initialData.candidats_count} Candidats</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ReceiptText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Métier</p>
              <p className="text-sm font-semibold text-gray-800">{getJobName(initialData.job_id)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-2 bg-green-50 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Date de Démarrage</p>
              <p className="text-sm font-semibold text-gray-800">{initialData.date_debut}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Type de Contrat</p>
              <p className="text-sm font-semibold text-gray-800">{initialData.contractType}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-2 bg-orange-50 rounded-lg">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Secteur</p>
              <p className="text-sm font-semibold text-gray-800">{getSectorName(initialData.sector_id)}</p>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Description</h2>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">{initialData.description}</p>
          </div>
        </div>

        {/* Candidates Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Candidatures</h2>
          </div>
          <div className="space-y-3">
            {displayedApplications?.map((application, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all group"
              >
                {application.candidat.image ? (
                  <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-blue-100 group-hover:ring-blue-300 transition-all">
                    <img
                      src={application.candidat.image}
                      alt={`${application.candidat.first_name} ${application.candidat.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center ring-2 ring-blue-100 group-hover:ring-blue-300 transition-all">
                    <FiUser className="text-blue-600 h-7 w-7" />
                  </div>
                )}
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800">
                    {`${application.candidat.first_name} ${application.candidat.last_name}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(application.created_at).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <button
                    onClick={() => {
                      setVideoLink(application.link);
                      setShowModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium group/button"
                  >
                    <Play className="w-3.5 h-3.5 group-hover/button:scale-110 transition-transform" />
                    Voir CV vidéo
                  </button>
                </div>
                <OfferCandidatActions
                  candidat={application.candidat}
                  postuler={application.postuler}
                />
              </div>
            ))}
          </div>
          {initialData?.applications?.length > 4 && (
            <button
              onClick={toggleShowAllCandidates}
              className="w-full mt-4 py-2.5 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
            >
              {showAllCandidates ? "Voir moins" : `Voir tous les candidats (${initialData.applications.length})`}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          {isPending && (
            <>
              <button className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Accepter
              </button>
              <button className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Refuser
              </button>
            </>
          )}
          {isAccepted && (
            <button className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium shadow-md cursor-default flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approuvé
            </button>
          )}
          {isDeclined && (
            <button className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium shadow-md cursor-default flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Refusé
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div
            ref={modalRef}
            className="bg-white max-w-3xl w-full  animate-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">CV Vidéo</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {videoLink && (
                <>
                  {videoLink.endsWith(".mp4") || videoLink.endsWith(".webm") || videoLink.endsWith(".ogg") ? (
                    <video
                      src={videoLink}
                      controls
                      className="w-full rounded-xl shadow-lg"
                    />
                  ) : (
                    <a
                      href={videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 p-8 bg-blue-50 hover:bg-blue-100 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 font-medium transition-colors"
                    >
                      <FileText className="w-6 h-6" />
                      Ouvrir le fichier dans un nouvel onglet
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobForm;