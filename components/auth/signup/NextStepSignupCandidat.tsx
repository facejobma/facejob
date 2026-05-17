"use client";
import { useState, useEffect, FC, ChangeEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { apiRequest, handleApiError } from "@/lib/apiUtils";
import { Camera, User, Briefcase, MapPin, Clock, X, Upload } from "lucide-react";

interface NextStepSignupCandidatProps {
  onSkip: () => void;
}

interface Job {
  id: number;
  name: string;
}

interface Sector {
  id: number;
  name: string;
  jobs: Job[];
}

const NextStepSignupCandidat: FC<NextStepSignupCandidatProps> = ({ onSkip }) => {
  const [bio, setBio] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxLength = 250;
  const router = useRouter();

  const clearError = (field: string) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const getFieldClassName = (field: string, extra = "") =>
    `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
      errors[field] ? "border-red-500 bg-red-50 focus:ring-red-500" : "border-gray-300 focus:ring-primary"
    } ${extra}`;

  const renderFieldError = (field: string) =>
    errors[field] ? (
      <p id={`${field}-error`} className="mt-1 text-sm font-medium text-red-600">
        {errors[field]}
      </p>
    ) : null;

  const handleBioChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxLength) {
      setBio(e.target.value);
      clearError("bio");
    }
  };

  const remainingCharacters = maxLength - bio.length;

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const result = await apiRequest(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/sectors");
        if (result.success && result.data) {
          const sectorsData = Array.isArray(result.data) ? result.data : result.data.data;
          setSectors(Array.isArray(sectorsData) ? sectorsData : []);
        } else {
          setSectors([]);
        }
      } catch {
        setSectors([]);
        toast.error("Erreur lors de la récupération des secteurs!");
      }
    };
    fetchSectors();
  }, []);

  const filteredJobs = Array.isArray(sectors)
    ? (sectors.find((s) => s.id === parseInt(selectedSector))?.jobs || [])
    : [];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Veuillez selectionner une image valide." }));
      toast.error("Veuillez sélectionner une image valide.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "L'image ne doit pas depasser 5 Mo." }));
      toast.error("L'image ne doit pas dépasser 5 Mo.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!bio.trim()) newErrors.bio = "La description est obligatoire.";
    else if (bio.trim().length < 15) newErrors.bio = "La description doit contenir au moins 15 caractères.";
    if (!selectedSector) newErrors.sector = "Veuillez sélectionner un secteur.";
    if (!selectedJob) newErrors.job = "Veuillez sélectionner un métier.";
    if (!yearsOfExperience.trim()) newErrors.yearsOfExperience = "Veuillez indiquer vos années d'expérience.";
    if (yearsOfExperience.trim() && (Number(yearsOfExperience) < 0 || Number(yearsOfExperience) > 50)) newErrors.yearsOfExperience = "Veuillez entrer une valeur entre 0 et 50.";
    if (!imageFile) newErrors.image = "Veuillez uploader une photo de profil.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = typeof window !== "undefined"
        ? window.sessionStorage?.getItem("userId") || ""
        : "";
      const token = typeof window !== "undefined"
        ? sessionStorage.getItem("authToken") || localStorage.getItem("access_token") || ""
        : "";

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("bio", bio);
      formData.append("job", selectedJob);
      formData.append("yearsOfExperience", yearsOfExperience);
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/complete-candidate",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: formData,
        }
      );

      const result = await res.json();

      if (res.ok && (result.success !== false)) {
        const email = typeof window !== "undefined"
          ? window.sessionStorage?.getItem("userEmail") || ""
          : "";
        setUserEmail(email);
        setShowVerificationModal(true);
        setTimeout(() => sessionStorage.clear(), 500);
      } else {
        if (result.errors && typeof result.errors === "object") {
          const mappedErrors: { [key: string]: string } = {};
          const fieldMap: Record<string, string> = {
            job_id: "job",
            sector_id: "sector",
            years_of_experience: "yearsOfExperience",
            yearsOfExperience: "yearsOfExperience",
          };

          Object.entries(result.errors).forEach(([field, messages]) => {
            const targetField = fieldMap[field] || field;
            mappedErrors[targetField] = Array.isArray(messages) ? String(messages[0]) : String(messages);
          });
          setErrors(mappedErrors);
          return;
        }
        toast.error(result.message || "Erreur lors de la mise à jour du profil.");
      }
    } catch {
      toast.error("Erreur de mise à jour de l'utilisateur!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-4 flex-shrink-0">
        <h1 className="text-xl font-bold text-secondary mb-1">Complétez votre profil</h1>
        <p className="text-sm text-third">Ajoutez vos informations professionnelles</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 flex-1 flex flex-col overflow-hidden">

        {/* Profile Photo Header */}
        <div className="bg-gradient-to-r from-primary to-primary-1 px-6 py-6 text-center flex-shrink-0">
          <div className="relative inline-block">
            {imagePreview ? (
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image src={imagePreview} alt="Photo de profil" width={96} height={96} className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center">
                <User className="w-12 h-12 text-white/60" />
              </div>
            )}
          </div>
          <h2 className="text-lg font-semibold text-white mt-3">Photo de profil</h2>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* File Upload Zone */}
          <div className="p-6 border-b border-gray-100">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {!imagePreview ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-lg p-5 flex flex-col items-center gap-2 hover:border-primary hover:bg-green-50 transition-colors ${
                  errors.image ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              >
                <Upload className="w-7 h-7 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">Cliquez pour choisir une photo</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — max 5 Mo</p>
                </div>
              </button>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Camera className="w-4 h-4" /> Changer la photo
              </button>
            )}
            {errors.image && (
              <p className="mt-2 text-sm font-medium text-red-600 flex items-center gap-1">
                <X className="w-4 h-4" />{errors.image}
              </p>
            )}
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-5">

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                <User className="w-4 h-4 inline mr-2" />Description professionnelle *
              </label>
              <textarea
                placeholder="Décrivez votre parcours, vos compétences et vos objectifs..."
                value={bio}
                onChange={handleBioChange}
                maxLength={maxLength}
                rows={4}
                className={getFieldClassName("bio", "resize-none")}
                aria-invalid={!!errors.bio}
                aria-describedby={errors.bio ? "bio-error" : undefined}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.bio && <p id="bio-error" className="text-sm font-medium text-red-600">{errors.bio}</p>}
                <p className="text-gray-400 text-xs ml-auto">{remainingCharacters} restants</p>
              </div>
            </div>

            {/* Sector */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />Secteur d'activité *
              </label>
              <select
                value={selectedSector}
                onChange={(e) => { setSelectedSector(e.target.value); setSelectedJob(""); clearError("sector"); clearError("job"); }}
                className={getFieldClassName("sector", "appearance-none bg-white")}
                aria-invalid={!!errors.sector}
                aria-describedby={errors.sector ? "sector-error" : undefined}
              >
                <option value="" disabled>Sélectionnez votre secteur</option>
                {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {renderFieldError("sector")}
            </div>

            {/* Job */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />Métier *
              </label>
              <select
                value={selectedJob}
                onChange={(e) => { setSelectedJob(e.target.value); clearError("job"); }}
                disabled={!selectedSector}
                className={getFieldClassName("job", `appearance-none ${!selectedSector ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`)}
                aria-invalid={!!errors.job}
                aria-describedby={errors.job ? "job-error" : undefined}
              >
                <option value="">{!selectedSector ? "Sélectionnez d'abord un secteur" : "Sélectionnez votre métier"}</option>
                {filteredJobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
              </select>
              {renderFieldError("job")}
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                <Clock className="w-4 h-4 inline mr-2" />Années d'expérience *
              </label>
              <input
                type="number"
                placeholder="Nombre d'années d'expérience"
                value={yearsOfExperience}
                onChange={(e) => { setYearsOfExperience(e.target.value); clearError("yearsOfExperience"); }}
                min="0" max="50"
                className={getFieldClassName("yearsOfExperience")}
                aria-invalid={!!errors.yearsOfExperience}
                aria-describedby={errors.yearsOfExperience ? "yearsOfExperience-error" : undefined}
              />
              {renderFieldError("yearsOfExperience")}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => { onSkip(); sessionStorage.clear(); router.push("/auth/login-candidate"); }}
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Ignorer pour le moment
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-1 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Traitement...
                </div>
              ) : "Terminer mon profil"}
            </button>
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-center text-gray-900 mb-3">Vérifiez votre email</h2>
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-1">Votre compte a été créé avec succès ! 🎉</p>
              <p className="text-gray-700 font-medium mb-1">Un email de vérification a été envoyé à :</p>
              <p className="text-green-600 font-semibold mb-4 break-words">{userEmail}</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm text-blue-900 font-medium mb-2">Pour activer votre compte :</p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Ouvrez votre boîte email</li>
                  <li>Trouvez l'email de FaceJob (vérifiez aussi les spams)</li>
                  <li>Cliquez sur le bouton de validation</li>
                </ol>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-yellow-800 text-center">⚠️ Vous ne pourrez pas vous connecter tant que votre email n'est pas vérifié</p>
            </div>
            <button
              onClick={() => { setShowVerificationModal(false); router.push("/auth/login-candidate"); }}
              className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              J'ai compris, aller à la connexion
            </button>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Vous n'avez pas reçu l'email ?{" "}
                <a href="/auth/resend-verification" className="text-green-600 hover:underline font-medium">Renvoyer</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NextStepSignupCandidat;
