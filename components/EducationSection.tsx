"use client"

import React, { useState, useEffect } from "react";
import { Edit, PlusSquare, Trash, X, Calendar } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { FaGraduationCap } from "react-icons/fa";

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
  onUpdate?: () => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({
  id,
  education,
  onUpdate,
}) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  const [isEditing, setIsEditing] = useState(false);
  const [editedEducation, setEditedEducation] = useState([...education]);
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(
    null,
  );
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [degreeSearchTerm, setDegreeSearchTerm] = useState("");
  const [isDegreeDropdownOpen, setIsDegreeDropdownOpen] = useState(false);
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
      setDegreeSearchTerm(selectedEducation.degree || "");
    } else {
      // Reset form data when adding a new education entry
      setFormData({
        school_name: "",
        degree: "",
        title: "",
        graduation_date: "",
      });
      setDegreeSearchTerm("");
    }
  }, [selectedEducation]);

  const handleEditClick = (education: Education | null) => {
    setSelectedEducation(education);
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    // Check if there's unsaved data
    if (formData.title?.trim() || formData.school_name?.trim() || formData.degree || formData.graduation_date) {
      const confirmClose = window.confirm(
        "Vous avez des modifications non enregistrées. Voulez-vous vraiment fermer?"
      );
      if (!confirmClose) return;
    }
    
    setIsEditing(false);
    setSelectedEducation(null);
    setDegreeSearchTerm("");
    setIsDegreeDropdownOpen(false);
    setFormData({
      school_name: "",
      degree: "",
      title: "",
      graduation_date: "",
    });
  };

  // Filter degrees based on search term
  const filteredDegrees = degrees.filter((degree) =>
    degree.name.toLowerCase().includes(degreeSearchTerm.toLowerCase()) ||
    (degree.level && degree.level.toLowerCase().includes(degreeSearchTerm.toLowerCase()))
  );

  const handleDegreeSelect = (degreeName: string) => {
    setFormData((prevData) => ({
      ...prevData,
      degree: degreeName,
    }));
    setDegreeSearchTerm(degreeName);
    setIsDegreeDropdownOpen(false);
  };

  const handleEducationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title?.trim()) {
      toast.error("Le titre de la formation est requis");
      return;
    }

    if (!formData.degree?.trim()) {
      toast.error("Le niveau de diplôme est requis");
      return;
    }

    if (!formData.school_name?.trim()) {
      toast.error("L'établissement est requis");
      return;
    }

    if (!formData.graduation_date?.trim()) {
      toast.error("La date d'obtention est requise");
      return;
    }

    setIsSubmitting(true);

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
          toast.success("Formation mise à jour!");
          onUpdate?.(); // Refresh profile completion
        } else {
          console.error("Failed to update education");
          toast.error("Erreur lors de la mise à jour");
        }
      } catch (error) {
        console.error("Error updating education:", error);
        toast.error("Erreur réseau");
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
          toast.success("Formation ajoutée!");
          onUpdate?.(); // Refresh profile completion
        } else {
          console.error("Failed to add education");
          toast.error("Erreur lors de l'ajout");
        }
      } catch (error) {
        console.error("Error adding education:", error);
        toast.error("Erreur réseau");
      }
    }

    setIsSubmitting(false);
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
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer "${education.title}" ?`
    );
    
    if (!confirmDelete) return;

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
        toast.success("Formation supprimée");
        onUpdate?.(); // Refresh profile completion
      } else {
        console.error("Failed to delete education");
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting education:", error);
      toast.error("Erreur réseau");
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
        title={selectedEducation ? "Modifier la Formation" : "Ajouter une Formation"}
        description={
          selectedEducation
            ? "Modifier un diplôme ou une certification"
            : "Ajouter un diplôme ou une certification à votre profil"
        }
      >
        <form onSubmit={handleEducationUpdate}>
          <div className="space-y-6">
            {/* Education Form Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <FaGraduationCap className="text-green-600 text-sm" />
                </div>
                <h3 className="font-semibold text-gray-900">Informations de la formation</h3>
              </div>

              <div className="space-y-4">
                {/* Title of Formation */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de la Formation *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Ex: Ingénieur en Informatique, Master en Marketing..."
                    className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-2.5 px-4 outline-none transition-all"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-green-700 mt-1">
                    💡 Le titre ou spécialité de votre formation
                  </p>
                </div>

                {/* Degree/Diploma Level with Search */}
                <div>
                  <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau de Diplôme *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="degree"
                      value={degreeSearchTerm}
                      onChange={(e) => {
                        setDegreeSearchTerm(e.target.value);
                        setIsDegreeDropdownOpen(true);
                        // Clear the actual degree value if user is typing
                        if (e.target.value !== formData.degree) {
                          setFormData((prevData) => ({
                            ...prevData,
                            degree: "",
                          }));
                        }
                      }}
                      onFocus={() => setIsDegreeDropdownOpen(true)}
                      placeholder="Rechercher un diplôme..."
                      className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-2.5 px-4 pr-10 outline-none transition-all"
                      required
                      disabled={isSubmitting}
                      autoComplete="off"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    
                    {/* Dropdown */}
                    {isDegreeDropdownOpen && filteredDegrees.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border-2 border-green-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredDegrees.map((degree) => (
                          <button
                            key={degree.id}
                            type="button"
                            onClick={() => handleDegreeSelect(degree.name)}
                            className="w-full text-left px-4 py-2.5 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{degree.name}</div>
                            {degree.level && (
                              <div className="text-xs text-gray-600 mt-0.5">({degree.level})</div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* No results message */}
                    {isDegreeDropdownOpen && degreeSearchTerm && filteredDegrees.length === 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border-2 border-green-200 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
                        Aucun diplôme trouvé pour "{degreeSearchTerm}"
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    💡 Tapez pour rechercher parmi les diplômes disponibles
                  </p>
                </div>

                {/* School/Institution */}
                <div>
                  <label htmlFor="school_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Établissement *
                  </label>
                  <input
                    type="text"
                    id="school_name"
                    value={formData.school_name || ""}
                    onChange={(e) => handleInputChange("school_name", e.target.value)}
                    placeholder="Ex: Université Mohammed V, ENSA Rabat, OFPPT..."
                    className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-2.5 px-4 outline-none transition-all"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-green-700 mt-1">
                    💡 Le nom de l'école, université ou centre de formation
                  </p>
                </div>

                {/* Graduation Date */}
                <div>
                  <label htmlFor="graduation_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'Obtention *
                  </label>
                  <input
                    type="date"
                    id="graduation_date"
                    value={formData.graduation_date || ""}
                    onChange={(e) =>
                      handleInputChange("graduation_date", e.target.value)
                    }
                    className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-2.5 px-4 outline-none transition-all"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-green-700 mt-1">
                    💡 La date à laquelle vous avez obtenu ce diplôme
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
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
                disabled={isSubmitting || !formData.title?.trim() || !formData.degree || !formData.school_name?.trim() || !formData.graduation_date}
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                onClick={() => {
                  // Close dropdown when submitting
                  setIsDegreeDropdownOpen(false);
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    {selectedEducation ? "Enregistrer les changements" : "Ajouter la formation"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EducationSection;
