"use client";
import React, { useState } from "react";
import { Edit } from "lucide-react";
import { Modal } from "@/components/ui/modal";

interface ProfileHeaderProps {
  name: string;
  headline: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  location?: string;
  companyName?: string;
  companyLogoUrl?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  headline,
  avatarUrl,
  coverImageUrl,
  location,
  companyName,
  companyLogoUrl,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    newName: name,
    newHeadline: headline,
    newLocation: location || "",
    newCompanyName: companyName || "",
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
  };

  const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Perform update logic with formData
    console.log("Updated profile data:", formData);
    setIsEditing(false); // Close the modal after updating
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
          <h1 className="text-2xl font-bold mb-1">{name}</h1>
          <p className="text-gray-600 mb-2">{headline}</p>
          {location && (
            <p className="text-gray-600 mb-3">Location: {location}</p>
          )}
          <button
            className="bg-primary hover:bg-primary-2 text-white font-bold py-1 px-3 rounded-lg border border-primary mb-4"
            onClick={() => {}}
          >
            Consulter CV
          </button>
        </div>

        {companyName && companyLogoUrl && (
          <div className="flex items-center absolute bottom-6 right-6">
            <img
              src={companyLogoUrl}
              alt={companyName}
              className="w-10 h-10 rounded-full mr-2"
            />
            <p className="text-sm text-gray-600">{companyName}</p>
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
          <label htmlFor="newName" className="block mb-2 font-bold">
            Name
          </label>
          <input
            type="text"
            id="newName"
            name="newName"
            value={formData.newName}
            onChange={handleInputChange}
            placeholder="Enter new name"
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />

          {/* Headline */}
          <label htmlFor="newHeadline" className="block mb-2 font-bold">
            Headline
          </label>
          <input
            type="text"
            id="newHeadline"
            name="newHeadline"
            value={formData.newHeadline}
            onChange={handleInputChange}
            placeholder="Enter new headline"
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />

          {/* Location */}
          <label htmlFor="newLocation" className="block mb-2 font-bold">
            Location
          </label>
          <input
            type="text"
            id="newLocation"
            name="newLocation"
            value={formData.newLocation}
            onChange={handleInputChange}
            placeholder="Enter new location"
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />

          {/* Company Name */}
          <label htmlFor="newCompanyName" className="block mb-2 font-bold">
            Company Name
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

export default ProfileHeader;
