"use client";
import React, { useState, useEffect } from "react";
import { Edit, Trash, PlusSquare, Briefcase } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useExperiencePromptContext } from "@/contexts/ExperiencePromptContext";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showPrompt } = useExperiencePromptContext();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedExperience, setSelectedExperience] =
    useState<Experience | null>(null);
  const [editedExperiences, setEditedExperiences] = useState([...experiences]);
  const [isCurrentJob, setIsCurrentJob] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
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

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newExperiences = [...editedExperiences];
    const draggedItem = newExperiences[draggedIndex];
    newExperiences.splice(draggedIndex, 1);
    newExperiences.splice(index, 0, draggedItem);

    setEditedExperiences(newExperiences);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
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
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (selectedExperience) {
      // Update existing experience
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/experience/update/${selectedExperience.id}`,
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
          const result = await response.json();
          if (result.status === 'success') {
            const updatedExperiences = editedExperiences.map((exp) =>
              exp.id === selectedExperience.id ? result.data : exp,
            );
            setEditedExperiences(updatedExperiences);
          } else {
            console.error("Failed to update experience:", result.message);
          }
        } else {
          console.error("Failed to update experience");
        }
      } catch (error) {
        console.error("Error updating experience:", error);
      } finally {
        setIsSubmitting(false); // réactive après soumission
      }
    } else {
      // Add new experience
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/experience/add`,
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
          if (result.status === 'success') {
            setEditedExperiences((prevExperiences) => [
              ...prevExperiences,
              result.data,
            ]);
          } else {
            console.error("Failed to add experience:", result.message);
          }
        } else {
          console.error("Failed to add new experience");
        }
      } catch (error) {
        console.error("Error adding new experience:", error);
      } finally {
        setIsSubmitting(false); // réactive après soumission
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/experience/delete/${experience.id}`,
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
        <div className="flex gap-2">
          <button
            onClick={showPrompt}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title="Ajouter des expériences avec l'assistant"
          >
            <Briefcase className="w-4 h-4" />
            Assistant
          </button>
          <button
            onClick={() => handleEditClick(null)} // Add new experience
            className="text-gray-400 hover:text-gray-600"
          >
            <PlusSquare />
          </button>
        </div>
      </div>
      <div className="p-6 relative">
        {editedExperiences && editedExperiences.length > 0 ? (
          editedExperiences.map((exp: Experience, index: number) => (
            <div
              key={exp.id || `temp-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 mb-4 hover:shadow-md transition-shadow cursor-move ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <circle cx="7" cy="5" r="1.5"/>
                      <circle cx="13" cy="5" r="1.5"/>
                      <circle cx="7" cy="10" r="1.5"/>
                      <circle cx="13" cy="10" r="1.5"/>
                      <circle cx="7" cy="15" r="1.5"/>
                      <circle cx="13" cy="15" r="1.5"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{exp.poste}</h3>
                    <p className="text-green-600 font-semibold mb-2">{exp.organisme}</p>
                  {exp.location && (
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                      <span>📍</span> {exp.location}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                    <span>📅</span>
                    {formatDate(exp.date_debut)} - {exp.date_fin ? formatDate(exp.date_fin) : "Poste actuel"}
                  </p>
                  {exp.description && (
                    <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
                  )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => handleEditClick(exp)}
                    className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit width={18} height={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteExperience(exp)}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash width={18} height={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune expérience ajoutée</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Commencez par ajouter votre première expérience professionnelle pour enrichir votre profil.
              </p>
            </div>
            <button
              onClick={() => handleEditClick(null)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <PlusSquare className="text-sm" />
              Ajouter une expérience
            </button>
          </div>
        )}
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
            placeholder="Ex: Développeur Full Stack"
          />
          <label htmlFor="organisme">Entreprise</label>
          <input
            type="text"
            id="organisme"
            value={formData.organisme}
            onChange={(e) => handleInputChange("organisme", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
            placeholder="Ex: Google, Microsoft, etc."
          />
          <label htmlFor="location">Lieu</label>
          <input
            type="text"
            id="location"
            value={formData.location || ""}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
            placeholder="Ex: Casablanca, Maroc"
          />
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
            placeholder="Décrivez vos responsabilités et réalisations..."
          />
          <label htmlFor="date_debut">Date de début</label>
          <input
            type="date"
            id="date_debut"
            value={formData.date_debut || ""}
            onChange={(e) => handleInputChange("date_debut", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
            placeholder="Sélectionnez la date de début"
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
                placeholder="Sélectionnez la date de fin"
              />
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              isSubmitting 
                ? "bg-gray-400 cursor-not-allowed text-white" 
                : "bg-green-600 hover:bg-green-700 text-white shadow-sm"
            }`}
          >
            {isSubmitting
              ? "Envoi en cours..."
              : selectedExperience
                ? "Mettre à jour"
                : "Ajouter"}
          </button>

        </form>
      </Modal>
    </div>
  );
};

export default ExperiencesSection;
