"use client";

import React, { useState } from "react";
import { Edit } from "lucide-react";
import { FaPlus } from "react-icons/fa";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";

interface BioSectionProps {
  id: number;
  bio: string;
}

const BioSection: React.FC<BioSectionProps> = ({ id, bio }) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  const [isEditing, setIsEditing] = useState(false);
  const [currentBio, setCurrentBio] = useState(bio); // State for current bio
  const [newBio, setNewBio] = useState(bio); // State for editing

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    setNewBio(currentBio); // Reset newBio to the current bio
  };

  const handleBioUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate/updateId/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bio: newBio,
          }),
        }
      );

      if (response.ok) {
        const updatedData = await response.json();
        console.log("Updated bio:", updatedData);

        // Update the bio state to reflect changes
        setCurrentBio(newBio);

        // Close modal
        setIsEditing(false);
      } else {
        console.error("Failed to update bio");
      }
    } catch (error) {
      console.error("Error updating bio:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewBio(e.target.value);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleEditClick}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" />
          {currentBio && currentBio.trim().length > 0 ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
      <div>
        {currentBio && currentBio.trim().length > 0 ? (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-gray-800 text-sm leading-relaxed">{currentBio}</p>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Aucune description ajoutée</p>
            <button
              onClick={handleEditClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <FaPlus className="w-4 h-4" />
              Ajouter une description
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isEditing}
        onClose={handleCloseModal}
        title="Editer Description "
        description="Mettre à jour votre description"
      >
        <form onSubmit={handleBioUpdate}>
          <label htmlFor="newBio" className="block mb-2 font-bold">
            Votre Description
          </label>
          <textarea
            id="newBio"
            name="newBio"
            value={newBio}
            onChange={handleInputChange}
            placeholder="Qu’est-ce qui vous caractérise ?"
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md shadow-sm transition-colors"
          >
            Enregistrer 
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default BioSection;
