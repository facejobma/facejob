"use client";
import { useState, useEffect, FC, ChangeEvent } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

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

const NextStepSignupCandidat: FC<NextStepSignupCandidatProps> = ({ onSkip }) => {
  const [bio, setBio] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);

  const [selectedSector, setSelectedSector] = useState("");
  const [selectedJob, setSelectedJob] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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
    sectors.find((sector) => sector.id === parseInt(selectedSector))?.jobs || [];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!bio.trim()) newErrors.bio = "La bio est obligatoire.";
    if (!selectedSector) newErrors.sector = "Veuillez sélectionner un secteur.";
    if (!selectedJob) newErrors.job = "Veuillez sélectionner un métier.";
    if (!yearsOfExperience.trim())
      newErrors.yearsOfExperience = "Veuillez indiquer vos années d’expérience.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs avant de soumettre.");
      return;
    }

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

      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/complete-candidate",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        toast.success("Votre compte s’est terminé avec succès !");
        router.push("/auth/login-candidate");
        sessionStorage.clear();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "L’enregistrement a échoué!");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Erreur de mise à jour de l’utilisateur!");
    }
  };

  return (
    <div className="flex flex-col items-center font-default rounded-lg border border-newColor px-4 pb-4">
      <h2 className="text-3xl font-semibold text-second my-4 pb-4 mb-4">
        Informations complémentaires (test az)
      </h2>

      {/* Bio */}
      <div className="w-96 mb-2">
        <textarea
          placeholder="Écrire une description de vous-même..."
          value={bio}
          onChange={handleBioChange}
          maxLength={maxLength}
          className={`px-4 py-2 rounded border w-full h-32 text-secondary resize-none ${
            errors.bio ? "border-red-500" : "border-gray"
          }`}
        />
        {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
        <p className="text-gray-500 text-sm mt-1 text-end">
          {remainingCharacters} caractères restants
        </p>
      </div>

      {/* Secteur */}
      <div className="w-96 mb-2">
        <select
          value={selectedSector}
          onChange={(e) => {
            setSelectedSector(e.target.value);
            setSelectedJob("");
          }}
          className={`px-4 py-2 rounded border w-full appearance-none bg-white ${
            errors.sector ? "border-red-500" : "border-gray"
          }`}
        >
          <option value="">Sélectionnez le secteur.</option>
          {sectors.map((sector) => (
            <option key={sector.id} value={sector.id}>
              {sector.name}
            </option>
          ))}
        </select>
        {errors.sector && <p className="text-red-500 text-sm">{errors.sector}</p>}
      </div>

      {/* Métier */}
      <div className="w-96 mb-2">
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          disabled={!selectedSector}
          className={`px-4 py-2 rounded border w-full appearance-none bg-white ${
            errors.job ? "border-red-500" : "border-gray"
          }`}
        >
          <option value="">Sélectionnez le métier.</option>
          {filteredJobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.name}
            </option>
          ))}
        </select>
        {errors.job && <p className="text-red-500 text-sm">{errors.job}</p>}
      </div>

      {/* Image */}
      <div {...getRootProps()} className="w-96 mb-4 border border-gray p-4 rounded">
        <input {...getInputProps()} />
        <p className="text-secondary">Déposez une photo ou cliquez pour choisir</p>
        {image && (
          <div className="mt-5 flex justify-center items-center flex-col ">
            <p className="text-primary mb-1">Image sélectionnée:</p>
            <img
              src={URL.createObjectURL(image)}
              alt="image sélectionnée"
              className="rounded-lg max-w-full h-auto"
            />
          </div>
        )}
      </div>

      {/* Années d'expérience */}
      <div className="w-96 mb-2">
        <input
          type="number"
          placeholder="Années d’expérience"
          value={yearsOfExperience}
          onChange={(e) => setYearsOfExperience(e.target.value)}
          className={`px-4 py-2 rounded border w-full text-secondary ${
            errors.yearsOfExperience ? "border-red-500" : "border-gray"
          }`}
        />
        {errors.yearsOfExperience && (
          <p className="text-red-500 text-sm">{errors.yearsOfExperience}</p>
        )}
      </div>

      {/* Boutons */}
      <div className="w-96 mb-1">
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
      <div className="w-96">
        <button
          onClick={handleSubmit}
          className="py-2 px-10 rounded-full font-medium text-base text-white bg-primary w-full"
        >
          Soumettre
        </button>
      </div>
    </div>
  );
};

export default NextStepSignupCandidat;
