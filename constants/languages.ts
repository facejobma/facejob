/**
 * Constantes centralisées pour les langues
 * 
 * Ce fichier contient toutes les langues disponibles dans l'application.
 * Utilisez ces constantes au lieu de définir des listes de langues localement.
 */

import languagesData from "@/data/languages.json";

/**
 * Liste complète de toutes les langues disponibles (82 langues)
 * Chargée depuis le fichier JSON centralisé
 */
export const ALL_LANGUAGES = languagesData.languages;

/**
 * Langues les plus courantes pour les offres d'emploi au Maroc
 * Utilisé dans les formulaires de création d'offres
 */
export const COMMON_LANGUAGES = [
  "Arabe",
  "Français", 
  "Anglais",
  "Espagnol",
  "Allemand",
  "Italien",
  "Portugais",
  "Chinois (Mandarin)",
  "Russe",
  "Turc"
];

/**
 * Options pour react-select ou autres composants de sélection
 */
export const LANGUAGE_OPTIONS = ALL_LANGUAGES.map(lang => ({
  value: lang,
  label: lang
}));

/**
 * Options pour les langues courantes
 */
export const COMMON_LANGUAGE_OPTIONS = COMMON_LANGUAGES.map(lang => ({
  value: lang,
  label: lang
}));
