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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidat/${id}/projects/${selectedProject.id}`,
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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidat/${id}/projects`,
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidat/project/delete/${project.id}`,
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
    <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Projets</h2>
        <button
          onClick={() => handleEditClick(null)} // Add new project
          className="text-gray-400 hover:text-gray-600"
        >
          <PlusSquare />
        </button>
      </div>
      <div className="p-6 relative">
        {editedProjects && editedProjects.length > 0 ? (
          editedProjects.map((project: Project) => (
            <div
              key={project.id}
              className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 mb-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{project.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => handleEditClick(project)}
                    className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit width={18} height={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(project)}
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
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun projet ajouté</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Présentez vos réalisations et projets pour démontrer vos compétences pratiques.
              </p>
            </div>
            <button
              onClick={() => handleEditClick(null)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <PlusSquare className="text-sm" />
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
          />
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
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
