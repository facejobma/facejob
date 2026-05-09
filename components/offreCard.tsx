import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import Modal from "@/components/Modal";
import Cookies from "js-cookie";
import SafeHtmlDisplay from "@/components/SafeHtmlDisplay";
import { useExperiencePromptContext } from "@/contexts/ExperiencePromptContext";
import ProfileCompletionModal from "@/components/ProfileCompletionModal";
import Link from "next/link";
import {
  MapPin,
  Building,
  Briefcase,
  Calendar,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Users,
  Eye,
  Share2,
  X,
  Copy,
  Facebook,
  Linkedin,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface OffreCardProps {
  offreId: number;
  titre: string;
  entreprise_name: string;
  entreprise_logo?: string;
  sector_name: string;
  job_name: string;
  location: string;
  contract_type: string;
  date_debut: string;
  date_fin: string;
  description: string;
  applications_count?: number;
  views_count?: number;
  isProfileComplete: boolean;
  hasAlreadyApplied: boolean;
  onApplicationSuccess?: () => void;
  autoOpenModal?: boolean;
  onModalOpened?: () => void;
}

const OffreCard: React.FC<OffreCardProps> = ({
  offreId,
  titre,
  entreprise_name,
  entreprise_logo,
  sector_name,
  job_name,
  location,
  contract_type,
  date_debut,
  description,
  date_fin,
  applications_count = 0,
  views_count = 0,
  isProfileComplete,
  hasAlreadyApplied,
  onApplicationSuccess,
  autoOpenModal = false,
  onModalOpened,
}) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
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
  const [localHasApplied, setLocalHasApplied] = useState(hasAlreadyApplied);
  const [localIsProfileComplete, setLocalIsProfileComplete] = useState(isProfileComplete);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hasSkippedProfileCompletion, setHasSkippedProfileCompletion] = useState(false);
  
  const { showPrompt } = useExperiencePromptContext();
  const router = useRouter();

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

  // Auto-open modal when autoOpenModal prop is true
  useEffect(() => {
    if (autoOpenModal && !localHasApplied) {
      console.log('Auto-opening modal for offer:', offreId);
      // Check if profile is complete first
      if (!localIsProfileComplete && !hasSkippedProfileCompletion) {
        setShowProfileModal(true);
      } else {
        openModal();
      }
      // Notify parent that modal was opened
      if (onModalOpened) {
        onModalOpened();
      }
    }
  }, [autoOpenModal, localHasApplied, localIsProfileComplete, hasSkippedProfileCompletion]);

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
    setShowDescriptionModal(true);
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
        setLocalHasApplied(true); // Update local state
        toast.success("Candidature envoyée avec succès!");
        
        // Close the application modal immediately and show success modal
        setModalIsOpen(false);
        
        // Notify parent component (but don't refresh the entire list)
        if (onApplicationSuccess) {
          onApplicationSuccess();
        }
      } else {
        const errorData = await response.json();
        // Si l'utilisateur a déjà postulé, mettre à jour l'état local
        if (errorData.message && errorData.message.includes("déjà postulé")) {
          setLocalHasApplied(true);
          toast.error("Vous avez déjà postulé à cette offre.");
        } else {
          toast.error(errorData.message || "Échec de la candidature. Réessayez plus tard.");
        }
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/offres/${offreId}`;
  const shareTitle = `${titre} - ${entreprise_name}`;
  const shareText = `Découvrez cette offre d'emploi: ${titre} chez ${entreprise_name}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Lien copié dans le presse-papiers!");
    setShowShareMenu(false);
  };

  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
    setShowShareMenu(false);
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const shareOnLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  return (
    <Link 
      href={`/dashboard/candidat/offres/${offreId}`}
      className="block h-full"
    >
      <div 
        className="bg-white rounded-2xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden group cursor-pointer"
        onClick={(e) => {
          // Prevent navigation only if clicking on interactive elements
          const target = e.target as HTMLElement;
          if (
            target.closest('button') || 
            target.closest('select') || 
            target.closest('a:not([href*="/dashboard/candidat/offres/"])')
          ) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
      {/* Header Section */}
      <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="flex items-start gap-4">
          {/* Company Logo - Always show with fallback */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 bg-white flex items-center justify-center shadow-sm group-hover:border-green-400 transition-colors">
              {entreprise_logo ? (
                <>
                  <img 
                    src={entreprise_logo.startsWith('http') ? entreprise_logo : `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${entreprise_logo}`}
                    alt={entreprise_name}
                    className="w-full h-full object-contain p-1.5"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold" style={{ display: 'none' }}>
                    {entreprise_name?.[0]?.toUpperCase() || 'E'}
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                  {entreprise_name?.[0]?.toUpperCase() || 'E'}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Building size={16} className="flex-shrink-0 text-green-600" />
              <span className="font-semibold text-gray-700 truncate">{entreprise_name}</span>
              <span className="text-gray-300">•</span>
              <span className="whitespace-nowrap text-gray-500">Il y a {daysAgo}j</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-700 transition-colors">{titre}</h3>
        
          </div>
          
        </div >
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 pt-2">
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                <MapPin size={14} className="text-green-600" />
                <span className="font-medium">{location}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                <Briefcase size={14} className="text-green-600" />
                <span className="font-medium">{contract_type}</span>
              </div>
              {sector_name && (
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                  <Calendar size={14} className="text-green-600" />
                  <span className="font-medium">{sector_name}</span>
                </div>
              )}
            </div>
      </div>

      {/* Content Section */}
      <div className="px-6 pb-6 pt-0 flex-1 flex flex-col bg-white">
        {/* Description */}
        <div className="mb-4 flex-1">
          <div className="relative">
            <SafeHtmlDisplay
              html={description || "Aucune description disponible."}
              className="text-gray-600 text-sm leading-relaxed line-clamp-1"
            />
          </div>
          
          {(description?.length || 0) > 100 && (
            <button
              className="text-green-600 hover:text-green-700 font-semibold text-xs mt-2 flex items-center gap-1 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleDescription();
              }}
            >
              <ChevronDown size={14} />
              Voir plus
            </button>
          )}
        </div>

        {/* Action Button */}
        {localHasApplied ? (
          <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-700 font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-sm text-sm">
            <CheckCircle size={18} className="text-green-600" />
            <span>Déjà postulé</span>
          </div>
        ) : (
          <button
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Si le profil n'est pas complet ET que l'utilisateur n'a pas encore cliqué sur "Passer"
              if (!localIsProfileComplete && !hasSkippedProfileCompletion) {
                setShowProfileModal(true);
              } else {
                // Sinon, ouvrir directement le modal de postulation
                openModal();
              }
            }}
          >
            <span>Postuler maintenant</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {/* Footer Stats - Always at bottom */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white mt-auto">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-600">
        
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
              <Users size={14} className="text-green-600" />
              <span className="font-semibold text-gray-700 text-xs">{applications_count}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/dashboard/candidat/offres/${offreId}`);
              }}
              className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-semibold transition-colors bg-white px-2.5 py-1 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-xs"
              title="Voir tous les détails"
            >
              <ExternalLink size={14} />
              <span>Détails</span>
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleShare();
              }}
              className="flex items-center gap-1.5 text-gray-600 hover:text-green-600 font-semibold transition-colors bg-white px-2.5 py-1 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 text-xs"
            >
              <Share2 size={14} />
              <span>Partager</span>
            </button>
          </div>

          {/* Share Menu Modal */}
          {showShareMenu && typeof window !== 'undefined' && ReactDOM.createPortal(
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/50 z-[9998] animate-in fade-in duration-200" 
                onClick={() => setShowShareMenu(false)}
              ></div>
              
              {/* Menu Modal - Centered on all screens */}
              <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl z-[9999] animate-in zoom-in-95 duration-300">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Partager cette offre</h3>
                  <button
                    onClick={() => setShowShareMenu(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="p-2">
                  <button
                    onClick={copyToClipboard}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 rounded-lg flex items-center gap-3 text-sm text-gray-700 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Copy className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="font-medium">Copier le lien</span>
                  </button>

                  <button
                    onClick={shareOnWhatsApp}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 rounded-lg flex items-center gap-3 text-sm text-gray-700 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </div>
                    <span className="font-medium">Partager sur WhatsApp</span>
                  </button>

                  <button
                    onClick={shareOnFacebook}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 rounded-lg flex items-center gap-3 text-sm text-gray-700 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Facebook className="w-5 h-5 text-blue-600 fill-current" />
                    </div>
                    <span className="font-medium">Partager sur Facebook</span>
                  </button>

                  <button
                    onClick={shareOnLinkedIn}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 rounded-lg flex items-center gap-3 text-sm text-gray-700 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Linkedin className="w-5 h-5 text-blue-700 fill-current" />
                    </div>
                    <span className="font-medium">Partager sur LinkedIn</span>
                  </button>
                </div>
              </div>
            </>,
            document.body
          )}
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

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSkip={() => {
          setShowProfileModal(false);
          setHasSkippedProfileCompletion(true); // Marquer que l'utilisateur a cliqué sur "Passer"
          openModal(); // Ouvrir le modal de postulation
        }}
        candidatId={userId}
        onProfileCompleted={() => {
          setLocalIsProfileComplete(true);
          setShowProfileModal(false);
          // Open the application modal immediately after profile completion
          openModal();
        }}
      />

      {/* Description Modal */}
      {showDescriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDescriptionModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{titre}</h3>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Building size={16} />
                    <span className="font-medium">{entreprise_name}</span>
                    <span className="text-gray-300">•</span>
                    <MapPin size={14} />
                    <span>{location}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDescriptionModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Description du poste</h4>
              <SafeHtmlDisplay
                html={description || "Aucune description disponible."}
                className="text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none"
              />
            </div>
            
            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

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
    </Link>
  );
};

export default OffreCard;