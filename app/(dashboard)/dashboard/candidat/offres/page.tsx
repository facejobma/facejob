"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Circles } from "react-loader-spinner";
import OffreCard from "@/components/offreCard";

const OffresPage: React.FC = () => {
  const [offres, setOffres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

    const fetchOffres = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/offres`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch offers");
        }

        const data = await response.json();
        console.log("Offres data:", data);
        setOffres(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching offers:", error);
        setLoading(false);
      }
    };

    fetchOffres();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-220px)]">
        <Circles
          height="80"
          width="80"
          color="#4fa94d"
          ariaLabel="circles-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto bg-gray-100 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Offres</h1>
        {offres.map((offre) => (
          <OffreCard
            key={offre.id}
            titre={offre.titre}
            entreprise_name={offre.company_name}
            sector_name={offre.sector_name}
            location={offre.location}
            contract_type={offre.contract_type}
            date_debut={offre.date_debut}
            date_fin={offre.date_fin}
            description={offre.description}
          />
        ))}
      </div>
    </div>
  );
};

export default OffresPage;
