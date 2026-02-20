"use client"

import React, { useState, useEffect } from "react";
import { Edit, Trash, PlusSquare } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";

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
    setIsEditing(false);
    setSelectedProject(null);
  };

  const handleProjectUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
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
        } else {
          console.error("Failed to update project");
        }
      } catch (error) {
        console.error("Error updating project:", error);
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
        } else {
          console.error("Failed to add project");
        }
      } catch (error) {
        console.error("Error adding project:", error);
      }
    }
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
      } else {
        console.error("Failed to remove project");
      }
    } catch (error) {
      console.error("Error removing project:", error);
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
        title={selectedProject ? "Modifier projet" : "Ajouter Projet"}
        description={
          selectedProject ? "Modifier les details du projets" : "Ajouter un nouveau projet"
        }
      >
        <form onSubmit={handleProjectUpdate}>
          <label htmlFor="title">Titre:</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
            placeholder="Ex: Application mobile e-commerce, Site web portfolio..."
          />
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
            placeholder="Décrivez votre projet, les technologies utilisées, votre rôle et les résultats obtenus..."
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md shadow-sm transition-colors"
          >
            {selectedProject ? "Enregistrer les changements " : "Ajouter un projet"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsSection;
