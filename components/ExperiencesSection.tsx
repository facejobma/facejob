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
  onUpdate?: () => void;
}

const ExperiencesSection: React.FC<ExperiencesSectionProps> = ({
  id,
  experiences,
  onUpdate,
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
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
    // Check if there are unsaved changes
    const hasChanges = 
      formData.poste || 
      formData.organisme || 
      formData.description || 
      formData.location || 
      formData.date_debut || 
      formData.date_fin;

    if (hasChanges && !selectedExperience) {
      const confirmClose = window.confirm(
        "Vous avez des modifications non enregistrées. Voulez-vous vraiment fermer ?"
      );
      if (!confirmClose) return;
    }

    setIsEditing(false);
    setSelectedExperience(null);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.poste?.trim()) {
      errors.poste = "Le poste est obligatoire";
    }

    if (!formData.organisme?.trim()) {
      errors.organisme = "L'entreprise est obligatoire";
    }

    if (!formData.date_debut) {
      errors.date_debut = "La date de début est obligatoire";
    }

    if (!isCurrentJob && !formData.date_fin) {
      errors.date_fin = "La date de fin est obligatoire (ou cochez 'Poste actuel')";
    }

    if (formData.date_debut && formData.date_fin && formData.date_debut > formData.date_fin) {
      errors.date_fin = "La date de fin doit être après la date de début";
    }

    if (!formData.description?.trim()) {
      errors.description = "La description est obligatoire";
    } else if (formData.description.trim().length < 20) {
      errors.description = "La description doit contenir au moins 20 caractères";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleExperienceUpdate = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate form
    if (!validateForm()) {
      return;
    }

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
            onUpdate?.(); // Refresh profile completion
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
            onUpdate?.(); // Refresh profile completion
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
    // Clear error for this field when user starts typing
    if (formErrors[key]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
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
        onUpdate?.(); // Refresh profile completion
      } else {
        console.error("Failed to delete experience");
      }
    } catch (error) {
      console.error("Error deleting experience:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
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
            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
          >
            <PlusSquare className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {editedExperiences && editedExperiences.length > 0 ? (
          editedExperiences.map((exp: Experience, index: number) => (
            <div
              key={exp.id || `temp-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all cursor-move ${
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
                    <h3 className="font-semibold text-base text-gray-900 mb-1">{exp.poste}</h3>
                    <p className="text-green-600 font-medium text-sm mb-2">{exp.organisme}</p>
                  {exp.location && (
                    <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <span>📍</span> {exp.location}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
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
                    className="text-blue-500 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded transition-colors"
                    title="Modifier"
                  >
                    <Edit width={16} height={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteExperience(exp)}
                    className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-colors"
                    title="Supprimer"
                  >
                    <Trash width={16} height={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Briefcase className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-3">Aucune expérience ajoutée</p>
            <button
              onClick={() => handleEditClick(null)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <PlusSquare className="w-4 h-4" />
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
            ? "Modifier les détails de l'expérience professionnelle"
            : "Ajoutez les détails de votre expérience professionnelle"
        }
      >
        <form onSubmit={handleExperienceUpdate} className="space-y-5">
          {/* Show missing fields summary */}
          {Object.keys(formErrors).length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 mb-1">
                    Veuillez corriger les erreurs suivantes :
                  </h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {Object.entries(formErrors).map(([field, error]) => (
                      <li key={field} className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Poste */}
          <div>
            <label htmlFor="poste" className="block text-sm font-semibold text-gray-700 mb-2">
              Poste <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="poste"
              value={formData.poste}
              onChange={(e) => handleInputChange("poste", e.target.value)}
              className={`w-full border ${formErrors.poste ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-green-500 focus:ring-green-200'} focus:ring-2 rounded-lg py-2.5 px-4 transition-all outline-none`}
              placeholder="Ex: Développeur Full Stack"
            />
            {formErrors.poste && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠️</span> {formErrors.poste}
              </p>
            )}
          </div>

          {/* Entreprise */}
          <div>
            <label htmlFor="organisme" className="block text-sm font-semibold text-gray-700 mb-2">
              Entreprise <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="organisme"
              value={formData.organisme}
              onChange={(e) => handleInputChange("organisme", e.target.value)}
              className={`w-full border ${formErrors.organisme ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-green-500 focus:ring-green-200'} focus:ring-2 rounded-lg py-2.5 px-4 transition-all outline-none`}
              placeholder="Ex: Google, Microsoft, etc."
            />
            {formErrors.organisme && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠️</span> {formErrors.organisme}
              </p>
            )}
          </div>

          {/* Lieu */}
          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
              Lieu
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
              <input
                type="text"
                id="location"
                value={formData.location || ""}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="w-full border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-2.5 pl-10 pr-4 transition-all outline-none"
                placeholder="Ex: Casablanca, Maroc"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date_debut" className="block text-sm font-semibold text-gray-700 mb-2">
                Date de début <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date_debut"
                value={formData.date_debut || ""}
                onChange={(e) => handleInputChange("date_debut", e.target.value)}
                className={`w-full border ${formErrors.date_debut ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-green-500 focus:ring-green-200'} focus:ring-2 rounded-lg py-2.5 px-4 transition-all outline-none`}
              />
              {formErrors.date_debut && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠️</span> {formErrors.date_debut}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="date_fin" className="block text-sm font-semibold text-gray-700 mb-2">
                Date de fin {!isCurrentJob && <span className="text-red-500">*</span>}
              </label>
              <input
                type="date"
                id="date_fin"
                disabled={isCurrentJob}
                value={formData.date_fin || ""}
                onChange={(e) => handleInputChange("date_fin", e.target.value)}
                className={`w-full border ${formErrors.date_fin ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-green-500 focus:ring-green-200'} focus:ring-2 rounded-lg py-2.5 px-4 transition-all outline-none ${
                  isCurrentJob ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              {formErrors.date_fin && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠️</span> {formErrors.date_fin}
                </p>
              )}
            </div>
          </div>

          {/* Checkbox Poste actuel */}
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <input
              type="checkbox"
              id="current_job"
              checked={isCurrentJob}
              onChange={handleCurrentJobToggle}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
            />
            <label htmlFor="current_job" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
              Je travaille actuellement à ce poste
            </label>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`w-full border ${formErrors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-green-500 focus:ring-green-200'} focus:ring-2 rounded-lg py-2.5 px-4 transition-all outline-none resize-none`}
              placeholder="Décrivez vos responsabilités, réalisations et compétences développées..."
            />
            {formErrors.description ? (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠️</span> {formErrors.description}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Minimum 20 caractères requis • {formData.description?.length || 0} caractères
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                isSubmitting 
                  ? "bg-gray-400 cursor-not-allowed text-white" 
                  : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Enregistrement...
                </span>
              ) : (
                selectedExperience ? "Mettre à jour" : "Ajouter l'expérience"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExperiencesSection;
