"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { downloadResumePDF } from "@/components/ResumePDF";
import { Eye, Download } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const company = typeof window !== "undefined"
    ? window.sessionStorage?.getItem("user")
    : null;
  const entrepriseId = company ? JSON.parse(company).id : null;

  useEffect(() => {
    const fetchConsumedCVs = async () => {
      try {
        setLoading(true);
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
          throw new Error('Erreur lors du chargement des CVs');
        }
        const data = await response.json();
        setConsumedCVs(data);
      } catch (error: any) {
        console.error("Error fetching consumed CVs:", error);
        toast.error("Erreur lors du chargement des CVs consommés!");
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (entrepriseId && authToken) {
      fetchConsumedCVs();
    }
  }, [authToken, entrepriseId]);

  const handleDownloadCV = async (candidatId: number) => {
    try {
      await downloadResumePDF(candidatId);
      toast.success("Téléchargement du CV en cours...");
    } catch (error) {
      console.error("Error downloading CV:", error);
      toast.error("Erreur lors du téléchargement du CV");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des CVs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-semibold">Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">CVs Consommés</h1>
        <p className="text-gray-600">
          Voici la liste des CVs vidéos que vous avez consommés ({consumedCVs.length} CV{consumedCVs.length > 1 ? 's' : ''})
        </p>
      </div>

      {consumedCVs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">Aucun CV consommé pour le moment</p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
              <tr>
                <th className="px-6 py-4 text-center font-semibold text-gray-700 border-b border-gray-300">
                  Vidéo
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-700 border-b border-gray-300">
                  Nom du Candidat
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-700 border-b border-gray-300">
                  Expérience
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-700 border-b border-gray-300">
                  Date de Consommation
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-700 border-b border-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {consumedCVs.map((cv, index) => (
                <tr 
                  key={cv.id} 
                  className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50 transition-colors duration-150`}
                >
                  <td className="px-6 py-4 border-b border-gray-200 text-center">
                    <div className="flex justify-center">
                      <video
                        src={cv.postuler.link}
                        className="w-40 h-28 object-cover rounded-lg shadow-sm"
                        controls
                      >
                        Votre navigateur ne supporte pas la vidéo.
                      </video>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-center">
                    <div className="font-medium text-gray-800">
                      {cv.postuler.candidat.first_name} {cv.postuler.candidat.last_name}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {cv.postuler.candidat.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {cv.postuler.nb_experiences} ans
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-center text-gray-700">
                    {new Date(cv.created_at).toLocaleDateString("fr-FR", {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-center">
                    <button
                      onClick={() => handleDownloadCV(cv.postuler.candidat.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Download className="h-4 w-4" />
                      Télécharger CV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConsumedCVs;