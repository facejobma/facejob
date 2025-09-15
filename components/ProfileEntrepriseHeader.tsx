"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";
import { Edit, Key } from "lucide-react";
import { UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

interface ProfileEntrepHeaderProps {
  id: number;
  company_name: string;
  sector_name: string;
  image?: string;
  // coverImageUrl?: string;
  siegeSocial?: string;
  companyLogoUrl?: string;
  website?: string;
  creationDate: string;
}

interface SecteurOptions {
  id: number;
  name: string;
}

const ProfileEntrepHeader: React.FC<ProfileEntrepHeaderProps> = ({
  id,
  company_name,
  sector_name,
  image,
  // coverImageUrl,
  siegeSocial,
  companyLogoUrl,
  website,
  creationDate,
}) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const router = useRouter(); // Using useRouter from next/router

  const [secteur, setSecteur] = useState("");
  const [secteurOptions, setSecteurOptions] = useState<SecteurOptions[]>([]);
  const [logoUrl, setLogoUrl] = useState<string>("");

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    newCompanyName: company_name,
    newSector: secteur || "",
    newSiegeSocial: siegeSocial || "",
    newWebsite: website || "",
      newCreationDate: creationDate || "",
      newImage: image || "", 
  });
  const [localCompanyName, setLocalCompanyName] = useState(company_name);
  const [localSectorName, setLocalSectorName] = useState(sector_name);
    const [localSiegeSocial, setLocalSiegeSocial] = useState(siegeSocial);
    const [localWebsite, setLocalWebsite] = useState(website);
    const [localCreationDate, setLocalCreationDate] = useState(creationDate);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const creationDate = new Date(formData.newCreationDate);
      const formattedCreationDate = creationDate.toISOString().split("T")[0];

      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + `/api/enterprise/updateId/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_name: formData.newCompanyName,
            sector_id: secteur ? secteur : "",
            adresse: formData.newSiegeSocial,
            site_web: formData.newWebsite,
              created_at: formattedCreationDate,
              logo:formData.newImage,
          }),
        },
      );

        if (response.ok) {
          const updatedData = await response.json();
          // Update local states with the new data
          setLocalCompanyName(formData.newCompanyName);
          const selectedSector = secteurOptions.find(opt => opt.id === Number(secteur));
           setLocalSectorName(selectedSector?.name || "");
            setLocalSiegeSocial(formData.newSiegeSocial);
            setLocalWebsite(formData.newWebsite);
            setLocalCreationDate(formattedCreationDate);

            setIsEditing(false);
        } else {
            console.error("Failed to update profile data");
        }
    } catch (error) {
      console.error("Error updating profile data:", error);
    }
  };

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/sectors",
        );
        const data = await response.json();
        setSecteurOptions(data);
      } catch (error) {
        console.error("Error fetching sectors:", error);
        // toast.error("Erreur de récupération des secteurs!");
      }
    };

    fetchSectors().then(() => {
      console.log("sectors fetched");
    });
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

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSecteur(e.target.value);
    };

  const handlePasswordChangeClick = () => {
    router.push("/dashboard/entreprise/change-password"); // Adjust the route according to your project structure
  };
  const handleRemoveImage = () => {
    setFormData((prevData) => ({ ...prevData, newImage: "" }));
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

  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 pb-20 overflow-hidden relative">
      {/* {coverImageUrl && (
        <img
          src={coverImageUrl}
          alt="Cover"
          className="w-full h-40 object-cover relative"
        />
      )} */}

      <div className="p-6 relative">
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
        {image && (
          <div className="absolute left-10 top-6 md:top-12">
            <img
              src={image}
              alt="Profile Avatar"
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-contain"
            />
          </div>
        )}
        <div className="ml-6 md:ml-36 mt-32 md:mt-0">
            <h1 className="text-2xl font-bold mb-1">{localCompanyName}</h1>
            <p className="text-gray-600 mb-2">{localSectorName}</p>
            {localSiegeSocial && <p className="text-gray-600 mb-3">{localSiegeSocial}</p>}
            {localWebsite && (
                <a
                    href={localWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                >
                    {localWebsite}
                </a>
            )}
        </div>

        {localCreationDate && (
          <div className="flex items-center absolute bottom-6 right-6">
            <p className="text-gray-600 text-sm">
              Date de création: {new Date(localCreationDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isEditing}
        onClose={handleCloseModal}
        title="Modifier le Profil"
        description="Mettre à jour vos informations"
      >
        <form onSubmit={handleProfileUpdate}>
          <label htmlFor="newCompanyName" className="block mb-2 font-bold">
            Nom de l’Entreprise
          </label>
          <input
            type="text"
            id="newCompanyName"
            name="newCompanyName"
            value={formData.newCompanyName}
            onChange={handleInputChange}
            placeholder="Enter new company name"
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />

          <label className="block mb-2 font-bold" htmlFor="secteur">
            Secteur
          </label>
            <select
                id="secteur"
                value={secteur}
                onChange={handleSelectChange}
                className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
            >
                <option value="">Sélectionnez le secteur</option>
                {secteurOptions.map((option, index) => (
                    <option key={index} value={option.id}>
                        {option.name}
                    </option>
                ))}
            </select>

          <label htmlFor="newWebsite" className="block mb-2 font-bold">
            Site Internet
          </label>
          <input
            type="text"
            id="newWebsite"
            name="newWebsite"
            value={formData.newWebsite}
            onChange={handleInputChange}
            placeholder="Enter new website"
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />

            {/* <label htmlFor="newCreationDate" className="block mb-2 font-bold">
                Date de Création de l’Entreprise
            </label>
            <input
                type="date"
                id="newCreationDate"
                name="newCreationDate"
                value={formData.newCreationDate}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
            /> */}

          <label htmlFor="newSiegeSocial" className="block mb-2 font-bold">
            Adresse du Siège Social
          </label>
          <input
            type="text"
            id="newSiegeSocial"
            name="newSiegeSocial"
            value={formData.newSiegeSocial}
            onChange={handleInputChange}
            placeholder="Enter new siege social"
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />
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
                <UploadDropzone<OurFileRouter>
                  endpoint="videoUpload"
                  onClientUploadComplete={handleImageUploadComplete}
                  onUploadError={handleImageUploadError}
                  className="border-2 border-dashed rounded-md p-3 text-center cursor-pointer transition-colors border-gray-300"
                />
              )}

          <button
            type="submit"
            className="bg-primary hover:bg-primary-2 text-white font-bold py-2 px-4 rounded-md"
          >
            Sauvegarder
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ProfileEntrepHeader;