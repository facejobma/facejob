"use client";

import React, { useState } from "react";
import { Edit, Trash, PlusSquare } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";

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
        setIsEditing(false); // Close modal on success
      } else {
        console.error("Failed to update skills");
      }
    } catch (error) {
      console.error("Error updating skills:", error);
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
      } else {
        console.error("Failed to delete skill");
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
    }
  };

  const handleAddSkill = async () => {

    console.log("HANDLE ADD SKILL, ", newSkill);
    
    if (!newSkill.trim()) return;

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
      } else {
        console.error("Failed to add skill");
      }
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Compétences</h2>
        <button
          onClick={handleEditClick}
          className="text-gray-400 hover:text-gray-600"
        >
          <Edit />
        </button>
      </div>
      <div className="p-6 relative">
        {editedSkills && editedSkills.length > 0 ? (
          <ul className="flex flex-wrap">
            {editedSkills.map((skill: Skill) => (
              <li
                key={skill.id}
                className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full px-4 py-2 mr-2 mb-2 flex items-center font-medium shadow-sm"
              >
                <span className="mr-2">{skill.title}</span>
                {isEditing && (
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4">
            <button
              onClick={handleEditClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <PlusSquare className="text-sm" />
              Ajouter des compétences
            </button>
          </div>
        )}
      </div>
      {/* Modal for editing skills */}
      <Modal
        isOpen={isEditing}
        onClose={handleCloseModal}
        title="Editer vos Compétences"
        description="Ajouter un savoir-faire ou un savoir-être"
      >
        <div className="space-y-4">
          {editedSkills.map((skill: Skill, index: number) => (
            <div key={skill.id} className="flex items-center">
              <input
                type="text"
                value={skill.title}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="w-full border-gray-300 rounded-md py-2 px-3 mb-2"
                placeholder="Ex: JavaScript, Communication, Leadership..."
              />
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <Trash size={20} />
              </button>
            </div>
          ))}
          <div className="flex items-center">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Ajouter une nouvelle compétence"
              className="w-full border-gray-300 rounded-md py-2 px-3 mb-2"
            />
            <button
              onClick={handleAddSkill}
              className="ml-2 text-blue-500 hover:text-blue-700"
            >
              <PlusSquare size={20} />
            </button>
          </div>
          <button
            onClick={handleSkillsUpdate}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md shadow-sm transition-colors"
          >
            Sauvegarder
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SkillsSection;
