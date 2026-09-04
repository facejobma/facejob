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

  const hasPlayableVideo = (candidate: Candidate) => Boolean(candidate.link && getVideoUrl(candidate.link));
  
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
    if (userLoading) return;
    if (!user?.id) {
      setLoading(false);
      setLoadError("Impossible d'identifier votre session entreprise. Veuillez vous reconnecter.");
      return;
    }
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
    
    if (!lastPayment || lastPayment.status?.toLowerCase() === "pending" || getRemainingCredits() <= 0) {
      setIsUpgradeModalOpen(true);
      return;
    }

    // Show confirmation modal
    setCandidateToConsume(candidate);
    setIsConfirmModalOpen(true);
  };

  const confirmConsume = async () => {
    if (!candidateToConsume || !user?.id) return;

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
        setIsConfirmModalOpen(false);
        // Remove from list
        setCandidates(prev => prev.filter(c => c.cv_id !== candidateToConsume.cv_id));
        
        // Update credits
        if (lastPayment) {
          const currentCredits = getRemainingCredits();
          setLastPayment({
            ...lastPayment,
            contact_access_remaining: currentCredits === 999 ? 'unlimited' : Math.max(0, currentCredits - 1)
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
          setIsConfirmModalOpen(false);
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
    if (
      minExperience?.value !== undefined &&
      maxExperience?.value !== undefined &&
      Number(minExperience.value) > Number(maxExperience.value)
    ) {
      toast.error("L'expérience minimum ne peut pas dépasser l'expérience maximum.");
      return;
    }
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

  useEffect(() => {
    if (!isDetailModalOpen && !isConfirmModalOpen && !isUpgradeModalOpen && !showFilters) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isConfirmModalOpen) {
        setIsConfirmModalOpen(false);
        setCandidateToConsume(null);
      } else if (isUpgradeModalOpen) {
        setIsUpgradeModalOpen(false);
      } else if (isDetailModalOpen) {
        closeDetailModal();
      } else {
        setShowFilters(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isDetailModalOpen, isConfirmModalOpen, isUpgradeModalOpen, showFilters]);

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
    if (!hasPlayableVideo(candidate)) {
      toast.error("La vidéo de ce profil n'est pas disponible actuellement.");
      return;
    }
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
  const activeFilterCount = [
    appliedFilters.sector,
    appliedFilters.job,
    appliedFilters.city,
    appliedFilters.education,
    appliedFilters.language,
    appliedFilters.minExperience,
    appliedFilters.maxExperience,
  ].filter(Boolean).length;
  const hasDetailSections = Boolean(
    detailCandidate && (
      detailCandidate.formations?.length ||
      detailCandidate.experiences?.length ||
      detailCandidate.skills?.some((skill) => Boolean(skill.name?.trim()))
    )
  );

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
    <div className="relative space-y-5 md:space-y-6">
      {/* Header Simple */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-5 shadow-lg shadow-emerald-100 md:p-7">
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
          
          {lastPayment && lastPayment.status?.toLowerCase() === "accepted" && (
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
          <button onClick={() => setShowFilters(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"><SlidersHorizontal className="h-4 w-4" />Filtres{activeFilterCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-emerald-700">{activeFilterCount}</span>}</button>
        </div>
      </div>

      {/* Filters Modal */}
      {showFilters && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[90] bg-slate-950/45 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          ></div>
          
          {/* Filters Panel */}
          <div role="dialog" aria-modal="true" aria-label="Filtres de recherche" className="fixed left-1/2 top-1/2 z-[100] flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100dvh-4rem)]">
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-4 md:px-6">
              <div className="flex-1 min-w-0">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Talentothèque</p>
                <h2 className="text-lg font-bold text-slate-900">Filtres de recherche</h2>
                <p className="mt-0.5 text-xs text-slate-500">Affinez les profils disponibles sans modifier vos offres.</p>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="ml-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-xs leading-5 text-emerald-900">
                Le secteur et le métier correspondent au <strong>CV vidéo publié</strong>. La ville, la formation, les langues et l'expérience proviennent du profil candidat.
              </div>
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
                    options={[0, 1, 2, 3, 5, 7, 10].filter(y => maxExperience?.value === undefined || y <= Number(maxExperience.value)).map(y => ({ value: y, label: `${y} an${y > 1 ? 's' : ''}` }))}
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
                    options={[1, 2, 3, 5, 7, 10, 15, 20].filter(y => minExperience?.value === undefined || y >= Number(minExperience.value)).map(y => ({ value: y, label: `${y} an${y > 1 ? 's' : ''}` }))}
                    styles={selectStyles}
                    placeholder="Maximum..."
                    isClearable
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                    menuPosition="fixed"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                <button
                  onClick={applyFilters}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto sm:min-w-36"
                >
                  <Filter className="w-4 h-4" />
                  Rechercher
                </button>
                {(hasDraftFilters || hasActiveFilters) && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
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
          <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
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
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
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
            <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate.cv_id}
                  className="relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg"
                >
                  {/* Video Preview */}
                  <button
                    type="button"
                    aria-label={`Consulter le profil de ${candidate.full_name || "ce candidat"}`}
                    className="group relative h-40 w-full overflow-hidden bg-slate-950 text-left focus:outline-none focus:ring-4 focus:ring-emerald-200 sm:h-44"
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
                  >
                    {hasPlayableVideo(candidate) ? <video
                      ref={(el) => { videoRefs.current[candidate.cv_id] = el; }}
                      src={getVideoUrl(candidate.link)}
                      className="w-full h-full object-cover"
                      style={{ position: 'relative' }}
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      controlsList="nodownload"
                    /> : <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-900 to-slate-800 px-5 text-center text-white"><Video className="h-7 w-7 text-emerald-300" /><span className="text-sm font-semibold">Aperçu vidéo indisponible</span><span className="text-xs text-slate-300">Le profil reste consultable.</span></div>}
                    <div className="pointer-events-none absolute inset-0 flex items-end justify-between bg-gradient-to-t from-slate-950/85 via-slate-950/5 to-transparent p-3">
                      <span className="rounded-lg bg-slate-950/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">Profil anonyme</span>
                      {hasPlayableVideo(candidate) && <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm ring-1 ring-white/40 transition group-hover:scale-110"><Eye className="h-5 w-5" /></span>}
                    </div>
                  </button>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <div className="flex-1 space-y-3">
                      {/* Profile Header */}
                      <div className="flex items-center gap-3">
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
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm text-gray-900 truncate">{candidate.full_name || 'Candidat'}</h3>
                          <p className="text-xs text-gray-600 truncate">{candidate.job?.name || 'Non spécifié'}</p>
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="flex flex-wrap gap-1.5 pt-1 text-xs">
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
                        <p className="flex items-center gap-1 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" />
                          CV mis en ligne le {new Date(candidate.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                      <button
                        onClick={() => handleGenerateCV(candidate.id)}
                        className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                        title="Télécharger le CV anonyme gratuitement"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">CV anonyme (gratuit)</span>
                        <span className="sm:hidden">CV anonyme</span>
                      </button>
                      <button
                        onClick={() => handleConsumeClick(candidate)}
                        disabled={isConsuming}
                        className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-2.5 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4" role="dialog" aria-modal="true" aria-label="Mise à niveau du plan">
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
        <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true" aria-label="Détails du profil candidat">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/55 backdrop-blur-md"
            onClick={closeDetailModal}
          ></div>
          
          {/* Modal Content - Centered and Responsive */}
          <div className="relative z-[110] flex min-h-dvh items-center justify-center px-4 py-10 sm:py-14">
            <div className={`flex max-h-[calc(100dvh-5rem)] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100dvh-7rem)] ${hasDetailSections ? "max-w-5xl" : "max-w-3xl"}`}>
              {/* Header */}
              <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-4 md:px-6">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 md:h-11 md:w-11">
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
                      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white md:text-base"
                      style={{ display: detailCandidate.image ? 'none' : 'flex' }}
                    >
                      {detailCandidate.full_name?.[0] || 'C'}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Profil candidat</p>
                    <h2 className="truncate text-base font-bold text-slate-900 md:text-lg">{detailCandidate.full_name || 'Candidat'}</h2>
                    <p className="truncate text-xs text-slate-500">{detailCandidate.job?.name || 'Non spécifié'}</p>
                  </div>
                </div>
                <button type="button"
                  onClick={closeDetailModal}
                  className="ml-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  aria-label="Fermer les détails du candidat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className={`grid grid-cols-1 gap-5 p-4 md:p-6 ${hasDetailSections ? "lg:grid-cols-2" : "mx-auto w-full max-w-2xl"}`}>
                  {/* Left Column - Video */}
                  <div className="space-y-3">
                    <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-950 shadow-lg">
                      {hasPlayableVideo(detailCandidate) ? <video
                        ref={detailVideoRef}
                        src={getVideoUrl(detailCandidate.link)}
                        className="w-full h-full object-contain"
                        controls
                        controlsList="nodownload"
                        autoPlay
                        loop
                      /> : <div className="flex h-full flex-col items-center justify-center gap-3 px-5 text-center text-white"><Video className="h-8 w-8 text-emerald-300" /><p className="text-sm font-semibold">Vidéo indisponible</p><p className="text-xs text-slate-300">Le CV anonyme peut tout de même être consulté.</p></div>}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center gap-1.5 text-gray-600 mb-0.5">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs font-medium">Localisation</span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-900 font-semibold truncate">{detailCandidate.city || 'Non spécifié'}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center gap-1.5 text-gray-600 mb-0.5">
                          <Calendar className="w-3 h-3" />
                          <span className="text-xs font-medium">Expérience</span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-900 font-semibold">{detailCandidate.years_of_experience} ans</p>
                      </div>
                    </div>

                    {/* CV Upload Date */}
                    {detailCandidate.created_at && (
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
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
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
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
              <div className="flex flex-shrink-0 flex-col gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:justify-end md:px-6">
                <button
                  onClick={() => handleGenerateCV(detailCandidate.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 sm:w-auto sm:min-w-48"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">CV anonyme (gratuit)</span>
                  <span className="sm:hidden">CV anonyme</span>
                </button>
                <button
                  onClick={() => handleConsumeClick(detailCandidate)}
                  disabled={isConsuming}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-44"
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Confirmer le déblocage">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="unlock-confirmation border-b border-slate-200 bg-white p-5 sm:p-6">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Accès au profil</p>
              <h3 className="text-2xl font-bold text-white">Confirmer le déblocage</h3>
            </div>
            
            <div className="confirmation-body p-6 sm:p-7">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
                  <Eye className="w-6 h-6 text-emerald-700" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 mb-3">
                    Vous êtes sur le point de débloquer les coordonnées de ce candidat.
                  </p>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-orange-900 mb-1">
                      Cette action débloquera 1 crédit
                    </p>
                    <p className="text-xs text-orange-700">
                      Crédits restants après déblocage : {getRemainingCredits() - 1}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row">
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
        .unlock-confirmation h3 { color: #0f172a; font-size: 1.25rem; line-height: 1.75rem; }
        .confirmation-body .text-orange-900 { color: #0f172a; }
        .confirmation-body .text-orange-700 { color: #475569; }
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
