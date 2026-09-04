"use client";

import { useState, useEffect } from "react";
import Select, { MultiValue, StylesConfig } from "react-select";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import {
  AlertTriangle,
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { fetchSectors, createOffer } from "@/lib/api";
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

const getLocalDateValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().split("T")[0];
};

const getNextDateValue = (dateValue: string) => {
  if (!dateValue) return getLocalDateValue();
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
};

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
    if (options.length > 20) {
      setFormErrors((prev) => ({
        ...prev,
        required_languages: "Vous pouvez sélectionner au maximum 20 langues.",
      }));
      return;
    }
    setRequiredLanguages(options.map((option) => option.value));
    if (formErrors.required_languages) {
      setFormErrors((prev) => ({ ...prev, required_languages: "" }));
    }
  };

  const handleSkillsChange = (options: MultiValue<SelectOption>) => {
    if (options.length > 30) {
      setFormErrors((prev) => ({
        ...prev,
        required_skills: "Vous pouvez sélectionner au maximum 30 compétences.",
      }));
      return;
    }
    setRequiredSkills(options.map((option) => option.value));
    if (formErrors.required_skills) {
      setFormErrors((prev) => ({ ...prev, required_skills: "" }));
    }
  };

  const getFieldClassName = (field: string) =>
    `w-full min-h-11 rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-4 ${
      formErrors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
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
      borderRadius: "0.75rem",
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

  useEffect(() => {
    const hasOpenModal =
      isSuccessModalOpen || isUpgradeModalOpen || isLimitReachedModalOpen;

    if (!hasOpenModal) return;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || isLoading) return;
      setIsSuccessModalOpen(false);
      setIsUpgradeModalOpen(false);
      setIsLimitReachedModalOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [
    isSuccessModalOpen,
    isUpgradeModalOpen,
    isLimitReachedModalOpen,
    isLoading,
  ]);

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
        `${typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/payments/${user.id}/last`,
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
        const payload = await response.json().catch(() => null);
        console.error("Failed to fetch payment status", payload);
        toast.error(
          response.status === 401 || response.status === 403
            ? "Votre session ne permet pas de vérifier l'abonnement. Veuillez vous reconnecter."
            : "Impossible de vérifier votre quota pour le moment.",
        );
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      toast.error("Impossible de vérifier votre quota pour le moment.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

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

    if (!formData.contractType)
      nextErrors.contractType = "Veuillez sélectionner un type de contrat.";

    if (!formData.location.trim()) {
      nextErrors.location = "Veuillez entrer la localisation.";
    } else if (formData.location.trim().length < 2) {
      nextErrors.location =
        "La localisation doit contenir au moins 2 caractères.";
    } else if (formData.location.length > 100) {
      nextErrors.location =
        "La localisation ne peut pas dépasser 100 caractères.";
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

    if (formData.date_debut && formData.date_debut < getLocalDateValue()) {
      nextErrors.date_debut =
        "La date de début doit être aujourd’hui ou dans le futur.";
    }

    if (formData.date_fin && formData.date_fin <= formData.date_debut) {
      nextErrors.date_fin =
        "La date de fin doit être postérieure à la date de début.";
    }
    if (
      formData.salary_min &&
      formData.salary_max &&
      Number(formData.salary_max) < Number(formData.salary_min)
    ) {
      nextErrors.salary_max =
        "Le salaire maximum doit être supérieur ou égal au minimum.";
    }

    if (formData.salary_min !== "" && Number(formData.salary_min) < 0) {
      nextErrors.salary_min = "Le salaire minimum ne peut pas être négatif.";
    }
    if (formData.salary_max !== "" && Number(formData.salary_max) < 0) {
      nextErrors.salary_max = "Le salaire maximum ne peut pas être négatif.";
    }
    if (
      formData.experience_required !== "" &&
      (!Number.isInteger(Number(formData.experience_required)) ||
        Number(formData.experience_required) < 0 ||
        Number(formData.experience_required) > 50)
    ) {
      nextErrors.experience_required =
        "L'expérience requise doit être un nombre entier entre 0 et 50 ans.";
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
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
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
        experience_required:
          formData.experience_required === ""
            ? null
            : Number(formData.experience_required),
        salary_min:
          formData.salary_min === "" ? null : Number(formData.salary_min),
        salary_max:
          formData.salary_max === "" ? null : Number(formData.salary_max),
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

      setPlanInfo((current) => {
        if (!current || current.jobRemaining === -1) return current;

        return {
          ...current,
          jobPosted: current.jobPosted + 1,
          jobRemaining: Math.max(0, current.jobRemaining - 1),
        };
      });

      setIsSuccessModalOpen(true);
    } catch (error: any) {
      console.error("Error creating offer:", error);

      // Handle specific backend errors
      if (error?.code === "JOB_LIMIT_REACHED") {
        const limit = Number(error?.errors?.limit?.[0] ?? 0);
        const used = Number(error?.errors?.used?.[0] ?? limit);
        setPlanInfo(
          (current) =>
            current ?? {
              jobLimit: limit,
              jobPosted: used,
              jobRemaining: 0,
              planName: "Plan actuel",
            },
        );
        toast.error(
          `Limite de publication d'offres atteinte pour votre plan actuel. (${used}/${limit} offres utilisées)`,
        );
        setIsLimitReachedModalOpen(true);
      } else if (error?.status === 422 && error?.errors) {
        const apiErrors = Object.fromEntries(
          Object.entries(error.errors).map(([field, messages]) => [
            field,
            Array.isArray(messages) ? messages[0] : String(messages),
          ]),
        );
        setFormErrors(apiErrors);
        toast.error("Veuillez corriger les champs signalés.");
      } else if (error?.code === "NO_ACTIVE_SUBSCRIPTION") {
        setIsUpgradeModalOpen(true);
        toast.error(error.message);
      } else if (error?.status === 403) {
        toast.error(
          error.message || "Vous n’êtes pas autorisé à publier cette offre.",
        );
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
      ...(name === "date_debut" && prev.date_fin && prev.date_fin <= value
        ? { date_fin: "" }
        : {}),
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
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header Simple */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-5 shadow-lg shadow-emerald-100 sm:p-7">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
              <Send className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                Nouvelle opportunité
              </p>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Publier une offre d'emploi
              </h1>
              <p className="mt-1 text-sm text-emerald-50">
                Remplissez les informations de votre offre
              </p>
            </div>
          </div>

          {/* Job Limit Indicator */}
          {planInfo && (
            <div className="self-start rounded-xl border border-white/25 bg-white/15 px-4 py-2.5 backdrop-blur-sm sm:self-auto">
              <div className="text-right">
                <p className="text-xs font-medium text-emerald-50">
                  Offres restantes
                </p>
                <p className="text-xl font-bold text-white">
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
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
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
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <form
          onSubmit={handleSubmit}
          className="space-y-7 p-4 sm:p-6 lg:p-8"
          noValidate
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <BriefcaseBusiness className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-slate-900">
                Informations principales
              </h2>
              <p className="text-xs text-slate-500">
                Présentez clairement le poste et son contexte.
              </p>
            </div>
          </div>
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
                Métier de référence{" "}
                <span className="font-normal text-gray-500">(facultatif)</span>
              </label>
              <select
                name="job_id"
                value={formData.job_id}
                onChange={handleInputChange}
                disabled={!formData.sector_id}
                className={getFieldClassName("job_id")}
              >
                <option value="">Autre métier / non répertorié</option>
                {(
                  sectors.find(
                    (sector) => sector.id === Number(formData.sector_id),
                  )?.jobs ?? []
                ).map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.name}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-gray-500">
                Améliore le matching lorsqu’un métier correspondant existe, sans
                bloquer la publication.
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
                aria-invalid={!!formErrors.contractType}
                aria-describedby={
                  formErrors.contractType ? "contractType-error" : undefined
                }
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

          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 pt-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Banknote className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-slate-900">Conditions proposées</h2>
              <p className="text-xs text-slate-500">
                Expérience, rémunération et avantages.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Expérience minimale (années)
              </label>
              <input
                type="number"
                name="experience_required"
                min="0"
                max="50"
                value={formData.experience_required}
                onChange={handleInputChange}
                className={getFieldClassName("experience_required")}
                aria-invalid={!!formErrors.experience_required}
                aria-describedby={
                  formErrors.experience_required
                    ? "experience_required-error"
                    : undefined
                }
              />
              {renderFieldError("experience_required")}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Salaire minimum
              </label>
              <input
                type="number"
                name="salary_min"
                min="0"
                step="0.01"
                value={formData.salary_min}
                onChange={handleInputChange}
                className={getFieldClassName("salary_min")}
                aria-invalid={!!formErrors.salary_min}
                aria-describedby={
                  formErrors.salary_min ? "salary_min-error" : undefined
                }
              />
              {renderFieldError("salary_min")}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Salaire maximum
              </label>
              <input
                type="number"
                name="salary_max"
                min="0"
                step="0.01"
                value={formData.salary_max}
                onChange={handleInputChange}
                className={getFieldClassName("salary_max")}
                aria-invalid={!!formErrors.salary_max}
                aria-describedby={
                  formErrors.salary_max ? "salary_max-error" : undefined
                }
              />
              {renderFieldError("salary_max")}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Devise <span className="text-red-500">*</span>
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className={getFieldClassName("currency")}
              >
                {["MAD", "EUR", "USD"].map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Avantages
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFIT_OPTIONS.map((benefit) => (
                <label
                  key={benefit}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${benefits.includes(benefit) ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/40"}`}
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
            {renderFieldError("benefits")}
          </div>

          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 pt-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-slate-900">
                Localisation et matching
              </h2>
              <p className="text-xs text-slate-500">
                Ces informations améliorent la pertinence des candidats
                proposés.
              </p>
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
              className={getFieldClassName("location")}
              placeholder="Ex: Casablanca, Maroc"
              maxLength={100}
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
              aria-invalid={!!formErrors.required_languages}
              aria-describedby={
                formErrors.required_languages
                  ? "required_languages-error"
                  : undefined
              }
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
              aria-invalid={!!formErrors.required_skills}
              aria-describedby={
                formErrors.required_skills ? "required_skills-error" : undefined
              }
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

          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 pt-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-slate-900">
                Période et description
              </h2>
              <p className="text-xs text-slate-500">
                Précisez les dates et détaillez les missions du poste.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                min={getLocalDateValue()}
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
                min={getNextDateValue(formData.date_debut)}
                className={getFieldClassName("date_fin")}
                aria-invalid={!!formErrors.date_fin}
                aria-describedby={
                  formErrors.date_fin ? "date_fin-error" : undefined
                }
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
                minHeight="240px"
              />
            </div>
            {renderFieldError("description")}
            <p className="mt-1 text-xs text-gray-500">
              Minimum 50 caractères •{" "}
              {formData.description.replace(/<[^>]*>/g, "").length} / 10000
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:min-w-28"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold shadow-sm transition sm:min-w-48 ${
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
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="offer-success-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsSuccessModalOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setIsSuccessModalOpen(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="px-6 pb-5 pt-8 text-center sm:px-7">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2
                id="offer-success-title"
                className="text-xl font-bold text-slate-950"
              >
                Offre soumise avec succès
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Votre offre est maintenant en attente de validation. Vous serez
                notifié dès qu'elle sera approuvée et publiée.
              </p>
            </div>
            <div className="grid gap-2 border-t border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/dashboard/entreprise/mes-offres";
                }}
                className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Voir mes offres
              </button>
              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="h-10 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Créer une autre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {isUpgradeModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget)
              setIsUpgradeModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="px-6 pb-5 pt-8 text-center sm:px-7">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2
                id="upgrade-title"
                className="text-xl font-bold text-slate-950"
              >
                Abonnement requis
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Aucun abonnement actif ne permet actuellement de publier cette
                offre. Consultez les plans disponibles pour continuer.
              </p>
            </div>
            <div className="grid gap-2 border-t border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(false)}
                className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() =>
                  (window.location.href = "/dashboard/entreprise/services")
                }
                className="h-10 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Voir les abonnements
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Limit Reached Modal */}
      {isLimitReachedModalOpen && planInfo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="limit-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget)
              setIsLimitReachedModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setIsLimitReachedModalOpen(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="px-6 pb-5 pt-8 text-center sm:px-7">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <h2 id="limit-title" className="text-xl font-bold text-slate-950">
                Limite d'offres atteinte
              </h2>
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-2">
                  <span className="text-sm text-slate-600">Plan actuel</span>
                  <span className="truncate text-sm font-semibold text-slate-900">
                    {planInfo.planName}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-2">
                  <span className="text-sm text-slate-600">
                    Offres publiées
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {planInfo.jobPosted} / {planInfo.jobLimit}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 pt-2">
                  <span className="text-sm text-slate-600">
                    Offres restantes
                  </span>
                  <span className="text-sm font-bold text-red-600">
                    {planInfo.jobRemaining}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Vous avez atteint la limite de publication d'offres pour votre
                plan actuel. Pour continuer à publier des offres, veuillez
                mettre à niveau votre abonnement.
              </p>
            </div>
            <div className="grid gap-2 border-t border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setIsLimitReachedModalOpen(false)}
                className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() =>
                  (window.location.href = "/dashboard/entreprise/services")
                }
                className="h-10 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
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
