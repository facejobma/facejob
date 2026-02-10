"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { downloadResumePDF } from "@/components/ResumePDF";
import { CandidateCard } from "@/components/CandidateCard";
import { 
  ChevronLeft, ChevronRight, MapPin, Briefcase, GraduationCap, 
  Award, Code, Folder, Calendar, Eye, Download, X, Check,
  User, Building2, Clock, Star, TrendingUp
} from "lucide-react";

interface Formation {
  id: number;
  school: string;
  diplome: string;
  diplome_id: number;
  field_of_study: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface Experience {
  id: number;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
}

interface Skill {
  id: number;
  name: string;
  category: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  url: string;
  start_date: string;
  end_date: string;
}

interface Candidate {
  id: number;
  cv_id: number;
  is_verified: string;
  image: string;
  first_name: string;
  last_name: string;
  full_name: string;
  link: string;
  job: {
    id: number;
    name: string;
    sector_id: number;
  };
  city: string;
  years_of_experience: number;
  gender: string;
  bio: string;
  availability_status: string;
  formations: Formation[];
  experiences: Experience[];
  skills: Skill[];
  projects: Project[];
  highest_education: Formation | null;
  profile_completion: number;
  created_at: string;
}

interface Payment {
  id: number;
  entreprise_id: number;
  cv_video_remaining: number;
  status: string;
}

const CandidatsPage: React.FC = () => {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingPDF, setLoadingPDF] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  
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
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCandidates, setTotalCandidates] = useState<number>(0);

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
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      const result = await response.json();
      const data = result.data || result;
      setSectors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      setSectors([]);
    }
  };

  const fetchDiplomes = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/diplomes",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      const result = await response.json();
      const data = result.data || result;
      setDiplomes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching diplomes:", error);
      setDiplomes([]);
    }
  };

  const fetchLastPayment = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/payments/${companyId}/last`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setLastPayment(data);
      }
    } catch (error) {
      console.error("Error fetching payment:", error);
    }
  };

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: "1",
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
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        setCandidate(result.data[0]);
        
        // Extract unique cities
        const uniqueCities = Array.from(new Set(
          result.data.map((c: Candidate) => c.city).filter(Boolean)
        ));
        setCities(uniqueCities as string[]);
        
        if (result.pagination) {
          setTotalPages(result.pagination.last_page);
          setTotalCandidates(result.pagination.total);
        }
      } else {
        setCandidate(null);
        toast("Aucun candidat disponible", { icon: "ℹ️" });
      }
    } catch (error) {
      console.error("Error fetching candidate:", error);
      setCandidate(null);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
    fetchSectors();
    fetchDiplomes();
    fetchLastPayment();
  }, [currentPage, selectedSector, selectedJob, selectedCity, selectedGender, selectedEducation, minExperience, maxExperience]);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      setShowVideo(false);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      setShowVideo(false);
    }
  };

  const handleGenerateCV = async () => {
    if (!candidate) return;
    
    setLoadingPDF(true);
    try {
      await downloadResumePDF(candidate.id);
      toast.success("CV téléchargé avec succès!");
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    } finally {
      setLoadingPDF(false);
    }
  };

  const handleConsumeClick = () => {
    if (!lastPayment || lastPayment.status === "pending" || lastPayment.cv_video_remaining <= 0) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmConsume = async () => {
    if (!candidate) return;
    
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
            postuler_id: candidate.cv_id,
          }),
        },
      );

      if (response.ok) {
        toast.success("CV consommé avec succès!");
        setIsModalOpen(false);
        handleNext();
      } else {
        toast.error("Erreur lors de la consommation");
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
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <User className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Aucun candidat disponible</h2>
          <p className="text-gray-600 mb-6">Essayez de modifier vos filtres</p>
          <button
            onClick={clearFilters}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/20 to-emerald-50/20">
      {/* Filters Sidebar */}
      <div className="fixed left-0 top-20 bottom-0 w-80 bg-white border-r border-gray-200 shadow-lg overflow-y-auto z-10 hidden lg:block">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Filtres</h2>
            <p className="text-sm text-gray-600 mb-4">
              {totalCandidates} candidat{totalCandidates > 1 ? 's' : ''} disponible{totalCandidates > 1 ? 's' : ''}
            </p>
          </div>

          {/* Sector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Secteur</label>
            <select
              value={selectedSector}
              onChange={(e) => { setSelectedSector(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Tous</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Job */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Poste</label>
            <select
              value={selectedJob}
              onChange={(e) => { setSelectedJob(e.target.value); setCurrentPage(1); }}
              disabled={!selectedSector}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
            >
              <option value="">Tous</option>
              {filteredJobs.map((j) => (
                <option key={j.id} value={j.id}>{j.name}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ville</label>
            <select
              value={selectedCity}
              onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Toutes</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Education */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Niveau d'études</label>
            <select
              value={selectedEducation}
              onChange={(e) => { setSelectedEducation(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Tous</option>
              {diplomes.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Expérience</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={minExperience}
                onChange={(e) => { setMinExperience(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              >
                <option value="">Min</option>
                {[0, 1, 2, 3, 5, 7, 10].map((y) => (
                  <option key={y} value={y}>{y} an{y > 1 ? 's' : ''}</option>
                ))}
              </select>
              <select
                value={maxExperience}
                onChange={(e) => { setMaxExperience(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              >
                <option value="">Max</option>
                {[1, 2, 3, 5, 7, 10, 15, 20].map((y) => (
                  <option key={y} value={y}>{y} an{y > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Genre</label>
            <select
              value={selectedGender}
              onChange={(e) => { setSelectedGender(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Tous</option>
              <option value="male">Homme</option>
              <option value="female">Femme</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(selectedSector || selectedJob || selectedCity || selectedGender || selectedEducation || minExperience || maxExperience) && (
            <button
              onClick={clearFilters}
              className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-80 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidats Disponibles</h1>
            <p className="text-gray-600">
              Candidat {currentPage} sur {totalCandidates}
            </p>
          </div>

          {/* Candidate Card */}
          <div className="mb-8">
            <CandidateCard candidate={candidate} />
          </div>

          {/* Video Section */}
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">CV Vidéo</h3>
              <button
                onClick={() => setShowVideo(!showVideo)}
                className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {showVideo ? "Masquer" : "Voir la vidéo"}
              </button>
            </div>
            {showVideo && (
              <div className="aspect-video bg-black rounded-2xl overflow-hidden">
                <video
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/video/${candidate.link}`}
                  controls
                  className="w-full h-full"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={handleGenerateCV}
              disabled={loadingPDF}
              className="px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              {loadingPDF ? "Génération..." : "Télécharger CV"}
            </button>
            
            <button
              onClick={handleConsumeClick}
              className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              <Check className="w-5 h-5" />
              Consommer le CV
            </button>

            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              Passer
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-lg">
            <button
              onClick={handlePrevious}
              disabled={currentPage <= 1}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Précédent
            </button>
            
            <span className="text-gray-600 font-medium">
              {currentPage} / {totalPages}
            </span>
            
            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Suivant
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Consume Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white p-8 rounded-2xl shadow-2xl z-10 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirmer la consommation</h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir consommer ce CV vidéo ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl"
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

      {/* Upgrade Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsUpgradeModalOpen(false)}></div>
          <div className="bg-white p-8 rounded-2xl shadow-2xl z-10 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limite atteinte</h2>
            <p className="text-gray-600 mb-6">
              Vous avez atteint la limite de votre plan. Mettez à niveau pour consulter plus de CVs.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl"
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
    </div>
  );
};

export default CandidatsPage;
