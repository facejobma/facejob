"use client";

import Cookies from "js-cookie";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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

const BENEFIT_OPTIONS = ["Assurance santé", "Formation", "Télétravail", "Horaires flexibles", "Primes", "Transport", "Tickets restaurant", "Mutuelle"];

const PublishOffer: React.FC = () => {
  //get the param from the url
  const { offreId } = useParams();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [contractType, setContractType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [experienceRequired, setExperienceRequired] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [currency, setCurrency] = useState("MAD");
  const [benefits, setBenefits] = useState<string[]>([]);
  const [requiredLanguages, setRequiredLanguages] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [uploadStatus, setUploadStatus] = useState("idle");

  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const userData =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user")
      : null;

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await fetch(
          `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/sectors`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch sectors");
        }
        const result = await response.json();
        // Extract data from wrapped response
        const data = result.data || result;
        setSectors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching sectors:", error);
        toast.error("Error fetching sectors!");
        setSectors([]); // Set empty array on error
      }
    };

    fetchSectors();
  }, []);

  useEffect(() => {
    if (offreId) {
      const fetchOffer = async () => {
        try {
          const response = await fetch(
            `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/offres_by_id/${offreId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            },
          );
          if (!response.ok) {
            throw new Error("Failed to fetch offer");
          }
          const payload = await response.json();
          const data = payload.data ?? payload;
          setTitle(data.titre || "");
          setLocation(data.location || "");
          setContractType(data.contractType || "");
          setStartDate(data.date_debut?.split("T")[0] || "");
          setEndDate(data.date_fin?.split("T")[0] || "");
          setDescription(data.description || "");
          setSelectedSector(data.sector_id ? data.sector_id.toString() : "");
          setSelectedJob(data.job_id ? data.job_id.toString() : "");
          setExperienceRequired(data.experience_required?.toString() || "");
          setSalaryMin(data.salary_min?.toString() || "");
          setSalaryMax(data.salary_max?.toString() || "");
          setCurrency(data.currency || "MAD");
          setBenefits(Array.isArray(data.benefits) ? data.benefits : []);
          setRequiredLanguages(Array.isArray(data.required_languages) ? data.required_languages.join(", ") : "");
          setRequiredSkills(Array.isArray(data.required_skills) ? data.required_skills.join(", ") : "");
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
    sectors.find((sector) => sector.id === parseInt(selectedSector))?.jobs ||
    [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim() || !location.trim() || !contractType || !startDate || !selectedSector) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (endDate && endDate <= startDate) {
      toast.error("La date de fin doit être postérieure à la date de début.");
      return;
    }
    if (salaryMin && salaryMax && Number(salaryMax) < Number(salaryMin)) {
      toast.error("Le salaire maximum doit être supérieur ou égal au salaire minimum.");
      return;
    }

    setUploadStatus("uploading");

    try {
      if (userData) {
        const response = await fetch(
          `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/update_offre/${offreId}`,
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
              date_fin: endDate || null,
              description,
              sector_id: selectedSector,
              job_id: selectedJob || null,
              experience_required: experienceRequired === "" ? null : Number(experienceRequired),
              salary_min: salaryMin === "" ? null : Number(salaryMin),
              salary_max: salaryMax === "" ? null : Number(salaryMax),
              currency,
              benefits,
              required_languages: requiredLanguages.split(",").map((item) => item.trim()).filter(Boolean),
              required_skills: requiredSkills.split(",").map((item) => item.trim()).filter(Boolean),
            }),
          },
        );

        if (response.ok) {
          const payload = await response.json().catch(() => null);
          toast.success(payload?.message || "Offre mise à jour avec succès.");
          setUploadStatus("completed");
        } else {
          const errorData = await response.json().catch(() => null);
          const validationMessage = errorData?.errors
            ? Object.values(errorData.errors).flat().join(" ")
            : errorData?.message;
          toast.error(validationMessage || "Impossible de mettre à jour l’offre.");
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
              maxLength={200}
              required
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
              required
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
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Sélectionnez le type de contrat</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Stage">Stage</option>
              <option value="Freelance">Freelance</option>
              <option value="Alternance">Alternance</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2 text-gray-700" htmlFor="endDate">Date de fin</label>
            <input type="date" id="endDate" value={endDate} min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
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
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Sélectionnez la date de début"
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
              required
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
              Métier de référence <span className="font-normal text-gray-500">(facultatif)</span>
            </label>
            <select
              id="metier"
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={!selectedSector}
            >
              <option value="">Autre métier / non répertorié</option>
              {filteredJobs.map((job) => (
                <option key={job.id} value={job.id.toString()}>
                  {job.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-gray-500">
              Si aucun métier ne correspond, le matching utilisera les autres critères de l’offre.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Expérience (années)</label>
              <input type="number" min="0" max="50" value={experienceRequired} onChange={(e) => setExperienceRequired(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Salaire minimum</label>
              <input type="number" min="0" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Salaire maximum</label>
              <input type="number" min="0" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Devise</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="MAD">MAD</option><option value="EUR">EUR</option><option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Langues requises</label>
              <input value={requiredLanguages} onChange={(e) => setRequiredLanguages(e.target.value)} placeholder="Français, Arabe, Anglais"
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Compétences requises</label>
              <input value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)} placeholder="React, Laravel, Communication"
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2 text-gray-700">Avantages</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {BENEFIT_OPTIONS.map((benefit) => (
                <label key={benefit} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                  <input type="checkbox" checked={benefits.includes(benefit)} onChange={() => setBenefits((current) =>
                    current.includes(benefit) ? current.filter((item) => item !== benefit) : [...current, benefit])} />
                  {benefit}
                </label>
              ))}
            </div>
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
