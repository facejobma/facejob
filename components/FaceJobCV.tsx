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
} from "@react-pdf/renderer";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

const GREEN = "#16a34a";
const DARK = "#111827";
const MUTED = "#6b7280";
const LIGHT = "#f3f4f6";

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 30,
    paddingHorizontal: 30,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.35,
    color: DARK,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: GREEN,
    paddingBottom: 12,
    marginBottom: 14,
  },
  headerText: {
    flex: 1,
    paddingRight: 14,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    objectFit: "cover",
    borderWidth: 2,
    borderColor: GREEN,
  },
  brand: {
    fontSize: 9,
    color: GREEN,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  name: {
    fontSize: 21,
    fontWeight: "bold",
    color: DARK,
    marginBottom: 9,
  },
  jobTitle: {
    fontSize: 11,
    color: GREEN,
    fontWeight: "bold",
    marginBottom: 11,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  contactChip: {
    fontSize: 8,
    color: "#374151",
    backgroundColor: LIGHT,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 7,
    marginRight: 5,
    marginBottom: 5,
  },
  body: {
    flexDirection: "row",
  },
  sidebar: {
    width: "30%",
    paddingRight: 14,
  },
  main: {
    width: "70%",
    paddingLeft: 14,
    borderLeftWidth: 1,
    borderLeftColor: "#e5e7eb",
  },
  section: {
    marginBottom: 12,
  },
  sidebarSection: {
    marginBottom: 11,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: DARK,
    textTransform: "uppercase",
    marginBottom: 7,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  sidebarTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: GREEN,
    textTransform: "uppercase",
    marginBottom: 7,
  },
  paragraph: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.45,
    textAlign: "justify",
  },
  item: {
    marginBottom: 8,
    paddingBottom: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eef2f7",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  itemTitle: {
    width: "72%",
    fontSize: 10,
    fontWeight: "bold",
    color: DARK,
  },
  itemDate: {
    fontSize: 7.5,
    color: MUTED,
    textAlign: "right",
    width: "28%",
  },
  itemSubtitle: {
    fontSize: 9,
    color: GREEN,
    fontWeight: "bold",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 8.5,
    color: "#4b5563",
    lineHeight: 1.4,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    fontSize: 8.3,
    color: "#14532d",
    backgroundColor: "#dcfce7",
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginRight: 5,
    marginBottom: 5,
  },
  listItem: {
    fontSize: 8.2,
    color: "#374151",
    marginBottom: 4,
    lineHeight: 1.25,
  },
  emptyText: {
    fontSize: 8.5,
    color: MUTED,
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7.5,
    color: "#9ca3af",
  },
});

interface Skill {
  title?: string;
  name?: string;
}

interface Experience {
  poste?: string;
  organisme?: string;
  date_debut?: string;
  date_fin?: string | null;
  description?: string;
  location?: string;
}

interface Education {
  title?: string;
  titre?: string;
  school_name?: string;
  etablissement?: string;
  institution?: string;
  degree?: string;
  diplome?: string;
  graduation_date?: string;
  date_debut?: string;
  date_fin?: string;
  description?: string;
}

interface Project {
  title?: string;
  description?: string;
  link?: string;
}

interface UserProfile {
  first_name?: string;
  last_name?: string;
  image?: string;
  tel?: string;
  email?: string;
  address?: string;
  preferred_location?: string;
  bio?: string;
  job?: { name?: string };
  skills?: Skill[];
  languages?: string[];
  projects?: Project[];
  experiences?: Experience[];
  educations?: Education[];
  education?: Education[];
}

const clean = (value?: string | null) => (value || "").toString().trim();

const collapseRepeatedValue = (value?: string | null) => {
  const raw = clean(value).replace(/\s+/g, " ");
  if (!raw) return "";

  for (let size = 1; size <= Math.floor(raw.length / 2); size += 1) {
    if (raw.length % size !== 0) continue;
    const unit = raw.slice(0, size);
    if (unit.repeat(raw.length / size) === raw) return unit.trim();
  }

  const commaParts = raw.split(",").map((part) => part.trim()).filter(Boolean);
  const dedupedCommaParts = commaParts.filter(
    (part, index) => index === 0 || part !== commaParts[index - 1]
  );

  return dedupedCommaParts.join(", ");
};

const formatDate = (value?: string | null) => {
  const raw = clean(value);
  if (!raw) return "";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  return new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatPeriod = (start?: string, end?: string | null) => {
  const formattedStart = formatDate(start);
  const formattedEnd = formatDate(end);

  if (formattedStart && formattedEnd) return `${formattedStart} - ${formattedEnd}`;
  if (formattedStart) return `${formattedStart} - Present`;
  if (formattedEnd) return formattedEnd;
  return "";
};

const getSkillTitle = (skill: Skill) => clean(skill.title || skill.name);

const getEducations = (profile: UserProfile) => profile.educations || profile.education || [];

const resolveImageUrl = (image?: string) => {
  const raw = clean(image);
  if (!raw || raw.includes("via.placeholder.com")) return "";
  if (raw.startsWith("data:")) return raw;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/")) return `${process.env.NEXT_PUBLIC_BACKEND_URL}${raw}`;
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${raw}`;
};

const imageToDataUrl = async (image?: string) => {
  const imageUrl = resolveImageUrl(image);
  if (!imageUrl) return "";
  if (imageUrl.startsWith("data:")) return imageUrl;

  try {
    const isExternal = imageUrl.startsWith("http://") || imageUrl.startsWith("https://");
    const fetchUrl = isExternal && !imageUrl.startsWith(process.env.NEXT_PUBLIC_BACKEND_URL || "")
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/proxy-image?url=${encodeURIComponent(imageUrl)}`
      : imageUrl;

    const response = await fetch(fetchUrl, { cache: "no-cache" });
    if (!response.ok) return "";

    const blob = await response.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Impossible de charger l'image du profil pour le CV:", error);
    return "";
  }
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const SidebarSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <View style={styles.sidebarSection}>
    <Text style={styles.sidebarTitle}>{title}</Text>
    {children}
  </View>
);

const FaceJobCVDocument: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => {
  const fullName = `${clean(userProfile.first_name)} ${clean(userProfile.last_name)}`.trim() || "Candidat FaceJob";
  const jobTitle = clean(userProfile.job?.name);
  const skills = (userProfile.skills || []).map(getSkillTitle).filter(Boolean);
  const languages = (userProfile.languages || []).map(clean).filter(Boolean);
  const experiences = userProfile.experiences || [];
  const educations = getEducations(userProfile);
  const projects = userProfile.projects || [];
  const email = collapseRepeatedValue(userProfile.email);
  const tel = collapseRepeatedValue(userProfile.tel);
  const address = collapseRepeatedValue(userProfile.address);
  const preferredLocation = collapseRepeatedValue(userProfile.preferred_location);

  return (
    <Document title={`CV ${fullName}`} author="FaceJob">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.brand}>FaceJob CV</Text>
            <Text style={styles.name}>{fullName}</Text>
            {jobTitle && <Text style={styles.jobTitle}>{jobTitle}</Text>}

            <View style={styles.contactRow}>
              {email && <Text style={styles.contactChip}>Email: {email}</Text>}
              {tel && <Text style={styles.contactChip}>Tel: {tel}</Text>}
            </View>
          </View>
          {userProfile.image && <Image style={styles.avatar} src={userProfile.image} />}
        </View>

        <View style={styles.body}>
          <View style={styles.sidebar}>
            <SidebarSection title="Competences">
              {skills.length > 0 ? (
                <View style={styles.chips}>
                  {skills.map((skill, index) => (
                    <Text key={`${skill}-${index}`} style={styles.chip}>
                      {skill}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>Aucune competence renseignee</Text>
              )}
            </SidebarSection>

            <SidebarSection title="Langues">
              {languages.length > 0 ? (
                languages.map((language, index) => (
                  <Text key={`${language}-${index}`} style={styles.listItem}>
                    - {language}
                  </Text>
                ))
              ) : (
                <Text style={styles.emptyText}>Aucune langue renseignee</Text>
              )}
            </SidebarSection>

            {(email || tel || address || preferredLocation) && (
              <SidebarSection title="Contact">
                {email && <Text style={styles.listItem}>Email: {email}</Text>}
                {tel && <Text style={styles.listItem}>Tel: {tel}</Text>}
                {address && <Text style={styles.listItem}>Adresse: {address}</Text>}
                {preferredLocation && (
                  <Text style={styles.listItem}>Mobilite: {preferredLocation}</Text>
                )}
              </SidebarSection>
            )}
          </View>

          <View style={styles.main}>
            {userProfile.bio && (
              <Section title="Profil">
                <Text style={styles.paragraph}>{userProfile.bio}</Text>
              </Section>
            )}

            {experiences.length > 0 && (
              <Section title="Experience professionnelle">
                {experiences.map((exp, index) => {
                  const title = clean(exp.poste) || "Experience";
                  const subtitle = [clean(exp.organisme), clean(exp.location)].filter(Boolean).join(" - ");

                  return (
                    <View key={index} style={styles.item} wrap={false}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemTitle}>{title}</Text>
                        <Text style={styles.itemDate}>{formatPeriod(exp.date_debut, exp.date_fin)}</Text>
                      </View>
                      {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
                      {exp.description && <Text style={styles.itemDescription}>{exp.description}</Text>}
                    </View>
                  );
                })}
              </Section>
            )}

            {educations.length > 0 && (
              <Section title="Formation">
                {educations.map((edu, index) => {
                  const title = clean(edu.title || edu.titre) || clean(edu.degree || edu.diplome) || "Formation";
                  const school = clean(edu.school_name || edu.etablissement || edu.institution);
                  const degree = clean(edu.degree || edu.diplome);
                  const subtitle = [degree !== title ? degree : "", school].filter(Boolean).join(" - ");
                  const date = clean(edu.graduation_date) || formatPeriod(edu.date_debut, edu.date_fin);

                  return (
                    <View key={index} style={styles.item} wrap={false}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemTitle}>{title}</Text>
                        <Text style={styles.itemDate}>{date}</Text>
                      </View>
                      {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
                      {edu.description && <Text style={styles.itemDescription}>{edu.description}</Text>}
                    </View>
                  );
                })}
              </Section>
            )}

            {projects.length > 0 && (
              <Section title="Projets">
                {projects.map((project, index) => (
                  <View key={index} style={styles.item} wrap={false}>
                    <Text style={styles.itemTitle}>{clean(project.title) || "Projet"}</Text>
                    {project.description && (
                      <Text style={styles.itemDescription}>{project.description}</Text>
                    )}
                    {project.link && <Text style={styles.itemDescription}>{project.link}</Text>}
                  </View>
                ))}
              </Section>
            )}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>CV genere par FaceJob</Text>
          <Text style={styles.footerText}>www.facejob.ma</Text>
        </View>
      </Page>
    </Document>
  );
};

export const downloadFaceJobCV = async (candidateId?: number) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const userData =
    typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
  const user = userData ? JSON.parse(userData) : null;
  const targetId = candidateId || user?.id;

  if (!targetId) {
    toast.error("Impossible de récupérer les informations du profil");
    return;
  }

  try {
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
    const imageDataUrl = await imageToDataUrl(userProfile.image);
    const normalizedProfile = {
      ...userProfile,
      image: imageDataUrl,
      address: collapseRepeatedValue(userProfile.address),
      preferred_location: collapseRepeatedValue(userProfile.preferred_location),
      email: collapseRepeatedValue(userProfile.email),
      tel: collapseRepeatedValue(userProfile.tel),
    };

    const blob = await pdf(<FaceJobCVDocument userProfile={normalizedProfile} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const firstName = clean(userProfile.first_name).replace(/\s+/g, "_") || "candidat";
    const lastName = clean(userProfile.last_name).replace(/\s+/g, "_") || "facejob";

    link.href = url;
    link.download = `FaceJob_CV_${firstName}_${lastName}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("CV FaceJob téléchargé avec succès!");
  } catch (error) {
    console.error("Erreur lors de la génération du CV:", error);
    toast.error("Erreur lors du téléchargement du CV");
  }
};

export default FaceJobCVDocument;
