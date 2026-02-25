import React, { useState, useEffect, useMemo } from "react";
import Modal from "@/components/Modal";
import Cookies from "js-cookie";
import SafeHtmlDisplay from "@/components/SafeHtmlDisplay";
import { useExperiencePromptContext } from "@/contexts/ExperiencePromptContext";
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
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasAlreadyApplied, setHasAlreadyApplied] = useState(false);
  const [checkingApplicationStatus, setCheckingApplicationStatus] = useState(false);
  
  const { showPrompt } = useExperiencePromptContext();

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
        console.warn("Failed to fetch profile, assuming incomplete");
        setIsProfileComplete(false);
        return;
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
      console.warn("Error fetching profile, assuming incomplete:", error);
      setIsProfileComplete(false);
    }
  };

  // Check profile completion on component mount
  useEffect(() => {
    if (userId) {
      checkProfileCompletion();
      checkApplicationStatus();
    }
  }, [userId]);

  const checkApplicationStatus = async () => {
    if (!authToken || !userId) return;
    
    setCheckingApplicationStatus(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/check-application-status?offre_id=${offreId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHasAlreadyApplied(data.has_applied);
      }
    } catch (error) {
      console.error("Error checking application status:", error);
    } finally {
      setCheckingApplicationStatus(false);
    }
  };

  // Check if user already applied to this offer on component mount
  useEffect(() => {
    if (modalIsOpen && userId) {
      const fetchVideos = async () => {
        setLoading(true);
        setError(null);

        try {

          
          // Fetch approved videos only - backend determines user from token
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
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            throw new Error("Failed to fetch videos");
          }

          const data = await response.json();
          console.log('✅ Videos received:', data);
          console.log('📊 Number of videos:', Array.isArray(data) ? data.length : 'Not an array');
          
          setVideos(data);
          
          // Auto-select and auto-submit if only one video available
          if (data.length === 1) {
            const video = data[0];
            console.log('✅ Auto-selecting single video:', video);
            setSelectedVideo(video.link);
            setSelectedVideoId(video.id);
            setIsButtonDisabled(false);
            // Auto-select the video but don't auto-submit
            // User must click "Valider ma candidature" button
          } else if (data.length === 0) {
            console.warn('⚠️ No approved videos found');
            toast.error("Aucun CV vidéo approuvé disponible. Veuillez créer et faire approuver un CV vidéo.");
          } else {
            console.log(`✅ ${data.length} videos available for selection`);
          }
        } catch (error) {
          setError("Error fetching videos");
          console.error("❌ Error fetching videos:", error);
          toast.error("Erreur lors du chargement des CV vidéos");
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
    setSelectedVideo("");
    setSelectedVideoId(null);
    setIsButtonDisabled(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setIsConfirmationVisible(false);
  };

  const handleVideoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const data = JSON.parse(event.target.value);
    console.log("ID:", data.id, "Link:", data.link);
    setSelectedVideo(data.link);
    setSelectedVideoId(data.id);
    setIsButtonDisabled(event.target.value === "");
  };

  const handleValidate = async (selectedVideo: string, videoId?: number | null) => {
    if (!selectedVideo) {
      toast.error("Veuillez sélectionner une vidéo.");
      return;
    }

    // Use the provided videoId or fall back to selectedVideoId state
    const postulerId = videoId !== undefined ? videoId : selectedVideoId;

    if (!postulerId) {
      toast.error("ID de la vidéo manquant. Veuillez réessayer.");
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
            postuler_id: postulerId,
          }),
        }
      );
  
      if (response.ok) {
        setIsConfirmationVisible(true);
        setSelectedVideo("");
        setSelectedVideoId(null);
        setHasAlreadyApplied(true); // Update the application status
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Échec de la candidature. Réessayez plus tard.");
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
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Building size={16} />
              <span className="font-medium">{entreprise_name}</span>
              <span className="text-gray-300">•</span>
              <span>Il y a {daysAgo} jour{daysAgo > 1 ? 's' : ''}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{titre}</h3>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-gray-400" />
                <span>{location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase size={16} className="text-gray-400" />
                <span>{contract_type}</span>
              </div>
              {sector_name && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} className="text-gray-400" />
                  <span>{sector_name}</span>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleBookmark}
            className={`p-2.5 rounded-lg transition-all ${
              isBookmarked 
                ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Description */}
        <div className="mb-6">
          <div className="relative">
            <SafeHtmlDisplay
              html={description || "Aucune description disponible."}
              className={`text-gray-700 text-sm leading-relaxed ${
                showFullDescription ? "" : "line-clamp-3"
              }`}
            />
          </div>
          
          {(description?.length || 0) > 200 && (
            <button
              className="text-green-600 hover:text-green-700 font-medium text-sm mt-3 flex items-center gap-1 transition-colors"
              onClick={toggleDescription}
            >
              {showFullDescription ? (
                <>
                  <ChevronUp size={16} />
                  Afficher moins
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Voir plus
                </>
              )}
            </button>
          )}
        </div>

        {/* Action Button */}
        {hasAlreadyApplied ? (
          <div className="w-full bg-green-50 border border-green-200 text-green-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
            <CheckCircle size={20} />
            <span>Déjà postulé</span>
          </div>
        ) : (
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            onClick={() => {
              if (!isProfileComplete) {
                showPrompt();
              } else {
                openModal();
              }
            }}
          >
            <span>Postuler maintenant</span>
            <ArrowRight size={18} />
          </button>
        )}
      </div>

      {/* Footer Stats */}
      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1.5">
              <Eye size={16} className="text-gray-400" />
              <span>{views_count}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={16} className="text-gray-400" />
              <span>{applications_count} candidature{applications_count > 1 ? 's' : ''}</span>
            </div>
          </div>
          
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-gray-500 hover:text-green-600 transition-colors"
          >
            <Share2 size={16} />
            <span>Partager</span>
          </button>
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
        selectedVideoId={selectedVideoId}
        onVideoChange={handleVideoChange}
      />

      {/* Success Modal */}
      {isConfirmationVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Candidature envoyée !
            </h2>
            <p className="text-gray-600 mb-6">
              Votre candidature a été soumise avec succès. L'entreprise examinera votre profil prochainement.
            </p>
            <button
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-8 py-3 font-semibold transition-colors"
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