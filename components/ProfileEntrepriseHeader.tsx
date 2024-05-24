"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ResumePDF from "@/components/ResumePDF";
import { Edit } from "lucide-react";


interface ProfileEntrepHeaderProps {
  id: number;
  company_name: string;
  sector: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  siegeSocial?: string;
  companyLogoUrl?: string;
  website?: string ;
  creationDate: string;
}

const ProfileEntrepHeader: React.FC<ProfileEntrepHeaderProps> = ({
  id,
  company_name,
  sector,
  avatarUrl,
  coverImageUrl,
  siegeSocial,
  companyLogoUrl,
  website,
  creationDate,
}) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    newSector: sector || "",
    newSiegeSocial: siegeSocial || "",
    newCompanyName: company_name || "",
    newWebsite: website || "",
    newCreationDate: creationDate || "",
    
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
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
            company_name: formData.newCompanyName,
            sector: formData.newSector,
            siegeSocial: formData.newSiegeSocial,
            website: formData.newWebsite,
            // companyName: formData.newCompanyName,
          }),
        },
      );

      if (response.ok) {
        const updatedData = await response.json();
        console.log("Updated profile data:", updatedData);
        setIsEditing(false);
      } else {
        console.error("Failed to update profile data");
      }
    } catch (error) {
      console.error("Error updating profile data:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden relative">
      {coverImageUrl && (
        <img
          src={coverImageUrl}
          alt="Cover"
          className="w-full h-40 object-cover relative"
        />
      )}

      <div className="p-6 relative">
        <div className="absolute top-4 right-6">
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={handleEditClick}
          >
            <Edit />
            {/* Edit */}
          </button>
        </div>
        {avatarUrl && (
          <div className="absolute left-10 top-6 md:top-12">
            <img
              src={avatarUrl}
              alt="Profile Avatar"
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
            />
          </div>
        )}
        <div className="ml-6 md:ml-36 mt-32 md:mt-0">
          <h1 className="text-2xl font-bold mb-1">
            {company_name}
          </h1>
          <p className="text-gray-600 mb-2">{sector}</p>
          {siegeSocial && <p className="text-gray-600 mb-3">{siegeSocial}</p>}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {website}
            </a>
          )}
        </div>

        {creationDate  && (
          <div className="flex items-center absolute bottom-6 right-6">
          
          <p className="text-gray-600 text-sm">
            Creation Date: {new Date(creationDate).toLocaleDateString()}
          </p>
  
          </div>
        )}
      </div>

      {/* Modal for editing profile */}
      <Modal
        isOpen={isEditing}
        onClose={handleCloseModal}
        title="Edit Profile"
        description="Update your profile information"
      >
        <form onSubmit={handleProfileUpdate}>
          {/* Name */}
          <label htmlFor="newCompanyName" className="block mb-2 font-bold">
            Company name
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

          {/* Sector */}
          <label htmlFor="newSector" className="block mb-2 font-bold">
            Sector
          </label>
          <input
            type="text"
            id="newSector"
            name="newSector"
            value={formData.newSector}
            onChange={handleInputChange}
            placeholder="Enter new sector"
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"

          />
            
            {/* Website */}
          <label htmlFor="newWebsite" className="block mb-2 font-bold">
            Website
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
          {/* Creation Date */}
          <label htmlFor="newCreationDate" className="block mb-2 font-bold">
            Creation Date
          </label>
          <input
            type="text"
            id="newCreationDate"
            name="newCreationDate"
            value={formData.newCreationDate}
            onChange={handleInputChange}
            placeholder="Enter new creation date"
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />
          
          {/* siegeSocial */}
          <label htmlFor="newSiegeSocial" className="block mb-2 font-bold">
            Siege Social
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
          {/* Submit Button */}
          <button
            type="submit"
            className="bg-primary hover:bg-primary-2 text-white font-bold py-2 px-4 rounded-md"
          >
            Save
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ProfileEntrepHeader;
