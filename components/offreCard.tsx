import React, { useState } from "react";
import { MapPin, Building, Briefcase, Calendar, FileText , ReceiptText, ArrowRightCircle } from "lucide-react";

interface OffreCardProps {
  titre: string;
  entreprise_name: string;
  sector_name: string;
  location: string;
  contract_type: string;
  date_debut: string;
  date_fin: string;
  description: string;
}

const OffreCard: React.FC<OffreCardProps> = ({ 
  titre, 
  entreprise_name, 
  sector_name, 
  location,  
  contract_type, 
  date_debut, 
  description,
  date_fin 
}) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-primary">{titre}</h3>
        <button className="flex items-center text-white bg-primary rounded-lg px-4 py-2">
          Postuler <ArrowRightCircle className="ml-2" size={24} />
        </button>
      </div>
      <div className="mb-4 flex items-center">
        <Building className="mr-2 text-primary" />
        <p><strong>Entreprise :</strong> {entreprise_name}</p>
      </div>
      <div className="mb-4 flex items-center">
        <Briefcase className="mr-2 text-primary" />
        <p><strong>Secteur :</strong> {sector_name}</p>
      </div>
      <div className="mb-4 flex items-center">
        <MapPin className="mr-2 text-primary" />
        <p><strong>Location:</strong> {location}</p>
      </div>
      <div className="mb-4 flex items-center">
        <ReceiptText className="mr-2 text-primary" />
        <p><strong>Type de Contrat:</strong> {contract_type}</p>
      </div>
      <div className="mb-4 flex items-center">
        <Calendar className="mr-2 text-primary" />
        <p><strong>Date de Début:</strong> {date_debut.split(' ')[0]}</p>
      </div>
      <div className="mb-4 flex items-center">
        <Calendar className="mr-2 text-primary" />
        <p><strong>Date de Fin:</strong> {date_fin.split(' ')[0]}</p>
      </div>
      <div className="mb-4 flex items-center">
        <FileText className="mr-2 text-primary" />
        <p><strong>Description:</strong></p>
      </div>
      <div className="bg-gray-100 rounded-lg p-4">
        <div className={showFullDescription ? "" : "max-h-20 overflow-hidden"}>
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </div>
        {description.length > 40 && (
          <p 
            className="text-primary cursor-pointer mt-2" 
            onClick={toggleDescription}
          >
            {showFullDescription ? "Afficher moins" : "Afficher plus"}
          </p>
        )}
      </div>
    </div>
  );
};

export default OffreCard;
