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
  titre: string;
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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/diplomes`,
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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidat/${id}/formation/${selectedEducation.id}`,
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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidat/${id}/education`,
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/formation/delete/${education.id}`,
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
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Education</h2>
        <button
          onClick={() => handleEditClick(null)} // Add new education entry
          className="text-gray-400 hover:text-gray-600"
        >
          <PlusSquare />
        </button>
      </div>

      <div className="p-6 relative">
        {editedEducation.map((edu: Education) => (
          <div
            key={edu.id}
            className="bg-gray-100 rounded-lg p-4 mb-4 flex items-start justify-between"
          >
            <div>
              <div className="font-bold">{edu.school_name}</div>
              <div>
                {edu.degree}, {edu.title}
              </div>
              <div>{edu.graduation_date}</div>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleEditClick(edu)} // Edit specific education entry
                className="text-blue-500 hover:text-blue-700 mr-3"
              >
                <Edit width={20} height={20} />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteEducation(edu)} 
                className="text-red-500 hover:text-red-700"
              >
                <Trash width={20} height={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for editing education entry */}
      <Modal
        isOpen={isEditing}
        onClose={handleCloseModal}
        title={selectedEducation ? "Edit Education" : "Add Education"}
        description={
          selectedEducation
            ? "Update education details"
            : "Add a new education entry"
        }
      >
        <form onSubmit={handleEducationUpdate}>
          <label htmlFor="school_name">School Name:</label>
          <input
            type="text"
            id="school_name"
            value={formData.school_name}
            onChange={(e) => handleInputChange("school_name", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />
          <label htmlFor="degree">Degree:</label>
          <select
            id="degree"
            value={formData.degree}
            onChange={(e) => handleInputChange("degree", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          >
            <option value="">Select a degree</option>
            {degrees.map((degree) => (
              <option key={degree.id} value={degree.titre}>
                {degree.titre}
              </option>
            ))}
          </select>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />
          <label htmlFor="graduation_date">Graduation Date:</label>
          <input
            type="date"
            id="graduation_date"
            value={formData.graduation_date}
            onChange={(e) =>
              handleInputChange("graduation_date", e.target.value)
            }
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary-2 text-white font-bold py-2 px-4 rounded-md"
          >
            {selectedEducation ? "Save Changes" : "Add Education"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default EducationSection;
