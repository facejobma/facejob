"use client";
import React from "react";

interface Candidate {
  id: number;
  link: string;
  jobTitle: string;
  name: string;
  nb_experiences: number;
}

const PublishedCandidates: React.FC<{ candidates: Candidate[] }> = ({
  candidates,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {candidates.map((candidate) => (
        <div
          key={candidate.id}
          className="bg-white rounded-lg overflow-hidden shadow-md"
        >
          <div className="p-6">
            {candidate.link ? (
              <video src={candidate.link} className="w-full h-auto" controls />
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Aucune vidéo disponible</p>
              </div>
            )}
            <h3 className="text-xl font-semibold mt-4">{candidate.jobTitle}</h3>
            <p className="text-gray-600">{candidate.name}</p>
            <p className="text-gray-600">
              Experiences: {candidate.nb_experiences}
            </p>
            <button className="bg-primary hover:bg-primary-2 text-white font-medium py-2 px-4 rounded-md shadow-lg transition duration-300">
              Extract CV
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PublishedCandidates;
