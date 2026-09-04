"use client";

import { useEffect, useState } from "react";
import { Building2, Edit3, FileText, Save } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

interface BioEntrepSectionProps {
  id: number;
  bio: string;
  onUpdated?: () => void;
}

const plainText = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

const BioEntrepSection = ({ id, bio, onUpdated }: BioEntrepSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBio, setNewBio] = useState(plainText(bio || ""));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => setNewBio(plainText(bio || "")), [bio]);

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsEditing(false);
    setNewBio(plainText(bio || ""));
  };

  const handleBioUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = newBio.trim();
    if (value.length > 10000) {
      toast.error("La présentation ne peut pas dépasser 10 000 caractères.");
      return;
    }
    setIsSubmitting(true);
    try {
      const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
      const response = await fetch(`/api/v1/enterprise/updateId/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bio: value }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          payload?.message || "Impossible de mettre à jour la présentation.",
        );
      }
      setIsEditing(false);
      onUpdated?.();
    } catch (error) {
      console.error("Error updating bio:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900">Présentation</h3>
            <p className="text-xs text-slate-500">
              Décrivez votre activité et votre culture.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
        >
          <Edit3 className="h-4 w-4" />
          <span className="hidden sm:inline">Modifier</span>
        </button>
      </div>
      <div className="flex flex-1 p-4 sm:p-5">
        {newBio ? (
          <p className="max-w-full whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
            {newBio}
          </p>
        ) : (
          <div className="flex min-h-40 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <Building2 className="h-7 w-7 text-slate-400" />
            <p className="mt-3 font-semibold text-slate-700">
              Aucune présentation
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Ajoutez une description pour aider les candidats à découvrir votre
              entreprise.
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isEditing}
        onClose={handleCloseModal}
        title="Modifier la présentation"
        description="Présentez clairement votre entreprise aux futurs candidats."
        size="profile"
      >
        <form onSubmit={handleBioUpdate} className="space-y-5">
          <div>
            <label
              htmlFor="enterprise-bio"
              className="text-sm font-semibold text-slate-800"
            >
              Présentation de l'entreprise
            </label>
            <textarea
              id="enterprise-bio"
              value={newBio}
              onChange={(event) => setNewBio(event.target.value)}
              maxLength={10000}
              rows={8}
              className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              placeholder="Activité, valeurs, environnement de travail…"
            />
            <p className="mt-1 text-right text-xs text-slate-500">
              {newBio.length} / 10 000
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={isSubmitting}
              className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BioEntrepSection;
