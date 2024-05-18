"use client";

import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";


// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headline: {
    fontSize: 18,
    color: "#666",
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
    borderBottom: "2px solid #eaeaea",
    paddingBottom: 5,
  },
  text: {
    fontSize: 12,
    marginBottom: 3,
  },
  bold: {
    fontWeight: "bold",
  },
  columns: {
    flexDirection: "row",
  },
  column: {
    flex: 1,
    paddingHorizontal: 10,
  },
  columnLeft: {
    flex: 1,
    paddingRight: 10,
  },
  columnRight: {
    flex: 1,
    paddingLeft: 10,
  },
});

// Define the Resume component
const ResumePDF: React.FC<{ userProfile: any }> = ({ userProfile }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.name}>
          {userProfile.first_name} {userProfile.last_name}
        </Text>
        <Text style={styles.headline}>{userProfile.headline}</Text>
        <Text style={styles.location}>{userProfile.location}</Text>
      </View>

      {/* Bio Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <Text style={styles.text}>{userProfile.bio}</Text>
      </View>

      {/* Columns for Skills, Projects, Experiences, and Education */}
      <View style={styles.columns}>
        {/* Left Column: Skills and Projects */}
        <View style={styles.columnLeft}>
          {/* Skills Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {userProfile.skills.map((skill: any, index: number) => (
              <Text key={index} style={styles.text}>
                {skill.title}
              </Text>
            ))}
          </View>

          {/* Projects Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {userProfile.projects.map((project: any, index: number) => (
              <View key={index} style={styles.section}>
                <Text style={[styles.text, styles.bold]}>{project.title}</Text>
                <Text style={styles.text}>{project.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Right Column: Experiences and Education */}
        <View style={styles.columnRight}>
          {/* Experiences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experiences</Text>
            {userProfile.experiences.map((exp: any, index: number) => (
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
            {userProfile.educations.map((edu: any, index: number) => (
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

export default ResumePDF;
