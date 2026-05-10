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
  currentJobId?: number;
  currentSectorId?: number;
  preferredLocation?: string;
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
  currentJobId,
  currentSectorId,
  preferredLocation,
}) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const router = useRouter();

  // Initial state setup
  const [isEditing, setIsEditing] = useState(false);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const [selectedSector, setSelectedSector] = useState(currentSectorId ? String(currentSectorId) : "");
  const [selectedJob, setSelectedJob] = useState(currentJobId ? String(currentJobId) : "");

  // Sync sector/job when sectors are loaded (async)
  useEffect(() => {
    if (sectors.length > 0 && currentSectorId) {
      setSelectedSector(String(currentSectorId));
    }
    if (currentJobId) {
      setSelectedJob(String(currentJobId));
    }
  }, [sectors, currentSectorId, currentJobId]);

  const [formData, setFormData] = useState({
    newFirstName: first_name ?? "",
    newLastName: last_name ?? "",
    newHeadline: headline ?? "",
    newAddress: address ?? "",
    newPreferredLocation: preferredLocation ?? "",
    newCompanyName: companyName ?? "",
    newTel: tel ?? "",
    newEmail: email ?? "",
    newImage: image ?? "",
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

    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 4MB");
      return;
    }

    // Delete old image from server if it's stored in our storage
    if (formData.newImage && formData.newImage.includes('/storage/profiles/')) {
      try {
        await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/candidate/profile-image',
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${authToken}`,
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );
      } catch {
        // Silent fail
      }
    }

    // Store file for upload on save, show local preview
    setSelectedImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFormData((prevData) => ({ ...prevData, newImage: previewUrl }));
    toast.success("Image sélectionnée");
  };

  const handleImageUploadError = (error: Error) => {
    toast.error(`Erreur: ${error.message}`);
    setIsUploading(false);
  };

  const handleRemoveImage = async () => {
    const currentImage = formData.newImage;

    // Clear local state immediately
    setFormData((prevData) => ({ ...prevData, newImage: "" }));
    setSelectedImageFile(null);

    // If image is stored in our backend, delete it from server
    if (currentImage && currentImage.includes('/storage/profiles/')) {
      try {
        await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/candidate/profile-image',
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${authToken}`,
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );
      } catch {
        // Silent fail — image already removed from UI
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      let response: Response;

      if (selectedImageFile) {
        // Send as FormData to upload image to Laravel storage
        const data = new FormData();
        data.append("first_name", formData.newFirstName);
        data.append("last_name", formData.newLastName);
        data.append("job_id", selectedJob || "");
        data.append("address", formData.newAddress);
        data.append("preferred_location", formData.newPreferredLocation || "");
        data.append("company", formData.newCompanyName);
        data.append("tel", formData.newTel);
        data.append("email", formData.newEmail);
        data.append("image", selectedImageFile);

        response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/candidate/update-profile`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "ngrok-skip-browser-warning": "true",
            },
            body: data,
          }
        );
      } else {
        response = await fetch(
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
              job_id: selectedJob || undefined,
              address: formData.newAddress,
              preferred_location: formData.newPreferredLocation || undefined,
              company: formData.newCompanyName,
              tel: formData.newTel,
              email: formData.newEmail,
              image: formData.newImage,
            }),
          }
        );
      }

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
            {formData.newHeadline || <span className="text-amber-500 italic">Poste non renseigné — important pour le matching</span>}
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
              {formData.newPreferredLocation
                ? <span>{formData.newPreferredLocation}</span>
                : <span className="text-amber-500 italic text-xs">Ville préférée non renseignée — important pour le matching</span>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Modal for editing profile */}
      <Modal
        isOpen={isEditing}
        onClose={handleCloseModal}
        title="Modifier le Profil"
        description="Mettre à jour vos informations personnelles"
      >
        <form onSubmit={handleProfileUpdate}>
          <div className="space-y-6">
            {/* Profile Information Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <FaUser className="text-green-600 text-sm" />
                </div>
                <h3 className="font-semibold text-gray-900">Informations personnelles</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label htmlFor="newFirstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="newFirstName"
                    name="newFirstName"
                    value={formData.newFirstName}
                    onChange={handleInputChange}
                    maxLength={50}
                    placeholder="Entrez votre prénom"
                    className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-2.5 px-4 outline-none transition-all"
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="newLastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="newLastName"
                    name="newLastName"
                    value={formData.newLastName}
                    onChange={handleInputChange}
                    maxLength={50}
                    placeholder="Entrez votre nom"
                    className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-2.5 px-4 outline-none transition-all"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="newEmail"
                    name="newEmail"
                    value={formData.newEmail}
                    onChange={handleInputChange}
                    placeholder="Entrez votre email"
                    className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-2.5 px-4 outline-none transition-all"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="newTel" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="text"
                    id="newTel"
                    name="newTel"
                    value={formData.newTel}
                    onChange={handleInputChange}
                    maxLength={20}
                    placeholder="Entrez votre téléphone"
                    className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-2.5 px-4 outline-none transition-all"
                    required
                  />
                </div>

                {/* Sector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="secteur">
                    Secteur d'activité préféré
                    <span className="ml-1 text-xs text-green-600 font-normal">(utilisé pour le matching)</span>
                  </label>
                  <select
                    id="secteur"
                    value={selectedSector}
                    onChange={(e) => {
                      setSelectedSector(e.target.value);
                      setSelectedJob("");
                    }}
                    className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-2.5 px-4 outline-none transition-all"
                  >
                    <option value="">Sélectionnez le secteur</option>
                    {sectors.map((sector) => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="metier">
                    Poste recherché
                    <span className="ml-1 text-xs text-green-600 font-normal">(utilisé pour le matching)</span>
                  </label>
                  <select
                    id="metier"
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                    className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-2.5 px-4 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedSector}
                  >
                    <option value="">Sélectionnez le métier</option>
                    {filteredJobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.name}
                      </option>
                    ))}
                  </select>
                  {!selectedSector && (
                    <p className="text-xs text-green-700 mt-1">
                      💡 Sélectionnez d'abord un secteur
                    </p>
                  )}
                </div>

                {/* Address - Full Width */}
                <div className="md:col-span-2">
                  <label htmlFor="newAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse personnelle
                  </label>
                  <input
                    type="text"
                    id="newAddress"
                    name="newAddress"
                    value={formData.newAddress}
                    onChange={handleInputChange}
                    maxLength={200}
                    placeholder="Ex: 12 Rue Hassan II, Casablanca"
                    className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-2.5 px-4 outline-none transition-all"
                  />
                </div>

                {/* Preferred Location - Full Width */}
                <div className="md:col-span-2">
                  <label htmlFor="newPreferredLocation" className="block text-sm font-medium text-gray-700 mb-2">
                    Ville de travail préférée
                    <span className="ml-1 text-xs text-green-600 font-normal">✦ utilisé pour le matching d'offres</span>
                  </label>
                  <input
                    type="text"
                    id="newPreferredLocation"
                    name="newPreferredLocation"
                    value={formData.newPreferredLocation}
                    onChange={handleInputChange}
                    maxLength={100}
                    placeholder="Ex: Casablanca, Rabat, Tanger..."
                    className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-2.5 px-4 outline-none transition-all"
                  />
                </div>

                {/* Profile Picture - Full Width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo de profil</label>
                  {formData.newImage ? (
                    <div className="flex items-center gap-4">
                      <img
                        src={formData.newImage}
                        alt="Profile Preview"
                        className="w-20 h-20 rounded-full border-2 border-green-300 object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FaTrash className="text-sm" />
                        Supprimer
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label 
                        htmlFor="image-upload" 
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FaUpload className="w-8 h-8 mb-2 text-green-600" />
                          <p className="mb-2 text-sm text-gray-700">
                            <span className="font-semibold">Cliquez pour télécharger</span>
                          </p>
                          <p className="text-xs text-gray-600">PNG, JPG (MAX. 4MB)</p>
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
                        <div className="flex items-center gap-2 mt-2 text-sm text-green-700">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          <span>Téléchargement en cours...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-sm"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfileHeader;
