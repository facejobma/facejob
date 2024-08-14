import Image from "next/image";
import { CheckCircle, XCircle } from "lucide-react";
import { EnterpriseData } from "@/types";



export const EntrepriseProfile: React.FC<{ initialData: EnterpriseData }> = ({
  initialData,
}) => {
  const isPending = initialData.is_verified === "Pending";
  const isAccepted = initialData.is_verified === "Accepted";
  const isDeclined = initialData.is_verified === "Declined";

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg max-w-md mx-auto mt-8 p-6">
      <div className="flex items-center justify-center">
        <div className="w-20 h-20 relative rounded-full overflow-hidden">
          {initialData.entreprise_logo && <Image
            src={initialData.entreprise_logo}
            alt={`${initialData.company_name} Logo`}
            layout="fill"
            objectFit="cover"
          />}
        </div>
      </div>

      <p className="text-gray-600 text-center mt-4">
        {initialData.description}
      </p>

      <div className="mt-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
          <p className="text-gray-600">{initialData.email}</p>
          <p className="text-gray-600">{initialData.phone}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Pannel actuelle</h2>
          <p className="text-gray-600">{initialData.plan_name}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Website</h2>
          <p className="text-blue-500 hover:underline">
            {initialData.site_web}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Company Size</h2>
          <p className="text-gray-600">{initialData.effectif}</p>
        </div>
      </div>

      <div className="flex justify-end mt-6 space-x-4">
        {isPending && (
          <>
            <button className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600">
              Accept
            </button>
            <button className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600">
              Decline
            </button>
          </>
        )}

        {isAccepted && (
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500 h-6 w-6" />
            <span className="text-green-500">Accepted</span>
          </div>
        )}

        {isDeclined && (
          <div className="flex items-center space-x-2">
            <XCircle className="text-red-500 h-6 w-6" />
            <span className="text-red-500">Declined</span>
          </div>
        )}
      </div>
    </div>
  );
};
