"use client";

import React, { useEffect, useState } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import BioSection from "@/components/BioSection";
import ExperiencesSection from "@/components/ExperiencesSection";
import SkillsSection from "@/components/SkillsSection";
import ProjectsSection from "@/components/ProjectsSection";
import EducationSection from "@/components/EducationSection";
import Cookies from "js-cookie";

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

    const userData = sessionStorage.getItem("user");
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
            name: `${user.first_name} ${user.last_name}`,
            headline: user.sector,
            avatarUrl: user.image || "https://via.placeholder.com/150",
            coverImageUrl: "https://via.placeholder.com/800x200",
            location: userData.location || "",
            companyName: userData.companyName || "",
            companyLogoUrl: "https://via.placeholder.com/150",
            bio: user.bio || "",
            experiences: userData.experiences || [],
            skills: userData.skills || [],
            projects: userData.projects || [],
            education: userData.educations || [],
          };

          setUserProfile(profileData);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, []);

  if (!userProfile) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ProfileHeader
        name={userProfile.name}
        headline={userProfile.headline}
        avatarUrl={userProfile.avatarUrl}
        coverImageUrl={userProfile.coverImageUrl}
        location={userProfile.location}
        companyName={userProfile.companyName}
        companyLogoUrl={userProfile.companyLogoUrl}
      />

      <BioSection bio={userProfile.bio} />

      <ExperiencesSection experiences={userProfile.experiences} />

      <SkillsSection skills={userProfile.skills} />

      <ProjectsSection projects={userProfile.projects} />

      <EducationSection education={userProfile.education} />
    </div>
  );
};

export default Profile;
