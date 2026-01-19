"use client";

import React, { useState} from "react";
import { Edit } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";


interface BioEntrepSectionProps {
  id: number;
  bio: string;
}



const BioEntrepSection: React.FC<BioEntrepSectionProps> = ({ id, bio }) => {
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/enterprise/updateId/${id}`,
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

  const handleInputChange = (value: string) => {
    setNewBio(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Présentation de l'Entreprise</h2>
        <button
          onClick={handleEditClick}
          className="text-gray-400 hover:text-gray-600"
        >
          <Edit />
        </button>
      </div>
      <div className="p-6 relative">
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <div dangerouslySetInnerHTML={{ __html: newBio }} />
        </div>
      </div>

      <Modal
        isOpen={isEditing}
        onClose={handleCloseModal}
        title="Modifier la Description"
        description="Mettre à jour la Description de votre Entreprise"
      >
        <form onSubmit={handleBioUpdate}>
          <input
            value={newBio}
            onChange={(e)=>handleInputChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 mt 6 h-32"
            placeholder="Entrez la description de l’entreprise"
          />
          <br></br>
          <br></br>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md shadow-sm transition-colors"
          >
            Sauvegarder
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default BioEntrepSection;
