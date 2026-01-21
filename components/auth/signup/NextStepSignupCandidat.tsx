"use client";
import { useState, useEffect, FC, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core"; // ton routeur UploadThing

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
  const [imageUrl, setImageUrl] = useState<string>(""); // URL S3/UploadThing
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/sectors"
        );
        const data = await response.json();
        setSectors(data);
      } catch (error) {
        console.error("Error fetching sectors:", error);
        toast.error("Erreur lors de la récupération des secteurs!");
      }
    };

    fetchSectors();
  }, []);

  const filteredJobs =
    sectors.find((sector) => sector.id === parseInt(selectedSector))?.jobs || [];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const minBioLength = 15;

    if (!bio.trim()) {
      newErrors.bio = "La description est obligatoire.";
    } else if (bio.trim().length < minBioLength) {
      newErrors.bio = `La description doit contenir au moins ${minBioLength} caractères.`;
    }

    if (!selectedSector) newErrors.sector = "Veuillez sélectionner un secteur.";
    if (!selectedJob) newErrors.job = "Veuillez sélectionner un métier.";
    if (!yearsOfExperience.trim())
      newErrors.yearsOfExperience = "Veuillez indiquer vos années d’expérience.";
    if (!imageUrl) newErrors.image = "Veuillez uploader une photo de profil.";

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
        image: imageUrl, // 👉 URL de l’image uploadée
        yearsOfExperience,
      };

      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/complete-candidate",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
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

  // gestion UploadThing
  const handleUploadBegin = () => {
    setIsUploading(true);
    toast.loading("Upload de l’image en cours...", { id: "upload-toast" });
  };

  const handleUploadComplete = (res: any) => {
    setIsUploading(false);
    toast.dismiss("upload-toast");

    if (res && res[0] && res[0].url) {
      setImageUrl(res[0].url);
      toast.success("Image uploadée avec succès!");
    } else {
      toast.error("Erreur: URL non trouvée");
    }
  };

  const handleUploadError = (error: Error) => {
    setIsUploading(false);
    toast.dismiss("upload-toast");
    toast.error(`Erreur d'upload: ${error.message}`);
  };

  return (
    <div className="flex flex-col items-center font-default rounded-lg border border-newColor px-4 pb-4">
      <h2 className="text-3xl font-semibold text-second my-4 pb-4 mb-4">
        Informations complémentaires
      </h2>

      {/* Bio */}
      <div className="w-96 mb-2">
        <textarea
          placeholder="Décrivez-vous (carrière, expériences..)"
          value={bio}
          onChange={handleBioChange}
          maxLength={maxLength}
          className="px-4 py-2 rounded border border-gray w-full h-32 text-secondary resize-none"
        />
        {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
        <p className="text-gray-500 text-sm mt-1 text-end">
          {remainingCharacters} caractère{remainingCharacters !== 1 ? "s" : ""} restant
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
          className="px-4 py-2 text-secondary rounded border border-gray w-full"
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
        {errors.sector && <p className="text-red-500 text-sm">{errors.sector}</p>}
      </div>

      {/* Métier */}
      <div className="w-96 mb-2">
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          disabled={!selectedSector}
          className="px-4 py-2 text-secondary rounded border border-gray w-full"
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

      {/* Image Upload */}
      <div className="w-96 mb-4">
        {imageUrl ? (
          <div className="flex flex-col items-center">
            <Image
              src={imageUrl}
              alt="Photo de profil"
              width={120}
              height={120}
              className="rounded-lg"
            />
            <button
              onClick={() => setImageUrl("")}
              className="mt-2 text-red-500 text-sm underline hover:text-red-700"
              disabled={isUploading}
            >
              Changer la photo
            </button>
          </div>
        ) : (
          <UploadDropzone<OurFileRouter, "imageUpload">
            endpoint="imageUpload"
            onClientUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            onUploadBegin={handleUploadBegin}
            className="border-2 border-dashed rounded-md p-3 text-center cursor-pointer"
          />
        )}
        {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
      </div>

      {/* Expérience */}
      <input
        type="number"
        placeholder="Années d’expérience"
        value={yearsOfExperience}
        onChange={(e) => setYearsOfExperience(e.target.value)}
        className="px-4 py-2 rounded border border-gray w-96 text-secondary"
      />
      {errors.yearsOfExperience && (
        <p className="text-red-500 text-sm w-96">{errors.yearsOfExperience}</p>
      )}

      {/* Boutons */}
      <div className="w-96 mt-4 flex flex-col gap-2">
        <button
          onClick={() => {
            onSkip();
            sessionStorage.clear();
            router.push("/auth/login-candidate");
          }}
          disabled={isUploading}
          className="py-2 px-10 rounded-full font-medium text-base text-white bg-gray-400 w-full"
        >
          Ignorer
        </button>
        <button
          onClick={handleSubmit}
          disabled={isUploading}
          className={`py-2 px-10 rounded-full font-medium text-base text-white w-full ${
            isUploading ? "bg-gray-300 cursor-not-allowed" : "bg-primary hover:bg-primary-dark"
          }`}
        >
          {isUploading ? "Upload en cours..." : "Soumettre"}
        </button>
      </div>
    </div>
  );
};

export default NextStepSignupCandidat;
