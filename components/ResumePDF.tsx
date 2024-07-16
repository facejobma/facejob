"use client";
import React, { useEffect, useState } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    marginRight: 20,
  },
  avatarBlur: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    marginRight: 20,
    opacity: 0,
    display: "none",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  headline: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
  },
  location: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: "#333",
    borderBottom: "2px solid #eaeaea",
    paddingBottom: 5,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    color: "#333",
  },
  bold: {
    fontWeight: "bold",
  },
  columns: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    width: "48%",
    paddingHorizontal: 5,
  },
});

// Define the Resume component
const ResumePDF: React.FC<{ candidateId: number }> = ({ candidateId }) => {
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidate-profile/${candidateId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        setError("Error fetching candidate profile");
        toast.error("Error fetching candidate profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [candidateId]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  if (!userProfile) {
    return <Text>No profile data available</Text>;
  }

  const userRole = sessionStorage.getItem("userRole");
  const abbreviatedLastName =
    userRole === "entreprise"
      ? `${userProfile.last_name?.charAt(0)}.`
      : userProfile.last_name;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          {userProfile.image && (
            <Image
              style={
                userRole === "entreprise" ? styles.avatarBlur : styles.avatar
              }
              src={userProfile.image}
            />
          )}
          <View>
            <Text style={styles.name}>
              {userProfile.first_name} {abbreviatedLastName}
            </Text>
            <Text style={styles.headline}>{userProfile.headline}</Text>
            <Text style={styles.location}>{userProfile.location}</Text>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.text}>{userProfile.bio}</Text>
        </View>

        {/* Columns for Skills, Projects, Experiences, and Education */}
        <View style={styles.columns}>
          {/* Left Column: Skills and Projects */}
          <View style={styles.column}>
            {/* Skills Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              {userProfile.skills?.map((skill: any, index: number) => (
                <Text key={index} style={styles.text}>
                  {skill.title}
                </Text>
              ))}
            </View>

            {/* Projects Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Projects</Text>
              {userProfile.projects?.map((project: any, index: number) => (
                <View key={index} style={styles.section}>
                  <Text style={[styles.text, styles.bold]}>
                    {project.title}
                  </Text>
                  <Text style={styles.text}>{project.description}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Right Column: Experiences and Education */}
          <View style={styles.column}>
            {/* Experiences Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experiences</Text>
              {userProfile.experiences?.map((exp: any, index: number) => (
                <View key={index} style={styles.section}>
                  <Text style={[styles.text, styles.bold]}>
                    {exp.poste} at {exp.organisme}
                  </Text>
                  <Text style={styles.text}>
                    {exp.date_debut} - {exp.date_fin}
                  </Text>
                  <Text style={styles.text}>{exp.description}</Text>
                </View>
              ))}
            </View>

            {/* Education Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              {userProfile.educations?.map((edu: any, index: number) => (
                <View key={index} style={styles.section}>
                  <Text style={[styles.text, styles.bold]}>
                    {edu.school_name}
                  </Text>
                  <Text style={styles.text}>
                    {edu.degree}, {edu.title}
                  </Text>
                  <Text style={styles.text}>{edu.graduation_date}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ResumePDF;
