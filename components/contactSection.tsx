"use client";

import { useEffect, useState } from "react";
import { Edit3, Linkedin, Mail, MapPin, Phone, Save } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

interface ContactSectionProps {
  id: number;
  email: string;
  phone: string;
  linkedin: string;
  adresse: string;
  onUpdated?: () => void;
}

const ContactSection = ({
  id,
  email,
  phone,
  linkedin,
  adresse,
  onUpdated,
}: ContactSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newPhone, setNewPhone] = useState(phone || "");
  const [newLinkedin, setNewLinkedin] = useState(linkedin || "");
  const [newAdresse, setNewAdresse] = useState(adresse || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setNewPhone(phone || "");
    setNewLinkedin(linkedin || "");
    setNewAdresse(adresse || "");
  }, [phone, linkedin, adresse]);

  const closeModal = () => {
    if (isSubmitting) return;
    setIsEditing(false);
    setNewPhone(phone || "");
    setNewLinkedin(linkedin || "");
    setNewAdresse(adresse || "");
  };

  const handleContactUpdate = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (newPhone.length > 30 || newAdresse.length > 500) {
      toast.error("Veuillez vérifier la longueur des coordonnées saisies.");
      return;
    }
    if (newLinkedin) {
      try {
        const url = new URL(newLinkedin);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      } catch {
        toast.error("Veuillez saisir une URL LinkedIn valide.");
        return;
      }
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
        body: JSON.stringify({
          phone: newPhone.trim(),
          linkedin: newLinkedin.trim(),
          adresse: newAdresse.trim(),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const firstValidationError = payload?.errors
          ? (Object.values(payload.errors)[0] as string[] | undefined)?.[0]
          : null;
        throw new Error(
          firstValidationError ||
            payload?.message ||
            "Impossible de mettre à jour les coordonnées.",
        );
      }
      setIsEditing(false);
      onUpdated?.();
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactItems = [
    {
      icon: Mail,
      label: "Email du compte",
      value: email || "Non renseigné",
      href: email ? `mailto:${email}` : undefined,
      color: "bg-blue-50 text-blue-700",
    },
    {
      icon: Phone,
      label: "Téléphone",
      value: newPhone || "Non renseigné",
      href: newPhone ? `tel:${newPhone}` : undefined,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      value: newLinkedin || "Non renseigné",
      href: (() => {
        try {
          const url = new URL(newLinkedin);
          return ["http:", "https:"].includes(url.protocol)
            ? url.toString()
            : undefined;
        } catch {
          return undefined;
        }
      })(),
      color: "bg-sky-50 text-sky-700",
    },
    {
      icon: MapPin,
      label: "Adresse",
      value: newAdresse || "Non renseignée",
      color: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
        <div>
          <h3 className="font-semibold text-slate-900">Coordonnées</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Informations permettant de vous contacter.
          </p>
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
      <div className="grid flex-1 grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5">
        {contactItems.map(({ icon: Icon, label, value, href, color }) => (
          <div
            key={label}
            className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{label}</p>
              {href ? (
                <a
                  href={href}
                  target={label === "LinkedIn" ? "_blank" : undefined}
                  rel={label === "LinkedIn" ? "noopener noreferrer" : undefined}
                  className="mt-0.5 block break-words text-sm font-medium text-slate-800 transition hover:text-emerald-700"
                >
                  {value}
                </a>
              ) : (
                <p className="mt-0.5 break-words text-sm font-medium text-slate-700">
                  {value}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isEditing}
        onClose={closeModal}
        title="Modifier les coordonnées"
        description="Actualisez les informations publiques de votre entreprise."
        size="profile"
      >
        <form onSubmit={handleContactUpdate} className="space-y-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
            <p className="text-xs font-semibold text-blue-900">
              Email du compte
            </p>
            <p className="mt-0.5 break-all text-sm text-blue-800">{email}</p>
            <p className="mt-1 text-xs text-blue-700">
              Pour des raisons de sécurité, l’adresse de connexion ne se modifie
              pas depuis ce formulaire.
            </p>
          </div>
          <label className="block text-sm font-semibold text-slate-800">
            Téléphone
            <input
              type="tel"
              value={newPhone}
              onChange={(event) => setNewPhone(event.target.value)}
              maxLength={30}
              className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              placeholder="+212 6 12 34 56 78"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            LinkedIn
            <input
              type="url"
              value={newLinkedin}
              onChange={(event) => setNewLinkedin(event.target.value)}
              maxLength={255}
              className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              placeholder="https://linkedin.com/company/votre-entreprise"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Adresse
            <textarea
              value={newAdresse}
              onChange={(event) => setNewAdresse(event.target.value)}
              maxLength={500}
              rows={3}
              className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              placeholder="123 Rue Exemple, Casablanca"
            />
          </label>
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
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

export default ContactSection;
