import React from 'react';
import { X, Video, Building, Briefcase, Grid3x3 } from 'lucide-react';

interface ModalProps {
  offreId: number;
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  onValidate: (selectedVideo: string) => void;
  titre: string;
  job_name: string;
  entreprise_name: string;
  sector_name: string;
  videos: { id: string; link: string; job_name: string; secteur_name: string }[];
  selectedVideo: string;
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
  onVideoChange,
}) => {
  if (!isOpen) return null;

  const isButtonDisabled = selectedVideo === '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white shadow-2xl relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-blue-600 text-white p-6 ">
          <button
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold mb-2">Postuler à l'offre</h2>
          <p className="text-blue-100 text-sm">Sélectionnez votre CV vidéo pour cette candidature</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Offer Details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
            <div className="flex items-start gap-3">
              <Briefcase className="text-primary mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-gray-600">Métier</p>
                <p className="font-semibold text-gray-800">{job_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building className="text-primary mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-gray-600">Entreprise</p>
                <p className="font-semibold text-gray-800">{entreprise_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Grid3x3 className="text-primary mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-gray-600">Secteur</p>
                <p className="font-semibold text-gray-800">{sector_name}</p>
              </div>
            </div>
          </div>

          {/* Video Selection */}
          <div className="mb-6">
            <label htmlFor="video-select" className="flex items-center gap-2 text-gray-700 font-medium mb-3">
              <Video size={20} className="text-primary" />
              Choisir votre CV vidéo
            </label>
            <select
              id="video-select"
              value={selectedVideo}
              onChange={onVideoChange}
              className="w-full border-2 border-gray-300 rounded-xl p-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all duration-200 bg-white"
            >
              <option value="">-- Sélectionner une vidéo --</option>
              {videos.map((video) => (
             <option key={video.id} value={JSON.stringify({ id: video.id, link: video.link })}>
  {video.job_name} - {video.secteur_name}
</option>


              ))}
            </select>
            {videos.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">Aucune vidéo disponible. Veuillez créer un CV vidéo d'abord.</p>
            )}
          </div>

          {/* Video Preview */}
          {selectedVideo && (
            <div className="mb-6">
              <p className="text-gray-700 font-medium mb-3">Aperçu de votre vidéo</p>
              <div className="rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
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

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              className="px-6 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              className={`px-6 py-2.5 rounded-xl font-medium text-white transition-all duration-200 ${
                isButtonDisabled
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-primary hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
              onClick={() => onValidate(selectedVideo)}
              disabled={isButtonDisabled}
            >
              Valider ma candidature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;