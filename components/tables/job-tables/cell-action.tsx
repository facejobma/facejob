import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Job } from "@/constants/data";
import {
  CheckSquare,
  XSquare,
  // Edit,
  MoreHorizontal,
  View,
} from "lucide-react";

import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface CellActionProps {
  data: Job;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  // const [loading, setLoading] = useState(false);
  const authToken = Cookies.get("authToken");
  const router = useRouter();

  const onVerify = async (isVerified: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/job/accept/${data.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isVerified,
          }),
        },
      );

      if (response.ok) {
        console.log("Candidate deleted successfully!");
      } else {
        console.error("Failed to delete candidate");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {/* <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      /> */}
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
              onVerify("Accepted");
            }}
          >
            <CheckSquare className="mr-2 h-4 w-4" /> Accept
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onVerify("Declined");
            }}
          >
            <XSquare className="mr-2 h-4 w-4" /> Decline
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push(`/dashboard/entreprise/mes-offres/${data.id}`);
            }}
          >
            <View className="mr-2 h-4 w-4" /> Consult
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
