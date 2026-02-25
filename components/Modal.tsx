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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl relative w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-green-600 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Postuler à l'offre</h2>
          <button
            className="text-white hover:bg-white/20 rounded p-1 transition"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* Offer Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-5 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Briefcase className="text-green-600" size={16} />
              <span className="text-gray-600">Métier:</span>
              <span className="font-medium text-gray-900">{job_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="text-green-600" size={16} />
              <span className="text-gray-600">Entreprise:</span>
              <span className="font-medium text-gray-900">{entreprise_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Grid3x3 className="text-green-600" size={16} />
              <span className="text-gray-600">Secteur:</span>
              <span className="font-medium text-gray-900">{sector_name}</span>
            </div>
          </div>

          {/* Video Selection */}
          <div className="mb-5">
            <label htmlFor="video-select" className="block text-gray-900 font-medium mb-2 text-sm">
              Sélectionnez votre CV vidéo
            </label>
            {videos.length === 1 ? (
              <div className="w-full border border-green-500 bg-green-50 rounded-lg p-3 text-sm text-green-800">
                CV vidéo : {videos[0].job_name} - {videos[0].secteur_name}
              </div>
            ) : (
              <select
                id="video-select"
                value={selectedVideo ? JSON.stringify({ id: selectedVideoId, link: selectedVideo }) : ""}
                onChange={onVideoChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 bg-white text-gray-900"
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                Aucun CV vidéo approuvé disponible. Veuillez créer un CV vidéo et attendre son approbation.
              </div>
            )}
          </div>

          {/* Video Preview */}
          {selectedVideo && (
            <div>
              <p className="text-gray-900 font-medium mb-2 text-sm">Aperçu</p>
              <div className="rounded-lg overflow-hidden border border-gray-200 bg-black">
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
        <div className="border-t border-gray-200 bg-gray-50 px-5 py-3 flex gap-2 justify-end">
          <button
            className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium text-white transition ${
              isButtonDisabled
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
            onClick={() => onValidate(selectedVideo, selectedVideoId)}
            disabled={isButtonDisabled}
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;