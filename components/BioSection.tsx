"use client";
import React, { useState } from "react";
import { Edit } from "lucide-react";
import { Modal } from "@/components/ui/modal";

interface BioSectionProps {
  bio: string;
}

const BioSection: React.FC<BioSectionProps> = ({ bio }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBio, setNewBio] = useState(bio);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    setNewBio(bio);
  };

  const handleBioUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Updated bio:", newBio);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewBio(e.target.value);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Bio</h2>
        <button
          onClick={handleEditClick}
          className="text-gray-400 hover:text-gray-600"
        >
          <Edit />
        </button>
      </div>
      <div className="p-6 relative">
        <div className="bg-gray-100 rounded-lg p-4 mb-4 flex items-center justify-between">
          <p>{bio}</p>
        </div>
      </div>

      <Modal
        isOpen={isEditing}
        onClose={handleCloseModal}
        title="Edit Bio"
        description="Update your bio"
      >
        <form onSubmit={handleBioUpdate}>
          <label htmlFor="newBio" className="block mb-2 font-bold">
            Bio
          </label>
          <textarea
            id="newBio"
            name="newBio"
            value={newBio}
            onChange={handleInputChange}
            placeholder="Enter new bio"
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />

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

export default BioSection;
