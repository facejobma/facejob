"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { Send } from "lucide-react";
import { fetchSectors, createOffer, fetchLastPayment } from "@/lib/api";
import RichTextEditor from "@/components/RichTextEditor";
import { sanitizeHtml } from "@/lib/sanitize";
import { useUser } from "@/hooks/useUser";

interface Sector {
  id: number;
  name: string;
}

export default function PublierPage() {
  const { user, isLoading: userLoading } = useUser();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading">("idle");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLimitReachedModalOpen, setIsLimitReachedModalOpen] = useState(false);
  const [planInfo, setPlanInfo] = useState<{
    jobLimit: number;
    jobPosted: number;
    jobRemaining: number;
    planName: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    location: "",
    contractType: "",
    sector_id: "",
    date_debut: "",
    date_fin: "",
  });

  const [requiredLanguages, setRequiredLanguages] = useState<string[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const AVAILABLE_LANGUAGES = ["Arabe", "Français", "Anglais", "Espagnol", "Allemand", "Italien", "Portugais"];

  const toggleLanguage = (lang: string) => {
    setRequiredLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const addSkill = () => {
    const parts = skillInput.split(",").map(s => s.trim()).filter(s => s && !requiredSkills.includes(s));
    if (parts.length > 0) {
      setRequiredSkills(prev => [...prev, ...parts]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setRequiredSkills(prev => prev.filter(s => s !== skill));
  };

  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  useEffect(() => {
    if (user?.id) {
      fetchSectorsData();
      checkPaymentStatus();
    }
  }, [user?.id]);

  const fetchSectorsData = async () => {
    try {
      const data = await fetchSectors();
      setSectors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      toast.error("Erreur lors du chargement des secteurs");
      setSectors([]);
    }
  };

  const checkPaymentStatus = async () => {
    if (!user?.id || !authToken) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/payments/${user.id}/last`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      
      if (response.ok) {
        const payment = await response.json();
        
        // Use backend data directly - it already calculates job_remaining correctly
        const jobPosted = payment.job_posted || 0;
        const jobRemaining = payment.job_remaining === 'unlimited' || payment.job_remaining === -1 
          ? -1 
          : parseInt(payment.job_remaining || '0');
        
        // Calculate total limit
        const jobLimit = jobRemaining === -1 
          ? -1 
          : jobPosted + jobRemaining;
        
        setPlanInfo({
          jobLimit,
          jobPosted,
          jobRemaining,
          planName: payment.plan_name || 'Plan Standard'
        });
        
        // If limit reached, show modal immediately
        if (jobRemaining !== -1 && jobRemaining <= 0) {
          setIsLimitReachedModalOpen(true);
        }
      } else if (response.status === 404) {
        console.error("No active payment found");
        setIsUpgradeModalOpen(true);
      } else {
        console.error("Failed to fetch payment status");
        setIsUpgradeModalOpen(true);
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setIsUpgradeModalOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error("Erreur: Utilisateur non identifié");
      return;
    }
    
    // Check if job limit is reached BEFORE validation
    if (planInfo && planInfo.jobLimit !== -1 && planInfo.jobRemaining <= 0) {
      setIsLimitReachedModalOpen(true);
      return;
    }
    
    if (!formData.titre || !formData.description || !formData.sector_id || !formData.date_debut || !formData.location) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (formData.titre.trim().length < 5) {
      toast.error("Le titre doit contenir au moins 5 caractères");
      return;
    }

    if (formData.titre.length > 255) {
      toast.error("Le titre ne peut pas dépasser 255 caractères");
      return;
    }

    const plainText = formData.description.replace(/<[^>]*>/g, '');
    if (plainText.length < 50) {
      toast.error("La description doit contenir au moins 50 caractères");
      return;
    }

    if (plainText.length > 10000) {
      toast.error("La description ne peut pas dépasser 10000 caractères");
      return;
    }

    // Validate date de début is in the future
    const startDate = new Date(formData.date_debut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      toast.error("La date de début doit être dans le futur");
      return;
    }

    setIsLoading(true);
    setUploadStatus("uploading");

    try {
      const sanitizedDescription = sanitizeHtml(formData.description);
      
      await createOffer({
        ...formData,
        description: sanitizedDescription,
        entreprise_id: user.id,
        required_languages: requiredLanguages,
        required_skills: requiredSkills,
      });

      setFormData({
        titre: "",
        description: "",
        location: "",
        contractType: "",
        sector_id: "",
        date_debut: "",
        date_fin: "",
      });
      setRequiredLanguages([]);
      setRequiredSkills([]);

      setIsSuccessModalOpen(true);
    } catch (error: any) {
      console.error("Error creating offer:", error);
      
      // Handle specific backend errors
      if (error?.error === "JOB_LIMIT_REACHED") {
        const limit = error?.limit || 3;
        const used = error?.used || limit;
        toast.error(`Limite de publication d'offres atteinte pour votre plan actuel. (${used}/${limit} offres utilisées)`);
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error(error instanceof Error ? error.message : "Erreur lors de la publication de l'offre");
      }
    } finally {
      setIsLoading(false);
      setUploadStatus("idle");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
    <div className="max-w-4xl mx-auto">
      {/* Header Simple */}
      <div className="bg-green-50 rounded-lg border-2 border-green-200 p-6 mb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Send className="text-green-600 w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Publier une offre d'emploi</h1>
              <p className="text-gray-600">Remplissez les informations de votre offre</p>
            </div>
          </div>
          
          {/* Job Limit Indicator */}
          {planInfo && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border-2 border-green-300 shadow-sm">
              <div className="text-right">
                <p className="text-xs text-gray-600 font-medium">Offres restantes</p>
                <p className={`text-lg font-bold ${
                  planInfo.jobRemaining === -1 
                    ? 'text-green-600' 
                    : planInfo.jobRemaining === 0 
                    ? 'text-red-600' 
                    : planInfo.jobRemaining <= 2 
                    ? 'text-amber-600' 
                    : 'text-green-600'
                }`}>
                  {planInfo.jobRemaining === -1 ? '∞' : planInfo.jobRemaining}
                  {planInfo.jobLimit !== -1 && ` / ${planInfo.jobLimit}`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warning Alert if low on jobs */}
      {planInfo && planInfo.jobRemaining !== -1 && planInfo.jobRemaining <= 2 && planInfo.jobRemaining > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-amber-900 mb-1">
                Attention: Il vous reste seulement {planInfo.jobRemaining} offre{planInfo.jobRemaining > 1 ? 's' : ''} à publier
              </h3>
              <p className="text-sm text-amber-800">
                Vous avez utilisé {planInfo.jobPosted} sur {planInfo.jobLimit} offres de votre plan {planInfo.planName}. 
                Pensez à mettre à niveau votre plan pour publier plus d'offres.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-lg border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Titre */}
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
              placeholder="Ex: Développeur Full Stack Senior"
              required
              minLength={5}
              maxLength={255}
            />
            {formData.titre && formData.titre.trim().length < 5 && (
              <p className="mt-1 text-sm text-red-600">
                Le titre doit contenir au moins 5 caractères ({formData.titre.trim().length}/5)
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Secteur */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Secteur d'activité <span className="text-red-500">*</span>
              </label>
              <select
                name="sector_id"
                value={formData.sector_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                required
              >
                <option value="">Sélectionner un secteur</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type de contrat */}
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
                <option value="">Sélectionner un type</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Freelance">Freelance</option>
                <option value="Alternance">Alternance</option>
              </select>
            </div>
          </div>

          {/* Localisation */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Localisation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              placeholder="Ex: Casablanca, Maroc"
              required
            />
          </div>

          {/* Langues requises */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Langues requises</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_LANGUAGES.map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    requiredLanguages.includes(lang)
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-green-400"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Compétences requises */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Compétences requises</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                placeholder="Ex: React.js, Python, SQL..."
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Ajouter
              </button>
            </div>
            {requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-sm font-medium">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="ml-1 text-emerald-500 hover:text-red-500 transition-colors">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date de début */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Date de début <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date_debut"
                value={formData.date_debut}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
            </div>

            {/* Date de fin */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                name="date_fin"
                value={formData.date_fin}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description de l'offre <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <RichTextEditor
                content={formData.description}
                onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                placeholder="Décrivez le poste, les missions, les compétences requises..."
                minHeight="300px"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Minimum 50 caractères • {formData.description.replace(/<[^>]*>/g, '').length} / 10000
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !!(planInfo && planInfo.jobLimit !== -1 && planInfo.jobRemaining <= 0)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 font-medium rounded-lg transition-colors ${
                isLoading || (planInfo && planInfo.jobLimit !== -1 && planInfo.jobRemaining <= 0)
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {uploadStatus === "uploading" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Publication en cours...</span>
                </>
              ) : planInfo && planInfo.jobLimit !== -1 && planInfo.jobRemaining <= 0 ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Limite atteinte</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publier l'offre</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => window.location.reload()}></div>
          <div className="bg-white p-8 rounded-xl shadow-lg z-10 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Offre soumise avec succès!
              </h2>
              <p className="text-gray-600">
                Votre offre d'emploi a été soumise et est en attente de validation par notre équipe. Vous serez notifié une fois qu'elle sera approuvée et publiée.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  window.location.href = "/dashboard/entreprise/mes-offres";
                }}
                className="flex-1 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voir mes offres
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Créer une autre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsUpgradeModalOpen(false)}></div>
          <div className="bg-white p-8 rounded-xl shadow-lg z-10 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Limite atteinte
              </h2>
              <p className="text-gray-600">
                Vous avez atteint la limite de votre plan. Mettez à niveau pour publier plus d'offres.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="flex-1 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => window.location.href = "/dashboard/entreprise/services"}
                className="flex-1 px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Mettre à niveau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Limit Reached Modal */}
      {isLimitReachedModalOpen && planInfo && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsLimitReachedModalOpen(false)}></div>
          <div className="bg-white p-8 rounded-xl shadow-lg z-10 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Limite d'offres atteinte
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Plan actuel:</span>
                  <span className="text-sm font-semibold text-gray-900">{planInfo.planName}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Offres publiées:</span>
                  <span className="text-sm font-semibold text-gray-900">{planInfo.jobPosted} / {planInfo.jobLimit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Offres restantes:</span>
                  <span className="text-sm font-bold text-red-600">{planInfo.jobRemaining}</span>
                </div>
              </div>
              <p className="text-gray-600">
                Vous avez atteint la limite de publication d'offres pour votre plan actuel. 
                Pour continuer à publier des offres, veuillez mettre à niveau votre abonnement.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsLimitReachedModalOpen(false);
                  window.history.back();
                }}
                className="flex-1 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Retour
              </button>
              <button
                onClick={() => window.location.href = "/dashboard/entreprise/services"}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-colors shadow-sm"
              >
                Mettre à niveau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
