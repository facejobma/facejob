"use client";

import React, { useState } from "react";
import { FaCog } from "react-icons/fa";
import { Globe } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import LanguageSelect2 from "@/components/LanguageSelect2";

interface LanguagesSectionProps {
  languages: string[];
  onUpdate?: () => void;
}

const LanguagesSection: React.FC<LanguagesSectionProps> = ({ languages, onUpdate }) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState<string[]>([...languages]);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpen = () => {
    setEdited([...languages]);
    setIsEditing(true);
  };

  const handleClose = () => {
    setIsEditing(false);
  };

  const handleLanguageChange = (newLanguages: string[]) => {
    console.log("handleLanguageChange called with:", newLanguages);
    setEdited(newLanguages);
  };

  const handleSave = async () => {
    if (edited.length === 0) {
      toast.error("Veuillez sélectionner au moins une langue");
      return;
    }

    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
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
          className="p-2 hover:bg-[#16a34a]/10 rounded-lg transition-colors text-[#16a34a]"
          title="Modifier les langues"
        >
          <FaCog className="w-4 h-4" />
        </button>
      </div>

      {languages.length === 0 ? (
        <p className="text-gray-400 text-sm italic">Aucune langue renseignée</p>
      ) : (
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {languages.map((lang) => (
            <span
              key={lang}
              className="px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-medium border border-blue-100"
            >
              {lang}
            </span>
          ))}
        </div>
      )}

      {isEditing && (
        <Modal 
          isOpen={isEditing} 
          onClose={handleClose} 
          title="Modifier les langues" 
          description="Sélectionnez les langues que vous parlez"
        >
          <div className="space-y-4">
            {/* Select langues avec checkboxes */}
            <LanguageSelect2
              value={edited}
              onChange={handleLanguageChange}
              placeholder="Recherchez une langue..."
            />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                className="w-full sm:flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || edited.length === 0}
                className="w-full sm:flex-1 px-4 py-2.5 bg-[#16a34a] text-white rounded-lg text-sm hover:bg-[#15803d] active:bg-[#166534] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  "Enregistrer"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LanguagesSection;
