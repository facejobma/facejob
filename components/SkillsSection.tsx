import React, { useState } from "react";
import { Edit, Trash, Plus, PlusSquare } from "lucide-react";
import { Modal } from "@/components/ui/modal";

interface Skill {
  id: string;
  title: string;
}

interface SkillsSectionProps {
  skills: Skill[]; // Array of skills data
  onEdit: (updatedSkills: Skill[]) => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSkills, setEditedSkills] = useState([...skills]);
  const [newSkill, setNewSkill] = useState("");

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    // Reset to original skills when closing modal
    setEditedSkills([...skills]);
    setNewSkill("");
  };

  const handleSkillsUpdate = () => {
    // Perform update logic with editedSkills
    console.log("Updated skills:", editedSkills);
    onEdit(editedSkills);
    setIsEditing(false); // Close the modal after updating
  };

  const handleInputChange = (index: number, value: string) => {
    const updatedSkills = [...editedSkills];
    updatedSkills[index] = { ...updatedSkills[index], title: value };
    setEditedSkills(updatedSkills);
  };

  const handleRemoveSkill = (skillId: string) => {
    const updatedSkills = editedSkills.filter((skill) => skill.id !== skillId);
    setEditedSkills(updatedSkills);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() === "") return;
    const newId = Date.now().toString();
    const updatedSkills = [...editedSkills, { id: newId, title: newSkill }];
    setEditedSkills(updatedSkills);
    setNewSkill("");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Skills</h2>
        <button
          onClick={handleEditClick}
          className="text-gray-400 hover:text-gray-600"
        >
          <Edit />
        </button>
      </div>
      <div className="p-6 relative">
        <ul className="flex flex-wrap">
          {editedSkills.map((skill: Skill) => (
            <li
              key={skill.id}
              className="bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2 flex items-center"
            >
              <span className="mr-2">{skill.title}</span>
              {isEditing && (
                <button
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Modal for editing skills */}
      <Modal
        isOpen={isEditing}
        onClose={handleCloseModal}
        title="Edit Skills"
        description="Update your skills"
      >
        <div className="space-y-4">
          {editedSkills.map((skill: Skill, index: number) => (
            <div key={skill.id} className="flex items-center">
              <input
                type="text"
                value={skill.title}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="w-full border-gray-300 rounded-md py-2 px-3 mb-2"
              />
              <button
                onClick={() => handleRemoveSkill(skill.id)}
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
              placeholder="Add new skill"
              className="w-full border-gray-300 rounded-md py-2 px-3 mb-2"
            />
            <button
              onClick={handleAddSkill}
              // className="ml-2 bg-primary hover:bg-primary-2 text-white font-bold py-2 px-4 rounded-md"
              className="ml-2 text-blue-500 hover:text-blue-700"
            >
              <PlusSquare size={20} />
            </button>
          </div>
          <button
            onClick={handleSkillsUpdate}
            className="bg-primary hover:bg-primary-2 text-white font-bold py-2 px-4 rounded-md"
          >
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SkillsSection;
