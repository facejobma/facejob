"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { UploadDropzone, useUploadThing } from "@/lib/uploadthing";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { FaTrash, FaVideo, FaUpload, FaCheckCircle, FaCloudUploadAlt, FaEdit, FaInfoCircle } from "react-icons/fa";
import { fetchSectors, submitCandidateApplication } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Select from "react-select";
import { useUser } from "@/hooks/useUser";
import VideoRecorder, { type VideoRecorderHandle } from "@/components/VideoRecorder";
import { useVideoCompressor } from "@/hooks/useVideoCompressor";

interface Job { id: number; name: string; }
interface Sector { id: number; name: string; jobs: Job[]; }

export default function PublishVideo() {
  const { user, isLoading: userLoading } = useUser();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [experiences, setExperiences] = useState("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [videoTab, setVideoTab] = useState<"upload" | "record">("upload");
  const [isUploadingRecording, setIsUploadingRecording] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [videoSize, setVideoSize] = useState(0);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    sizeTooLarge: boolean;
    durationTooLong: boolean;
    size: number;
    duration: number;
  }>({ sizeTooLarge: false, durationTooLong: false, size: 0, duration: 0 });
  const [formErrors, setFormErrors] = useState<{ video?: string; experiences?: string; sector?: string; job?: string }>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const recorderRef = useRef<VideoRecorderHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const MAX_DURATION = 90;
  const { compressIfNeeded, isCompressing, progress } = useVideoCompressor();

  // Afficher la progression de compression en temps réel
  useEffect(() => {
    if (isCompressing && progress > 0) {
      toast.loading(`Compression en cours... ${progress}%`, { id: "compress" });
    }
  }, [isCompressing, progress]);

  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const { startUpload } = useUploadThing("videoUpload", {
    onUploadError: (error) => {
      toast.error(`Erreur upload: ${error.message}`, { id: "rec-upload" });
      setShowUploadProgress(false);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
      setShowUploadProgress(true);
    },
    onUploadBegin: () => {
      setUploadProgress(0);
      setShowUploadProgress(true);
    },
  });

  useEffect(() => {
    const fetchSectorsData = async () => {
      try {
        const data = await fetchSectors();
        setSectors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching sectors:", error);
        toast.error("Error fetching sectors!");
        setSectors([]);
      }
    };
    fetchSectorsData();
  }, []);

  const filteredJobs = sectors.find((s) => s.id === parseInt(selectedSector))?.jobs || [];
  const sectorOptions = sectors.map((s) => ({ value: s.id.toString(), label: s.name }));
  const jobOptions = filteredJobs.map((j) => ({ value: j.id.toString(), label: j.name }));

  const getSelectStyles = (hasError: boolean) => ({
    control: (base: any) => ({
      ...base,
      minHeight: "42px",
      height: "42px",
      borderColor: hasError ? "#dc2626" : "#d1d5db",
      boxShadow: hasError ? "0 0 0 1px rgba(220, 38, 38, 0.4)" : base.boxShadow,
      borderRadius: "0.5rem",
      "&:hover": { borderColor: hasError ? "#dc2626" : "#9ca3af" },
    }),
    valueContainer: (base: any) => ({
      ...base,
      height: "42px",
      padding: "2px 12px",
    }),
    input: (base: any) => ({
      ...base,
      margin: "0px",
      padding: "0px",
    }),
    indicatorsContainer: (base: any) => ({
      ...base,
      height: "42px",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? "var(--primary)" : state.isFocused ? "#f3f4f6" : "white",
      color: state.isSelected ? "white" : "#111827",
    }),
  });

  const handleRecordedVideo = async (file: File) => {
    setIsUploadingRecording(true);
    setShowUploadProgress(true);
    setUploadProgress(0);
    console.log("[RecUpload] Starting upload, file size:", (file.size / 1024 / 1024).toFixed(1), "MB, type:", file.type);
    try {
      const res = await startUpload([file], { candidateId: undefined, jobId: undefined });
      console.log("[RecUpload] Response:", res);
      if (res && res[0]) {
        const url = res[0].ufsUrl || `https://utfs.io/f/${res[0].key}`;
        setVideoUrl(url);
        setFormErrors((prev) => ({ ...prev, video: undefined }));
        toast.success("Video uploadee avec succes !");
      } else {
        toast.error("Erreur: pas de reponse du serveur");
      }
    } catch (err) {
      console.error("[RecUpload] Error:", err);
      toast.error("Erreur lors de l'upload");
    } finally {
      setIsUploadingRecording(false);
      setShowUploadProgress(false);
      setUploadProgress(0);
    }
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => resolve(0);
      video.src = URL.createObjectURL(file);
    });
  };

  const getVideoResolution = (file: File): Promise<{width: number, height: number}> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        const resolution = {
          width: video.videoWidth,
          height: video.videoHeight
        };
        URL.revokeObjectURL(video.src);
        resolve(resolution);
      };
      video.onerror = () => resolve({width: 0, height: 0});
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Vérifier la taille et la durée
    const sizeMB = file.size / (1024 * 1024);
    const duration = await getVideoDuration(file);
    
    const sizeTooLarge = sizeMB > 50;
    const durationTooLong = duration > MAX_DURATION;
    
    // Si au moins un critère est dépassé, afficher le modal unifié
    if (sizeTooLarge || durationTooLong) {
      setValidationErrors({
        sizeTooLarge,
        durationTooLong,
        size: sizeMB,
        duration: Math.round(duration)
      });
      setShowValidationModal(true);
      e.target.value = "";
      return;
    }

    // Vérifier la résolution (optionnel - pour information)
    const resolution = await getVideoResolution(file);
    console.log(`📹 Vidéo uploadée: ${resolution.width}x${resolution.height}`);
    
    // Afficher un message informatif sur la résolution
    if (resolution.width > 0 && resolution.height > 0) {
      const aspectRatio = (resolution.width / resolution.height).toFixed(2);
      toast.success(`Vidéo détectée: ${resolution.width}x${resolution.height} (ratio ${aspectRatio})`, { duration: 3000 });
    }

    setIsUploadingRecording(true);
    setShowUploadProgress(true);
    setUploadProgress(0);
    try {
      const fileToUpload = await compressIfNeeded(file);
      const sizeMB = (fileToUpload.size / (1024 * 1024)).toFixed(1);
      
      if (fileToUpload !== file) {
        toast.success(`Vidéo compressée : ${sizeMB} Mo`, { id: "compress" });
      } else {
        toast.dismiss("compress");
      }

      console.log(`[Upload] Sending file: ${fileToUpload.name}, size: ${sizeMB}MB, type: ${fileToUpload.type}`);
      const res = await startUpload([fileToUpload], { candidateId: undefined, jobId: undefined });
      console.log("[Upload] Response:", res);
      if (res && res[0]) {
        // Utiliser uniquement ufsUrl (nouvelle API) pour éviter les avertissements de dépréciation
        const url = res[0].ufsUrl || `https://utfs.io/f/${res[0].key}`;
        setVideoUrl(url);
        setFormErrors((prev) => ({ ...prev, video: undefined }));
        toast.success("Vidéo téléchargée avec succès !");
      }
    } catch (error) {
      console.error("[Upload] Error:", error);
      
      // Afficher un message d'erreur spécifique
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'upload";
      toast.error(errorMessage, { duration: 5000 });
      toast.dismiss("compress");
    } finally {
      setIsUploadingRecording(false);
      setShowUploadProgress(false);
      setUploadProgress(0);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) { toast.error("Erreur: Utilisateur non connecté"); return; }

    const errors: { video?: string; experiences?: string; sector?: string; job?: string } = {};
    if (!videoUrl) {
      errors.video = "Veuillez importer ou enregistrer une vidéo.";
    }
    if (!experiences || experiences.trim() === "") {
      errors.experiences = "Ce champ est obligatoire.";
    }
    if (!selectedSector) {
      errors.sector = "Veuillez sélectionner un secteur d'activité.";
    }
    if (!selectedJob) {
      errors.job = "Veuillez sélectionner un poste recherché.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Veuillez corriger les champs obligatoires.");
      return;
    }

    setFormErrors({});
    setUploadStatus("uploading");
    try {
      await submitCandidateApplication({
        video_url: videoUrl,
        nb_experiences: experiences,
        job_id: selectedJob,
        sector_id: selectedSector,
        candidat_id: user.id,
      });
      toast.success("Votre CV a bien été téléchargé. Dès que les administrateurs l'auront vérifié, il sera disponible sur votre Dashboard.");
      setUploadStatus("completed");
      setVideoUrl(null);
      setExperiences("");
      setSelectedSector("");
      setSelectedJob("");
      router.push("/dashboard/candidat");
    } catch (error: any) {
      console.error("Error publishing video:", error);
      toast.error("Une erreur est survenue lors de la publication de votre CV vidéo.");
      setUploadStatus("failed");
    }
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Créer mon CV vidéo</h1>
          <p className="text-gray-600 mt-1">Mettez en valeur vos compétences et démarquez-vous</p>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Video Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Votre CV vidéo</h2>
                <p className="text-gray-600 text-sm mt-1">Enregistrez ou importez votre présentation</p>
                {formErrors.video ? (
                  <p className="text-sm text-red-600 mt-2">{formErrors.video}</p>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500">Durée maximale</p>
                <p className="text-sm font-bold text-green-600">1 min 30 sec</p>
              </div>
            </div>

            {/* Tabs */}
            {!videoUrl && (
              <div className="flex justify-center">
                <div className="inline-flex gap-3 p-2 bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      recorderRef.current?.stopCamera();
                      setVideoTab("upload");
                    }}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm rounded-lg transition-all ${
                      videoTab === "upload"
                        ? "bg-green-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FaCloudUploadAlt className="text-lg" />
                    Importer un fichier
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoTab("record")}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm rounded-lg transition-all ${
                      videoTab === "record"
                        ? "bg-green-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FaVideo className="text-lg" />
                    Enregistrer
                  </button>
                </div>
              </div>
            )}

            {/* Video ready */}
            {videoUrl ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-lg mx-auto">
                <div className="flex items-center mb-4">
                  <FaCheckCircle className="text-green-600 text-2xl mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900">Vidéo prête !</p>
                    <p className="text-sm text-gray-600">Votre CV vidéo est uploadé avec succès</p>
                  </div>
                </div>
                <video 
                  src={videoUrl} 
                  controls 
                  crossOrigin="anonymous"
                  className="w-full rounded-lg shadow-sm mb-4"
                />
                <Button type="button" onClick={() => setVideoUrl(null)} variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50">
                  <FaTrash className="mr-2" />
                  Supprimer et recommencer
                </Button>
              </div>

            ) : videoTab === "upload" ? (
              /* Upload tab */
              <div className="mt-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/mov,video/avi,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {isCompressing ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-600 font-medium mb-2">
                      {progress >= 85 ? "Finalisation..." : `Compression en cours... ${progress}%`}
                    </p>
                    <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                ) : isUploadingRecording ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Upload en cours...</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center hover:border-green-600 hover:bg-gray-50 transition-colors"
                  >
                    <FaCloudUploadAlt className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-base font-semibold text-gray-700 mb-2">Cliquez pour choisir une vidéo</p>
                    <p className="text-sm text-gray-500">MP4, MOV, AVI — max 1 min 30 sec</p>
                  </button>
                )}
              </div>

            ) : (
              /* Record tab */
              <div className="mt-4">
                {isUploadingRecording ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Upload en cours...</p>
                  </div>
                ) : (
                  <VideoRecorder ref={recorderRef} key="video-recorder" onVideoReady={handleRecordedVideo} />
                )}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Informations professionnelles</h2>
              <p className="text-gray-600 text-sm mt-1">Complétez votre profil</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Années d'expérience <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={experiences}
                  onChange={(e) => {
                    setExperiences(e.target.value);
                    if (formErrors.experiences) {
                      setFormErrors((prev) => ({ ...prev, experiences: undefined }));
                    }
                  }}
                  className={`w-full h-[42px] px-4 text-sm rounded-lg border focus:outline-none focus:ring-2 ${formErrors.experiences ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-300 focus:border-green-500 focus:ring-green-500"}`}
                  placeholder="Ex: 3"
                  min="0"
                />
                {formErrors.experiences ? (
                  <p className="mt-2 text-sm text-red-600">{formErrors.experiences}</p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secteur d'activité <span className="text-red-500">*</span>
                </label>
                <Select
                  value={sectorOptions.find((o) => o.value === selectedSector) || null}
                  onChange={(o) => {
                    setSelectedSector(o?.value || "");
                    setSelectedJob("");
                    if (formErrors.sector) {
                      setFormErrors((prev) => ({ ...prev, sector: undefined }));
                    }
                  }}
                  options={sectorOptions}
                  styles={getSelectStyles(!!formErrors.sector)}
                  placeholder="Sélectionnez le secteur"
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "Aucun secteur trouvé"}
                />
                {formErrors.sector ? (
                  <p className="mt-2 text-sm text-red-600">{formErrors.sector}</p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poste recherché <span className="text-red-500">*</span>
                </label>
                <Select
                  value={jobOptions.find((o) => o.value === selectedJob) || null}
                  onChange={(o) => {
                    setSelectedJob(o?.value || "");
                    if (formErrors.job) {
                      setFormErrors((prev) => ({ ...prev, job: undefined }));
                    }
                  }}
                  options={jobOptions}
                  styles={getSelectStyles(!!formErrors.job)}
                  placeholder="Sélectionnez le métier"
                  isDisabled={!selectedSector}
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "Aucun métier trouvé"}
                />
                {formErrors.job ? (
                  <p className="mt-2 text-sm text-red-600">{formErrors.job}</p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <Button
              type="submit"
              className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors ${
                uploadStatus === "uploading" ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={uploadStatus === "uploading"}
            >
              {uploadStatus === "uploading" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

      {/* Modal de validation unifié (taille et/ou durée) */}
      {showValidationModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
            {/* Header */}
            <div className="bg-green-600 p-5 text-white rounded-t-xl">
              <div className="flex items-center gap-3">
                <FaInfoCircle className="text-2xl flex-shrink-0" />
                <div>
                  <h2 className="text-lg font-bold">
                    {validationErrors.sizeTooLarge && validationErrors.durationTooLong 
                      ? "Vidéo non conforme"
                      : validationErrors.sizeTooLarge 
                      ? "Vidéo trop volumineuse"
                      : "Vidéo trop longue"}
                  </h2>
                  <p className="text-sm text-white/90">Veuillez corriger les problèmes</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-2.5">
              {/* Erreurs détectées - en grille si les deux sont présentes */}
              <div className={validationErrors.sizeTooLarge && validationErrors.durationTooLong ? "grid grid-cols-2 gap-2" : ""}>
                {validationErrors.sizeTooLarge && (
                  <div className="bg-orange-50 border-l-4 border-orange-400 p-2.5 rounded-r">
                    <p className="font-semibold text-gray-800 text-xs">Taille excessive</p>
                    <p className="text-xs text-gray-700">
                      <span className="font-bold text-orange-600">{validationErrors.size.toFixed(1)} MB</span> / <span className="font-bold">50 MB</span>
                    </p>
                  </div>
                )}

                {validationErrors.durationTooLong && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-2.5 rounded-r">
                    <p className="font-semibold text-gray-800 text-xs">Durée excessive</p>
                    <p className="text-xs text-gray-700">
                      <span className="font-bold text-red-600">{Math.floor(validationErrors.duration / 60)}m {validationErrors.duration % 60}s</span> / <span className="font-bold">1m30s</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Solution */}
              <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-lg">
                <p className="font-semibold text-blue-900 text-xs">Solution</p>
                <p className="text-xs text-blue-800">
                  {validationErrors.sizeTooLarge && validationErrors.durationTooLong
                    ? "Raccourcissez et compressez votre vidéo."
                    : validationErrors.sizeTooLarge
                    ? "Compressez votre vidéo avec un outil gratuit."
                    : "Raccourcissez votre vidéo à maximum 1 minute 30 secondes."}
                </p>
              </div>

              {/* Outils de compression */}
              {validationErrors.sizeTooLarge && (
                <div>
                  <p className="font-semibold text-gray-700 mb-1.5 text-xs">Outils gratuits :</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="https://www.freeconvert.com/fr/video-compressor"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-2.5 rounded-lg transition-colors text-center"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <FaVideo className="text-xs" />
                        <div className="text-left">
                          <div className="text-xs font-bold">FreeConvert</div>
                          <div className="text-[10px] opacity-90">Gratuit</div>
                        </div>
                      </div>
                    </a>

                    <a
                      href="https://clideo.com/fr/compress-video"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-2.5 rounded-lg transition-colors text-center"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <FaVideo className="text-xs" />
                        <div className="text-left">
                          <div className="text-xs font-bold">Clideo</div>
                          <div className="text-[10px] opacity-90">Simple</div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              )}

              {/* Limites */}
              <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                <p className="font-semibold text-gray-700 mb-1.5 text-xs">Limites de la plateforme</p>
                <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-600">
                  <div>Durée : <span className="font-semibold text-gray-900">&lt; 1m30s</span></div>
                  <div>Taille : <span className="font-semibold text-gray-900">&lt; 50 MB</span></div>
                  <div>Format : <span className="font-semibold text-gray-900">MP4</span></div>
                  <div>Résolution : <span className="font-semibold text-gray-900">720p+</span></div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-5 py-3 rounded-b-xl border-t border-gray-200">
              <button
                onClick={() => setShowValidationModal(false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                J'ai compris
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de progression d'upload */}
      {showUploadProgress && typeof window !== 'undefined' && createPortal(
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden w-80">
            {/* Header */}
            <div className="bg-green-600 p-4">
              <div className="flex items-center">
                <FaUpload className="text-white text-lg mr-3" />
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm">Upload en cours</h3>
                  <p className="text-white/90 text-xs">Veuillez patienter...</p>
                </div>
                <div className="text-white font-bold text-lg">
                  {uploadProgress}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="p-4">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              
              {/* Status Text */}
              <div className="mt-3 text-sm text-gray-600">
                {uploadProgress < 30 && "Préparation..."}
                {uploadProgress >= 30 && uploadProgress < 70 && "Envoi en cours..."}
                {uploadProgress >= 70 && uploadProgress < 100 && "Finalisation..."}
                {uploadProgress === 100 && "Terminé !"}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}