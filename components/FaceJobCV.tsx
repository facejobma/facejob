"use client";
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  pdf,
  Font,
} from "@react-pdf/renderer";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

// Register fonts for better ATS compatibility
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/helvetica/v1/regular.ttf" },
    { src: "https://fonts.gstatic.com/s/helvetica/v1/bold.ttf", fontWeight: "bold" },
  ],
});

// ATS-Optimized styles - Simple, clean, machine-readable
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.5,
    color: "#000000",
  },
  // Header with logo
  header: {
    marginBottom: 20,
    borderBottom: "2px solid #10B981",
    paddingBottom: 15,
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 40,
  },
  poweredBy: {
    fontSize: 8,
    color: "#666",
    textAlign: "right",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 5,
  },
  jobTitle: {
    fontSize: 14,
    color: "#10B981",
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    fontSize: 10,
    color: "#4B5563",
    marginTop: 5,
  },
  contactItem: {
    marginRight: 15,
    marginBottom: 3,
  },
  // Section styles - ATS friendly
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textTransform: "uppercase",
    borderBottom: "1px solid #E5E7EB",
    paddingBottom: 3,
  },
  // Content styles
  entryContainer: {
    marginBottom: 10,
  },
  entryTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 2,
  },
  entrySubtitle: {
    fontSize: 11,
    color: "#4B5563",
    marginBottom: 2,
  },
  entryDate: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 4,
  },
  entryDescription: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.4,
  },
  // Skills - ATS optimized list
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillItem: {
    fontSize: 10,
    color: "#374151",
    marginRight: 10,
    marginBottom: 4,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: "center",
    fontSize: 8,
    color: "#9CA3AF",
    borderTop: "1px solid #E5E7EB",
    paddingTop: 10,
  },
});

interface UserProfile {
  first_name: string;
  last_name: string;
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
    school_name: string;
    degree: string;
    graduation_date: string;
  }>;
}

// ATS-Optimized FaceJob CV Document
const FaceJobCVDocument: React.FC<{ userProfile: UserProfile }> = ({
  userProfile,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with FaceJob Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              src="/facejobLogo.png"
            />
            <Text style={styles.poweredBy}>Powered by FaceJob</Text>
          </View>
          
          <Text style={styles.name}>
            {userProfile.first_name} {userProfile.last_name}
          </Text>
          
          {userProfile.job && (
            <Text style={styles.jobTitle}>{userProfile.job.name}</Text>
          )}
          
          <View style={styles.contactInfo}>
            {userProfile.email && (
              <Text style={styles.contactItem}>✉ {userProfile.email}</Text>
            )}
            {userProfile.tel && (
              <Text style={styles.contactItem}>📞 {userProfile.tel}</Text>
            )}
            {userProfile.address && (
              <Text style={styles.contactItem}>📍 {userProfile.address}</Text>
            )}
          </View>
        </View>

        {/* Professional Summary */}
        {userProfile.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résumé Professionnel</Text>
            <Text style={styles.entryDescription}>{userProfile.bio}</Text>
          </View>
        )}

        {/* Work Experience */}
        {userProfile.experiences && userProfile.experiences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expérience Professionnelle</Text>
            {userProfile.experiences.map((exp, index) => (
              <View key={index} style={styles.entryContainer}>
                <Text style={styles.entryTitle}>{exp.poste}</Text>
                <Text style={styles.entrySubtitle}>{exp.organisme}</Text>
                <Text style={styles.entryDate}>
                  {exp.date_debut} - {exp.date_fin}
                </Text>
                {exp.description && (
                  <Text style={styles.entryDescription}>{exp.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {userProfile.educations && userProfile.educations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Formation</Text>
            {userProfile.educations.map((edu, index) => (
              <View key={index} style={styles.entryContainer}>
                <Text style={styles.entryTitle}>{edu.title}</Text>
                <Text style={styles.entrySubtitle}>
                  {edu.degree} - {edu.school_name}
                </Text>
                <Text style={styles.entryDate}>{edu.graduation_date}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills - ATS Optimized */}
        {userProfile.skills && userProfile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compétences</Text>
            <View style={styles.skillsContainer}>
              {userProfile.skills.map((skill, index) => (
                <Text key={index} style={styles.skillItem}>
                  • {skill.title}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Projects */}
        {userProfile.projects && userProfile.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projets</Text>
            {userProfile.projects.map((project, index) => (
              <View key={index} style={styles.entryContainer}>
                <Text style={styles.entryTitle}>{project.title}</Text>
                <Text style={styles.entryDescription}>{project.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            CV généré par FaceJob - Plateforme de recrutement par vidéo au Maroc
          </Text>
          <Text>www.facejob.ma</Text>
        </View>
      </Page>
    </Document>
  );
};

// Function to download FaceJob CV
export const downloadFaceJobCV = async (candidateId?: number) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const userData =
    typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
  const user = userData ? JSON.parse(userData) : null;
  
  // Use provided candidateId or current user's id
  const targetId = candidateId || user?.id;

  if (!targetId) {
    toast.error("Impossible de récupérer les informations du profil");
    return;
  }

  try {
    // Fetch profile data
    const profileResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate-profile/${targetId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    if (!profileResponse.ok) {
      throw new Error("Erreur lors de la récupération du profil");
    }

    const userProfile = await profileResponse.json();

    // Generate PDF
    const blob = await pdf(
      <FaceJobCVDocument userProfile={userProfile} />
    ).toBlob();

    // Download PDF
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `FaceJob_CV_${userProfile.first_name}_${userProfile.last_name}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("CV FaceJob téléchargé avec succès!");
  } catch (error) {
    console.error("Erreur lors de la génération du CV:", error);
    toast.error("Erreur lors du téléchargement du CV");
  }
};

export default FaceJobCVDocument;
