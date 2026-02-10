"use client";

import React, { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
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
  
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Filters
  const [sectors, setSectors] = useState<any[]>([]);
  const [diplomes, setDiplomes] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedEducation, setSelectedEducation] = useState<string>("");
  const [minExperience, setMinExperience] = useState<string>("");
  const [maxExperience, setMaxExperience] = useState<string>("");
  const [cities, setCities] = useState<string[]>([]);

  const company = typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
  const companyId = company ? JSON.parse(company).id : null;

  useEffect(() => {
    if (selectedSector) {
      const sector = sectors.find((sec) => sec.id === Number(selectedSector));
      setFilteredJobs(sector ? sector.jobs : []);
      setSelectedJob("");
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
      
      if (selectedSector) params.append('sector_id', selectedSector);
      if (selectedJob) params.append('job_id', selectedJob);
      if (selectedCity) params.append('city', selectedCity);
      if (selectedGender) params.append('gender', selectedGender);
      if (selectedEducation) params.append('education_level', selectedEducation);
      if (minExperience) params.append('min_experience', minExperience);
      if (maxExperience) params.append('max_experience', maxExperience);
      
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
      if (!containerRef.current || loadingMore || !hasMore) return;
      
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchCandidates(nextPage, true);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentPage, loadingMore, hasMore]);

  // Intersection Observer to control video playback
  useEffect(() => {
    const observerOptions = {
      root: containerRef.current,
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
      toast.success("CV téléchargé!");
    } catch (error) {
      toast.error("Erreur");
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
        toast.success("CV consommé!");
        setIsModalOpen(false);
        setCandidates(prev => prev.filter(c => c.cv_id !== selectedCandidate.cv_id));
      } else {
        toast.error("Erreur");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
  };

  const clearFilters = () => {
    setSelectedSector("");
    setSelectedJob("");
    setSelectedCity("");
    setSelectedGender("");
    setSelectedEducation("");
    setMinExperience("");
    setMaxExperience("");
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

  const hasActiveFilters = selectedSector || selectedJob || selectedCity || selectedGender || selectedEducation || minExperience || maxExperience;

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex flex-col">
      {/* Top Bar with Filters */}
      <div className="bg-white border-b border-gray-200 shadow-sm z-20">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-gray-900 font-bold text-lg">Candidats</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtres
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 border-t border-gray-200 p-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              >
                <option value="">Secteur</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                disabled={!selectedSector}
                className="px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                <option value="">Poste</option>
                {filteredJobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              >
                <option value="">Ville</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={selectedEducation}
                onChange={(e) => setSelectedEducation(e.target.value)}
                className="px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              >
                <option value="">Niveau d'études</option>
                {diplomes.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <select
                value={minExperience}
                onChange={(e) => setMinExperience(e.target.value)}
                className="px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              >
                <option value="">Exp. min</option>
                {[0, 1, 2, 3, 5, 7, 10].map((y) => (
                  <option key={y} value={y}>{y} an{y > 1 ? 's' : ''}</option>
                ))}
              </select>

              <select
                value={maxExperience}
                onChange={(e) => setMaxExperience(e.target.value)}
                className="px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              >
                <option value="">Exp. max</option>
                {[1, 2, 3, 5, 7, 10, 15, 20].map((y) => (
                  <option key={y} value={y}>{y} an{y > 1 ? 's' : ''}</option>
                ))}
              </select>

              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              >
                <option value="">Genre</option>
                <option value="male">Homme</option>
                <option value="female">Femme</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Réinitialiser
              </button>
            )}
          </div>
        )}
      </div>

      {/* TikTok-style Scrollable Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white">Chargement...</p>
            </div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <User className="w-20 h-20 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Aucun candidat</h2>
              <p className="text-gray-400 mb-4">Modifiez vos filtres</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        ) : (
          <>
            {candidates.map((candidate) => (
              <div
                key={candidate.cv_id}
                className="h-screen snap-start relative flex items-center justify-center"
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
                            src={candidate.image.startsWith('http') ? candidate.image : `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${candidate.image}`}
                            alt={candidate.full_name || 'Candidat'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                            {candidate.full_name?.[0] || 'C'}
                          </div>
                        )}
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
                      <div className="w-16 h-16 bg-blue-500/90 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 backdrop-blur-sm">
                        <FileText className="w-6 h-6 text-white" />
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

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="h-32 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl z-10 max-w-md w-full border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-4">Confirmer</h2>
            <p className="text-gray-300 mb-6">
              Consommer ce CV vidéo ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmConsume}
                className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {isUpgradeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsUpgradeModalOpen(false)}></div>
          <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl z-10 max-w-md w-full border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-4">Limite atteinte</h2>
            <p className="text-gray-300 mb-6">
              Mettez à niveau pour consulter plus de CVs.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={() => window.location.href = "/dashboard/entreprise/services"}
                className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl"
              >
                Mettre à niveau
              </button>
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
