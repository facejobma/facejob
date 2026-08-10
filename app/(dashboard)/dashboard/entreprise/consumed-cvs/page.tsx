"use client";
import React, { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { downloadConsumedResumePDF } from "@/components/ResumePDF";
import { Eye, Download, Search, X, Play, FileText, BarChart2, MessageSquare, User, MapPin, Calendar } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";

interface ConsumedCV {
  id: number;
  postuler_id: number;
  entreprise_id: number;
  created_at: string;
  updated_at: string;
  postuler: {
    id: number;
    link: string;
    candidat_id: number;
    is_verified: string;
    comment: string | null;
    created_at: string;
    updated_at: string;
    nb_experiences: string;
    job_id: number;
    sector_id: number;
    subtitles_vtt?: string;
    word_timestamps?: Array<{ word: string; raw_word: string; start: number; end: number }>;
    summary?: string;
    transcript?: string;
    soft_skills?: {
      communication?: number;
      teamwork?: number;
      adaptability?: number;
      results_orientation?: number;
    };
    candidat: {
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
      skills?: Array<{ id: number; name: string }>;
      formations?: Array<{
        id: number;
        diplome: string;
        field_of_study: string;
        school: string;
        start_date: string;
        end_date: string;
      }>;
      experiences?: Array<{
        id: number;
        title: string;
        company: string;
        location?: string;
        start_date: string;
        end_date: string;
        is_current: boolean;
      }>;
    };
  };
  entreprise: {
    id: number;
    company_name: string;
    phone: string;
    email: string;
    effectif: number;
    logo: string;
    description: string;
    adresse: string;
    sector_id: number;
    site_web: string;
    linkedin: string;
    plan_id: number;
    plan_start_data: string;
    plan_end_data: string;
    is_verified: string;
    comment: string | null;
    created_at: string;
    updated_at: string;
  };
}

const ConsumedCVs: React.FC = () => {
  const [consumedCVs, setConsumedCVs] = useState<ConsumedCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastPayment, setLastPayment] = useState<any>(null);
  
  // UI selection & search states
  const [selectedCV, setSelectedCV] = useState<ConsumedCV | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'skills' | 'search'>('summary');
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [globalSearchResults, setGlobalSearchResults] = useState<any[]>([]);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [localSearchResults, setLocalSearchResults] = useState<any[]>([]);

  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const company = typeof window !== "undefined"
    ? window.sessionStorage?.getItem("user")
    : null;
  const entrepriseId = company ? JSON.parse(company).id : null;

  useEffect(() => {
    const fetchConsumedCVs = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/consumed-cvs`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des CVs');
        }
        const data = await response.json();
        setConsumedCVs(data);
      } catch (error: any) {
        console.error("Error fetching consumed CVs:", error);
        toast.error("Erreur lors du chargement des CV débloqués!");
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchLastPayment = async () => {
      if (!entrepriseId) return;
      
      try {
        const response = await fetch(
          `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/payments/${entrepriseId}/last`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setLastPayment(data);
        } else if (response.status === 404) {
          setLastPayment(null);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
      }
    };

    if (entrepriseId && authToken) {
      fetchConsumedCVs();
      fetchLastPayment();
    }
  }, [authToken, entrepriseId]);

  // Global search effect
  useEffect(() => {
    if (!globalSearchQuery.trim()) {
      setGlobalSearchResults([]);
      return;
    }
    const query = globalSearchQuery.toLowerCase().trim();
    const results: any[] = [];

    consumedCVs.forEach(cv => {
      const timestamps = cv.postuler.word_timestamps || [];
      
      timestamps.forEach((wt, idx) => {
        if (wt.word.toLowerCase().includes(query)) {
          const startIdx = Math.max(0, idx - 4);
          const endIdx = Math.min(timestamps.length - 1, idx + 4);
          const snippetWords = timestamps.slice(startIdx, endIdx + 1).map(w => {
            if (w.start === wt.start) {
              return `[${w.raw_word}]`;
            }
            return w.raw_word;
          });
          results.push({
            cv,
            word: wt.raw_word,
            start: wt.start,
            textSnippet: snippetWords.join(" ")
          });
        }
      });
    });

    setGlobalSearchResults(results.slice(0, 15));
  }, [globalSearchQuery, consumedCVs]);

  // Local search effect
  useEffect(() => {
    if (!selectedCV || !localSearchQuery.trim()) {
      setLocalSearchResults([]);
      return;
    }
    const query = localSearchQuery.toLowerCase().trim();
    const timestamps = selectedCV.postuler.word_timestamps || [];
    const matches: any[] = [];

    timestamps.forEach((wt, idx) => {
      if (wt.word.toLowerCase().includes(query)) {
        const startIdx = Math.max(0, idx - 3);
        const endIdx = Math.min(timestamps.length - 1, idx + 3);
        const snippetWords = timestamps.slice(startIdx, endIdx + 1).map(w => {
          if (w.start === wt.start) {
            return `[${w.raw_word}]`;
          }
          return w.raw_word;
        });
        matches.push({
          word: wt.raw_word,
          start: wt.start,
          textSnippet: snippetWords.join(" ")
        });
      }
    });

    setLocalSearchResults(matches.slice(0, 10));
  }, [localSearchQuery, selectedCV]);

  const handleDownloadCV = async (candidateData: any) => {
    try {
      await downloadConsumedResumePDF(candidateData);
    } catch (error) {
      console.error("Error downloading CV:", error);
      toast.error("Erreur lors du téléchargement du CV");
    }
  };

  const handleSeek = (videoId: number, seconds: number) => {
    const video = document.querySelector(`video[data-video-id="${videoId}"]`) as HTMLVideoElement;
    if (video) {
      video.currentTime = seconds;
      video.play().catch(err => console.log("Play failed: ", err));
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const softSkillLabels: Record<string, string> = {
    communication: "Communication",
    teamwork: "Travail en équipe",
    adaptability: "Adaptabilité",
    results_orientation: "Orientation résultats",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des CVs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-semibold">Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 relative">
      {/* Simple Header */}
      <div className="bg-green-50 rounded-lg border-2 border-green-200 p-4 md:p-6">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
            <Eye className="text-green-600 w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900">CV Débloqués</h1>
            <p className="text-xs md:text-base text-gray-600">Consultez la liste des CV vidéos que vous avez débloqués</p>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white border-2 border-green-200 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="text-green-600 w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base md:text-xl font-bold text-gray-900">
                  {lastPayment ? (
                    <>
                      <span className="text-green-600">{consumedCVs.length}</span>
                      {" sur "}
                      {lastPayment.contact_access_consumed != null && lastPayment.contact_access_remaining != null
                        ? lastPayment.contact_access_consumed + lastPayment.contact_access_remaining === 999999
                          ? "∞"
                          : lastPayment.contact_access_consumed + lastPayment.contact_access_remaining
                        : consumedCVs.length}
                    </>
                  ) : (
                    consumedCVs.length
                  )}
                </p>
                <p className="text-xs text-gray-600">CV débloqués</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-green-200 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold text-base md:text-lg">✓</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base md:text-xl font-bold text-gray-900">{consumedCVs.filter(cv => cv.postuler.candidat.is_completed === 1).length}</p>
                <p className="text-xs text-gray-600">Profils complets</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-green-200 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="text-green-600 w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base md:text-xl font-bold text-gray-900">
                  {(() => {
                    const validExperiences = consumedCVs.filter(cv => 
                      cv.postuler.candidat.years_of_experience != null
                    );
                    if (validExperiences.length === 0) return "0 ans";
                    const sum = validExperiences.reduce((acc, cv) => 
                      acc + cv.postuler.candidat.years_of_experience, 0
                    );
                    const avg = Math.round(sum / validExperiences.length);
                    return `${avg} ans`;
                  })()}
                </p>
                <p className="text-xs text-gray-600">Exp. moyenne</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-green-200 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="text-green-600 w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1M8 7h8m-9 4v10a2 2 0 002 2h8a2 2 0 002-2V11a2 2 0 00-2-2H9a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base md:text-xl font-bold text-gray-900">{new Set(consumedCVs.map(cv => cv.postuler.sector_id)).size}</p>
                <p className="text-xs text-gray-600">Secteurs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Keyword Search */}
      {consumedCVs.length > 0 && (
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-5 border border-green-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-5 h-5 text-green-700" />
            <h2 className="text-sm font-bold text-green-800 uppercase tracking-wider">Recherche Globale IA</h2>
          </div>
          <p className="text-xs text-gray-600 mb-4">Recherchez un terme ou une compétence clé prononcée à l'oral par n'importe lequel de vos candidats débloqués.</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Exemples: 'Laravel', 'communication', 'solutions', 'excited'..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-green-200 rounded-lg focus:outline-none focus:border-green-500 bg-white transition-colors"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
            />
          </div>
          {globalSearchQuery && (
            <div className="mt-4 space-y-2 bg-white rounded-lg p-4 border border-green-100 max-h-60 overflow-y-auto shadow-inner">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase">Occurrences trouvées ({globalSearchResults.length})</h3>
                <button onClick={() => setGlobalSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {globalSearchResults.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Aucune correspondance trouvée dans les vidéos débloquées.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {globalSearchResults.map((result, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedCV(result.cv);
                        setLocalSearchQuery(result.word);
                        setActiveTab('search');
                        setTimeout(() => {
                          handleSeek(result.cv.postuler.id, result.start);
                        }, 400);
                      }}
                      className="py-2.5 flex items-start justify-between cursor-pointer hover:bg-green-50/50 rounded px-2 transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="text-xs font-bold text-gray-900">
                          {result.cv.postuler.candidat.first_name} {result.cv.postuler.candidat.last_name}
                        </p>
                        <p className="text-[11px] text-gray-500 italic mt-0.5">
                          ... {result.textSnippet} ...
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-green-700 bg-green-100 px-2 py-0.5 rounded flex-shrink-0">
                        <Play className="w-3 h-3 fill-current" />
                        {formatTime(result.start)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {consumedCVs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12 text-center">
          <div className="flex flex-col items-center justify-center gap-3 md:gap-4 text-gray-500">
            <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="text-gray-400 w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-base md:text-lg font-semibold text-gray-900 mb-2">Aucun CV débloqué</p>
              <p className="text-xs md:text-sm text-gray-600 max-w-md">
                Vous n'avez pas encore débloqué de CV vidéo. Commencez par explorer les candidats disponibles.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                      Vidéo
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                      Nom du Candidat
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                      Expérience
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                      CV mis en ligne
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                      Date de Déblocage
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {consumedCVs.map((cv, index) => (
                    <tr 
                      key={cv.id} 
                      className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-green-50/50 transition-colors`}
                    >
                      <td className="px-6 py-4 border-b border-gray-200 text-center">
                        <div className="flex justify-center cursor-pointer" onClick={() => setSelectedCV(cv)}>
                          <VideoPlayer
                            src={cv.postuler.link}
                            videoId={cv.postuler.id}
                            className="w-40 h-28 object-cover rounded-lg shadow-sm"
                            subtitlesVtt={cv.postuler.subtitles_vtt}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 text-center">
                        <div className="font-semibold text-gray-900">
                          {cv.postuler.candidat.first_name} {cv.postuler.candidat.last_name}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {cv.postuler.candidat.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {cv.postuler.candidat.years_of_experience ?? 0} ans
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 text-center text-gray-700">
                        {new Date(cv.postuler.created_at).toLocaleDateString("fr-FR", {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 text-center text-gray-700">
                        {new Date(cv.created_at).toLocaleDateString("fr-FR", {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 text-center">
                        <div className="flex flex-col gap-2 max-w-[160px] mx-auto">
                          <button
                            onClick={() => setSelectedCV(cv)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Analyse & Vidéo
                          </button>
                          <button
                            onClick={() => handleDownloadCV(cv.postuler.candidat)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-xs"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Télécharger CV
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {consumedCVs.map((cv) => (
              <div
                key={cv.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-green-300 hover:shadow-lg transition-all"
              >
                {/* Video */}
                <div className="relative h-48 bg-black cursor-pointer" onClick={() => setSelectedCV(cv)}>
                  <VideoPlayer
                    src={cv.postuler.link}
                    videoId={cv.postuler.id}
                    className="w-full h-full object-cover"
                    subtitlesVtt={cv.postuler.subtitles_vtt}
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="space-y-3">
                    {/* Name and Email */}
                    <div>
                      <h3 className="font-bold text-base text-gray-900">
                        {cv.postuler.candidat.first_name} {cv.postuler.candidat.last_name}
                      </h3>
                      <p className="text-xs text-gray-600 mt-0.5">{cv.postuler.candidat.email}</p>
                    </div>

                    {/* Info */}
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {cv.postuler.candidat.years_of_experience ?? 0} ans d'exp.
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        mis en ligne le {new Date(cv.postuler.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedCV(cv)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Analyse IA
                      </button>
                      <button
                        onClick={() => handleDownloadCV(cv.postuler.candidat)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        CV PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Details Side-Drawer / Modal */}
      {selectedCV && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedCV(null)}
          ></div>

          {/* Modal Container */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedCV(null)} 
                className="absolute right-4 top-4 p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 rounded-full z-10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Column - Video Player & Candidate Profile Info */}
              <div className="w-full md:w-1/2 bg-gray-900 text-white p-6 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                    {selectedCV.postuler.candidat.first_name} {selectedCV.postuler.candidat.last_name}
                  </h3>
                  
                  {/* Video Player */}
                  <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-inner border border-gray-800">
                    <VideoPlayer
                      src={selectedCV.postuler.link}
                      videoId={selectedCV.postuler.id}
                      className="w-full h-full object-contain"
                      subtitlesVtt={selectedCV.postuler.subtitles_vtt}
                    />
                  </div>

                  {/* Profile Quick Details */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Profil Candidat
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-400">Expérience</span>
                        <p className="font-semibold text-green-400">{selectedCV.postuler.candidat.years_of_experience ?? 0} ans</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Email</span>
                        <p className="font-semibold truncate">{selectedCV.postuler.candidat.email}</p>
                      </div>
                      {selectedCV.postuler.candidat.tel && (
                        <div>
                          <span className="text-gray-400">Téléphone</span>
                          <p className="font-semibold">{selectedCV.postuler.candidat.tel}</p>
                        </div>
                      )}
                      {selectedCV.postuler.candidat.address && (
                        <div>
                          <span className="text-gray-400">Localisation</span>
                          <p className="font-semibold truncate">{selectedCV.postuler.candidat.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => handleDownloadCV(selectedCV.postuler.candidat)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all shadow-md"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger le CV PDF
                  </button>
                </div>
              </div>

              {/* Right Column - B2B AI Features Tabs */}
              <div className="w-full md:w-1/2 p-6 flex flex-col overflow-hidden bg-white">
                
                {/* Tabs Navigation */}
                <div className="flex border-b border-gray-200 mb-4">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'summary' 
                        ? 'border-green-600 text-green-700' 
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Résumé IA
                  </button>
                  <button
                    onClick={() => setActiveTab('skills')}
                    className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'skills' 
                        ? 'border-green-600 text-green-700' 
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <BarChart2 className="w-4 h-4" />
                    Soft Skills
                  </button>
                  <button
                    onClick={() => setActiveTab('search')}
                    className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'search' 
                        ? 'border-green-600 text-green-700' 
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    Recherche
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                  
                  {/* TAB 1: SUMMARY */}
                  {activeTab === 'summary' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          Résumé Smart Summary
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium">
                          {selectedCV.postuler.summary || "Aucun résumé généré."}
                        </p>
                      </div>

                      {selectedCV.postuler.transcript && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                            Transcription Textuelle Complète
                          </h4>
                          <p className="text-xs text-gray-600 leading-relaxed italic">
                            "{selectedCV.postuler.transcript}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: SOFT SKILLS */}
                  {activeTab === 'skills' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <BarChart2 className="w-3.5 h-3.5" />
                          Analyse Sémantique des Soft Skills
                        </h4>
                        
                        {selectedCV.postuler.soft_skills && Object.keys(selectedCV.postuler.soft_skills).length > 0 ? (
                          <div className="space-y-3.5">
                            {Object.entries(selectedCV.postuler.soft_skills).map(([key, value]) => (
                              <div key={key}>
                                <div className="flex justify-between text-xs font-medium mb-1">
                                  <span className="text-gray-700">{softSkillLabels[key] || key}</span>
                                  <span className="text-purple-700">{value}/10</span>
                                </div>
                                <div className="w-full bg-purple-100 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(Number(value) / 10) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-purple-600 italic">Aucune donnée de Soft Skills disponible.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: LOCAL VIDEO KEYWORD SEARCH */}
                  {activeTab === 'search' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5" />
                          Recherche dans cette vidéo
                        </h4>
                        <input
                          type="text"
                          placeholder="Rechercher un mot prononcé dans la vidéo..."
                          className="w-full text-xs border border-blue-200 bg-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                          value={localSearchQuery}
                          onChange={(e) => setLocalSearchQuery(e.target.value)}
                        />
                        {localSearchQuery && localSearchResults.length === 0 && (
                          <p className="text-xs text-gray-500 italic">Aucune occurrence trouvée pour ce terme.</p>
                        )}
                        {localSearchResults.length > 0 && (
                          <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                            {localSearchResults.map((match, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSeek(selectedCV.postuler.id, match.start)}
                                className="w-full text-left flex items-start gap-2 p-2 rounded-lg bg-white border border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-xs text-gray-700 leading-normal"
                              >
                                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold flex-shrink-0 flex items-center gap-0.5">
                                  <Play className="w-2.5 h-2.5 fill-current" />
                                  {formatTime(match.start)}
                                </span>
                                <span className="flex-1 truncate">{match.textSnippet}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {!localSearchQuery && selectedCV.postuler.transcript && (
                        <p className="text-xs text-gray-500 italic text-center">
                          Saisissez un mot pour voir les timestamps correspondants et sauter directement au passage.
                        </p>
                      )}
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumedCVs;