"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

interface ConfirmationResult {
  success: boolean;
  message: string;
  status?: string;
  confirmed_at?: string;
}

const AvailabilityConfirmPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(true);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (token && email) {
      confirmAvailability();
    } else {
      setResult({
        success: false,
        message: "Paramètres manquants dans le lien de confirmation"
      });
      setLoading(false);
    }
  }, [token, email]);

  const confirmAvailability = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/availability/confirm?token=${token}&email=${encodeURIComponent(email!)}&status=available`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          status: data.status,
          confirmed_at: data.confirmed_at
        });
      } else {
        setResult({
          success: false,
          message: data.message || "Erreur lors de la confirmation"
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Erreur de connexion. Veuillez réessayer plus tard."
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (loading) return <Clock className="w-16 h-16 text-blue-500 animate-spin" />;
    if (!result) return <AlertCircle className="w-16 h-16 text-red-500" />;
    
    if (result.success) {
      return <CheckCircle className="w-16 h-16 text-green-500" />;
    }
    
    return <AlertCircle className="w-16 h-16 text-red-500" />;
  };

  const getStatusText = () => {
    if (loading) return "Confirmation en cours...";
    if (!result) return "Erreur";
    
    if (result.success) {
      return "Disponibilité confirmée !";
    }
    
    return "Erreur de confirmation";
  };

  const getStatusColor = () => {
    if (loading) return "border-blue-200 bg-blue-50";
    if (!result || !result.success) return "border-red-200 bg-red-50";
    
    return "border-green-200 bg-green-50";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md ${getStatusColor()} border-2`}>
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            {getStatusIcon()}
          </div>
          
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            {getStatusText()}
          </h1>
          
          {result && (
            <p className="text-gray-600 mb-6">
              {result.message}
            </p>
          )}

          {result?.success && (
            <div className="mb-6 p-4 rounded-lg bg-white border">
              <p className="text-sm text-gray-600 mb-2">Votre statut :</p>
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 rounded-full mr-2 bg-green-500"></span>
                  Disponible
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/auth/login-candidate">
              <Button className="w-full">
                Accéder à mon tableau de bord
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" className="w-full">
                Retour à l'accueil
              </Button>
            </Link>
          </div>

          {result?.success && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Rappel :</strong> Vous recevrez un nouveau lien de confirmation chaque semaine pour maintenir votre profil actif.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilityConfirmPage;