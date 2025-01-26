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

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ResumePDF from "@/components/ResumePDF";
import { toast } from "react-hot-toast";

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

interface Postuler {
  id: number;
  link: string;
}

interface Payment {
  id: number;
  entreprise_id: number;
  cv_video_remaining: number;
}

export const OfferCandidatActions: React.FC<{
  candidat: Candidat;
  postuler: Postuler;
}> = ({ candidat, postuler }) => {
  // const [loading, setLoading] = useState(false);
  const authToken = Cookies.get("authToken");
  const router = useRouter();
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateToConsume, setCandidateToConsume] = useState<Candidat | null>(
    null,
  );
  const [postulerToConsume, setPostulerToConsume] = useState<Postuler | null>(
    null,
  );

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const company =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user") || "{}"
      : "{}";
  const companyId = company ? JSON.parse(company).id : null;

  const fetchLastPayment = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/${companyId}/last`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      setLastPayment(data);
    } catch (error) {
      console.error("Error fetching last payment:", error);
      toast.error("Error fetching last payment!");
    }
  };

  useEffect(() => {
    fetchLastPayment();
  }, [authToken, companyId]);

  const handleConsumeClick = (postuler: Postuler) => {
    if (lastPayment && lastPayment.cv_video_remaining > 0) {
      // setCandidateToConsume(candidat);
      setPostulerToConsume(postuler);
      setIsModalOpen(true);
    } else {
      setIsUpgradeModalOpen(true);
    }
  };

  const handleConfirmConsume = async () => {
    if (postulerToConsume) {
      try {
        const checkResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/check-consumption-status`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              candidat_id: candidat.id,
              entreprise_id: companyId,
            }),
          },
        );

        const checkData = await checkResponse.json();

        if (checkData.consumed) {
          toast.error("La vidéo de CV a déjà été consommée.");
          setIsModalOpen(false);
          setCandidateToConsume(null);
          return;
        }

        // Proceed to consume the CV video if not already consumed
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/consume_cv_video",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              postuler_id: postulerToConsume.id,
              entreprise_id: companyId,
            }),
          },
        );

        if (response.ok) {
          toast.success("Vidéo consommée !");
          fetchLastPayment();
        } else {
          toast.error("Échec de la consommation de la vidéo.");
        }
      } catch (error) {
        console.error("Error consuming video:", error);
        toast.error("Erreur lors de la consommation de la vidéo !");
      }
    }

    setIsModalOpen(false);
    setCandidateToConsume(null);
  };

  const handleCancelConsume = () => {
    setIsModalOpen(false);
    setCandidateToConsume(null);
  };

  const handleUpgradePlan = () => {
    window.location.href = "/dashboard/entreprise/services";
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
          <DropdownMenuItem>
            <View className="mr-2 h-4 w-4" />
            <PDFDownloadLink
              document={<ResumePDF candidateId={candidat.id} />}
              fileName="resume.pdf"
              // className=" h-4 w-4"
            >
              {({ loading }) => (loading ? "Generating..." : "Consulter CV")}
            </PDFDownloadLink>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleConsumeClick(postuler)}>
            <CheckSquare className="mr-2 h-4 w-4" /> Consommer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-8 rounded-lg shadow-lg z-10">
            <h2 className="text-xl font-semibold mb-8">
              Êtes-vous sûr de vouloir consommer cette vidéo de CV ?
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCancelConsume}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmConsume}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-8 rounded-lg shadow-lg z-10">
            <h2 className="text-xl font-semibold mb-8">
              Vous avez atteint la limite de votre plan, veuillez souscrire à
              nouveau.
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleUpgradePlan}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                Mettre à niveau
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
