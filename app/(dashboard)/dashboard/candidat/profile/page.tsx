"use client";

import React, { useEffect, useState } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import BioSection from "@/components/BioSection";
import ExperiencesSection from "@/components/ExperiencesSection";
import SkillsSection from "@/components/SkillsSection";
import ProjectsSection from "@/components/ProjectsSection";
import EducationSection from "@/components/EducationSection";
import Cookies from "js-cookie";
import { Circles } from "react-loader-spinner";
import { FaUser, FaBriefcase, FaGraduationCap, FaCog, FaCheckCircle, FaExclamationTriangle, FaPlus } from "react-icons/fa";
import { HiOutlineUser, HiOutlineCollection, HiOutlineLightBulb } from "react-icons/hi";

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

    const userData = typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user")
      : null;

    if (userData) {
      const user = JSON.parse(userData);
      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidate-profile/${user.id}`;

      fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }
          return response.json();
        })
        .then((userData) => {
          const profileData = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            tel: user.tel,
            email: user.email,
            image: user.image || "https://via.placeholder.com/150",
            companyName: userData.companyName || "",
            bio: userData.bio || "",
            address: userData.address || "",
            zip_code: user.zip_code || "",
            job: userData.job || [],
            experiences: userData.experiences || [],
            skills: userData.skills || [],
            projects: userData.projects || [],
            education: userData.educations || [],
          };

          setUserProfile(profileData);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
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
            color="#10b981"
            ariaLabel="circles-loading"
            visible={true}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <HiOutlineUser className="text-2xl text-green-600 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">Chargement de votre profil</p>
          <p className="text-sm text-gray-500">Veuillez patienter quelques instants...</p>
        </div>
      </div>
    );
  }

  // Calculate profile completion stats with more detailed tracking
  const profileStats = {
    total: 7,
    completed: [
      userProfile?.bio && userProfile.bio.trim().length > 0,
      userProfile?.experiences?.length > 0,
      userProfile?.skills?.length > 0,
      userProfile?.projects?.length > 0,
      userProfile?.education?.length > 0,
      userProfile?.image && userProfile?.image !== "https://via.placeholder.com/150",
      userProfile?.first_name && userProfile?.last_name && userProfile?.tel && userProfile?.email
    ].filter(Boolean).length
  };

  const completionPercentage = Math.round((profileStats.completed / profileStats.total) * 100);

  // Helper function to check if a section is empty
  const isSectionEmpty = (section: string) => {
    switch (section) {
      case 'bio':
        return !userProfile?.bio || userProfile.bio.trim().length === 0;
      case 'experiences':
        return !userProfile?.experiences || userProfile.experiences.length === 0;
      case 'skills':
        return !userProfile?.skills || userProfile.skills.length === 0;
      case 'projects':
        return !userProfile?.projects || userProfile.projects.length === 0;
      case 'education':
        return !userProfile?.education || userProfile.education.length === 0;
      case 'image':
        return !userProfile?.image || userProfile?.image === "https://via.placeholder.com/150";
      default:
        return false;
    }
  };

  // Get completion status for sections
  const getSectionStatus = (section: string) => {
    return isSectionEmpty(section) ? 'incomplete' : 'complete';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="space-y-8 p-4">
        {/* Header with enhanced design */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <HiOutlineUser className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Mon Profil</h1>
                <p className="text-green-100 mt-1">Gérez et personnalisez vos informations professionnelles</p>
              </div>
            </div>
            
            {/* Profile Statistics with Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-green-100">Progression du profil</span>
                <span className="text-sm font-bold text-white">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-white rounded-full h-3 transition-all duration-500 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              {completionPercentage < 100 && (
                <p className="text-xs text-green-100 mt-2">
                  Complétez votre profil pour augmenter vos chances d'être remarqué
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <FaUser className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{completionPercentage}%</p>
                    <p className="text-xs text-green-100">Complété</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                    <FaBriefcase className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{userProfile?.experiences?.length || 0}</p>
                    <p className="text-xs text-green-100">Expériences</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-teal-500/30 flex items-center justify-center">
                    <FaGraduationCap className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{userProfile?.skills?.length || 0}</p>
                    <p className="text-xs text-green-100">Compétences</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/30 flex items-center justify-center">
                    <HiOutlineCollection className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{userProfile?.projects?.length || 0}</p>
                    <p className="text-xs text-green-100">Projets</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Tips */}
      {completionPercentage < 100 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <HiOutlineLightBulb className="text-amber-600 text-lg" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 mb-3">Complétez votre profil pour plus de visibilité</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {isSectionEmpty('bio') && (
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <FaExclamationTriangle className="text-amber-500" />
                    <span>Ajoutez une description personnelle</span>
                  </div>
                )}
                {isSectionEmpty('experiences') && (
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <FaExclamationTriangle className="text-amber-500" />
                    <span>Ajoutez vos expériences professionnelles</span>
                  </div>
                )}
                {isSectionEmpty('skills') && (
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <FaExclamationTriangle className="text-amber-500" />
                    <span>Listez vos compétences</span>
                  </div>
                )}
                {isSectionEmpty('projects') && (
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <FaExclamationTriangle className="text-amber-500" />
                    <span>Présentez vos projets</span>
                  </div>
                )}
                {isSectionEmpty('education') && (
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <FaExclamationTriangle className="text-amber-500" />
                    <span>Ajoutez votre formation</span>
                  </div>
                )}
                {isSectionEmpty('image') && (
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <FaExclamationTriangle className="text-amber-500" />
                    <span>Ajoutez une photo de profil</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-8">
        {/* Profile Header Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 relative">
          <div className="absolute top-4 right-4">
            {getSectionStatus('image') === 'complete' ? (
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <FaCheckCircle className="text-xs" />
                <span>Complété</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                <FaExclamationTriangle className="text-xs" />
                <span>À compléter</span>
              </div>
            )}
          </div>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                <FaUser className="text-green-600 text-sm" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Informations personnelles</h2>
            </div>
            <ProfileHeader
              id={userProfile.id}
              first_name={userProfile.first_name}
              tel={userProfile.tel}
              email={userProfile.email}
              zip_code={userProfile.zip_code}
              last_name={userProfile.last_name}
              headline={userProfile.job.name}
              image={userProfile.image}
              address={userProfile.address}
              companyName={userProfile.companyName}
            />
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 relative">
          <div className="absolute top-4 right-4">
            {getSectionStatus('bio') === 'complete' ? (
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <FaCheckCircle className="text-xs" />
                <span>Complété</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                <FaExclamationTriangle className="text-xs" />
                <span>À compléter</span>
              </div>
            )}
          </div>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-sm">📝</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">À propos de moi</h2>
            </div>
            {isSectionEmpty('bio') ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-xl">📝</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Parlez-nous de vous</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  Ajoutez une description personnelle pour vous présenter aux recruteurs et mettre en valeur votre personnalité.
                </p>
                <BioSection id={userProfile.id} bio={userProfile.bio} />
              </div>
            ) : (
              <BioSection id={userProfile.id} bio={userProfile.bio} />
            )}
          </div>
        </div>

        {/* Experience Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 relative">
          <div className="absolute top-4 right-4">
            {getSectionStatus('experiences') === 'complete' ? (
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <FaCheckCircle className="text-xs" />
                <span>{userProfile?.experiences?.length} expérience{userProfile?.experiences?.length > 1 ? 's' : ''}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                <FaExclamationTriangle className="text-xs" />
                <span>À compléter</span>
              </div>
            )}
          </div>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <FaBriefcase className="text-emerald-600 text-sm" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Expériences professionnelles</h2>
            </div>
            {isSectionEmpty('experiences') ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FaBriefcase className="text-gray-400 text-lg" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Ajoutez vos expériences</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  Présentez votre parcours professionnel pour montrer vos compétences et votre évolution de carrière.
                </p>
                <ExperiencesSection
                  id={userProfile.id}
                  experiences={userProfile.experiences}
                />
              </div>
            ) : (
              <ExperiencesSection
                id={userProfile.id}
                experiences={userProfile.experiences}
              />
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 relative">
          <div className="absolute top-4 right-4">
            {getSectionStatus('skills') === 'complete' ? (
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <FaCheckCircle className="text-xs" />
                <span>{userProfile?.skills?.length} compétence{userProfile?.skills?.length > 1 ? 's' : ''}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                <FaExclamationTriangle className="text-xs" />
                <span>À compléter</span>
              </div>
            )}
          </div>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center">
                <FaCog className="text-teal-600 text-sm" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Compétences</h2>
            </div>
            {isSectionEmpty('skills') ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FaCog className="text-gray-400 text-lg" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Listez vos compétences</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  Ajoutez vos compétences techniques et soft skills pour mettre en valeur votre expertise.
                </p>
                <SkillsSection id={userProfile.id} skills={userProfile.skills} />
              </div>
            ) : (
              <SkillsSection id={userProfile.id} skills={userProfile.skills} />
            )}
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 relative">
          <div className="absolute top-4 right-4">
            {getSectionStatus('projects') === 'complete' ? (
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <FaCheckCircle className="text-xs" />
                <span>{userProfile?.projects?.length} projet{userProfile?.projects?.length > 1 ? 's' : ''}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                <FaExclamationTriangle className="text-xs" />
                <span>À compléter</span>
              </div>
            )}
          </div>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                <HiOutlineCollection className="text-green-600 text-sm" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Projets</h2>
            </div>
            {isSectionEmpty('projects') ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <HiOutlineCollection className="text-gray-400 text-lg" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Présentez vos projets</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  Mettez en avant vos réalisations et projets personnels ou professionnels pour démontrer vos capacités.
                </p>
                <ProjectsSection id={userProfile.id} projects={userProfile.projects} />
              </div>
            ) : (
              <ProjectsSection id={userProfile.id} projects={userProfile.projects} />
            )}
          </div>
        </div>

        {/* Education Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 relative">
          <div className="absolute top-4 right-4">
            {getSectionStatus('education') === 'complete' ? (
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <FaCheckCircle className="text-xs" />
                <span>{userProfile?.education?.length} formation{userProfile?.education?.length > 1 ? 's' : ''}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                <FaExclamationTriangle className="text-xs" />
                <span>À compléter</span>
              </div>
            )}
          </div>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <FaGraduationCap className="text-emerald-600 text-sm" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Formation</h2>
            </div>
            {isSectionEmpty('education') ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FaGraduationCap className="text-gray-400 text-lg" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Ajoutez votre formation</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  Renseignez vos diplômes, certifications et formations pour compléter votre profil académique.
                </p>
                <EducationSection
                  id={userProfile.id}
                  education={userProfile.education}
                />
              </div>
            ) : (
              <EducationSection
                id={userProfile.id}
                education={userProfile.education}
              />
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Profile;