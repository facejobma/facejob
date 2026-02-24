"use client";

import React, { useState, useEffect } from "react";
import { FaVideo, FaUpload } from "react-icons/fa";
import { HiOutlineVideoCamera } from "react-icons/hi";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Sector {
  id: number;
  name: string;
  jobs: Job[];
}

interface Job {
  id: number;
  name: string;
  sector_id: number;
}

export default function PublishVideo() {
  const router = useRouter();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [experiences, setExperiences] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    fetchSectors();
  }, []);

  useEffect(() => {
    if (selectedSector) {
      const sector = sectors.find(s => s.id.toString() === selectedSector);
      setJobs(sector?.jobs || []);
      setSelectedJob("");
    } else {
      setJobs([]);
      setSelectedJob("");
    }
  }, [selectedSector, sectors]);

  const fetchSectors = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://api.facejob.ma/api/v1/sectors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erreur lors du chargement des secteurs");

      const data = await response.json();
      setSectors(data.data || []);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      toast.error("Erreur lors du chargement des secteurs");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      toast.error("Veuillez sélectionner une vidéo");
      return;
    }

    if (!selectedSector) {
      toast.error("Veuillez sélectionner un secteur");
      return;
    }

    if (!selectedJob) {
      toast.error("Veuillez sélectionner un métier");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        toast.error("Vous devez être connecté");
        router.push("/login");
        return;
      }

      // First upload the video file
      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("id", userId);

      const uploadResponse = await fetch("https://api.facejob.ma/api/v1/Postuler/update", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || "Erreur lors du téléchargement de la vidéo");
      }

      const uploadData = await uploadResponse.json();
      const videoUrl = uploadData.link || videoFile.name;

      // Then create the video application
      const applicationData = {
        candidat_id: parseInt(userId),
        job_id: parseInt(selectedJob),
        sector_id: parseInt(selectedSector),
        video_url: videoUrl,
      };

      const response = await fetch("https://api.facejob.ma/api/v1/candidate/postuler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la publication du CV vidéo");
      }

      const result = await response.json();

      toast.success("CV vidéo publié avec succès!");
      
      // Reset form
      setVideoFile(null);
      setExperiences("");
      setSelectedSector("");
      setSelectedJob("");
      
      // Redirect to candidate videos page
      setTimeout(() => {
        router.push("/dashboard/candidat/mes-cvs");
      }, 1500);

    } catch (error: any) {
      console.error("Error submitting video:", error);
      toast.error(error.message || "Erreur lors de la publication du CV vidéo");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
            <HiOutlineVideoCamera className="text-green-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Créer mon CV vidéo</h1>
            <p className="text-gray-600 mt-1">Publiez votre CV vidéo et mettez en valeur vos compétences</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vidéo CV <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
              <FaVideo className="mx-auto text-gray-400 text-3xl mb-3" />
              <p className="text-gray-600 mb-2">Glissez votre vidéo ici ou cliquez pour sélectionner</p>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="hidden"
                id="video-upload"
                disabled={isLoading}
              />
              <label
                htmlFor="video-upload"
                className={`inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Choisir une vidéo
              </label>
              {videoFile && (
                <p className="mt-3 text-sm text-green-600">✓ {videoFile.name}</p>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secteur d'activité <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                disabled={isLoading}
                required
              >
                <option value="">Sélectionnez le secteur</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poste recherché <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                disabled={isLoading || !selectedSector}
                required
              >
                <option value="">Sélectionnez le métier</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center gap-2 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Publication en cours...
                </>
              ) : (
                <>
                  <FaUpload />
                  Publier mon CV vidéo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
