"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { downloadResumePDF } from "@/components/ResumePDF";
import { LANGUAGE_OPTIONS } from "@/constants/languages";
import { useUser } from "@/hooks/useUser";
import { 
  MapPin, Briefcase, GraduationCap, Code, Building2, 
  Calendar, Check, User, Filter, X, Eye, FileText, RefreshCw, SlidersHorizontal, Video
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
  created_at: string;
}

interface Payment {
  id: number;
  cv_video_remaining?: number;
  contact_access_remaining?: number | string;
  status: string;
}

interface CandidateFilters {
  sector: any | null;
  job: any | null;
  city: string;
  education: any | null;
  language: any | null;
  minExperience: any | null;
  maxExperience: any | null;
}

const EMPTY_FILTERS: CandidateFilters = {
  sector: null,
  job: null,
  city: "",
  education: null,
  language: null,
  minExperience: null,
  maxExperience: null,
};

const CandidatsPage: React.FC = () => {
  const { user, isLoading: userLoading } = useUser();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const [currentVideoId, setCurrentVideoId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [candidateToConsume, setCandidateToConsume] = useState<Candidate | null>(null);
  const [isConsuming, setIsConsuming] = useState(false);
  const detailVideoRef = useRef<HTMLVideoElement | null>(null);
  
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper function to get remaining credits
  const getRemainingCredits = (): number => {
    if (!lastPayment) return 0;
    
    // Check for contact_access_remaining first (new API format)
    if (lastPayment.contact_access_remaining !== undefined) {
      if (lastPayment.contact_access_remaining === 'unlimited') return 999;
      return typeof lastPayment.contact_access_remaining === 'number' 
        ? lastPayment.contact_access_remaining 
        : parseInt(lastPayment.contact_access_remaining) || 0;
    }
    
    // Fallback to cv_video_remaining (old format)
    if (lastPayment.cv_video_remaining !== undefined) {
      return lastPayment.cv_video_remaining;
    }
    
    return 0;
  };

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

    if (fixedUrl.startsWith('http')) {
      return `/local-api/image-proxy?url=${encodeURIComponent(fixedUrl)}`;
    }

    return `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/storage/${fixedUrl}`;
  };

  // Point the <video> tag straight at the source (S3/UploadThing/backend) instead
  // of routing it through /local-api/video-proxy. That proxy runs as an Amplify
  // Lambda, which has a hard response-size limit — any real video file exceeds it
  // and the request fails with 413, regardless of which storage host it's on. The
  // admin panel never had this problem because it always used a direct src; this
  // page is now doing the same.
  const getVideoUrl = (videoUrl: string | null): string => {
    if (!videoUrl) return '';

    const fixedUrl = fixImageUrl(videoUrl);

    if (fixedUrl.startsWith('http')) {
      return fixedUrl;
    }

    const cleanPath = fixedUrl.replace(/^\/+/, '').replace(/^video\//, '');
    const encodedPath = cleanPath
      .split('/')
      .map((part) => encodeURIComponent(part))
      .join('/');

    return `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/video/${encodedPath}`;
  };
  
  // Filters
  const [sectors, setSectors] = useState<any[]>([]);
  const [diplomes, setDiplomes] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [selectedSector, setSelectedSector] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedEducation, setSelectedEducation] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<any>(null);
  const [minExperience, setMinExperience] = useState<any>(null);
  const [maxExperience, setMaxExperience] = useState<any>(null);
  const [appliedFilters, setAppliedFilters] = useState<CandidateFilters>(EMPTY_FILTERS);

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
      zIndex: 9999,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999,
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
        (typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL) + "/api/v1/sectors",
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
        (typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL) + "/api/v1/diplomes",
        { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } }
      );
      const result = await response.json();
      setDiplomes(Array.isArray(result.data || result) ? (result.data || result) : []);
    } catch (error) {
      console.error("Error fetching diplomes:", error);
    }
  };

  const fetchLastPayment = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(
        `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/payments/${user.id}/last`,
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

  const fetchCandidates = useCallback(async (
    page: number,
    append: boolean = false,
    filters: CandidateFilters = appliedFilters
  ) => {
    try {
      if (!authToken) {
        setCandidates([]);
        setLoadError("Votre session entreprise n'est pas disponible. Reconnectez-vous puis réessayez.");
        return;
      }
      if (!append) {
        setLoading(true);
        setLoadError(null);
      }
      else setLoadingMore(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "10",
      });
      
      if (filters.sector) params.append('sector_id', filters.sector.value);
      if (filters.job) params.append('job_id', filters.job.value);
      if (filters.city.trim()) params.append('city', filters.city.trim());
      if (filters.education) params.append('education_level', filters.education.value);
      if (filters.language) params.append('language', filters.language.value);
      if (filters.minExperience) params.append('min_experience', filters.minExperience.value);
      if (filters.maxExperience) params.append('max_experience', filters.maxExperience.value);
      
      const response = await fetch(
        `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/postule/all?${params.toString()}`,
        { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } }
      );
      
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || error?.error || `Erreur serveur (${response.status})`);
      }
      
      const result = await response.json();
      
      const candidateData = Array.isArray(result?.data?.data) ? result.data.data : result?.data;
      const pagination = result?.pagination ?? result?.data?.pagination;
      if (Array.isArray(candidateData)) {
        if (append) {
          setCandidates(prev => [...prev, ...candidateData.filter((candidate: Candidate) => !prev.some((item) => item.cv_id === candidate.cv_id))]);
        } else {
          setCandidates(candidateData);
        }
        
        setHasMore(Boolean(pagination?.has_more_pages));
      } else {
        if (!append) setCandidates([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setLoadError(error instanceof Error ? error.message : "Impossible de charger les candidats.");
      if (!append) setCandidates([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [authToken, appliedFilters]);

  useEffect(() => {
    if (userLoading || !user?.id) return;
    setCurrentPage(1);
    fetchCandidates(1, false, appliedFilters);
  }, [userLoading, user?.id, authToken]);

  useEffect(() => {
    if (user?.id) {
      fetchSectors();
      fetchDiplomes();
      fetchLastPayment();
    }
  }, [user?.id]);

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
        fetchCandidates(nextPage, true, appliedFilters);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage, loadingMore, hasMore, appliedFilters, fetchCandidates]);

  const handleGenerateCV = async (candidateId: number) => {
    try {
      await downloadResumePDF(candidateId);
      // Toast is already shown in downloadResumePDF function
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleViewClick = (candidate: Candidate) => {
    // Just open the detail modal without consuming
    setDetailCandidate(candidate);
    setIsDetailModalOpen(true);
    // Pause all videos
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.pause();
      }
    });
  };

  const handleConsumeClick = async (candidate: Candidate) => {
    if (!user?.id) {
      toast.error("Erreur: Utilisateur non identifié");
      return;
    }
    
    if (!lastPayment || lastPayment.status === "pending" || getRemainingCredits() <= 0) {
      setIsUpgradeModalOpen(true);
      return;
    }

    // Show confirmation modal
    setCandidateToConsume(candidate);
    setIsConfirmModalOpen(true);
  };

  const confirmConsume = async () => {
    if (!candidateToConsume || !user?.id) return;

    setIsConfirmModalOpen(false);
    setIsConsuming(true);

    try {
      const response = await fetch(
        `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/consumations`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postuler_id: candidateToConsume.cv_id,
          }),
        },
      );

      if (response.ok) {
        // Remove from list
        setCandidates(prev => prev.filter(c => c.cv_id !== candidateToConsume.cv_id));
        
        // Update credits
        if (lastPayment) {
          const currentCredits = getRemainingCredits();
          setLastPayment({
            ...lastPayment,
            contact_access_remaining: currentCredits - 1
          });
        }
        
        // Show a toast with button to navigate to consumed CVs
        setTimeout(() => {
          toast.success(
            (t) => (
              <div className="flex flex-col gap-2">
                <span>CV ajouté à vos CV débloqués</span>
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    window.location.href = '/dashboard/entreprise/consumed-cvs';
                  }}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Voir mes CV débloqués
                </button>
              </div>
            ),
            { duration: 5000 }
          );
        }, 1000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle already consumed - show the candidate info directly
        if (response.status === 409 && errorData.error === "Video already consumed") {
          setCandidates(prev => prev.filter(c => c.cv_id !== candidateToConsume.cv_id));
          
          // Show a toast with button to navigate to consumed CVs
          setTimeout(() => {
            toast.success(
              (t) => (
                <div className="flex flex-col gap-2">
                  <span>Retrouvez ce CV dans vos CV débloqués</span>
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      window.location.href = '/dashboard/entreprise/consumed-cvs';
                    }}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Voir mes CV débloqués
                  </button>
                </div>
              ),
              { duration: 5000 }
            );
          }, 1000);
        } else if (response.status === 402 && errorData.needs_upgrade) {
          toast.error(errorData.message || "Vous avez atteint la limite de consultations de CV.", { duration: 5000 });
          setTimeout(() => {
            setIsUpgradeModalOpen(true);
          }, 500);
        } else {
          toast.error(errorData.message || "Erreur lors du déblocage du CV");
        }
      }
    } catch (error) {
      console.error("Error consuming CV:", error);
      toast.error("Erreur réseau. Veuillez réessayer.");
    } finally {
      setCandidateToConsume(null);
      setIsConsuming(false);
    }
  };

  const buildDraftFilters = (): CandidateFilters => ({
    sector: selectedSector,
    job: selectedJob,
    city: selectedCity,
    education: selectedEducation,
    language: selectedLanguage,
    minExperience,
    maxExperience,
  });

  const applyFilters = () => {
    const nextFilters = buildDraftFilters();
    setAppliedFilters(nextFilters);
    setCurrentPage(1);
    fetchCandidates(1, false, nextFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSelectedSector(null);
    setSelectedJob(null);
    setSelectedCity("");
    setSelectedEducation(null);
    setSelectedLanguage(null);
    setMinExperience(null);
    setMaxExperience(null);
    setAppliedFilters(EMPTY_FILTERS);
    setCurrentPage(1);
    fetchCandidates(1, false, EMPTY_FILTERS);
    setShowFilters(false);
  };

  const retryLoad = () => {
    setCurrentPage(1);
    fetchCandidates(1, false, appliedFilters);
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

  const hasActiveFilters = Boolean(
    appliedFilters.sector ||
    appliedFilters.job ||
    appliedFilters.city ||
    appliedFilters.education ||
    appliedFilters.language ||
    appliedFilters.minExperience ||
    appliedFilters.maxExperience
  );
  const hasDraftFilters = Boolean(selectedSector || selectedJob || selectedCity || selectedEducation || selectedLanguage || minExperience || maxExperience);

  // Show loading state while user data is being fetched
  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-5 md:space-y-6" style={{ zIndex: 0 }}>
      {/* Header Simple */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-5 shadow-lg shadow-emerald-100 md:p-7" style={{ zIndex: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm md:h-12 md:w-12">
              <User className="text-white text-lg md:text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-2xl font-bold text-white">Candidats</h1>
              <p className="text-green-50 text-xs md:text-sm">Découvrez les profils disponibles</p>
            </div>
          </div>
          
          {lastPayment && lastPayment.status === "completed" && (
            <div className="self-start rounded-xl border border-white/25 bg-white/15 px-3 py-2.5 backdrop-blur-sm sm:self-auto">
              <p className="text-green-50 text-xs font-medium">Crédits restants</p>
              <p className="text-xl md:text-2xl font-bold text-white">
                {getRemainingCredits() === 999 ? '∞' : getRemainingCredits()}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Video className="h-5 w-5" /></span>
          <div><p className="text-sm font-bold text-slate-900">{loading ? "Recherche des profils..." : `${candidates.length} profil${candidates.length > 1 ? "s" : ""} affiché${candidates.length > 1 ? "s" : ""}`}</p><p className="text-xs text-slate-500">Les profils déverrouillés n'apparaissent plus ici.</p></div>
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && <button onClick={clearFilters} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"><X className="h-4 w-4" />Effacer</button>}
          <button onClick={() => setShowFilters(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"><SlidersHorizontal className="h-4 w-4" />Filtres{hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-white" />}</button>
        </div>
      </div>

      {/* Filters Modal */}
      {showFilters && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowFilters(false)}
          ></div>
          
          {/* Filters Panel */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl md:rounded-2xl shadow-2xl w-[calc(100%-2rem)] md:w-full max-w-4xl max-h-[85vh] md:max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between rounded-t-xl md:rounded-t-2xl z-10">
              <div className="flex-1 min-w-0">
                <h2 className="text-base md:text-lg font-bold text-gray-900">Filtres de recherche</h2>
                <p className="text-xs md:text-sm text-gray-500">Cliquez sur rechercher pour appliquer les filtres</p>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {/* Secteur */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Secteur</label>
                  <Select
                    value={selectedSector}
                    onChange={setSelectedSector}
                    options={sectors.map(s => ({ value: s.id, label: s.name }))}
                    styles={selectStyles}
                    placeholder="Tous les secteurs..."
                    isClearable
                    isSearchable
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                    menuPosition="fixed"
                  />
                </div>

                {/* Poste */}
                <div className="relative group">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Poste</label>
                  <Select
                    value={selectedJob}
                    onChange={setSelectedJob}
                    options={filteredJobs.map(j => ({ value: j.id, label: j.name }))}
                    styles={selectStyles}
                    placeholder="Tous les postes..."
                    isClearable
                    isSearchable
                    isDisabled={!selectedSector}
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                    menuPosition="fixed"
                  />
                  {!selectedSector && (
                    <div className="pointer-events-none absolute left-0 top-full z-[60] mt-2 hidden w-full rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white shadow-lg group-hover:block group-focus-within:block">
                      Choisissez d'abord un secteur pour afficher les postes disponibles.
                    </div>
                  )}
                </div>

                {/* Ville */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Ville</label>
                  <input
                    type="text"
                    value={selectedCity}
                    onChange={(event) => setSelectedCity(event.target.value)}
                    placeholder="Saisir une ville..."
                    className="w-full min-h-10 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 placeholder:text-gray-400"
                  />
                </div>

                {/* Niveau d'études */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Niveau d'études</label>
                  <Select
                    value={selectedEducation}
                    onChange={setSelectedEducation}
                    options={diplomes.map(d => ({ value: d.id, label: d.name }))}
                    styles={selectStyles}
                    placeholder="Tous les niveaux..."
                    isClearable
                    isSearchable
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                    menuPosition="fixed"
                  />
                </div>

                {/* Langue */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Langue</label>
                  <Select
                    value={selectedLanguage}
                    onChange={setSelectedLanguage}
                    options={LANGUAGE_OPTIONS}
                    styles={selectStyles}
                    placeholder="Toutes les langues..."
                    isClearable
                    isSearchable
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                    menuPosition="fixed"
                  />
                </div>

                {/* Expérience minimum */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Expérience minimum</label>
                  <Select
                    value={minExperience}
                    onChange={setMinExperience}
                    options={[0, 1, 2, 3, 5, 7, 10].map(y => ({ value: y, label: `${y} an${y > 1 ? 's' : ''}` }))}
                    styles={selectStyles}
                    placeholder="Minimum..."
                    isClearable
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                    menuPosition="fixed"
                  />
                </div>

                {/* Expérience maximum */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Expérience maximum</label>
                  <Select
                    value={maxExperience}
                    onChange={setMaxExperience}
                    options={[1, 2, 3, 5, 7, 10, 15, 20].map(y => ({ value: y, label: `${y} an${y > 1 ? 's' : ''}` }))}
                    styles={selectStyles}
                    placeholder="Maximum..."
                    isClearable
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                    menuPosition="fixed"
                  />
                </div>
              </div>

              <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={applyFilters}
                  className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Filter className="w-4 h-4" />
                  Rechercher
                </button>
                {(hasDraftFilters || hasActiveFilters) && (
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <X className="w-4 h-4" />
                    Réinitialiser tous les filtres
                  </button>
                )}
              </div>
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
        ) : loadError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600"><X className="h-7 w-7" /></div>
            <h2 className="text-xl font-bold text-slate-900">Chargement impossible</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">{loadError}</p>
            <button onClick={retryLoad} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"><RefreshCw className="h-4 w-4" />Réessayer</button>
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
            {/* Grid View - Desktop and Mobile */}
            <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" style={{ zIndex: 0 }}>
              {candidates.map((candidate) => (
                <div
                  key={candidate.cv_id}
                  className="relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg"
                  style={{ zIndex: 0 }}
                >
                  {/* Video Preview */}
                  <div 
                    className="group relative h-52 cursor-pointer overflow-hidden bg-slate-950"
                    onClick={() => handleVideoClick(candidate)}
                    onMouseEnter={() => {
                      const video = videoRefs.current[candidate.cv_id];
                      if (video) {
                        video.muted = true;
                        video.play().catch(() => {});
                      }
                    }}
                    onMouseLeave={() => {
                      const video = videoRefs.current[candidate.cv_id];
                      if (video) {
                        video.pause();
                        video.currentTime = 0;
                      }
                    }}
                    style={{ zIndex: 0 }}
                  >
                    <video
                      ref={(el) => { videoRefs.current[candidate.cv_id] = el; }}
                      src={getVideoUrl(candidate.link)}
                      className="w-full h-full object-cover"
                      style={{ zIndex: 0, position: 'relative' }}
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      controlsList="nodownload"
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm ring-1 ring-white/40">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="space-y-2 flex-1">
                      {/* Profile Header */}
                      <div className="flex items-center gap-2">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border-2 border-emerald-200 bg-emerald-50">
                          {candidate.image ? (
                            <img 
                              src={getImageUrl(candidate.image)}
                              alt={candidate.full_name || 'Candidat'}
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

                      {/* CV Upload Date */}
                      {candidate.created_at && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          CV mis en ligne le {new Date(candidate.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto flex gap-2 border-t border-slate-100 pt-3">
                      <button
                        onClick={() => handleGenerateCV(candidate.id)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        title="Télécharger le CV anonyme gratuitement"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">CV anonyme (gratuit)</span>
                        <span className="sm:hidden">CV anonyme</span>
                      </button>
                      <button
                        onClick={() => handleConsumeClick(candidate)}
                        disabled={isConsuming}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-[10px] font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                        title="Débloquer les coordonnées du candidat"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="leading-tight text-center">Débloquer<br/><span className="text-[9px] opacity-80">(1 crédit)</span></span>
                      </button>
                    </div>
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
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsUpgradeModalOpen(false)}></div>
          <div className="relative z-[70] w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limite atteinte</h2>
            <p className="text-gray-600 mb-6">
              Vous avez atteint votre limite de consultations. Mettez à niveau votre forfait pour consulter plus de CVs.
            </p>
            <div className="flex gap-3 border-t border-slate-100 pt-5">
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={() => window.location.href = "/dashboard/entreprise/services"}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Mettre à niveau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal - Large Popup with Video and All Info */}
      {isDetailModalOpen && detailCandidate && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={closeDetailModal}
          ></div>
          
          {/* Modal Content - Centered and Responsive */}
          <div className="relative z-[70] min-h-screen flex items-center justify-center p-4">
            <div className="my-4 flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
              {/* Header */}
              <div className="flex flex-shrink-0 items-center justify-between border-b border-emerald-500/30 bg-gradient-to-r from-emerald-700 to-teal-600 px-4 py-3 md:px-6 md:py-4">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
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
                      className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm md:text-base font-bold"
                      style={{ display: detailCandidate.image ? 'none' : 'flex' }}
                    >
                      {detailCandidate.full_name?.[0] || 'C'}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm md:text-lg font-bold text-white truncate">{detailCandidate.full_name || 'Candidat'}</h2>
                    <p className="text-green-50 text-xs truncate">{detailCandidate.job?.name || 'Non spécifié'}</p>
                  </div>
                </div>
                <button
                  onClick={closeDetailModal}
                  className="p-1 md:p-1.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0 ml-2"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 gap-5 p-4 md:p-6 lg:grid-cols-2">
                  {/* Left Column - Video */}
                  <div className="space-y-2 md:space-y-3">
                    <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-950 shadow-lg">
                      <video
                        ref={detailVideoRef}
                        src={getVideoUrl(detailCandidate.link)}
                        className="w-full h-full object-contain"
                        controls
                        controlsList="nodownload"
                        autoPlay
                        loop
                      />
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-lg p-2 md:p-3">
                        <div className="flex items-center gap-1.5 text-gray-600 mb-0.5">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs font-medium">Localisation</span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-900 font-semibold truncate">{detailCandidate.city || 'Non spécifié'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 md:p-3">
                        <div className="flex items-center gap-1.5 text-gray-600 mb-0.5">
                          <Calendar className="w-3 h-3" />
                          <span className="text-xs font-medium">Expérience</span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-900 font-semibold">{detailCandidate.years_of_experience} ans</p>
                      </div>
                    </div>

                    {/* CV Upload Date */}
                    {detailCandidate.created_at && (
                      <div className="bg-gray-50 rounded-lg p-2 md:p-3 flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-500">
                          CV mis en ligne le{' '}
                          <span className="font-medium text-gray-700">
                            {new Date(detailCandidate.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </span>
                        </span>
                      </div>
                    )}

                    {/* Bio */}
                    {detailCandidate.bio && (
                      <div className="bg-gray-50 rounded-lg p-2 md:p-3">
                        <h3 className="font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5 text-xs md:text-sm">
                          <User className="w-3 h-3 md:w-4 md:h-4" />
                          À propos
                        </h3>
                        <p className="text-gray-700 text-xs leading-relaxed">{detailCandidate.bio}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Details */}
                  <div className="space-y-2 md:space-y-3">
                    {/* Formations */}
                    {detailCandidate.formations && detailCandidate.formations.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-2 md:p-3">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-1.5 text-xs md:text-sm">
                          <GraduationCap className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                          Formation
                        </h3>
                        <div className="space-y-2">
                          {detailCandidate.formations.map((formation) => (
                            <div key={formation.id} className="border-l-2 border-green-500 pl-2">
                              <p className="font-medium text-gray-900 text-xs md:text-sm">{formation.diplome}</p>
                              <p className="text-xs text-gray-700">{formation.field_of_study}</p>
                              <p className="text-xs text-gray-600">{formation.school}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {new Date(formation.start_date).getFullYear()} - {new Date(formation.end_date).getFullYear()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expériences */}
                    {detailCandidate.experiences && detailCandidate.experiences.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-2 md:p-3">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-1.5 text-xs md:text-sm">
                          <Building2 className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                          Expérience professionnelle
                        </h3>
                        <div className="space-y-2">
                          {detailCandidate.experiences.map((experience) => (
                            <div key={experience.id} className="border-l-2 border-green-500 pl-2">
                              <p className="font-medium text-gray-900 text-xs md:text-sm">{experience.title}</p>
                              <p className="text-xs text-gray-700">{experience.company}</p>
                              {experience.location && (
                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {experience.location}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-0.5">
                                {new Date(experience.start_date).getFullYear()} - {experience.is_current ? 'Présent' : new Date(experience.end_date).getFullYear()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Compétences */}
                    {detailCandidate.skills && detailCandidate.skills.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-2 md:p-3">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-1.5 text-xs md:text-sm">
                          <Code className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                          Compétences
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {detailCandidate.skills
                            .filter(skill => skill.name && skill.name.trim() !== '')
                            .map((skill) => (
                              <span
                                key={skill.id}
                                className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium"
                              >
                                {skill.name}
                              </span>
                            ))}
                        </div>
                        {detailCandidate.skills.filter(skill => skill.name && skill.name.trim() !== '').length === 0 && (
                          <p className="text-gray-500 text-xs italic">Aucune compétence renseignée</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 px-3 md:px-4 py-2 md:py-3 bg-gray-50 flex flex-col sm:flex-row gap-2 flex-shrink-0">
                <button
                  onClick={() => handleGenerateCV(detailCandidate.id)}
                  className="flex-1 px-3 md:px-4 py-2 md:py-2.5 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs md:text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">CV anonyme (gratuit)</span>
                  <span className="sm:hidden">CV anonyme</span>
                </button>
                <button
                  onClick={() => handleConsumeClick(detailCandidate)}
                  disabled={isConsuming}
                  className="flex-1 px-3 md:px-4 py-2 md:py-2.5 bg-green-600 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs md:text-sm"
                >
                  <Check className="w-4 h-4" />
                  <span className="leading-tight text-center">Débloquer<br/><span className="text-[11px] opacity-80">(1 crédit)</span></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && candidateToConsume && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
              <h3 className="text-2xl font-bold text-white">Confirmer le déblocage</h3>
            </div>
            
            <div className="p-6 sm:p-7">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-orange-100">
                  <Eye className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 mb-3">
                    Vous êtes sur le point de débloquer les coordonnées de ce candidat.
                  </p>
                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                    <p className="text-sm font-semibold text-orange-900 mb-1">
                      Cette action débloquera 1 crédit
                    </p>
                    <p className="text-xs text-orange-700">
                      Crédits restants après déblocage : {getRemainingCredits() - 1}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 border-t border-slate-100 pt-5">
                <button
                  onClick={() => {
                    setIsConfirmModalOpen(false);
                    setCandidateToConsume(null);
                  }}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmConsume}
                  disabled={isConsuming}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {isConsuming ? "Déblocage..." : "Confirmer"}
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
