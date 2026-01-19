"use client";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Job } from "@/constants/data";
import { FC, useMemo } from "react";
import { JobDataTable } from "@/components/ui/job-table";
import { columns } from "@/components/tables/job-tables/columns";

interface JobProps {
  data: Job[];
}

export const JobRequests: FC<JobProps> = ({ data }) => {
  
  // Tri et transformation des données
  const sortedData = useMemo(() => {
    return data
      .map((job) => ({
        ...job,
        sector_name: job.sector.name,
      }))
      .sort((a, b) => {
        // Tri par created_at décroissant (plus récent en premier)
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
  }, [data]);

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Mes Offres d'emploi (${sortedData.length})`}
          description="Consulter mes offres (triées par date de création)"
        />
      </div>
      <Separator />
      <JobDataTable searchKey="titre" columns={columns} data={sortedData} />
    </>
  );
};