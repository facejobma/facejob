"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ResumePDF from "@/components/ResumePDF";

interface ConsumedCV {
  id: number;
  postuler_id: number;
  entreprise_id: number;
  created_at: string;
  updated_at: string;
  postuler: {
    id: number;
    link: string;
    candidat_id: number;
    is_verified: string;
    comment: string | null;
    created_at: string;
    updated_at: string;
    nb_experiences: string;
    job_id: number;
    sector_id: number;
    candidat: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      tel: string;
      sex: string;
      bio: string;
      years_of_experience: number;
      is_completed: number;
      job_id: number;
      image: string | null;
      created_at: string;
      updated_at: string;
      address: string | null;
      zip_code: string | null;
    };
  };
  entreprise: {
    id: number;
    company_name: string;
    phone: string;
    email: string;
    effectif: number;
    logo: string;
    description: string;
    adresse: string;
    sector_id: number;
    site_web: string;
    linkedin: string;
    plan_id: number;
    plan_start_data: string;
    plan_end_data: string;
    is_verified: string;
    comment: string | null;
    created_at: string;
    updated_at: string;
  };
}

const ConsumedCVs: React.FC = () => {
  const [consumedCVs, setConsumedCVs] = useState<ConsumedCV[]>([]);
  const [error, setError] = useState<string | null>(null);
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const company = typeof window !== "undefined"
    ? window.sessionStorage?.getItem("user")
    : null
  const entrepriseId = company ? JSON.parse(company).id : null;

  useEffect(() => {
    const fetchConsumedCVs = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/consumed-cvs/${entrepriseId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setConsumedCVs(data);
      } catch (error: any) {
        console.error("Error fetching consumed CVs:", error);
        toast.error("Error fetching consumed CVs!");
        setError(error.message);
      }
    };

    fetchConsumedCVs();
  }, [authToken, entrepriseId]);

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">CVs Consommés</h1>
        <p className="text-gray-600">
          Voici la liste des CVs vidéos que vous avez consommés
        </p>
      </div>
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-center font-semibold text-gray-800 border-b border-gray-300">Vidéo</th>
              <th className="px-6 py-3 text-center font-semibold text-gray-800 border-b border-gray-300">Nom du Candidat</th>
              <th className="px-6 py-3 text-center font-semibold text-gray-800 border-b border-gray-300">Années d'Expérience</th>
              <th className="px-6 py-3 text-center font-semibold text-gray-800 border-b border-gray-300">Date de Consommation</th>
              <th className="px-6 py-3 text-center font-semibold text-gray-800 border-b border-gray-300">Voir CV</th>
            </tr>
          </thead>
          <tbody>
            {consumedCVs.map((cv) => (
              <tr key={cv.id} className="even:bg-gray-50 hover:bg-gray-100">
                <td className="px-6 py-4 border-b border-gray-300 text-center">
                <video
                  src={cv.postuler.link}
                  className="w-40 h-32 object-cover rounded-lg"
                  controls
                  style={{ width: "160px", height: "120px" }}
                >
                  Your browser does not support the video tag.
                </video>
              </td>
                <td className="px-6 py-4 border-b border-gray-300 text-center">
                  {cv.postuler.candidat.first_name} {cv.postuler.candidat.last_name}
                </td>
                <td className="px-6 py-4 border-b border-gray-300 text-center">
                  {cv.postuler.nb_experiences} ans
                </td>
                <td className="px-6 py-4 border-b border-gray-300 text-center">
                  {new Date(cv.created_at).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-6 py-4 border-b border-gray-300 text-center">
                  <PDFDownloadLink
                    document={<ResumePDF candidateId={cv.postuler.candidat.id} />}
                    fileName={`cv-${cv.postuler.candidat.first_name}-${cv.postuler.candidat.last_name}.pdf`}
                    className="text-green-900 font-medium hover:underline"
                  >
                    {({ loading }) =>
                      loading ? "Génération..." : "Télécharger CV"
                    }
                  </PDFDownloadLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConsumedCVs;
