"use client";

import React, { useState, useMemo } from "react";
import { ALL_LANGUAGES } from "@/constants/languages";
import { Search, X } from "lucide-react";

interface LanguageSelect2Props {
  value: string[];
  onChange: (languages: string[]) => void;
  placeholder?: string;
  className?: string;
}

const LanguageSelect2: React.FC<LanguageSelect2Props> = ({
  value,
  onChange,
  placeholder = "Recherchez une langue...",
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrer les langues en fonction de la recherche
  const filteredLanguages = useMemo(() => {
    if (!searchTerm.trim()) return ALL_LANGUAGES;
    
    const search = searchTerm.toLowerCase().trim();
    return ALL_LANGUAGES.filter((lang) =>
      lang.toLowerCase().includes(search)
    );
  }, [searchTerm]);

  // Gérer la sélection/désélection d'une langue
  const toggleLanguage = (language: string) => {
    if (value.includes(language)) {
      // Retirer la langue
      onChange(value.filter((lang) => lang !== language));
    } else {
      // Ajouter la langue
      onChange([...value, language]);
    }
  };

  // Retirer une langue depuis les badges
  const removeLanguage = (language: string) => {
    onChange(value.filter((lang) => lang !== language));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Langues sélectionnées */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 p-2 sm:p-3 bg-primary/5 rounded-lg border border-primary/20">
          {value.map((lang) => (
            <span
              key={lang}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-white border border-primary/30 text-primary rounded-lg text-xs sm:text-sm font-medium shadow-sm"
            >
              <span className="truncate max-w-[100px] sm:max-w-none">{lang}</span>
              <button
                type="button"
                onClick={() => removeLanguage(lang)}
                className="hover:bg-primary/10 rounded-full p-0.5 transition-colors flex-shrink-0 -mr-0.5"
                aria-label={`Retirer ${lang}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Liste des langues avec checkboxes */}
      <div className="border border-gray-200 rounded-lg max-h-[200px] overflow-y-auto">
        {filteredLanguages.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Aucune langue trouvée
          </div>
        ) : (
          <div className="p-1.5">
            {filteredLanguages.map((language) => {
              const isSelected = value.includes(language);
              return (
                <label
                  key={language}
                  className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-primary/10 hover:bg-primary/15"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleLanguage(language)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  />
                  <span
                    className={`text-sm ${
                      isSelected
                        ? "text-primary font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {language}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Compteur */}
      <div className="text-xs text-gray-500 text-center">
        {value.length} langue{value.length > 1 ? "s" : ""} sélectionnée{value.length > 1 ? "s" : ""}
      </div>
    </div>
  );
};

export default LanguageSelect2;
