"use client";
import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";
import { Edit, Key, Upload, Camera } from "lucide-react";
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
  onProfileUpdate?: () => void; // Callback to refresh parent data
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
  onProfileUpdate,
}) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const router = useRouter(); // Using useRouter from next/router

  const [secteur, setSecteur] = useState("");
  const [secteurOptions, setSecteurOptions] = useState<SecteurOptions[]>([]);
  const [logoUrl, setLogoUrl] = useState<string>("");

  const [isEditing, setIsEditing] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

      let response: Response;

      if (selectedLogoFile) {
        const data = new FormData();
        data.append("company_name", formData.newCompanyName);
        data.append("sector_id", secteur || "");
        data.append("adresse", formData.newSiegeSocial);
        data.append("site_web", formData.newWebsite);
        data.append("created_at", formattedCreationDate);
        data.append("logo", selectedLogoFile);

        response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/enterprise/updateId/${id}`,
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
          process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/enterprise/updateId/${id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              company_name: formData.newCompanyName,
              sector_id: secteur || "",
              adresse: formData.newSiegeSocial,
              site_web: formData.newWebsite,
              created_at: formattedCreationDate,
              logo: formData.newImage || localImage || "",
            }),
          }
        );
      }

        if (response.ok) {
          const updatedData = await response.json();
          console.log("Update response:", updatedData);
          
          toast.success("Profil mis à jour avec succès!");
          
          // Update local states with the new data
          setLocalCompanyName(formData.newCompanyName);
          const selectedSector = secteurOptions.find(opt => opt.id === Number(secteur));
          setLocalSectorName(selectedSector?.name || "");
          setLocalSiegeSocial(formData.newSiegeSocial);
          setLocalWebsite(formData.newWebsite);
          setLocalCreationDate(formattedCreationDate);
          setLocalImage(formData.newImage || localImage);

          setIsEditing(false);
          
          // Call parent callback to refresh data if provided
          if (onProfileUpdate) {
            onProfileUpdate();
          }
        } else {
            const errorData = await response.json();
            console.error("Failed to update profile data:", errorData);
            toast.error("Erreur lors de la mise à jour du profil");
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
  const handleRemoveImage = async () => {
    const currentImage = formData.newImage;
    setFormData((prevData) => ({ ...prevData, newImage: "" }));
    setSelectedLogoFile(null);

    if (currentImage && currentImage.includes('/storage/profiles/')) {
      try {
        await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/enterprise/profile-image',
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
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error("Veuillez sélectionner une image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("L'image ne doit pas dépasser 5 Mo"); return; }

    // Delete old image from server if stored locally
    if (formData.newImage && formData.newImage.includes('/storage/profiles/')) {
      fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/enterprise/profile-image', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}`, 'ngrok-skip-browser-warning': 'true' },
      }).catch(() => {});
    }

    setSelectedLogoFile(file);
    setFormData((prevData) => ({ ...prevData, newImage: URL.createObjectURL(file) }));
    toast.success("Logo sélectionné");
  };

  return (
    <div className="relative">
      <div className="flex items-start gap-4">
        {/* Logo */}
        {localImage && (
          <div className="flex-shrink-0">
            <img
              src={localImage}
              alt="Logo entreprise"
              className="w-16 h-16 rounded-lg border-2 border-gray-200 object-contain"
            />
          </div>
        )}
        
        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{localCompanyName}</h2>
              <p className="text-sm text-gray-600 mb-1">{localSectorName}</p>
              {localSiegeSocial && (
                <p className="text-sm text-gray-600 mb-1">{localSiegeSocial}</p>
              )}
              {localWebsite && (
                <a
                  href={localWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:text-green-700 inline-block"
                >
                  {localWebsite}
                </a>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                className="text-gray-400 hover:text-green-600 transition-colors"
                onClick={handleEditClick}
                title="Modifier le profil"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                className="text-gray-400 hover:text-green-600 transition-colors"
                title="Modifier le mot de passe"
                onClick={handlePasswordChangeClick}
              >
                <Key className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Creation Date */}
          {localCreationDate && (
            <p className="text-xs text-gray-500 mt-2">
              Créée le {new Date(localCreationDate).toLocaleDateString()}
            </p>
          )}
        </div>
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
            <label className="block text-sm font-semibold text-gray-700">Logo de l'Entreprise</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {formData.newImage ? (
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <img
                    src={formData.newImage}
                    alt="Logo Preview"
                    className="w-24 h-24 rounded-lg border-2 border-green-200 object-contain bg-white p-2"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">Logo sélectionné</p>
                    <p className="text-xs text-gray-500 mb-3">Le logo sera visible sur votre profil public</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Camera className="w-4 h-4 mr-1" /> Changer le logo
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center gap-3 hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">Cliquez pour choisir un logo</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — max 5 Mo</p>
                  </div>
                </button>
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