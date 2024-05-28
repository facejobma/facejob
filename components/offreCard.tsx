"use client";

import React from "react";

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
  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 p-4 flex justify-between items-center">
      <div className="flex flex-col">
        <h3 className="text-xl font-bold">{titre}</h3>
        <p><strong>Entreprise ID:</strong> {entreprise_name}</p>
        <p><strong>Sector :</strong> {sector_name}</p>
        <p><strong>Location:</strong> {location}</p>
        <p><strong>Contract Type:</strong> {contract_type}</p>
        <p><strong>Date Debut:</strong> {date_debut.split('T')[0]}</p>
        <p><strong>Date Fin:</strong> {date_fin.split('T')[0]}</p>
        <p><strong>Description:</strong> {description}</p>
      </div>
    </div>
  );
};

export default OffreCard;
