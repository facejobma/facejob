"use client";

import React, { useState } from "react";
import { FaCog, FaPlus, FaTimes } from "react-icons/fa";
import { Globe } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const COMMON_LANGUAGES = [
  "Arabe", "Français", "Anglais", "Espagnol", "Allemand",
  "Italien", "Portugais", "Chinois", "Japonais", "Russe",
  "Néerlandais", "Turc", "Persan", "Coréen", "Hindi",
];

interface LanguagesSectionProps {
  languages: string[];
  onUpdate?: () => void;
}

const LanguagesSection: React.FC<LanguagesSectionProps> = ({ languages, onUpdate }) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState<string[]>([...languages]);
  const [input, setInput] = useState("");

  const handleOpen = () => {
    setEdited([...languages]);
    setIsEditing(true);
  };

  const handleClose = () => {
    setIsEditing(false);
    setInput("");
  };

  const addLanguage = (lang: string) => {
    const trimmed = lang.trim();
    if (!trimmed || edited.includes(trimmed)) return;
    setEdited([...edited, trimmed]);
    setInput("");
  };

  const removeLanguage = (lang: string) => {
    setEdited(edited.filter((l) => l !== lang));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidat/languages`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ languages: edited }),
        }
      );

      if (response.ok) {
        toast.success("Langues mises à jour !");
        setIsEditing(false);
        onUpdate?.();
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-gray-900">Langues</h2>
        </div>
        <button
          onClick={handleOpen}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          title="Modifier les langues"
        >
          <FaCog className="w-4 h-4" />
        </button>
      </div>

      {languages.length === 0 ? (
        <p className="text-gray-400 text-sm italic">Aucune langue renseignée</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <span
              key={lang}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
            >
              {lang}
            </span>
          ))}
        </div>
      )}

      {isEditing && (
        <Modal isOpen={isEditing} onClose={handleClose} title="Modifier les langues" description="Ajoutez ou supprimez les langues que vous parlez">
          <div className="space-y-4">
            {/* Current languages */}
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {edited.length === 0 && (
                <p className="text-gray-400 text-sm italic">Aucune langue ajoutée</p>
              )}
              {edited.map((lang) => (
                <span
                  key={lang}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
                >
                  {lang}
                  <button
                    type="button"
                    onClick={() => removeLanguage(lang)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Custom input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLanguage(input); } }}
                placeholder="Ajouter une langue..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => addLanguage(input)}
                className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <FaPlus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick add common languages */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Langues courantes :</p>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_LANGUAGES.filter((l) => !edited.includes(l)).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => addLanguage(lang)}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 rounded-full text-xs transition-colors"
                  >
                    + {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LanguagesSection;
