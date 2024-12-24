import React from 'react';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

const SupportPage: React.FC = () => {
  return (
    <div className="flex justify-center items-center ">
      <div className="mt-24 p-6 border border-gray-300 rounded-lg bg-white max-w-md w-full shadow-lg">
        <h2 className="text-2xl font-semibold  mb-4">Pour tout renseignement, contactez-nous via :</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <FiPhone className="text-green-700 text-2xl" />
            <p className="text-gray-800 text-lg">+212 8 08588918</p>
          </div>
          <div className="flex items-center space-x-4">
            <FiMail className="text-green-700 text-2xl" />
            <p className="text-gray-800 text-lg">contact@facejob.ma</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportPage;
