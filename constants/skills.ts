/**
 * Constantes centralisées pour les compétences
 * 
 * Ce fichier contient toutes les compétences disponibles dans l'application.
 * Organisées par catégories pour faciliter la sélection.
 */

import skillsData from "@/data/skills.json";

/**
 * Compétences techniques (développement, IT, design, etc.)
 */
export const TECHNICAL_SKILLS = skillsData.technical_skills;

/**
 * Compétences comportementales (soft skills)
 */
export const SOFT_SKILLS = skillsData.soft_skills;

/**
 * Compétences business et gestion
 */
export const BUSINESS_SKILLS = skillsData.business_skills;

/**
 * Compétences linguistiques professionnelles
 */
export const LANGUAGE_SKILLS = skillsData.language_skills;

/**
 * Compétences spécifiques à certains secteurs
 */
export const INDUSTRY_SPECIFIC_SKILLS = skillsData.industry_specific;

/**
 * Toutes les compétences disponibles (liste complète)
 */
export const ALL_SKILLS = [
  ...TECHNICAL_SKILLS,
  ...SOFT_SKILLS,
  ...BUSINESS_SKILLS,
  ...LANGUAGE_SKILLS,
  ...INDUSTRY_SPECIFIC_SKILLS
].sort();

/**
 * Compétences organisées par catégorie pour l'affichage
 */
export const SKILLS_BY_CATEGORY = {
  "Compétences Techniques": TECHNICAL_SKILLS,
  "Compétences Comportementales": SOFT_SKILLS,
  "Compétences Business": BUSINESS_SKILLS,
  "Compétences Linguistiques": LANGUAGE_SKILLS,
  "Compétences Sectorielles": INDUSTRY_SPECIFIC_SKILLS
};

/**
 * Compétences les plus demandées (top 30)
 */
export const TOP_SKILLS = [
  "Communication",
  "Travail d'équipe",
  "Leadership",
  "Gestion du temps",
  "Résolution de problèmes",
  "JavaScript",
  "Python",
  "SQL",
  "Excel Avancé",
  "Anglais professionnel",
  "Gestion de projet",
  "Marketing Digital",
  "Vente",
  "Service client",
  "Comptabilité",
  "React",
  "Node.js",
  "AWS",
  "Docker",
  "Git",
  "Agile/Scrum",
  "UI/UX Design",
  "SEO",
  "Data Analysis",
  "Négociation",
  "Autonomie",
  "Adaptabilité",
  "Créativité",
  "Organisation",
  "Rigueur"
];
