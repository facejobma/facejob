"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X, Briefcase, Clock, GraduationCap, Lightbulb, FolderOpen, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

interface Experience {
  organisme: string;
  poste: string;
  date_debut: Date | null;
  date_fin: Date | null;
  description: string;
  location: string;
}

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  candidatId: number;
  onProfileCompleted?: () => void;
}

export default function ProfileCompletionModal({
  isOpen,
  onClose,
  onSkip,
  candidatId,
  onProfileCompleted,
}: ProfileCompletionModalProps) {
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      organisme: "",
      poste: "",
      date_debut: null,
      date_fin: null,
      description: "",
      location: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingSections, setMissingSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState<string>("");

  // Additional form states for other sections
  const [bioData, setBioData] = useState("");
  const [skillsData, setSkillsData] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    link: "",
  });
  const [educationData, setEducationData] = useState({
    titre: "",
    diplome: "",
    etablissement: "",
    date_debut: null as Date | null,
    date_fin: null as Date | null,
    description: "",
  });
  const [degrees, setDegrees] = useState<Array<{ id: string; name: string; level: string }>>([]);
  const [degreeSearchTerm, setDegreeSearchTerm] = useState("");
  const [isDegreeDropdownOpen, setIsDegreeDropdownOpen] = useState(false);

  // Fetch profile data to detect missing sections
  useEffect(() => {
    if (!isOpen) return;

    const fetchProfileData = async () => {
      setLoading(true);
      const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate-profile`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const profileData = await response.json();
          
          const missing: string[] = [];

          if (!profileData.bio || profileData.bio.trim().length === 0) {
            missing.push("bio");
          }

          if (!profileData.experiences || profileData.experiences.length === 0) {
            missing.push("experiences");
          }

          if (!profileData.skills || profileData.skills.length === 0) {
            missing.push("skills");
          }

          if (!profileData.projects || profileData.projects.length === 0) {
            missing.push("projects");
          }

          if (!profileData.educations || profileData.educations.length === 0) {
            missing.push("education");
          }

          setMissingSections(missing);
          
          // Set current section to first missing section
          if (missing.length > 0) {
            setCurrentSection(missing[0]);
          } else {
            // No missing sections, close the modal
            onClose();
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [isOpen]);

  // Fetch degrees list
  useEffect(() => {
    const fetchDegrees = async () => {
      const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/diplomes`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setDegrees(data);
        }
      } catch (error) {
        console.error("Error fetching degrees:", error);
      }
    };

    if (isOpen) {
      fetchDegrees();
    }
  }, [isOpen]);

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        organisme: "",
        poste: "",
        date_debut: null,
        date_fin: null,
        description: "",
        location: "",
      },
    ]);
  };

  const removeExperience = (index: number) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter((_, i) => i !== index));
    }
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const handleSubmit = async () => {
    // Handle submission based on current section
    if (currentSection === "bio") {
      return handleSubmitBio();
    } else if (currentSection === "skills") {
      return handleSubmitSkills();
    } else if (currentSection === "projects") {
      return handleSubmitProject();
    } else if (currentSection === "education") {
      return handleSubmitEducation();
    } else {
      return handleSubmitExperiences();
    }
  };

  const handleSubmitBio = async () => {
    if (!bioData.trim()) {
      toast.error("Veuillez remplir la description");
      return;
    }

    setIsSubmitting(true);
    const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate/updateId/${candidatId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bio: bioData }),
        }
      );

      if (response.ok) {
        toast.success("Bio ajoutée avec succès!");
        moveToNextSection();
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Error saving bio:", error);
      toast.error("Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitSkills = async () => {
    if (skillsData.length === 0) {
      toast.error("Veuillez ajouter au moins une compétence");
      return;
    }

    setIsSubmitting(true);
    const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

    try {
      // Convert skills array to the format expected by the API
      const skillsFormatted = skillsData.map((skill) => ({ title: skill }));
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidat/${candidatId}/skills`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ skills: skillsFormatted }),
        }
      );

      if (response.ok) {
        toast.success("Compétences ajoutées avec succès!");
        moveToNextSection();
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Error saving skills:", error);
      toast.error("Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitProject = async () => {
    if (!projectData.title.trim() || !projectData.description.trim()) {
      toast.error("Veuillez remplir le titre et la description");
      return;
    }

    setIsSubmitting(true);
    const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidat/${candidatId}/projects`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidat_id: candidatId,
            ...projectData,
          }),
        }
      );

      if (response.ok) {
        toast.success("Projet ajouté avec succès!");
        moveToNextSection();
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEducation = async () => {
    if (!educationData.titre.trim()) {
      toast.error("Veuillez remplir le titre de la formation");
      return;
    }
    
    if (!educationData.diplome || !educationData.etablissement.trim()) {
      toast.error("Veuillez remplir le diplôme et l'établissement");
      return;
    }

    if (!educationData.date_fin) {
      toast.error("Veuillez sélectionner la date d'obtention");
      return;
    }

    setIsSubmitting(true);
    const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

    try {
      console.log("Sending education data:", {
        title: educationData.titre,
        school_name: educationData.etablissement,
        degree: educationData.diplome,
        graduation_date: format(educationData.date_fin, "yyyy-MM-dd"),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidat/${candidatId}/education`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: educationData.titre,
            school_name: educationData.etablissement,
            degree: educationData.diplome, // This is the degree ID
            graduation_date: format(educationData.date_fin, "yyyy-MM-dd"),
          }),
        }
      );

      if (response.ok) {
        toast.success("Formation ajoutée avec succès!");
        moveToNextSection();
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        toast.error(errorData.message || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Error saving education:", error);
      toast.error("Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitExperiences = async () => {
    // Validate that at least one experience has required fields
    const validExperiences = experiences.filter(
      (exp) => exp.organisme.trim() && exp.poste.trim()
    );

    if (validExperiences.length === 0) {
      toast.error("Veuillez remplir au moins une expérience avec l'entreprise et le poste");
      return;
    }

    setIsSubmitting(true);
    const authToken = Cookies.get("authToken");

    try {
      // Submit each valid experience
      const promises = validExperiences.map((experience) =>
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/experiences`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            candidat_id: candidatId,
            organisme: experience.organisme,
            poste: experience.poste,
            date_debut: experience.date_debut
              ? format(experience.date_debut, "yyyy-MM-dd")
              : null,
            date_fin: experience.date_fin
              ? format(experience.date_fin, "yyyy-MM-dd")
              : null,
            description: experience.description,
            location: experience.location,
          }),
        })
      );

      await Promise.all(promises);
      toast.success("Expériences ajoutées avec succès!");
      moveToNextSection();
    } catch (error) {
      console.error("Error saving experiences:", error);
      toast.error("Erreur lors de l'enregistrement des expériences");
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveToNextSection = () => {
    const currentIndex = missingSections.indexOf(currentSection);
    if (currentIndex < missingSections.length - 1) {
      setCurrentSection(missingSections[currentIndex + 1]);
      // Reset forms
      setBioData("");
      setSkillsData([]);
      setNewSkill("");
      setProjectData({ title: "", description: "", link: "" });
      setEducationData({
        titre: "",
        diplome: "",
        etablissement: "",
        date_debut: null,
        date_fin: null,
        description: "",
      });
      setExperiences([
        {
          organisme: "",
          poste: "",
          date_debut: null,
          date_fin: null,
          description: "",
          location: "",
        },
      ]);
    } else {
      toast.success("Profil complété!");
      // Notify parent that profile is completed
      if (onProfileCompleted) {
        onProfileCompleted();
      }
      onClose();
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skillsData.includes(newSkill.trim())) {
      setSkillsData([...skillsData, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillsData(skillsData.filter((s) => s !== skill));
  };

  const getSectionTitle = () => {
    switch (currentSection) {
      case "bio":
        return "À propos de moi";
      case "skills":
        return "Compétences";
      case "projects":
        return "Projets";
      case "education":
        return "Formation";
      default:
        return "Expériences professionnelles";
    }
  };

  const getSectionIcon = () => {
    switch (currentSection) {
      case "bio":
        return <FileText className="h-6 w-6 text-blue-600" />;
      case "skills":
        return <Lightbulb className="h-6 w-6 text-blue-600" />;
      case "projects":
        return <FolderOpen className="h-6 w-6 text-blue-600" />;
      case "education":
        return <GraduationCap className="h-6 w-6 text-blue-600" />;
      default:
        return <Briefcase className="h-6 w-6 text-blue-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" aria-describedby="experience-modal-description">
        {loading ? (
          // Loading state
          <>
            <DialogHeader className="relative pb-4 border-b-2 border-gray-200">
              <DialogTitle className="flex items-center gap-3 text-2xl pr-8">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-3">
                  <AlertCircle className="h-6 w-6 text-blue-600 animate-pulse" />
                </div>
                <div className="text-gray-900">Analyse de votre profil</div>
              </DialogTitle>
              <p id="experience-modal-description" className="text-gray-600 mt-3 text-base">
                Veuillez patienter pendant que nous analysons votre profil...
              </p>
            </DialogHeader>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Analyse en cours...</span>
            </div>
          </>
        ) : (
          // Content after loading
          <>
            <DialogHeader className="relative pb-4 border-b-2 border-gray-200">
              <DialogTitle className="flex items-center gap-3 text-2xl pr-8">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-3">
                  {getSectionIcon()}
                </div>
                <div>
                  <div className="text-gray-900">{getSectionTitle()}</div>
                  {missingSections.length > 1 && (
                    <div className="text-sm font-normal text-amber-600 mt-1">
                      Section {missingSections.indexOf(currentSection) + 1} sur {missingSections.length}
                    </div>
                  )}
                </div>
              </DialogTitle>
              <p id="experience-modal-description" className="text-gray-600 mt-3 text-base">
                {currentSection === "experiences" 
                  ? "Complétez votre profil en ajoutant vos expériences professionnelles."
                  : `Complétez votre profil en ajoutant: ${getSectionTitle()}`}
              </p>
            </DialogHeader>

        {/* Show missing sections alert if any */}
        {!loading && missingSections.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 rounded-xl p-3 flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-amber-900 text-base mb-3">
                  Sections de profil à compléter
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {missingSections.includes("bio") && (
                    <div className="flex items-center gap-2 text-sm text-amber-800 bg-white rounded-lg p-2 border border-amber-200">
                      <FileText className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <span className="font-medium">À propos de moi</span>
                    </div>
                  )}
                  {missingSections.includes("experiences") && (
                    <div className="flex items-center gap-2 text-sm text-amber-800 bg-white rounded-lg p-2 border border-amber-200">
                      <Briefcase className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <span className="font-medium">Expériences</span>
                    </div>
                  )}
                  {missingSections.includes("skills") && (
                    <div className="flex items-center gap-2 text-sm text-amber-800 bg-white rounded-lg p-2 border border-amber-200">
                      <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <span className="font-medium">Compétences</span>
                    </div>
                  )}
                  {missingSections.includes("projects") && (
                    <div className="flex items-center gap-2 text-sm text-amber-800 bg-white rounded-lg p-2 border border-amber-200">
                      <FolderOpen className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <span className="font-medium">Projets</span>
                    </div>
                  )}
                  {missingSections.includes("education") && (
                    <div className="flex items-center gap-2 text-sm text-amber-800 bg-white rounded-lg p-2 border border-amber-200">
                      <GraduationCap className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <span className="font-medium">Formation</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-amber-800 mt-4 flex items-center gap-2 bg-white rounded-lg p-2 border border-amber-200">
                  <span className="text-lg">💡</span>
                  <span>Complétez ces sections pour améliorer vos chances auprès des recruteurs.</span>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6 mt-6">
          {currentSection === "bio" ? (
            // Bio Form
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
              <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="bio"
                value={bioData}
                onChange={(e) => setBioData(e.target.value)}
                placeholder="Parlez de vous, votre parcours, vos objectifs professionnels..."
                rows={6}
                className="mt-2 border-gray-300 focus:border-green-500 focus:ring-green-200"
              />
              <p className="text-xs text-gray-500 mt-1">
                {bioData.length} caractères
              </p>
            </div>
          ) : currentSection === "skills" ? (
            // Skills Form
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200 space-y-4">
              <div>
                <Label htmlFor="newSkill" className="text-sm font-semibold text-gray-700">
                  Ajouter une compétence <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="newSkill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                    placeholder="Ex: JavaScript, React, Node.js..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddSkill}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
              {skillsData.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skillsData.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-lg text-sm"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-green-600 hover:text-green-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : currentSection === "projects" ? (
            // Projects Form
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200 space-y-4">
              <div>
                <Label htmlFor="projectTitle" className="text-sm font-semibold text-gray-700">
                  Titre du projet <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="projectTitle"
                  value={projectData.title}
                  onChange={(e) =>
                    setProjectData({ ...projectData, title: e.target.value })
                  }
                  placeholder="Ex: Application de gestion de tâches"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="projectDescription" className="text-sm font-semibold text-gray-700">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="projectDescription"
                  value={projectData.description}
                  onChange={(e) =>
                    setProjectData({ ...projectData, description: e.target.value })
                  }
                  placeholder="Décrivez votre projet, les technologies utilisées..."
                  rows={4}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="projectLink" className="text-sm font-semibold text-gray-700">
                  Lien (optionnel)
                </Label>
                <Input
                  id="projectLink"
                  value={projectData.link}
                  onChange={(e) =>
                    setProjectData({ ...projectData, link: e.target.value })
                  }
                  placeholder="https://github.com/..."
                  className="mt-2"
                />
              </div>
            </div>
          ) : currentSection === "education" ? (
            // Education Form
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200 space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="titre" className="text-sm font-semibold text-gray-700">
                  Titre de la Formation <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="titre"
                  value={educationData.titre}
                  onChange={(e) =>
                    setEducationData({ ...educationData, titre: e.target.value })
                  }
                  placeholder="Ex: Ingénieur en Informatique, Master en Marketing..."
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Le titre ou spécialité de votre formation
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="diplome" className="text-sm font-semibold text-gray-700">
                    Niveau de Diplôme <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="diplome"
                      value={degreeSearchTerm}
                      onChange={(e) => {
                        setDegreeSearchTerm(e.target.value);
                        setIsDegreeDropdownOpen(true);
                        // Clear the actual degree value if user is typing
                        if (e.target.value !== educationData.diplome) {
                          setEducationData({ ...educationData, diplome: "" });
                        }
                      }}
                      onFocus={() => setIsDegreeDropdownOpen(true)}
                      placeholder="Rechercher un diplôme..."
                      className="w-full pr-10"
                      autoComplete="off"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    
                    {/* Dropdown */}
                    {isDegreeDropdownOpen && degrees.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border-2 border-green-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {degrees
                          .filter((degree) =>
                            degree.name.toLowerCase().includes(degreeSearchTerm.toLowerCase()) ||
                            (degree.level && degree.level.toLowerCase().includes(degreeSearchTerm.toLowerCase()))
                          )
                          .map((degree) => (
                            <button
                              key={degree.id}
                              type="button"
                              onClick={() => {
                                setEducationData({ ...educationData, diplome: degree.name });
                                setDegreeSearchTerm(degree.name);
                                setIsDegreeDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{degree.name}</div>
                              {degree.level && (
                                <div className="text-xs text-gray-600 mt-0.5">({degree.level})</div>
                              )}
                            </button>
                          ))}
                      </div>
                    )}
                    
                    {/* No results message */}
                    {isDegreeDropdownOpen && degreeSearchTerm && degrees.filter((degree) =>
                      degree.name.toLowerCase().includes(degreeSearchTerm.toLowerCase()) ||
                      (degree.level && degree.level.toLowerCase().includes(degreeSearchTerm.toLowerCase()))
                    ).length === 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border-2 border-green-200 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
                        Aucun diplôme trouvé pour "{degreeSearchTerm}"
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tapez pour rechercher
                  </p>
                </div>
                <div>
                  <Label htmlFor="etablissement" className="text-sm font-semibold text-gray-700">
                    Établissement <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="etablissement"
                    value={educationData.etablissement}
                    onChange={(e) =>
                      setEducationData({ ...educationData, etablissement: e.target.value })
                    }
                    placeholder="Ex: Université Mohammed V"
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Date de début</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-1"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {educationData.date_debut
                          ? format(educationData.date_debut, "PPP", { locale: fr })
                          : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={educationData.date_debut || undefined}
                        onSelect={(date) =>
                          setEducationData({ ...educationData, date_debut: date || null })
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Date de fin (Obtention) <span className="text-red-500">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-1"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {educationData.date_fin
                          ? format(educationData.date_fin, "PPP", { locale: fr })
                          : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={educationData.date_fin || undefined}
                        onSelect={(date) =>
                          setEducationData({ ...educationData, date_fin: date || null })
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div>
                <Label htmlFor="edu_description" className="text-sm font-semibold text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="edu_description"
                  value={educationData.description}
                  onChange={(e) =>
                    setEducationData({ ...educationData, description: e.target.value })
                  }
                  placeholder="Décrivez votre formation, spécialisation..."
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>
          ) : (
            // Experiences Form (default)
            <>
          {experiences.map((experience, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative"
            >
              {experiences.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full h-8 w-8 p-0"
                  onClick={() => removeExperience(index)}
                  title="Supprimer cette expérience"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Supprimer cette expérience</span>
                </Button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`organisme-${index}`}>
                    Entreprise / Organisation *
                  </Label>
                  <Input
                    id={`organisme-${index}`}
                    value={experience.organisme}
                    onChange={(e) =>
                      updateExperience(index, "organisme", e.target.value)
                    }
                    placeholder="Ex: Google, Microsoft..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor={`poste-${index}`}>Poste occupé *</Label>
                  <Input
                    id={`poste-${index}`}
                    value={experience.poste}
                    onChange={(e) =>
                      updateExperience(index, "poste", e.target.value)
                    }
                    placeholder="Ex: Développeur Full Stack"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Date de début</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-1"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {experience.date_debut
                          ? format(experience.date_debut, "PPP", { locale: fr })
                          : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={experience.date_debut || undefined}
                        onSelect={(date) =>
                          updateExperience(index, "date_debut", date)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Date de fin</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-1"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {experience.date_fin
                          ? format(experience.date_fin, "PPP", { locale: fr })
                          : "En cours / Sélectionner"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={experience.date_fin || undefined}
                        onSelect={(date) =>
                          updateExperience(index, "date_fin", date)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor={`location-${index}`}>Lieu</Label>
                  <Input
                    id={`location-${index}`}
                    value={experience.location}
                    onChange={(e) =>
                      updateExperience(index, "location", e.target.value)
                    }
                    placeholder="Ex: Paris, France"
                    className="mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Textarea
                    id={`description-${index}`}
                    value={experience.description}
                    onChange={(e) =>
                      updateExperience(index, "description", e.target.value)
                    }
                    placeholder="Décrivez vos responsabilités et réalisations..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addExperience}
            className="w-full border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une autre expérience
          </Button>
          </>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t-2 border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none border-2 border-gray-300 hover:bg-gray-50 font-semibold"
              aria-label="Fermer sans enregistrer"
            >
              <X className="h-4 w-4 mr-2" />
              Fermer
            </Button>
            <Button
              variant="outline"
              onClick={onSkip}
              className="flex-1 sm:flex-none border-2 border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold"
              aria-label="Passer l'ajout d'expériences pour le moment"
            >
              <Clock className="h-4 w-4 mr-2" />
              Passer pour le moment
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl"
              aria-label="Enregistrer"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {missingSections.indexOf(currentSection) < missingSections.length - 1 
                    ? "Suivant" 
                    : "Terminer"}
                </>
              )}
            </Button>
          </div>
        </div>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}