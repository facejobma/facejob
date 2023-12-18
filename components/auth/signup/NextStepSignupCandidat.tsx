import {useState, useEffect} from "react";
import {useDropzone} from "react-dropzone";
import {useRouter} from "next/router";
import {toast} from "react-hot-toast";

interface SecteurOptions {
    id: number;
    name: string;
}

interface NextStepSignupCandidatProps {
    onSkip: () => void;
}

const NextStepSignupCandidat: React.FC<NextStepSignupCandidatProps> = ({
                                                                           onSkip,
                                                                       }) => {
    const [bio, setBio] = useState("");
    const [secteur, setSecteur] = useState("");
    const [yearsOfExperience, setYearsOfExperience] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [secteurOptions, setSecteurOptions] = useState<SecteurOptions[]>([]);
    const maxLength = 250;

    const router = useRouter();

    const {getRootProps, getInputProps} = useDropzone({
        onDrop: (acceptedFiles: File[]) => {
            setImage(acceptedFiles[0]);
        },
    });

    const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
            }
        };

        fetchSectors();
    }, []);

    const handleSubmit = async () => {
        try {
            const formData = {
                user_id: Number(sessionStorage.getItem("userId")) || "",
                bio,
                secteur,
                image,
                annee_experience: Number(yearsOfExperience),
            };
            // formData.append("user_id", sessionStorage.getItem("userId") || "");
            // formData.append("bio", bio);
            // formData.append("secteur", secteur);
            // formData.append("annee_experience", yearsOfExperience);

            console.log("formData, ", formData);

            // if (image) {
            //   formData.append("image", image);
            // }

            const response = await fetch(
                process.env.NEXT_PUBLIC_BACKEND_URL + "/api/complete-candidat",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (response.ok) {
                const responseData = await response.json();
                toast.success("Your account has completed successfuly!");

                router.push("/auth/login-candidat");
                sessionStorage.clear();
                // console.log(responseData);
            } else {
            }
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("Error updating user!");
        }
    };

    return (
        <div className="flex flex-col items-center font-default rounded-lg border border-newColor p-4">
            <h2 className="text-3xl font-semibold text-second my-2 py-4 mb-4">
                Additional Information (Optional)
            </h2>

            <div className="w-96 mb-4">
        <textarea
            placeholder="Tell us more about yourself..."
            value={bio}
            onChange={handleBioChange}
            maxLength={maxLength}
            className="px-4 py-2 rounded border border-gray w-full h-32 text-secondary resize-none"
        />
                <p className="text-gray-500 text-sm mt-1 text-end">
                    {remainingCharacters} character{remainingCharacters !== 1 ? "s" : ""}{" "}
                    remaining
                </p>
            </div>

            <div className="w-96 mb-4">
                <select
                    value={secteur}
                    onChange={(e) => setSecteur(e.target.value)}
                    className="px-4 py-2 text-secondary rounded border border-gray w-full appearance-none bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                    <option value="" disabled>
                        Select Secteur
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
                <p className="text-secondary">Faites glisser un logo ici ou cliquez pour sélectionner un logo</p>
                {image && (
                    <div className="mt-5 flex justify-center items-center flex-col ">
                        <p className="text-primary mb-1">Selected Image:</p>
                        <img
                            src={URL.createObjectURL(image)}
                            alt="Selected Image"
                            className="rounded-lg max-w-full h-auto"
                        />
                    </div>
                )}
            </div>

            <input
                type="number"
                placeholder="Année Experience"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                className="px-4 py-2 rounded border border-gray w-96 mb-4 text-secondary"
            />

            <div className="flex space-x-2">
                <button
                    onClick={handleSubmit}
                    className="py-2 px-10 rounded-full font-medium text-base text-white bg-primary"
                >
                    Submit
                </button>
                <button
                    onClick={() => {
                        onSkip();
                        sessionStorage.clear();
                        router.push("/auth/login-candidat");
                    }}
                    className="py-2 px-10 rounded-full font-medium text-base text-white bg-gray-400"
                >
                    Skip
                </button>
            </div>
        </div>
    );
};

export default NextStepSignupCandidat;
