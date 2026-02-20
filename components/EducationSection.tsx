"use client"

import React, { useState, useEffect } from "react";
import { Edit, PlusSquare, Trash } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";

interface Education {
  id: string;
  school_name: string;
  degree: string;
  title: string;
  graduation_date: string;
}

interface Degree {
  id: string;
  name: string;
  level: string;
}

interface EducationSectionProps {
  id: number;
  education: Education[];
}

const EducationSection: React.FC<EducationSectionProps> = ({
  id,
  education,
}) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  const [isEditing, setIsEditing] = useState(false);
  const [editedEducation, setEditedEducation] = useState([...education]);
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(
    null,
  );
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [formData, setFormData] = useState<Partial<Education>>({
    school_name: "",
    degree: "",
    title: "",
    graduation_date: "",
  });

  useEffect(() => {
    // Fetch degrees (diplomes) from the backend
    const fetchDegrees = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/diplomes`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setDegrees(data);
        } else {
          console.warn("Failed to fetch degrees, using empty list");
          setDegrees([]);
        }
      } catch (error) {
        console.warn("Error fetching degrees, using empty list:", error);
        setDegrees([]);
      }
    };

    fetchDegrees();
  }, [authToken]);

  useEffect(() => {
    if (selectedEducation) {
      // Populate form data with selected education when editing
      setFormData({ ...selectedEducation });
    } else {
      // Reset form data when adding a new education entry
      setFormData({
        school_name: "",
        degree: "",
        title: "",
        graduation_date: "",
      });
    }
  }, [selectedEducation]);

  const handleEditClick = (education: Education | null) => {
    setSelectedEducation(education);
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    setSelectedEducation(null);
  };

  const handleEducationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedEducation) {
      // Update existing education entry
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidat/${id}/formation/${selectedEducation.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          },
        );

        if (response.ok) {
          const updatedEducation = await response.json();
          const updatedEducationList = editedEducation.map((edu) =>
            edu.id === selectedEducation.id ? updatedEducation : edu,
          );
          setEditedEducation(updatedEducationList);
        } else {
          console.error("Failed to update education");
        }
      } catch (error) {
        console.error("Error updating education:", error);
      }
    } else {
      // Add new education entry
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidat/${id}/education`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          },
        );

        if (response.ok) {
          const addedEducation = await response.json();
          setEditedEducation((prevEducation) => [
            ...prevEducation,
            addedEducation,
          ]);
        } else {
          console.error("Failed to add education");
        }
      } catch (error) {
        console.error("Error adding education:", error);
      }
    }

    setIsEditing(false);
    setSelectedEducation(null);
  };

  const handleInputChange = (key: keyof Partial<Education>, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleDeleteEducation = async (education: Education) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/formation/delete/${education.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const updatedEducationList = editedEducation.filter(
          (edu) => edu.id !== education.id,
        );
        setEditedEducation(updatedEducationList);
      } else {
        console.error("Failed to delete education");
      }
    } catch (error) {
      console.error("Error deleting education:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => handleEditClick(null)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
        >
          <PlusSquare className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      <div className="space-y-3">
        {editedEducation && editedEducation.length > 0 ? (
          editedEducation.map((edu: Education) => (
            <div
              key={edu.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-base text-gray-900 mb-1">
                    {edu.title || "Formation"}
                  </h3>
                  
                  {edu.degree && (
                    <p className="text-sm font-medium text-green-600 mb-1">
                      {edu.degree}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-700 mb-1">
                    {edu.school_name}
                  </p>
                  
                  {edu.graduation_date && (
                    <p className="text-xs text-gray-600">
                      📅 {new Date(edu.graduation_date).toLocaleDateString('fr-FR', { 
                        year: 'numeric', 
                        month: 'long'
                      })}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => handleEditClick(edu)}
                    className="text-blue-500 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded transition-colors"
                    title="Modifier"
                  >
                    <Edit width={16} height={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEducation(edu)}
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
            <PlusSquare className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-3">Aucune formation ajoutée</p>
            <button
              onClick={() => handleEditClick(null)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <PlusSquare className="w-4 h-4" />
              Ajouter une formation
            </button>
          </div>
        )}
      </div>

      {/* Modal for editing education entry */}
      <Modal
        isOpen={isEditing}
        onClose={handleCloseModal}
        title={selectedEducation ? "Modifier une Formation" : "Ajouter une Formation"}
        description={
          selectedEducation
            ? "Modifier un diplôme ou une certification"
            : "Ajouter un diplôme ou une certification"
        }
      >
        <form onSubmit={handleEducationUpdate} className="space-y-4">
          {/* Title of Formation */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Titre de la Formation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title || ""}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Ex: Ingénieur en Informatique, Master en Marketing..."
              className="w-full border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-3 px-4 transition-all"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Le titre ou spécialité de votre formation</p>
          </div>

          {/* Degree/Diploma Level */}
          <div>
            <label htmlFor="degree" className="block text-sm font-semibold text-gray-700 mb-2">
              Niveau de Diplôme <span className="text-red-500">*</span>
            </label>
            <select
              id="degree"
              value={formData.degree || ""}
              onChange={(e) => handleInputChange("degree", e.target.value)}
              className="w-full border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-3 px-4 transition-all"
              required
            >
              <option value="">-- Sélectionnez un niveau --</option>
              {degrees.map((degree) => (
                <option key={degree.id} value={degree.name}>
                  {degree.name} {degree.level && `(${degree.level})`}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Le niveau ou équivalence de votre diplôme</p>
          </div>

          {/* School/Institution */}
          <div>
            <label htmlFor="school_name" className="block text-sm font-semibold text-gray-700 mb-2">
              Établissement <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="school_name"
              value={formData.school_name || ""}
              onChange={(e) => handleInputChange("school_name", e.target.value)}
              placeholder="Ex: Université Mohammed V, ENSA Rabat, OFPPT..."
              className="w-full border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-3 px-4 transition-all"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Le nom de l'école, université ou centre de formation</p>
          </div>

          {/* Graduation Date */}
          <div>
            <label htmlFor="graduation_date" className="block text-sm font-semibold text-gray-700 mb-2">
              Date d'Obtention <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="graduation_date"
              value={formData.graduation_date || ""}
              onChange={(e) =>
                handleInputChange("graduation_date", e.target.value)
              }
              className="w-full border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-3 px-4 transition-all"
              required
            />
            <p className="text-xs text-gray-500 mt-1">La date à laquelle vous avez obtenu ce diplôme</p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {selectedEducation ? (
                <>
                  <Edit width={18} height={18} />
                  Enregistrer les modifications
                </>
              ) : (
                <>
                  <PlusSquare width={18} height={18} />
                  Ajouter la formation
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EducationSection;
