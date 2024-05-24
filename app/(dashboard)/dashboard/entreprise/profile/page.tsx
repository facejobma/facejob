"use client";

import React, { useEffect, useState } from "react";
import ProfileEntrepHeader from "@/components/ProfileEntrepriseHeader";
import BioSection from "@/components/BioSection";
import { Circles } from "react-loader-spinner";

const CompanyProfile: React.FC = () => {
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocked company data
    const staticCompanyData = {
      id: 1,
      company_name: "Company Name",
      sector: "Sector",
      site_web: "www.company.com",
      creationDate: "2021-09-01",
      adresse: "Company Address",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet turpis in libero auctor lacinia. Nullam sit amet eros nec dui iaculis ultricies. Sed nec erat nec ante luctus ultricies. Nullam nec felis ac nunc volutpat tincidunt. Sed nec erat nec ante luctus ultricies. Nullam nec felis ac nunc volutpat tincidunt.",
      coverImageUrl: "https://via.placeholder.com/150",
      avatarUrl: "https://via.placeholder.com/150",
      logo: "https://via.placeholder.com/150",
    };

    setCompanyProfile(staticCompanyData);
    setLoading(false);
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
        id = {companyProfile.id}
        company_name={companyProfile.company_name}
        companyLogoUrl={companyProfile.logo}
        sector={companyProfile.sector}
        website={companyProfile.site_web}
        creationDate={companyProfile.creationDate}
        siegeSocial={companyProfile.adresse}
        coverImageUrl={companyProfile.coverImageUrl}
        avatarUrl={companyProfile.avatarUrl}
         
        />

        <BioSection id={companyProfile.id} bio={companyProfile.description} />


        
      </div>
    </div>
  );
};

export default CompanyProfile;
