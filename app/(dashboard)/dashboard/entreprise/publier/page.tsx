"use client";

import { useState, useEffect } from "react";
import Select, { MultiValue, StylesConfig } from "react-select";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { Send } from "lucide-react";
import { fetchSectors, createOffer, fetchLastPayment } from "@/lib/api";
import RichTextEditor from "@/components/RichTextEditor";
import { sanitizeHtml } from "@/lib/sanitize";
import { useUser } from "@/hooks/useUser";
import languagesData from "@/data/languages.json";
import skillsData from "@/data/skills.json";

interface Sector {
  id: number;
  name: string;
  jobs: Array<{ id: number; name: string }>;
}

type SelectOption = {
  value: string;
  label: string;
};

const AVAILABLE_LANGUAGES = languagesData.languages;
const AVAILABLE_SKILLS = Object.values(skillsData).flat();
const BENEFIT_OPTIONS = ["Assurance santé", "Formation", "Télétravail", "Horaires flexibles", "Primes", "Transport", "Tickets restaurant", "Mutuelle"];
const AVAILABLE_LANGUAGE_SET = new Set(AVAILABLE_LANGUAGES);
const AVAILABLE_SKILL_SET = new Set(AVAILABLE_SKILLS);
const LANGUAGE_OPTIONS: SelectOption[] = AVAILABLE_LANGUAGES.map(
  (language) => ({
    value: language,
    label: language,
  }),
);
const SKILL_GROUP_LABELS: Record<string, string> = {
  technical_skills: "Compétences techniques",
  soft_skills: "Soft skills",
  business_skills: "Business",
  language_skills: "Langues et communication",
  industry_specific: "Métiers et secteurs",
};
const SKILL_OPTIONS = Object.entries(skillsData).map(([group, skills]) => ({
  label: SKILL_GROUP_LABELS[group] || group,
  options: skills.map((skill) => ({
    value: skill,
    label: skill,
  })),
}));

export default function PublierPage() {
  const { user, isLoading: userLoading } = useUser();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading">(
    "idle",
  );
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
    job_id: "",
    date_debut: "",
    date_fin: "",
    experience_required: "",
    salary_min: "",
    salary_max: "",
    currency: "MAD",
  });

  const [requiredLanguages, setRequiredLanguages] = useState<string[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleLanguagesChange = (options: MultiValue<SelectOption>) => {
    setRequiredLanguages(options.map((option) => option.value));
    if (formErrors.required_languages) {
      setFormErrors((prev) => ({ ...prev, required_languages: "" }));
    }
  };

  const handleSkillsChange = (options: MultiValue<SelectOption>) => {
    setRequiredSkills(options.map((option) => option.value));
    if (formErrors.required_skills) {
      setFormErrors((prev) => ({ ...prev, required_skills: "" }));
    }
  };

  const getFieldClassName = (field: string) =>
    `w-full px-4 py-2.5 bg-white border rounded-lg focus:ring-2 text-gray-900 ${
      formErrors[field]
        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
        : "border-gray-300 focus:ring-green-500 focus:border-green-500"
    }`;

  const renderFieldError = (field: string) =>
    formErrors[field] ? (
      <p
        id={`${field}-error`}
        className="mt-1 text-sm font-medium text-red-600"
      >
        {formErrors[field]}
      </p>
    ) : null;

  const getSelectControlClassName = (field: string) =>
    `min-h-[44px] rounded-lg shadow-none ${
      formErrors[field] ? "border-red-500" : "border-gray-300"
    }`;

  const getSelectStyles = (
    field: string,
  ): StylesConfig<SelectOption, true> => ({
    control: (base, state) => ({
      ...base,
      minHeight: "44px",
      borderColor: formErrors[field]
        ? "#ef4444"
        : state.isFocused
          ? "#22c55e"
          : "#d1d5db",
      boxShadow: state.isFocused
        ? `0 0 0 1px ${formErrors[field] ? "#ef4444" : "#22c55e"}`
        : base.boxShadow,
      "&:hover": {
        borderColor: formErrors[field] ? "#ef4444" : "#22c55e",
      },
    }),
  });

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
        `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/payments/${user.id}/last`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      if (response.ok) {
        const payment = await response.json();

        // Use backend data directly - it already calculates job_remaining correctly
        const jobPosted = payment.job_posted || 0;
        const jobRemaining =
          payment.job_remaining === "unlimited" || payment.job_remaining === -1
            ? -1
            : parseInt(payment.job_remaining || "0");

        // Calculate total limit
        const jobLimit = jobRemaining === -1 ? -1 : jobPosted + jobRemaining;

        setPlanInfo({
          jobLimit,
          jobPosted,
          jobRemaining,
          planName: payment.plan_name || "Plan Standard",
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

    const nextErrors: Record<string, string> = {};
    const plainText = formData.description.replace(/<[^>]*>/g, "");

    if (!formData.titre.trim()) {
      nextErrors.titre = "Veuillez entrer le titre de l'offre.";
    } else if (formData.titre.trim().length < 5) {
      nextErrors.titre = "Le titre doit contenir au moins 5 caractères.";
    } else if (formData.titre.length > 200) {
      nextErrors.titre = "Le titre ne peut pas dépasser 200 caractères.";
    }

    if (!formData.sector_id) {
      nextErrors.sector_id = "Veuillez sélectionner un secteur.";
    }

    if (!formData.contractType) nextErrors.contractType = "Veuillez sélectionner un type de contrat.";

    if (!formData.location.trim()) {
      nextErrors.location = "Veuillez entrer la localisation.";
    }

    if (!formData.date_debut) {
      nextErrors.date_debut = "Veuillez choisir une date de début.";
    }

    if (!plainText.trim()) {
      nextErrors.description = "Veuillez entrer la description de l'offre.";
    } else if (plainText.length < 50) {
      nextErrors.description =
        "La description doit contenir au moins 50 caractères.";
    } else if (plainText.length > 10000) {
      nextErrors.description =
        "La description ne peut pas dépasser 10000 caractères.";
    }

    // Validate date de début is in the future
    const startDate = new Date(formData.date_debut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (formData.date_debut && startDate < today) {
      nextErrors.date_debut = "La date de début doit être aujourd’hui ou dans le futur.";
    }

    if (formData.date_fin && formData.date_fin <= formData.date_debut) {
      nextErrors.date_fin = "La date de fin doit être postérieure à la date de début.";
    }
    if (formData.salary_min && formData.salary_max && Number(formData.salary_max) < Number(formData.salary_min)) {
      nextErrors.salary_max = "Le salaire maximum doit être supérieur ou égal au minimum.";
    }

    if (
      requiredLanguages.some(
        (language) => !AVAILABLE_LANGUAGE_SET.has(language),
      )
    ) {
      nextErrors.required_languages =
        "Veuillez choisir uniquement les langues proposées.";
    }

    if (requiredSkills.some((skill) => !AVAILABLE_SKILL_SET.has(skill))) {
      nextErrors.required_skills =
        "Veuillez choisir uniquement les compétences proposées.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    setFormErrors({});

    setIsLoading(true);
    setUploadStatus("uploading");

    try {
      const sanitizedDescription = sanitizeHtml(formData.description);

      await createOffer({
        ...formData,
        description: sanitizedDescription,
        required_languages: requiredLanguages,
        required_skills: requiredSkills,
        benefits,
        experience_required: formData.experience_required === "" ? null : Number(formData.experience_required),
        salary_min: formData.salary_min === "" ? null : Number(formData.salary_min),
        salary_max: formData.salary_max === "" ? null : Number(formData.salary_max),
      });

      setFormData({
        titre: "",
        description: "",
        location: "",
        contractType: "",
        sector_id: "",
        job_id: "",
        date_debut: "",
        date_fin: "",
        experience_required: "",
        salary_min: "",
        salary_max: "",
        currency: "MAD",
      });
      setRequiredLanguages([]);
      setRequiredSkills([]);
      setBenefits([]);

      setIsSuccessModalOpen(true);
    } catch (error: any) {
      console.error("Error creating offer:", error);

      // Handle specific backend errors
      if (error?.code === "JOB_LIMIT_REACHED") {
        const limit = Number(error?.errors?.limit?.[0] ?? 0);
        const used = Number(error?.errors?.used?.[0] ?? limit);
        toast.error(
          `Limite de publication d'offres atteinte pour votre plan actuel. (${used}/${limit} offres utilisées)`,
        );
      } else if (error?.status === 422 && error?.errors) {
        const apiErrors = Object.fromEntries(
          Object.entries(error.errors).map(([field, messages]) => [field, Array.isArray(messages) ? messages[0] : String(messages)]),
        );
        setIsLimitReachedModalOpen(true);
        setFormErrors(apiErrors);
        toast.error("Veuillez corriger les champs signalés.");
      } else if (error?.code === "NO_ACTIVE_SUBSCRIPTION") {
        setIsUpgradeModalOpen(true);
        toast.error(error.message);
      } else if (error?.status === 403) {
        toast.error(error.message || "Vous n’êtes pas autorisé à publier cette offre.");
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "Erreur lors de la publication de l'offre",
        );
      }
    } finally {
      setIsLoading(false);
      setUploadStatus("idle");
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
      ...(name === "sector_id" ? { job_id: "" } : {}),
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
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
              <h1 className="text-2xl font-bold text-gray-900">
                Publier une offre d'emploi
              </h1>
              <p className="text-gray-600">
                Remplissez les informations de votre offre
              </p>
            </div>
          </div>

          {/* Job Limit Indicator */}
          {planInfo && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border-2 border-green-300 shadow-sm">
              <div className="text-right">
                <p className="text-xs text-gray-600 font-medium">
                  Offres restantes
                </p>
                <p
                  className={`text-lg font-bold ${
                    planInfo.jobRemaining === -1
                      ? "text-green-600"
                      : planInfo.jobRemaining === 0
                        ? "text-red-600"
                        : planInfo.jobRemaining <= 2
                          ? "text-amber-600"
                          : "text-green-600"
                  }`}
                >
                  {planInfo.jobRemaining === -1 ? "∞" : planInfo.jobRemaining}
                  {planInfo.jobLimit !== -1 && ` / ${planInfo.jobLimit}`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warning Alert if low on jobs */}
      {planInfo &&
        planInfo.jobRemaining !== -1 &&
        planInfo.jobRemaining <= 2 &&
        planInfo.jobRemaining > 0 && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-amber-900 mb-1">
                  Attention: Il vous reste seulement {planInfo.jobRemaining}{" "}
                  offre{planInfo.jobRemaining > 1 ? "s" : ""} à publier
                </h3>
                <p className="text-sm text-amber-800">
                  Vous avez utilisé {planInfo.jobPosted} sur {planInfo.jobLimit}{" "}
                  offres de votre plan {planInfo.planName}. Pensez à mettre à
                  niveau votre plan pour publier plus d'offres.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Main Form Card */}
      <div className="bg-white rounded-lg border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
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
              className={getFieldClassName("titre")}
              placeholder="Ex: Développeur Full Stack Senior"
              aria-invalid={!!formErrors.titre}
              aria-describedby={formErrors.titre ? "titre-error" : undefined}
              maxLength={200}
            />
            {renderFieldError("titre")}
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
                className={getFieldClassName("sector_id")}
                aria-invalid={!!formErrors.sector_id}
                aria-describedby={
                  formErrors.sector_id ? "sector_id-error" : undefined
                }
              >
                <option value="">Sélectionner un secteur</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
              {renderFieldError("sector_id")}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Métier de référence <span className="font-normal text-gray-500">(facultatif)</span>
              </label>
              <select name="job_id" value={formData.job_id} onChange={handleInputChange}
                disabled={!formData.sector_id} className={getFieldClassName("job_id")}>
                <option value="">Autre métier / non répertorié</option>
                {(sectors.find((sector) => sector.id === Number(formData.sector_id))?.jobs ?? []).map((job) => (
                  <option key={job.id} value={job.id}>{job.name}</option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-gray-500">
                Améliore le matching lorsqu’un métier correspondant existe, sans bloquer la publication.
              </p>
              {renderFieldError("job_id")}
            </div>

            {/* Type de contrat */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Type de contrat <span className="text-red-500">*</span>
              </label>
              <select
                name="contractType"
                value={formData.contractType}
                onChange={handleInputChange}
                className={getFieldClassName("contractType")}
              >
                <option value="">Sélectionner un type</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Freelance">Freelance</option>
                <option value="Alternance">Alternance</option>
              </select>
              {renderFieldError("contractType")}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Expérience minimale (années)</label>
              <input type="number" name="experience_required" min="0" max="50" value={formData.experience_required}
                onChange={handleInputChange} className={getFieldClassName("experience_required")} />
              {renderFieldError("experience_required")}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Salaire minimum</label>
              <input type="number" name="salary_min" min="0" step="0.01" value={formData.salary_min}
                onChange={handleInputChange} className={getFieldClassName("salary_min")} />
              {renderFieldError("salary_min")}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Salaire maximum</label>
              <input type="number" name="salary_max" min="0" step="0.01" value={formData.salary_max}
                onChange={handleInputChange} className={getFieldClassName("salary_max")} />
              {renderFieldError("salary_max")}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Devise <span className="text-red-500">*</span></label>
              <select name="currency" value={formData.currency} onChange={handleInputChange} className={getFieldClassName("currency")}>
                {['MAD', 'EUR', 'USD'].map((currency) => <option key={currency} value={currency}>{currency}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Avantages</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {BENEFIT_OPTIONS.map((benefit) => (
                <label key={benefit} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                  <input type="checkbox" checked={benefits.includes(benefit)} onChange={() =>
                    setBenefits((current) => current.includes(benefit) ? current.filter((item) => item !== benefit) : [...current, benefit])
                  } />
                  {benefit}
                </label>
              ))}
            </div>
            {renderFieldError("benefits")}
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
              className={getFieldClassName("location")}
              placeholder="Ex: Casablanca, Maroc"
              aria-invalid={!!formErrors.location}
              aria-describedby={
                formErrors.location ? "location-error" : undefined
              }
            />
            {renderFieldError("location")}
          </div>

          {/* Langues requises */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Langues requises
            </label>
            <Select<SelectOption, true>
              isMulti
              options={LANGUAGE_OPTIONS}
              value={LANGUAGE_OPTIONS.filter((option) =>
                requiredLanguages.includes(option.value),
              )}
              onChange={handleLanguagesChange}
              placeholder="Rechercher et sélectionner des langues..."
              noOptionsMessage={() => "Aucune langue trouvée"}
              classNamePrefix="react-select"
              styles={getSelectStyles("required_languages")}
              classNames={{
                control: () => getSelectControlClassName("required_languages"),
                multiValue: () => "bg-green-50 border border-green-200",
                multiValueLabel: () => "text-green-700",
                multiValueRemove: () =>
                  "text-green-600 hover:bg-red-50 hover:text-red-600",
              }}
            />
            {renderFieldError("required_languages")}
          </div>

          {/* Compétences requises */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Compétences requises
            </label>
            <Select<SelectOption, true>
              isMulti
              options={SKILL_OPTIONS}
              value={AVAILABLE_SKILLS.filter((skill) =>
                requiredSkills.includes(skill),
              ).map((skill) => ({ value: skill, label: skill }))}
              onChange={handleSkillsChange}
              placeholder="Rechercher et sélectionner des compétences..."
              noOptionsMessage={() => "Aucune compétence trouvée"}
              classNamePrefix="react-select"
              styles={getSelectStyles("required_skills")}
              classNames={{
                control: () => getSelectControlClassName("required_skills"),
                multiValue: () => "bg-emerald-50 border border-emerald-200",
                multiValueLabel: () => "text-emerald-700",
                multiValueRemove: () =>
                  "text-emerald-600 hover:bg-red-50 hover:text-red-600",
              }}
            />
            {renderFieldError("required_skills")}
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
                min={new Date().toISOString().split("T")[0]}
                className={getFieldClassName("date_debut")}
                aria-invalid={!!formErrors.date_debut}
                aria-describedby={
                  formErrors.date_debut ? "date_debut-error" : undefined
                }
              />
              {renderFieldError("date_debut")}
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
                min={formData.date_debut || new Date().toISOString().split("T")[0]}
                className={getFieldClassName("date_fin")}
              />
              {renderFieldError("date_fin")}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description de l'offre <span className="text-red-500">*</span>
            </label>
            <div
              className={`border rounded-lg overflow-hidden ${
                formErrors.description ? "border-red-500" : "border-gray-300"
              }`}
            >
              <RichTextEditor
                content={formData.description}
                onChange={(content) => {
                  setFormData((prev) => ({ ...prev, description: content }));
                  if (formErrors.description) {
                    setFormErrors((prev) => ({ ...prev, description: "" }));
                  }
                }}
                placeholder="Décrivez le poste, les missions, les compétences requises..."
                minHeight="300px"
              />
            </div>
            {renderFieldError("description")}
            <p className="mt-1 text-xs text-gray-500">
              Minimum 50 caractères •{" "}
              {formData.description.replace(/<[^>]*>/g, "").length} / 10000
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
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 font-medium rounded-lg transition-colors ${
                isLoading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {uploadStatus === "uploading" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Publication en cours...</span>
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
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => window.location.reload()}
          ></div>
          <div className="bg-white p-8 rounded-xl shadow-lg z-10 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Offre soumise avec succès!
              </h2>
              <p className="text-gray-600">
                Votre offre d'emploi a été soumise et est en attente de
                validation par notre équipe. Vous serez notifié une fois qu'elle
                sera approuvée et publiée.
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
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsUpgradeModalOpen(false)}
          ></div>
          <div className="bg-white p-8 rounded-xl shadow-lg z-10 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Limite atteinte
              </h2>
              <p className="text-gray-600">
                Vous avez atteint la limite de votre plan. Mettez à niveau pour
                publier plus d'offres.
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
                onClick={() =>
                  (window.location.href = "/dashboard/entreprise/services")
                }
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
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsLimitReachedModalOpen(false)}
          ></div>
          <div className="bg-white p-8 rounded-xl shadow-lg z-10 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Limite d'offres atteinte
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Plan actuel:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {planInfo.planName}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Offres publiées:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {planInfo.jobPosted} / {planInfo.jobLimit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Offres restantes:
                  </span>
                  <span className="text-sm font-bold text-red-600">
                    {planInfo.jobRemaining}
                  </span>
                </div>
              </div>
              <p className="text-gray-600">
                Vous avez atteint la limite de publication d'offres pour votre
                plan actuel. Pour continuer à publier des offres, veuillez
                mettre à niveau votre abonnement.
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
                onClick={() =>
                  (window.location.href = "/dashboard/entreprise/services")
                }
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
