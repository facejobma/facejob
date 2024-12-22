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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sectors`,
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

  // Mettre à jour les secteurs et métiers uniquement lors du montage du composant
  useEffect(() => {
    if (initialData.sector_id) {
      setSelectedSector(initialData.sector_id.toString());
    }
    if (initialData.job_id) {
      setSelectedJob(initialData.job_id.toString());
    }
  }, [initialData.sector_id, initialData.job_id]);

  // Fonction pour obtenir le nom du secteur par son ID
  const getSectorName = (sectorId: number) => {
    const sector = sectors.find((s) => s.id === sectorId);
    return sector ? sector.name : "Secteur inconnu";
  };

  // Fonction pour obtenir le nom du job par son ID
  const getJobName = (jobId: number) => {
    const sector = sectors.find((s) => s.id === initialData.sector_id);
    const job = sector?.jobs.find((j) => j.id === jobId);
    return job ? job.name : "Métier inconnu";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-xl mx-auto mt-8 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-primary">{initialData.titre}</h1>
        <span className="bg-green-700 text-white rounded-full px-2 py-1 text-xs flex-shrink-0 ml-4">
          {initialData.candidats_count} Candidats
        </span>
      </div>
      <div className="mb-4 flex items-center">
        <Building className="mr-2 text-primary" />
        <p>
          <strong>Entreprise :</strong> {initialData.company_name}
        </p>
      </div>
      <div className="mb-4 flex items-center">
        <ReceiptText className="mr-2 text-primary" />
        <p>
          <strong>Métier :</strong> {getJobName(initialData.job_id)}
        </p>
      </div>
      <div className="mb-4 flex items-center">
        <Calendar className="mr-2 text-primary" />
        <p>
          <strong>Date de Démarrage :</strong> {initialData.date_debut}
        </p>
      </div>
      <div className="mb-4 flex items-center">
        <Briefcase className="mr-2 text-primary" />
        <p>
          <strong>Type de Contrat :</strong> {initialData.contractType}
        </p>
      </div>
      <div className="mb-4 flex items-center">
        <MapPin className="mr-2 text-primary" />
        <p>
          <strong>Secteur :</strong> {getSectorName(initialData.sector_id)}
        </p>
      </div>

      <div className="mb-4 flex items-center">
        <FileText className="mr-2 text-primary" />
        <p>
          <strong>Description :</strong>
        </p>
      </div>
      <div className="bg-gray-100 rounded-lg p-4 mb-4">
        <p className="text-gray-600">{initialData.description}</p>
      </div>
      <div className="mb-4">
        <div className="mb-4 flex items-center">
          <User className="mr-2 text-primary" />
          <h2 className="text-lg font-semibold">Candidats</h2>
        </div>
        <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-4">
          {displayedApplications?.map((application, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 mb-2 border-b border-gray-200 pb-2"
            >
              {application.candidat.image ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={application.candidat.image}
                    alt={`${application.candidat.first_name} ${application.candidat.last_name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <FiUser className="text-gray-400 h-6 w-6" />
                </div>
              )}
              <div className="flex-grow">
                <p className="text-gray-600">
                  {`${application.candidat.first_name} ${application.candidat.last_name}`}
                </p>
                <p className="text-gray-500 text-sm">
                  {new Date(application.created_at).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <a
                  href="#"
                  onClick={() => {
                    setVideoLink(application.postuler.link);
                    setShowModal(true);
                  }}
                  className="text-blue-500 hover:underline"
                >
                  Voir Cv vidéo
                </a>
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
            className="text-blue-500 hover:underline mt-2 block"
          >
            {showAllCandidates ? "Voir moins" : "Voir plus"}
          </button>
        )}
      </div>
      <div className="flex justify-end mt-6 space-x-4">
        {isPending && (
          <>
            <button className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600">
              Accepter
            </button>
            <button className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600">
              Refuser
            </button>
          </>
        )}
        {isAccepted && (
          <button className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600">
            Approuvé
          </button>
        )}
        {isDeclined && (
          <button className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600">
            Refusé
          </button>
        )}
      </div>
      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div
            ref={modalRef}
            className="bg-white p-6 rounded-lg max-w-lg w-full space-y-4"
          >
            <h2 className="text-lg font-semibold">CV vidéo</h2>
            {videoLink && (
              <video
                src={videoLink}
                controls
                className="w-full h-60 object-cover"
              />
            )}
            <button
              onClick={() => setShowModal(false)}
              className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobForm;
