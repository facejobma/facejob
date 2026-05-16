"use client";

import React from "react";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface Skill {
  id: string;
  title: string;
}

interface SkillsSectionProps {
  id: number;
  skills: Skill[];
  onUpdate?: () => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ id, skills, onUpdate }) => {
  const router = useRouter();

  const handleEditClick = () => {
    router.push("/dashboard/candidat/competences");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleEditClick}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-[#16a34a] text-white hover:bg-[#15803d] rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" />
          {skills && skills.length > 0 ? "Modifier" : "Ajouter"}
        </button>
      </div>
      <div>
        {skills && skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: Skill) => (
              <span
                key={skill.id}
                className="bg-primary/5 text-primary border border-primary/20 rounded-lg px-3 py-1.5 text-sm font-medium"
              >
                {skill.title}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-600">Aucune compétence ajoutée</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsSection;
