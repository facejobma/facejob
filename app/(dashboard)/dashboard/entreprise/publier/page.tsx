"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { Send } from "lucide-react";
import { fetchSectors, createOffer, fetchLastPayment } from "@/lib/api";

interface Sector {
  id: number;
  name: string;
}

export default function PublierPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading">("idle");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    location: "",
    contractType: "",
    sector_id: "",
    date_debut: "",
    date_fin: "",
  });

  const company = typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
  const companyId = company ? JSON.parse(company).id : null;
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  useEffect(() => {
    fetchSectorsData();
    checkPaymentStatus();
  }, []);

  const fetchSectorsData = async () => {
    try {
      const data = await fetchSectors();
      // Ensure data is an array
      setSectors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      toast.error("Erreur lors du chargement des secteurs");
      setSectors([]); // Set empty array on error
    }
  };

  const checkPaymentStatus = async () => {
    if (!companyId || !authToken) return;

    try {
      await fetchLastPayment(companyId);
    } catch (error) {
      console.error("Error checking payment status:", error);
      setIsUpgradeModalOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titre || !formData.description || !formData.sector_id) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    setUploadStatus("uploading");

    try {
      await createOffer({
        ...formData,
        entreprise_id: companyId,
      });

      toast.success("Offre publiée avec succès!");
      setFormData({
        titre: "",
        description: "",
        location: "",
        contractType: "",
        sector_id: "",
        date_debut: "",
        date_fin: "",
      });
    } catch (error) {
      console.error("Error creating offer:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la publication de l'offre");
    } finally {
      setIsLoading(false);
      setUploadStatus("idle");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Publier une nouvelle offre</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de l'offre *
                </label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Développeur Full Stack"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secteur *
                </label>
                <select
                  name="sector_id"
                  value={formData.sector_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un secteur</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Casablanca, Maroc"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de contrat
                </label>
                <select
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un type</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Stage">Stage</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  name="date_debut"
                  value={formData.date_debut}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  name="date_fin"
                  value={formData.date_fin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description de l'offre *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Décrivez le poste, les responsabilités, les compétences requises..."
                required
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 hover:shadow-xl"
                } text-white focus:outline-none focus:ring-4 focus:ring-green-300`}
              >
                <div className="flex items-center space-x-3">
                  {uploadStatus === "uploading" ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Publication en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6" />
                      <span>Publier l'offre</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-8 rounded-lg shadow-lg z-10">
            <h2 className="text-xl font-semibold mb-8">
              Vous avez atteint la limite de votre plan, veuillez souscrire à nouveau.
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Mettre à niveau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}