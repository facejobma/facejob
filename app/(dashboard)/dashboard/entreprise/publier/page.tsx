"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { Send, Briefcase, MapPin, Calendar, FileText, Building2, Clock, CheckCircle2 } from "lucide-react";
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

    // Validate description length
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
      // Sanitize description before sending
      const sanitizedDescription = sanitizeHtml(formData.description);
      
      await createOffer({
        ...formData,
        description: sanitizedDescription,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
            Publier une nouvelle offre
          </h1>
          <p className="text-gray-600 text-lg">
            Attirez les meilleurs talents avec une offre d'emploi attractive
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Progress Steps */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-white">
                  <p className="text-sm font-medium opacity-90">Étape 1</p>
                  <p className="font-semibold">Informations</p>
                </div>
              </div>
              <div className="h-0.5 flex-1 bg-white/30 mx-4"></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div className="text-white">
                  <p className="text-sm font-medium opacity-90">Étape 2</p>
                  <p className="font-semibold">Publication</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Section: Informations principales */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Informations principales</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Titre */}
                <div className="lg:col-span-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <Briefcase className="w-4 h-4 text-green-600" />
                    <span>Titre de l'offre</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="titre"
                    value={formData.titre}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="Ex: Développeur Full Stack Senior"
                    required
                  />
                </div>

                {/* Secteur */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <Building2 className="w-4 h-4 text-green-600" />
                    <span>Secteur d'activité</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="sector_id"
                    value={formData.sector_id}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200 text-gray-900"
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
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span>Type de contrat</span>
                  </label>
                  <select
                    name="contractType"
                    value={formData.contractType}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200 text-gray-900"
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="CDI">CDI - Contrat à Durée Indéterminée</option>
                    <option value="CDD">CDD - Contrat à Durée Déterminée</option>
                    <option value="Stage">Stage</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Alternance">Alternance</option>
                  </select>
                </div>

                {/* Localisation */}
                <div className="lg:col-span-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span>Localisation</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="Ex: Casablanca, Maroc"
                  />
                </div>
              </div>
            </div>

            {/* Section: Dates */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Période de validité</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Date de début */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Date de début</span>
                  </label>
                  <input
                    type="date"
                    name="date_debut"
                    value={formData.date_debut}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-900"
                  />
                </div>

                {/* Date de fin */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Date de fin</span>
                  </label>
                  <input
                    type="date"
                    name="date_fin"
                    value={formData.date_fin}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Section: Description */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800">Description détaillée</h2>
                  <p className="text-sm text-gray-500 mt-1">Décrivez le poste, les responsabilités et les compétences requises</p>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <span>Contenu de l'offre</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all duration-200">
                  <RichTextEditor
                    content={formData.description}
                    onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                    placeholder="Décrivez le poste en détail : missions, responsabilités, compétences requises, avantages..."
                    minHeight="350px"
                  />
                </div>
                <div className="flex items-center justify-between mt-2 px-1">
                  <p className="text-xs text-gray-500">
                    Minimum 50 caractères, maximum 10000 caractères
                  </p>
                  <p className="text-xs text-gray-400">
                    {formData.description.replace(/<[^>]*>/g, '').length} / 10000
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="w-full sm:w-auto px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 border-2 border-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full sm:w-auto group relative px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 hover:shadow-2xl"
                  } text-white focus:outline-none focus:ring-4 focus:ring-green-300`}
                >
                  <div className="flex items-center justify-center space-x-3">
                    {uploadStatus === "uploading" ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Publication en cours...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" />
                        <span>Publier l'offre</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Conseils pour une offre attractive</span>
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Utilisez un titre clair et précis qui décrit le poste</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Détaillez les missions principales et les responsabilités</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Mentionnez les compétences techniques et soft skills requises</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Indiquez les avantages et la culture d'entreprise</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Upgrade Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsUpgradeModalOpen(false)}></div>
          <div className="bg-white p-8 rounded-2xl shadow-2xl z-10 max-w-md w-full animate-in fade-in zoom-in duration-200">
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
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
              >
                Annuler
              </button>
              <button
                onClick={() => window.location.href = "/dashboard/entreprise/services"}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
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
