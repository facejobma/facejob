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
        <h2 className="text-xl font-bold">Projects</h2>
        <button
          onClick={() => handleEditClick(null)} // Add new project
          className="text-gray-400 hover:text-gray-600"
        >
          <PlusSquare />
        </button>
      </div>
      <div className="p-6 relative">
        {editedProjects.map((project: Project) => (
          <div
            key={project.id}
            className="bg-gray-100 rounded-lg p-4 mb-4 flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold">{project.title}</h3>
              <p className="text-gray-600">{project.description}</p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleEditClick(project)} // Edit specific project
                className="text-blue-500 hover:text-blue-700 mr-3"
              >
                <Edit width={20} height={20} />
              </button>
              <button
                type="button"
                onClick={() => handleRemoveProject(project)}
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
        title={selectedProject ? "Edit Project" : "Add Project"}
        description={
          selectedProject ? "Update project details" : "Add a new project"
        }
      >
        <form onSubmit={handleProjectUpdate}>
          <label htmlFor="title">Title:</label>
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
            className="bg-primary hover:bg-primary-2 text-white font-bold py-2 px-4 rounded-md"
          >
            {selectedProject ? "Save Changes" : "Add Project"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsSection;
