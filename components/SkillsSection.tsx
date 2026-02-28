"use client";

import React, { useState } from "react";
import { Edit, Trash, PlusSquare, X, Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { FaCog } from "react-icons/fa";

interface Skill {
  id: string;
  title: string;
}

interface SkillsSectionProps {
  id: number;
  skills: Skill[];
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ id, skills }) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  const [isEditing, setIsEditing] = useState(false);
  const [editedSkills, setEditedSkills] = useState([...skills]);
  const [newSkill, setNewSkill] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    setEditedSkills([...skills]); // Reset to original skills
    setNewSkill(""); // Clear new skill input
  };

  const handleSkillsUpdate = async () => {
    console.log("Skills Update, ", editedSkills);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidat/${id}/skills`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ skills: editedSkills }),
        },
      );

      if (response.ok) {
        const updatedSkills = await response.json();
        setEditedSkills(updatedSkills);
        toast.success("Compétences mises à jour!");
        setIsEditing(false); // Close modal on success
      } else {
        console.error("Failed to update skills");
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Error updating skills:", error);
      toast.error("Erreur réseau");
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const updatedSkills = [...editedSkills];
    updatedSkills[index] = { ...updatedSkills[index], title: value };
    setEditedSkills(updatedSkills);
  };

  const handleRemoveSkill = async (skill: Skill) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidat/skill/delete/${skill.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        setEditedSkills((prev) => prev.filter((sk) => sk.id !== skill.id));
        toast.success("Compétence supprimée");
      } else {
        console.error("Failed to delete skill");
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast.error("Erreur réseau");
    }
  };

  const handleAddSkill = async () => {
    console.log("HANDLE ADD SKILL, ", newSkill);
    
    if (!newSkill.trim()) {
      toast.error("Veuillez entrer une compétence");
      return;
    }

    setIsAdding(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidat/${id}/skills`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: newSkill }),
        },
      );

      if (response.ok) {
        const addedSkill = await response.json();
        setEditedSkills((prev) => [...prev, addedSkill]); // Append new skill
        setNewSkill(""); // Clear input field
        toast.success("Compétence ajoutée!");
      } else {
        console.error("Failed to add skill");
        toast.error("Erreur lors de l'ajout");
      }
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error("Erreur réseau");
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleEditClick}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" />
          {editedSkills && editedSkills.length > 0 ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
      <div>
        {editedSkills && editedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {editedSkills.map((skill: Skill) => (
              <span
                key={skill.id}
                className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-1.5 text-sm font-medium"
              >
                {skill.title}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Aucune compétence ajoutée</p>
            <button
              onClick={handleEditClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <PlusSquare className="w-4 h-4" />
              Ajouter des compétences
            </button>
          </div>
        )}
      </div>
      {/* Modal for editing skills */}
      <Modal
        isOpen={isEditing}
        onClose={handleCloseModal}
        title="Gérer vos Compétences"
        description="Ajoutez vos savoir-faire et savoir-être"
      >
        <div className="space-y-6">
          {/* Add New Skill Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                <FaCog className="text-green-600 text-sm" />
              </div>
              <h3 className="font-semibold text-gray-900">Ajouter une compétence</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ex: JavaScript, Communication, Leadership..."
                className="flex-1 border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-2.5 px-4 outline-none transition-all"
                disabled={isAdding}
              />
              <button
                onClick={handleAddSkill}
                disabled={isAdding || !newSkill.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Ajout...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Ajouter</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-green-700 mt-2">
              💡 Appuyez sur "Entrée" pour ajouter rapidement
            </p>
          </div>

          {/* Skills List */}
          {editedSkills.length > 0 ? (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>Vos compétences</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {editedSkills.length}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {editedSkills.map((skill: Skill) => (
                  <div
                    key={skill.id}
                    className="group flex items-center gap-2 bg-white border-2 border-green-200 hover:border-green-400 rounded-lg px-3 py-2 transition-all"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {skill.title}
                    </span>
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <FaCog className="text-gray-400 text-3xl mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Aucune compétence ajoutée pour le moment
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Utilisez le champ ci-dessus pour ajouter vos compétences
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleSkillsUpdate}
              className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-sm"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SkillsSection;
