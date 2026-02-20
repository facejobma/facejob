"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileHeader from "@/components/ProfileHeader";
import BioSection from "@/components/BioSection";
import ExperiencesSection from "@/components/ExperiencesSection";
import SkillsSection from "@/components/SkillsSection";
import ProjectsSection from "@/components/ProjectsSection";
import EducationSection from "@/components/EducationSection";
import Cookies from "js-cookie";
import { LoadingSpinner } from "@/components/ui/spinner";
import { FaUser, FaBriefcase, FaGraduationCap, FaCog, FaDownload, FaFileAlt, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { HiOutlineUser, HiOutlineCollection, HiOutlineLightBulb } from "react-icons/hi";
import { downloadFaceJobCV } from "@/components/FaceJobCV";
import toast from "react-hot-toast";

const Profile: React.FC = () => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [downloadingCV, setDownloadingCV] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownloadCV = async () => {
    setDownloadingCV(true);
    try {
      await downloadFaceJobCV(userProfile?.id);
    } finally {
      setDownloadingCV(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "SUPPRIMER") {
      toast.error("Veuillez taper 'SUPPRIMER' pour confirmer");
      return;
    }

    setIsDeleting(true);
    const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate/delete/${userProfile.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast.success("Votre compte a été supprimé avec succès");
        // Clear session and cookies
        Cookies.remove("authToken");
        window.sessionStorage.removeItem("user");
        // Redirect to home page
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Erreur lors de la suppression du compte");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Erreur réseau lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

    const userData = typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user")
      : null;

    if (userData) {
      const user = JSON.parse(userData);
      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate-profile`;

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
          <LoadingSpinner message="Chargement du profil..." />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
            <p className="text-gray-600 mt-1">Gérez vos informations professionnelles</p>
          </div>
          <button
            onClick={handleDownloadCV}
            disabled={downloadingCV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadingCV ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Génération...</span>
              </>
            ) : (
              <>
                <FaDownload className="h-4 w-4" />
                <span>Télécharger CV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <FaUser className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completionPercentage}%</p>
              <p className="text-sm text-gray-600">Complété</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FaBriefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{userProfile?.experiences?.length || 0}</p>
              <p className="text-sm text-gray-600">Expériences</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <FaCog className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{userProfile?.skills?.length || 0}</p>
              <p className="text-sm text-gray-600">Compétences</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <HiOutlineCollection className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{userProfile?.projects?.length || 0}</p>
              <p className="text-sm text-gray-600">Projets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {completionPercentage < 100 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <HiOutlineLightBulb className="text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-amber-800 text-sm">Complétez votre profil</h3>
                <span className="text-sm font-bold text-amber-800">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-amber-200 rounded-full h-2 mb-2">
                <div
                  className="bg-amber-600 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-amber-700">
                Complétez toutes les sections pour augmenter vos chances
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Header Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <FaUser className="text-green-600 text-sm" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
          </div>
          {(userProfile?.first_name && userProfile?.last_name && userProfile?.tel && userProfile?.email) && (
            <span className="text-xs text-green-600 font-medium">✓ Complété</span>
          )}
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

      {/* Bio Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <FaFileAlt className="text-green-600 text-sm" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">À propos de moi</h2>
          </div>
          {(userProfile?.bio && userProfile.bio.trim().length > 0) && (
            <span className="text-xs text-green-600 font-medium">✓ Complété</span>
          )}
        </div>
        <BioSection id={userProfile.id} bio={userProfile.bio} />
      </div>

      {/* Experience Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <FaBriefcase className="text-blue-600 text-sm" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Expériences professionnelles</h2>
          </div>
          {(userProfile?.experiences && userProfile.experiences.length > 0) && (
            <span className="text-xs text-green-600 font-medium">
              {userProfile.experiences.length} expérience{userProfile.experiences.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <ExperiencesSection
          id={userProfile.id}
          experiences={userProfile.experiences}
        />
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <FaCog className="text-purple-600 text-sm" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Compétences</h2>
          </div>
          {(userProfile?.skills && userProfile.skills.length > 0) && (
            <span className="text-xs text-green-600 font-medium">
              {userProfile.skills.length} compétence{userProfile.skills.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <SkillsSection id={userProfile.id} skills={userProfile.skills} />
      </div>

      {/* Projects Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <HiOutlineCollection className="text-orange-600 text-sm" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Projets</h2>
          </div>
          {(userProfile?.projects && userProfile.projects.length > 0) && (
            <span className="text-xs text-green-600 font-medium">
              {userProfile.projects.length} projet{userProfile.projects.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <ProjectsSection id={userProfile.id} projects={userProfile.projects} />
      </div>

      {/* Education Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <FaGraduationCap className="text-indigo-600 text-sm" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Formation</h2>
          </div>
          {(userProfile?.education && userProfile.education.length > 0) && (
            <span className="text-xs text-green-600 font-medium">
              {userProfile.education.length} formation{userProfile.education.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <EducationSection
          id={userProfile.id}
          education={userProfile.education}
        />
      </div>

      {/* Delete Account Section */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <FaExclamationTriangle className="text-red-600 text-lg" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Zone dangereuse</h2>
            <p className="text-sm text-red-700 mb-4">
              La suppression de votre compte est irréversible. Toutes vos données, CV vidéos, candidatures et informations seront définitivement supprimées.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <FaTrash className="text-sm" />
              Supprimer mon compte
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirmer la suppression</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Cette action est <span className="font-bold text-red-600">irréversible</span>. Toutes vos données seront définitivement supprimées :
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
                <li>Profil et informations personnelles</li>
                <li>CV vidéos et candidatures</li>
                <li>Historique et statistiques</li>
                <li>Expériences, compétences et projets</li>
              </ul>
              <p className="text-sm text-gray-700 mb-4">
                Pour confirmer, tapez <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded">SUPPRIMER</span> ci-dessous :
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Tapez SUPPRIMER"
                className="w-full border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 rounded-lg px-4 py-2 outline-none transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "SUPPRIMER" || isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Suppression...
                  </>
                ) : (
                  <>
                    <FaTrash className="text-sm" />
                    Supprimer définitivement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
