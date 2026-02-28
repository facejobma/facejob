import React from 'react';
import { X, Video, Building, Briefcase, Grid3x3, AlertCircle } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 rounded-lg p-2">
                  <Video className="text-green-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Postuler à l'offre</h2>
              </div>
              <p className="text-gray-900 font-semibold text-lg">{titre}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Offer Details - Compact in header */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
            <div className="flex items-center gap-1.5">
              <Building className="text-green-600" size={16} />
              <span className="font-medium">{entreprise_name}</span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1.5">
              <Briefcase className="text-green-600" size={16} />
              <span>{job_name}</span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1.5">
              <Grid3x3 className="text-green-600" size={16} />
              <span>{sector_name}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Video Selection */}
          <div className="mb-4">
            <label htmlFor="video-select" className="flex items-center gap-2 text-gray-900 font-semibold mb-2 text-sm">
              <Video className="text-green-600" size={18} />
              Sélectionnez votre CV vidéo
            </label>
            {videos.length === 1 ? (
              <div className="w-full border-2 border-green-500 bg-green-50 rounded-lg p-3 text-green-800 flex items-center gap-2">
                <div className="bg-green-100 rounded-lg p-1.5">
                  <Video className="text-green-600" size={18} />
                </div>
                <div>
                  <div className="font-semibold text-sm">{videos[0].job_name}</div>
                  <div className="text-xs text-green-700">{videos[0].secteur_name}</div>
                </div>
              </div>
            ) : (
              <select
                id="video-select"
                value={selectedVideo ? JSON.stringify({ id: selectedVideoId, link: selectedVideo }) : ""}
                onChange={onVideoChange}
                className="w-full border-2 border-gray-300 rounded-lg p-2.5 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white text-gray-900 text-sm transition-all"
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
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-red-700 flex items-start gap-2">
                <div className="bg-red-100 rounded-lg p-1.5 flex-shrink-0">
                  <AlertCircle className="text-red-600" size={18} />
                </div>
                <div>
                  <div className="font-semibold text-sm mb-0.5">Aucun CV vidéo disponible</div>
                  <div className="text-xs">Veuillez créer un CV vidéo et attendre son approbation.</div>
                </div>
              </div>
            )}
          </div>

          {/* Video Preview */}
          {selectedVideo && (
            <div>
              <p className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
                <Video className="text-green-600" size={20} />
                Aperçu de votre CV vidéo
              </p>
              <div className="rounded-xl overflow-hidden border-2 border-gray-200 bg-black shadow-lg">
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

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={() => onValidate(selectedVideo, selectedVideoId)}
            disabled={isButtonDisabled}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all ${
              isButtonDisabled
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Valider ma candidature
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;