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
    console.log("user data : ", userData);

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
            // headline: user.sector,
            avatarUrl:
              "https://media.licdn.com/dms/image/D4E03AQH8Ypj6IDAEdA/profile-displayphoto-shrink_800_800/0/1713374020480?e=2147483647&v=beta&t=0XQNiawmx_JwIMUDBaxrGjcThowNbarkOyNZ0MhDigg" ||
              "https://via.placeholder.com/150",
            // coverImageUrl: "https://via.placeholder.com/800x200",
            coverImageUrl: "",
            location: user.address || "",
            companyName: userData.companyName || "",
            companyLogoUrl: "https://via.placeholder.com/150",
            bio: user.bio || "",
            address: user.address || "",
            zip_code: user.zip_code || "",
            job: user.job || [],
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
    <div className=" mx-auto  bg-gray-100 px-4 py-8">
      <div className="max-w-4xl mx-auto ">
        <ProfileHeader
          id={userProfile.id}
          first_name={userProfile.first_name}
          last_name={userProfile.last_name}
          headline={userProfile.job.name}
          avatarUrl={userProfile.avatarUrl}
          coverImageUrl={userProfile.coverImageUrl}
          location={userProfile.location}
          companyName={userProfile.companyName}
          companyLogoUrl={userProfile.companyLogoUrl}
          bio={userProfile.bio}
          experiences={userProfile.experiences}
          skills={userProfile.skills}
          projects={userProfile.projects}
          educations={userProfile.education}
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
