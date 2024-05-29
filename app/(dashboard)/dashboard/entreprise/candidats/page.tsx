"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

interface Job {
  id: number;
  name: string;
}

interface Sector {
  id: number;
  name: string;
  jobs: Job[];
}

interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  link: string;
  job_id: number;
  job: {
    id: number;
    name: string;
    sector_id: number;
  };
  nb_experiences: number;
}

const Hiring: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<string>("");
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
          },
        );
        const data = await response.json();
        setCandidates(data);
      } catch (error) {
        console.error("Error fetching candidates:", error);
        toast.error("Error fetching candidates!");
      }
    };

    const fetchSectors = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/sectors",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();
        setSectors(data);
      } catch (error) {
        console.error("Error fetching sectors:", error);
        toast.error("Error fetching sectors!");
      }
    };

    fetchCandidates();
    fetchSectors();
  }, [authToken]);

  useEffect(() => {
    if (selectedSector) {
      const sector = sectors.find((sec) => sec.id === Number(selectedSector));
      setFilteredJobs(sector ? sector.jobs : []);
      setSelectedJob(""); // Reset selected job when sector changes
    } else {
      setFilteredJobs([]);
    }
  }, [selectedSector, sectors]);

  const filteredCandidates = candidates.filter((candidate) => {
    return (
      (!selectedSector || candidate.job.sector_id === Number(selectedSector)) &&
      (!selectedJob || candidate.job.id === Number(selectedJob))
    );
  });

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 bg-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Candidate Videos
        </h1>
        <p className="text-gray-600">
          Browse through the videos to find your ideal candidate
        </p>
      </div>
      <div className="flex justify-center space-x-4 mb-8">
        <select
          className="w-64 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
        >
          <option value="">Select Sector</option>
          {sectors.map((sector) => (
            <option key={sector.id} value={sector.id}>
              {sector.name}
            </option>
          ))}
        </select>
        <select
          className="w-64 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
        >
          <option value="">Select Job</option>
          {filteredJobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="relative">
              <video
                src={candidate.link}
                className="w-full h-56 object-cover"
                controls
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {candidate.first_name} {candidate.last_name}
              </h3>
              <p className="text-gray-600">{candidate.job.name}</p>
              <p className="text-gray-600">
                {candidate.nb_experiences} years of experience
              </p>
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
