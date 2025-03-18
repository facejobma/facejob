"use client";

import React, { useEffect, useState } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import BioSection from "@/components/BioSection";
import ExperiencesSection from "@/components/ExperiencesSection";
import SkillsSection from "@/components/SkillsSection";
import ProjectsSection from "@/components/ProjectsSection";
import EducationSection from "@/components/EducationSection";
import { Circles } from "react-loader-spinner";

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Setting static user data for testing");

    const staticUserData = {
      id: "1",
      first_name: "John",
      last_name: "Doe",
      image: "https://via.placeholder.com/150",
      // coverImageUrl: "",
      location: "New York, USA",
      companyName: "Example Company",
      companyLogoUrl: "https://via.placeholder.com/150",
      bio: "This is a static bio for testing.",
      address: "123 Main St",
      zip_code: "10001",
      job: { name: "Software Engineer" },
      experiences: [
        { id: 1, title: "Experience 1", description: "Description 1" },
        { id: 2, title: "Experience 2", description: "Description 2" },
      ],
      skills: [
        { id: 1, name: "Skill 1" },
        { id: 2, name: "Skill 2" },
      ],
      projects: [
        { id: 1, name: "Project 1", description: "Description 1" },
        { id: 2, name: "Project 2", description: "Description 2" },
      ],
      education: [
        { id: 1, institution: "University 1", degree: "Degree 1" },
        { id: 2, institution: "University 2", degree: "Degree 2" },
      ],
    };

    setUserProfile(staticUserData);
    setLoading(false);
    console.log("Static user data set:", staticUserData);
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
          last_name={userProfile.last_name}
          headline={userProfile.job.name}
          image={userProfile.image}
          // coverImageUrl={userProfile.coverImageUrl}
          address={userProfile.location}
          companyName={userProfile.companyName}
          // companyLogoUrl={userProfile.companyLogoUrl}
          // bio={userProfile.bio}
          // experiences={userProfile.experiences}
          // skills={userProfile.skills}
          // projects={userProfile.projects}
          // educations={userProfile.education}
          tel={userProfile.tel}
          email={userProfile.email}
          zip_code={userProfile.zip_code}
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
