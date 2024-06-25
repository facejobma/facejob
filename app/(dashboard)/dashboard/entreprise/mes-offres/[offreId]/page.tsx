"use client";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { JobForm } from "@/components/forms/job-form";

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

interface JobData {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  company_name: string;
  sector_name: string;
  contractType: string;
  is_verified: string;
  applications: {
    candidat: Candidat;
    link: string;
  }[];
  candidats_count: number;
}

export default function Page() {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const { offreId } = useParams();

  const breadcrumbItems = [
    { title: "Offre", link: "/dashboard/entreprise/mes-offres" },
    { title: "Consulter", link: `/dashboard/entreprise/mes-offres/${offreId}` },
  ];

  useEffect(() => {
    if (offreId) {
      const fetchJobData = async () => {
        try {
          const authToken = Cookies.get("authToken");

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/offres_by_id/${offreId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();

          setJobData(data);
        } catch (error) {
          console.error("Error fetching job data:", error);
        }
      };

      fetchJobData();
    }
  }, [offreId]);

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        {jobData ? (
          <JobForm initialData={jobData} key={offreId as string} />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </ScrollArea>
  );
}
