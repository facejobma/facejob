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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/consumed-cvs`,
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
          <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
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
    <div className="space-y-6">
      {/* Simple Header */}
      <div className="bg-green-50 rounded-lg border-2 border-green-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Eye className="text-green-600 w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CVs Consommés</h1>
            <p className="text-gray-600">Consultez la liste des CVs vidéos que vous avez consommés</p>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="text-green-600 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{consumedCVs.length}</p>
                <p className="text-xs text-gray-600">CVs consommés</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{consumedCVs.filter(cv => cv.postuler.candidat.is_completed === 1).length}</p>
                <p className="text-xs text-gray-600">Profils complets</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="text-green-600 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{Math.round(consumedCVs.reduce((sum, cv) => sum + parseInt(cv.postuler.nb_experiences), 0) / consumedCVs.length) || 0}</p>
                <p className="text-xs text-gray-600">Exp. moyenne</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="text-green-600 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1M8 7h8m-9 4v10a2 2 0 002 2h8a2 2 0 002-2V11a2 2 0 00-2-2H9a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{new Set(consumedCVs.map(cv => cv.postuler.sector_id)).size}</p>
                <p className="text-xs text-gray-600">Secteurs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {consumedCVs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center justify-center gap-4 text-gray-500">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="text-gray-400 w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 mb-2">Aucun CV consommé</p>
              <p className="text-sm text-gray-600 max-w-md">
                Vous n'avez pas encore consommé de CV vidéo. Commencez par explorer les candidats disponibles.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Vidéo
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Nom du Candidat
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Expérience
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Date de Consommation
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
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
                    } hover:bg-green-50 transition-colors`}
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
                      <div className="font-medium text-gray-900">
                        {cv.postuler.candidat.first_name} {cv.postuler.candidat.last_name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {cv.postuler.candidat.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {cv.postuler.candidat.years_of_experience} ans
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
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
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
        </div>
      )}
    </div>
  );
};

export default ConsumedCVs;