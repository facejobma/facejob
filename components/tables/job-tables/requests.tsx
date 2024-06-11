"use client";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Job } from "@/constants/data";
import { FC } from "react";
import { JobDataTable } from "@/components/ui/job-table";
import { columns } from "@/components/tables/job-tables/columns";

interface JobProps {
  data: Job[];
}

export const JobRequests: FC<JobProps> = ({ data }) => {

  data = data.map((job) => {
    return {
      ...job,
      sector_name: job.sector.name,
    };
  }, []);

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Offres (${data.length})`}
          description="Consultez mes offres"
        />
      </div>
      <Separator />
      <JobDataTable searchKey="titre" columns={columns} data={data} />
    </>
  );
};
