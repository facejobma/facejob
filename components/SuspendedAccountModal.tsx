"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { AlertTriangle, RefreshCw, CheckCircle } from "lucide-react";
import { reactivateProfile } from "@/lib/api";

interface SuspendedAccountModalProps {
  isOpen: boolean;
  onReactivated: () => void;
}

const SuspendedAccountModal: React.FC<SuspendedAccountModalProps> = ({
  isOpen,
  onReactivated,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleReactivate = async () => {
    setLoading(true);
    try {
      await reactivateProfile();
      toast.success("Profil réactivé avec succès ! Vous êtes à nouveau visible par les recruteurs.");
      onReactivated();
    } catch {
      toast.error("Erreur lors de la réactivation. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold text-amber-900">
            Votre profil est suspendu
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-gray-700 text-sm leading-relaxed mb-2">
            Votre profil est actuellement <span className="font-semibold text-amber-700">invisible pour les recruteurs</span>.
            Tant qu'il est suspendu, vous n'apparaissez plus dans les résultats de recherche et ne pouvez pas être contacté.
          </p>
          <p className="text-gray-500 text-sm">
            Réactivez votre profil pour redevenir visible et recevoir des opportunités.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={handleReactivate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Réactivation en cours...
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
    </div>
  );
};

export default SuspendedAccountModal;
