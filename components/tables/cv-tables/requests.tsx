"use client";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { CV } from "@/constants/data";
import { columns } from "./columns";
import { FC } from "react";

interface CVProps {
  data: CV[];
}

export const CVRequests: FC<CVProps> = ({ data }) => {
  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Requests (${data.length})`}
          description="Validating the CVs requests"
        />
      </div>
      <Separator />
      <DataTable searchKey="candidat_name" columns={columns} data={data} />
    </>
  );
};
