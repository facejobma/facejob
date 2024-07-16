import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Job } from "@/constants/data";
import { Edit, MoreHorizontal, View } from "lucide-react";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface CellActionProps {
  data: Job;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const authToken = Cookies.get("authToken");
  const router = useRouter();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => {
            router.push(`/dashboard/entreprise/mes-offres/${data.id}`);
          }}
        >
          <View className="mr-2 h-4 w-4" /> Consult
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            sessionStorage.setItem("offreid", data.id);
            router.push(`/dashboard/entreprise/mes-offres/edit/${data.id}`);
          }}
        >
          <Edit className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
