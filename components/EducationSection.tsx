import React, { useState, useEffect } from "react";
import { Edit, PlusSquare, Trash } from "lucide-react";
import { Modal } from "@/components/ui/modal";

interface Education {
  id: string;
  school_name: string;
  degree: string;
  title: string;
  graduation_date: string;
}

interface EducationSectionProps {
  education: Education[];
  onEdit: (updatedEducation: Education[]) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({
  education,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEducation, setEditedEducation] = useState([...education]);
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(
    null,
  );
  const [formData, setFormData] = useState<Partial<Education>>({
    school_name: "",
    degree: "",
    title: "",
    graduation_date: "",
  });

  useEffect(() => {
    if (selectedEducation) {
      // Populate form data with selected education when editing
      setFormData({
        school_name: selectedEducation.school_name,
        degree: selectedEducation.degree,
        title: selectedEducation.title,
        graduation_date: selectedEducation.graduation_date,
      });
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

  const handleEducationUpdate = () => {
    if (selectedEducation) {
      // Update existing education entry
      const updatedEducationList = editedEducation.map((edu) =>
        edu.id === selectedEducation.id
          ? { ...selectedEducation, ...formData }
          : edu,
      );
      onEdit(updatedEducationList);
    } else {
      // Add new education entry
      const newEducation: Education = {
        id: Date.now().toString(),
        school_name: formData.school_name || "", // Ensure school_name is always a string
        degree: formData.degree || "", // Ensure degree is always a string
        title: formData.title || "", // Ensure title is always a string
        graduation_date: formData.graduation_date || "", // Ensure graduation_date is always a string
      };
      const updatedEducationList = [...editedEducation, newEducation];
      onEdit(updatedEducationList);
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

  const handleDeleteEducation = (education: Education) => {
    const updatedEducationList = editedEducation.filter(
      (edu) => edu.id !== education.id,
    );
    setEditedEducation(updatedEducationList);
    onEdit(updatedEducationList); // Update parent component state
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
                onClick={() => handleDeleteEducation(edu)} // Delete specific education entry
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
          <input
            type="text"
            id="degree"
            value={formData.degree}
            onChange={(e) => handleInputChange("degree", e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
          />
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
