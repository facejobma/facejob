"use client";
import React from "react";
import { Edit } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  headline: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  location?: string;
  companyName?: string;
  companyLogoUrl?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  headline,
  avatarUrl,
  coverImageUrl,
  location,
  companyName,
  companyLogoUrl,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden relative">
      {coverImageUrl && (
        <img
          src={coverImageUrl}
          alt="Cover"
          className="w-full h-40 object-cover relative"
        />
      )}

      <div className="p-6 relative">
        <div className="absolute top-4 right-6">
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={() => {}}
          >
            <Edit size={20} />
          </button>
        </div>
        {avatarUrl && (
          <div className="absolute left-10 top-6 md:top-12">
            <img
              src={avatarUrl}
              alt="Profile Avatar"
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
            />
          </div>
        )}

        <div className="ml-6 md:ml-36 mt-32 md:mt-0">
          <h1 className="text-2xl font-bold mb-1">{name}</h1>
          <p className="text-gray-600 mb-2">{headline}</p>
          {location && (
            <p className="text-gray-600 mb-3">Location: {location}</p>
          )}
          <button
            className="bg-primary hover:bg-primary-2 text-white font-bold py-1 px-3 rounded-lg border border-primary mb-4"
            onClick={() => {}}
          >
            Consulter CV
          </button>
        </div>

        {companyName && companyLogoUrl && (
          <div className="flex items-center absolute bottom-6 right-6">
            <img
              src={companyLogoUrl}
              alt={companyName}
              className="w-10 h-10 rounded-full mr-2"
            />
            <p className="text-sm text-gray-600">{companyName}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
