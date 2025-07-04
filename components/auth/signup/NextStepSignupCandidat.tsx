"use client";
import { useState, useEffect, FC, ChangeEvent } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

// interface SecteurOptions {
//   id: number;
//   name: string;
// }

interface NextStepSignupCandidatProps {
  onSkip: () => void;
}

interface Job {
  id: number;
  name: string;
}

interface Sector {
  id: number;
  name: string;
  jobs: Job[];
}

const NextStepSignupCandidat: FC<NextStepSignupCandidatProps> = ({
  onSkip,
}) => {
  const [bio, setBio] = useState("");
  const [sector, SetSector] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);

  const [selectedSector, setSelectedSector] = useState("");
  const [selectedJob, setSelectedJob] = useState("");

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
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/sectors",
        );
        const data = await response.json();
        setSectors(data);
      } catch (error) {
        console.error("Error fetching sectors:", error);
        toast.error("Error fetching sectors!");
      }
    };

    fetchSectors();
  }, []);

  const filteredJobs =
    sectors.find((sector) => sector.id === parseInt(selectedSector))?.jobs ||
    [];

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
        userId:
          typeof window !== "undefined"
            ? window.sessionStorage?.getItem("userId") || "{}"
            : "{}",
        bio,
        job: selectedJob,
        image,
        yearsOfExperience,
      };

      console.log("formData, ", formData);

      // if (image) {
      //   formData.append("image", image)  ;
      // }

      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/complete-candidate",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
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
    <div className="flex flex-col items-center font-default rounded-lg border border-newColor px-4 pb-4">
      <h2 className="text-3xl font-semibold text-second my-4 pb-4 mb-4">
        Informations complémentaires
      </h2>

      <div className="w-96 mb-2">
        <textarea
          placeholder="écrire une description de vous-même (votre carrière professionnelle..)"
          value={bio}
          onChange={handleBioChange}
          maxLength={maxLength}
          className="px-4 py-2 rounded border border-gray w-full h-32 text-secondary resize-none"
        />
        <p className="text-gray-500 text-sm mt-1 text-end">
          {remainingCharacters} caractère{remainingCharacters !== 1 ? "s" : ""}{" "}
          {remainingCharacters} restant{remainingCharacters !== 1 ? "s"  : ""}{" "}
          
        </p>
      </div>

      <div className="w-96 mb-2">
        <select
          value={selectedSector}
          onChange={(e) => {
            setSelectedSector(e.target.value);
            setSelectedJob(""); // Reset job selection when sector changes
          }}
          className="px-4 py-2 text-secondary rounded border border-gray w-full appearance-none bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="" disabled>
            Sélectionnez le secteur.
          </option>
          {sectors.map((sector) => (
            <option key={sector.id} value={sector.id}>
              {sector.name}
            </option>
          ))}
        </select>
      </div>
      <div className="w-96 mb-2">
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="px-4 py-2 text-secondary rounded border border-gray w-full appearance-none bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          disabled={!selectedSector}
        >
          <option value="">Sélectionnez le métier.</option>
          {filteredJobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.name}
            </option>
          ))}
        </select>
      </div>

      <div
        {...getRootProps()}
        className="w-96 mb-4 border border-gray p-4 rounded"
      >
        <input {...getInputProps()} />
        <p className="text-secondary">
          Faites glisser un photo de profil ici ou cliquez pour sélectionner un
          photo
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
        placeholder="Années d’expérience"
        value={yearsOfExperience}
        onChange={(e) => setYearsOfExperience(e.target.value)}
        className="px-4 py-2 rounded border border-gray w-96 mb-4 text-secondary"
      />

      <div className="w-96 mb-1 flexrounded px-4 py-2">
        <button
          onClick={() => {
            onSkip();
            sessionStorage.clear();
            router.push("/auth/login-candidate");
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
