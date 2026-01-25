"use client";

import React, { useEffect, useState } from "react";
import ProfileEntrepHeader from "@/components/ProfileEntrepriseHeader";
import BioEntrepSection from "@/components/BioEntrep";
import ContactSection from "@/components/contactSection";
import Cookies from "js-cookie";
import { Circles } from "react-loader-spinner";
import { HiOutlineOfficeBuilding, HiOutlineCollection } from "react-icons/hi";
import { FaBuilding, FaGlobe, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

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
      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/enterprise/${companyId}`;

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
            email: companyData.email,
            creationDate: companyData.created_at.split("T")[0],
            adresse: companyData.adresse,
            description: companyData.description || "",
            image: companyData.image || "https://via.placeholder.com/150",
            logo: companyData.logo || "https://via.placeholder.com/150",
          };
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
      <div className="flex flex-col items-center justify-center h-[calc(100vh-220px)] gap-6">
        <div className="relative">
          <Circles
            height={80}
            width={80}
            color="#4f46e5"
            ariaLabel="circles-loading"
            visible={true}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <HiOutlineOfficeBuilding className="text-2xl text-indigo-600 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">Chargement du profil entreprise</p>
          <p className="text-sm text-gray-500">Veuillez patienter quelques instants...</p>
        </div>
      </div>
    );
  }

  // Calculate profile completion stats
  const profileStats = {
    total: 6,
    completed: [
      companyProfile?.description,
      companyProfile?.site_web,
      companyProfile?.linkedin,
      companyProfile?.phone,
      companyProfile?.adresse,
      companyProfile?.logo && companyProfile?.logo !== "https://via.placeholder.com/150"
    ].filter(Boolean).length
  };

  const completionPercentage = Math.round((profileStats.completed / profileStats.total) * 100);

  return (
    <div className="space-y-8">
      {/* Header with enhanced design */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <HiOutlineOfficeBuilding className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Profil Entreprise</h1>
                <p className="text-indigo-100 mt-1">Gérez les informations de votre entreprise</p>
              </div>
            </div>
            
            {/* Profile Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <FaBuilding className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{completionPercentage}%</p>
                    <p className="text-xs text-indigo-100">Complété</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                    <FaGlobe className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{companyProfile?.sector_name ? 1 : 0}</p>
                    <p className="text-xs text-indigo-100">Secteur</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/30 flex items-center justify-center">
                    <FaCalendarAlt className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{new Date().getFullYear() - new Date(companyProfile?.creationDate).getFullYear()}</p>
                    <p className="text-xs text-indigo-100">Années</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                    <FaMapMarkerAlt className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{companyProfile?.adresse ? 1 : 0}</p>
                    <p className="text-xs text-indigo-100">Localisation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Company Header Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FaBuilding className="text-indigo-600 text-sm" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Informations de l'entreprise</h2>
            </div>
            <ProfileEntrepHeader
              id={companyProfile.id}
              company_name={companyProfile.company_name}
              companyLogoUrl={companyProfile.logo}
              sector_name={companyProfile.sector_name}
              website={companyProfile.site_web}
              creationDate={companyProfile.creationDate}
              siegeSocial={companyProfile.adresse}
              image={companyProfile.image}
            />
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-sm">📝</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">À propos de l'entreprise</h2>
            </div>
            <BioEntrepSection
              id={companyProfile.id}
              bio={companyProfile.description}
            />
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-sm">📞</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Informations de contact</h2>
            </div>
            <ContactSection
              id={companyProfile.id}
              email={companyProfile.email}
              phone={companyProfile.phone}
              linkedin={companyProfile.linkedin}
              adresse={companyProfile.adresse}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
