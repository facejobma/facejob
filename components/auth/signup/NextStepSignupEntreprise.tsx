"use client"
import {useState, useEffect, FC, ChangeEvent} from "react";
import {useRouter} from "next/navigation";
import {toast} from "react-hot-toast";
import {FaGlobe, FaLinkedin} from "react-icons/fa";
import Image from "next/image";
import Cookies from "js-cookie";
import { UploadDropzone } from "@/lib/uploadthing";
import { apiRequest, handleApiError } from "@/lib/apiUtils";
import { Building2, MapPin, Users, Globe, Linkedin, Camera, Upload, X } from "lucide-react";

interface SecteurOptions {
    id: number;
    name: string;
}

interface NextStepSignupEntrepriseProps {
    onSkip: () => void;
}

const NextStepSignupEntreprise: FC<NextStepSignupEntrepriseProps> = ({
                                                                         onSkip,
                                                                     }) => {
    const [bio, setBio] = useState("");
    const [secteur, setSecteur] = useState("");
    const [adresse, setAdresse] = useState("");
    const [effectif, setEffectif] = useState("");
    const [siteWeb, setSitWeb] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [logoUrl, setLogoUrl] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [secteurOptions, setSecteurOptions] = useState<SecteurOptions[]>([]);
    const [showUploadZone, setShowUploadZone] = useState(false);
    const maxLength = 250;

    const router = useRouter();

    const handleBioChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const inputValue = e.target.value;
        if (inputValue.length <= maxLength) {
            setBio(inputValue);
        }
    };

    const remainingCharacters = maxLength - bio.length;

    useEffect(() => {
        const fetchSectors = async () => {
            try {
                const response = await fetch(
                    process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/sectors",
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    // Handle both direct array and wrapped response
                    const sectorsData = Array.isArray(data) ? data : (data.data || []);
                    setSecteurOptions(sectorsData);
                } else {
                    console.error("Error fetching sectors:", response.statusText);
                    setSecteurOptions([]);
                    toast.error("Erreur de récupération des secteurs!");
                }
            } catch (error) {
                console.error("Error fetching sectors:", error);
                setSecteurOptions([]);
                toast.error("Erreur de récupération des secteurs!");
            }
        };

        fetchSectors();
    }, []);

    const handleSubmit = async () => {
        // Empêcher la soumission si un upload est en cours
        if (isUploading) {
            toast.error("Veuillez attendre que l'upload du logo soit terminé");
            return;
        }

        // Validation des trois premières informations
        if (!bio.trim()) {
            toast.error("Veuillez décrire votre entreprise");
            return;
        }

        if (!secteur) {
            toast.error("Veuillez sélectionner un secteur");
            return;
        }

        if (!logoUrl) {
            toast.error("Veuillez uploader le logo de votre entreprise");
            return;
        }
        
        try {
            // Debug: Check stored values
            const storedToken = sessionStorage.getItem('authToken');
            const storedUserId = sessionStorage.getItem('userId');
            console.log('Profile Completion Debug:', {
                hasToken: !!storedToken,
                tokenPreview: storedToken ? `${storedToken.substring(0, 20)}...` : 'none',
                userId: storedUserId
            });
            
            const formData = {
                user_id: Number(sessionStorage.getItem("userId")) || "",
                bio: bio ? bio : "",
                secteur: Number(secteur),
                image: logoUrl,
                adresse,
                effectif,
                siteWeb,
                linkedin,
            };

            const result = await apiRequest(
                process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/complete-enterprise",
                {
                    method: "PUT",
                    body: JSON.stringify(formData),
                }
            );

            if (result.success) {
                toast.success("Votre compte s'est terminé avec succès!");
                router.push("/auth/login-enterprise");
                sessionStorage.clear();
            } else {
                // Backend will return appropriate error message
                handleApiError(result, toast);
            }
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("Erreur de mise à jour de l'utilisateur!");
        }
    };

    // Fonction appelée dès que l'upload commence (drag & drop)
    const handleUploadBegin = () => {
        setIsUploading(true);
        toast.loading("Upload du logo en cours...", { id: "upload-toast" });
    };

    // Fonction appelée quand l'upload est terminé avec succès
    const handleUploadComplete = (res: any) => {
        setIsUploading(false);
        toast.dismiss("upload-toast");
        
        if (res && res[0] && res[0].url) {
            setLogoUrl(res[0].url);
            setShowUploadZone(false);
            toast.success("Logo uploadé avec succès!");
        } else if (res && res[0] && res[0].fileUrl) {
            setLogoUrl(res[0].fileUrl);
            setShowUploadZone(false);
            toast.success("Logo uploadé avec succès!");
        } else {
            toast.error("Erreur: URL du logo non trouvée");
        }
    };
    
    // Fonction appelée en cas d'erreur d'upload
    const handleUploadError = (error: Error) => {
        setIsUploading(false);
        toast.dismiss("upload-toast");
        toast.error(`Erreur d'upload du logo: ${error.message}`);
    };

    // Fonction pour supprimer le logo et permettre un nouvel upload
    const handleChangeLogo = () => {
        setLogoUrl("");
        setShowUploadZone(true);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-secondary mb-2">
                    Complétez votre profil entreprise
                </h1>
                <p className="text-third">
                    Ajoutez les détails de votre entreprise pour attirer les meilleurs talents
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Company Logo Section */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-center">
                    <div className="relative inline-block">
                        {logoUrl ? (
                            <div className="relative">
                                <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg bg-white p-2">
                                    <Image
                                        src={logoUrl}
                                        alt="Logo de l'entreprise"
                                        width={120}
                                        height={120}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <button
                                    onClick={handleChangeLogo}
                                    disabled={isUploading}
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
                    <h2 className="text-xl font-semibold text-white mt-4">
                        Logo de l'entreprise
                    </h2>
                    <p className="text-white/80 text-sm">
                        Ajoutez le logo de votre entreprise
                    </p>
                </div>

                {/* Upload Zone */}
                {(!logoUrl || showUploadZone) && (
                    <div className="p-6 border-b border-gray-100">
                        <div className="bg-gray-50 rounded-lg p-6">
                            {isUploading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                                    <p className="text-green-600 font-medium">Upload du logo en cours...</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-4 max-w-xs mx-auto">
                                        <div className="bg-green-600 h-2 rounded-full animate-pulse w-3/4"></div>
                                    </div>
                                </div>
                            ) : (
                                <UploadDropzone
                                    endpoint="imageUpload"
                                    input={{
                                        profileUpdate: false,
                                        companyLogo: true
                                    }}
                                    onClientUploadComplete={handleUploadComplete}
                                    onUploadError={handleUploadError}
                                    onUploadBegin={handleUploadBegin}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-600 transition-colors"
                                    appearance={{
                                        button: "bg-green-600 hover:bg-green-700 text-white",
                                        allowedContent: "text-gray-600",
                                        label: "text-green-600 font-medium"
                                    }}
                                />
                            )}
                            {showUploadZone && logoUrl && (
                                <button
                                    onClick={() => setShowUploadZone(false)}
                                    className="mt-4 flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Annuler
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Form Fields */}
                <div className="p-6 space-y-6">
                    {/* Company Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Building2 className="w-4 h-4 inline mr-2" />
                            Description de l'entreprise *
                        </label>
                        <textarea
                            placeholder="Décrivez votre entreprise, son secteur d'activité, sa culture et ses valeurs..."
                            value={bio}
                            onChange={handleBioChange}
                            maxLength={maxLength}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                            rows={4}
                        />
                        <p className="text-gray-500 text-sm mt-2 text-right">
                            {remainingCharacters} caractère{remainingCharacters !== 1 ? "s" : ""} restant{remainingCharacters !== 1 ? "s" : ""}
                        </p>
                    </div>

                    {/* Sector Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 inline mr-2" />
                            Secteur d'activité *
                        </label>
                        <select
                            required
                            value={secteur}
                            onChange={(e) => setSecteur(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors appearance-none bg-white"
                        >
                            <option value="" disabled>
                                Sélectionnez le secteur de votre entreprise
                            </option>
                            {Array.isArray(secteurOptions) && secteurOptions.map((option, index) => (
                                <option key={index} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Company Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin className="w-4 h-4 inline mr-2" />
                                Adresse
                            </label>
                            <input
                                type="text"
                                placeholder="Adresse de votre entreprise"
                                value={adresse}
                                onChange={(e) => setAdresse(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Users className="w-4 h-4 inline mr-2" />
                                Nombre d'employés
                            </label>
                            <input
                                type="number"
                                placeholder="Effectif de l'entreprise"
                                value={effectif}
                                onChange={(e) => setEffectif(e.target.value)}
                                min="1"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                            />
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Globe className="w-4 h-4 inline mr-2" />
                                Site web
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaGlobe className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="url"
                                    placeholder="https://www.votre-entreprise.com"
                                    value={siteWeb}
                                    onChange={(e) => setSitWeb(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Linkedin className="w-4 h-4 inline mr-2" />
                                LinkedIn
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLinkedin className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="url"
                                    placeholder="https://linkedin.com/company/votre-entreprise"
                                    value={linkedin}
                                    onChange={(e) => setLinkedin(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => {
                                onSkip();
                                sessionStorage.clear();
                                router.push("/auth/login-enterprise");
                            }}
                            disabled={isUploading}
                            className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Ignorer pour le moment
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isUploading}
                            className="flex-1 py-3 px-6 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isUploading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Traitement...
                                </div>
                            ) : (
                                "Terminer mon profil"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NextStepSignupEntreprise;