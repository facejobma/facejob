import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";
import { Edit, Key } from "lucide-react";
import { FaPhone, FaEnvelope, FaMapPin, FaTrash, FaUser, FaUpload } from "react-icons/fa";
import toast from "react-hot-toast";

interface ProfileHeaderProps {
  id: number;
  first_name: string;
  last_name: string;
  tel: string;
  email: string;
  zip_code: string;
  headline: string;
  image?: string;
  address?: string;
  companyName?: string;
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

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  id,
  first_name,
  last_name,
  headline,
  image,
  tel,
  email,
  zip_code,
  address,
  companyName,
}) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const router = useRouter();

  // Initial state setup
  const [isEditing, setIsEditing] = useState(false);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedSector, setSelectedSector] = useState("");
  const [selectedJob, setSelectedJob] = useState("");

  const [formData, setFormData] = useState({
    newFirstName: first_name || "",
    newLastName: last_name || "",
    newHeadline: headline || "",
    newAddress: address || "",
    newCompanyName: companyName || "",
    newTel: tel || "",
    newEmail: email || "",
    newImage: image || "", // Initialize with the existing image or empty string
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
  };

  const handleImageUploadComplete = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    // Validate file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 4MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/uploadthing', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.url || URL.createObjectURL(file);
        
        setFormData((prevData) => ({
          ...prevData,
          newImage: imageUrl,
        }));
        toast.success("Image téléchargée avec succès!");
      } else {
        // Fallback to local preview
        const imageUrl = URL.createObjectURL(file);
        setFormData((prevData) => ({
          ...prevData,
          newImage: imageUrl,
        }));
        toast.success("Image sélectionnée");
      }
    } catch (error) {
      console.error("Upload error:", error);
      // Fallback to local preview
      const imageUrl = URL.createObjectURL(file);
      setFormData((prevData) => ({
        ...prevData,
        newImage: imageUrl,
      }));
      toast.success("Image sélectionnée");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUploadError = (error: Error) => {
    toast.error(`Erreur: ${error.message}`);
    setIsUploading(false);
  };

  const handleRemoveImage = () => {
    setFormData((prevData) => ({ ...prevData, newImage: "" }));
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/candidate/update-profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: formData.newFirstName,
            last_name: formData.newLastName,
            headline: selectedJob,
            address: formData.newAddress,
            company: formData.newCompanyName,
            tel: formData.newTel,
            email: formData.newEmail,
            image: formData.newImage,
          }),
        },
      );

      if (response.ok) {
        const updatedData = await response.json();

        // Update the state with the new profile data
        setFormData((prevData) => ({
          ...prevData,
          newFirstName: updatedData.data.first_name,
          newLastName: updatedData.data.last_name,
          newHeadline: updatedData.data.headline,
          newAddress: updatedData.data.address,
          newCompanyName: updatedData.data.company,
          newTel: updatedData.data.tel,
          newEmail: updatedData.data.email,
          newImage: updatedData.data.image,
        }));

        // Close the modal
        setIsEditing(false);

        window.sessionStorage.setItem("user", JSON.stringify(updatedData.data));
        toast.success("Profil mis à jour avec succès!");
        router.refresh(); //refresh page
      } else {
        console.error("Failed to update profile data");
        toast.error("Échec de la mise à jour du profil");
      }
    } catch (error) {
      console.error("Error updating profile data:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    }
  };

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/sectors",
        );
        const result = await response.json();
        // Extract data from wrapped response
        const data = result.data || result;
        setSectors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching sectors:", error);
        toast.error("Error fetching sectors!");
        setSectors([]); // Set empty array on error
      }
    };

    fetchSectors();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const filteredJobs =
    sectors.find((sector) => sector.id === parseInt(selectedSector))?.jobs ||
    [];

  const handlePasswordChangeClick = () => {
    router.push("/dashboard/candidat/change-password");
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
            onClick={handleEditClick}
          >
            <Edit className="w-4 h-4" />
            Modifier
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Modifier le Mot de Passe"
            onClick={handlePasswordChangeClick}
          >
            <Key className="w-4 h-4" />
            Mot de passe
          </button>
        </div>
      </div>
      <div className="flex items-start gap-6">
        {formData.newImage && formData.newImage !== "https://via.placeholder.com/150" ? (
          <div>
            <img
              src={formData.newImage}
              alt="Profile Avatar"
              className="w-20 h-20 rounded-full border-2 border-gray-200 object-cover"
            />
          </div>
        ) : (
          <div>
            <div className="w-20 h-20 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
              <FaUser className="text-gray-400 text-xl" />
            </div>
          </div>
        )}

        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {formData.newFirstName} {formData.newLastName}
          </h2>
          <p className="text-gray-600 text-sm mb-3">
            {formData.newHeadline || "Poste non renseigné"}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <FaPhone className="text-green-600 w-4 h-4" />
              <span>{formData.newTel || "Téléphone non renseigné"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <FaEnvelope className="text-green-600 w-4 h-4" />
              <span>{formData.newEmail || "Email non renseigné"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <FaMapPin className="text-green-600 w-4 h-4" />
              <span>{formData.newAddress || "Adresse non renseignée"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for editing profile */}
      <Modal
        isOpen={isEditing}
        onClose={handleCloseModal}
        title="Modifier le Profil"
        description="Mettre à jour vos informations"
      >
        <form onSubmit={handleProfileUpdate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="w-full">
              <label htmlFor="newFirstName" className="block mb-2 font-bold">
                Prénom
              </label>
              <input
                type="text"
                id="newFirstName"
                name="newFirstName"
                value={formData.newFirstName}
                onChange={handleInputChange}
                placeholder="Entrez votre prénom"
                className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
              />

              <label htmlFor="newEmail" className="block mb-2 font-bold">
                Email
              </label>
              <input
                type="email"
                id="newEmail"
                name="newEmail"
                value={formData.newEmail}
                onChange={handleInputChange}
                placeholder="Entrez votre email"
                className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
              />

              <label className="block mb-2 font-bold" htmlFor="secteur">
                Secteur
              </label>
              <select
                id="secteur"
                value={selectedSector}
                onChange={(e) => {
                  setSelectedSector(e.target.value);
                  setSelectedJob(""); // Reset job selection when sector changes
                }}
                className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
              >
                <option value="">Sélectionnez le secteur</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>

              <label htmlFor="newAddress" className="block mb-2 font-bold">
                Adresse
              </label>
              <input
                type="text"
                id="newAddress"
                name="newAddress"
                value={formData.newAddress}
                onChange={handleInputChange}
                placeholder="Entrez votre adresse"
                className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
              />
            </div>

            <div className="w-full">
              <label htmlFor="newLastName" className="block mb-2 font-bold">
                Nom
              </label>
              <input
                type="text"
                id="newLastName"
                name="newLastName"
                value={formData.newLastName}
                onChange={handleInputChange}
                placeholder="Entrez votre nom"
                className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
              />

              <label htmlFor="newTel" className="block mb-2 font-bold">
                Téléphone
              </label>
              <input
                type="text"
                id="newTel"
                name="newTel"
                value={formData.newTel}
                onChange={handleInputChange}
                placeholder="Entrez votre téléphone"
                className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
              />

              <label className="block mb-2 font-bold" htmlFor="metier">
                Métier
              </label>
              <select
                id="metier"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
                disabled={!selectedSector}
              >
                <option value="">Sélectionnez le métier</option>
                {filteredJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.name}
                  </option>
                ))}
              </select>

              <label className="block mb-2 font-bold">Photo de profil</label>
              {formData.newImage ? (
                <div className="mb-4">
                  <img
                    src={formData.newImage}
                    alt="Profile Preview"
                    className="w-24 h-24 rounded-full border-2 border-gray-300 mb-2 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex items-center text-red-600 hover:text-red-800 text-sm"
                  >
                    <FaTrash className="mr-2" />
                    Supprimer
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <label 
                    htmlFor="image-upload" 
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FaUpload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Cliquez pour télécharger</span>
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG (MAX. 4MB)</p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUploadComplete}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                  {isUploading && (
                    <p className="text-sm text-gray-600 mt-2">Téléchargement en cours...</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md shadow-sm transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfileHeader;
