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

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
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
            tel : user.tel,
            email: user.email,
            avatarUrl:
              user.avatarUrl || "https://via.placeholder.com/150",
            // coverImageUrl: "",
            companyName: userData.companyName || "",
            companyLogoUrl: "https://via.placeholder.com/150",
            bio: userData.bio || "",
            address: user.address || "",
            zip_code: user.zip_code || "",
            job: user.job || [],
            experiences: userData.experiences || [],
            skills: userData.skills || [],
            projects: userData.projects || [],
            education: userData.educations || [],
          };

          setUserProfile(profileData);
          setLoading(false);
          console.log("user data : ", profileData);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
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
        <ProfileHeader
          id={userProfile.id}
          first_name={userProfile.first_name}
          tel={userProfile.tel}
          email={userProfile.email}
          zip_code={userProfile.zip_code}
          last_name={userProfile.last_name}
          headline={userProfile.job.name}
          avatarUrl={userProfile.avatarUrl}
          // coverImageUrl={userProfile.coverImageUrl}
          address={userProfile.address}
          companyName={userProfile.companyName}
          // companyLogoUrl={userProfile.companyLogoUrl}
          // bio={userProfile.bio}
          // experiences={userProfile.experiences}
          // skills={userProfile.skills}
          // projects={userProfile.projects}
          // educations={userProfile.education}
        />

        <BioSection id={userProfile.id} bio={userProfile.bio} />

        <ExperiencesSection
          id={userProfile.id}
          experiences={userProfile.experiences}
        />

        <SkillsSection id={userProfile.id} skills={userProfile.skills} />

        <ProjectsSection id={userProfile.id} projects={userProfile.projects} />

        <EducationSection
          id={userProfile.id}
          education={userProfile.education}
        />
      </div>
    </div>
  );
};

export default Profile;