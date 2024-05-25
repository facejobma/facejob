"use client";

import React, { useEffect, useState } from "react";
import ProfileEntrepHeader from "@/components/ProfileEntrepriseHeader";
import BioEntrepSection from "@/components/BioEntrep";
import Cookies from "js-cookie";
import { Circles } from "react-loader-spinner";

const CompanyProfile: React.FC = () => {
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

    const companyData = sessionStorage.getItem("user");
    console.log("company data : ", companyData);


    if (companyData) {
      const company = JSON.parse(companyData);
      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/enterprise/${company.id}`;

      fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch company data");
          }
          return response.json();
        })
        .then((companyData) => {
          const profileData = {
            id: company.id,
            company_name: company.company_name,
            sector: company.sector_id,
            site_web: company.site_web,
            creationDate: company.created_at,
            adresse: company.adresse,
            description: companyData.description || "",
            coverImageUrl: companyData.coverImageUrl || "https://via.placeholder.com/150",
            avatarUrl: companyData.avatarUrl || "https://via.placeholder.com/150",
            logo: companyData.logo || "https://via.placeholder.com/150",
          };

          setCompanyProfile(profileData);
          console.log("company profile data : ", profileData);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching company data:", error);
          setLoading(false);
        });
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(120vh-220px)]">
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
        <ProfileEntrepHeader
          id={companyProfile.id}
          company_name={companyProfile.company_name}
          companyLogoUrl={companyProfile.logo}
          sector={companyProfile.sector}
          website={companyProfile.site_web}
          creationDate={companyProfile.creationDate}
          siegeSocial={companyProfile.adresse}
          coverImageUrl={companyProfile.coverImageUrl}
          avatarUrl={companyProfile.avatarUrl}
        />

        <BioEntrepSection id={companyProfile.id} bio={companyProfile.description} />
      </div>
    </div>
  );
};

export default CompanyProfile;
