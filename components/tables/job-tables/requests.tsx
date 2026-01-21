"use client";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Job } from "@/constants/data";
import { FC, useMemo } from "react";
import { JobDataTable } from "@/components/ui/job-table";
import { columns } from "@/components/tables/job-tables/columns";
import { TrendingUp, Calendar, Users } from "lucide-react";

interface JobProps {
  data: Job[];
}

export const JobRequests: FC<JobProps> = ({ data }) => {
  
  // Tri et transformation des données
  const sortedData = useMemo(() => {
    return data
      .map((job) => ({
        ...job,
        sector_name: job.sector?.name || "Non spécifié",
      }))
      .sort((a, b) => {
        // Tri par created_at décroissant (plus récent en premier)
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
  }, [data]);

  const totalApplications = sortedData.reduce((sum, job) => sum + (job.postuler_offres_count || 0), 0);
  const averageApplications = sortedData.length > 0 ? Math.round(totalApplications / sortedData.length) : 0;

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <Heading
                title={`Mes Offres d'emploi (${sortedData.length})`}
                description="Consultez et gérez toutes vos offres d'emploi"
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{totalApplications} candidatures au total</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{averageApplications} candidatures/offre en moyenne</span>
          </div>
        </div>
      </div>
      
      <Separator className="mb-6" />
      
      <div className="bg-gray-50/50 rounded-xl p-1">
        <JobDataTable searchKey="titre" columns={columns} data={sortedData} />
      </div>
    </div>
  );
};