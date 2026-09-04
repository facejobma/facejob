"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";
import {
  Building2,
  Camera,
  Edit3,
  ExternalLink,
  KeyRound,
  MapPin,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface ProfileEntrepHeaderProps {
  id: number;
  company_name: string;
  sector_name: string;
  image?: string;
  siegeSocial?: string;
  companyLogoUrl?: string;
  website?: string;
  creationDate: string;
  onProfileUpdate?: () => void;
}

interface SectorOption {
  id: number;
  name: string;
}

const fieldClassName =
  "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

const ProfileEntrepHeader = ({
  id,
  company_name,
  sector_name,
  siegeSocial,
  companyLogoUrl,
  website,
  creationDate,
  onProfileUpdate,
}: ProfileEntrepHeaderProps) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sectorOptions, setSectorOptions] = useState<SectorOption[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [formData, setFormData] = useState({
    companyName: company_name,
    sectorId: "",
    address: siegeSocial || "",
    website: website || "",
  });

  const selectedLogoPreview = useMemo(
    () => (selectedLogoFile ? URL.createObjectURL(selectedLogoFile) : null),
    [selectedLogoFile],
  );
  useEffect(
    () => () => {
      if (selectedLogoPreview) URL.revokeObjectURL(selectedLogoPreview);
    },
    [selectedLogoPreview],
  );

  useEffect(() => {
    const controller = new AbortController();
    const loadSectors = async () => {
      try {
        const response = await fetch("/api/v1/sectors", {
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error("Impossible de charger les secteurs");
        const data = payload?.data ?? payload;
        setSectorOptions(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        console.error("Error fetching sectors:", error);
        setSectorOptions([]);
      }
    };
    void loadSectors();
    return () => controller.abort();
  }, []);

  const openEditor = () => {
    const currentSector = sectorOptions.find(
      (option) => option.name === sector_name,
    );
    setFormData({
      companyName: company_name,
      sectorId: currentSector ? String(currentSector.id) : "",
      address: siegeSocial || "",
      website: website || "",
    });
    setSelectedLogoFile(null);
    setRemoveLogo(false);
    setIsEditing(true);
  };

  const closeEditor = () => {
    if (isSubmitting) return;
    setIsEditing(false);
    setSelectedLogoFile(null);
    setRemoveLogo(false);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Formats autorisés : PNG, JPG et WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo.");
      return;
    }
    setSelectedLogoFile(file);
    setRemoveLogo(false);
  };

  const handleProfileUpdate = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const companyName = formData.companyName.trim();
    if (companyName.length < 2 || companyName.length > 255) {
      toast.error(
        "Le nom de l'entreprise doit contenir entre 2 et 255 caractères.",
      );
      return;
    }
    if (!formData.sectorId) {
      toast.error("Veuillez sélectionner un secteur.");
      return;
    }
    if (formData.website) {
      try {
        const url = new URL(formData.website);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      } catch {
        toast.error(
          "Veuillez saisir une adresse de site valide, avec https://.",
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
      const commonValues = {
        company_name: companyName,
        sector_id: formData.sectorId,
        adresse: formData.address.trim(),
        site_web: formData.website.trim(),
        remove_logo: removeLogo,
      };
      let body: BodyInit;
      let method: "POST" | "PUT";
      const headers: Record<string, string> = {
        Authorization: `Bearer ${authToken}`,
        "ngrok-skip-browser-warning": "true",
      };

      if (selectedLogoFile) {
        const data = new FormData();
        Object.entries(commonValues).forEach(([key, value]) =>
          data.append(
            key,
            typeof value === "boolean" ? (value ? "1" : "0") : String(value),
          ),
        );
        data.append("logo", selectedLogoFile);
        body = data;
        method = "POST";
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(commonValues);
        method = "PUT";
      }

      const response = await fetch(`/api/v1/enterprise/updateId/${id}`, {
        method,
        headers,
        body,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const firstValidationError = payload?.errors
          ? (Object.values(payload.errors)[0] as string[] | undefined)?.[0]
          : null;
        throw new Error(
          firstValidationError ||
            payload?.message ||
            "Impossible de mettre à jour le profil.",
        );
      }

      toast.success("Profil mis à jour avec succès");
      setIsEditing(false);
      setSelectedLogoFile(null);
      setRemoveLogo(false);
      onProfileUpdate?.();
    } catch (error) {
      console.error("Error updating profile data:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials =
    company_name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "EN";
  const visibleLogo =
    selectedLogoPreview || (!removeLogo ? companyLogoUrl : undefined);
  const safeWebsite = (() => {
    if (!website) return null;
    try {
      const url = new URL(website);
      return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
    } catch {
      return null;
    }
  })();

  return (
    <>
      <div className="flex min-w-0 flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white text-xl font-bold text-emerald-700 shadow-sm">
          <span>{initials}</span>
          {companyLogoUrl && (
            <img
              src={companyLogoUrl}
              alt={`Logo de ${company_name}`}
              className="absolute inset-0 h-full w-full bg-white object-contain p-1.5"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="break-words text-xl font-bold text-slate-950 sm:text-2xl">
            {company_name}
          </h2>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-emerald-600" />
              {sector_name}
            </span>
            {siegeSocial && (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="break-words">{siegeSocial}</span>
              </span>
            )}
          </div>
          {safeWebsite && (
            <a
              href={safeWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex max-w-full items-center gap-1.5 break-all text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              {website}
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          )}
          {creationDate && (
            <p className="mt-2 text-xs text-slate-500">
              Compte créé le{" "}
              {new Date(`${creationDate}T12:00:00`).toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={openEditor}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Edit3 className="h-4 w-4" />
            Modifier
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/entreprise/change-password")}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <KeyRound className="h-4 w-4" />
            <span className="hidden sm:inline">Mot de passe</span>
          </button>
        </div>
      </div>

      <Modal
        isOpen={isEditing}
        onClose={closeEditor}
        title="Modifier le profil"
        description="Actualisez l’identité et le logo de votre entreprise."
        size="profile"
      >
        <form onSubmit={handleProfileUpdate} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-800">
              Nom de l'entreprise <span className="text-red-500">*</span>
              <input
                type="text"
                value={formData.companyName}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    companyName: event.target.value,
                  }))
                }
                maxLength={255}
                className={`${fieldClassName} mt-2`}
              />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Secteur <span className="text-red-500">*</span>
              <select
                value={formData.sectorId}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    sectorId: event.target.value,
                  }))
                }
                className={`${fieldClassName} mt-2`}
              >
                <option value="">Sélectionner un secteur</option>
                {sectorOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Site internet
              <input
                type="url"
                value={formData.website}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    website: event.target.value,
                  }))
                }
                maxLength={255}
                placeholder="https://www.entreprise.ma"
                className={`${fieldClassName} mt-2`}
              />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Adresse
              <input
                type="text"
                value={formData.address}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
                maxLength={500}
                className={`${fieldClassName} mt-2`}
              />
            </label>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Logo de l'entreprise
                </p>
                <p className="text-xs text-slate-500">
                  PNG, JPG ou WEBP, 5 Mo maximum.
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            {visibleLogo ? (
              <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                <img
                  src={visibleLogo}
                  alt="Aperçu du logo"
                  className="h-20 w-20 rounded-xl border border-slate-200 bg-white object-contain p-1"
                />
                <div className="flex flex-1 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    <Camera className="h-4 w-4" />
                    Changer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLogoFile(null);
                      setRemoveLogo(true);
                    }}
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-7 text-center transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <Upload className="h-7 w-7 text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">
                  Choisir un logo
                </span>
              </button>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeEditor}
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
    </>
  );
};

export default ProfileEntrepHeader;
