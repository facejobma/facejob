"use client";
import React, { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ResumePDF from "@/components/ResumePDF";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

const ResumePDFLoader: React.FC<{ candidateId: number }> = ({ candidateId }) => {
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfileData = async () => {
    setLoading(true);
    const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidate-profile/${candidateId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      toast.error("Error fetching candidate profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PDFDownloadLink
      document={userProfile ? <ResumePDF candidateId={userProfile.id} /> : <></>}
      fileName="resume.pdf"
      className="bg-primary hover:bg-primary-2 text-white font-bold py-1 px-3 rounded-lg border border-primary mb-4"
      onClick={fetchProfileData}
    >
      {({ loading: pdfLoading }) => (loading || pdfLoading ? "Generating..." : "Consulter CV")}
    </PDFDownloadLink>
  );
};

export default ResumePDFLoader;
