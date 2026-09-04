"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { changeEntreprisePassword } from "@/lib/api";

type Field = "old" | "next" | "confirm";

export default function ChangePassword() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState<Record<Field, boolean>>({
    old: false,
    next: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const rules = useMemo(
    () => [
      { label: "Au moins 8 caractères", valid: newPassword.length >= 8 },
      {
        label: "Une lettre majuscule et une minuscule",
        valid: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword),
      },
      { label: "Au moins un chiffre", valid: /\d/.test(newPassword) },
    ],
    [newPassword],
  );

  const toggle = (field: Field) =>
    setVisible((current) => ({ ...current, [field]: !current[field] }));
  const update = (
    field: Field,
    value: string,
    setter: (value: string) => void,
  ) => {
    setter(value);
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const nextErrors: Partial<Record<Field, string>> = {};
    if (!oldPassword) nextErrors.old = "Saisissez votre mot de passe actuel.";
    if (newPassword.length < 8)
      nextErrors.next =
        "Le nouveau mot de passe doit contenir au moins 8 caractères.";
    else if (newPassword === oldPassword)
      nextErrors.next =
        "Le nouveau mot de passe doit être différent de l’ancien.";
    if (!confirmPassword)
      nextErrors.confirm = "Confirmez votre nouveau mot de passe.";
    else if (newPassword !== confirmPassword)
      nextErrors.confirm = "Les deux mots de passe ne correspondent pas.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      const result = await changeEntreprisePassword(
        oldPassword,
        newPassword,
        confirmPassword,
      );
      toast.success(result?.message || "Votre mot de passe a été modifié.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.push("/dashboard/entreprise/profile");
      router.refresh();
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "Impossible de modifier le mot de passe.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const PasswordField = ({
    field,
    label,
    value,
    setter,
    autoComplete,
  }: {
    field: Field;
    label: string;
    value: string;
    setter: (value: string) => void;
    autoComplete: string;
  }) => (
    <div>
      <label
        htmlFor={`${field}-password`}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>
      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id={`${field}-password`}
          type={visible[field] ? "text" : "password"}
          value={value}
          onChange={(event) => update(field, event.target.value, setter)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(errors[field])}
          aria-describedby={errors[field] ? `${field}-error` : undefined}
          className={`h-12 w-full rounded-xl border bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${errors[field] ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"}`}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => toggle(field)}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label={
            visible[field]
              ? "Masquer le mot de passe"
              : "Afficher le mot de passe"
          }
        >
          {visible[field] ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {errors[field] && (
        <p
          id={`${field}-error`}
          className="mt-1.5 text-xs font-medium text-red-600"
        >
          {errors[field]}
        </p>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 p-6 text-white shadow-lg shadow-emerald-950/10 sm:p-8">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
            <KeyRound className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Sécurité du compte
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
              Mettez à jour votre mot de passe pour protéger l’accès à votre
              espace entreprise.
            </p>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-semibold text-slate-900">
              Modifier le mot de passe
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tous les champs sont obligatoires.
            </p>
          </div>
          <form onSubmit={submit} noValidate className="space-y-5 p-6">
            <PasswordField
              field="old"
              label="Mot de passe actuel"
              value={oldPassword}
              setter={setOldPassword}
              autoComplete="current-password"
            />
            <div className="border-t border-slate-100 pt-5">
              <PasswordField
                field="next"
                label="Nouveau mot de passe"
                value={newPassword}
                setter={setNewPassword}
                autoComplete="new-password"
              />
            </div>
            <PasswordField
              field="confirm"
              label="Confirmer le nouveau mot de passe"
              value={confirmPassword}
              setter={setConfirmPassword}
              autoComplete="new-password"
            />
            <div className="grid gap-2 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
              {rules.map((rule) => (
                <div
                  key={rule.label}
                  className={`flex items-center gap-2 text-xs ${rule.valid ? "font-medium text-emerald-700" : "text-slate-500"}`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${rule.valid ? "bg-emerald-100" : "bg-slate-200"}`}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  {rule.label}
                </div>
              ))}
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={submitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                {submitting ? "Enregistrement…" : "Enregistrer le mot de passe"}
              </button>
            </div>
          </form>
        </section>
        <aside className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <h2 className="mt-4 font-semibold text-slate-900">
            Quelques bonnes pratiques
          </h2>
          <ul className="mt-3 space-y-3 text-sm leading-5 text-slate-600">
            <li>Utilisez un mot de passe unique pour FaceJob.</li>
            <li>
              Évitez le nom de votre entreprise ou des informations faciles à
              deviner.
            </li>
            <li>
              Ne partagez jamais votre mot de passe par e-mail ou messagerie.
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
