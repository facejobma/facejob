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
            email_verified_at: companyData.email_verified_at,
            is_verified: companyData.is_verified,
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
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">Chargement du profil entreprise</p>
          <p className="text-sm text-gray-500">Veuillez patienter...</p>
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
      {/* Verification Status Banner */}
      {companyProfile && (
        <div className="space-y-4">
          {/* Email Verification Status */}
          {!companyProfile.email_verified_at && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-yellow-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Email non vérifié.</span> Veuillez vérifier votre email pour activer toutes les fonctionnalités.
                </p>
              </div>
            </div>
          )}
          
          {/* Company Verification Status */}
          {companyProfile.email_verified_at && !companyProfile.is_verified && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-blue-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Compte en attente de vérification.</span> Notre équipe examine votre profil entreprise.
                </p>
              </div>
            </div>
          )}
          
          {/* Verified Status */}
          {companyProfile.email_verified_at && companyProfile.is_verified && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-green-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-800">
                  <span className="font-medium">Compte vérifié.</span> Votre entreprise est vérifiée et vous avez accès à toutes les fonctionnalités.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Header with simple design */}
      <div className="bg-green-50 rounded-lg border-2 border-green-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
            <HiOutlineOfficeBuilding className="text-green-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profil Entreprise</h1>
            <p className="text-gray-600">Gérez les informations de votre entreprise</p>
          </div>
        </div>
        
        {/* Profile Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FaBuilding className="text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{completionPercentage}%</p>
                <p className="text-xs text-gray-600">Complété</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FaGlobe className="text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{companyProfile?.sector_name ? 1 : 0}</p>
                <p className="text-xs text-gray-600">Secteur</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FaCalendarAlt className="text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{new Date().getFullYear() - new Date(companyProfile?.creationDate).getFullYear()}</p>
                <p className="text-xs text-gray-600">Années</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FaMapMarkerAlt className="text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{companyProfile?.adresse ? 1 : 0}</p>
                <p className="text-xs text-gray-600">Localisation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Company Information - Combined Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                <FaBuilding className="text-green-600 text-sm" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Informations de l'entreprise</h2>
            </div>
            
            {/* Company Header */}
            <div className="mb-6">
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
            
            {/* Divider */}
            <div className="my-6 border-t border-gray-200"></div>
            
            {/* Two Column Layout for Description and Contact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Description Section */}
              <div>
                <BioEntrepSection
                  id={companyProfile.id}
                  bio={companyProfile.description}
                />
              </div>
              
              {/* Contact Section */}
              <div>
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
      </div>
    </div>
  );
};

export default CompanyProfile;
