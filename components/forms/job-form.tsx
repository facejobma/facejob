import Image from "next/image";
import { CheckCircle, XCircle } from "lucide-react";
import { FiUser } from "react-icons/fi"; // Importer l'icône de personne depuis react-icons

interface Candidat {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  tel: string;
  sex: string;
  bio: string;
  years_of_experience: number;
  is_completed: number;
  job_id: number;
  image: string | null; // Assurez-vous que chaque candidat a une propriété image
  created_at: string;
  updated_at: string;
  address: string | null;
  zip_code: string | null;
}

interface JobData {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  company_name: string;
  sector_name: string;
  contractType: string;
  is_verified: string;
  applications: {
    candidat: Candidat;
    link: string;
  }[];
  candidats_count: number;
}

export const JobForm: React.FC<{ initialData: JobData }> = ({
  initialData,
}) => {
  const isPending = initialData.is_verified === "Pending";
  const isAccepted = initialData.is_verified === "Accepted";
  const isDeclined = initialData.is_verified === "Declined";

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg max-w-md mx-auto mt-8 p-6">
      <h1 className="text-lg font-semibold mb-2">{initialData.titre}</h1>
      <p className="text-gray-600 text-center mt-4">
        {initialData.description}
      </p>

      <div className="mt-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Date de début</h2>
          <p className="text-gray-600">{initialData.date_debut}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Date de fin</h2>
          <p className="text-gray-600">{initialData.date_fin}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Nom de l'entreprise</h2>
          <p className="text-blue-500 hover:underline">
            {initialData.company_name}
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Secteur</h2>
          <p className="text-gray-600">{initialData.sector_name}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Candidats</h2>
          {initialData.applications.map((application, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              {application.candidat.image ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={application.candidat.image}
                    alt={`${application.candidat.first_name} ${application.candidat.last_name}`}
                    layout="fill"
                    objectFit="cover"
                    objectPosition="center"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <FiUser className="text-gray-400 h-6 w-6" />
                </div>
              )}
              <div>
                <p className="text-gray-600">{`${application.candidat.first_name} ${application.candidat.last_name}`}</p>
                <a
                  href={application.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Voir le lien
                </a>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Nombre des postulants</h2>
          <p className="text-gray-600">{initialData.candidats_count}</p>
        </div>
      </div>

      <div className="flex justify-end mt-6 space-x-4">
        {isPending && (
          <>
            <button className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600">
              Accepter
            </button>
            <button className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600">
              Refuser
            </button>
          </>
        )}

        {isAccepted && (
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500 h-6 w-6" />
            <span className="text-green-500">Accepté</span>
          </div>
        )}

        {isDeclined && (
          <div className="flex items-center space-x-2">
            <XCircle className="text-red-500 h-6 w-6" />
            <span className="text-red-500">Refusé</span>
          </div>
        )}
      </div>
    </div>
  );
};
