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
  Svg,
  Circle,
  Path,
} from "@react-pdf/renderer";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

// Default avatar SVG as base64
const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNGE3YzJjIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzNSIgZmlsbD0iI2ZmZmZmZiIvPgo8cGF0aCBkPSJNNTAgMTYwQzUwIDEzMC4zIDcyLjM4NiAxMDYgMTAwIDEwNkMxMjcuNjE0IDEwNiAxNTAgMTMwLjMgMTUwIDE2MEgxNTBINTBaIiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPgo=";

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  // Sidebar (Left - 35%)
  sidebar: {
    width: "35%",
    backgroundColor: "#4a7c2c",
    padding: 20,
    color: "#ffffff",
  },
  // Main content (Right - 65%)
  mainContent: {
    width: "65%",
    padding: 25,
    backgroundColor: "#ffffff",
  },
  // Sidebar styles
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    border: "3px solid #ffffff",
  },
  avatarBlur: {
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0,
    display: "none",
  },
  sidebarName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 5,
  },
  sidebarJobTitle: {
    fontSize: 11,
    color: "#d4e7c5",
    textAlign: "center",
    marginBottom: 15,
  },
  sidebarSection: {
    marginBottom: 20,
  },
  sidebarSectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: "2px solid #6fa84a",
  },
  contactItem: {
    fontSize: 9,
    color: "#e8f5e0",
    marginBottom: 8,
    lineHeight: 1.4,
  },
  skillItem: {
    fontSize: 9,
    color: "#e8f5e0",
    marginBottom: 6,
    paddingLeft: 10,
  },
  skillBullet: {
    fontSize: 8,
    marginRight: 5,
    color: "#b8d9a0",
  },
  // Main content styles
  mainHeader: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottom: "3px solid #4a7c2c",
  },
  mainName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4a7c2c",
    marginBottom: 5,
  },
  mainJobTitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },
  bioText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#444",
    textAlign: "justify",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4a7c2c",
    marginBottom: 12,
    paddingBottom: 5,
    borderBottom: "2px solid #b8d9a0",
  },
  itemContainer: {
    marginBottom: 12,
    paddingLeft: 15,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4a7c2c",
    flex: 1,
  },
  itemDate: {
    fontSize: 8,
    color: "#888",
    backgroundColor: "#f5f5f5",
    padding: "3 6",
    borderRadius: 3,
  },
  itemSubtitle: {
    fontSize: 10,
    color: "#666",
    marginBottom: 4,
    fontStyle: "italic",
  },
  itemDescription: {
    fontSize: 9,
    color: "#555",
    lineHeight: 1.4,
    textAlign: "justify",
    marginTop: 4,
  },
  projectItem: {
    marginBottom: 12,
    borderLeft: "2px solid #b8d9a0",
    paddingLeft: 10,
  },
  projectTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4a7c2c",
    marginBottom: 3,
  },
  projectDescription: {
    fontSize: 9,
    color: "#555",
    lineHeight: 1.3,
  },
  // Decorative elements
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#4a7c2c",
    marginRight: 8,
    marginTop: 4,
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
  languages?: string[];
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
  const displayFirstName = (userRole === "entreprise" && !cvConsumed)
    ? (userProfile.first_name?.charAt(0) || 'C') + '.'
    : userProfile.first_name;
    
  const displayLastName = (userRole === "entreprise" && !cvConsumed)
    ? (userProfile.last_name?.charAt(0) || 'A') + '.'
    : userProfile.last_name;

  // Ensure image URL is complete
  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return null;
    
    // If it's a data URL (base64), return it directly
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    // If it's already a full URL, return it
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's a relative path, prepend the backend URL
    if (imageUrl.startsWith('/')) {
      return `${process.env.NEXT_PUBLIC_BACKEND_URL}${imageUrl}`;
    }
    
    // Otherwise, assume it's a path without leading slash
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${imageUrl}`;
  };

  const imageUrl = getImageUrl(userProfile.image);
  const shouldShowImage = imageUrl && (userRole !== "entreprise" || cvConsumed);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Left Sidebar - Dark Green */}
        <View style={styles.sidebar}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {shouldShowImage && (
              <Image
                style={styles.avatar}
                src={imageUrl || DEFAULT_AVATAR}
              />
            )}
            <Text style={styles.sidebarName}>
              {displayFirstName} {displayLastName}
            </Text>
            {userProfile.job && (
              <Text style={styles.sidebarJobTitle}>{userProfile.job.name}</Text>
            )}
          </View>

          {/* Contact Information */}
          {cvConsumed && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>CONTACT</Text>
              {userProfile.tel && (
                <Text style={styles.contactItem}>Tel: {userProfile.tel.replace(/[^\d+]/g, '')}</Text>
              )}
              {userProfile.email && (
                <Text style={styles.contactItem}>Email: {userProfile.email}</Text>
              )}
              {userProfile.address && (
                <Text style={styles.contactItem}>Adresse: {userProfile.address}</Text>
              )}
            </View>
          )}

          {/* Skills */}
          {userProfile.skills && userProfile.skills.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>COMPÉTENCES</Text>
              {userProfile.skills.map((skill: any, index: number) => (
                <View key={index} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 6 }}>
                  <Text style={styles.skillBullet}>▪</Text>
                  <Text style={styles.skillItem}>{skill.title}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Languages */}
          {userProfile.languages && userProfile.languages.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>LANGUES</Text>
              {userProfile.languages.map((lang: string, index: number) => (
                <View key={index} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 6 }}>
                  <Text style={styles.skillBullet}>▪</Text>
                  <Text style={styles.skillItem}>{lang}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Right Main Content - White */}
        <View style={styles.mainContent}>
          {/* Bio Section */}
          {userProfile.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PROFIL</Text>
              <Text style={styles.bioText}>{userProfile.bio}</Text>
            </View>
          )}

          {/* Experience Section */}
          {userProfile.experiences && userProfile.experiences.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>EXPÉRIENCE PROFESSIONNELLE</Text>
              {userProfile.experiences.map((exp: any, index: number) => (
                <View key={index} style={styles.itemContainer}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{exp.poste}</Text>
                    <Text style={styles.itemDate}>
                      {exp.date_debut} - {exp.date_fin}
                    </Text>
                  </View>
                  <Text style={styles.itemSubtitle}>{exp.organisme}</Text>
                  {exp.description && (
                    <Text style={styles.itemDescription}>{exp.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Education Section */}
          {userProfile.educations && userProfile.educations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>FORMATION</Text>
              {userProfile.educations.map((edu: any, index: number) => (
                <View key={index} style={styles.itemContainer}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{edu.title}</Text>
                    <Text style={styles.itemDate}>
                      {edu.date_debut} - {edu.date_fin}
                    </Text>
                  </View>
                  <Text style={styles.itemSubtitle}>{edu.institution}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Projects Section */}
          {userProfile.projects && userProfile.projects.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PROJETS</Text>
              {userProfile.projects.map((project: any, index: number) => (
                <View key={index} style={styles.projectItem}>
                  <Text style={styles.projectTitle}>{project.title}</Text>
                  {project.description && (
                    <Text style={styles.projectDescription}>{project.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

// Fonction pour télécharger le PDF depuis les CV débloqués (avec données complètes)
export const downloadConsumedResumePDF = async (candidateData: any) => {
  // Show loading toast
  const loadingToast = toast.loading("Préparation du CV en cours...");
  
  try {
    // Convert image to base64 using proxy for external images
    let imageBase64 = DEFAULT_AVATAR;
    if (candidateData.image) {
      try {
        toast.loading("Chargement de l'image...", { id: loadingToast });
        
        // Use proxy for external images (Google, LinkedIn, etc.)
        const isExternalImage = candidateData.image.startsWith('http://') || candidateData.image.startsWith('https://');
        
        if (isExternalImage) {
          // Use proxy for external images to avoid CORS with longer timeout
          const proxyUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/proxy-image?url=${encodeURIComponent(candidateData.image)}`;
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
          
          const imageResponse = await fetch(proxyUrl, { 
            signal: controller.signal,
            cache: 'no-cache'
          });
          clearTimeout(timeoutId);
          
          if (imageResponse.ok) {
            const imageBlob = await imageResponse.blob();
            imageBase64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = () => resolve(DEFAULT_AVATAR);
              reader.readAsDataURL(imageBlob);
            });
            toast.loading("Image chargée, génération du PDF...", { id: loadingToast });
          } else {
            toast.loading("Génération du PDF avec avatar par défaut...", { id: loadingToast });
          }
        } else {
          // For local images, fetch directly
          const imageUrl = candidateData.image.startsWith('/') 
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${candidateData.image}`
            : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${candidateData.image}`;
          
          const imageResponse = await fetch(imageUrl);
          if (imageResponse.ok) {
            const imageBlob = await imageResponse.blob();
            imageBase64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(imageBlob);
            });
            toast.loading("Image chargée, génération du PDF...", { id: loadingToast });
          }
        }
      } catch (imageError) {
        console.error("Error loading image, using default avatar:", imageError);
        toast.loading("Génération du PDF avec avatar par défaut...", { id: loadingToast });
      }
    }

    const userProfile = {
      first_name: candidateData.first_name,
      last_name: candidateData.last_name,
      email: candidateData.email,
      tel: candidateData.tel,
      address: candidateData.address,
      bio: candidateData.bio,
      image: imageBase64,
      job: candidateData.job,
      skills: candidateData.skills || [],
      languages: candidateData.languages || [],
      projects: candidateData.projects || [],
      experiences: candidateData.experiences || [],
      educations: candidateData.formations || [],
      years_of_experience: candidateData.years_of_experience,
    };

    toast.loading("Génération du PDF...", { id: loadingToast });

    const blob = await pdf(
      <ResumePDFDocument
        userProfile={userProfile}
        cvConsumed={true}
        userRole="entreprise"
      />
    ).toBlob();

    const fileName = `CV_${userProfile.first_name}_${userProfile.last_name}.pdf`;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("PDF téléchargé avec succès!", { id: loadingToast });
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    toast.error("Erreur lors du téléchargement du PDF", { id: loadingToast });
  }
};

// Fonction pour télécharger le PDF (ancienne version - pour compatibilité)
export const downloadResumePDF = async (candidateId: number) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const userRole =
    typeof window !== "undefined" ? sessionStorage.getItem("userRole") : null;

  // Show loading toast
  const loadingToast = toast.loading("Préparation du CV en cours...");

  try {
    // Fetch profile data (backend will automatically anonymize if needed)
    const profileResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate-profile/${candidateId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const userProfile = await profileResponse.json();

    // Backend returns is_anonymized flag
    const isAnonymized = userProfile.is_anonymized || false;

    // Convert image to base64 if it exists, otherwise use default
    let imageBase64 = DEFAULT_AVATAR;
    if (userProfile.image) {
      try {
        toast.loading("Chargement de l'image...", { id: loadingToast });
        
        // Check if it's an external image
        const isExternalImage = userProfile.image.startsWith('http://') || userProfile.image.startsWith('https://');
        
        if (isExternalImage) {
          // Use proxy for external images to avoid CORS with longer timeout
          const proxyUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/proxy-image?url=${encodeURIComponent(userProfile.image)}`;
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
          
          const imageResponse = await fetch(proxyUrl, { 
            signal: controller.signal,
            cache: 'no-cache'
          });
          clearTimeout(timeoutId);
          
          if (imageResponse.ok) {
            const imageBlob = await imageResponse.blob();
            imageBase64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = () => resolve(DEFAULT_AVATAR);
              reader.readAsDataURL(imageBlob);
            });
            toast.loading("Image chargée, génération du PDF...", { id: loadingToast });
          } else {
            toast.loading("Génération du PDF avec avatar par défaut...", { id: loadingToast });
          }
        } else {
          // For local images, fetch directly
          const imageResponse = await fetch(userProfile.image);
          if (imageResponse.ok) {
            const imageBlob = await imageResponse.blob();
            imageBase64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(imageBlob);
            });
            toast.loading("Image chargée, génération du PDF...", { id: loadingToast });
          }
        }
      } catch (imageError) {
        console.error("Error loading image, using default avatar:", imageError);
        toast.loading("Génération du PDF avec avatar par défaut...", { id: loadingToast });
      }
    }
    
    userProfile.image = imageBase64;

    toast.loading("Génération du PDF...", { id: loadingToast });

    // Generate PDF with appropriate name
    const blob = await pdf(
      <ResumePDFDocument
        userProfile={userProfile}
        cvConsumed={!isAnonymized}
        userRole={userRole}
      />
    ).toBlob();

    // For enterprises, always use initials in filename
    const fileName = userRole === "entreprise"
      ? `CV_${userProfile.first_name}_${userProfile.last_name}.pdf`
      : `CV_${userProfile.first_name}_${userProfile.last_name}.pdf`;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("PDF téléchargé avec succès!", { id: loadingToast });
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    toast.error("Erreur lors du téléchargement du PDF", { id: loadingToast });
  }
};

// Component for use with PDFDownloadLink (if still needed)
const ResumePDF: React.FC<{ candidateId: number }> = ({ candidateId }) => {
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

      try {
        const profileResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate-profile/${candidateId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const profileData = await profileResponse.json();
        setUserProfile(profileData || {});
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
  
  // Backend returns is_anonymized flag
  const isAnonymized = userProfile.is_anonymized || false;

  return (
    <ResumePDFDocument
      userProfile={userProfile}
      cvConsumed={!isAnonymized}
      userRole={userRole}
    />
  );
};

export default ResumePDF;