import React, { useState, useEffect, useRef } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { FiUser } from "react-icons/fi";
import { OfferCandidatActions } from "../OfferCandidatActions";

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

interface JobData {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  company_name: string;
  sector_name: string;
  contractType: string;
  is_verified: string;
  applications: {
    candidat: Candidat;
    link: string;
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

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg max-w-md mx-auto mt-8 p-6">
      <h1 className="text-lg font-semibold mb-2 relative">
        {initialData.titre}
        <span className="absolute right-0 top-0 bg-green-700 text-white rounded-full px-2 py-1 text-xs">
          {initialData.candidats_count} Candidats
        </span>
      </h1>
      <p className="text-gray-600 text-center mt-4">
        {initialData.description}
      </p>

      <div className="mt-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Date de début</h2>
          <p className="text-gray-600">{initialData.date_debut}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Nom de l'entreprise</h2>
          <p className="text-blue-500 hover:underline">
            {initialData.company_name}
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Secteur</h2>
          <p className="text-gray-600">{initialData.sector_name}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Candidats</h2>
          <div className="max-h-60 overflow-y-auto">
            {displayedApplications?.map((application, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
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
                  <p className="text-gray-600">{`${application.candidat.first_name} ${application.candidat.last_name}`}</p>
                  <a
                    href="#"
                    onClick={() => {
                      setVideoLink(application.link);
                      setShowModal(true);
                    }}
                    className="text-blue-500 hover:underline"
                  >
                    Voir Cv video
                  </a>
                </div>
                <OfferCandidatActions data={application.candidat} />
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
      </div>

      <div className="flex justify-end mt-6 space-x-4">
        {isPending && (
          <>
            <button className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600">
              Accepter
            </button>
            <button className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600">
              Refuser
            </button>
          </>
        )}

        {isAccepted && (
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500 h-6 w-6" />
            <span className="text-green-500">Accepté</span>
          </div>
        )}

        {isDeclined && (
          <div className="flex items-center space-x-2">
            <XCircle className="text-red-500 h-6 w-6" />
            <span className="text-red-500">Refusé</span>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg overflow-hidden shadow-lg max-w-xl mx-auto p-6"
          >
            <iframe
              title="CV vidéo"
              src={videoLink || ""}
              className="w-full h-96"
              allowFullScreen
            ></iframe>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-full border border-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobForm;
