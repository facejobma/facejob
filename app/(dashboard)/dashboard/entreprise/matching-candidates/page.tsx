"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import MatchingCandidates from "@/components/MatchingCandidates";
import { Briefcase, ChevronRight, Users } from "lucide-react";

interface Job {
  id: number;
  titre: string;
  sector?: { name: string };
  is_verified: string;
}

export default function MatchingCandidatesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    const userData = window.sessionStorage?.getItem("user");
    if (!userData) return;
    const user = JSON.parse(userData);

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offres/by-owner/${user.id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const accepted = Array.isArray(data)
          ? data.filter((j: Job) => j.is_verified === "Accepted")
          : [];
        setJobs(accepted);
        if (accepted.length > 0) setSelectedJob(accepted[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-220px)]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-green-50 rounded-lg border-2 border-green-200 p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Candidats correspondants</h1>
            <p className="text-sm text-gray-600">Trouvez les meilleurs profils pour vos offres</p>
          </div>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune offre validée</h3>
          <p className="text-sm text-gray-600 mb-4">
            Vous devez avoir au moins une offre validée pour voir les candidats correspondants.
          </p>
          <button
            onClick={() => router.push("/dashboard/entreprise/publier")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Publier une offre
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Jobs list */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-fit">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-700">Vos offres validées</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`w-full text-left px-4 py-3 transition-colors hover:bg-gray-50 ${
                    selectedJob?.id === job.id ? "bg-green-50 border-l-2 border-green-500" : ""
                  }`}
                >
                  <p className={`text-sm font-medium truncate ${selectedJob?.id === job.id ? "text-green-700" : "text-gray-900"}`}>
                    {job.titre}
                  </p>
                  {job.sector?.name && (
                    <p className="text-xs text-gray-500 mt-0.5">{job.sector.name}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Matching candidates */}
          <div className="lg:col-span-2">
            {selectedJob && (
              <MatchingCandidates offreId={selectedJob.id} offreTitre={selectedJob.titre} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
