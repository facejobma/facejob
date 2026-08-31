"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle } from "lucide-react";

type ApplicationSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ApplicationSuccessModal({ isOpen, onClose }: ApplicationSuccessModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-success-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-6 text-center shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 id="application-success-title" className="text-2xl font-bold text-slate-900">
          Candidature envoyée !
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          Votre candidature a été transmise à l’entreprise. Vous pouvez suivre son évolution depuis votre historique.
        </p>
        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          onClick={onClose}
          autoFocus
        >
          Parfait !
        </button>
      </div>
    </div>,
    document.body,
  );
}
