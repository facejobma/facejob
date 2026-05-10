"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const recorderRef = useRef<VideoRecorderHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const MAX_DURATION = 75;
  const { compressIfNeeded, isCompressing, progress } = useVideoCompressor();

  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const { startUpload } = useUploadThing("videoUpload", {
    onUploadError: (error) => {
      toast.error(`Erreur upload: ${error.message}`, { id: "rec-upload" });
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

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      padding: "0.5rem",
      borderColor: "#d1d5db",
      borderRadius: "0.5rem",
      "&:hover": { borderColor: "#9ca3af" },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? "var(--primary)" : state.isFocused ? "#f3f4f6" : "white",
      color: state.isSelected ? "white" : "#111827",
    }),
  };

  const handleRecordedVideo = async (file: File) => {
    setIsUploadingRecording(true);
    toast.loading("Upload de la video...", { id: "rec-upload" });
    console.log("[RecUpload] Starting upload, file size:", (file.size / 1024 / 1024).toFixed(1), "MB, type:", file.type);
    try {
      const res = await startUpload([file], { candidateId: undefined, jobId: undefined });
      console.log("[RecUpload] Response:", res);
      if (res && res[0]) {
        const url = res[0].ufsUrl || res[0].url || `https://utfs.io/f/${res[0].key}`;
        setVideoUrl(url);
        toast.success("Video uploadee avec succes !", { id: "rec-upload" });
      } else {
        toast.error("Erreur: pas de reponse du serveur", { id: "rec-upload" });
      }
    } catch (err) {
      console.error("[RecUpload] Error:", err);
      toast.error("Erreur lors de l'upload", { id: "rec-upload" });
    } finally {
      setIsUploadingRecording(false);
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
    
    // Vérifier la durée
    const duration = await getVideoDuration(file);
    if (duration > MAX_DURATION) {
      setVideoDuration(Math.round(duration));
      setShowDurationModal(true);
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
    try {
      // Compress if > 32MB
      const fileToUpload = await compressIfNeeded(file);
      const sizeMB = (fileToUpload.size / (1024 * 1024)).toFixed(1);
      if (fileToUpload !== file) {
        toast.success(`Vidéo compressée : ${sizeMB} Mo`);
      }

      console.log(`[Upload] Sending file: ${fileToUpload.name}, size: ${sizeMB}MB, type: ${fileToUpload.type}`);
      toast.loading("Upload de la vidéo...", { id: "file-upload" });
      const res = await startUpload([fileToUpload], { candidateId: undefined, jobId: undefined });
      console.log("[Upload] Response:", res);
      if (res && res[0]) {
        const url = res[0].ufsUrl || res[0].url || `https://utfs.io/f/${res[0].key}`;
        setVideoUrl(url);
        toast.success("Vidéo téléchargée avec succès !", { id: "file-upload" });
      }
    } catch {
      toast.error("Erreur lors de l'upload", { id: "file-upload" });
    } finally {
      setIsUploadingRecording(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) { toast.error("Erreur: Utilisateur non connecté"); return; }
    if (!videoUrl) { toast.error("Veuillez télécharger une vidéo!"); return; }
    
    // Validation des champs obligatoires
    if (!experiences || experiences.trim() === "") {
      toast.error("Veuillez renseigner vos années d'expérience!");
      return;
    }
    if (!selectedSector) {
      toast.error("Veuillez sélectionner un secteur d'activité!");
      return;
    }
    if (!selectedJob) {
      toast.error("Veuillez sélectionner un poste recherché!");
      return;
    }
    
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
          {[
            { icon: <FaCloudUploadAlt />, label: "Étape 1", desc: "Enregistrez ou importez votre vidéo" },
            { icon: <FaEdit />, label: "Étape 2", desc: "Remplissez les informations" },
            { icon: <FaCheckCircle />, label: "Étape 3", desc: "Publiez votre CV" },
          ].map((step, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary text-sm md:text-lg">
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-semibold text-gray-900">{step.label}</p>
                  <p className="text-xs text-gray-600">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Video Section */}
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FaVideo className="text-primary text-xs md:text-sm" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Votre CV vidéo</h3>
            </div>

            {/* Tabs — hidden once video is ready */}
            {!videoUrl && (
              <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    recorderRef.current?.stopCamera();
                    setVideoTab("upload");
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                    videoTab === "upload" ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <FaCloudUploadAlt />
                  Importer un fichier
                </button>
                <button
                  type="button"
                  onClick={() => setVideoTab("record")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                    videoTab === "record" ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <FaVideo />
                  Enregistrer
                </button>
              </div>
            )}

            {/* Video ready */}
            {videoUrl ? (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 md:p-6 border-2 border-gray-200">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FaCheckCircle className="text-green-600 text-sm md:text-lg" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm md:text-base">Vidéo prête à être publiée</p>
                      <p className="text-xs md:text-sm text-gray-600">Votre CV vidéo est uploadé avec succès</p>
                    </div>
                  </div>
                  <video src={videoUrl} controls className="w-full max-w-2xl mx-auto rounded-lg shadow-lg border-2 border-gray-300" />
                  <div className="flex justify-center">
                    <Button type="button" onClick={() => setVideoUrl(null)} variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-xs md:text-sm">
                      <FaTrash className="mr-2 text-xs md:text-sm" />
                      Supprimer et recommencer
                    </Button>
                  </div>
                </div>
              </div>

            ) : videoTab === "upload" ? (
              /* Upload tab */
              <div className="relative">
                <div className="absolute top-2 md:top-4 right-2 md:right-4 flex flex-wrap gap-1 md:gap-2 z-10">
                  {["MP4", "MOV", "AVI"].map((f) => (
                    <span key={f} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">{f}</span>
                  ))}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/mov,video/avi,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {isCompressing ? (
                  <div className="flex flex-col items-center justify-center gap-3 p-8 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-600 font-medium">
                      {progress >= 85 ? "Finalisation..." : `Compression en cours... ${progress}%`}
                    </p>
                    <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                ) : isUploadingRecording ? (
                  <div className="flex flex-col items-center justify-center gap-3 p-8 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-600 font-medium">Upload en cours...</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 md:p-12 flex flex-col items-center gap-4 hover:border-primary hover:bg-green-50 transition-colors"
                  >
                    <FaCloudUploadAlt className="w-12 h-12 text-gray-400" />
                    <div className="text-center">
                      <p className="text-base font-semibold text-gray-700">Cliquez pour choisir une vidéo</p>
                      <p className="text-sm text-gray-400 mt-1">MP4, MOV, AVI — max 1 min 3 sec</p>
                      <p className="text-xs text-gray-500 mt-1">Résolution recommandée: 1280x720 (HD) ou supérieure</p>
                    </div>
                    <span className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg">
                      Choisir un fichier
                    </span>
                  </button>
                )}
              </div>

            ) : (
              /* Record tab */
              <div className="space-y-3">
                {isUploadingRecording ? (
                  <div className="flex flex-col items-center justify-center gap-3 p-8 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-600 font-medium">Upload en cours...</p>
                  </div>
                ) : (
                  <VideoRecorder ref={recorderRef} key="video-recorder" onVideoReady={handleRecordedVideo} />
                )}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">!</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Informations obligatoires</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Les champs marqués d'un astérisque (<span className="text-red-500">*</span>) sont obligatoires pour publier votre CV vidéo.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-semibold text-gray-700">
                  Années d'expérience <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={experiences}
                  onChange={(e) => setExperiences(e.target.value)}
                  className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Ex: 3"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-semibold text-gray-700">
                  Secteur d'activité <span className="text-red-500">*</span>
                </label>
                <Select
                  value={sectorOptions.find((o) => o.value === selectedSector) || null}
                  onChange={(o) => { setSelectedSector(o?.value || ""); setSelectedJob(""); }}
                  options={sectorOptions}
                  styles={selectStyles}
                  placeholder="Sélectionnez le secteur"
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "Aucun secteur trouvé"}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs md:text-sm font-semibold text-gray-700">
                  Poste recherché <span className="text-red-500">*</span>
                </label>
                <Select
                  value={jobOptions.find((o) => o.value === selectedJob) || null}
                  onChange={(o) => setSelectedJob(o?.value || "")}
                  options={jobOptions}
                  styles={selectStyles}
                  placeholder="Sélectionnez le métier"
                  isDisabled={!selectedSector}
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "Aucun métier trouvé"}
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-3 md:pt-4 border-t border-gray-200">
            <Button
              type="submit"
              className={`bg-primary hover:bg-primary-1 text-white font-semibold py-2.5 md:py-3 px-4 md:px-6 rounded-lg shadow-sm transition-all duration-300 text-sm md:text-base w-full md:w-auto ${
                uploadStatus === "uploading" ? "opacity-50 cursor-not-allowed" : ""
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

      {/* Duration warning modal */}
      {showDurationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaVideo className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Vidéo trop longue</h3>
            <p className="text-gray-600 text-sm mb-1">
              Votre vidéo dure <span className="font-semibold text-red-600">{Math.floor(videoDuration / 60)}m {videoDuration % 60}s</span>.
            </p>
            <p className="text-gray-600 text-sm mb-6">
              La durée maximale autorisée est de <span className="font-semibold">1 min 3 sec</span>. Veuillez raccourcir votre vidéo avant de la télécharger.
            </p>
            <button
              onClick={() => setShowDurationModal(false)}
              className="w-full py-2.5 bg-primary hover:bg-primary-1 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
