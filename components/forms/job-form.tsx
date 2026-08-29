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
import { COMMON_LANGUAGES } from "@/constants/languages";

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
  job_id: number | null;
  image: string | null;
  created_at: string;
  updated_at: string;
  address: string | null;
  zip_code: string | null;
}

interface Postuler {
  id: number;
  link?: string | null;
}

interface JobData {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin?: string | null;
  company_name: string;
  sector_id: number;
  job_id: number | null;
  location: string;
  contractType: string;
  is_verified: string;
  status: "Pending" | "Accepted" | "Declined" | "Expired";
  entreprise_id: number;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string;
  experience_required?: number | null;
  benefits?: string[];
  required_languages?: string[];
  required_skills?: string[];
  applications: {
    id: number;
    candidate: Candidat | null;
    link: string | null;
    created_at: string;
    postuler: Postuler | null;
    status: "submitted" | "viewed" | "accepted" | "rejected";
    viewed_by_recruiter?: boolean;
    viewed_at?: string | null;
    is_consumed?: boolean;
  }[];
  applications_count: number;
}

const JobForm: React.FC<{ initialData: JobData; autoEdit?: boolean }> = ({ initialData, autoEdit = false }) => {
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
  const currentStatus = currentData.status ?? currentData.is_verified;
  const isPending = currentStatus === "Pending";
  const isAccepted = currentStatus === "Accepted";
  const isDeclined = currentStatus === "Declined";
  const isExpired = currentStatus === "Expired";

  // Languages & skills state
  const [requiredLanguages, setRequiredLanguages] = useState<string[]>(initialData.required_languages ?? []);
  const [requiredSkills, setRequiredSkills] = useState<string[]>(initialData.required_skills ?? []);
  const [benefits, setBenefits] = useState<string[]>(initialData.benefits ?? []);
  const [skillInput, setSkillInput] = useState("");

  const toggleLanguage = (lang: string) => {
    setRequiredLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };
  const addSkill = () => {
    const t = skillInput.trim();
    if (t && !requiredSkills.includes(t)) setRequiredSkills(prev => [...prev, t]);
    setSkillInput("");
  };
  const removeSkill = (s: string) => setRequiredSkills(prev => prev.filter(x => x !== s));

  // Form state
  const [formData, setFormData] = useState({
    titre: initialData.titre,
    description: initialData.description,
    location: initialData.location,
    contractType: initialData.contractType,
    date_debut: initialData.date_debut ? initialData.date_debut.split('T')[0] : '',
    date_fin: initialData.date_fin ? initialData.date_fin.split('T')[0] : '',
    sector_id: initialData.sector_id,
    job_id: initialData.job_id,
    experience_required: initialData.experience_required?.toString() ?? '',
    salary_min: initialData.salary_min?.toString() ?? '',
    salary_max: initialData.salary_max?.toString() ?? '',
    currency: initialData.currency ?? 'MAD',
  });

  const modalRef = useRef<HTMLDivElement>(null);

  const toggleShowAllCandidates = () => {
    setShowAllCandidates(!showAllCandidates);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Keep the edit form aligned with the backend validation rules.
      const plainDescription = formData.description.replace(/<[^>]*>/g, "").trim();
      if (!formData.titre.trim() || !plainDescription || !formData.date_debut || !formData.location.trim() || !formData.contractType || !formData.sector_id) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        setIsSubmitting(false);
        return;
      }

      if (formData.titre.trim().length < 5 || formData.titre.trim().length > 200) {
        toast.error("Le titre doit contenir entre 5 et 200 caractères");
        setIsSubmitting(false);
        return;
      }

      if (plainDescription.length < 50 || plainDescription.length > 10000) {
        toast.error("La description doit contenir entre 50 et 10000 caractères");
        setIsSubmitting(false);
        return;
      }

      if (formData.date_fin && formData.date_fin <= formData.date_debut) {
        toast.error("La date de fin doit être postérieure à la date de début");
        setIsSubmitting(false);
        return;
      }
      if (formData.salary_min && formData.salary_max && Number(formData.salary_max) < Number(formData.salary_min)) {
        toast.error("Le salaire maximum doit être supérieur ou égal au salaire minimum");
        setIsSubmitting(false);
        return;
      }

      console.log('Submitting offre update:', {
        url: `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/update_offre/${initialData.id}`,
        method: 'PUT',
        data: formData
      });
      
      const result = await apiRequest(
        `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/update_offre/${initialData.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            ...formData,
            required_languages: requiredLanguages,
            required_skills: requiredSkills,
            benefits,
            experience_required: formData.experience_required === '' ? null : Number(formData.experience_required),
            salary_min: formData.salary_min === '' ? null : Number(formData.salary_min),
            salary_max: formData.salary_max === '' ? null : Number(formData.salary_max),
          }),
        }
      );
      
      console.log('Update result:', result);
      
      if (result.success) {
        const payload = result.data as any;
        const responseData = payload?.data ?? {};
        const updatedOffer = responseData.offer ?? {};
        if (payload?.message) {
          toast.success(payload.message);
        } else {
        toast.success('Offre mise à jour avec succès!');
        }
        setIsEditing(false);
        // Update local state with new data
        setCurrentData((previous) => ({
          ...previous,
          ...updatedOffer,
          ...formData,
          date_fin: formData.date_fin || null,
          salary_min: formData.salary_min === '' ? null : Number(formData.salary_min),
          salary_max: formData.salary_max === '' ? null : Number(formData.salary_max),
          experience_required: formData.experience_required === '' ? null : Number(formData.experience_required),
          required_languages: requiredLanguages,
          required_skills: requiredSkills,
          benefits,
          is_verified: responseData.is_verified ?? updatedOffer.is_verified ?? previous.is_verified,
          status: responseData.status ?? updatedOffer.status ?? previous.status,
        }));
      } else {
        handleApiError(result, toast);
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

  const validApplications = (initialData.applications ?? []).filter(
    (application): application is JobData["applications"][number] & { candidate: Candidat; postuler: Postuler } =>
      Boolean(application.candidate && application.postuler),
  );
  const displayedApplications = showAllCandidates
    ? validApplications
    : validApplications.slice(0, 4);

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
          `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/sectors`
        );
        
        if (result.success) {
          const raw = result.data;
          // API returns { success: true, data: [...] }
          const data = raw?.data ?? raw;
          setSectors(Array.isArray(data) ? data : []);
        } else {
          console.error("Error fetching sectors:", result.error);
          setSectors([]);
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
  }, [sectors]); // re-run when sectors load so the select can display the right option

  const getSectorName = (sectorId: number) => {
    const sector = sectors.find((s) => s.id === sectorId);
    return sector ? sector.name : "Secteur inconnu";
  };

  const getJobName = (jobId: number | null) => {
    if (!jobId) return "Autre métier / non répertorié";
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
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
          <Calendar className="w-3.5 h-3.5" />
          Expirée
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
            <span>{currentData.applications_count} Candidat{currentData.applications_count !== 1 ? 's' : ''}</span>
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
                maxLength={200}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  required
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
                  required
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Date de début <span className="text-red-500">*</span>
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
              <label className="block text-sm font-semibold text-gray-900 mb-2">Date de fin</label>
              <input
                type="date"
                name="date_fin"
                value={formData.date_fin}
                min={formData.date_debut || undefined}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input type="number" name="experience_required" min="0" max="50" value={formData.experience_required} onChange={handleInputChange} placeholder="Expérience (années)" className="px-4 py-2.5 border rounded-lg" />
              <input type="number" name="salary_min" min="0" value={formData.salary_min} onChange={handleInputChange} placeholder="Salaire minimum" className="px-4 py-2.5 border rounded-lg" />
              <input type="number" name="salary_max" min="0" value={formData.salary_max} onChange={handleInputChange} placeholder="Salaire maximum" className="px-4 py-2.5 border rounded-lg" />
              <select name="currency" value={formData.currency} onChange={handleInputChange} className="px-4 py-2.5 border rounded-lg">
                <option value="MAD">MAD</option><option value="EUR">EUR</option><option value="USD">USD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Avantages</label>
              <div className="flex flex-wrap gap-2">
                {["Assurance santé", "Formation", "Télétravail", "Horaires flexibles", "Primes", "Transport", "Tickets restaurant", "Mutuelle"].map((benefit) => (
                  <label key={benefit} className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm">
                    <input type="checkbox" checked={benefits.includes(benefit)} onChange={() => setBenefits((current) => current.includes(benefit) ? current.filter((item) => item !== benefit) : [...current, benefit])} />
                    {benefit}
                  </label>
                ))}
              </div>
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

            {/* Secteur + Métier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Secteur d'activité</label>
                <select
                  value={selectedSector}
                  onChange={(e) => { setSelectedSector(e.target.value); setSelectedJob(""); setFormData(prev => ({ ...prev, sector_id: Number(e.target.value), job_id: null })); }}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                >
                  <option value="">Sélectionner un secteur</option>
                  {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Métier de référence (facultatif)</label>
                <select
                  value={selectedJob}
                  onChange={(e) => { setSelectedJob(e.target.value); setFormData(prev => ({ ...prev, job_id: e.target.value ? Number(e.target.value) : null })); }}
                  disabled={!selectedSector}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 disabled:opacity-50"
                >
                  <option value="">Autre métier / non répertorié</option>
                  {(sectors.find(s => s.id === Number(selectedSector))?.jobs ?? []).map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
              </div>
            </div>

            {/* Langues requises */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Langues requises</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_LANGUAGES.map(lang => (
                  <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      requiredLanguages.includes(lang) ? "bg-primary text-white border-primary" : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                    }`}>
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Compétences requises */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Compétences requises</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                  placeholder="Ex: React.js, Python, SQL..."
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900" />
                <button type="button" onClick={addSkill}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
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

        {/* Languages + Skills */}
        {((currentData.required_languages?.length ?? 0) > 0 || (currentData.required_skills?.length ?? 0) > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(currentData.required_languages?.length ?? 0) > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1.5">Langues requises</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentData.required_languages!.map(l => (
                    <span key={l} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium">{l}</span>
                  ))}
                </div>
              </div>
            )}
            {(currentData.required_skills?.length ?? 0) > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg md:col-span-2">
                <p className="text-xs text-gray-500 mb-1.5">Compétences requises</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentData.required_skills!.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
          </>
        )}

        {/* Candidates Section */}
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">Candidatures ({initialData.applications_count})</h2>
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
                  {application.candidate.image ? (
                    <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-green-100 flex-shrink-0">
                      <img
                        src={application.candidate.image.replace(/\\/g, '')}
                        alt={`${application.candidate.first_name} ${application.candidate.last_name}`}
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
                      {`${application.candidate.first_name} ${application.candidate.last_name}`}
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
                {application.candidate.bio && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {application.candidate.bio}
                  </p>
                )}

                {/* Experience Badge */}
                {application.candidate.years_of_experience > 0 && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <Briefcase className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-gray-600">
                      {application.candidate.years_of_experience} an{application.candidate.years_of_experience > 1 ? 's' : ''} d'expérience
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto pt-3 border-t border-gray-100">
                  <OfferCandidatActions
                    applicationId={application.id}
                    candidat={application.candidate}
                    postuler={application.postuler}
                    videoLink={application.link}
                    onVideoClick={() => {
                      setVideoLink(application.link);
                      setShowModal(true);
                    }}
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
                  date_fin: initialData.date_fin ? initialData.date_fin.split('T')[0] : '',
                  sector_id: initialData.sector_id,
                  job_id: initialData.job_id,
                  experience_required: initialData.experience_required?.toString() ?? '',
                  salary_min: initialData.salary_min?.toString() ?? '',
                  salary_max: initialData.salary_max?.toString() ?? '',
                  currency: initialData.currency ?? 'MAD',
                });
                setRequiredLanguages(initialData.required_languages ?? []);
                setRequiredSkills(initialData.required_skills ?? []);
                setBenefits(initialData.benefits ?? []);
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
        ) : null}
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
