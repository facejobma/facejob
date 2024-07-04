"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ResumePDF from "@/components/ResumePDF";

interface Candidate {
  id: number;
  image: string;
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

  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null,
  );
  const [loadingPDF, setLoadingPDF] = useState<{ [key: number]: boolean }>({});
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const [sectors, setSectors] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<string>("");

  useEffect(() => {
    if (selectedSector) {
      const sector = sectors.find((sec) => sec.id === Number(selectedSector));
      setFilteredJobs(sector ? sector.jobs : []);
      setSelectedJob(""); // Reset selected job when sector changes
    } else {
      setFilteredJobs([]);
    }
  }, [selectedSector, sectors]);

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

    fetchCandidates();
    fetchSectors();
  }, [authToken]);

  const handleGenerateCV = (candidateId: number) => {
    setLoadingPDF((prev) => ({ ...prev, [candidateId]: true }));
    setSelectedCandidate(candidateId);
  };

  const filteredCandidates = candidates.filter((candidate) => {
    return (
      (!selectedSector ||
        candidate.job?.sector_id === Number(selectedSector)) &&
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
        <div className="relative w-64">
          <select
            className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
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
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
              <path d="M7 10l5 5 5-5H7z" />
            </svg>
          </div>
        </div>
        <div className="relative w-64">
          <select
            className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
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
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
              <path d="M7 10l5 5 5-5H7z" />
            </svg>
          </div>
        </div>
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
            <div className="p-4 text-center">
              <h3 className="text-xl font-semibold text-gray-800">
                {candidate.first_name} {candidate.last_name[0]}.
              </h3>
              <p className="text-gray-600">{candidate.job?.name}</p>
              <p className="text-gray-600">
                {candidate.nb_experiences} years of experience
              </p>
              <div className="mt-2">
                {selectedCandidate === candidate.id &&
                loadingPDF[candidate.id] ? (
                  <PDFDownloadLink
                    document={<ResumePDF candidateId={candidate.id} />}
                    fileName={`resume-${candidate.first_name}-${candidate.last_name}.pdf`}
                    className="bg-primary hover:bg-primary-2 text-white font-bold py-1 px-3 rounded-xl border border-primary mb-4"
                  >
                    {({ loading }) =>
                      loading ? "Generating..." : "Consulter CV"
                    }
                  </PDFDownloadLink>
                ) : (
                  <button
                    onClick={() => handleGenerateCV(candidate.id)}
                    className="bg-primary hover:bg-primary-2 text-white font-medium py-1 px-3 rounded-lg border border-primary mb-4"
                  >
                    Extraire CV
                  </button>
                )}
                <button
                  onClick={() => handleGenerateCV(candidate.id)}
                  className="bg-white hover:bg-white-2 mx-3 text-primary font-semibold py-1 px-3 rounded-lg border border-primary mb-4"
                >
                  Consumer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hiring;
