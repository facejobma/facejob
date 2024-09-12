"use client";

import React, { useState } from "react";
import { Edit } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";

interface BioSectionProps {
  id: number;
  bio: string;
}

const BioSection: React.FC<BioSectionProps> = ({ id, bio }) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  const [isEditing, setIsEditing] = useState(false);
  const [newBio, setNewBio] = useState(bio);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    setNewBio(bio); 
  };

  const handleBioUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidate/updateId/${id}`,
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
    <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Votre Description</h2>
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
            className="bg-primary hover:bg-primary-2 text-white font-bold py-2 px-4 rounded-md"
          >
            Enregistrer 
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default BioSection;
