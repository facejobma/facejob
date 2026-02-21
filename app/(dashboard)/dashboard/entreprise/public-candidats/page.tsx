"use client";

import React, { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { downloadResumePDF } from "@/components/ResumePDF";
import { 
  MapPin, Briefcase, GraduationCap, Code, Building2, 
  Calendar, Download, Check, User, Filter, X, ChevronDown, Volume2, VolumeX, FileText, Eye
} from "lucide-react";

interface Formation {
  id: number;
  school: string;
  diplome: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
}

interface Experience {
  id: number;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

interface Skill {
  id: number;
  name: string;
  category: string;
}

interface Candidate {
  id: number;
  cv_id: number;
  image: string;
  full_name: string;
  link: string;
  job: {
    id: number;
    name: string;
    sector_id: number;
  };
  city: string;
  years_of_experience: number;
  bio: string;
  formations: Formation[];
  experiences: Experience[];
  skills: Skill[];
}

interface Payment {
  id: number;
  cv_video_remaining: number;
  status: string;
}

const CandidatsPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const [currentVideoId, setCurrentVideoId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(null);
  const detailVideoRef = useRef<HTMLVideoElement | null>(null);
  
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const containerRef = useRef<HTMLDivElement>(null);

  // Fonction pour corriger les URLs avec des backslashes échappés
  const fixImageUrl = (url: string | null): string => {
    if (!url) return '';
    // Remplacer les backslashes échappés par des slashes normaux
    return url.replace(/\\\//g, '/');
  };

  // Fonction pour obtenir l'URL complète de l'image
  const getImageUrl = (imageUrl: string | null): string => {
    if (!imageUrl) return '';
    const fixedUrl = fixImageUrl(imageUrl);
    // Si l'URL commence par http, l'utiliser directement, sinon ajouter le chemin du backend
    return fixedUrl.startsWith('http') ? fixedUrl : `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${fixedUrl}`;
  };
  
  // Filters
  const [sectors, setSectors] = useState<any[]>([]);
  const [diplomes, setDiplomes] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [selectedSector, setSelectedSector] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [selectedGender, setSelectedGender] = useState<any>(null);
  const [selectedEducation, setSelectedEducation] = useState<any>(null);
  const [minExperience, setMinExperience] = useState<any>(null);
  const [maxExperience, setMaxExperience] = useState<any>(null);
  const [cities, setCities] = useState<string[]>([]);

  const company = typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
  const companyId = company ? JSON.parse(company).id : null;

  // Custom styles for react-select
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: 'white',
      borderColor: '#d1d5db',
      borderRadius: '0.75rem',
      minHeight: '40px',
      fontSize: '0.875rem',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '&:hover': {
        borderColor: '#10b981',
        boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
      }
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      fontSize: '0.875rem',
      zIndex: 50,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#d1fae5' : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#10b981'
      }
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#9ca3af'
    }),
    singleValue: (base: any) => ({
      ...base,
      color: '#1f2937'
    })
  };

  useEffect(() => {
    if (selectedSector) {
      const sector = sectors.find((sec) => sec.id === selectedSector.value);
      setFilteredJobs(sector ? sector.jobs : []);
      setSelectedJob(null);
    } else {
      setFilteredJobs([]);
    }
  }, [selectedSector, sectors]);

  const fetchSectors = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/sectors",
        { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } }
      );
      const result = await response.json();
      setSectors(Array.isArray(result.data || result) ? (result.data || result) : []);
    } catch (error) {
      console.error("Error fetching sectors:", error);
    }
  };

  const fetchDiplomes = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/diplomes",
        { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } }
      );
      const result = await response.json();
      setDiplomes(Array.isArray(result.data || result) ? (result.data || result) : []);
    } catch (error) {
      console.error("Error fetching diplomes:", error);
    }
  };

  const fetchLastPayment = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/payments/${companyId}/last`,
        { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } }
      );
      if (response.ok) {
        setLastPayment(await response.json());
      } else if (response.status === 404) {
        // No payment found - this is normal for new users
        setLastPayment(null);
      }
    } catch (error) {
      // Silently handle error - payment info is not critical for viewing candidates
      console.log("Payment info not available");
    }
  };

  const fetchCandidates = async (page: number, append: boolean = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "10",
      });
      
      if (selectedSector) params.append('sector_id', selectedSector.value);
      if (selectedJob) params.append('job_id', selectedJob.value);
      if (selectedCity) params.append('city', selectedCity.value);
      if (selectedGender) params.append('gender', selectedGender.value);
      if (selectedEducation) params.append('education_level', selectedEducation.value);
      if (minExperience) params.append('min_experience', minExperience.value);
      if (maxExperience) params.append('max_experience', maxExperience.value);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/postule/all?${params.toString()}`,
        { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } }
      );
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      
      if (result.data && Array.isArray(result.data)) {
        if (append) {
          setCandidates(prev => [...prev, ...result.data]);
        } else {
          setCandidates(result.data);
        }
        
        const uniqueCities = Array.from(new Set(
          result.data.map((c: Candidate) => c.city).filter(Boolean)
        ));
        setCities(uniqueCities as string[]);
        
        setHasMore(result.pagination?.has_more_pages || false);
      } else {
        if (!append) setCandidates([]);
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchCandidates(1, false);
  }, [selectedSector, selectedJob, selectedCity, selectedGender, selectedEducation, minExperience, maxExperience]);

  useEffect(() => {
    fetchSectors();
    fetchDiplomes();
    fetchLastPayment();
  }, []);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
      if (loadingMore || !hasMore) return;
      
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchCandidates(nextPage, true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage, loadingMore, hasMore]);

  // Intersection Observer to control video playback
  useEffect(() => {
    const observerOptions = {
      root: null,
      threshold: 0.5, // Video is considered "in view" when 50% visible
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const videoElement = entry.target as HTMLVideoElement;
        
        if (entry.isIntersecting) {
          // Play the current video (muted initially to avoid autoplay restrictions)
          videoElement.muted = isMuted;
          videoElement.play().catch(err => {
            // If play fails, ensure it's muted and try again
            console.log('Autoplay prevented, playing muted');
            videoElement.muted = true;
            videoElement.play().catch(e => console.log('Play failed:', e));
          });
        } else {
          // Pause and mute videos that are out of view
          videoElement.pause();
          videoElement.currentTime = 0; // Reset to beginning
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all video elements
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        observer.observe(video);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [candidates, isMuted]);

  const handleGenerateCV = async (candidateId: number) => {
    try {
      await downloadResumePDF(candidateId);
      toast.success("CV téléchargé !");
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleConsumeClick = (candidate: Candidate) => {
    if (!lastPayment || lastPayment.status === "pending" || lastPayment.cv_video_remaining <= 0) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleConfirmConsume = async () => {
    if (!selectedCandidate) return;
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/consumations`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            entreprise_id: companyId,
            postuler_id: selectedCandidate.cv_id,
          }),
        },
      );

      if (response.ok) {
        toast.success("CV consommé avec succès !");
        setIsModalOpen(false);
        setCandidates(prev => prev.filter(c => c.cv_id !== selectedCandidate.cv_id));
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle quota limit error specifically
        if (response.status === 402 && errorData.needs_upgrade) {
          setIsModalOpen(false);
          toast.error(errorData.message || "Vous avez atteint la limite de consultations de CV.", { duration: 5000 });
          // Show upgrade modal after a short delay
          setTimeout(() => {
            setIsUpgradeModalOpen(true);
          }, 500);
        } else {
          toast.error(errorData.message || "Erreur lors de la consommation du CV");
        }
      }
    } catch (error) {
      console.error("Error consuming CV:", error);
      toast.error("Erreur réseau. Veuillez réessayer.");
    }
  };

  const clearFilters = () => {
    setSelectedSector(null);
    setSelectedJob(null);
    setSelectedCity(null);
    setSelectedGender(null);
    setSelectedEducation(null);
    setMinExperience(null);
    setMaxExperience(null);
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    // Update all video elements
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.muted = newMutedState;
        // If unmuting, ensure the video is playing
        if (!newMutedState && video.paused) {
          video.play().catch(err => console.log('Play failed:', err));
        }
      }
    });
  };

  const handleVideoClick = (candidate: Candidate) => {
    setDetailCandidate(candidate);
    setIsDetailModalOpen(true);
    // Pause all other videos
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.pause();
      }
    });
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    if (detailVideoRef.current) {
      detailVideoRef.current.pause();
    }
    setDetailCandidate(null);
  };

  const hasActiveFilters = selectedSector || selectedJob || selectedCity || selectedGender || selectedEducation || minExperience || maxExperience;

  return (
    <div className="space-y-6">
      {/* Header Simple */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <User className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Candidats</h1>
              <p className="text-green-50 text-sm">Découvrez les profils disponibles</p>
            </div>
          </div>
          
          {lastPayment && lastPayment.status === "completed" && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
              <p className="text-green-50 text-xs font-medium">Crédits restants</p>
              <p className="text-2xl font-bold text-white">{lastPayment.cv_video_remaining}</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Filter Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full shadow-lg transition-colors"
      >
        <Filter className="w-5 h-5" />
        <span>Filtres</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 bg-white rounded-full"></span>
        )}
      </button>

      {/* Filters Modal */}
      {showFilters && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowFilters(false)}
          ></div>
          
          {/* Filters Panel */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Filtres de recherche</h2>
                <p className="text-sm text-gray-500">Les résultats se mettent à jour automatiquement</p>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Secteur */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Secteur</label>
                  <Select
                    value={selectedSector}
                    onChange={setSelectedSector}
                    options={sectors.map(s => ({ value: s.id, label: s.name }))}
                    styles={selectStyles}
                    placeholder="Tous les secteurs..."
                    isClearable
                    isSearchable
                  />
                </div>

                {/* Poste */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Poste</label>
                  <Select
                    value={selectedJob}
                    onChange={setSelectedJob}
                    options={filteredJobs.map(j => ({ value: j.id, label: j.name }))}
                    styles={selectStyles}
                    placeholder="Tous les postes..."
                    isClearable
                    isSearchable
                    isDisabled={!selectedSector}
                  />
                </div>

                {/* Ville */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ville</label>
                  <Select
                    value={selectedCity}
                    onChange={setSelectedCity}
                    options={cities.map(c => ({ value: c, label: c }))}
                    styles={selectStyles}
                    placeholder="Toutes les villes..."
                    isClearable
                    isSearchable
                  />
                </div>

                {/* Niveau d'études */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Niveau d'études</label>
                  <Select
                    value={selectedEducation}
                    onChange={setSelectedEducation}
                    options={diplomes.map(d => ({ value: d.id, label: d.name }))}
                    styles={selectStyles}
                    placeholder="Tous les niveaux..."
                    isClearable
                    isSearchable
                  />
                </div>

                {/* Expérience minimum */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expérience minimum</label>
                  <Select
                    value={minExperience}
                    onChange={setMinExperience}
                    options={[0, 1, 2, 3, 5, 7, 10].map(y => ({ value: y, label: `${y} an${y > 1 ? 's' : ''}` }))}
                    styles={selectStyles}
                    placeholder="Minimum..."
                    isClearable
                  />
                </div>

                {/* Expérience maximum */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expérience maximum</label>
                  <Select
                    value={maxExperience}
                    onChange={setMaxExperience}
                    options={[1, 2, 3, 5, 7, 10, 15, 20].map(y => ({ value: y, label: `${y} an${y > 1 ? 's' : ''}` }))}
                    styles={selectStyles}
                    placeholder="Maximum..."
                    isClearable
                  />
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Genre</label>
                  <Select
                    value={selectedGender}
                    onChange={setSelectedGender}
                    options={[
                      { value: 'male', label: 'Homme' },
                      { value: 'female', label: 'Femme' }
                    ]}
                    styles={selectStyles}
                    placeholder="Tous les genres..."
                    isClearable
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Réinitialiser tous les filtres
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Content Area */}
      <div>
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
              <p className="text-gray-600">Chargement des candidats...</p>
            </div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Aucun candidat trouvé</h2>
                <p className="text-gray-600 mb-4">Essayez de modifier vos critères de recherche</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Grid View */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate.cv_id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-green-300 hover:shadow-lg transition-all flex flex-col"
                >
                  {/* Video Preview */}
                  <div 
                    className="relative h-48 bg-black overflow-hidden cursor-pointer group"
                    onClick={() => handleVideoClick(candidate)}
                  >
                    <video
                      ref={(el) => { videoRefs.current[candidate.cv_id] = el; }}
                      src={candidate.link.startsWith('http') ? candidate.link : `${process.env.NEXT_PUBLIC_BACKEND_URL}/video/${candidate.link}`}
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="space-y-2 flex-1">
                      {/* Profile Header */}
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-500 flex-shrink-0">
                          {candidate.image ? (
                            <img 
                              src={getImageUrl(candidate.image)}
                              alt={candidate.full_name || 'Candidat'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // En cas d'erreur de chargement, afficher l'avatar par défaut
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold"
                            style={{ display: candidate.image ? 'none' : 'flex' }}
                          >
                            {candidate.full_name?.[0] || 'C'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-900 truncate">{candidate.full_name || 'Candidat'}</h3>
                          <p className="text-xs text-gray-600 truncate">{candidate.job?.name || 'Non spécifié'}</p>
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        {candidate.city && (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[80px]">{candidate.city}</span>
                          </span>
                        )}
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {candidate.years_of_experience} ans
                        </span>
                      </div>

                      {/* Skills Preview */}
                      {candidate.skills && candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {candidate.skills.slice(0, 2).map((s) => (
                            <span key={s.id} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs truncate max-w-[70px] font-medium">
                              {s.name}
                            </span>
                          ))}
                          {candidate.skills.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{candidate.skills.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 mt-auto border-t border-gray-100">
                      <button
                        onClick={() => handleGenerateCV(candidate.id)}
                        className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                        title="Télécharger le CV"
                      >
                        <FileText className="w-4 h-4" />
                        CV
                      </button>
                      <button
                        onClick={() => handleConsumeClick(candidate)}
                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                        title="Consulter"
                      >
                        <Eye className="w-4 h-4" />
                        Voir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile TikTok View */}
            <div className="md:hidden">
              {candidates.map((candidate) => (
              <div
                key={candidate.cv_id}
                className="min-h-screen snap-start relative flex items-center justify-center"
              >
                {/* Video Container - Full responsive */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Video Background */}
                  <video
                    ref={(el) => { videoRefs.current[candidate.cv_id] = el; }}
                    src={candidate.link.startsWith('http') ? candidate.link : `${process.env.NEXT_PUBLIC_BACKEND_URL}/video/${candidate.link}`}
                    className="w-full h-full object-contain bg-black"
                    loop
                    muted={isMuted}
                    playsInline
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 pb-20 pointer-events-none">
                    {/* Profile Info */}
                    <div className="space-y-3 pointer-events-auto">
                    {/* Name and Job */}
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-lg flex-shrink-0">
                        {candidate.image ? (
                          <img 
                            src={getImageUrl(candidate.image)}
                            alt={candidate.full_name || 'Candidat'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // En cas d'erreur de chargement, afficher l'avatar par défaut
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextElementSibling) {
                                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold"
                          style={{ display: candidate.image ? 'none' : 'flex' }}
                        >
                          {candidate.full_name?.[0] || 'C'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-white font-bold text-2xl mb-1">{candidate.full_name || 'Candidat'}</h2>
                        <p className="text-white/90 font-medium flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          {candidate.job?.name || 'Non spécifié'}
                        </p>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-2">
                      {candidate.city && (
                        <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-sm flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {candidate.city}
                        </div>
                      )}
                      <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-sm flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {candidate.years_of_experience} ans d'exp.
                      </div>
                    </div>

                    {/* Bio */}
                    {candidate.bio && (
                      <p className="text-white/90 text-sm line-clamp-3 bg-black/30 backdrop-blur-sm rounded-lg p-3">
                        {candidate.bio}
                      </p>
                    )}

                    {/* Education */}
                    {candidate.formations && candidate.formations.length > 0 && (
                      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3">
                        <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          Formation
                        </h3>
                        <div className="space-y-1">
                          {candidate.formations.slice(0, 2).map((f) => (
                            <div key={f.id} className="text-white/80 text-xs">
                              <p className="font-medium">{f.diplome} - {f.field_of_study}</p>
                              <p className="text-white/60">{f.school}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {candidate.experiences && candidate.experiences.length > 0 && (
                      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3">
                        <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Expérience
                        </h3>
                        <div className="space-y-1">
                          {candidate.experiences.slice(0, 2).map((e) => (
                            <div key={e.id} className="text-white/80 text-xs">
                              <p className="font-medium">{e.title}</p>
                              <p className="text-white/60">{e.company}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3">
                        <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                          <Code className="w-4 h-4" />
                          Compétences
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {candidate.skills.slice(0, 8).map((s) => (
                            <span
                              key={s.id}
                              className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  </div>

                  {/* Action Buttons (Right Side) - Inside video container */}
                  <div className="absolute right-2 bottom-24 flex flex-col gap-3 pointer-events-auto">
                    {/* Mute/Unmute Button */}
                    <button
                      onClick={toggleMute}
                      className="w-16 h-16 bg-gray-800/90 hover:bg-gray-700 rounded-full flex flex-col items-center justify-center shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
                      title={isMuted ? "Activer le son" : "Désactiver le son"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-6 h-6 text-white" />
                      ) : (
                        <Volume2 className="w-6 h-6 text-white" />
                      )}
                    </button>

                    {/* Download CV Button */}
                    <button
                      onClick={() => handleGenerateCV(candidate.id)}
                      className="flex flex-col items-center gap-1"
                      title="Télécharger le CV"
                    >
                      <div className="w-16 h-16 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110">
                        <FileText className="w-6 h-6 text-gray-700" />
                      </div>
                      <span className="text-white text-xs font-medium bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">CV</span>
                    </button>
                    
                    {/* View/Consume CV Button */}
                    <button
                      onClick={() => handleConsumeClick(candidate)}
                      className="flex flex-col items-center gap-1"
                      title="Consulter le CV complet"
                    >
                      <div className="w-16 h-16 bg-green-500/90 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 backdrop-blur-sm">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white text-xs font-medium bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">Voir</span>
                    </button>
                  </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
                  <ChevronDown className="w-8 h-8 text-white/50" />
                </div>
              </div>
            ))}
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="h-32 flex items-center justify-center mt-6">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white p-8 rounded-2xl shadow-2xl z-10 max-w-md w-full border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirmer</h2>
            <p className="text-gray-600 mb-6">
              Voulez-vous consulter ce CV vidéo ? Cette action consommera un crédit et est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmConsume}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {isUpgradeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsUpgradeModalOpen(false)}></div>
          <div className="bg-white p-8 rounded-2xl shadow-2xl z-10 max-w-md w-full border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limite atteinte</h2>
            <p className="text-gray-600 mb-6">
              Vous avez atteint votre limite de consultations. Mettez à niveau votre forfait pour consulter plus de CVs.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => window.location.href = "/dashboard/entreprise/services"}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
              >
                Mettre à niveau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal - Large Popup with Video and All Info */}
      {isDetailModalOpen && detailCandidate && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={closeDetailModal}
          ></div>
          
          {/* Modal Content */}
          <div className="fixed inset-4 md:inset-8 lg:inset-12 z-10 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-7xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                    {detailCandidate.image ? (
                      <img 
                        src={getImageUrl(detailCandidate.image)}
                        alt={detailCandidate.full_name || 'Candidat'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-lg font-bold"
                      style={{ display: detailCandidate.image ? 'none' : 'flex' }}
                    >
                      {detailCandidate.full_name?.[0] || 'C'}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{detailCandidate.full_name || 'Candidat'}</h2>
                    <p className="text-green-50 text-sm">{detailCandidate.job?.name || 'Non spécifié'}</p>
                  </div>
                </div>
                <button
                  onClick={closeDetailModal}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                  {/* Left Column - Video */}
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
                      <video
                        ref={detailVideoRef}
                        src={detailCandidate.link.startsWith('http') ? detailCandidate.link : `${process.env.NEXT_PUBLIC_BACKEND_URL}/video/${detailCandidate.link}`}
                        className="w-full h-full object-contain"
                        controls
                        autoPlay
                        loop
                      />
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <MapPin className="w-4 h-4" />
                          <span className="text-xs font-medium">Localisation</span>
                        </div>
                        <p className="text-gray-900 font-semibold">{detailCandidate.city || 'Non spécifié'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs font-medium">Expérience</span>
                        </div>
                        <p className="text-gray-900 font-semibold">{detailCandidate.years_of_experience} ans</p>
                      </div>
                    </div>

                    {/* Bio */}
                    {detailCandidate.bio && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          À propos
                        </h3>
                        <p className="text-gray-700 text-sm leading-relaxed">{detailCandidate.bio}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Details */}
                  <div className="space-y-4">
                    {/* Formations */}
                    {detailCandidate.formations && detailCandidate.formations.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-green-600" />
                          Formation
                        </h3>
                        <div className="space-y-3">
                          {detailCandidate.formations.map((formation) => (
                            <div key={formation.id} className="border-l-2 border-green-500 pl-3">
                              <p className="font-medium text-gray-900">{formation.diplome}</p>
                              <p className="text-sm text-gray-700">{formation.field_of_study}</p>
                              <p className="text-sm text-gray-600">{formation.school}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(formation.start_date).getFullYear()} - {new Date(formation.end_date).getFullYear()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expériences */}
                    {detailCandidate.experiences && detailCandidate.experiences.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-green-600" />
                          Expérience professionnelle
                        </h3>
                        <div className="space-y-3">
                          {detailCandidate.experiences.map((experience) => (
                            <div key={experience.id} className="border-l-2 border-green-500 pl-3">
                              <p className="font-medium text-gray-900">{experience.title}</p>
                              <p className="text-sm text-gray-700">{experience.company}</p>
                              {experience.location && (
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {experience.location}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(experience.start_date).getFullYear()} - {experience.is_current ? 'Présent' : new Date(experience.end_date).getFullYear()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Compétences */}
                    {detailCandidate.skills && detailCandidate.skills.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Code className="w-5 h-5 text-green-600" />
                          Compétences
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {detailCandidate.skills.map((skill) => (
                            <span
                              key={skill.id}
                              className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-3">
                <button
                  onClick={() => handleGenerateCV(detailCandidate.id)}
                  className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Télécharger le CV
                </button>
                <button
                  onClick={() => {
                    closeDetailModal();
                    handleConsumeClick(detailCandidate);
                  }}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Consulter ce profil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CandidatsPage;
