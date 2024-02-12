import { useState, useEffect, FC, ChangeEvent } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

interface SecteurOptions {
  id: number;
  name: string;
}

interface NextStepSignupCandidatProps {
  onSkip: () => void;
}

const NextStepSignupCandidat: FC<NextStepSignupCandidatProps> = ({
  onSkip,
}) => {
  const [bio, setBio] = useState("");
  const [sector, SetSector] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [secteurOptions, SetSectorOptions] = useState<SecteurOptions[]>([]);
  const [customSector, setCustomSector] = useState("");
  const maxLength = 250;

  const router = useRouter();

  const { getRootProps, getInputProps } = useDropzone({
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
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/sectors"
        );
        const data = await response.json();
        SetSectorOptions(data);
      } catch (error) {
        toast.error("Erreur de récupération des secteurs!");
        console.error("Error fetching sectors:", error);
      }
    };

    fetchSectors();
  }, []);

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSector = e.target.value;
    SetSector(selectedSector);

    // If selected sector is "Autre", clear custom sector input
    if (selectedSector !== "Autre") {
      setCustomSector("");
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = {
        userId: sessionStorage.getItem("userId"),
        bio,
        sector: sector ? sector : customSector,
        image,
        yearsOfExperience,
      };

      console.log("formData, ", formData);

      // if (image) {
      //   formData.append("image", image);
      // }

      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/complete-candidate",
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
        toast.success("Votre compte s’est terminé avec succès !");

        router.push("/auth/login-candidate");
        sessionStorage.clear();
        // console.log(responseData);
      } else {
        toast.error("L’enregistrement a échoué!");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Erreur de mise à jour de l’utilisateur!");
    }
  };

  return (
    <div className="flex flex-col items-center font-default rounded-lg border border-newColor p-4">
      <h2 className="text-3xl font-semibold text-second my-2 py-4 mb-4">
        Additional Information (Optional)
      </h2>

      <div className="w-96 mb-4">
        <textarea
          placeholder="écrire une description de vous-même (votre carrière professionnelle..)"
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
          value={sector}
          //   onChange={(e) => SetSector(e.target.value)}
          onChange={handleSectorChange}
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

      {sector === "Autre" && (
        <div className="w-96 mb-4">
          <input
            type="text"
            value={customSector}
            onChange={(e) => setCustomSector(e.target.value)}
            placeholder="Saisissez un autre secteur"
            className="px-4 py-2 text-secondary rounded border border-gray w-full appearance-none bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      <div
        {...getRootProps()}
        className="w-96 mb-4 border border-gray p-4 rounded"
      >
        <input {...getInputProps()} />
        <p className="text-secondary">
          Faites glisser un logo ici ou cliquez pour sélectionner un logo
        </p>
        {image && (
          <div className="mt-5 flex justify-center items-center flex-col ">
            <p className="text-primary mb-1">Selected Image:</p>
            <img
              src={URL.createObjectURL(image)}
              alt="image sélectionnée"
              className="rounded-lg max-w-full h-auto"
            />
          </div>
        )}
      </div>

      <input
        type="number"
        placeholder="Année d'experience"
        value={yearsOfExperience}
        onChange={(e) => setYearsOfExperience(e.target.value)}
        className="px-4 py-2 rounded border border-gray w-96 mb-4 text-secondary"
      />

      <div className="w-96 mb-1 flexrounded px-4 py-2">
        <button
          onClick={() => {
            onSkip();
            sessionStorage.clear();
            router.push("/auth/login-candidate").then(() => {
              console.log("redirected");
            });
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

export default NextStepSignupCandidat;
