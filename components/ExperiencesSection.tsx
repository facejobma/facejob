"use client";
import React, { useState, useEffect } from "react";
import { Edit, Trash, PlusSquare } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";

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
  id: string;
  experiences: Experience[];
}

const ExperiencesSection: React.FC<ExperiencesSectionProps> = ({
  id,
  experiences,
}) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  const [isEditing, setIsEditing] = useState(false);
  const [selectedExperience, setSelectedExperience] =
    useState<Experience | null>(null);
  const [editedExperiences, setEditedExperiences] = useState([...experiences]);
  const [isCurrentJob, setIsCurrentJob] = useState(false);
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
      setFormData({
        poste: selectedExperience.poste,
        organisme: selectedExperience.organisme,
        location: selectedExperience.location || "",
        description: selectedExperience.description,
        date_debut: selectedExperience.date_debut || "",
        date_fin: selectedExperience.date_fin || "",
      });
      setIsCurrentJob(!selectedExperience.date_fin); // If date_fin is empty, user is still working
    } else {
      setFormData({
        poste: "",
        organisme: "",
        description: "",
        location: "",
        date_debut: "",
        date_fin: "",
      });
      setIsCurrentJob(false);
    }
  }, [selectedExperience]);

  const handleCurrentJobToggle = () => {
    setIsCurrentJob((prev) => !prev);
    if (!isCurrentJob) {
      setFormData((prevData) => ({
        ...prevData,
        date_fin: "", // Clear date_fin if checkbox is selected
      }));
    }
  };

  const handleEditClick = (experience: Experience | null) => {
    setSelectedExperience(experience);
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    setSelectedExperience(null);
  };

  const handleExperienceUpdate = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (selectedExperience) {
      // Update existing experience
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/experience/update/${selectedExperience.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              poste: formData.poste,
              organisme: formData.organisme,
              location: formData.location,
              description: formData.description,
              date_debut: formData.date_debut,
              date_fin: formData.date_fin,
              candidat_id: id,
            }),
          },
        );

        if (response.ok) {
          const updatedExperience = await response.json();
          const updatedExperiences = editedExperiences.map((exp) =>
            exp.id === selectedExperience.id ? updatedExperience : exp,
          );
          setEditedExperiences(updatedExperiences);
        } else {
          console.error("Failed to update experience");
        }
      } catch (error) {
        console.error("Error updating experience:", error);
      }
    } else {
      // Add new experience
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/experience/add`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              poste: formData.poste,
              organisme: formData.organisme,
              location: formData.location,
              description: formData.description,
              date_debut: formData.date_debut,
              date_fin: formData.date_fin,
              candidat_id: id,
            }),
          },
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setEditedExperiences((prevExperiences) => [
              ...prevExperiences,
              result.experience,
            ]);
          } else {
            console.error("Failed to add experience:", result.message);
          }
        } else {
          console.error("Failed to add new experience");
        }
      } catch (error) {
        console.error("Error adding new experience:", error);
      }
    }

    // Close modal and reset state after adding or updating
    setIsEditing(false);
    setSelectedExperience(null);
  };

  const handleInputChange = (key: keyof Partial<Experience>, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
    };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  const handleDeleteExperience = async (experience: Experience) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/experience/delete/${experience.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const updatedExperienceList = editedExperiences.filter(
          (exp) => exp.id !== experience.id,
        );
        setEditedExperiences(updatedExperienceList);
      } else {
        console.error("Failed to delete experience");
      }
    } catch (error) {
      console.error("Error deleting experience:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Expériences</h2>
        <button
          onClick={() => handleEditClick(null)} // Add new experience
          className="text-gray-400 hover:text-gray-600"
        >
          <PlusSquare />
        </button>
      </div>
      <div className="p-6 relative">
        {editedExperiences.map((exp: Experience) => (
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
              {/* Display the date range */}
              <p className="text-sm text-gray-600">
                {formatDate(exp.date_debut)} -{" "}
                {exp.date_fin ? formatDate(exp.date_fin) : "Present"}
              </p>
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
        title={
          selectedExperience
            ? "Modifier l'expérience"
            : "Ajouter une Expérience"
        }
        description={
          selectedExperience
            ? "Modifier les détails de l'expérience"
            : "Ajouter une nouvelle expérience"
        }
      >
        <form onSubmit={handleExperienceUpdate}>
          <label htmlFor="poste">Poste</label>
          <input
            type="text"
            id="poste"
            value={formData.poste}
            onChange={(e) => handleInputChange("poste", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />
          <label htmlFor="organisme">Entreprise</label>
          <input
            type="text"
            id="organisme"
            value={formData.organisme}
            onChange={(e) => handleInputChange("organisme", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />
          <label htmlFor="location">Lieu</label>
          <input
            type="text"
            id="location"
            value={formData.location || ""}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />
          <label htmlFor="date_debut">Date de début</label>
          <input
            type="date"
            id="date_debut"
            value={formData.date_debut || ""}
            onChange={(e) => handleInputChange("date_debut", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="current_job"
              checked={isCurrentJob}
              onChange={handleCurrentJobToggle}
              className="mr-2"
            />
            <label htmlFor="current_job">Je travaille toujours ici</label>
          </div>
          {!isCurrentJob && (
            <>
              <label htmlFor="date_fin">Date de fin</label>
              <input
                type="date"
                id="date_fin"
                value={formData.date_fin || ""}
                onChange={(e) => handleInputChange("date_fin", e.target.value)}
                className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
              />
            </>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md"
          >
            {selectedExperience ? "Mettre à jour" : "Ajouter"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ExperiencesSection;
