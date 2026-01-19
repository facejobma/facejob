"use client";

import React, { useState, useEffect } from "react";
import "@uploadthing/react/styles.css";
import { UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";


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
  const [job, setJob] = useState("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [uploadStatus, setUploadStatus] = useState("idle");
const router = useRouter(); // dans ton composant

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
        "Votre CV a bien été téléchargé. Dès que les administrateurs l’auront vérifié, il sera disponible sur votre Dashboard."
      );

      setUploadStatus("completed");

      // 🔥 Vider le formulaire après succès
      setVideoUrl(null);
      setExperiences("");
      setSelectedSector("");
      setSelectedJob("");

      // 🔥 Redirection vers le dashboard candidat
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
    <div className="flex-1 space-y-4 p-4 md:p-24 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700">
          <p className="text-sm">
            Avant de déposer votre cv vidéo, nous vous recommandons de le
            compresser pour réduire sa taille. Vous pouvez utiliser ce
            compresseur en ligne gratuit.{" "}
            <a
              href="https://clideo.com/fr/compress-video"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:text-blue-800"
            >
              Compresser ma vidéo
            </a>
            .
          </p>
        </div>
        <h2 className="text-2xl font-medium mb-8 text-center">
          Publiez votre CV Vidéo
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              className="block text-sm font-bold mb-2 text-gray-700"
              htmlFor="video"
            >
              Dépose votre CV Vidéo
            </label>
            {videoUrl ? (
              <div className="mb-4">
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-auto rounded-md"
                />
               <button
                  type="button"
                  onClick={() => setVideoUrl(null)}
                  className="mt-2 flex items-center text-red-600 hover:text-red-800"
                >
                  <FaTrash className="mr-2" />
                  Supprimer la vidéo
                </button>
              </div>
            ) : (
              <UploadDropzone<OurFileRouter>
                endpoint="videoUploadOnly"
                onClientUploadComplete={(res: any) => {
                  console.log("Files: ", res);
                  setVideoUrl(res[0].fileUrl);
                  toast.success("Upload Completed!");
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Upload Error: ${error.message}`);
                }}
                className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors border-gray-300"
              />
            )}
          </div>

          <div className="mb-6">
            <label
              className="block text-sm font-bold mb-2 text-gray-700"
              htmlFor="experiences"
            >
              Années d’expérience
            </label>
            <input
              type="number"
              id="experiences"
              value={experiences}
              onChange={(e) => setExperiences(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Entrez votre nombre d’années d’expérience"
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-sm font-bold mb-2 text-gray-700"
              htmlFor="secteur"
            >
              Secteur
            </label>
            <select
              id="secteur"
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value);
                setSelectedJob(""); // Reset job selection when sector changes
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Sélectionnez le secteur</option>
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label
              className="block text-sm font-bold mb-2 text-gray-700"
              htmlFor="metier"
            >
              Métier
            </label>
            <select
              id="metier"
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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

          <div className="flex justify-center">
            <button
              type="submit"
              className={`bg-primary hover:bg-primary-2 text-white font-medium py-2 px-6 rounded-md shadow-lg transition duration-300 ${
                uploadStatus === "chargement"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={uploadStatus === "chargement"}
            >
              {uploadStatus === "chargement"
                ? "Publication..."
                : "Publiez votre Vidéo ! "}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublishVideo;
