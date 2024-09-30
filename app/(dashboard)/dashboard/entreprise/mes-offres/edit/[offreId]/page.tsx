"use client";

import Cookies from "js-cookie";
import { useParams } from "next/navigation";
import {useEffect, useState } from "react";
import toast from "react-hot-toast";


interface Job {
  id: number;
  name: string;
}

interface Sector {
  id: number;
  name: string;
  jobs: Job[];
}

const PublishOffer: React.FC = () => {

  //get the param from the url
  const { offreId } = useParams();


  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [contractType, setContractType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [uploadStatus, setUploadStatus] = useState("idle");

  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const userData =  typeof window !== "undefined"
    ? window.sessionStorage?.getItem("user")
    : null

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sectors`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch sectors");
        }
        const data = await response.json();
        setSectors(data);
      } catch (error) {
        console.error("Error fetching sectors:", error);
        toast.error("Error fetching sectors!");
      }
    };

    fetchSectors();
  }, []);

  useEffect(() => {
    if (offreId) {
      const fetchOffer = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/offres_by_id/${offreId}`,
            {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
                },
              }
          );
          if (!response.ok) {
            throw new Error("Failed to fetch offer");
          }
          const data = await response.json();
          console.log("data", data);
          setTitle(data.titre || "");
          setLocation(data.location || "");
          setContractType(data.contractType || "");
          setStartDate(data.date_debut?.split(" ")[0] || "");
          setDescription(data.description || "");
          setSelectedSector(data.sector_id ? data.sector_id.toString() : "");
          setSelectedJob(data.job_id ? data.job_id.toString() : "");
        } catch (error) {
          console.error("Error fetching offer:", error);
          toast.error("Error fetching offer!");
        }
      };

      fetchOffer();
    }
  }, [offreId]);

  // Filter jobs based on selected sector
  const filteredJobs =
    sectors.find((sector) => sector.id === parseInt(selectedSector))?.jobs || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setUploadStatus("uploading");

    try {
      if (userData) {
        const user = JSON.parse(userData);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/update_offre/${offreId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              titre: title,
              location,
              contractType,
              date_debut: startDate,
              description,
              sector_id: selectedSector,
              job_id: selectedJob,
              entreprise_id: user.id,
            }),
          }
        );

        if (response.ok) {
          toast.success("Offer updated successfully!");
          setUploadStatus("completed");
        } else {
          toast.error("Failed to update offer!");
          setUploadStatus("failed");
        }
      }
    } catch (error) {
      console.error("Error updating offer:", error);
      toast.error("An error occurred while updating the offer!");
      setUploadStatus("failed");
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-24 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-medium mb-8 text-center">
          Modifier votre offre
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              className="block text-sm font-bold mb-2 text-gray-700"
              htmlFor="title"
            >
              Titre du poste
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Entrez le titre du poste"
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-sm font-bold mb-2 text-gray-700"
              htmlFor="location"
            >
              Lieu
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Entrez le lieu"
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-sm font-bold mb-2 text-gray-700"
              htmlFor="contractType"
            >
              Type de contrat
            </label>
            <select
              id="contractType"
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Sélectionnez le type de contrat</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Temps plein">Temps plein</option>
              <option value="Temps partiel">Temps partiel</option>
            </select>
          </div>

          <div className="mb-6">
            <label
              className="block text-sm font-bold mb-2 text-gray-700"
              htmlFor="startDate"
            >
              Date de début
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                <option key={sector.id} value={sector.id.toString()}>
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
                <option key={job.id} value={job.id.toString()}>
                  {job.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-14">
            <label
              className="block text-sm font-bold mb-2 text-gray-700"
              htmlFor="description"
            >
              Description du poste
            </label>
           <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={5}
              placeholder="Entrez la description du poste"
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className={`bg-primary hover:bg-primary-2 text-white font-medium py-2 px-6 rounded-md shadow-lg transition duration-300 ${
                uploadStatus === "uploading"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={uploadStatus === "uploading"}
            >
              {uploadStatus === "uploading" ? "En cours..." : "Mettre à jour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublishOffer;
