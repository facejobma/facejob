"use client";
import React, { useEffect, useState } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  pdf,
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
    justifyContent: "space-between",
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
  contactInfo: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
    textAlign: "right",
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
  experienceContainer: {
    marginBottom: 20,
  },
  separatorLine: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  bullet: {
    fontSize: 14,
    marginRight: 5,
  },
});

interface UserProfile {
  first_name: string;
  last_name: string;
  image?: string;
  tel?: string;
  email?: string;
  address?: string;
  bio?: string;
  job?: { name: string };
  skills?: Array<{ title: string }>;
  projects?: Array<{ title: string; description: string }>;
  experiences?: Array<{
    poste: string;
    organisme: string;
    date_debut: string;
    date_fin: string;
    description: string;
  }>;
  educations?: Array<{
    title: string;
    institution: string;
    date_debut: string;
    date_fin: string;
  }>;
}

// Document PDF Component
const ResumePDFDocument: React.FC<{
  userProfile: UserProfile;
  cvConsumed: boolean;
  userRole: string | null;
}> = ({ userProfile, cvConsumed, userRole }) => {
  const abbreviatedLastName =
    userRole === "entreprise" && !cvConsumed
      ? `${userProfile.last_name?.charAt(0)}.`
      : userProfile.last_name;
       const abbreviatedName =
    userRole === "entreprise" && !cvConsumed
      ? `${userProfile.first_name?.charAt(0)}.`
      : userProfile.first_name;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          {userProfile.image && (
            <Image
              style={
                userRole === "entreprise" && !cvConsumed
                  ? styles.avatarBlur
                  : styles.avatar
              }
              src={userProfile.image}
            />
          )}
          <View>
            <Text style={styles.name}>
              {abbreviatedName} {abbreviatedLastName}
            </Text>
            <Text style={styles.headline}>
              {userProfile.job ? userProfile.job.name : " "}
            </Text>
          </View>

          {/* Contact Information */}
          {cvConsumed && (
            <View>
              <Text style={styles.contactInfo}>
                Téléphone: {userProfile.tel}
              </Text>
              <Text style={styles.contactInfo}>Email: {userProfile.email}</Text>
              <Text style={styles.contactInfo}>
                Addresse: {userProfile.address}
              </Text>
            </View>
          )}
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.text}>{userProfile.bio}</Text>
        </View>

        {/* Columns for Skills, Projects, Experiences, and Education */}
        <View style={styles.columns}>
          {/* Left Column: Skills and Projects */}
          <View style={styles.column}>
            {/* Skills Section */}
            {userProfile.skills && userProfile.skills.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Compétences</Text>
                {userProfile.skills.map((skill: any, index: number) => (
                  <View key={index} style={styles.experienceContainer}>
                    <View
                      style={{ flexDirection: "row", alignItems: "flex-start" }}
                    >
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.text}>{skill.title}</Text>
                    </View>
                    {(userProfile.skills?.length || 0) > 0 && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Compétences</Text>
    {(userProfile.skills || []).map((skill, index) => (
      <View key={index} style={styles.experienceContainer}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.text}>{skill.title}</Text>
        </View>
        {index < (userProfile.skills?.length || 0) - 1 && (
          <View style={styles.separatorLine} />
        )}
      </View>
    ))}
  </View>
)}


                  </View>
                ))}
              </View>
            )}

            {/* Projects Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Projets</Text>
              {userProfile.projects?.map((project: any, index: number) => (
                <View key={index} style={styles.experienceContainer}>
                  <View
                    style={{ flexDirection: "row", alignItems: "flex-start" }}
                  >
                    <Text style={styles.bullet}>•</Text>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={[styles.text, styles.bold]}>
                        {project.title}
                      </Text>
                      <Text style={styles.text}>{project.description}</Text>
                    </View>
                  </View>

                 {(userProfile.projects || []).map((project, index) => (
  <View key={index} style={styles.experienceContainer}>
    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
      <Text style={styles.bullet}>•</Text>
      <View style={{ marginLeft: 10 }}>
        <Text style={[styles.text, styles.bold]}>{project.title}</Text>
        <Text style={styles.text}>{project.description}</Text>
      </View>
    </View>
    {index < (userProfile.projects?.length || 0) - 1 && (
      <View style={styles.separatorLine} />
    )}
  </View>
))}

                </View>
              ))}
            </View>
          </View>

          {/* Right Column: Experiences and Education */}
          <View style={styles.column}>
            {/* Experiences Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Expériences</Text>
              {userProfile.experiences?.map((exp: any, index: number) => (
                <View key={index} style={styles.experienceContainer}>
                  <View
                    style={{ flexDirection: "row", alignItems: "flex-start" }}
                  >
                    <Text style={styles.bullet}>•</Text>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={[styles.text, styles.bold]}>
                        {exp.poste} at {exp.organisme}
                      </Text>
                      <Text
                        style={[styles.text, { color: "#888", fontSize: 12 }]}
                      >
                        {exp.date_debut} - {exp.date_fin}
                      </Text>
                      <Text style={styles.text}>{exp.description}</Text>
                    </View>
                  </View>
                  {(userProfile.experiences || []).map((exp, index) => (
  <View key={index} style={styles.experienceContainer}>
    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
      <Text style={styles.bullet}>•</Text>
      <View style={{ marginLeft: 10 }}>
        <Text style={[styles.text, styles.bold]}>
          {exp.poste} at {exp.organisme}
        </Text>
        <Text style={[styles.text, { color: "#888", fontSize: 12 }]}>
          {exp.date_debut} - {exp.date_fin}
        </Text>
        <Text style={styles.text}>{exp.description}</Text>
      </View>
    </View>
    {index < (userProfile.experiences?.length || 0) - 1 && (
      <View style={styles.separatorLine} />
    )}
  </View>
))}

                </View>
              ))}
            </View>

            {/* Education Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Formation</Text>
              {userProfile.educations?.map((edu: any, index: number) => (
                <View key={index} style={styles.experienceContainer}>
                  <View
                    style={{ flexDirection: "row", alignItems: "flex-start" }}
                  >
                    <Text style={styles.bullet}>•</Text>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={[styles.text, styles.bold]}>
                        {edu.title}
                      </Text>
                      <Text style={styles.text}>{edu.institution}</Text>
                      <Text
                        style={[styles.text, { color: "#888", fontSize: 12 }]}
                      >
                        {edu.date_debut} - {edu.date_fin}
                      </Text>
                    </View>
                  </View>
                  {(userProfile.educations || []).map((edu, index) => (
  <View key={index} style={styles.experienceContainer}>
    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
      <Text style={styles.bullet}>•</Text>
      <View style={{ marginLeft: 10 }}>
        <Text style={[styles.text, styles.bold]}>{edu.title}</Text>
        <Text style={styles.text}>{edu.institution}</Text>
        <Text style={[styles.text, { color: "#888", fontSize: 12 }]}>
          {edu.date_debut} - {edu.date_fin}
        </Text>
      </View>
    </View>
    {index < (userProfile.educations?.length || 0) - 1 && (
      <View style={styles.separatorLine} />
    )}
  </View>
))}

                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Fonction pour télécharger le PDF
export const downloadResumePDF = async (candidateId: number) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const company =
    typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
  const companyId = company ? JSON.parse(company).id : null;
  const userRole =
    typeof window !== "undefined" ? sessionStorage.getItem("userRole") : null;

  try {
    // Fetch profile data
    const profileResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidate-profile/${candidateId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const userProfile = await profileResponse.json();

    // Check consumption status
    const consumeResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/check-consumption-status`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidat_id: candidateId,
          entreprise_id: companyId,
        }),
      }
    );
    const consumeData = await consumeResponse.json();
    const cvConsumed = consumeData.consumed;

    // Generate PDF
    const blob = await pdf(
      <ResumePDFDocument
        userProfile={userProfile}
        cvConsumed={cvConsumed}
        userRole={userRole}
      />
    ).toBlob();

    // Download PDF
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CV_${userProfile.first_name}_${userProfile.last_name}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("PDF téléchargé avec succès!");
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    toast.error("Erreur lors du téléchargement du PDF");
  }
};

// Component for use with PDFDownloadLink (if still needed)
const ResumePDF: React.FC<{ candidateId: number }> = ({ candidateId }) => {
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cvConsumed, setCvConsumed] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
      const company =
        typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
      const companyId = company ? JSON.parse(company).id : null;

      try {
        const profileResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidate-profile/${candidateId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const profileData = await profileResponse.json();
        setUserProfile(profileData || {});

        const consumeResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/check-consumption-status`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              candidat_id: candidateId,
              entreprise_id: companyId,
            }),
          }
        );
        const consumeData = await consumeResponse.json();
        setCvConsumed(consumeData.consumed);
      } catch (error) {
        setError("Error fetching data");
        toast.error("Error fetching data");
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

  const userRole =
    typeof window !== "undefined" ? sessionStorage.getItem("userRole") : null;

  return (
    <ResumePDFDocument
      userProfile={userProfile}
      cvConsumed={cvConsumed}
      userRole={userRole}
    />
  );
};

export default ResumePDF;