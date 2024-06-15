import React from 'react';

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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 relative w-[600px] max-w-full">
        <button
          className="absolute top-2 right-2 text-gray-700"
          onClick={onClose}
        >
          X
        </button>
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4">Postuler</h2>
          <p><strong>Metier :</strong> {job_name}</p>
          <p><strong>Entreprise :</strong> {entreprise_name}</p>
          <p><strong>Secteur :</strong> {sector_name}</p>
          <div className="mt-4">
            <label htmlFor="video-select" className="block mb-2">
              Choisir le CV vidéo pour postuler :
            </label>
            <select
              id="video-select"
              value={selectedVideo}
              onChange={onVideoChange}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Sélectionner une vidéo</option>
              {videos.map((video) => (
                <option key={video.id} value={video.link}>
                  {`${video.job_name} - ${video.secteur_name}`}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          {selectedVideo && (
            <video width="100%" height="auto" controls>
              <source src={selectedVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <button
            className="bg-gray-200 text-gray-700 rounded-lg px-4 py-2 mr-2"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className={`bg-primary text-white rounded-lg px-4 py-2 ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => onValidate(selectedVideo)}
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
