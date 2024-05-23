"use client"
import {useState, useEffect, FC, ChangeEvent} from "react";
import {useDropzone} from "react-dropzone";
import {useRouter} from "next/navigation";
import {toast} from "react-hot-toast";
import {FaGlobe, FaLinkedin} from "react-icons/fa";

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
    const [image, setImage] = useState<File | null>(null);
    const [secteurOptions, setSecteurOptions] = useState<SecteurOptions[]>([]);
    const maxLength = 250;

    const router = useRouter();

    const {getRootProps, getInputProps} = useDropzone({
        onDrop: (acceptedFiles: File[]) => {
            setImage(acceptedFiles[0]);
        },
    });

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
                const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/sectors");
                const data = await response.json();
                setSecteurOptions(data);
            } catch (error) {
                console.error("Error fetching sectors:", error);
                toast.error("Erreur de récupération des secteurs!");
            }
        };

        fetchSectors().then(() => {
            console.log('sectors fetched');
        });
    }, []);

    const handleSubmit = async () => {
        try {
            const formData = {
                user_id: Number(sessionStorage.getItem("userId")) || "",
                bio,
                secteur,
                image,
                adresse,
                effectif,
                siteWeb,
                linkedin,
            };

            const response = await fetch(
                process.env.NEXT_PUBLIC_BACKEND_URL + "/api/complete-enterprise",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (response.ok) {
                // const responseData = await response.json();
                toast.success("Votre compte s’est terminé avec succès!");

                router.push("/auth/login-enterprise");
                sessionStorage.clear();
            } else {
            }
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("Erreur de mise à jour de l’utilisateur!");
        }
    };

    return (
        <div className="flex flex-col items-center font-default rounded-lg border border-newColor p-4">
            <h2 className="text-3xl font-semibold text-second my-2 py-4 mb-4">
                Information supplémentaire (Optionnel)
            </h2>

            <div className="w-96 mb-4">
        <textarea
            placeholder="décrire votre entreprise (secteur, environnement)..."
            value={bio}
            onChange={handleBioChange}
            maxLength={maxLength}
            className="px-4 py-2 rounded border border-gray w-full h-32 text-secondary resize-none"
        />
                <p className="text-gray-500 text-sm mt-1 text-end">
                    {remainingCharacters} character{remainingCharacters !== 1 ? "s" : ""}{" "}
                    Restant
                </p>
            </div>

            <div className="w-96 mb-4">
                <select
                    value={secteur}
                    onChange={(e) => setSecteur(e.target.value)}
                    className="px-4 py-2 text-secondary rounded border border-gray w-full appearance-none bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                    <option value="" disabled>
                        Sélectionnez Secteur.
                    </option>
                    {secteurOptions.map((option, index) => (
                        <option key={index} value={option.name}>
                            {option.name}
                        </option>
                    ))}
                </select>
            </div>

            <div
                {...getRootProps()}
                className="w-96 mb-4 border border-gray p-4 rounded"
            >
                <input {...getInputProps()} />
                <p className="text-secondary">Faites glisser un logo ici ou cliquez pour sélectionner un logo
                </p>
                {image && (
                    <div className="mt-5 flex justify-center items-center flex-col ">
                        <p className="text-primary mb-1">Logo sélectionné:</p>
                        <img
                            src={URL.createObjectURL(image)}
                            alt="Selected Image"
                            className="rounded-lg max-w-full h-auto"
                        />
                    </div>
                )}
            </div>

            <div className="w-96 mb-4">
                <input
                    type="text"
                    placeholder="Address"
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
                    className="px-4 py-2 rounded border border-gray w-96 mb-4 text-secondary"
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

            <div className="w-96 mb-1 flexrounded px-4 py-2">
                <button
                    onClick={() => {
                        onSkip();
                        sessionStorage.clear();
                        router.push("/auth/login-enterprise");
                    }}
                    className="py-2 px-10 rounded-full font-medium text-base text-white bg-gray-400 w-full"
                >
                    Ignorer
                </button>
            </div>
            <div className="w-96  flexrounded px-4 py-2">
                <button
                    onClick={handleSubmit}
                    className=" py-2 px-10 rounded-full font-medium text-base text-white bg-primary w-full"
                >
                    Soumettre
                </button>

            </div>
        </div>
    );
};

export default NextStepSignupEntreprise;
