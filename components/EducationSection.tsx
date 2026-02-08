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
          console.error("Failed to fetch degrees");
        }
      } catch (error) {
        console.error("Error fetching degrees:", error);
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
    <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 flex justify-between items-center border-b border-green-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-green-600">🎓</span>
            Formation Académique
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Vos diplômes et certifications
          </p>
        </div>
        <button
          onClick={() => handleEditClick(null)} // Add new education entry
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          <PlusSquare width={18} height={18} />
          <span className="hidden sm:inline">Ajouter</span>
        </button>
      </div>

      <div className="p-6 relative">
        {editedEducation && editedEducation.length > 0 ? (
          editedEducation.map((edu: Education) => (
            <div
              key={edu.id}
              className="bg-white border-l-4 border-green-500 shadow-sm hover:shadow-md rounded-lg p-6 mb-4 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Title of the formation */}
                  <div className="mb-3">
                    <h3 className="font-bold text-xl text-gray-900 mb-1">
                      {edu.title || "Formation"}
                    </h3>
                    <div className="h-1 w-16 bg-green-500 rounded-full"></div>
                  </div>
                  
                  {/* Degree/Diploma */}
                  {edu.degree && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-600 font-medium">🎓</span>
                      <p className="text-base font-semibold text-green-700">
                        {edu.degree}
                      </p>
                    </div>
                  )}
                  
                  {/* School/Institution */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-500">🏫</span>
                    <p className="text-sm text-gray-700 font-medium">
                      {edu.school_name}
                    </p>
                  </div>
                  
                  {/* Graduation Date */}
                  {edu.graduation_date && (
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-gray-400">📅</span>
                      <p className="text-sm text-gray-600">
                        Diplômé(e) le {new Date(edu.graduation_date).toLocaleDateString('fr-FR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditClick(edu)}
                    className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit width={18} height={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEducation(edu)}
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
                <PlusSquare className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune formation ajoutée</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Ajoutez vos diplômes, certifications et formations pour compléter votre profil académique.
              </p>
            </div>
            <button
              onClick={() => handleEditClick(null)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <PlusSquare className="text-sm" />
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
