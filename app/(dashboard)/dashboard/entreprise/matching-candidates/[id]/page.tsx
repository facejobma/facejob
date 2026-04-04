"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { downloadResumePDF } from "@/components/ResumePDF";
import { useUser } from "@/hooks/useUser";
import { 
  ArrowLeft, User, MapPin, Calendar, Briefcase, GraduationCap, 
  Building2, Code, Check, Globe, Award, Eye, FileText
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

interface MatchedCandidate {
  match_percentage: number;
  matched_criteria: {
    sector: boolean;
    job_title: boolean;
    experience: boolean;
    skills: string[];
    languages: string[];
    location: boolean;
    contract_type: boolean;
  };
  candidate: {
    id: number;
    full_name: string;
    image: string | null;
    job_title: string | null;
    sector: string | null;
    years_of_experience: number | null;
    availability_status: string;
    skills: string[];
    languages: string[];
    bio?: string;
    city?: string;
    formations?: Formation[];
    experiences?: Experience[];
  };
  offer?: {
    id: number;
    titre: string;
  };
}

interface CandidateVideo {
  id: number;
  link: string;
  job_name: string;
  secteur_name: string;
  created_at: string;
  is_consumed?: boolean;
}

interface Payment {
  id: number;
  cv_video_remaining?: number;
  contact_access_remaining?: number | string;
  status: string;
}

function MatchBadge({ percentage }: { percentage: number }) {
  let colorClass = "bg-red-100 text-red-700 border-red-200";
  if (percentage >= 70) colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
  else if (percentage >= 40) colorClass = "bg-orange-100 text-orange-700 border-orange-200";
  return <span className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-2 text-xl font-bold ${colorClass}`}>{percentage}%</span>;
}

function getStatusInFrench(status: string): string {
  switch (status) {
    case 'available':
      return 'Disponible';
    case 'unavailable':
      return 'Non disponible';
    default:
      return status;
  }
}

function AvailabilityBadge({ status }: { status: string }) {
  const frenchStatus = getStatusInFrench(status);
  const isAvailable = status === "available" || status === "disponible";
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${isAvailable ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-50 text-gray-500 border border-gray-200"}`}>
      <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-gray-400"}`} />
      {frenchStatus}
    </span>
  );
}

function getImageUrl(imageUrl: string | null, backendUrl: string): string {
  if (!imageUrl) return '';
  const fixed = imageUrl.replace(/\\\//g, '/');
  return fixed.startsWith('http') ? fixed : `${backendUrl}/storage/${fixed}`;
}

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [candidateData, setCandidateData] = useState<MatchedCandidate | null>(null);
  const [candidateVideos, setCandidateVideos] = useState<CandidateVideo[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checkingUnlock, setCheckingUnlock] = useState(true);

  const candidateId = params.id as string;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  const getRemainingCredits = (): number => {
    if (!lastPayment) return 0;
    if (lastPayment.contact_access_remaining !== undefined) {
      if (lastPayment.contact_access_remaining === 'unlimited') return 999;
      return typeof lastPayment.contact_access_remaining === 'number' 
        ? lastPayment.contact_access_remaining 
        : parseInt(String(lastPayment.contact_access_remaining)) || 0;
    }
    if (lastPayment.cv_video_remaining !== undefined) return lastPayment.cv_video_remaining;
    return 0;
  };

  useEffect(() => {
    const fetchLastPayment = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`${backendUrl}/api/v1/payments/${user.id}/last`, 
          { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } });
        if (response.ok) setLastPayment(await response.json());
      } catch (error) {
        console.log("Payment info not available");
      }
    };

    const checkIfUnlocked = async () => {
      if (!user?.id || !selectedVideoId) {
        setCheckingUnlock(false);
        return;
      }
      try {
        const response = await fetch(`${backendUrl}/api/v1/check-consumption-status`, { 
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ postuler_id: selectedVideoId })
        });
        if (response.ok) {
          const data = await response.json();
          setIsUnlocked(data.consumed || false);
        }
      } catch (error) {
        console.log("Could not check unlock status");
      } finally {
        setCheckingUnlock(false);
      }
    };

    fetchLastPayment();
    checkIfUnlocked();
  }, [user?.id, backendUrl, authToken, selectedVideoId]);

  useEffect(() => {
    const fetchCandidateDetail = async () => {
      const offreId = new URLSearchParams(window.location.search).get('offre_id');
      if (!offreId) {
        setError("ID de l'offre manquant");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${backendUrl}/api/v1/entreprise/matching-candidates?offre_id=${offreId}`, {
          headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`Erreur ${response.status}`);

        const data = await response.json();
        const candidates = data.data ?? [];
        let candidate = candidates.find((c: MatchedCandidate) => c.candidate.id === parseInt(candidateId));

        if (candidate) {
          try {
            const detailResponse = await fetch(`${backendUrl}/api/v1/candidate-profile/${candidateId}`, {
              headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
            });
            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              candidate = {
                ...candidate,
                candidate: {
                  ...candidate.candidate,
                  bio: detailData.bio,
                  city: detailData.city,
                  formations: detailData.educations || detailData.formations || [],
                  experiences: detailData.experiences || [],
                }
              };
            }
          } catch (err) {
            console.log("Could not fetch detailed info");
          }

          try {
            const videosResponse = await fetch(`${backendUrl}/api/v1/candidate-videos/${candidateId}?status=Accepted`, {
              headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
            });
            if (videosResponse.ok) {
              const videosData = await videosResponse.json();
              const videos = Array.isArray(videosData) ? videosData : [];
              const videosWithStatus = await Promise.all(
                videos.map(async (video: any) => {
                  try {
                    const checkResponse = await fetch(`${backendUrl}/api/v1/check-consumption-status`, {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
                      body: JSON.stringify({ postuler_id: video.id })
                    });
                    const checkData = await checkResponse.json();
                    return { ...video, is_consumed: checkData.consumed || false };
                  } catch {
                    return { ...video, is_consumed: false };
                  }
                })
              );
              setCandidateVideos(videosWithStatus);
              const firstAvailable = videosWithStatus.find(v => !v.is_consumed);
              if (firstAvailable) setSelectedVideoId(firstAvailable.id);
              // If any video is already consumed, mark as unlocked
              if (videosWithStatus.some(v => v.is_consumed)) {
                setIsUnlocked(true);
                setCheckingUnlock(false);
              }
            }
          } catch (err) {
            console.log("Could not fetch videos");
          }
          setCandidateData(candidate);
        } else {
          setError("Candidat non trouvé");
        }
      } catch (err) {
        setError("Impossible de charger les détails du candidat");
        toast.error("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };
    fetchCandidateDetail();
  }, [candidateId, backendUrl, authToken]);

  const handleGenerateCV = async () => {
    if (!candidateData) return;
    try {
      await downloadResumePDF(candidateData.candidate.id);
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleConsumeClick = async () => {
    if (!user?.id) {
      toast.error("Erreur: Utilisateur non identifié");
      return;
    }
    if (!lastPayment || lastPayment.status === "pending" || getRemainingCredits() <= 0) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const confirmConsume = async () => {
    if (!candidateData || !user?.id || !selectedVideoId) return;
    setIsConfirmModalOpen(false);

    try {
      const response = await fetch(`${backendUrl}/api/v1/consumations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ entreprise_id: user.id, postuler_id: selectedVideoId }),
      });

      if (response.ok) {
        setIsUnlocked(true);
        toast.success((t) => (
          <div className="flex flex-col gap-2">
            <span className="font-semibold">CV débloqué avec succès!</span>
            <button onClick={() => { toast.dismiss(t.id); window.location.href = '/dashboard/entreprise/consumed-cvs'; }}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
              Voir mes profils débloqués
            </button>
          </div>
        ), { duration: 5000 });
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 409) {
          setIsUnlocked(true);
          toast.success((t) => (
            <div className="flex flex-col gap-2">
              <span>Ce CV est déjà dans vos profils débloqués</span>
              <button onClick={() => { toast.dismiss(t.id); window.location.href = '/dashboard/entreprise/consumed-cvs'; }}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                Voir mes profils débloqués
              </button>
            </div>
          ), { duration: 5000 });
        } else if (response.status === 402) {
          toast.error(errorData.message || "Vous avez atteint la limite de consultations de CV.");
          setTimeout(() => setIsUpgradeModalOpen(true), 500);
        } else {
          toast.error(errorData.message || "Erreur lors du déblocage du CV");
        }
      }
    } catch (error) {
      console.error("Error consuming CV:", error);
      toast.error("Erreur réseau. Veuillez réessayer.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !candidateData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || "Candidat non trouvé"}</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            Retour
          </button>
        </div>
      </div>
    );
  }

  const { candidate, match_percentage, matched_criteria, offer } = candidateData;

  return (
    <>
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <button onClick={() => router.back()} className="mb-4 flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour aux candidats correspondants
        </button>

        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-500 flex-shrink-0 bg-gradient-to-br from-green-400 to-emerald-600">
            {candidate.image ? (
              <img src={getImageUrl(candidate.image, backendUrl)} alt={candidate.full_name} className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                {candidate.full_name?.[0] || 'C'}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{candidate.full_name}</h1>
                <p className="text-lg text-gray-600">{[candidate.job_title, candidate.sector].filter(Boolean).join(" · ") || "Non spécifié"}</p>
              </div>
              <MatchBadge percentage={match_percentage} />
            </div>

            <div className="flex flex-wrap gap-3">
              <AvailabilityBadge status={candidate.availability_status} />
              {isUnlocked && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-full text-sm font-bold">
                  <Check className="w-4 h-4" />Profil débloqué
                </span>
              )}
              {candidate.city && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  <MapPin className="w-4 h-4" />{candidate.city}
                </span>
              )}
              {candidate.years_of_experience != null && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  <Calendar className="w-4 h-4" />{candidate.years_of_experience} ans d'expérience
                </span>
              )}
            </div>
          </div>
        </div>

        {offer && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">Candidat correspondant pour l'offre : <span className="font-semibold text-gray-900">{offer.titre}</span></p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
          {isUnlocked ? (
            <button onClick={handleGenerateCV} className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
              <FileText className="w-5 h-5" />Télécharger CV complet
            </button>
          ) : (
            <button onClick={handleGenerateCV} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
              <FileText className="w-5 h-5" />CV anonyme (gratuit)
            </button>
          )}
          {candidateVideos.length === 0 ? (
            <div className="flex-1 px-4 py-3 bg-gray-100 text-gray-500 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border-2 border-dashed border-gray-300">
              <Eye className="w-5 h-5" />Aucun CV vidéo disponible
            </div>
          ) : !selectedVideoId ? (
            <div className="flex-1 px-4 py-3 bg-orange-100 text-orange-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border-2 border-orange-300">
              <Eye className="w-5 h-5" />Sélectionnez un CV vidéo ci-dessous
            </div>
          ) : checkingUnlock ? (
            <button disabled className="flex-1 px-4 py-3 bg-gray-300 text-gray-500 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />Vérification...
            </button>
          ) : isUnlocked ? (
            <button onClick={() => router.push('/dashboard/entreprise/consumed-cvs')} className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
              <Check className="w-5 h-5" />Déjà débloqué - Voir les coordonnées
            </button>
          ) : (
            <button onClick={handleConsumeClick} className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
              <Eye className="w-5 h-5" />Débloquer (1 crédit)
            </button>
          )}
        </div>
      </div>

      {candidate.bio && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />À propos
          </h2>
          <p className="text-gray-700 leading-relaxed">{candidate.bio}</p>
        </div>
      )}

      {candidateVideos.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-600" />CV Vidéos disponibles ({candidateVideos.length})
          </h2>
          <p className="text-sm text-gray-600 mb-4">Sélectionnez le CV vidéo que vous souhaitez débloquer</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidateVideos.map((video) => (
              <div key={video.id} onClick={() => !video.is_consumed && setSelectedVideoId(video.id)}
                className={`relative rounded-lg border-2 overflow-hidden transition-all ${
                  video.is_consumed ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                  : selectedVideoId === video.id ? "border-green-500 bg-green-50 cursor-pointer shadow-md"
                  : "border-gray-200 hover:border-green-300 cursor-pointer"
                }`}>
                <div className="relative h-48 bg-black">
                  <video src={video.link.startsWith('http') ? video.link : `${backendUrl}/video/${video.link}`}
                    className="w-full h-full object-cover" muted playsInline />
                  {video.is_consumed && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="bg-emerald-500 rounded-full p-3"><Check className="w-8 h-8 text-white" /></div>
                    </div>
                  )}
                  {selectedVideoId === video.id && !video.is_consumed && (
                    <div className="absolute top-2 right-2 bg-green-500 rounded-full p-2"><Check className="w-5 h-5 text-white" /></div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-gray-900 text-sm truncate">{video.job_name}</p>
                  <p className="text-xs text-gray-600 truncate">{video.secteur_name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(video.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  {video.is_consumed && (
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      <Check className="w-3 h-3" />Déjà débloqué
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {!selectedVideoId && candidateVideos.some(v => !v.is_consumed) && (
            <p className="mt-4 text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
              ⚠️ Veuillez sélectionner un CV vidéo avant de débloquer
            </p>
          )}
        </div>
      )}

      {candidate.formations && candidate.formations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-green-600" />Formation
          </h2>
          <div className="space-y-4">
            {candidate.formations.map((formation) => (
              <div key={formation.id} className="border-l-4 border-green-500 pl-4 py-2">
                <p className="font-semibold text-gray-900 text-lg">{formation.diplome}</p>
                <p className="text-gray-700">{formation.field_of_study}</p>
                <p className="text-gray-600 text-sm">{formation.school}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {new Date(formation.start_date).getFullYear()} - {new Date(formation.end_date).getFullYear()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {candidate.experiences && candidate.experiences.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-600" />Expérience professionnelle
          </h2>
          <div className="space-y-4">
            {candidate.experiences.map((experience) => (
              <div key={experience.id} className="border-l-4 border-green-500 pl-4 py-2">
                <p className="font-semibold text-gray-900 text-lg">{experience.title}</p>
                <p className="text-gray-700">{experience.company}</p>
                {experience.location && (
                  <p className="text-gray-600 text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{experience.location}
                  </p>
                )}
                <p className="text-gray-500 text-sm mt-1">
                  {new Date(experience.start_date).getFullYear()} - {experience.is_current ? 'Présent' : new Date(experience.end_date).getFullYear()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />Critères de correspondance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { key: "sector", label: "Secteur", icon: Building2 },
            { key: "job_title", label: "Poste", icon: Briefcase },
            { key: "experience", label: "Expérience", icon: Award },
            { key: "location", label: "Localisation", icon: MapPin },
            { key: "contract_type", label: "Type de contrat", icon: Calendar },
          ].map(({ key, label, icon: Icon }) => {
            const matched = matched_criteria[key as keyof typeof matched_criteria];
            return (
              <div key={key} className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 ${matched ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{label}</span>
                <span className={`ml-auto w-3 h-3 rounded-full ${matched ? "bg-emerald-500" : "bg-gray-300"}`} />
              </div>
            );
          })}
        </div>
      </div>

      {candidate.skills.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-green-600" />Compétences
          </h2>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((skill, idx) => {
              const isMatched = matched_criteria.skills.includes(skill);
              return (
                <span key={idx} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isMatched ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300" : "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                  {skill}{isMatched && <span className="ml-2 text-emerald-600">✓</span>}
                </span>
              );
            })}
          </div>
          {matched_criteria.skills.length > 0 && (
            <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
              <Check className="w-4 h-4 inline mr-2" />{matched_criteria.skills.length} compétence(s) correspondent à l'offre
            </p>
          )}
        </div>
      )}

      {candidate.languages.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-600" />Langues
          </h2>
          <div className="flex flex-wrap gap-2">
            {candidate.languages.map((lang, idx) => {
              const isMatched = matched_criteria.languages.includes(lang);
              return (
                <span key={idx} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isMatched ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300" : "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                  {lang}{isMatched && <span className="ml-2 text-emerald-600">✓</span>}
                </span>
              );
            })}
          </div>
          {matched_criteria.languages.length > 0 && (
            <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
              <Check className="w-4 h-4 inline mr-2" />{matched_criteria.languages.length} langue(s) correspondent à l'offre
            </p>
          )}
        </div>
      )}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Résumé du profil</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">Correspondance</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{match_percentage}%</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Code className="w-4 h-4" />
              <span className="text-sm font-medium">Compétences</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{candidate.skills.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">Langues</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{candidate.languages.length}</p>
          </div>
        </div>
      </div>
    </div>

    {isUpgradeModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsUpgradeModalOpen(false)}></div>
        <div className="bg-white p-8 rounded-2xl shadow-2xl relative z-[70] max-w-md w-full border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Limite atteinte</h2>
          <p className="text-gray-600 mb-6">Vous avez atteint votre limite de consultations. Mettez à niveau votre forfait pour consulter plus de CVs.</p>
          <div className="flex gap-3">
            <button onClick={() => setIsUpgradeModalOpen(false)} className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors">
              Annuler
            </button>
            <button onClick={() => window.location.href = "/dashboard/entreprise/services"} className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors">
              Mettre à niveau
            </button>
          </div>
        </div>
      </div>
    )}

    {isConfirmModalOpen && selectedVideoId && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
            <h3 className="text-2xl font-bold text-white">Confirmer le déblocage</h3>
          </div>
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-700 mb-3">Vous êtes sur le point de débloquer les coordonnées de ce candidat.</p>
                {candidateVideos.find(v => v.id === selectedVideoId) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-xs font-medium text-blue-900 mb-1">CV vidéo sélectionné :</p>
                    <p className="text-sm text-blue-700">
                      {candidateVideos.find(v => v.id === selectedVideoId)?.job_name} · {candidateVideos.find(v => v.id === selectedVideoId)?.secteur_name}
                    </p>
                  </div>
                )}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-orange-900 mb-1">Cette action débloquera 1 crédit</p>
                  <p className="text-xs text-orange-700">Crédits restants après déblocage : {getRemainingCredits() - 1}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsConfirmModalOpen(false)} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors">
                Annuler
              </button>
              <button onClick={confirmConsume} className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                Confirmer
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}