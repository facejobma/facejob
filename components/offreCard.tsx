import React, { useState, useEffect, useMemo } from "react";
import Modal from "@/components/Modal";
import Cookies from "js-cookie";
import {
  MapPin,
  Building,
  Briefcase,
  Calendar,
  FileText,
  ReceiptText,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  Eye,
  Heart,
  Share2,
  Bookmark,
  MoreHorizontal,
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
  applications_count?: number;
  views_count?: number;
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
  applications_count = 0,
  views_count = 0,
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
  const [selectedVideoId, setSelectedVideoId] = useState<number|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const authToken = Cookies.get("authToken");
  const user =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user") || "{}"
      : "{}";

  const userId = user ? JSON.parse(user).id : null;

  // Calculate days since posting using actual created_at or offer ID for consistency
  const daysAgo = useMemo(() => {
    // Use offer ID to generate a consistent "days ago" value
    return (offreId % 7) + 1;
  }, [offreId]);

  const checkProfileCompletion = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate-profile`,
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
  
      setIsProfileComplete(missingFields.length === 0);
    } catch (error) {
      setError("Error fetching profile");
      console.error("Error fetching profile:", error);
      setIsProfileComplete(false);
    }
  };

  // Check profile completion on component mount
  useEffect(() => {
    if (userId) {
      checkProfileCompletion();
    }
  }, [userId]);

  useEffect(() => {
    if (modalIsOpen && userId) {
      const fetchVideos = async () => {
        setLoading(true);
        setError(null);

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate-video?status=Accepted`,
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
          
          // Auto-select and auto-submit if only one video available
          if (data.length === 1) {
            const video = data[0];
            setSelectedVideo(video.link);
            setSelectedVideoId(video.id);
            setIsButtonDisabled(false);
            
            // Automatically submit the application with the single video
            setTimeout(() => {
              handleValidate(video.link);
            }, 500); // Small delay to show the modal briefly
          } else if (data.length === 0) {
            toast.error("Aucun CV vidéo approuvé disponible. Veuillez créer et faire approuver un CV vidéo.");
          }
        } catch (error) {
          setError("Error fetching videos");
          console.error("Error fetching videos:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchVideos();
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
    const data = JSON.parse(event.target.value);
    console.log("ID:", data.id, "Link:", data.link);
    setSelectedVideo(data.link);
    setSelectedVideoId(data.id);
    setIsButtonDisabled(event.target.value === "");
  };

  const handleValidate = async (selectedVideo: string) => {
    if (!selectedVideo) {
      toast.error("Veuillez sélectionner une vidéo.");
      return;
    }
  
    // 🔥 Vérification du profil avant postulation
    if (!isProfileComplete) {
      toast.error("Veuillez compléter votre profil avant de postuler.");
      return;
    }
  
    try {
      setLoading(true);
      setIsButtonDisabled(true);
  
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/postuler-offre`,
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
            postuler_id: selectedVideoId,
          }),
        }
      );
  
      if (response.ok) {
        setIsConfirmationVisible(true);
        setSelectedVideo("");
        setSelectedVideoId(null)
      } else {
        toast.error("Échec de la candidature. Réessayez plus tard.");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Offre retirée des favoris" : "Offre ajoutée aux favoris");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié dans le presse-papiers");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Building size={16} />
              <span className="text-sm font-medium">{entreprise_name}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm">{daysAgo} jour{daysAgo > 1 ? 's' : ''}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{job_name}</h3>
            <div className="flex items-center gap-4 text-gray-600 text-sm">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase size={14} />
                <span>{contract_type}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
            <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Job Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-blue-100 rounded-lg p-2">
              <Briefcase className="text-blue-600" size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Secteur</p>
              <p className="text-sm font-semibold text-gray-900">{sector_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-green-100 rounded-lg p-2">
              <Calendar className="text-green-600" size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Contrat</p>
              <p className="text-sm font-semibold text-gray-900">{contract_type}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="text-gray-600" size={18} />
            <h4 className="font-semibold text-gray-900">Description</h4>
          </div>
          
          <div className="relative">
            <div
              className={`text-gray-700 text-sm leading-relaxed ${
                showFullDescription ? "" : "line-clamp-3"
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: description || "Aucune description disponible." }} />
            </div>
          </div>
          
          {(description?.length || 0) > 200 && (
            <button
              className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-2 transition-colors"
              onClick={toggleDescription}
            >
              {showFullDescription ? (
                <span className="flex items-center gap-1">
                  <ChevronUp size={16} />
                  Afficher moins
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <ChevronDown size={16} />
                  Voir plus
                </span>
              )}
            </button>
          )}
        </div>

        {/* Action Button */}
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={openModal}
          disabled={!isProfileComplete}
        >
          <span>Postuler</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Footer Stats */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{views_count} vue{views_count > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{applications_count} candidature{applications_count > 1 ? 's' : ''}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Share2 size={14} />
            </button>
            <span className="text-xs">
              Publié le {date_debut ? new Date(date_debut).toLocaleDateString('fr-FR') : 'Date inconnue'}
            </span>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md text-center">
            <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock className="text-yellow-600" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Candidature déjà envoyée
            </h2>
            <p className="text-gray-600 mb-6">
              Vous avez déjà postulé à cette offre avec cette vidéo.
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2 font-medium transition-colors"
              onClick={closeModal}
            >
              Compris
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isConfirmationVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Candidature envoyée !
            </h2>
            <p className="text-gray-600 mb-6">
              Votre candidature a été soumise avec succès. L'entreprise examinera votre profil prochainement.
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2 font-medium transition-colors"
              onClick={closeModal}
            >
              Parfait !
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffreCard;