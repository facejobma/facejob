"use client";
import React, { useEffect, useState } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileSection from "@/components/ProfileSection";
import Cookies from "js-cookie";

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);

  const authToken = Cookies.get("authToken");
  const cleanAuthToken = authToken?.replace(/["']/g, "");
  console.log("authToken, ", cleanAuthToken);

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    // const userRole = sessionStorage.getItem("userRole");

    if (userData) {
      const user = JSON.parse(userData);

      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidate-profile/${user.id}`;

      fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${cleanAuthToken}`,
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
            coverImageUrl: "https://via.placeholder.com/800x200", // Add cover image URL if available
            location: "", // Add user location if available
            companyName: "", // Add user company name if available
            companyLogoUrl: "https://via.placeholder.com/150", // Add user company logo URL if available
            bio:
              user.bio ||
              "Passionate about web development and building scalable applications.", // Assuming 'bio' field holds the bio information
            experiences: [
              {
                company: "ABC Inc.",
                role: "Software Engineer",
                duration: "2018 - Present",
                location: "New York City",
                description:
                  "Led frontend development for customer-facing applications.",
                enterpriseLogoUrl: "https://via.placeholder.com/50",
              },
              {
                company: "XYZ Corp.",
                role: "Frontend Developer",
                duration: "2015 - 2018",
                location: "New York City",
                description:
                  "Designed and implemented user interfaces using React.",
                enterpriseLogoUrl: "https://via.placeholder.com/50",
              },
            ],
            skills: [
              "JavaScript",
              "React",
              "Node.js",
              "TypeScript",
              "HTML/CSS",
            ],
            projects: [
              {
                name: "Project A",
                description: "Built a responsive web app using React.",
              },
              {
                name: "Project B",
                description: "Developed REST APIs with Node.js and Express.",
              },
            ],
            education: [
              {
                schoolName: "Faculty of Science and Technology, Tangier",
                schoolLogoUrl: "https://via.placeholder.com/50", // Add school logo URL
                fieldOfStudy: "Software Engineering and Intelligent Systems",
                degree: "Engineer's degree",
                graduationDate: "Sep 2022",
              },
            ],
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

      <ProfileSection title="Bio">
        <p>{userProfile.bio}</p>
      </ProfileSection>

      {/* Experiences Section */}
      {userProfile.experiences && (
        <ProfileSection title="Experiences">
          <ul className="space-y-4">
            {userProfile.experiences.map((exp: any, index: number) => (
              <li key={index} className="flex items-start space-x-4">
                {exp.enterpriseLogoUrl && (
                  <img
                    src={exp.enterpriseLogoUrl}
                    alt={exp.company}
                    className="w-16 h-16 rounded-full border-2 border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">
                        <a href={exp.roleUrl} className="hover:underline">
                          {exp.role}
                        </a>
                      </h3>
                      <p className="text-gray-600">
                        <a href={exp.companyUrl} className="hover:underline">
                          {exp.company}
                        </a>{" "}
                        ({exp.duration})
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">{exp.location}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {exp.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </ProfileSection>
      )}

      {/* Skills Section */}
      {userProfile.skills && (
        <ProfileSection title="Skills">
          <ul className="flex flex-wrap">
            {userProfile.skills.map((skill: string, index: number) => (
              <li
                key={index}
                className="bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2"
              >
                {skill}
              </li>
            ))}
          </ul>
        </ProfileSection>
      )}

      {/* Projects Section */}
      {userProfile.projects && (
        <ProfileSection title="Projects">
          <ul>
            {userProfile.projects.map((project: any, index: number) => (
              <li key={index} className="mb-2">
                <strong>{project.name}</strong>: {project.description}
              </li>
            ))}
          </ul>
        </ProfileSection>
      )}

      {/* Education Section */}
      {userProfile.education && (
        <ProfileSection title="Education">
          <ul className="space-y-4">
            {userProfile.education.map((edu: any, index: number) => (
              <li key={index} className="flex items-start space-x-4">
                {edu.schoolLogoUrl && (
                  <img
                    src={edu.schoolLogoUrl}
                    alt={edu.schoolName}
                    className="w-16 h-16 rounded-full border-2 border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <div className="font-bold">{edu.schoolName}</div>
                  <div>
                    {edu.degree}, {edu.fieldOfStudy}
                  </div>
                  <div>{edu.graduationDate}</div>
                </div>
              </li>
            ))}
          </ul>
        </ProfileSection>
      )}
    </div>
  );
};

export default Profile;
