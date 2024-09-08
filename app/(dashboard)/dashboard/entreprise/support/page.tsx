import React from 'react';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

const SupportPage: React.FC = () => {
  return (
    <div className="flex justify-center items-center ">
      <div className="mt-24 p-6 border border-gray-300 rounded-lg bg-white max-w-md w-full shadow-lg">
        <h3 className="text-3xl font-semibold  mb-4">Contact Informations</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <FiPhone className="text-green-700 text-2xl" />
            <p className="text-gray-800 text-lg">+212 8 08588918</p>
          </div>
          <div className="flex items-center space-x-4">
            <FiMail className="text-green-700 text-2xl" />
            <p className="text-gray-800 text-lg">contact@facejob.ma</p>
          </div>
          <div className="flex items-center space-x-4">
            <FiMapPin className="text-green-700 text-4xl" />
            <p className="text-gray-800 text-lg">
              Villa 11, Résidence Ryqd Al andalous, Ville Nouvelle Ibn Battouta, Tanger.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportPage;
