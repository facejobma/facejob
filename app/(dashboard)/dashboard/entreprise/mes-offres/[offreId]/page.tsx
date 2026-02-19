"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import JobForm from "@/components/forms/job-form";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Edit } from "lucide-react";

interface Sector {
  id: number;
  name: string;
}

interface Candidat {
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
}

interface Postuler {
  id: number;
  link: string
}

interface JobData {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  company_name: string;
  sector_id: number;
  job_id: number;
  location: string;
  contractType: string;
  is_verified: string;
  entreprise_id: number;
  applications: {
    candidat: Candidat;
    link: string;
    created_at: string;
    postuler: Postuler;
  }[];
  candidats_count: number;
}

export default function Page() {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const { offreId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams.get('mode') === 'edit';

  useEffect(() => {
    setLoading(true);
    if (offreId) {
      const fetchJobData = async () => {
        try {
          const authToken = Cookies.get("authToken");

          const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offres_by_id/${offreId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          
          const data = await response.json();
          console.log("data du response : ", data);
          setJobData(data);
          setLoading(false);
        } catch (error) {
          setLoading(false);
          console.error("Error fetching job data:", error);
        }
      };

      fetchJobData();
    }
  }, [offreId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-220px)]">
        <LoadingSpinner message="Chargement de l'offre..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard/entreprise/mes-offres")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-medium">Retour aux offres</span>
      </button>

      {/* Header Simple */}
      <div className="bg-green-50 rounded-lg border-2 border-green-200 p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Edit className="text-green-600 w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Modifier l'offre d'emploi</h1>
            <p className="text-gray-600">Mettez à jour les informations de votre offre</p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-lg border border-gray-200">
        {jobData ? (
          <JobForm initialData={jobData} key={offreId as string} autoEdit={editMode} />
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-600">Offre introuvable</p>
          </div>
        )}
      </div>
    </div>
  );
}
