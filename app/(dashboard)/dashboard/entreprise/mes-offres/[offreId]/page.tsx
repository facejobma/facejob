"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import JobForm from "@/components/forms/job-form";
import { LoadingSpinner } from "@/components/ui/spinner";
import { ArrowLeft, BriefcaseBusiness, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

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
  job_id: number | null;
  image: string | null;
  created_at: string;
  updated_at: string;
  address: string | null;
  zip_code: string | null;
}

interface Postuler {
  id: number;
  link?: string | null;
}

interface JobData {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin?: string | null;
  company_name: string;
  sector_id: number;
  job_id: number | null;
  location: string;
  contractType: string;
  is_verified: string;
  status: "Pending" | "Accepted" | "Declined" | "Expired";
  entreprise_id: number;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string;
  experience_required?: number | null;
  benefits?: string[];
  required_languages?: string[];
  required_skills?: string[];
  applications: {
    id: number;
    candidate: Candidat | null;
    link: string | null;
    created_at: string;
    postuler: Postuler | null;
    status: "submitted" | "viewed" | "accepted" | "rejected";
    viewed_by_recruiter?: boolean;
    viewed_at?: string | null;
    is_consumed?: boolean;
  }[];
  applications_count: number;
}

export default function Page() {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const { offreId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [reloadKey, setReloadKey] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams.get("mode") === "edit";

  useEffect(() => {
    setLoading(true);
    if (offreId) {
      const controller = new AbortController();
      const fetchJobData = async () => {
        try {
          const authToken = Cookies.get("authToken");

          const response = await fetch(
            `${typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offres_by_id/${offreId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
              signal: controller.signal,
            },
          );

          const payload = await response.json().catch(() => null);
          if (!response.ok) {
            throw new Error(
              payload?.message || "Impossible de charger cette offre.",
            );
          }
          const data = payload?.data ?? payload;
          if (!data) throw new Error("Réponse invalide du serveur.");
          setJobData(data);
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError")
            return;
          console.error("Error fetching job data:", error);
          toast.error(
            error instanceof Error
              ? error.message
              : "Impossible de charger cette offre.",
          );
          setJobData(null);
        } finally {
          setLoading(false);
        }
      };

      fetchJobData();
      return () => controller.abort();
    }
  }, [offreId, reloadKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-220px)]">
        <LoadingSpinner message="Chargement de l'offre..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8">
      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard/entreprise/mes-offres")}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="font-medium">Retour aux offres</span>
      </button>

      {/* Main Form Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
        {jobData ? (
          <JobForm
            initialData={jobData}
            key={offreId as string}
            autoEdit={editMode}
          />
        ) : (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <BriefcaseBusiness className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Offre introuvable
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              L'offre a peut-être été supprimée ou n'est plus accessible.
            </p>
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <RefreshCw className="h-4 w-4" /> Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
