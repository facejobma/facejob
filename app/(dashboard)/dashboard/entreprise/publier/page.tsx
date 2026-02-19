"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { Send } from "lucide-react";
import { fetchSectors, createOffer, fetchLastPayment } from "@/lib/api";
import RichTextEditor from "@/components/RichTextEditor";
import { sanitizeHtml } from "@/lib/sanitize";

interface Sector {
  id: number;
  name: string;
}

export default function PublierPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading">("idle");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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
      setSectors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      toast.error("Erreur lors du chargement des secteurs");
      setSectors([]);
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

    if (formData.titre.trim().length < 5) {
      toast.error("Le titre doit contenir au moins 5 caractères");
      return;
    }

    if (formData.titre.length > 255) {
      toast.error("Le titre ne peut pas dépasser 255 caractères");
      return;
    }

    const plainText = formData.description.replace(/<[^>]*>/g, '');
    if (plainText.length < 50) {
      toast.error("La description doit contenir au moins 50 caractères");
      return;
    }

    if (plainText.length > 10000) {
      toast.error("La description ne peut pas dépasser 10000 caractères");
      return;
    }

    setIsLoading(true);
    setUploadStatus("uploading");

    try {
      const sanitizedDescription = sanitizeHtml(formData.description);
      
      await createOffer({
        ...formData,
        description: sanitizedDescription,
        entreprise_id: companyId,
      });

      setFormData({
        titre: "",
        description: "",
        location: "",
        contractType: "",
        sector_id: "",
        date_debut: "",
        date_fin: "",
      });

      setIsSuccessModalOpen(true);
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
    <div className="max-w-4xl mx-auto">
      {/* Header Simple */}
      <div className="bg-green-50 rounded-lg border-2 border-green-200 p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Send className="text-green-600 w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Publier une offre d'emploi</h1>
            <p className="text-gray-600">Remplissez les informations de votre offre</p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-lg border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Titre de l'offre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              placeholder="Ex: Développeur Full Stack Senior"
              required
              minLength={5}
              maxLength={255}
            />
            {formData.titre && formData.titre.trim().length < 5 && (
              <p className="mt-1 text-sm text-red-600">
                Le titre doit contenir au moins 5 caractères ({formData.titre.trim().length}/5)
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Secteur */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Secteur d'activité <span className="text-red-500">*</span>
              </label>
              <select
                name="sector_id"
                value={formData.sector_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
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

            {/* Type de contrat */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Type de contrat
              </label>
              <select
                name="contractType"
                value={formData.contractType}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              >
                <option value="">Sélectionner un type</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Freelance">Freelance</option>
                <option value="Alternance">Alternance</option>
              </select>
            </div>
          </div>

          {/* Localisation */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Localisation
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              placeholder="Ex: Casablanca, Maroc"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date de début */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Date de début
              </label>
              <input
                type="date"
                name="date_debut"
                value={formData.date_debut}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
            </div>

            {/* Date de fin */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                name="date_fin"
                value={formData.date_fin}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description de l'offre <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <RichTextEditor
                content={formData.description}
                onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                placeholder="Décrivez le poste, les missions, les compétences requises..."
                minHeight="300px"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Minimum 50 caractères • {formData.description.replace(/<[^>]*>/g, '').length} / 10000
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 font-medium rounded-lg transition-colors ${
                isLoading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {uploadStatus === "uploading" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Publication en cours...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publier l'offre</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsSuccessModalOpen(false)}></div>
          <div className="bg-white p-8 rounded-xl shadow-lg z-10 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Offre publiée avec succès!
              </h2>
              <p className="text-gray-600">
                Votre offre d'emploi a été publiée et est maintenant visible par les candidats.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  window.location.href = "/dashboard/entreprise/offres";
                }}
                className="flex-1 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voir mes offres
              </button>
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="flex-1 px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Créer une autre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsUpgradeModalOpen(false)}></div>
          <div className="bg-white p-8 rounded-xl shadow-lg z-10 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Limite atteinte
              </h2>
              <p className="text-gray-600">
                Vous avez atteint la limite de votre plan. Mettez à niveau pour publier plus d'offres.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="flex-1 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => window.location.href = "/dashboard/entreprise/services"}
                className="flex-1 px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
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
