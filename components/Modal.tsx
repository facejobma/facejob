"use client";

import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { AlertCircle, Briefcase, Building, CheckCircle2, Grid3x3, Loader2, Send, Video, X } from "lucide-react";

interface ModalProps {
  offreId: number;
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  onValidate: (selectedVideo: string, videoId?: number | null) => void;
  titre: string;
  job_name: string;
  entreprise_name: string;
  sector_name: string;
  videos: { id: string; link: string; job_name: string; secteur_name: string }[];
  selectedVideo: string;
  selectedVideoId: number | null;
  isSubmitting?: boolean;
  onVideoChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onValidate, titre, job_name, entreprise_name, sector_name, videos = [], selectedVideo, selectedVideoId, isSubmitting = false, onVideoChange }) => {
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;
  const isButtonDisabled = !selectedVideo || isSubmitting;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-5" onClick={isSubmitting ? undefined : onClose}>
      <div className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="apply-modal-title" onClick={(event) => event.stopPropagation()}>
        <header className="shrink-0 border-b border-slate-200 bg-gradient-to-br from-white via-emerald-50/60 to-teal-50/70 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 ring-1 ring-emerald-200"><Send className="h-5 w-5 text-emerald-700" /></div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Candidature</p>
                  <h2 id="apply-modal-title" className="text-xl font-bold text-slate-900 sm:text-2xl">Postuler à l'offre</h2>
                </div>
              </div>
              <p className="truncate text-base font-semibold text-slate-900 sm:text-lg">{titre}</p>
            </div>
            <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Fermer"><X className="h-5 w-5" /></button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs sm:text-sm">
            <InfoPill icon={<Building className="h-3.5 w-3.5" />} label={entreprise_name} />
            {job_name && <InfoPill icon={<Briefcase className="h-3.5 w-3.5" />} label={job_name} />}
            {sector_name && <InfoPill icon={<Grid3x3 className="h-3.5 w-3.5" />} label={sector_name} />}
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 p-4 sm:p-6">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <label htmlFor="video-select" className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Video className="h-4 w-4 text-emerald-600" />CV vidéo à envoyer</label>
                <p className="mt-1 text-xs text-slate-500">Seuls vos CV vidéo approuvés peuvent être utilisés.</p>
              </div>
              {selectedVideo && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />}
            </div>

            {videos.length === 1 ? (
              <div className="flex w-full items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-emerald-900">
                <div className="rounded-lg bg-white p-2 shadow-sm"><Video className="h-4 w-4 text-emerald-600" /></div>
                <div className="min-w-0"><div className="truncate text-sm font-semibold">{videos[0].job_name || "CV vidéo"}</div><div className="truncate text-xs text-emerald-700">{videos[0].secteur_name || "CV approuvé"}</div></div>
              </div>
            ) : videos.length > 1 ? (
              <select id="video-select" value={selectedVideo ? JSON.stringify({ id: selectedVideoId, link: selectedVideo }) : ""} onChange={onVideoChange} disabled={isSubmitting} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60">
                <option value="">Sélectionner un CV vidéo</option>
                {videos.map((video) => <option key={video.id} value={JSON.stringify({ id: video.id, link: video.link })}>{video.job_name} - {video.secteur_name}</option>)}
              </select>
            ) : (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
                <div className="rounded-lg bg-amber-100 p-2"><AlertCircle className="h-4 w-4 text-amber-600" /></div>
                <div><div className="text-sm font-semibold">Aucun CV vidéo disponible</div><p className="mt-0.5 text-xs leading-5">Créez un CV vidéo et attendez son approbation avant de postuler.</p></div>
              </div>
            )}
          </section>

          {selectedVideo && (
            <section className="mt-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><Video className="h-4 w-4 text-emerald-600" />Aperçu avant envoi</p>
              <div className="aspect-video max-h-[40dvh] overflow-hidden rounded-xl bg-black shadow-inner">
                <video key={selectedVideo} controls preload="metadata" className="h-full w-full object-contain"><source src={selectedVideo} type="video/mp4" />Votre navigateur ne supporte pas la lecture de vidéos.</video>
              </div>
            </section>
          )}
        </main>

        <footer className="grid shrink-0 grid-cols-2 gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:flex sm:justify-end sm:px-6">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-32">Annuler</button>
          <button type="button" onClick={() => onValidate(selectedVideo, selectedVideoId)} disabled={isButtonDisabled} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition sm:min-w-56 ${isButtonDisabled ? "cursor-not-allowed bg-slate-300" : "bg-emerald-600 shadow-sm hover:bg-emerald-700"}`}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{isSubmitting ? "Envoi en cours..." : "Envoyer ma candidature"}
          </button>
        </footer>
      </div>
    </div>, document.body,
  );
};

function InfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1.5 text-emerald-700"><span className="shrink-0">{icon}</span><span className="truncate font-medium text-slate-600">{label}</span></div>;
}

export default Modal;
