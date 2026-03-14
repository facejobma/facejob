"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { CheckCircle, RefreshCw } from "lucide-react";
import { reactivateProfile } from "@/lib/api";

interface ProfileReactivationButtonProps {
  onReactivated?: () => void;
}

const ProfileReactivationButton: React.FC<ProfileReactivationButtonProps> = ({
  onReactivated,
}) => {
  const [loading, setLoading] = useState(false);

  const handleReactivate = async () => {
    setLoading(true);
    try {
      await reactivateProfile();
      toast.success("Profil réactivé avec succès ! Vous êtes à nouveau visible par les recruteurs.");
      onReactivated?.();
    } catch {
      toast.error("Erreur lors de la réactivation. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-amber-900">Profil suspendu</h2>
            <p className="text-sm text-amber-700">
              Votre profil est actuellement invisible pour les recruteurs.
            </p>
          </div>
        </div>
        <button
          onClick={handleReactivate}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-medium text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Réactivation...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Réactiver mon profil
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfileReactivationButton;
