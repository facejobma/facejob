import React, { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import Cookies from 'js-cookie';
import {
  MapPin,
  Building,
  Briefcase,
  Calendar,
  FileText,
  ReceiptText,
  ArrowRightCircle,
  CheckCircle,
} from 'lucide-react';

interface OffreCardProps {
  offreId: number;
  titre: string;
  entreprise_name: string;
  sector_name: string;
  job_name: string;
  location: string;
  contract_type: string;
  date_debut: string;
  date_fin: string;
  description: string;
}

const OffreCard: React.FC<OffreCardProps> = ({
  offreId,
  titre,
  entreprise_name,
  sector_name,
  job_name,
  location,
  contract_type,
  date_debut,
  description,
  date_fin,
}) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalData, setModalData] = useState({
    titre: '',
    entreprise_name: '',
    sector_name: '',
    job_name: '',
  });
  const [videos, setVideos] = useState<
    { id: string; link: string; job_name: string; secteur_name: string }[]
  >([]);
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  const authToken = Cookies.get('authToken');
  const user = sessionStorage.getItem('user');
  const userId = user ? JSON.parse(user).id : null;

  useEffect(() => {
    if (modalIsOpen && userId) {
      const fetchVideos = async () => {
        setLoading(true);
        setError(null);

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidate-video/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch videos');
          }

          const data = await response.json();
          setVideos(data);
        } catch (error) {
          setError('Error fetching videos');
          console.error('Error fetching videos:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchVideos();
    }
  }, [modalIsOpen, userId, authToken]);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const openModal = () => {
    setModalData({ titre, entreprise_name, sector_name, job_name });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setIsConfirmationVisible(false); // Reset confirmation message visibility
  };

  const handleVideoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVideo(event.target.value);
    setIsButtonDisabled(event.target.value === '');
  };

  const handleValidate = async (selectedVideo: string) => {
    if (!selectedVideo) {
      return; // Do nothing if no video is selected
    }

    try {
      // Simulate API call with timeout
      setLoading(true);
      setIsButtonDisabled(true); // Disable button during API call

      // Replace this with actual API call
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/postuler-offre`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          video_url: selectedVideo,
          candidat_id: userId,
          offre_id: offreId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      // Reset state after successful submission
      setIsConfirmationVisible(true);
      setSelectedVideo(''); // Clear selected video after success (optional)

    } catch (error) {
      console.error('Error submitting application:', error);
      // Handle error state or show error message to user
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-primary">{job_name}</h3>
        <button
          className="flex items-center text-white bg-primary rounded-lg px-4 py-2"
          onClick={openModal}
        >
          Postuler <ArrowRightCircle className="ml-2" size={24} />
        </button>
      </div>
      <div className="mb-4 flex items-center">
        <Building className="mr-2 text-primary" />
        <p>
          <strong>Entreprise :</strong> {entreprise_name}
        </p>
      </div>
      <div className="mb-4 flex items-center">
        <Briefcase className="mr-2 text-primary" />
        <p>
          <strong>Secteur :</strong> {sector_name}
        </p>
      </div>
      <div className="mb-4 flex items-center">
        <MapPin className="mr-2 text-primary" />
        <p>
          <strong>Location:</strong> {location}
        </p>
      </div>
      <div className="mb-4 flex items-center">
        <ReceiptText className="mr-2 text-primary" />
        <p>
          <strong>Type de Contrat:</strong> {contract_type}
        </p>
      </div>
      <div className="mb-4 flex items-center">
        <Calendar className="mr-2 text-primary" />
        <p>
          <strong>Date de Début:</strong> {date_debut.split(' ')[0]}
        </p>
      </div>
      <div className="mb-4 flex items-center">
        <Calendar className="mr-2 text-primary" />
        <p>
          <strong>Date de Fin:</strong> {date_fin ? date_fin.split(' ')[0] : ''}
        </p>
      </div>
      <div className="mb-4 flex items-center">
        <FileText className="mr-2 text-primary" />
        <p>
          <strong>Description:</strong>
        </p>
      </div>
      <div className="bg-gray-100 rounded-lg p-4">
        <div className={showFullDescription ? '' : 'max-h-20 overflow-hidden'}>
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </div>
        {description.length > 40 && (
          <p className="text-primary cursor-pointer mt-2" onClick={toggleDescription}>
            {showFullDescription ? 'Afficher moins' : 'Afficher plus'}
          </p>
        )}
      </div>

      <Modal
        offreId={offreId}
        userId={userId}
        isOpen={modalIsOpen}
        onClose={closeModal}
        onValidate={handleValidate}
        titre={modalData.titre}
        job_name={modalData.job_name}
        entreprise_name={modalData.entreprise_name}
        sector_name={modalData.sector_name}
        videos={videos}
        selectedVideo={selectedVideo}
        onVideoChange={handleVideoChange}
      />

      {isConfirmationVisible && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 relative w-[600px] max-w-full">
            <CheckCircle className="text-green-500 mx-auto" size={64} />
            <h2 className="text-xl font-bold text-center my-4">Postulation réussie !</h2>
            <button
              className="bg-primary text-white rounded-lg px-4 py-2 mx-auto block"
              onClick={closeModal}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffreCard;
