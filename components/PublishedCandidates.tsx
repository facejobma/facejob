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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
      {candidates.map((candidate) => (
        <div
          key={candidate.id}
          className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
        >
          <div className="relative aspect-[9/16] bg-gray-100">
            {candidate.link ? (
              <video 
                src={candidate.link} 
                className="w-full h-full object-cover" 
                controls
                preload="metadata"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-400 text-sm">Aucune vidéo</p>
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
              {candidate.jobTitle}
            </h3>
            <p className="text-xs text-gray-600 truncate mb-1">{candidate.name}</p>
            <p className="text-xs text-gray-500">
              {candidate.nb_experiences} {candidate.nb_experiences > 1 ? 'expériences' : 'expérience'}
            </p>
            <button className="w-full mt-3 bg-primary hover:bg-primary-1 text-white text-xs font-medium py-2 px-3 rounded-lg transition duration-300">
              Voir le CV
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PublishedCandidates;
