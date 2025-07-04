"use client";

import React, { useEffect, useState } from "react";
import ProfileEntrepHeader from "@/components/ProfileEntrepriseHeader";
import BioEntrepSection from "@/components/BioEntrep";
import ContactSection from "@/components/contactSection";
import Cookies from "js-cookie";
import { Circles } from "react-loader-spinner";

const CompanyProfile: React.FC = () => {
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
    const company =
      typeof window !== "undefined"
        ? window.sessionStorage?.getItem("user") || "{}"
        : "{}";
    const companyId = company ? JSON.parse(company).id : null;

    if (companyId) {
      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/enterprise/${companyId}`;

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
            id: companyData.id,
            company_name: companyData.company_name,
            sector_name: companyData.sector?.name,
            site_web: companyData.site_web,
            linkedin: companyData.linkedin,
            phone: companyData.phone,
            email: companyData.email, // Add email
            creationDate: companyData.created_at.split("T")[0], // Format to yyyy-MM-dd
            adresse: companyData.adresse,
            description: companyData.description || "",
            // coverImageUrl: companyData.coverImageUrl || "https://via.placeholder.com/150",
            image:
              companyData.image || "https://via.placeholder.com/150",
            logo: companyData.logo || "https://via.placeholder.com/150",
          };
          console.log("company data : ", profileData);
          setCompanyProfile(profileData);
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
          sector_name={companyProfile.sector_name}
          website={companyProfile.site_web}
          creationDate={companyProfile.creationDate}
          siegeSocial={companyProfile.adresse}
          // coverImageUrl={companyProfile.coverImageUrl}
          image={companyProfile.image}
        />

        <BioEntrepSection
          id={companyProfile.id}
          bio={companyProfile.description}
        />
        <ContactSection
          id={companyProfile.id}
          email={companyProfile.email}
          phone={companyProfile.phone}
          linkedin={companyProfile.linkedin}
          adresse={companyProfile.adresse}
        />
      </div>
    </div>
  );
};

export default CompanyProfile;
