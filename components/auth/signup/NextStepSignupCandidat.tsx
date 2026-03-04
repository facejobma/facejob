"use client";
import { useState, useEffect, FC, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";
import { apiRequest, handleApiError } from "@/lib/apiUtils";
import { Camera, User, Briefcase, MapPin, Clock, X } from "lucide-react";

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
  const [imageUrl, setImageUrl] = useState<string>("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const maxLength = 250;

  const router = useRouter();

  const handleBioChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    if (inputValue.length <= maxLength) {
      setBio(inputValue);
    }
  };

  const remainingCharacters = maxLength - bio.length;

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const result = await apiRequest(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/sectors"
        );
        
        console.log("Sectors API response:", result);
        
        if (result.success && result.data) {
          // Handle both direct array and nested data structure
          const sectorsData = Array.isArray(result.data) ? result.data : result.data.data;
          
          if (Array.isArray(sectorsData)) {
            setSectors(sectorsData);
          } else {
            console.error("Sectors data is not an array:", sectorsData);
            setSectors([]);
            toast.error("Format de données invalide");
          }
        } else {
          console.error("Error fetching sectors:", result.error || "Unknown error");
          setSectors([]);
          if (result.error) {
            toast.error(result.error);
          }
        }
      } catch (error) {
        console.error("Error fetching sectors:", error);
        setSectors([]);
        toast.error("Erreur lors de la récupération des secteurs!");
      }
    };

    fetchSectors();
  }, []);

  const filteredJobs = Array.isArray(sectors) 
    ? (sectors.find((sector) => sector.id === parseInt(selectedSector))?.jobs || [])
    : [];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const minBioLength = 15;

    if (!bio.trim()) {
      newErrors.bio = "La description est obligatoire.";
    } else if (bio.trim().length < minBioLength) {
      newErrors.bio = `La description doit contenir au moins ${minBioLength} caractères.`;
    }

    if (!selectedSector) newErrors.sector = "Veuillez sélectionner un secteur.";
    if (!selectedJob) newErrors.job = "Veuillez sélectionner un métier.";
    if (!yearsOfExperience.trim())
      newErrors.yearsOfExperience = "Veuillez indiquer vos années d'expérience.";
    if (!imageUrl) newErrors.image = "Veuillez uploader une photo de profil.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs avant de soumettre.");
      return;
    }

    try {
      const userId = typeof window !== "undefined"
        ? window.sessionStorage?.getItem("userId") || ""
        : "";

      const formData = {
        userId,
        bio,
        job: selectedJob,
        image: imageUrl,
        yearsOfExperience,
      };

      const result = await apiRequest(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/complete-candidate",
        {
          method: "PUT",
          body: JSON.stringify(formData),
        }
      );

      if (result.success) {
        // Get user email from session or result
        const email = typeof window !== "undefined"
          ? window.sessionStorage?.getItem("userEmail") || ""
          : "";
        
        setUserEmail(email);
        setShowVerificationModal(true);
        
        // Clear session after showing modal
        setTimeout(() => {
          sessionStorage.clear();
        }, 500);
      } else {
        // Backend will return appropriate error message
        handleApiError(result, toast);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Erreur de mise à jour de l'utilisateur!");
    }
  };

  const handleUploadBegin = () => {
    setIsUploading(true);
    toast.loading("Upload de l'image en cours...", { id: "upload-toast" });
  };

  const handleUploadComplete = (res: any) => {
    setIsUploading(false);
    toast.dismiss("upload-toast");

    if (res && res[0] && res[0].url) {
      setImageUrl(res[0].url);
      setShowUploadZone(false);
      toast.success("Image uploadée avec succès!");
    } else {
      toast.error("Erreur: URL non trouvée");
    }
  };

  const handleUploadError = (error: Error) => {
    setIsUploading(false);
    toast.dismiss("upload-toast");
    toast.error(`Erreur d'upload: ${error.message}`);
  };

  const handleChangePhoto = () => {
    setImageUrl("");
    setShowUploadZone(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Compact Header */}
      <div className="text-center mb-4 flex-shrink-0">
        <h1 className="text-xl font-bold text-secondary mb-1">
          Complétez votre profil
        </h1>
        <p className="text-sm text-third">
          Ajoutez vos informations professionnelles
        </p>
      </div>

      {/* Main Card - Scrollable */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 flex-1 flex flex-col overflow-hidden">
        
        {/* Profile Photo Header - Fixed */}
        <div className="bg-gradient-to-r from-primary to-primary-1 px-6 py-6 text-center flex-shrink-0">
          <div className="relative inline-block">
            {imageUrl ? (
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={imageUrl}
                    alt="Photo de profil"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={handleChangePhoto}
                  disabled={isUploading}
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
          <h2 className="text-lg font-semibold text-white mt-3">
            Photo de profil
          </h2>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Upload Zone */}
          {(!imageUrl || showUploadZone) && (
            <div className="p-6 border-b border-gray-100">
              <div className="bg-gray-50 rounded-lg p-4">
                {isUploading ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-primary font-medium">Upload en cours...</p>
                  </div>
                ) : (
                  <UploadDropzone
                    endpoint="imageUpload"
                    input={{
                      profileUpdate: true,
                      companyLogo: false
                    }}
                    onClientUploadComplete={handleUploadComplete}
                    onUploadError={handleUploadError}
                    onUploadBegin={handleUploadBegin}
                    className="border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors"
                    appearance={{
                      button: "bg-primary hover:bg-primary-1 text-white ut-button:text-sm",
                      allowedContent: "text-gray-600 ut-allowed-content:text-xs",
                      label: "text-primary font-medium"
                    }}
                  />
                )}
                {showUploadZone && imageUrl && (
                  <button
                    onClick={() => setShowUploadZone(false)}
                    className="mt-3 flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </button>
                )}
              </div>
              {errors.image && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {errors.image}
                </p>
              )}
            </div>
          )}

          {/* Form Fields */}
          <div className="p-6 space-y-5">
            
            {/* Bio Section */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Description professionnelle *
              </label>
              <textarea
                placeholder="Décrivez votre parcours, vos compétences et vos objectifs professionnels..."
                value={bio}
                onChange={handleBioChange}
                maxLength={maxLength}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors resize-none ${
                  errors.bio 
                    ? "border-red-300 focus:ring-red-500" 
                    : "border-gray-300 focus:ring-primary"
                }`}
                rows={4}
              />
              <div className="flex justify-between items-center mt-2">
                {errors.bio && (
                  <p className="text-sm text-red-600">{errors.bio}</p>
                )}
                <p className="text-gray-500 text-xs ml-auto">
                  {remainingCharacters} caractère{remainingCharacters !== 1 ? "s" : ""} restant{remainingCharacters !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Sector Selection */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Secteur d'activité *
              </label>
              <select
                value={selectedSector}
                onChange={(e) => {
                  setSelectedSector(e.target.value);
                  setSelectedJob("");
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors appearance-none bg-white ${
                  errors.sector 
                    ? "border-red-300 focus:ring-red-500" 
                    : "border-gray-300 focus:ring-primary"
                }`}
              >
                <option value="" disabled>
                  Sélectionnez votre secteur
                </option>
                {Array.isArray(sectors) && sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
              {errors.sector && (
                <p className="mt-1 text-sm text-red-600">{errors.sector}</p>
              )}
            </div>

            {/* Job Selection */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Métier *
              </label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                disabled={!selectedSector}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors appearance-none bg-white ${
                  !selectedSector 
                    ? "bg-gray-100 cursor-not-allowed" 
                    : errors.job 
                      ? "border-red-300 focus:ring-red-500" 
                      : "border-gray-300 focus:ring-primary"
                }`}
              >
                <option value="">
                  {!selectedSector ? "Sélectionnez d'abord un secteur" : "Sélectionnez votre métier"}
                </option>
                {Array.isArray(filteredJobs) && filteredJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.name}
                  </option>
                ))}
              </select>
              {errors.job && (
                <p className="mt-1 text-sm text-red-600">{errors.job}</p>
              )}
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Années d'expérience *
              </label>
              <input
                type="number"
                placeholder="Nombre d'années d'expérience professionnelle"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                min="0"
                max="50"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                  errors.yearsOfExperience 
                    ? "border-red-300 focus:ring-red-500" 
                    : "border-gray-300 focus:ring-primary"
                }`}
              />
              {errors.yearsOfExperience && (
                <p className="mt-1 text-sm text-red-600">{errors.yearsOfExperience}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at Bottom */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                onSkip();
                sessionStorage.clear();
                router.push("/auth/login-candidate");
              }}
              disabled={isUploading}
              className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Ignorer pour le moment
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUploading}
              className="flex-1 py-3 px-6 bg-primary text-white font-medium rounded-lg hover:bg-primary-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Traitement...
                </div>
              ) : (
                "Terminer mon profil"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 md:p-8 relative animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            {/* Success Icon */}
            <div className="flex justify-center mb-3 sm:mb-4 md:mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-gray-900 mb-2 sm:mb-3">
              Vérifiez votre email
            </h2>

            {/* Message */}
            <div className="text-center mb-4 sm:mb-5 md:mb-6">
              <p className="text-sm sm:text-base text-gray-600 mb-1 ">
                Votre compte a été créé avec succès ! 🎉
              </p>
              <p className="text-sm sm:text-base text-gray-700 font-medium mb-1 ">
                Un email de vérification a été envoyé à :
              </p>
              <p className="text-sm sm:text-base md:text-lg text-green-600 font-semibold mb-2 sm:mb-3 md:mb-4 break-words">
                {userEmail}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3 md:p-4 text-left">
                <p className="text-xs sm:text-sm text-blue-900 font-medium mb-1.5 sm:mb-2">
                  Pour activer votre compte :
                </p>
                <ol className="text-xs sm:text-sm text-blue-800 space-y-0.5 sm:space-y-1 list-decimal list-inside">
                  <li>Ouvrez votre boîte email</li>
                  <li>Trouvez l'email de FaceJob (vérifiez aussi les spams)</li>
                  <li>Cliquez sur le bouton de validation</li>
                </ol>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-2.5 md:p-3 mb-3 sm:mb-4 md:mb-6">
              <p className="text-xs text-yellow-800 text-center">
                ⚠️ Vous ne pourrez pas vous connecter tant que votre email n'est pas vérifié
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={() => {
                setShowVerificationModal(false);
                router.push("/auth/login-candidate");
              }}
              className="w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              J'ai compris, aller à la connexion
            </button>

            {/* Resend Link */}
            <div className="mt-3 sm:mt-4 text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                Vous n'avez pas reçu l'email ?{" "}
                <a
                  href="/auth/resend-verification"
                  className="text-green-600 hover:text-green-700 font-medium hover:underline"
                >
                  Renvoyer
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NextStepSignupCandidat;
