"use client";

import React, { useState } from "react";
import { Edit } from "lucide-react";
import { FaPlus } from "react-icons/fa";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

interface BioSectionProps {
  id: number;
  bio: string;
  onUpdate?: () => void;
}

const BioSection: React.FC<BioSectionProps> = ({ id, bio, onUpdate }) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  const [isEditing, setIsEditing] = useState(false);
  const [currentBio, setCurrentBio] = useState(bio);
  const [newBio, setNewBio] = useState(bio);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    // Check if there's unsaved data
    if (newBio !== currentBio) {
      const confirmClose = window.confirm(
        "Vous avez des modifications non enregistrées. Voulez-vous vraiment fermer?"
      );
      if (!confirmClose) return;
    }
    
    setIsEditing(false);
    setNewBio(currentBio);
  };

  const handleBioUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newBio.trim()) {
      toast.error("La description ne peut pas être vide");
      return;
    }

    setIsSubmitting(true);

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

        setCurrentBio(newBio);
        toast.success("Description mise à jour!");
        setIsEditing(false);
        onUpdate?.(); // Refresh profile completion
      } else {
        console.error("Failed to update bio");
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Error updating bio:", error);
      toast.error("Erreur réseau");
    } finally {
      setIsSubmitting(false);
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
        title="Editer Description"
        description="Mettre à jour votre description"
      >
        <form onSubmit={handleBioUpdate} className="space-y-5">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
            <label htmlFor="newBio" className="block text-sm font-semibold text-gray-700 mb-2">
              Votre Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="newBio"
              name="newBio"
              value={newBio}
              onChange={handleInputChange}
              placeholder="Parlez de vous, votre parcours, vos objectifs professionnels..."
              rows={8}
              className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-2.5 px-4 outline-none transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {newBio.length} caractères • Minimum 20 caractères recommandés
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newBio.trim()}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Enregistrement...</span>
                </>
              ) : (
                "Enregistrer"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BioSection;
