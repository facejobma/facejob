"use client"

import React, { useState, useEffect } from "react";
import { Edit, Trash, PlusSquare, X, Plus, FolderOpen } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { HiOutlineCollection } from "react-icons/hi";

interface Project {
  id: string;
  title: string;
  description: string;
}

interface ProjectsSectionProps {
  id: number;
  projects: Project[];
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ id, projects }) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  const [isEditing, setIsEditing] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editedProjects, setEditedProjects] = useState([...projects]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({
    title: "",
    description: "",
  });

  useEffect(() => {
    if (selectedProject) {
      // Populate form data with selected project when editing
      setFormData({
        title: selectedProject.title,
        description: selectedProject.description,
      });
    } else {
      // Reset form data when adding a new project
      setFormData({
        title: "",
        description: "",
      });
    }
  }, [selectedProject]);

  const handleEditClick = (project: Project | null) => {
    setSelectedProject(project);
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    // Check if there's unsaved data
    if (formData.title?.trim() || formData.description?.trim()) {
      const confirmClose = window.confirm(
        "Vous avez des modifications non enregistrées. Voulez-vous vraiment fermer?"
      );
      if (!confirmClose) return;
    }
    
    setIsEditing(false);
    setSelectedProject(null);
    setFormData({
      title: "",
      description: "",
    });
  };

  const handleProjectUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title?.trim()) {
      toast.error("Le titre est requis");
      return;
    }

    if (!formData.description?.trim()) {
      toast.error("La description est requise");
      return;
    }

    setIsSubmitting(true);

    if (selectedProject) {
      // Update existing project
      const updatedProject: Project = {
        ...selectedProject,
        title: formData.title || "",
        description: formData.description || "",
      };

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidat/${id}/projects/${selectedProject.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedProject),
          },
        );

        if (response.ok) {
          const updatedProjects = editedProjects.map((proj) =>
            proj.id === selectedProject.id ? updatedProject : proj,
          );
          setEditedProjects(updatedProjects);
          toast.success("Projet mis à jour!");
        } else {
          console.error("Failed to update project");
          toast.error("Erreur lors de la mise à jour");
        }
      } catch (error) {
        console.error("Error updating project:", error);
        toast.error("Erreur réseau");
      }
    } else {
      // Add new project
      const newProject: Project = {
        id: Date.now().toString(),
        title: formData.title || "",
        description: formData.description || "",
      };

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidat/${id}/projects`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newProject),
          },
        );

        if (response.ok) {
          const addedProject = await response.json();
          setEditedProjects((prevProjects) => [...prevProjects, addedProject]);
          toast.success("Projet ajouté!");
        } else {
          console.error("Failed to add project");
          toast.error("Erreur lors de l'ajout");
        }
      } catch (error) {
        console.error("Error adding project:", error);
        toast.error("Erreur réseau");
      }
    }
    setIsSubmitting(false);
    setIsEditing(false);
    setSelectedProject(null);
  };

  const handleInputChange = (key: keyof Partial<Project>, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleRemoveProject = async (project: Project) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidat/project/delete/${project.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const updatedProjects = editedProjects.filter(
          (proj) => proj.id !== project.id,
        );
        setEditedProjects(updatedProjects);
        toast.success("Projet supprimé");
      } else {
        console.error("Failed to remove project");
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error removing project:", error);
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
        {editedProjects && editedProjects.length > 0 ? (
          editedProjects.map((project: Project) => (
            <div
              key={project.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-base text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{project.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => handleEditClick(project)}
                    className="text-blue-500 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded transition-colors"
                    title="Modifier"
                  >
                    <Edit width={16} height={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(project)}
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
            <p className="text-sm text-gray-600 mb-3">Aucun projet ajouté</p>
            <button
              onClick={() => handleEditClick(null)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <PlusSquare className="w-4 h-4" />
              Ajouter un projet
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isEditing}
        onClose={handleCloseModal}
        title={selectedProject ? "Modifier le Projet" : "Ajouter un Projet"}
        description={
          selectedProject ? "Modifier les détails du projet" : "Ajouter un nouveau projet à votre profil"
        }
      >
        <form onSubmit={handleProjectUpdate}>
          <div className="space-y-6">
            {/* Project Form Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <HiOutlineCollection className="text-green-600 text-sm" />
                </div>
                <h3 className="font-semibold text-gray-900">Informations du projet</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Titre du projet *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-2.5 px-4 outline-none transition-all"
                    placeholder="Ex: Application mobile e-commerce, Site web portfolio..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-2.5 px-4 outline-none transition-all resize-none"
                    placeholder="Décrivez votre projet, les technologies utilisées, votre rôle et les résultats obtenus..."
                    rows={5}
                    required
                  />
                  <p className="text-xs text-green-700 mt-2">
                    💡 Mentionnez les technologies, votre rôle et l'impact du projet
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
                disabled={isSubmitting || !formData.title?.trim() || !formData.description?.trim()}
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    {selectedProject ? "Enregistrer les changements" : "Ajouter le projet"}
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

export default ProjectsSection;
