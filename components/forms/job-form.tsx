import React, { useState, useEffect } from "react";
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
  X,
  Banknote,
  Eye,
  Gift,
  Pencil,
  Save,
  Users,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { FiUser } from "react-icons/fi";
import { OfferCandidatActions } from "../OfferCandidatActions";
import { apiRequest, handleApiError } from "@/lib/apiUtils";
import RichTextEditor from "@/components/RichTextEditor";
import toast from "react-hot-toast";
import Select, { MultiValue } from "react-select";
import languagesData from "@/data/languages.json";
import skillsData from "@/data/skills.json";

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
  email: string | null;
  tel: string | null;
  sex: string;
  bio: string | null;
  years_of_experience: number | null;
  is_completed?: number | boolean;
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
    video_available?: boolean;
  }[];
  applications_count: number;
  views_count?: number;
  created_at?: string;
}

const BENEFIT_OPTIONS = [
  "Assurance santé",
  "Formation",
  "Télétravail",
  "Horaires flexibles",
  "Primes",
  "Transport",
  "Tickets restaurant",
  "Mutuelle",
];

type SelectOption = { value: string; label: string };
const LANGUAGE_OPTIONS: SelectOption[] = languagesData.languages.map(
  (language) => ({ value: language, label: language }),
);
const SKILL_OPTIONS = Object.entries(skillsData).map(([group, skills]) => ({
  label: group.replaceAll("_", " "),
  options: skills.map((skill) => ({ value: skill, label: skill })),
}));

const fieldClassName =
  "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100";

const formatDate = (value?: string | null) => {
  if (!value) return "Non spécifiée";
  const dateValue = value.split("T")[0];
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Non spécifiée";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getNextDateValue = (dateValue: string) => {
  if (!dateValue) return undefined;
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
};

const JobForm: React.FC<{ initialData: JobData; autoEdit?: boolean }> = ({
  initialData,
  autoEdit = false,
}) => {
  const [showAllCandidates, setShowAllCandidates] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [videoLink, setVideoLink] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);
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
  const [requiredLanguages, setRequiredLanguages] = useState<string[]>(
    initialData.required_languages ?? [],
  );
  const [requiredSkills, setRequiredSkills] = useState<string[]>(
    initialData.required_skills ?? [],
  );
  const [benefits, setBenefits] = useState<string[]>(
    initialData.benefits ?? [],
  );
  const handleLanguagesChange = (options: MultiValue<SelectOption>) => {
    if (options.length > 20) {
      toast.error("Vous pouvez sélectionner au maximum 20 langues.");
      return;
    }
    setRequiredLanguages(options.map((option) => option.value));
  };

  const handleSkillsChange = (options: MultiValue<SelectOption>) => {
    if (options.length > 30) {
      toast.error("Vous pouvez sélectionner au maximum 30 compétences.");
      return;
    }
    setRequiredSkills(options.map((option) => option.value));
  };

  // Form state
  const [formData, setFormData] = useState({
    titre: initialData.titre,
    description: initialData.description,
    location: initialData.location,
    contractType: initialData.contractType,
    date_debut: initialData.date_debut
      ? initialData.date_debut.split("T")[0]
      : "",
    date_fin: initialData.date_fin ? initialData.date_fin.split("T")[0] : "",
    sector_id: initialData.sector_id,
    job_id: initialData.job_id,
    experience_required: initialData.experience_required?.toString() ?? "",
    salary_min: initialData.salary_min?.toString() ?? "",
    salary_max: initialData.salary_max?.toString() ?? "",
    currency: initialData.currency ?? "MAD",
  });

  const toggleShowAllCandidates = () => {
    setShowAllCandidates(!showAllCandidates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Keep the edit form aligned with the backend validation rules.
      const plainDescription = formData.description
        .replace(/<[^>]*>/g, "")
        .trim();
      if (
        !formData.titre.trim() ||
        !plainDescription ||
        !formData.date_debut ||
        !formData.location.trim() ||
        !formData.contractType ||
        !formData.sector_id
      ) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        setIsSubmitting(false);
        return;
      }

      if (
        formData.titre.trim().length < 5 ||
        formData.titre.trim().length > 200
      ) {
        toast.error("Le titre doit contenir entre 5 et 200 caractères");
        setIsSubmitting(false);
        return;
      }

      if (
        formData.location.trim().length < 2 ||
        formData.location.trim().length > 100
      ) {
        toast.error("La localisation doit contenir entre 2 et 100 caractères");
        setIsSubmitting(false);
        return;
      }

      if (plainDescription.length < 50 || plainDescription.length > 10000) {
        toast.error(
          "La description doit contenir entre 50 et 10000 caractères",
        );
        setIsSubmitting(false);
        return;
      }

      if (formData.date_fin && formData.date_fin <= formData.date_debut) {
        toast.error("La date de fin doit être postérieure à la date de début");
        setIsSubmitting(false);
        return;
      }
      if (
        formData.salary_min &&
        formData.salary_max &&
        Number(formData.salary_max) < Number(formData.salary_min)
      ) {
        toast.error(
          "Le salaire maximum doit être supérieur ou égal au salaire minimum",
        );
        setIsSubmitting(false);
        return;
      }
      if (
        formData.experience_required !== "" &&
        (!Number.isInteger(Number(formData.experience_required)) ||
          Number(formData.experience_required) < 0 ||
          Number(formData.experience_required) > 50)
      ) {
        toast.error(
          "L'expérience doit être un nombre entier entre 0 et 50 ans",
        );
        setIsSubmitting(false);
        return;
      }
      if (
        Number(formData.salary_min || 0) < 0 ||
        Number(formData.salary_max || 0) < 0
      ) {
        toast.error("Le salaire ne peut pas être négatif");
        setIsSubmitting(false);
        return;
      }

      const result = await apiRequest(
        `${typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/update_offre/${initialData.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            ...formData,
            required_languages: requiredLanguages,
            required_skills: requiredSkills,
            benefits,
            experience_required:
              formData.experience_required === ""
                ? null
                : Number(formData.experience_required),
            salary_min:
              formData.salary_min === "" ? null : Number(formData.salary_min),
            salary_max:
              formData.salary_max === "" ? null : Number(formData.salary_max),
          }),
        },
      );

      if (result.success) {
        const payload = result.data as any;
        const responseData = payload?.data ?? {};
        const updatedOffer = responseData.offer ?? {};
        if (payload?.message) {
          toast.success(payload.message);
        } else {
          toast.success("Offre mise à jour avec succès!");
        }
        setIsEditing(false);
        // Update local state with new data
        setCurrentData((previous) => ({
          ...previous,
          ...updatedOffer,
          ...formData,
          date_fin: formData.date_fin || null,
          salary_min:
            formData.salary_min === "" ? null : Number(formData.salary_min),
          salary_max:
            formData.salary_max === "" ? null : Number(formData.salary_max),
          experience_required:
            formData.experience_required === ""
              ? null
              : Number(formData.experience_required),
          required_languages: requiredLanguages,
          required_skills: requiredSkills,
          benefits,
          is_verified:
            responseData.is_verified ??
            updatedOffer.is_verified ??
            previous.is_verified,
          status: responseData.status ?? updatedOffer.status ?? previous.status,
        }));
        setSelectedSector(String(formData.sector_id));
        setSelectedJob(formData.job_id ? String(formData.job_id) : "");
      } else {
        handleApiError(result, toast);
        console.error("Update failed:", result);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "date_debut" && prev.date_fin && prev.date_fin <= value
        ? { date_fin: "" }
        : {}),
    }));
  };

  const validApplications = (currentData.applications ?? []).filter(
    (
      application,
    ): application is JobData["applications"][number] & {
      candidate: Candidat;
    } => Boolean(application.candidate),
  );
  const displayedApplications = showAllCandidates
    ? validApplications
    : validApplications.slice(0, 4);

  useEffect(() => {
    if (!showModal) return;
    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowModal(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showModal]);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const result = await apiRequest(
          `${typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/sectors`,
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
    const sector = sectors.find((s) => s.id === currentData.sector_id);
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

  const getApplicationStatus = (
    status: JobData["applications"][number]["status"],
  ) => {
    const statuses = {
      submitted: {
        label: "Nouvelle",
        className: "bg-blue-50 text-blue-700 ring-blue-100",
      },
      viewed: {
        label: "Consultée",
        className: "bg-violet-50 text-violet-700 ring-violet-100",
      },
      accepted: {
        label: "Acceptée",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      },
      rejected: {
        label: "Refusée",
        className: "bg-red-50 text-red-700 ring-red-100",
      },
    };
    return statuses[status] ?? statuses.submitted;
  };

  return (
    <div className="overflow-hidden bg-white">
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 px-5 py-6 text-white sm:px-7 sm:py-7">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10" />
        <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
              {isEditing ? "Modification de l'offre" : "Détail de l'offre"}
            </p>
            <h1 className="break-words text-2xl font-bold leading-tight sm:text-3xl">
              {currentData.titre}
            </h1>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {getStatusBadge()}
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/25 bg-white/15 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
              >
                <Pencil className="h-4 w-4" />
                Modifier
              </button>
            )}
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-emerald-50">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>{currentData.company_name || "Votre entreprise"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {currentData.applications_count ?? validApplications.length}{" "}
              candidature
              {(currentData.applications_count ?? validApplications.length) !==
              1
                ? "s"
                : ""}
            </span>
          </div>
          {typeof currentData.views_count === "number" && (
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>
                {currentData.views_count} vue
                {currentData.views_count !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          {currentData.created_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Créée le {formatDate(currentData.created_at)}</span>
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-7 p-4 sm:p-6 lg:p-7"
        noValidate
      >
        {/* Simple Info Grid - Editable */}
        {isEditing ? (
          <div className="space-y-7">
            {isAccepted && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold">
                    Une nouvelle validation sera nécessaire
                  </p>
                  <p className="mt-0.5 text-amber-800">
                    Toute modification importante d'une offre approuvée la
                    replacera en attente de validation.
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Briefcase className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-bold text-slate-900">
                  Informations principales
                </h2>
                <p className="text-xs text-slate-500">
                  Mettez à jour le poste et son contexte.
                </p>
              </div>
            </div>
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
                className={fieldClassName}
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
                  maxLength={100}
                  className={fieldClassName}
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
                  className={fieldClassName}
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
                  className={fieldClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  name="date_fin"
                  value={formData.date_fin}
                  min={getNextDateValue(formData.date_debut)}
                  onChange={handleInputChange}
                  className={fieldClassName}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 pt-1">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Banknote className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-bold text-slate-900">
                  Conditions proposées
                </h2>
                <p className="text-xs text-slate-500">
                  Expérience, rémunération et avantages.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm font-semibold text-slate-900">
                Expérience minimale (années)
                <input
                  type="number"
                  name="experience_required"
                  min="0"
                  max="50"
                  value={formData.experience_required}
                  onChange={handleInputChange}
                  className={`${fieldClassName} mt-2`}
                />
              </label>
              <label className="text-sm font-semibold text-slate-900">
                Salaire minimum
                <input
                  type="number"
                  name="salary_min"
                  min="0"
                  step="0.01"
                  value={formData.salary_min}
                  onChange={handleInputChange}
                  className={`${fieldClassName} mt-2`}
                />
              </label>
              <label className="text-sm font-semibold text-slate-900">
                Salaire maximum
                <input
                  type="number"
                  name="salary_max"
                  min="0"
                  step="0.01"
                  value={formData.salary_max}
                  onChange={handleInputChange}
                  className={`${fieldClassName} mt-2`}
                />
              </label>
              <label className="text-sm font-semibold text-slate-900">
                Devise
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className={`${fieldClassName} mt-2`}
                >
                  <option value="MAD">MAD</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Avantages
              </label>
              <div className="flex flex-wrap gap-2">
                {BENEFIT_OPTIONS.map((benefit) => (
                  <label
                    key={benefit}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${benefits.includes(benefit) ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/40"}`}
                  >
                    <input
                      type="checkbox"
                      checked={benefits.includes(benefit)}
                      onChange={() =>
                        setBenefits((current) =>
                          current.includes(benefit)
                            ? current.filter((item) => item !== benefit)
                            : [...current, benefit],
                        )
                      }
                    />
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
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, description: content }))
                }
                placeholder="Décrivez le poste, les responsabilités, les compétences requises..."
                minHeight="240px"
              />
            </div>

            {/* Secteur + Métier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Secteur d'activité
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => {
                    setSelectedSector(e.target.value);
                    setSelectedJob("");
                    setFormData((prev) => ({
                      ...prev,
                      sector_id: Number(e.target.value),
                      job_id: null,
                    }));
                  }}
                  className={fieldClassName}
                >
                  <option value="">Sélectionner un secteur</option>
                  {sectors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Métier de référence (facultatif)
                </label>
                <select
                  value={selectedJob}
                  onChange={(e) => {
                    setSelectedJob(e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      job_id: e.target.value ? Number(e.target.value) : null,
                    }));
                  }}
                  disabled={!selectedSector}
                  className={fieldClassName}
                >
                  <option value="">Autre métier / non répertorié</option>
                  {(
                    sectors.find((s) => s.id === Number(selectedSector))
                      ?.jobs ?? []
                  ).map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Langues requises */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Langues requises
              </label>
              <Select<SelectOption, true>
                isMulti
                options={LANGUAGE_OPTIONS}
                value={requiredLanguages.map((language) => ({
                  value: language,
                  label: language,
                }))}
                onChange={handleLanguagesChange}
                placeholder="Rechercher des langues..."
                noOptionsMessage={() => "Aucune langue trouvée"}
                classNamePrefix="react-select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minHeight: "44px",
                    borderRadius: "0.75rem",
                    borderColor: state.isFocused ? "#10b981" : "#cbd5e1",
                    boxShadow: state.isFocused ? "0 0 0 3px #d1fae5" : "none",
                    "&:hover": { borderColor: "#10b981" },
                  }),
                }}
              />
            </div>

            {/* Compétences requises */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Compétences requises
              </label>
              <Select<SelectOption, true>
                isMulti
                options={SKILL_OPTIONS}
                value={requiredSkills.map((skill) => ({
                  value: skill,
                  label: skill,
                }))}
                onChange={handleSkillsChange}
                placeholder="Rechercher des compétences..."
                noOptionsMessage={() => "Aucune compétence trouvée"}
                classNamePrefix="react-select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minHeight: "44px",
                    borderRadius: "0.75rem",
                    borderColor: state.isFocused ? "#10b981" : "#cbd5e1",
                    boxShadow: state.isFocused ? "0 0 0 3px #d1fae5" : "none",
                    "&:hover": { borderColor: "#10b981" },
                  }),
                }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <ReceiptText className="h-5 w-5 shrink-0 text-emerald-600" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Métier</p>
                  <p className="break-words text-sm font-semibold text-slate-800">
                    {getJobName(currentData.job_id)}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <Calendar className="h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-500">Date de début</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatDate(currentData.date_debut)}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <Briefcase className="h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-500">Type de contrat</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {currentData.contractType}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <MapPin className="h-5 w-5 shrink-0 text-emerald-600" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Localisation</p>
                  <p className="break-words text-sm font-semibold text-slate-800">
                    {currentData.location || "Non spécifiée"}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <Building className="h-5 w-5 shrink-0 text-emerald-600" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Secteur</p>
                  <p className="break-words text-sm font-semibold text-slate-800">
                    {getSectorName(currentData.sector_id)}
                  </p>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <Calendar className="h-5 w-5 shrink-0 text-violet-600" />
                <div>
                  <p className="text-xs text-slate-500">Date de fin</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {formatDate(currentData.date_fin)}
                  </p>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <Banknote className="h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">Rémunération</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {currentData.salary_min != null ||
                    currentData.salary_max != null
                      ? `${currentData.salary_min ?? "—"} – ${currentData.salary_max ?? "—"} ${currentData.currency ?? "MAD"}`
                      : "Non spécifiée"}
                  </p>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <Briefcase className="h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-xs text-slate-500">Expérience requise</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {currentData.experience_required != null
                      ? `${currentData.experience_required} an${currentData.experience_required > 1 ? "s" : ""}`
                      : "Non spécifiée"}
                  </p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Description
                </h2>
              </div>
              <div
                className="prose prose-slate max-w-none break-words text-sm leading-7 text-slate-700"
                dangerouslySetInnerHTML={{
                  __html:
                    currentData.description ||
                    "<p>Aucune description disponible.</p>",
                }}
              ></div>
            </div>

            {/* Languages + Skills */}
            {((currentData.required_languages?.length ?? 0) > 0 ||
              (currentData.required_skills?.length ?? 0) > 0) && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(currentData.required_languages?.length ?? 0) > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1.5">
                      Langues requises
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentData.required_languages!.map((l) => (
                        <span
                          key={l}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(currentData.required_skills?.length ?? 0) > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-xs text-gray-500 mb-1.5">
                      Compétences requises
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentData.required_skills!.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {(currentData.benefits?.length ?? 0) > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Gift className="h-5 w-5 text-emerald-600" />
                  <h2 className="font-semibold text-slate-900">Avantages</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentData.benefits!.map((benefit) => (
                    <span
                      key={benefit}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Candidates Section */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-bold text-slate-900">Candidatures</h2>
                <p className="text-xs text-slate-500">
                  {validApplications.length} profil
                  {validApplications.length !== 1 ? "s" : ""} disponible
                  {validApplications.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
          {displayedApplications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <User className="h-5 w-5 text-slate-500" />
              </div>
              <p className="font-semibold text-slate-800">
                Aucune candidature pour le moment
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Les candidats ayant postulé à cette offre apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {displayedApplications.map((application) => {
                const applicationStatus = getApplicationStatus(
                  application.status,
                );
                return (
                  <div
                    key={application.id}
                    className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                  >
                    {/* Header with Avatar and Name */}
                    <div className="flex items-start gap-3 mb-3">
                      {application.candidate.image ? (
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 ring-1 ring-emerald-200">
                          <FiUser className="h-6 w-6" />
                          <img
                            src={application.candidate.image.replace(/\\/g, "")}
                            alt={`${application.candidate.first_name} ${application.candidate.last_name}`}
                            className="absolute inset-0 h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 ring-1 ring-emerald-200">
                          <FiUser className="h-6 w-6 text-emerald-700" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {`${application.candidate.first_name} ${application.candidate.last_name}`}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Candidature du {formatDate(application.created_at)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${applicationStatus.className}`}
                      >
                        {applicationStatus.label}
                      </span>
                    </div>

                    {/* Bio Preview */}
                    {application.candidate.bio && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {application.candidate.bio}
                      </p>
                    )}

                    {/* Experience Badge */}
                    {(application.candidate.years_of_experience ?? 0) > 0 && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <Briefcase className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-gray-600">
                          {application.candidate.years_of_experience} an
                          {(application.candidate.years_of_experience ?? 0) > 1
                            ? "s"
                            : ""}{" "}
                          d'expérience
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-auto pt-3 border-t border-gray-100">
                      {application.postuler ? (
                        <OfferCandidatActions
                          applicationId={application.id}
                          candidat={application.candidate}
                          postuler={application.postuler}
                          videoLink={application.link}
                          initiallyConsumed={application.is_consumed}
                          videoAvailable={application.video_available}
                          applicationStatus={application.status}
                          onVideoClick={() => {
                            setVideoLink(application.link);
                            setVideoError(false);
                            setShowModal(true);
                          }}
                        />
                      ) : (
                        <p className="text-xs text-slate-500">
                          Le CV vidéo associé n'est plus disponible.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {validApplications.length > 4 && (
            <button
              onClick={toggleShowAllCandidates}
              type="button"
              className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              {showAllCandidates ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {showAllCandidates
                ? "Voir moins"
                : `Voir tous les candidats (${validApplications.length})`}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing ? (
          <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  titre: currentData.titre,
                  description: currentData.description,
                  location: currentData.location,
                  contractType: currentData.contractType,
                  date_debut: currentData.date_debut
                    ? currentData.date_debut.split("T")[0]
                    : "",
                  date_fin: currentData.date_fin
                    ? currentData.date_fin.split("T")[0]
                    : "",
                  sector_id: currentData.sector_id,
                  job_id: currentData.job_id,
                  experience_required:
                    currentData.experience_required?.toString() ?? "",
                  salary_min: currentData.salary_min?.toString() ?? "",
                  salary_max: currentData.salary_max?.toString() ?? "",
                  currency: currentData.currency ?? "MAD",
                });
                setSelectedSector(String(currentData.sector_id));
                setSelectedJob(
                  currentData.job_id ? String(currentData.job_id) : "",
                );
                setRequiredLanguages(currentData.required_languages ?? []);
                setRequiredSkills(currentData.required_skills ?? []);
                setBenefits(currentData.benefits ?? []);
              }}
              className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:min-w-28"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold shadow-sm transition sm:min-w-44 ${
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
                  <Save className="h-4 w-4" />
                  <span>Enregistrer</span>
                </>
              )}
            </button>
          </div>
        ) : null}
      </form>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-modal-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowModal(false);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h2 id="video-modal-title" className="font-bold text-slate-900">
                  CV vidéo du candidat
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Lecture sécurisée de la candidature
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-slate-50 p-4 sm:p-6">
              {videoLink && !videoError ? (
                <div className="overflow-hidden rounded-xl bg-black shadow-lg">
                  <video
                    src={videoLink.replace(/\\/g, "")}
                    controls
                    controlsList="nodownload"
                    className="max-h-[65vh] w-full"
                    onError={() => setVideoError(true)}
                  >
                    Votre navigateur ne supporte pas la lecture de vidéos.
                  </video>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50 px-5 py-10 text-center text-red-700">
                  <AlertTriangle className="h-8 w-8" />
                  <p className="mt-3 font-semibold">
                    Impossible de charger la vidéo
                  </p>
                  <p className="mt-1 text-sm text-red-600">
                    Le fichier est indisponible ou son accès a expiré.
                  </p>
                  {videoLink && (
                    <a
                      href={videoLink.replace(/\\/g, "")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex h-10 items-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      Ouvrir dans un nouvel onglet
                    </a>
                  )}
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
