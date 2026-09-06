"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { FaTrash, FaVideo, FaUpload, FaCheckCircle, FaCloudUploadAlt, FaInfoCircle, FaBriefcase, FaArrowRight, FaShieldAlt } from "react-icons/fa";
import { fetchSectors, submitCandidateApplication } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Select from "react-select";
import { useUser } from "@/hooks/useUser";
import VideoRecorder, { type VideoRecorderHandle } from "@/components/VideoRecorder";
import { useVideoCompressor } from "@/hooks/useVideoCompressor";
import AIProfileScriptGenerator from "@/components/AIProfileScriptGenerator";

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
  const [teleprompterScript, setTeleprompterScript] = useState("");
  const [showTeleprompter, setShowTeleprompter] = useState(false);
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
  
  // Custom S3 upload function replacing startUpload from UploadThing
  const startUpload = async (files: File[], metadata: any = {}) => {
    try {
      setUploadProgress(10);
      setShowUploadProgress(true);
      
      const file = files[0];
      if (!file) throw new Error("No file provided");

      // 1. Get presigned URL
      const presignRes = await fetch('/local-api/s3/presign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });

      if (!presignRes.ok) {
        const errorText = await presignRes.text().catch(() => "No response body");
        let errorData: any = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          // not json
        }
        const message = errorData?.error || `Failed to get upload URL (Status: ${presignRes.status}). Body: ${errorText.substring(0, 100)}`;
        throw new Error(message);
      }
      
      const { presignedUrl, fileUrl, key } = await presignRes.json();
      setUploadProgress(20);

      // 2. Upload file directly to S3 with real-time XHR progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", presignedUrl, true);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            // Map S3 upload progress to 20% -> 95% range
            const percent = Math.round(20 + (event.loaded / event.total) * 75);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadProgress(100);
            resolve();
          } else {
            reject(new Error(`Failed to upload to S3 (Status ${xhr.status})`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during S3 upload"));
        xhr.ontimeout = () => reject(new Error("Upload timed out"));

        xhr.send(file);
      });

      return [{ ufsUrl: fileUrl, key: key }];
    } catch (error: any) {
      toast.error(`Erreur upload: ${error.message}`, { id: "rec-upload" });
      setShowUploadProgress(false);
      throw error;
    }
  };

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
      minHeight: "50px",
      borderColor: hasError ? "#ef4444" : "#e2e8f0",
      backgroundColor: "#ffffff",
      boxShadow: hasError ? "0 0 0 3px rgba(239, 68, 68, 0.12)" : "0 1px 2px rgba(15, 23, 42, 0.03)",
      borderRadius: "0.875rem",
      cursor: "pointer",
      "&:hover": { borderColor: hasError ? "#ef4444" : "#10b981" },
      "&:focus-within": {
        borderColor: hasError ? "#ef4444" : "#10b981",
        boxShadow: hasError ? "0 0 0 3px rgba(239, 68, 68, 0.12)" : "0 0 0 3px rgba(16, 185, 129, 0.12)",
      },
    }),
    valueContainer: (base: any) => ({
      ...base,
      padding: "2px 12px",
    }),
    input: (base: any) => ({
      ...base,
      margin: "0px",
      padding: "0px",
    }),
    indicatorsContainer: (base: any) => ({
      ...base,
      minHeight: "50px",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? "var(--primary)" : state.isFocused ? "#f3f4f6" : "white",
      color: state.isSelected ? "white" : "#111827",
      cursor: "pointer",
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 50,
      overflow: "hidden",
      borderRadius: "0.875rem",
      border: "1px solid #e2e8f0",
      boxShadow: "0 16px 35px rgba(15, 23, 42, 0.14)",
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
      toast.error(error?.message || "Une erreur est survenue lors de la publication de votre CV vidéo.");
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
    <div className="mx-auto max-w-[1400px] space-y-6 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 p-6 text-white shadow-xl shadow-emerald-950/10 sm:p-8">
        <div className="absolute -right-14 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 right-1/3 h-44 w-44 rounded-full bg-teal-300/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-emerald-50 backdrop-blur-sm">
              <FaVideo className="text-sm" /> Profil candidat
            </span>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Créer mon CV vidéo</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-50 sm:text-base">Présentez votre parcours en 90 secondes et donnez aux recruteurs une raison de vous rencontrer.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              ["1", "Vidéo"],
              ["2", "Profil"],
              ["3", "Publication"],
            ].map(([step, label]) => (
              <div key={step} className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center backdrop-blur-sm sm:min-w-24">
                <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-black text-emerald-800">{step}</span>
                <span className="mt-1.5 block text-[10px] font-semibold text-emerald-50 sm:text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_45px_rgba(15,23,42,0.07)]">
        <form onSubmit={handleSubmit} className="space-y-0" noValidate>
          {/* Video Section */}
          <div className="space-y-5 p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"><FaVideo className="text-lg" /></span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Étape 1</p>
                  <h2 className="mt-0.5 text-lg font-bold text-slate-900">Votre CV vidéo</h2>
                  <p className="mt-1 text-sm text-slate-500">Enregistrez ou importez votre présentation</p>
                </div>
                {formErrors.video ? (
                  <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 ring-1 ring-red-100">{formErrors.video}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-3 self-start rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:self-auto">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm"><FaShieldAlt /></span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Format recommandé</p>
                  <p className="text-sm font-bold text-slate-800">90 sec · MP4 · 50 Mo</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            {!videoUrl && (
              <div className="flex justify-center">
                <div className="grid w-full max-w-xl grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-100/80 p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      recorderRef.current?.stopCamera();
                      setVideoTab("upload");
                    }}
                    className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 ${
                      videoTab === "upload"
                        ? "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
                    }`}
                  >
                    <FaCloudUploadAlt className="text-lg" />
                    Importer un fichier
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoTab("record")}
                    className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 ${
                      videoTab === "record"
                        ? "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
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
              <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-emerald-100">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><FaCheckCircle className="text-xl" /></span>
                  <div>
                    <p className="font-bold text-slate-900">Vidéo prête à publier</p>
                    <p className="text-xs text-slate-500 sm:text-sm">Vérifiez l’aperçu avant de continuer</p>
                  </div>
                </div>
                <video 
                  src={videoUrl} 
                  controls 
                  crossOrigin="anonymous"
                  className="mb-4 aspect-video w-full rounded-2xl bg-slate-950 object-contain shadow-lg"
                />
                <Button type="button" onClick={() => setVideoUrl(null)} variant="outline"
                  className="h-11 w-full rounded-xl border-red-200 bg-white font-bold text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 sm:w-auto">
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
                  <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-8 sm:p-12">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
                    <p className="mb-2 font-bold text-slate-700">
                      {progress >= 85 ? "Finalisation..." : `Compression en cours... ${progress}%`}
                    </p>
                    <div className="h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-emerald-100">
                      <div className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                ) : isUploadingRecording ? (
                  <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-8 sm:p-12">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
                    <p className="font-bold text-slate-700">Téléversement en cours...</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group/upload flex min-h-72 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-gradient-to-b from-white to-slate-50/70 p-7 text-center transition duration-300 hover:border-emerald-400 hover:bg-emerald-50/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 sm:p-12"
                  >
                    <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100 transition group-hover/upload:scale-105 group-hover/upload:bg-emerald-100"><FaCloudUploadAlt className="h-8 w-8" /></span>
                    <p className="text-base font-black text-slate-800 sm:text-lg">Déposez votre vidéo ici</p>
                    <p className="mt-1 text-sm text-slate-500">ou cliquez pour parcourir vos fichiers</p>
                    <span className="mt-5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-500 shadow-sm">MP4, MOV ou AVI · 90 sec maximum · 50 Mo</span>
                  </button>
                )}
              </div>

            ) : (
              /* Record tab with AI assistant sidebar */
              <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-5">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-2 shadow-lg lg:col-span-3">
                  {isUploadingRecording ? (
                    <div className="flex h-[450px] flex-col items-center justify-center rounded-2xl bg-slate-900 p-12 text-white">
                      <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200/20 border-t-emerald-400" />
                      <p className="font-bold">Téléversement en cours...</p>
                    </div>
                  ) : (
                    <VideoRecorder 
                      ref={recorderRef} 
                      key="video-recorder" 
                      onVideoReady={handleRecordedVideo}
                      teleprompterScript={teleprompterScript}
                      showTeleprompter={showTeleprompter}
                      onCloseTeleprompter={() => setShowTeleprompter(false)}
                    />
                  )}
                </div>
                <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-3 lg:col-span-2">
                  <AIProfileScriptGenerator 
                    onScriptGenerated={(script) => {
                      setTeleprompterScript(script);
                      if (script) {
                        setShowTeleprompter(true);
                      } else {
                        setShowTeleprompter(false);
                      }
                    }}
                    initialScript={teleprompterScript}
                  />
                  {teleprompterScript && !isUploadingRecording && (
                    <button
                      type="button"
                      onClick={() => setShowTeleprompter(!showTeleprompter)}
                      className={`min-h-11 w-full rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                        showTeleprompter 
                          ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "border-transparent bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                      }`}
                    >
                      {showTeleprompter ? "Masquer le Téléprompteur" : "Afficher le Téléprompteur"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-5 border-t border-slate-200 bg-slate-50/60 p-5 sm:p-7 lg:p-8">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200"><FaBriefcase /></span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Étape 2</p>
                <h2 className="mt-0.5 text-lg font-bold text-slate-900">Informations professionnelles</h2>
                <p className="mt-1 text-sm text-slate-500">Aidez les recruteurs à identifier rapidement votre profil</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 sm:p-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
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
                  className={`h-[50px] w-full rounded-[14px] border bg-white px-4 text-sm font-medium text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.03)] outline-none transition placeholder:text-slate-400 focus:ring-4 ${formErrors.experiences ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-200 hover:border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100"}`}
                  placeholder="Ex: 3"
                  min="0"
                />
                {formErrors.experiences ? (
                  <p className="text-xs font-semibold text-red-600">{formErrors.experiences}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
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
                  <p className="text-xs font-semibold text-red-600">{formErrors.sector}</p>
                ) : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700">
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
                  <p className="text-xs font-semibold text-red-600">{formErrors.job}</p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col gap-4 border-t border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7 lg:px-8">
            <div className="flex items-start gap-2.5 text-xs text-slate-500 sm:max-w-md">
              <FaShieldAlt className="mt-0.5 shrink-0 text-emerald-600" />
              <p>Votre vidéo sera vérifiée avant sa publication. Vous pourrez suivre son statut depuis votre tableau de bord.</p>
            </div>
            <Button
              type="submit"
              className={`group min-h-[52px] w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl sm:w-auto ${
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
                  <FaArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
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

      {/* Full-Screen Blocking Modal Overlay Spinner during Upload */}
      {(showUploadProgress || isUploadingRecording || uploadStatus === "uploading") && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-900/85 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center pointer-events-auto cursor-wait select-none animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 max-w-md w-full space-y-6 transform scale-100 animate-in zoom-in-95 duration-200">
            {/* Pulsing Spinner Icon Container */}
            <div className="relative flex items-center justify-center w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-green-200 border-t-green-600 animate-spin"></div>
              <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center shadow-inner">
                <FaCloudUploadAlt className="text-3xl text-green-600 animate-pulse" />
              </div>
            </div>

            {/* Title & Percentage */}
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-gray-900">Téléversement de votre CV en cours...</h3>
              <p className="text-sm font-semibold text-green-600">
                {uploadProgress > 0 ? `${uploadProgress}% effectué` : "Initialisation du transfert S3..."}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${Math.max(uploadProgress, 8)}%` }}
              />
            </div>

            {/* Status Steps */}
            <div className="text-xs font-medium text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
              {uploadProgress < 30 && "⚡ Preparation & Compression du fichier..."}
              {uploadProgress >= 30 && uploadProgress < 70 && "☁️ Envoi sécurisé vers AWS S3..."}
              {uploadProgress >= 70 && uploadProgress < 100 && "🔒 Vérification et finalisation..."}
              {uploadProgress === 100 && "✅ Téléversement réussi ! Redirection en cours..."}
            </div>

            {/* Locking Warning */}
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl">
              <span>🔒 Navigation bloquée. Veuillez ne pas fermer ni rafraîchir cette page.</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
