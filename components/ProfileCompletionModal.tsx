"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X, Briefcase, Clock, GraduationCap, Lightbulb, FolderOpen, FileText, CheckCircle, AlertCircle, Globe, Search } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { SKILLS_BY_CATEGORY, TOP_SKILLS } from "@/constants/skills";

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
  const router = useRouter();
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
  const [isMobile, setIsMobile] = useState(false);

  // Additional form states for other sections
  const [bioData, setBioData] = useState("");
  const [skillsData, setSkillsData] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [skillSearchTerm, setSkillSearchTerm] = useState("");
  const [selectedSkillCategory, setSelectedSkillCategory] = useState(TOP_SKILLS_CATEGORY);
  const [languagesData, setLanguagesData] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState("");
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

  const skillsByCategory = useMemo(
    () => ({
      [TOP_SKILLS_CATEGORY]: TOP_SKILLS,
      ...SKILLS_BY_CATEGORY,
    }),
    []
  );

  const filteredSkills = useMemo(() => {
    const categorySkills =
      skillsByCategory[selectedSkillCategory as keyof typeof skillsByCategory] || [];
    const search = skillSearchTerm.toLowerCase().trim();

    if (!search) return categorySkills;

    return categorySkills.filter((skill) => skill.toLowerCase().includes(search));
  }, [skillSearchTerm, selectedSkillCategory, skillsByCategory]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

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

          if (!profileData.languages || profileData.languages.length === 0) {
            missing.push("languages");
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
      if (isMobile) {
        onClose();
        router.push("/dashboard/candidat/competences");
        return;
      }
      return handleSubmitSkills();
    } else if (currentSection === "projects") {
      return handleSubmitProject();
    } else if (currentSection === "education") {
      return handleSubmitEducation();
    } else if (currentSection === "languages") {
      return handleSubmitLanguages();
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

  const handleSubmitLanguages = async () => {
    if (languagesData.length === 0) {
      toast.error("Veuillez ajouter au moins une langue");
      return;
    }
    setIsSubmitting(true);
    const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidat/languages`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ languages: languagesData }),
        }
      );
      if (response.ok) {
        toast.success("Langues ajoutées avec succès!");
        moveToNextSection();
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } catch {
      toast.error("Erreur réseau");
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
      setSkillSearchTerm("");
      setSelectedSkillCategory(TOP_SKILLS_CATEGORY);
      setLanguagesData([]);
      setNewLanguage("");
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

  const handleAddSkill = (skill?: string | React.MouseEvent<HTMLButtonElement>) => {
    const skillToAdd = typeof skill === "string" ? skill : newSkill.trim();

    if (skillToAdd && !skillsData.includes(skillToAdd)) {
      setSkillsData([...skillsData, skillToAdd]);
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
      case "languages":
        return "Langues parlées";
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
      case "languages":
        return <Globe className="h-6 w-6 text-blue-600" />;
      default:
        return <Briefcase className="h-6 w-6 text-blue-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-5xl max-h-[92dvh] overflow-y-auto !p-3 sm:w-[calc(100vw-2rem)] sm:!p-6" aria-describedby="experience-modal-description">
        {loading ? (
          // Loading state
          <>
            <DialogHeader className="relative pb-3 sm:pb-4 border-b-2 border-gray-200">
              <DialogTitle className="flex items-start gap-2 sm:gap-3 text-lg sm:text-2xl pr-8 text-left">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg sm:rounded-xl p-2 sm:p-3 shrink-0">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 animate-pulse" />
                </div>
                <div className="text-gray-900">Analyse de votre profil</div>
              </DialogTitle>
              <p id="experience-modal-description" className="text-gray-600 mt-2 sm:mt-3 text-sm sm:text-base text-left">
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
            <DialogHeader className="relative pb-3 sm:pb-4 border-b-2 border-gray-200">
              <DialogTitle className="flex items-start gap-2 sm:gap-3 text-lg sm:text-2xl pr-8 text-left">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg sm:rounded-xl p-2 sm:p-3 shrink-0">
                  {getSectionIcon()}
                </div>
                <div className="min-w-0">
                  <div className="text-gray-900 break-words">{getSectionTitle()}</div>
                  {missingSections.length > 1 && (
                    <div className="text-xs sm:text-sm font-normal text-amber-600 mt-1">
                      Section {missingSections.indexOf(currentSection) + 1} sur {missingSections.length}
                    </div>
                  )}
                </div>
              </DialogTitle>
              <p id="experience-modal-description" className="text-gray-600 mt-2 sm:mt-3 text-sm sm:text-base text-left">
                {currentSection === "experiences" 
                  ? "Complétez votre profil en ajoutant vos expériences professionnelles."
                  : `Complétez votre profil en ajoutant: ${getSectionTitle()}`}
              </p>
            </DialogHeader>

        {/* Show missing sections alert if any */}
        {!loading && missingSections.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-3 sm:p-5 mb-4 sm:mb-6 shadow-sm">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="bg-amber-100 rounded-lg sm:rounded-xl p-2 sm:p-3 flex-shrink-0">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-amber-900 text-sm sm:text-base mb-3">
                  Sections de profil à compléter
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {missingSections.includes("bio") && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-800 bg-white rounded-lg p-2 border border-amber-200">
                      <FileText className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <span className="font-medium">À propos de moi</span>
                    </div>
                  )}
                  {missingSections.includes("experiences") && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-800 bg-white rounded-lg p-2 border border-amber-200">
                      <Briefcase className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <span className="font-medium">Expériences</span>
                    </div>
                  )}
                  {missingSections.includes("skills") && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-800 bg-white rounded-lg p-2 border border-amber-200">
                      <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <span className="font-medium">Compétences</span>
                    </div>
                  )}
                  {missingSections.includes("projects") && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-800 bg-white rounded-lg p-2 border border-amber-200">
                      <FolderOpen className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <span className="font-medium">Projets</span>
                    </div>
                  )}
                  {missingSections.includes("education") && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-800 bg-white rounded-lg p-2 border border-amber-200">
                      <GraduationCap className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <span className="font-medium">Formation</span>
                    </div>
                  )}
                  {missingSections.includes("languages") && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-800 bg-white rounded-lg p-2 border border-amber-200">
                      <Globe className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <span className="font-medium">Langues parlées</span>
                    </div>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-amber-800 mt-3 sm:mt-4 flex items-start gap-2 bg-white rounded-lg p-2 border border-amber-200">
                  <span className="text-lg">💡</span>
                  <span>Complétez ces sections pour améliorer vos chances auprès des recruteurs.</span>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
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
                maxLength={1000}
                className="mt-2 border-gray-300 focus:border-green-500 focus:ring-green-200"
              />
              <p className="text-xs text-gray-500 mt-1">
                {bioData.length}/1000 caractères
              </p>
            </div>
          ) : currentSection === "skills" && isMobile ? (
            <div className="rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-white p-2 shadow-sm">
                  <Lightbulb className="h-5 w-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Complétez vos compétences sur la page dédiée
                  </h4>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Sur mobile, la page Compétences est plus confortable pour choisir et enregistrer vos compétences.
                  </p>
                </div>
              </div>
            </div>
          ) : currentSection === "skills" ? (
            // Skills Form - fixed list selection
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 sm:p-6 border-2 border-green-200 space-y-3 sm:space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  Sélectionnez vos compétences <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-600 mt-1 leading-5">
                  Choisissez uniquement depuis la liste FaceJob pour améliorer le matching avec les offres.
                </p>
              </div>

              {skillsData.length > 0 && (
                <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                  {skillsData.map((skill) => (
                    <div
                      key={skill}
                      className="flex max-w-full items-center justify-between gap-2 bg-green-100 text-green-800 px-3 py-2 sm:py-1.5 rounded-lg text-sm"
                    >
                      <span className="truncate">{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-green-600 hover:text-green-800 font-bold shrink-0"
                        aria-label={`Retirer ${skill}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={skillSearchTerm}
                  onChange={(e) => setSkillSearchTerm(e.target.value)}
                  placeholder="Rechercher une compétence..."
                  className="pl-10 pr-10 border-green-200 focus:border-green-500 focus:ring-green-200"
                />
                {skillSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setSkillSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Effacer la recherche"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="-mx-3 flex gap-2 overflow-x-auto overscroll-x-contain px-3 pb-2 sm:-mx-1 sm:px-1">
                {Object.keys(skillsByCategory).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedSkillCategory(category)}
                    className={`shrink-0 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                      selectedSkillCategory === category
                        ? "bg-[#16a34a] text-white"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-green-50 hover:border-green-300"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-lg border border-green-200 p-2 sm:p-3">
                {filteredSkills.length === 0 ? (
                  <div className="py-8 text-center">
                    <Search className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Aucune compétence trouvée dans la liste.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[36dvh] sm:max-h-[42vh] overflow-y-auto pr-1">
                    {filteredSkills.map((skill) => {
                      const isSelected = skillsData.includes(skill);
                      const isDisabled = !isSelected && skillsData.length >= 20;

                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              handleRemoveSkill(skill);
                            } else {
                              handleAddSkill(skill);
                            }
                          }}
                          disabled={isDisabled}
                          className={`min-w-0 min-h-11 sm:min-h-10 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                            isSelected
                              ? "bg-[#16a34a] text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:border-green-500 hover:bg-green-50"
                          } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                          {isSelected ? (
                            <CheckCircle className="h-4 w-4 shrink-0" />
                          ) : (
                            <Plus className="h-4 w-4 shrink-0" />
                          )}
                          <span className="min-w-0 truncate">{skill}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : false && currentSection === "skills" ? (
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
                    maxLength={50}
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
                  maxLength={150}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {projectData.title.length}/150 caractères
                </p>
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
                  maxLength={1000}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {projectData.description.length}/1000 caractères
                </p>
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
                  maxLength={200}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {projectData.link.length}/200 caractères
                </p>
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
                  maxLength={150}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {educationData.titre.length}/150 caractères
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
                    maxLength={200}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {educationData.etablissement.length}/200 caractères
                  </p>
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
          ) : currentSection === "languages" ? (
            // Languages Form
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200 space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  Ajouter une langue <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const trimmed = newLanguage.trim();
                        if (trimmed && !languagesData.includes(trimmed)) {
                          setLanguagesData([...languagesData, trimmed]);
                          setNewLanguage("");
                        }
                      }
                    }}
                    placeholder="Ex: Français, Anglais, Arabe..."
                    maxLength={50}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const trimmed = newLanguage.trim();
                      if (trimmed && !languagesData.includes(trimmed)) {
                        setLanguagesData([...languagesData, trimmed]);
                        setNewLanguage("");
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
              {/* Quick add */}
              <div className="flex flex-wrap gap-1.5">
                {["Arabe", "Français", "Anglais", "Espagnol", "Allemand", "Italien"].filter(l => !languagesData.includes(l)).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguagesData([...languagesData, lang])}
                    className="px-2.5 py-1 bg-white border border-gray-200 hover:bg-green-50 hover:border-green-300 text-gray-600 rounded-full text-xs transition-colors"
                  >
                    + {lang}
                  </button>
                ))}
              </div>
              {languagesData.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {languagesData.map((lang) => (
                    <div key={lang} className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-sm">
                      <span>{lang}</span>
                      <button type="button" onClick={() => setLanguagesData(languagesData.filter(l => l !== lang))} className="text-blue-600 hover:text-blue-800 font-bold">×</button>
                    </div>
                  ))}
                </div>
              )}
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
                    maxLength={150}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {experience.organisme.length}/150 caractères
                  </p>
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
                    maxLength={100}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {experience.poste.length}/100 caractères
                  </p>
                </div>

                <div>
                  <Label htmlFor={`date-debut-${index}`}>
                    Date de début
                  </Label>
                  <Input
                    id={`date-debut-${index}`}
                    type="date"
                    value={experience.date_debut ? format(experience.date_debut, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      updateExperience(index, "date_debut", date);
                    }}
                    className="mt-1"
                    style={{ colorScheme: 'light' }}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                  />
                </div>

                <div>
                  <Label htmlFor={`date-fin-${index}`}>
                    Date de fin
                  </Label>
                  <Input
                    id={`date-fin-${index}`}
                    type="date"
                    value={experience.date_fin ? format(experience.date_fin, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      updateExperience(index, "date_fin", date);
                    }}
                    className="mt-1"
                    style={{ colorScheme: 'light' }}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Laissez vide si en cours
                  </p>
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
                    maxLength={100}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {experience.location.length}/100 caractères
                  </p>
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
                    maxLength={1000}
                    className="mt-1"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {experience.description.length}/1000 caractères
                  </p>
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

          <div className="sticky bottom-0 -mx-3 flex flex-col gap-2 border-t-2 border-gray-200 bg-white/95 px-3 pt-3 pb-1 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:gap-3 sm:bg-transparent sm:px-0 sm:pt-6 sm:pb-0 sm:mt-8">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none border-2 border-gray-300 hover:bg-gray-50 font-semibold text-sm"
              aria-label="Fermer sans enregistrer"
            >
              <X className="h-4 w-4 mr-2" />
              Fermer
            </Button>
            <Button
              variant="outline"
              onClick={onSkip}
              className="flex-1 sm:flex-none border-2 border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold text-sm"
              aria-label="Passer l'ajout d'expériences pour le moment"
            >
              <Clock className="h-4 w-4 mr-2" />
              Passer pour le moment
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold shadow-lg hover:shadow-xl text-sm"
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
                  {currentSection === "skills" && isMobile
                    ? "Compléter mes compétences"
                    : missingSections.indexOf(currentSection) < missingSections.length - 1 
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

const TOP_SKILLS_CATEGORY = "Top Compétences";
