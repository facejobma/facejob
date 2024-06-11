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
            },
          );
          const data = await response.json();

          const {
            id,
            titre,
            description,
            date_debut,
            date_fin,
            company_name,
            sector_name,
            contractType,
            is_verified,
          } = data;

          setJobData({
            id,
            titre,
            description,
            date_debut,
            date_fin,
            company_name,
            sector_name,
            contractType, // Add the contractType property here
            is_verified,
          });
        } catch (error) {
          // console.log(error);
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
