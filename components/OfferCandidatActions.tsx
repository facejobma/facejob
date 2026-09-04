import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle2,
  Download,
  Eye,
  LockKeyhole,
  MoreHorizontal,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  downloadConsumedResumePDF,
  downloadResumePDF,
} from "@/components/ResumePDF";
import { toast } from "react-hot-toast";

interface Candidat {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  tel: string | null;
  sex: string;
  bio: string | null;
  years_of_experience: number | null;
  is_completed?: number | boolean;
  job_id: number | null;
  image: string | null;
  created_at: string;
  updated_at: string;
  address: string | null;
  zip_code: string | null;
}

interface Postuler {
  id: number;
  link?: string | null;
}

type ApplicationStatus = "submitted" | "viewed" | "accepted" | "rejected";

export const OfferCandidatActions: React.FC<{
  candidat: Candidat;
  postuler: Postuler;
  applicationId: number;
  videoLink?: string | null;
  onVideoClick?: () => void;
  initiallyConsumed?: boolean;
  videoAvailable?: boolean;
  applicationStatus?: ApplicationStatus;
}> = ({
  candidat,
  postuler,
  applicationId,
  videoLink,
  onVideoClick,
  initiallyConsumed = false,
  videoAvailable = false,
  applicationStatus = "submitted",
}) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const [isConsumed, setIsConsumed] = useState(initiallyConsumed);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [decisionInProgress, setDecisionInProgress] = useState<
    "accept" | "reject" | null
  >(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => setIsConsumed(initiallyConsumed), [initiallyConsumed]);

  useEffect(() => {
    if (!isUpgradeModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsUpgradeModalOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isUpgradeModalOpen]);

  const headers = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  const handleDownloadCV = async () => {
    try {
      if (!isConsumed) {
        await downloadResumePDF(candidat.id);
        return;
      }

      const response = await fetch("/api/v1/consumed-cvs", { headers });
      if (!response.ok)
        throw new Error("Impossible de récupérer le CV débloqué");
      const payload = await response.json();
      const consumedCVs = payload?.data ?? payload;
      const items = Array.isArray(consumedCVs) ? consumedCVs : [];
      const consumedCV = items.find(
        (cv: any) =>
          Number(cv.postuler?.id) === Number(postuler.id) ||
          Number(cv.postuler?.candidat?.id) === Number(candidat.id),
      );

      if (consumedCV?.postuler?.candidat) {
        await downloadConsumedResumePDF(consumedCV.postuler.candidat);
      } else {
        await downloadResumePDF(candidat.id);
      }
    } catch (error) {
      console.error("Error downloading CV:", error);
      toast.error("Erreur lors du téléchargement du CV");
    }
  };

  const handleUnlock = async () => {
    if (isUnlocking || isConsumed || !videoAvailable) return;
    setIsUnlocking(true);
    try {
      const response = await fetch("/api/v1/consumations", {
        method: "POST",
        headers,
        body: JSON.stringify({
          postuler_id: postuler.id,
          application_id: applicationId,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (response.ok) {
        setIsConsumed(true);
        toast.success("CV débloqué avec succès");
        window.setTimeout(() => window.location.reload(), 500);
        return;
      }
      if (response.status === 402) {
        toast.error(
          payload.message || "Aucun crédit de consultation n'est disponible.",
        );
        setIsUpgradeModalOpen(true);
      } else if (response.status === 409) {
        setIsConsumed(true);
        toast.error("Ce CV a déjà été débloqué");
        window.setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error(
          payload.message || payload.error || "Erreur lors du déblocage du CV",
        );
      }
    } catch (error) {
      console.error("Error consuming CV:", error);
      toast.error("Erreur réseau. Veuillez réessayer.");
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleVideoView = async () => {
    if (!videoLink || !onVideoClick) return;
    try {
      const response = await fetch(
        `/api/v1/applications/${applicationId}/viewed`,
        {
          method: "PATCH",
          headers,
        },
      );
      if (!response.ok) {
        console.error("Unable to mark application as viewed:", response.status);
      }
    } catch (error) {
      console.error("Unable to mark application as viewed:", error);
    } finally {
      onVideoClick();
    }
  };

  const decideApplication = async (decision: "accept" | "reject") => {
    if (decisionInProgress) return;
    setDecisionInProgress(decision);
    const endpoint =
      decision === "accept"
        ? `/api/v1/offre/accept_cv/${applicationId}`
        : `/api/v1/applications/${applicationId}/reject`;
    try {
      const response = await fetch(endpoint, {
        method: decision === "accept" ? "POST" : "PATCH",
        headers,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(
          payload?.message || "Impossible de mettre à jour la candidature",
        );
        return;
      }
      toast.success(
        decision === "accept" ? "Candidature acceptée" : "Candidature refusée",
      );
      window.setTimeout(() => window.location.reload(), 400);
    } catch (error) {
      console.error("Unable to update application:", error);
      toast.error("Erreur réseau. Veuillez réessayer.");
    } finally {
      setDecisionInProgress(null);
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-10 w-full justify-center gap-2 rounded-xl border-emerald-200 bg-emerald-50 font-semibold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
          >
            <MoreHorizontal className="h-4 w-4" /> Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
          <DropdownMenuLabel className="text-xs text-slate-500">
            Candidature
          </DropdownMenuLabel>
          {videoLink && onVideoClick && (
            <DropdownMenuItem onClick={handleVideoView} className="rounded-lg">
              <Eye className="mr-2 h-4 w-4" /> Voir le CV vidéo
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleDownloadCV} className="rounded-lg">
            <Download className="mr-2 h-4 w-4" /> Télécharger le CV
          </DropdownMenuItem>
          {!isConsumed && videoAvailable && (
            <DropdownMenuItem
              onClick={handleUnlock}
              disabled={isUnlocking}
              className="rounded-lg"
            >
              <LockKeyhole className="mr-2 h-4 w-4" />
              {isUnlocking ? "Déblocage..." : "Débloquer le profil"}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {applicationStatus !== "accepted" && (
            <DropdownMenuItem
              onClick={() => decideApplication("accept")}
              disabled={decisionInProgress !== null}
              className="rounded-lg text-emerald-700 focus:bg-emerald-50 focus:text-emerald-800"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Accepter
            </DropdownMenuItem>
          )}
          {applicationStatus !== "rejected" && (
            <DropdownMenuItem
              onClick={() => decideApplication("reject")}
              disabled={decisionInProgress !== null}
              className="rounded-lg text-red-600 focus:bg-red-50 focus:text-red-700"
            >
              <XCircle className="mr-2 h-4 w-4" /> Refuser
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isUpgradeModalOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-cv-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsUpgradeModalOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="px-6 pb-5 pt-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2
                id="upgrade-cv-title"
                className="text-xl font-bold text-slate-950"
              >
                Limite de consultations atteinte
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Votre plan ne contient plus de crédits disponibles pour
                débloquer ce CV vidéo.
              </p>
            </div>
            <div className="grid gap-2 border-t border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(false)}
                className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/dashboard/entreprise/services";
                }}
                className="h-10 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Voir les abonnements
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
