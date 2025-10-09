import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import Cookies from "js-cookie";
import {
  MapPin,
  Building,
  Briefcase,
  Calendar,
  FileText,
  ReceiptText,
  ArrowRightCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

interface OffreCardProps {
  offreId: number;
  titre: string;
  entreprise_name: string;
  sector_name: string;
  job_name: string;
  location: string;
  contract_type: string;
  date_debut: string;
  date_fin: string;
  description: string;
}

const OffreCard: React.FC<OffreCardProps> = ({
  offreId,
  titre,
  entreprise_name,
  sector_name,
  job_name,
  location,
  contract_type,
  date_debut,
  description,
  date_fin,
}) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalData, setModalData] = useState({
    titre: "",
    entreprise_name: "",
    sector_name: "",
    job_name: "",
  });
  const [videos, setVideos] = useState<
    { id: string; link: string; job_name: string; secteur_name: string }[]
  >([]);
  const [selectedVideo, setSelectedVideo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const authToken = Cookies.get("authToken");
  const user =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user") || "{}"
      : "{}";

  const userId = user ? JSON.parse(user).id : null;

  const checkProfileCompletion = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidate-profile/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
  
      const profileData = await response.json();
  
      console.log("profile Data of candidat: ", profileData);
  
      const requiredFields = [
        "bio",
        "projects",
        "skills",
        "experiences",
      ];
      const missingFields = requiredFields.filter(
        (field) => !profileData[field] || profileData[field].length === 0
      );
  
      if (missingFields.length > 0) {
        toast.error(`Please complete the following fields: ${missingFields.join(", ")}`);
        setIsProfileComplete(false);
      } else {
        setIsProfileComplete(true);
      }
    } catch (error) {
      setError("Error fetching profile");
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    if (modalIsOpen && userId) {
      const fetchVideos = async () => {
        setLoading(true);
        setError(null);

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidate-video/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error("Failed to fetch videos");
          }

          const data = await response.json();
          setVideos(data);
        } catch (error) {
          setError("Error fetching videos");
          console.error("Error fetching videos:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchVideos();
      checkProfileCompletion();
    }
  }, [modalIsOpen, userId]);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const openModal = () => {
    setModalData({ titre, entreprise_name, sector_name, job_name });
    setModalIsOpen(true);
    setAlreadyApplied(false);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setIsConfirmationVisible(false);
    setAlreadyApplied(false);
  };

  const handleVideoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVideo(event.target.value);
    console.log("🚀 ~ handleVideoChange ~ event.target.value:", event.target.value)
    setIsButtonDisabled(event.target.value === "");
  };

  const handleValidate = async (selectedVideo: string) => {
    if (!selectedVideo) {
      return;
    }

    try {
      setLoading(true);
      setIsButtonDisabled(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/postuler-offre`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            video_url: selectedVideo,
            candidat_id: userId,
            offre_id: offreId,
            postuler_id: selectedVideo,
          }),
        },
      );

      setIsConfirmationVisible(true);
      setSelectedVideo("");
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white  shadow-lg hover:shadow-xl transition-all duration-300 mb-6 overflow-hidden border border-gray-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2">{job_name}</h3>
            <div className="flex items-center gap-2 text-blue-100">
              <Building size={16} />
              <span className="text-sm font-medium">{entreprise_name}</span>
            </div>
          </div>
          <button
            className="flex items-center gap-2 text-white bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-xl px-5 py-2.5 font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg whitespace-nowrap"
            onClick={openModal}
          >
            Postuler
            <ArrowRightCircle size={20} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
            <div className="bg-primary bg-opacity-10 rounded-lg p-2">
              <Briefcase className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Secteur</p>
              <p className="font-semibold text-gray-800">{sector_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
            <div className="bg-primary bg-opacity-10 rounded-lg p-2">
              <MapPin className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Localisation</p>
              <p className="font-semibold text-gray-800">{location}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
            <div className="bg-primary bg-opacity-10 rounded-lg p-2">
              <ReceiptText className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Type de Contrat</p>
              <p className="font-semibold text-gray-800">{contract_type}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
            <div className="bg-primary bg-opacity-10 rounded-lg p-2">
              <Calendar className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Date de Démarrage</p>
              <p className="font-semibold text-gray-800">{date_debut.split(" ")[0]}</p>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="text-primary" size={20} />
            <h4 className="font-semibold text-gray-800">Description du poste</h4>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div
              className={`text-gray-700 leading-relaxed ${
                showFullDescription ? "" : "max-h-24 overflow-hidden relative"
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: description }} />
              {!showFullDescription && description.length > 200 && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-50 to-transparent"></div>
              )}
            </div>
            {description.length > 200 && (
              <button
                className="flex items-center gap-2 text-primary hover:text-blue-600 font-medium mt-3 transition-colors duration-200"
                onClick={toggleDescription}
              >
                {showFullDescription ? (
                  <>
                    <ChevronUp size={18} />
                    Afficher moins
                  </>
                ) : (
                  <>
                    <ChevronDown size={18} />
                    Afficher plus
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <Modal
        offreId={offreId}
        userId={userId}
        isOpen={modalIsOpen}
        onClose={closeModal}
        onValidate={handleValidate}
        titre={modalData.titre}
        job_name={modalData.job_name}
        entreprise_name={modalData.entreprise_name}
        sector_name={modalData.sector_name}
        videos={videos}
        selectedVideo={selectedVideo}
        onVideoChange={handleVideoChange}
      />

      {/* Already Applied Modal */}
      {alreadyApplied && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white  shadow-2xl p-8 relative w-full max-w-md text-center">
            <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock className="text-yellow-600" size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Candidature déjà envoyée
            </h2>
            <p className="text-gray-600 mb-6">
              Vous avez déjà postulé à cette offre avec cette vidéo.
            </p>
            <button
              className="bg-primary hover:bg-blue-600 text-white rounded-xl px-6 py-3 font-medium transition-all duration-200 hover:shadow-lg"
              onClick={closeModal}
            >
              Compris
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isConfirmationVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 relative w-full max-w-md text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Candidature envoyée !
            </h2>
            <p className="text-gray-600 mb-6">
              Votre candidature a été soumise avec succès. L'entreprise examinera votre profil prochainement.
            </p>
            <button
              className="bg-primary hover:bg-blue-600 text-white rounded-xl px-6 py-3 font-medium transition-all duration-200 hover:shadow-lg"
              onClick={closeModal}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffreCard;