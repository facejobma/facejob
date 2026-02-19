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
import { apiRequest, handleApiError } from "@/lib/apiUtils";
import RichTextEditor from "@/components/RichTextEditor";
import toast from "react-hot-toast";

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
  entreprise_id: number;
  applications: {
    candidat: Candidat;
    link: string;
    created_at: string;
    postuler: Postuler;
  }[];
  candidats_count: number;
}

const JobForm: React.FC<{ initialData: JobData; autoEdit?: boolean }> = ({ initialData, autoEdit = false }) => {
  const isPending = initialData.is_verified === "Pending";
  const isAccepted = initialData.is_verified === "Accepted";
  const isDeclined = initialData.is_verified === "Declined";

  const [showAllCandidates, setShowAllCandidates] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [videoLink, setVideoLink] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isEditing, setIsEditing] = useState(autoEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Local state for updated data
  const [currentData, setCurrentData] = useState(initialData);
  
  // Form state
  const [formData, setFormData] = useState({
    titre: initialData.titre,
    description: initialData.description,
    location: initialData.location,
    contractType: initialData.contractType,
    date_debut: initialData.date_debut ? initialData.date_debut.split('T')[0] : '',
    sector_id: initialData.sector_id,
    job_id: initialData.job_id,
    entreprise_id: initialData.entreprise_id,
  });

  const modalRef = useRef<HTMLDivElement>(null);

  const toggleShowAllCandidates = () => {
    setShowAllCandidates(!showAllCandidates);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Submitting offre update:', {
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/update_offre/${initialData.id}`,
        method: 'PUT',
        data: formData
      });
      
      const result = await apiRequest(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/update_offre/${initialData.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(formData),
        }
      );
      
      console.log('Update result:', result);
      
      if (result.success) {
        toast.success('Offre mise à jour avec succès!');
        setIsEditing(false);
        // Update local state with new data
        setCurrentData({
          ...currentData,
          ...formData
        });
      } else {
        toast.error(result.error || 'Une erreur est survenue');
        console.error('Update failed:', result);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        const result = await apiRequest(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/sectors`
        );
        
        if (result.success) {
          console.log("sectors data : ", result.data);
          const data = result.data || result;
          setSectors(Array.isArray(data) ? data : []);
        } else {
          console.error("Error fetching sectors:", result.error);
          setSectors([]); // Set empty array on error
        }
      } catch (error) {
        console.error("Error fetching sectors:", error);
        setSectors([]); // Set empty array on error
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Simple Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold">{isEditing ? "Modifier l'offre" : currentData.titre}</h1>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Modifier
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-green-50 text-sm">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span>{currentData.company_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{currentData.candidats_count} Candidat{currentData.candidats_count !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Simple Info Grid - Editable */}
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Titre de l'offre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Localisation
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Type de contrat
                </label>
                <select
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                >
                  <option value="">Sélectionner</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Stage">Stage</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Alternance">Alternance</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Date de début
              </label>
              <input
                type="date"
                name="date_debut"
                value={formData.date_debut}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                content={formData.description}
                onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                placeholder="Décrivez le poste, les responsabilités, les compétences requises..."
                minHeight="300px"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <ReceiptText className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Métier</p>
              <p className="text-sm font-semibold text-gray-800">{getJobName(currentData.job_id)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Date de début</p>
              <p className="text-sm font-semibold text-gray-800">
                {new Date(currentData.date_debut).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Briefcase className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Type de contrat</p>
              <p className="text-sm font-semibold text-gray-800">{currentData.contractType}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <MapPin className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Localisation</p>
              <p className="text-sm font-semibold text-gray-800">{currentData.location || "Non spécifié"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Building className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Secteur</p>
              <p className="text-sm font-semibold text-gray-800">{getSectorName(currentData.sector_id)}</p>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-800">Description</h2>
          </div>
          <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentData.description }}></div>
        </div>
          </>
        )}

        {/* Candidates Section */}
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">Candidatures ({initialData.candidats_count})</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedApplications?.map((application, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all p-4 flex flex-col"
              >
                {/* Header with Avatar and Name */}
                <div className="flex items-start gap-3 mb-3">
                  {application.candidat.image ? (
                    <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-green-100 flex-shrink-0">
                      <img
                        src={application.candidat.image.replace(/\\/g, '')}
                        alt={`${application.candidat.first_name} ${application.candidat.last_name}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `
                            <div class="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center ring-2 ring-green-100">
                              <svg class="text-green-600 h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          `;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center ring-2 ring-green-100 flex-shrink-0">
                      <FiUser className="text-green-600 h-7 w-7" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {`${application.candidat.first_name} ${application.candidat.last_name}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(application.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Bio Preview */}
                {application.candidat.bio && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {application.candidat.bio}
                  </p>
                )}

                {/* Experience Badge */}
                {application.candidat.years_of_experience > 0 && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <Briefcase className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-gray-600">
                      {application.candidat.years_of_experience} an{application.candidat.years_of_experience > 1 ? 's' : ''} d'expérience
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVideoLink(application.link);
                      setShowModal(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Voir CV vidéo
                  </button>
                  <OfferCandidatActions
                    candidat={application.candidat}
                    postuler={application.postuler}
                  />
                </div>
              </div>
            ))}
          </div>
          {initialData?.applications?.length > 4 && (
            <button
              onClick={toggleShowAllCandidates}
              className="w-full mt-4 py-2.5 text-green-600 hover:bg-green-50 rounded-lg font-medium transition-colors"
            >
              {showAllCandidates ? "Voir moins" : `Voir tous les candidats (${initialData.applications.length})`}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing ? (
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  titre: initialData.titre,
                  description: initialData.description,
                  location: initialData.location,
                  contractType: initialData.contractType,
                  date_debut: initialData.date_debut ? initialData.date_debut.split('T')[0] : '',
                  sector_id: initialData.sector_id,
                  job_id: initialData.job_id,
                  entreprise_id: initialData.entreprise_id,
                });
              }}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 font-medium rounded-lg transition-colors flex items-center gap-2 ${
                isSubmitting
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Enregistrer</span>
                </>
              )}
            </button>
          </div>
        ) : (
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
        )}
      </form>

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
                <div className="relative">
                  <video
                    src={videoLink.replace(/\\/g, '')}
                    controls
                    controlsList="nodownload"
                    className="w-full rounded-xl shadow-lg"
                    onError={(e) => {
                      // Si la vidéo ne charge pas, afficher un message d'erreur
                      e.currentTarget.style.display = 'none';
                      const errorDiv = document.createElement('div');
                      errorDiv.className = 'flex flex-col items-center justify-center gap-4 p-8 bg-red-50 rounded-xl border-2 border-dashed border-red-300 text-red-600';
                      errorDiv.innerHTML = `
                        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="font-medium">Impossible de charger la vidéo</p>
                        <a href="${videoLink.replace(/\\/g, '')}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                          Ouvrir dans un nouvel onglet
                        </a>
                      `;
                      e.currentTarget.parentElement?.appendChild(errorDiv);
                    }}
                  >
                    Votre navigateur ne supporte pas la lecture de vidéos.
                  </video>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobForm;