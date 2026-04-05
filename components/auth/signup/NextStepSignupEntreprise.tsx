"use client"
import { useState, useEffect, FC, ChangeEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FaGlobe, FaLinkedin } from "react-icons/fa";
import Image from "next/image";
import { Building2, MapPin, Users, Globe, Linkedin, Camera, Upload, X } from "lucide-react";

interface SecteurOptions {
    id: number;
    name: string;
}

interface NextStepSignupEntrepriseProps {
    onSkip: () => void;
}

const NextStepSignupEntreprise: FC<NextStepSignupEntrepriseProps> = ({ onSkip }) => {
    const [bio, setBio] = useState("");
    const [secteur, setSecteur] = useState("");
    const [adresse, setAdresse] = useState("");
    const [effectif, setEffectif] = useState("");
    const [siteWeb, setSitWeb] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [secteurOptions, setSecteurOptions] = useState<SecteurOptions[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const maxLength = 250;
    const router = useRouter();

    const handleBioChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= maxLength) setBio(e.target.value);
    };

    const remainingCharacters = maxLength - bio.length;

    useEffect(() => {
        const fetchSectors = async () => {
            try {
                const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/sectors", {
                    headers: { "Content-Type": "application/json" },
                });
                if (response.ok) {
                    const data = await response.json();
                    const sectorsData = Array.isArray(data) ? data : (data.data || []);
                    setSecteurOptions(sectorsData);
                } else {
                    setSecteurOptions([]);
                }
            } catch {
                setSecteurOptions([]);
                toast.error("Erreur de récupération des secteurs!");
            }
        };
        fetchSectors();
    }, []);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Veuillez sélectionner une image valide.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("L'image ne doit pas dépasser 5 Mo.");
            return;
        }
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!bio.trim()) { toast.error("Veuillez décrire votre entreprise"); return; }
        if (!secteur) { toast.error("Veuillez sélectionner un secteur"); return; }
        if (!logoFile) { toast.error("Veuillez uploader le logo de votre entreprise"); return; }

        setIsSubmitting(true);
        try {
            const token = sessionStorage.getItem("authToken") || "";
            const userId = sessionStorage.getItem("userId") || "";

            const formData = new FormData();
            formData.append("user_id", userId);
            formData.append("bio", bio);
            formData.append("secteur", secteur);
            formData.append("adresse", adresse);
            formData.append("effectif", effectif);
            formData.append("siteWeb", siteWeb);
            formData.append("linkedin", linkedin);
            formData.append("image", logoFile);

            const res = await fetch(
                process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/complete-enterprise",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "ngrok-skip-browser-warning": "true",
                    },
                    body: formData,
                }
            );

            const result = await res.json();

            if (res.ok && result.status !== "error") {
                toast.success("Votre profil a été complété avec succès!");
                sessionStorage.clear();
                router.push("/auth/login-enterprise");
            } else {
                toast.error(result.message || "Erreur lors de la mise à jour du profil.");
            }
        } catch {
            toast.error("Erreur de mise à jour de l'utilisateur!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-secondary mb-2">Complétez votre profil entreprise</h1>
                <p className="text-third">Ajoutez les détails de votre entreprise pour attirer les meilleurs talents</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Logo Section */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-center">
                    <div className="relative inline-block">
                        {logoPreview ? (
                            <div className="relative">
                                <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg bg-white p-2">
                                    <Image src={logoPreview} alt="Logo" width={120} height={120} className="w-full h-full object-contain" />
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                                >
                                    <Camera className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        ) : (
                            <div className="w-32 h-32 rounded-xl bg-white/20 border-4 border-white/30 flex items-center justify-center">
                                <Building2 className="w-16 h-16 text-white/60" />
                            </div>
                        )}
                    </div>
                    <h2 className="text-xl font-semibold text-white mt-4">Logo de l'entreprise</h2>
                    <p className="text-white/80 text-sm">Ajoutez le logo de votre entreprise</p>
                </div>

                {/* File Upload Zone */}
                <div className="p-6 border-b border-gray-100">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    {!logoPreview ? (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center gap-3 hover:border-green-600 hover:bg-green-50 transition-colors"
                        >
                            <Upload className="w-8 h-8 text-gray-400" />
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-700">Cliquez pour choisir un logo</p>
                                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — max 5 Mo</p>
                            </div>
                        </button>
                    ) : (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            <Camera className="w-4 h-4" /> Changer le logo
                        </button>
                    )}
                </div>

                {/* Form Fields */}
                <div className="p-6 space-y-6">
                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Building2 className="w-4 h-4 inline mr-2" />Description de l'entreprise *
                        </label>
                        <textarea
                            placeholder="Décrivez votre entreprise, son secteur d'activité, sa culture et ses valeurs..."
                            value={bio} onChange={handleBioChange} maxLength={maxLength} rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                        />
                        <p className="text-gray-500 text-sm mt-2 text-right">{remainingCharacters} caractère{remainingCharacters !== 1 ? "s" : ""} restant{remainingCharacters !== 1 ? "s" : ""}</p>
                    </div>

                    {/* Sector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 inline mr-2" />Secteur d'activité *
                        </label>
                        <select value={secteur} onChange={(e) => setSecteur(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors appearance-none bg-white">
                            <option value="" disabled>Sélectionnez le secteur de votre entreprise</option>
                            {secteurOptions.map((option, index) => (
                                <option key={index} value={option.id}>{option.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin className="w-4 h-4 inline mr-2" />Adresse
                            </label>
                            <input type="text" placeholder="Adresse de votre entreprise" value={adresse}
                                onChange={(e) => setAdresse(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Users className="w-4 h-4 inline mr-2" />Nombre d'employés
                            </label>
                            <input type="number" placeholder="Effectif de l'entreprise" value={effectif} min="1"
                                onChange={(e) => setEffectif(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors" />
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Globe className="w-4 h-4 inline mr-2" />Site web
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaGlobe className="h-5 w-5 text-gray-400" />
                                </div>
                                <input type="url" placeholder="https://www.votre-entreprise.com" value={siteWeb}
                                    onChange={(e) => setSitWeb(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Linkedin className="w-4 h-4 inline mr-2" />LinkedIn
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLinkedin className="h-5 w-5 text-gray-400" />
                                </div>
                                <input type="url" placeholder="https://linkedin.com/company/votre-entreprise" value={linkedin}
                                    onChange={(e) => setLinkedin(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => { onSkip(); sessionStorage.clear(); router.push("/auth/login-enterprise"); }}
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Ignorer pour le moment
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-6 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    Traitement...
                                </div>
                            ) : "Terminer mon profil"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NextStepSignupEntreprise;
