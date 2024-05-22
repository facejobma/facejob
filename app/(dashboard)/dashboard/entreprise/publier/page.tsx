"use client";

import React, { useState, useEffect } from "react";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import ReactQuill from "react-quill"; // Import ReactQuill
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

interface Option {
  id: number;
  name: string;
}

const PublishOffer: React.FC = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [contractType, setContractType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [description, setDescription] = useState("");
  const [secteur, setSecteur] = useState("");
  const [metier, setMetier] = useState("");
  const [secteurOptions, setSecteurOptions] = useState<Option[]>([]);
  const [metierOptions, setMetierOptions] = useState<Option[]>([]);
  const [uploadStatus, setUploadStatus] = useState("idle");

  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [secteurResponse, metierResponse] = await Promise.all([
          fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/secteurs"),
          fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/metiers"),
        ]);

        const secteurData = await secteurResponse.json();
        const metierData = await metierResponse.json();

        setSecteurOptions(secteurData);
        setMetierOptions(metierData);
      } catch (error) {
        console.error("Error fetching options:", error);
        toast.error("Error fetching options!");
      }
    };

    fetchOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
            title,
            location,
            contractType,
            startDate,
            description,
            secteur,
            metier,
          }),
        },
      );

      if (response.ok) {
        toast.success("Offer published successfully!");
        setUploadStatus("completed");
      } else {
        toast.error("Failed to publish offer!");
        setUploadStatus("failed");
      }
    } catch (error) {
      console.error("Error publishing offer:", error);
      toast.error("An error occurred while publishing the offer!");
      setUploadStatus("failed");
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-24 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-medium mb-8 text-center">
          Publier votre offre
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
              value={secteur}
              onChange={(e) => setSecteur(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Sélectionnez le secteur</option>
              {secteurOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
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
              value={metier}
              onChange={(e) => setMetier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Sélectionnez le métier</option>
              {metierOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label
              className="block text-sm font-bold mb-2 text-gray-700"
              htmlFor="description"
            >
              Description du poste
            </label>
            <ReactQuill
              value={description}
              onChange={setDescription}
              className="h-40 mb-6"
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
              {uploadStatus === "uploading" ? "Publishing..." : "Publish Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublishOffer;
