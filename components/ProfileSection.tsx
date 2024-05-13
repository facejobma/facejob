"use client";
import React, { ReactNode } from "react";
import { Edit } from "lucide-react";

interface ProfileSectionProps {
  title: string;
  children: ReactNode;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">{title}</h2>
        <button
          onClick={() => {}}
          className="text-gray-400 hover:text-gray-600"
        >
          <Edit size={20} />
        </button>
      </div>

      <div className="p-6">{children}</div>
    </div>
  );
};

export default ProfileSection;
