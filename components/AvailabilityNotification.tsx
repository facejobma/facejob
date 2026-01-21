"use client";

import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle, XCircle, ChevronDown } from "lucide-react";

interface AvailabilityData {
  availability_status: 'available' | 'unavailable' | 'pending';
  last_confirmation: string | null;
  needs_confirmation: boolean;
  days_since_confirmation: number | null;
}

const AvailabilityNotification: React.FC = () => {
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  useEffect(() => {
    fetchAvailabilityStatus();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const fetchAvailabilityStatus = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/availability/status`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAvailabilityData(data);
      }
    } catch (error) {
      console.error("Error fetching availability status:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAvailabilityStatus = async (status: 'available' | 'unavailable') => {
    setUpdating(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/availability/update`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        const message = status === 'available' ? "Disponibilité confirmée !" : "Statut mis à jour !";
        toast.success(message);
        fetchAvailabilityStatus();
        setIsOpen(false);
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'unavailable':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return "Disponible";
      case 'unavailable':
        return "Non disponible";
      default:
        return "En attente";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return "text-green-700 bg-green-50 border-green-200";
      case 'unavailable':
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Jamais";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  if (loading || !availabilityData) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Header Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors duration-200 ${
          availabilityData.needs_confirmation 
            ? "bg-yellow-50 border-yellow-200 hover:bg-yellow-100" 
            : getStatusColor(availabilityData.availability_status)
        }`}
        aria-label="Statut de disponibilité"
      >
        {getStatusIcon(availabilityData.availability_status)}
        <span className="text-sm font-medium hidden sm:inline">
          {getStatusText(availabilityData.availability_status)}
        </span>
        {availabilityData.needs_confirmation && (
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Statut de disponibilité
            </h3>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Statut actuel :</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(availabilityData.availability_status)}
                  <span className="font-medium">
                    {getStatusText(availabilityData.availability_status)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Dernière confirmation :</span>
                <span className="text-gray-500">
                  {formatDate(availabilityData.last_confirmation)}
                </span>
              </div>
            </div>

            {availabilityData.needs_confirmation && (
              <div className="p-3 bg-yellow-100 rounded-md">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Confirmation requise</span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  Votre disponibilité doit être confirmée chaque semaine.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => updateAvailabilityStatus('available')}
                disabled={updating}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                {updating ? (
                  <Clock className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Disponible
              </Button>
              
              <Button
                onClick={() => updateAvailabilityStatus('unavailable')}
                disabled={updating}
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                size="sm"
              >
                {updating ? (
                  <Clock className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Non disponible
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityNotification;