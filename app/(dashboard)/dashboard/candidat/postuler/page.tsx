"use client";

import React, { useState, useEffect } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { FaTrash, FaVideo, FaUpload, FaCheckCircle, FaCloudUploadAlt, FaEdit } from "react-icons/fa";
import { fetchSectors, submitCandidateApplication } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ButtonLoading, ProgressLoading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import Select from "react-select";
import { useUser } from "@/hooks/useUser";

interface Job {
  id: number;
  name: string;
}

interface Sector {
  id: number;
  name: string;
  jobs: Job[];
}

export default function PublishVideo () {
  const { user, isLoading: userLoading } = useUser();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [experiences, setExperiences] = useState("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [uploadStatus, setUploadStatus] = useState("idle");
  const router = useRouter();

  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  useEffect(() => {
    const fetchSectorsData = async () => {
      try {
        const data = await fetchSectors();
        // Ensure data is an array
        setSectors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching sectors:", error);
        toast.error("Error fetching sectors!");
        setSectors([]); // Set empty array on error
      }
    };

    fetchSectorsData();
  }, []);

  const filteredJobs =
    sectors.find((sector) => sector.id === parseInt(selectedSector))?.jobs ||
    [];

  // Options for react-select
  const sectorOptions = sectors.map((sector) => ({
    value: sector.id.toString(),
    label: sector.name,
  }));

  const jobOptions = filteredJobs.map((job) => ({
    value: job.id.toString(),
    label: job.name,
  }));

  // Custom styles for react-select
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      padding: "0.5rem",
      borderColor: "#d1d5db",
      borderRadius: "0.5rem",
      "&:hover": {
        borderColor: "#9ca3af",
      },
      "&:focus": {
        borderColor: "var(--primary)",
        boxShadow: "0 0 0 2px rgba(var(--primary-rgb), 0.2)",
      },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "var(--primary)"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: state.isSelected ? "white" : "#111827",
      "&:active": {
        backgroundColor: "var(--primary)",
      },
    }),
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Erreur: Utilisateur non connecté");
      return;
    }
    
    if (!videoUrl) {
      toast.error("Veuillez télécharger une vidéo!");
      return;
    }

    setUploadStatus("uploading");

    try {
      const data = await submitCandidateApplication({
        video_url: videoUrl,
        nb_experiences: experiences,
        job_id: selectedJob,
        sector_id: selectedSector,
        candidat_id: user.id,
      });

      toast.success(
        "Votre CV a bien été téléchargé. Dès que les administrateurs l'auront vérifié, il sera disponible sur votre Dashboard."
      );

      setUploadStatus("completed");

      // Clear form after success
      setVideoUrl(null);
      setExperiences("");
      setSelectedSector("");
      setSelectedJob("");

      // Redirect to dashboard
      router.push("/dashboard/candidat");
    } catch (error) {
      console.error("Error publishing video:", error);
      toast.error("An error occurred while publishing the video!");
      setUploadStatus("failed");
    }
  };

  // Show loading while user data is being fetched
  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FaVideo className="text-lg md:text-2xl text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900">Créer mon CV vidéo</h1>
            <p className="text-xs md:text-base text-gray-600 mt-0.5 md:mt-1">Publiez votre CV vidéo et mettez en valeur vos compétences</p>
          </div>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-6">
          <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FaCloudUploadAlt className="text-primary text-sm md:text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-semibold text-gray-900">Étape 1</p>
                <p className="text-xs text-gray-600">Téléchargez votre vidéo</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FaEdit className="text-primary text-sm md:text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-semibold text-gray-900">Étape 2</p>
                <p className="text-xs text-gray-600">Remplissez les informations</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FaCheckCircle className="text-primary text-sm md:text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-semibold text-gray-900">Étape 3</p>
                <p className="text-xs text-gray-600">Publiez votre CV</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        {/* Warning Notice */}
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2 md:gap-3">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="text-base md:text-lg">💡</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-amber-800 mb-1 text-xs md:text-sm">Conseil pour optimiser votre vidéo</h3>
              <p className="text-xs md:text-sm text-amber-700 leading-relaxed">
                Avant de déposer votre CV vidéo, nous vous recommandons de le compresser pour réduire sa taille et améliorer le temps de chargement.
                <a
                  href="https://clideo.com/fr/compress-video"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-amber-800 hover:text-amber-900 underline ml-1 inline-block mt-1 md:mt-0"
                >
                  Utilisez ce compresseur gratuit →
                </a>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Video Upload Section */}
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-start md:items-center justify-between gap-3">
              <div className="flex items-start md:items-center gap-2 md:gap-3 flex-1 min-w-0">
                <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FaVideo className="text-primary text-xs md:text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">Téléchargez votre CV vidéo</h3>
                  <p className="text-xs md:text-sm text-gray-600">Format accepté: MP4, MOV, AVI • Taille max: 50MB</p>
                </div>
              </div>
            </div>

            {videoUrl ? (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 md:p-6 border-2 border-gray-200">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start md:items-center gap-2 md:gap-3 mb-3 md:mb-4">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FaCheckCircle className="text-green-600 text-sm md:text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm md:text-base">Vidéo téléchargée avec succès</p>
                      <p className="text-xs md:text-sm text-gray-600">Votre CV vidéo est prêt à être publié</p>
                    </div>
                  </div>
                  
                  <video
                    src={videoUrl}
                    controls
                    className="w-full max-w-2xl mx-auto rounded-lg shadow-lg border-2 border-gray-300"
                  />
                  
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      onClick={() => setVideoUrl(null)}
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-xs md:text-sm"
                    >
                      <FaTrash className="mr-2 text-xs md:text-sm" />
                      Supprimer et choisir une autre vidéo
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute top-2 md:top-4 right-2 md:right-4 flex flex-wrap gap-1 md:gap-2 z-10">
                  <span className="px-2 md:px-3 py-0.5 md:py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    MP4
                  </span>
                  <span className="px-2 md:px-3 py-0.5 md:py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    MOV
                  </span>
                  <span className="px-2 md:px-3 py-0.5 md:py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    AVI
                  </span>
                </div>
                
                <UploadDropzone
                  endpoint="videoUpload"
                  input={{
                    candidateId: undefined,
                    jobId: undefined
                  }}
                  onClientUploadComplete={(res) => {
                    console.log("=== Upload Complete ===");
                    console.log("Full response:", JSON.stringify(res, null, 2));

                    const uploadedFile = res[0];
                    console.log("Uploaded file object:", uploadedFile);
                    console.log("Key:", uploadedFile.key);
                    console.log("Name:", uploadedFile.name);

                    // Use ufsUrl (new) or fallback to url (deprecated) or construct from key
                    const cdnUrl = uploadedFile.ufsUrl || uploadedFile.url || `https://utfs.io/f/${uploadedFile.key}`;
                    console.log("CDN URL:", cdnUrl);

                    setVideoUrl(cdnUrl);
                    toast.success("Vidéo téléchargée avec succès !");
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Erreur de téléchargement: ${error.message}`);
                  }}
                  className="p-4 md:p-8"
                  appearance={{
                    button: "bg-primary hover:bg-primary-1 text-white font-semibold px-4 md:px-6 py-2 md:py-3 rounded-lg transition-colors ut-ready:bg-primary ut-uploading:bg-primary/50 text-sm md:text-base",
                    container: "w-full",
                    allowedContent: "text-gray-600 text-xs md:text-sm"
                  }}
                />
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-semibold text-gray-700">
                Années d'expérience
              </label>
              <input
                type="number"
                value={experiences}
                onChange={(e) => setExperiences(e.target.value)}
                className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Ex: 3"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-semibold text-gray-700">
                Secteur d'activité
              </label>
              <Select
                value={sectorOptions.find((option) => option.value === selectedSector) || null}
                onChange={(option) => {
                  setSelectedSector(option?.value || "");
                  setSelectedJob("");
                }}
                options={sectorOptions}
                styles={selectStyles}
                placeholder="Sélectionnez le secteur"
                isClearable
                isSearchable
                noOptionsMessage={() => "Aucun secteur trouvé"}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs md:text-sm font-semibold text-gray-700">
                Poste recherché
              </label>
              <Select
                value={jobOptions.find((option) => option.value === selectedJob) || null}
                onChange={(option) => setSelectedJob(option?.value || "")}
                options={jobOptions}
                styles={selectStyles}
                placeholder="Sélectionnez le métier"
                isDisabled={!selectedSector}
                isClearable
                isSearchable
                noOptionsMessage={() => "Aucun métier trouvé"}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-3 md:pt-4 border-t border-gray-200">
            <Button
              type="submit"
              className={`bg-primary hover:bg-primary-1 text-white font-semibold py-2.5 md:py-3 px-4 md:px-6 rounded-lg shadow-sm transition-all duration-300 text-sm md:text-base w-full md:w-auto ${
                uploadStatus === "uploading"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={uploadStatus === "uploading"}
            >
              {uploadStatus === "uploading" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white mr-2 md:mr-3"></div>
                  Publication en cours...
                </>
              ) : (
                <>
                  <FaUpload className="mr-2" />
                  Publier mon CV vidéo
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

