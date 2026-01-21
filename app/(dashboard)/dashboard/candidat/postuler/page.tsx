"use client";

import React, { useState, useEffect } from "react";
import "@uploadthing/react/styles.css";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { FaTrash, FaVideo, FaUpload, FaCheckCircle } from "react-icons/fa";
import { HiOutlineVideoCamera, HiOutlineCloudUpload } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { ButtonLoading, ProgressLoading } from "@/components/ui/loading";

interface Job {
  id: number;
  name: string;
}

interface Sector {
  id: number;
  name: string;
  jobs: Job[];
}

const PublishVideo: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [experiences, setExperiences] = useState("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [uploadStatus, setUploadStatus] = useState("idle");
  const router = useRouter();

  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const userData =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user")
      : null;

  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/sectors"
        );
        const data = await response.json();
        setSectors(data);
      } catch (error) {
        console.error("Error fetching sectors:", error);
        toast.error("Error fetching sectors!");
      }
    };

    fetchSectors();
  }, []);

  const filteredJobs =
    sectors.find((sector) => sector.id === parseInt(selectedSector))?.jobs ||
    [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!videoUrl) {
      toast.error("Please upload a video!");
      return;
    }

    setUploadStatus("uploading");

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/candidate/postuler",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            video_url: videoUrl,
            nb_experiences: experiences,
            job_id: selectedJob,
            sector_id: selectedSector,
            candidat_id: user.id,
          }),
        }
      );

      if (response.ok) {
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
      } else {
        toast.error("Failed to publish video!");
        setUploadStatus("failed");
      }
    } catch (error) {
      console.error("Error publishing video:", error);
      toast.error("An error occurred while publishing the video!");
      setUploadStatus("failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="space-y-8 p-4">
        {/* Header with enhanced design */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <HiOutlineVideoCamera className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Créer mes CV vidéos</h1>
                <p className="text-green-100 mt-1">Publiez votre CV vidéo et mettez en valeur vos compétences</p>
              </div>
            </div>
            
            {/* Process Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <HiOutlineCloudUpload className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Étape 1</p>
                    <p className="text-xs text-green-100">Téléchargez votre vidéo</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">📝</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Étape 2</p>
                    <p className="text-xs text-green-100">Remplissez les informations</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                    <FaCheckCircle className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Étape 3</p>
                    <p className="text-xs text-green-100">Publiez votre CV</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="p-8">
          {/* Warning Notice */}
          <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-600 text-lg">💡</span>
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 mb-2">Conseil pour optimiser votre vidéo</h3>
                <p className="text-sm text-amber-700 leading-relaxed">
                  Avant de déposer votre CV vidéo, nous vous recommandons de le compresser pour réduire sa taille et améliorer le temps de chargement. 
                  <a
                    href="https://clideo.com/fr/compress-video"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-amber-800 hover:text-amber-900 underline ml-1"
                  >
                    Utilisez ce compresseur gratuit →
                  </a>
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Video Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <FaVideo className="text-green-600 text-sm" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Téléchargez votre CV vidéo</h3>
              </div>
              
              {videoUrl ? (
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                    />
                    <Button
                      type="button"
                      onClick={() => setVideoUrl(null)}
                      variant="outline"
                      className="mt-4 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      <FaTrash className="mr-2 text-sm" />
                      Supprimer la vidéo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 transition-colors">
                  <UploadDropzone<OurFileRouter, "videoUploadOnly">
                    endpoint="videoUploadOnly"
                    onClientUploadComplete={(res) => {
                      console.log("Files: ", res);
                      setVideoUrl(res[0].url);
                      toast.success("Upload Completed!");
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(`Upload Error: ${error.message}`);
                    }}
                    className="p-8"
                  />
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Années d'expérience
                </label>
                <input
                  type="number"
                  value={experiences}
                  onChange={(e) => setExperiences(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Ex: 3"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Secteur d'activité
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => {
                    setSelectedSector(e.target.value);
                    setSelectedJob("");
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="">Sélectionnez le secteur</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Poste recherché
                </label>
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!selectedSector}
                >
                  <option value="">Sélectionnez le métier</option>
                  {filteredJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                className={`bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  uploadStatus === "uploading"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={uploadStatus === "uploading"}
              >
                {uploadStatus === "uploading" ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Publication en cours...
                  </>
                ) : (
                  <>
                    <FaUpload className="mr-3" />
                    Publier mon CV vidéo
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PublishVideo;