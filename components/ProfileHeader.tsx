import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";
import { Edit, Key } from "lucide-react";
import { FaPhone, FaEnvelope, FaMapPin, FaTrash, FaUser } from "react-icons/fa";
import toast from "react-hot-toast";
import { UploadDropzone } from "@uploadthing/react";
import "@uploadthing/react/styles.css";
import { OurFileRouter } from "@/app/api/uploadthing/core";

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

  const [selectedSector, setSelectedSector] = useState("");
  const [selectedJob, setSelectedJob] = useState("");

  const [formData, setFormData] = useState({
    newFirstName: first_name,
    newLastName: last_name,
    newHeadline: headline,
    newAddress: address || "",
    newCompanyName: companyName || "",
    newTel: tel,
    newEmail: email,
    newImage: image || "", // Initialize with the existing image or empty string
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
  };

  const handleImageUploadComplete = (res: any) => {
    if (res && res[0] && res[0].fileUrl) {
      setFormData((prevData) => ({
        ...prevData,
        newImage: res[0].fileUrl,
      }));
      toast.success("Image uploaded successfully!");
    }
  };

  const handleImageUploadError = (error: Error) => {
    toast.error(`Image upload error: ${error.message}`);
  };

  const handleRemoveImage = () => {
    setFormData((prevData) => ({ ...prevData, newImage: "" }));
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + `/api/candidate/updateId/${id}`,
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
        router.refresh(); //refresh page
      } else {
        console.error("Failed to update profile data");
        toast.error("Failed to update profile data");
      }
    } catch (error) {
      console.error("Error updating profile data:", error);
      toast.error("Error updating profile data");
    }
  };

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
    <div className="bg-white rounded-lg shadow-lg mb-6 pb-2 overflow-hidden relative">
      <div className="p-10 relative">
        <div className="absolute top-4 right-6 flex gap-4">
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={handleEditClick}
          >
            <Edit />
          </button>
          <button
            className="text-gray-400 hover:text-gray-600"
            title="Modifier le Mot de Passe"
            onClick={handlePasswordChangeClick}
          >
            <Key />
          </button>
        </div>
        {formData.newImage && formData.newImage !== "https://via.placeholder.com/150" ? (
          <div className="absolute left-10 top-6 md:top-12">
            <img
              src={formData.newImage}
              alt="Profile Avatar"
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
          </div>
        ) : (
          <div className="absolute left-10 top-6 md:top-12">
            <div className="w-24 h-24 rounded-full border-4 border-gray-200 shadow-lg bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
              <FaUser className="text-green-600 text-2xl" />
            </div>
          </div>
        )}

        <div className="ml-6 md:ml-36 mt-32 md:mt-0">
          <h1 className="text-2xl font-bold mb-1">
            {formData.newFirstName} {formData.newLastName}
          </h1>
          <p className="text-secondary mb-3">
            {formData.newHeadline || "Poste non renseigné"}
          </p>
        </div>

        <div className="ml-6 md:ml-36 mt-32 md:mt-0">
          <div className="flex items-center mb-2">
            <FaPhone className="text-green-600 mr-2" />
            <p className="text-gray-600">{formData.newTel || "Téléphone non renseigné"}</p>
          </div>
          <div className="flex items-center mb-2">
            <FaEnvelope className="text-green-600 mr-2" />
            <p className="text-gray-600">{formData.newEmail || "Email non renseigné"}</p>
          </div>
          <div className="flex items-center mb-2">
            <FaMapPin className="text-green-600 mr-2" />
            <p className="text-gray-600">{formData.newAddress || "Adresse non renseignée"}</p>
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
                placeholder="Enter votre prénom"
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
                placeholder="Enter votre email"
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
                placeholder="Enter votre adresse"
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
                placeholder="Enter votre nom"
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
                placeholder="Enter votre téléphone"
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

              <label className="block mb-2 font-bold">Profile Image</label>
              {formData.newImage ? (
                <div className="mb-4">
                  <img
                    src={formData.newImage}
                    alt="Profile Preview"
                    className="w-24 h-24 rounded-full border-2 border-gray-300 mb-2"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex items-center text-red-600 hover:text-red-800"
                  >
                    <FaTrash className="mr-2" />
                    Supprimer
                  </button>
                </div>
              ) : (
                <UploadDropzone<OurFileRouter, "videoUpload">
                  endpoint="videoUpload"
                  onClientUploadComplete={handleImageUploadComplete}
                  onUploadError={handleImageUploadError}
                  className="border-2 border-dashed rounded-md p-3 text-center cursor-pointer transition-colors border-gray-300"
                />
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
