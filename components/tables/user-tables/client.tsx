"use client";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { User } from "@/constants/data";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { columns } from "./columns";
import { FC } from "react";
import { CandidateDataTable } from "@/components/ui/candidate-table";

interface ProductsClientProps {
  data: User[];
}

export const UserClient: FC<ProductsClientProps> = ({ data }) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Candidats (${data.length})`}
          description="Management des candidats"
        />
        <Button
          className="text-xs md:text-sm"
          onClick={() => router.push(`/dashboard/user/update`)}
        >
          <Plus className="mr-2 h-4 w-4" /> Changer les informations Candidat
        </Button>
      </div>
      <Separator />
      <CandidateDataTable searchKey="first_name" columns={columns} data={data} />
    </>
  );
};
