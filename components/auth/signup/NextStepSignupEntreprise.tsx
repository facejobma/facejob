"use client"
import {useState, useEffect, FC, ChangeEvent} from "react";
import {useRouter} from "next/navigation";
import {toast} from "react-hot-toast";
import {FaGlobe, FaLinkedin} from "react-icons/fa";
import Image from "next/image";
import { UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";

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
                const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/sectors");
                const result = await response.json();
                
                // Check if the response has the expected structure
                if (result.success && Array.isArray(result.data)) {
                    setSecteurOptions(result.data);
                } else {
                    // Fallback: if data is directly an array
                    setSecteurOptions(Array.isArray(result) ? result : []);
                }
            } catch (error) {
                console.error("Error fetching sectors:", error);
                setSecteurOptions([]); // Set empty array on error
                toast.error("Erreur de récupération des secteurs!");
            }
        };

        fetchSectors().then(() => {
            console.log('sectors fetched');
        });
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
            const formData = {
                user_id: Number(sessionStorage.getItem("userId")) || "",
                bio:bio?bio:"",
                secteur: Number(secteur),
                image:logoUrl,
                adresse,
                effectif,
                siteWeb,
                linkedin,
            };

            const response = await fetch(
                process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/complete-enterprise",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (response.ok) {
                toast.success("Votre compte s'est terminé avec succès!");
                router.push("/auth/login-enterprise");
                sessionStorage.clear();
            } else {
                toast.error("Erreur lors de la soumission du formulaire!");
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
            toast.success("Logo uploadé avec succès!");
        } else if (res && res[0] && res[0].fileUrl) {
            setLogoUrl(res[0].fileUrl);
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
    const handleRemoveLogo = () => {
        setLogoUrl("");
        setIsUploading(false);
    };

    return (
        <div className="flex flex-col items-center font-default rounded-lg border border-newColor p-4">
            <h2 className="text-3xl font-semibold text-second my-2 py-4 mb-4">
                Informations complémentaires (optionnel)
            </h2>

            <div className="w-96 mb-4">
                <textarea
                    placeholder="Décrire votre entreprise (secteur, environnement)..."
                    value={bio}
                    onChange={handleBioChange}
                    maxLength={maxLength}
                    className="px-4 py-2 rounded border border-gray w-full h-32 text-secondary resize-none"
                />
                <p className="text-gray-500 text-sm mt-1 text-end">
                    {remainingCharacters} caractère{remainingCharacters !== 1 ? "s" : ""}{" "}
                    restant{remainingCharacters !== 1 ? "s" : ""}
                </p>
            </div>

            <div className="w-96 mb-4">
                <select
                required
                    value={secteur}
                    onChange={(e) => setSecteur(e.target.value)}
                    className="px-4 py-2 text-secondary rounded border border-gray w-full appearance-none bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                    <option value="" disabled>
                        Sélectionnez Secteur.
                    </option>
                    {Array.isArray(secteurOptions) && secteurOptions.map((option, index) => (
                        <option key={index} value={option.id}>
                            {option.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="w-96 mb-4">
                {logoUrl ? (
                    <div className="mb-4 flex justify-center items-center flex-col">
                        <p className="text-primary mb-2">Logo uploadé:</p>
                        <Image
                            src={logoUrl}
                            alt="Company Logo"
                            className="rounded-lg max-w-full h-auto"
                            width={100}
                            height={100}
                        />
                        <button
                            onClick={handleRemoveLogo}
                            className="mt-2 text-red-500 text-sm underline hover:text-red-700"
                            disabled={isUploading}
                        >
                            Changer le logo
                        </button>
                    </div>
                ) : (
                    <div className="border border-gray p-4 rounded">
                        <p className="text-secondary mb-4 text-center">
                            {isUploading ? "Upload en cours..." : "Glissez et déposez le logo de votre entreprise"}
                        </p>
                        {!isUploading ? (
                            <UploadDropzone<OurFileRouter, "imageUpload">
                                endpoint="imageUpload"
                                input={{
                                    profileUpdate: false,
                                    companyLogo: true
                                }}
                                onClientUploadComplete={handleUploadComplete}
                                onUploadError={handleUploadError}
                                onUploadBegin={handleUploadBegin}
                                className="border-2 border-dashed rounded-md p-3 text-center cursor-pointer transition-colors border-gray-300 hover:border-primary"
                                appearance={{
                                    button: "bg-primary hover:bg-primary-dark",
                                    allowedContent: "text-gray-600",
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                                <p className="text-primary text-sm">Upload en cours...</p>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div className="bg-primary h-2 rounded-full animate-pulse w-3/4"></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="w-96 mb-4">
                <input
                    type="text"
                    placeholder="Adresse"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    className="px-4 py-2 rounded border border-gray w-full text-secondary"
                />
            </div>

            <div className="w-96 mb-4">
                <input
                    type="number"
                    placeholder="Nombre d'employés"
                    value={effectif}
                    onChange={(e) => setEffectif(e.target.value)}
                    className="px-4 py-2 rounded border border-gray w-full text-secondary"
                />
            </div>

            <div className="w-96 mb-4 flex items-center border border-gray rounded px-4 py-2">
                <FaGlobe className="mr-2 text-gray-500"/>
                <input
                    type="text"
                    placeholder="URL du site Web"
                    value={siteWeb}
                    onChange={(e) => setSitWeb(e.target.value)}
                    className="flex-grow outline-none text-secondary"
                />
            </div>

            <div className="w-96 mb-4 flex items-center border border-gray rounded px-4 py-2">
                <FaLinkedin className="mr-2 text-gray-500"/>
                <input
                    type="text"
                    placeholder="URL du profil LinkedIn"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="flex-grow outline-none text-secondary"
                />
            </div>

            <div className="w-96 mb-1 flex rounded px-4 py-2">
                <button
                    onClick={() => {
                        onSkip();
                        sessionStorage.clear();
                        router.push("/auth/login-enterprise");
                    }}
                    disabled={isUploading}
                    className={`py-2 px-10 rounded-full font-medium text-base text-white w-full ${
                        isUploading 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-gray-400 hover:bg-gray-500'
                    }`}
                >
                    Ignorer
                </button>
            </div>
            <div className="w-96 flex rounded px-4 py-2">
                <button
                    onClick={handleSubmit}
                    disabled={isUploading}
                    className={`py-2 px-10 rounded-full font-medium text-base text-white w-full transition-colors ${
                        isUploading 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-primary hover:bg-primary-dark'
                    }`}
                >
                    {isUploading ? 'Upload en cours...' : 'Soumettre'}
                </button>
            </div>
        </div>
    );
};

export default NextStepSignupEntreprise;