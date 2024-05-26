"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  link: string;
  job_id: number;
  // job: {
  //   id: number;
  //   name: string;
  // };
  nb_experiences: number;
}

const Hiring: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/postule/all",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setCandidates(data);
      } catch (error) {
        console.error("Error fetching candidates:", error);
        toast.error("Error fetching candidates!");
      }
    };

    fetchCandidates();
  }, [authToken]);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Candidate Videos</h1>
        <p className="text-gray-600">Browse through the videos to find your ideal candidate</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="relative">
              <video src={candidate.link} className="w-full h-56 object-cover" controls>
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {candidate.first_name} {candidate.last_name}
              </h3>
              <p className="text-gray-600">{candidate.job_id}</p>
              <p className="text-gray-600">{candidate.nb_experiences} years of experience</p>
              <button className="mt-4 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-2 transition duration-300">
                Extrait CV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hiring;
