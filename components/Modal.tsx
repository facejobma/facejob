import React from 'react';
import { X, Video, Building, Briefcase, Grid3x3 } from 'lucide-react';

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
  onVideoChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onValidate,
  titre,
  job_name,
  entreprise_name,
  sector_name,
  videos = [],
  selectedVideo,
  selectedVideoId,
  onVideoChange,
}) => {
  if (!isOpen) return null;

  const isButtonDisabled = selectedVideo === '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl relative w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
          <button
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold mb-2">Postuler à l'offre</h2>
          <p className="text-green-50 text-sm">Sélectionnez votre CV vidéo pour cette candidature</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Offer Details */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 mb-6 space-y-3 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-lg p-2">
                <Briefcase className="text-green-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Métier</p>
                <p className="font-semibold text-gray-900 text-lg">{job_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-lg p-2">
                <Building className="text-green-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Entreprise</p>
                <p className="font-semibold text-gray-900 text-lg">{entreprise_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-lg p-2">
                <Grid3x3 className="text-green-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Secteur</p>
                <p className="font-semibold text-gray-900 text-lg">{sector_name}</p>
              </div>
            </div>
          </div>

          {/* Video Selection */}
          <div className="mb-6">
            <label htmlFor="video-select" className="flex items-center gap-2 text-gray-900 font-semibold mb-3 text-sm">
              <span className="bg-green-100 rounded-lg p-1.5 inline-flex">
                <Video size={18} className="text-green-600" />
              </span>
              Choisir votre CV vidéo
            </label>
            {videos.length === 1 ? (
              <div className="w-full border-2 border-green-400 bg-green-50 rounded-xl p-4 flex items-center gap-3">
                <div className="bg-green-500 rounded-full p-1 flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-green-800 font-medium">
                  CV vidéo sélectionné : {videos[0].job_name} - {videos[0].secteur_name}
                </p>
              </div>
            ) : (
              <select
                id="video-select"
                value={selectedVideo ? JSON.stringify({ id: selectedVideoId, link: selectedVideo }) : ""}
                onChange={onVideoChange}
                className="w-full border-2 border-gray-300 rounded-xl p-3.5 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white text-gray-900 font-medium"
              >
                <option value="">-- Sélectionner une vidéo --</option>
                {videos.map((video) => (
                  <option key={video.id} value={JSON.stringify({ id: video.id, link: video.link })}>
                    {video.job_name} - {video.secteur_name}
                  </option>
                ))}
              </select>
            )}
            {videos.length === 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                <div className="bg-red-500 rounded-full p-1 flex-shrink-0 mt-0.5">
                  <X className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm text-red-700 font-medium">
                  Aucun CV vidéo approuvé disponible. Veuillez créer un CV vidéo et attendre son approbation.
                </p>
              </div>
            )}
          </div>

          {/* Video Preview */}
          {selectedVideo && (
            <div className="mb-6">
              <div className="text-gray-900 font-semibold mb-3 text-sm flex items-center gap-2">
                <div className="bg-green-100 rounded-lg p-1.5">
                  <Video size={18} className="text-green-600" />
                </div>
                Aperçu de votre vidéo
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg border-2 border-gray-200 bg-black">
                <video 
                  key={selectedVideo} 
                  width="100%" 
                  height="auto" 
                  controls
                  className="w-full"
                >
                  <source src={selectedVideo} type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex gap-3 justify-end">
          <button
            className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 ${
              isButtonDisabled
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
            onClick={() => onValidate(selectedVideo, selectedVideoId)}
            disabled={isButtonDisabled}
          >
            Valider ma candidature
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;