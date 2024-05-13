import React, { useState, useEffect } from "react";
import { Edit, Trash, PlusSquare } from "lucide-react";
import { Modal } from "@/components/ui/modal";

interface Experience {
  id: string;
  poste: string;
  organisme: string;
  location?: string;
  description: string;
  date_debut?: string;
  date_fin?: string;
}

interface ExperiencesSectionProps {
  experiences: Experience[];
  onEdit: (updatedExperiences: Experience[]) => void;
}

const ExperiencesSection: React.FC<ExperiencesSectionProps> = ({
  experiences,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedExperience, setSelectedExperience] =
    useState<Experience | null>(null);
  const [editedExperiences, setEditedExperiences] = useState([...experiences]);
  const [formData, setFormData] = useState<Partial<Experience>>({
    poste: "",
    organisme: "",
    description: "",
    location: "",
    date_debut: "",
    date_fin: "",
  });

  useEffect(() => {
    if (selectedExperience) {
      // Populate form data with selected experience when editing
      setFormData({
        poste: selectedExperience.poste,
        organisme: selectedExperience.organisme,
        location: selectedExperience.location || "",
        description: selectedExperience.description,
        date_debut: selectedExperience.date_debut || "",
        date_fin: selectedExperience.date_fin || "",
      });
    } else {
      // Reset form data when adding a new experience
      setFormData({
        poste: "",
        organisme: "",
        description: "",
        location: "",
        date_debut: "",
        date_fin: "",
      });
    }
  }, [selectedExperience]);

  const handleEditClick = (experience: Experience | null) => {
    setSelectedExperience(experience);
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    setSelectedExperience(null);
  };

  const handleExperienceUpdate = () => {
    if (selectedExperience) {
      // Update existing experience
      const updatedExperience: Experience = {
        ...selectedExperience,
        poste: formData.poste || "",
        organisme: formData.organisme || "",
        location: formData.location || "",
        description: formData.description || "",
        date_debut: formData.date_debut || "",
        date_fin: formData.date_fin || "",
      };
      const updatedExperiences = editedExperiences.map((exp) =>
        exp.id === selectedExperience.id ? updatedExperience : exp,
      );
      onEdit(updatedExperiences);
    } else {
      // Add new experience
      const newExperience: Experience = {
        id: Date.now().toString(),
        poste: formData.poste || "",
        organisme: formData.organisme || "",
        description: formData.description || "",
        location: formData.location || "",
        date_debut: formData.date_debut || "",
        date_fin: formData.date_fin || "",
      };
      const updatedExperiences = [...editedExperiences, newExperience];
      onEdit(updatedExperiences);
    }
    setIsEditing(false);
    setSelectedExperience(null);
  };

  const handleInputChange = (key: keyof Partial<Experience>, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleDeleteExperience = (experience: Experience) => {
    const updatedExperiences = editedExperiences.filter(
      (exp) => exp.id !== experience.id,
    );
    setEditedExperiences(updatedExperiences);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Experiences</h2>
        <button
          onClick={() => handleEditClick(null)} // Add new experience
          className="text-gray-400 hover:text-gray-600"
        >
          <PlusSquare />
        </button>
      </div>
      <div className="p-6 relative">
        {experiences.map((exp: Experience) => (
          <div
            key={exp.id}
            className="bg-gray-100 rounded-lg p-4 mb-4 flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold">{exp.poste}</h3>
              <p className="text-gray-600">{exp.organisme}</p>
              {exp.location && (
                <p className="text-sm text-gray-600">
                  Location: {exp.location}
                </p>
              )}
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleEditClick(exp)} // Edit specific experience
                className="text-blue-500 hover:text-blue-700 mr-3"
              >
                <Edit width={20} height={20} />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteExperience(exp)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash width={20} height={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isEditing}
        onClose={handleCloseModal}
        title={selectedExperience ? "Edit Experience" : "Add Experience"}
        description={
          selectedExperience
            ? "Update experience details"
            : "Add a new experience"
        }
      >
        <form onSubmit={handleExperienceUpdate}>
          <label htmlFor="poste">Role:</label>
          <input
            type="text"
            id="poste"
            value={formData.poste}
            onChange={(e) => handleInputChange("poste", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />
          <label htmlFor="organisme">Organisme:</label>
          <input
            type="text"
            id="organisme"
            value={formData.organisme}
            onChange={(e) => handleInputChange("organisme", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            value={formData.location || ""}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />
          <label htmlFor="date_debut">Start Date:</label>
          <input
            type="date"
            id="date_debut"
            value={formData.date_debut || ""}
            onChange={(e) => handleInputChange("date_debut", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />
          <label htmlFor="date_fin">End Date:</label>
          <input
            type="date"
            id="date_fin"
            value={formData.date_fin || ""}
            onChange={(e) => handleInputChange("date_fin", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary-2 text-white font-bold py-2 px-4 rounded-md"
          >
            {selectedExperience ? "Save Changes" : "Add Experience"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ExperiencesSection;
