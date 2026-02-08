"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";
import { Edit, Key } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
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
    newSector: "",
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
  const [localImage, setLocalImage] = useState(companyLogoUrl);
    const [isUploading, setIsUploading] = useState(false);

  const handleEditClick = () => {
    // Réinitialiser les données du formulaire avec les valeurs actuelles
    setFormData({
      newCompanyName: localCompanyName,
      newSector: "",
      newSiegeSocial: localSiegeSocial || "",
      newWebsite: localWebsite || "",
      newCreationDate: localCreationDate || "",
      newImage: localImage || "",
    });
    
    // Trouver le secteur actuel dans les options
    const currentSector = secteurOptions.find(option => option.name === localSectorName);
    if (currentSector) {
      setSecteur(currentSector.id.toString());
    } else {
      setSecteur("");
    }
    
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
        process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/enterprise/updateId/${id}`,
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
              image: formData.newImage || localImage || "",
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
          setLocalImage(formData.newImage);

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
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/sectors",
        );
        const result = await response.json();
        // Extract data from wrapped response
        const data = result.data || result;
        setSecteurOptions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching sectors:", error);
        setSecteurOptions([]); // Set empty array on error
        // toast.error("Erreur de récupération des secteurs!");
      }
    };

    fetchSectors().then(() => {
      console.log("sectors fetched");
    });
  }, []);

  // Synchroniser formData.newImage avec l'image actuelle
  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      newImage: localImage || ""
    }));
  }, [localImage]);

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
      setIsUploading(false);
    }
    
  };

  const handleImageUploadError = (error: Error) => {
    setIsUploading(false);
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
        {localImage && (
          <div className="absolute left-10 top-6 md:top-12">
            <img
              src={localImage}
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
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="newCompanyName" className="block text-sm font-semibold text-gray-700">
            Nom de l’Entreprise
          </label>
          <input
            type="text"
            id="newCompanyName"
            name="newCompanyName"
            value={formData.newCompanyName}
            onChange={handleInputChange}
            placeholder="Entrez le nom de l'entreprise"
            className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700" htmlFor="secteur">
            Secteur
          </label>
            <select
                id="secteur"
                value={secteur}
                onChange={handleSelectChange}
                className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
                <option value="">Sélectionnez le secteur</option>
                {secteurOptions.map((option, index) => (
                    <option key={index} value={option.id}>
                        {option.name}
                    </option>
                ))}
            </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="newWebsite" className="block text-sm font-semibold text-gray-700">
            Site Internet
          </label>
          <input
            type="text"
            id="newWebsite"
            name="newWebsite"
            value={formData.newWebsite}
            onChange={handleInputChange}
            placeholder="Entrez l'URL du site web"
            className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
            </div>

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

            <div className="space-y-2">
              <label htmlFor="newSiegeSocial" className="block text-sm font-semibold text-gray-700">
            Adresse du Siège Social
          </label>
          <input
            type="text"
            id="newSiegeSocial"
            name="newSiegeSocial"
            value={formData.newSiegeSocial}
            onChange={handleInputChange}
            placeholder="Entrez l'adresse du siège social"
            className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
            </div>
          </div>

          <div className="space-y-4 border-t pt-6">
            <label className="block text-sm font-semibold text-gray-700">Image de Profil</label>
              {formData.newImage ? (
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={formData.newImage}
                    alt="Profile Preview"
                    className="w-20 h-20 rounded-full border-2 border-gray-300 object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">Image sélectionnée</p>
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={handleRemoveImage}
                    className="flex items-center text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-200"
                  >
                    <FaTrash className="mr-2" />
                    Supprimer
                  </button>
             
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors duration-200">
                <p className="text-secondary mb-4 text-center">
                            {isUploading ? "Upload en cours..." : "Glissez et déposez le logo de votre entreprise"}
                        </p>
                        {!isUploading ? (
                <UploadDropzone
                                                endpoint="imageUpload"
                                                input={{
                                                    profileUpdate: false,
                                                    companyLogo: true
                                                }}
                                                onClientUploadComplete={handleImageUploadComplete}
                                                onUploadError={handleImageUploadError}
                                                className="border-2 border-dashed rounded-md p-3 text-center cursor-pointer transition-colors border-gray-300 hover:border-primary"
                                                appearance={{
                                                    button: "bg-primary hover:bg-primary-dark",
                                                    allowedContent: "text-gray-600",
                                                }}
                                            />) : (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                                <p className="text-primary text-sm">Upload en cours...</p>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div className="bg-primary h-2 rounded-full animate-pulse w-3/4"></div>
                                </div>
                            </div>
                        )}
                </div>
              )}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all duration-200"
            >
              Annuler
            </button>
            <button
            type="submit"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Sauvegarder
          </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfileEntrepHeader;