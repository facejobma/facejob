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
  Star,
  Users,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  Bookmark,
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
  const [selectedVideoId, setSelectedVideoId] = useState<number|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const authToken = Cookies.get("authToken");
  const user =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user") || "{}"
      : "{}";

  const userId = user ? JSON.parse(user).id : null;

  // Calculate days since posting (mock data - you can replace with actual created_at)
  const daysAgo = Math.floor(Math.random() * 7) + 1;
  const isNew = daysAgo <= 3;
  const isUrgent = daysAgo <= 1;

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
    <div 
      className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 mb-6 overflow-hidden border border-gray-100 transform hover:-translate-y-2 ${isHovered ? 'scale-[1.02]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status Badges */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        {isUrgent && (
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
            <TrendingUp size={12} />
            URGENT
          </div>
        )}
        {isNew && !isUrgent && (
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Star size={12} />
            NOUVEAU
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handleBookmark}
          className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
            isBookmarked 
              ? 'bg-red-500 text-white' 
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={handleShare}
          className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-blue-500 transition-all duration-200 hover:scale-110"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* Enhanced Header Section */}
      <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-green-100 mb-2">
                <Building size={16} />
                <span className="text-sm font-medium">{entreprise_name}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{job_name}</h3>
              <div className="flex items-center gap-4 text-green-100">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span className="text-sm">{location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span className="text-sm">Il y a {daysAgo} jour{daysAgo > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>
          
          <button
            className="group/btn flex items-center gap-3 text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl border border-white/20 hover:border-white/40"
            onClick={openModal}
          >
            <span>Postuler maintenant</span>
            <ArrowRightCircle size={20} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>

      {/* Enhanced Content Section */}
      <div className="p-8">
        {/* Enhanced Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="group/item flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 hover:shadow-md transition-all duration-300">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-3 group-hover/item:scale-110 transition-transform duration-300">
              <Briefcase className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium">Secteur d'activité</p>
              <p className="font-bold text-gray-800 text-sm">{sector_name}</p>
            </div>
          </div>

          <div className="group/item flex items-center gap-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 hover:shadow-md transition-all duration-300">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-3 group-hover/item:scale-110 transition-transform duration-300">
              <ReceiptText className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium">Type de contrat</p>
              <p className="font-bold text-gray-800 text-sm">{contract_type}</p>
            </div>
          </div>
        </div>

        {/* Enhanced Description Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-2">
              <FileText className="text-white" size={20} />
            </div>
            <h4 className="font-bold text-gray-800 text-lg">Description du poste</h4>
          </div>
          
          <div className="relative">
            <div
              className={`text-gray-700 leading-relaxed prose prose-sm max-w-none ${
                showFullDescription ? "" : "max-h-32 overflow-hidden"
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: description || "Aucune description disponible." }} />
            </div>
            
            {!showFullDescription && (description?.length || 0) > 200 && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-100 to-transparent pointer-events-none"></div>
            )}
          </div>
          
          {(description?.length || 0) > 200 && (
            <button
              className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold mt-4 transition-colors duration-200 hover:gap-3"
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
                  Lire la suite
                </>
              )}
            </button>
          )}
        </div>

        {/* Enhanced Footer Stats */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Eye size={16} />
              <span>{Math.floor(Math.random() * 100) + 50} vues</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>{Math.floor(Math.random() * 20) + 5} candidatures</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-400">
            Publié le {date_debut ? new Date(date_debut).toLocaleDateString('fr-FR') : 'Date inconnue'}
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400/0 via-emerald-400/0 to-teal-400/0 group-hover:from-green-400/5 group-hover:via-emerald-400/5 group-hover:to-teal-400/5 transition-all duration-500 pointer-events-none"></div>

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 relative w-full max-w-md text-center transform animate-in zoom-in-95 duration-300">
            <div className="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Clock className="text-yellow-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Candidature déjà envoyée
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Vous avez déjà postulé à cette offre avec cette vidéo.
            </p>
            <button
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl px-8 py-4 font-semibold transition-all duration-200 hover:shadow-xl transform hover:scale-105"
              onClick={closeModal}
            >
              Compris
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Success Modal */}
      {isConfirmationVisible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 relative w-full max-w-md text-center transform animate-in zoom-in-95 duration-300">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Candidature envoyée !
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Votre candidature a été soumise avec succès. L'entreprise examinera votre profil prochainement.
            </p>
            <button
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl px-8 py-4 font-semibold transition-all duration-200 hover:shadow-xl transform hover:scale-105"
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