"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { Send } from "lucide-react";

interface Job {
  id: number;
  name: string;
}

interface Sector {
  id: number;
  name: string;
  jobs: Job[];
}

interface Payment {
  id: number;
  entreprise_id: number;
  job_remaining: number;
  job_posted: number;
  status: string;
}

const PublishOffer: React.FC = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [contractType, setContractType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const company = typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
  const companyId = company ? JSON.parse(company).id : null;

  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const userData =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user") || "{}"
      : "{}";

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/sectors",
        );
        const data = await response.json();
        setSectors(data);
      } catch (error) {
        console.error("Error fetching sectors:", error);
        toast.error("Error fetching sectors!");
      }
    };

    fetchSectors();
    fetchLastPayment();
  }, [authToken, companyId]);

  // Filter jobs based on selected sector
  const filteredJobs =
    sectors.find((sector) => sector.id === parseInt(selectedSector))?.jobs ||
    [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields
    if (
      !title ||
      !location ||
      !contractType ||
      !startDate ||
      !selectedSector ||
      !selectedJob
    ) {
      toast.error("Please fill in all required fields!");
      return;
    }

    if (
      lastPayment &&
      lastPayment.status == "Accepted" &&
      lastPayment.job_remaining > 0
    ) {
      setUploadStatus("uploading");

      try {
        const user = JSON.parse(userData);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/offre/create`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              titre: title,
              location,
              contractType,
              date_debut: startDate,
              date_fin: contractType === "CDD" ? endDate : ".",
              description,
              sector_id: selectedSector,
              job_id: selectedJob,
              entreprise_id: user.id,
            }),
          },
        );

        const responseData = await response.json();
        if (response.ok) {
          toast.success("Offer published successfully!");
          setUploadStatus("completed");
        } else {
          console.error("Response error:", responseData);
          toast.error("Failed to publish offer!");
          setUploadStatus("failed");
        }
      } catch (error) {
        console.error("Error publishing offer:", error);
        toast.error("An error occurred while publishing the offer!");
        setUploadStatus("failed");
      }
    } else {
      setIsUpgradeModalOpen(true);
    }
  };

  const fetchLastPayment = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/${companyId}/last`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      
      if (response.ok) {
        const data = await response.json();
        setLastPayment(data);
      } else if (response.status === 404) {
        // Handle "No payment found for this entreprise" case
        console.log("No payment found for this enterprise");
        setLastPayment(null);
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={uploadStatus === "uploading"}
                className={`group relative overflow-hidden w-full py-4 px-8 font-bold text-lg rounded-2xl shadow-xl transition-all duration-300 transform ${
                  uploadStatus === "uploading"
                    ? "bg-gray-400 cursor-not-allowed scale-95"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 hover:shadow-2xl active:scale-95"
                } text-white focus:outline-none focus:ring-4 focus:ring-green-300/50`}
              >
                {/* Background Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                {/* Content */}
                <div className="relative flex items-center justify-center gap-3">
                  {uploadStatus === "uploading" ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="tracking-wide">Publication en cours...</span>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <Send className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                        <div className="absolute inset-0 bg-white/30 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500"></div>
                      </div>
                      <span className="tracking-wide font-extrabold">Publier l'offre</span>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full group-hover:bg-white transition-colors duration-300"></div>
                        <div className="w-2 h-2 bg-white/40 rounded-full group-hover:bg-white/80 transition-colors duration-300 delay-75"></div>
                        <div className="w-2 h-2 bg-white/20 rounded-full group-hover:bg-white/60 transition-colors duration-300 delay-150"></div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/0 via-emerald-400/0 to-green-400/0 group-hover:from-green-400/20 group-hover:via-emerald-400/20 group-hover:to-green-400/20 transition-all duration-500"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-8 rounded-lg shadow-lg z-10">
            <h2 className="text-xl font-semibold mb-8">
              Vous avez atteint la limite de votre plan, veuillez souscrire à
              nouveau.
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleUpgradePlan}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                Mettre à niveau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishOffer;