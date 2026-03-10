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
import ResumePDF, { downloadResumePDF, downloadConsumedResumePDF } from "@/components/ResumePDF";
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
  videoLink?: string;
  onVideoClick?: () => void;
}> = ({ candidat, postuler, videoLink, onVideoClick }) => {
  // const [loading, setLoading] = useState(false);
  const authToken = Cookies.get("authToken");
  const router = useRouter();
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateToConsume, setCandidateToConsume] = useState<Candidat | null>(
    null,
  );
  const [postulerToConsume, setPostulerToConsume] = useState<any | null>(
    null,
  );
  const [isConsumed, setIsConsumed] = useState(false);

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const company =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user") || "{}"
      : "{}";
  const companyId = company ? JSON.parse(company).id : null;

  const checkIfConsumed = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/check-consumption-status`,
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

      const data = await response.json();
      setIsConsumed(data.consumed || false);
    } catch (error) {
      console.error("Error checking consumption status:", error);
    }
  };

  const fetchLastPayment = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/payments/${companyId}/last`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      
      if (response.ok) {
        const data = await response.json();
        setLastPayment(data);
      } else if (response.status === 404) {
        // Handle "No payment found for this entreprise" case
        console.log("No payment found for this enterprise");
        setLastPayment(null);
      } else {
        console.error("Error fetching last payment:", response.status);
        toast.error("Error fetching last payment!");
      }
    } catch (error) {
      console.error("Error fetching last payment:", error);
      toast.error("Error fetching last payment!");
    }
  };

  const handleDownloadCV = async () => {
    try {
      if (isConsumed) {
        // If consumed, fetch from consumed-cvs endpoint which has complete data
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/consumed-cvs`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des CV débloqués');
        }
        
        const consumedCVs = await response.json();
        
        // Find the specific candidate in consumed CVs
        const consumedCV = consumedCVs.find((cv: any) => 
          cv.postuler?.candidat?.id === candidat.id
        );
        
        if (consumedCV && consumedCV.postuler?.candidat) {
          await downloadConsumedResumePDF(consumedCV.postuler.candidat);
        } else {
          // Fallback to regular download if not found in consumed list
          await downloadResumePDF(candidat.id);
        }
      } else {
        // If not consumed, use regular download (will be anonymized by backend)
        await downloadResumePDF(candidat.id);
      }
    } catch (error) {
      console.error("Error downloading CV:", error);
      toast.error("Erreur lors du téléchargement du CV");
    }
  };

  useEffect(() => {
    fetchLastPayment();
    checkIfConsumed();
  }, [authToken, companyId]);

  const handleConsumeClick = async (postuler: Postuler) => {
    // Call API directly without pre-checking payment
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/consumations`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postuler_id: postuler.id,
            entreprise_id: companyId,
          }),
        },
      );

      if (response.ok) {
        toast.success("CV débloqué avec succès !");
        fetchLastPayment();
        // Refresh the page to update the list
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific errors
        if (response.status === 402 && errorData.needs_upgrade) {
          toast.error(errorData.message || "Vous avez atteint la limite de consultations de CV.", { duration: 5000 });
          setTimeout(() => {
            setIsUpgradeModalOpen(true);
          }, 500);
        } else if (response.status === 409) {
          toast.error("Ce CV a déjà été débloqué");
        } else {
          toast.error(errorData.message || "Erreur lors du déblocage du CV");
        }
      }
    } catch (error) {
      console.error("Error consuming CV:", error);
      toast.error("Erreur réseau. Veuillez réessayer.");
    }
  };
  


  const handleConfirmConsume = async () => {
    if (postulerToConsume) {
      try {
        const checkResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/check-consumption-status`,
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
          toast.error("La vidéo de CV a déjà été débloquée.");
          setIsModalOpen(false);
          setCandidateToConsume(null);
          return;
        }

        // Proceed to consume the CV video if not already consumed
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/consume_cv_video",
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
          toast.success("Vidéo débloquée !");
          fetchLastPayment();
        } else {
          toast.error("Échec du déblocage de la vidéo.");
        }
      } catch (error) {
        console.error("Error consuming video:", error);
        toast.error("Erreur lors du déblocage de la vidéo !");
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
          <Button variant="outline" className="w-full justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
            <MoreHorizontal className="h-4 w-4" />
            <span>Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
      
          {videoLink && onVideoClick && (
            <DropdownMenuItem onClick={onVideoClick}>
              <View className="mr-2 h-4 w-4" />
              Voir CV vidéo
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleDownloadCV}>
            <View className="mr-2 h-4 w-4" />
            Télécharger CV
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleConsumeClick(postuler)}>
            <CheckSquare className="mr-2 h-4 w-4" /> 
            Débloquer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
