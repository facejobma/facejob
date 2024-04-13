import { AlertModal } from "@/components/modal/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CV } from "@/constants/data";
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
import { Modal } from "@/components/ui/modal";

interface CellActionProps {
  data: CV;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const authToken = Cookies.get("authToken");
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();

  const onDelete = async () => {
    try {
      setLoading(true);

      const authToken = localStorage.getItem("authToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/delete_cv/${data.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (response.ok) {
        console.log("Candidate deleted successfully!");
      } else {
        console.error("Failed to delete candidate");
      }
    } catch (error) {
      console.error("An error occurred while deleting the candidate:", error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onVerify = async (isVerified: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/verify/${data.id}`,
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

  const onPreview = () => {
    setShowPreview(true);
  };

  const onClosePreview = () => {
    setShowPreview(false);
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <Modal
        isOpen={showPreview}
        onClose={onClosePreview}
        title={"Preview CV Video"}
        description={
          "Take a closer look at the candidate's CV video to gain insights into their qualifications and skills."
        }
      >
        <video src={data.link} className="w-full h-full" />
      </Modal>
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
          <DropdownMenuItem onClick={onPreview}>
            <View className="mr-2 h-4 w-4" /> Preview
          </DropdownMenuItem>
          {/* <DropdownMenuItem
            onClick={() => {
              router.push(`/dashboard/requests/${data.id}`);
            }}
          >
            <View className="mr-2 h-4 w-4" /> Consult
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
