"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { confirmAvailability } from "@/lib/api";

interface ConfirmationResult {
  success: boolean;
  message: string;
  status?: string;
  confirmed_at?: string;
}

const AvailabilityConfirmContent: React.FC = () => {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(true);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (token && email) {
      confirmAvailabilityAsync();
    } else {
      setResult({
        success: false,
        message: "Paramètres manquants dans le lien de confirmation"
      });
      setLoading(false);
    }
  }, [token, email]);

  const confirmAvailabilityAsync = async () => {
    try {
      const data = await confirmAvailability(token!, email!, 'available');
      setResult({
        success: true,
        message: data.message,
        status: data.status,
        confirmed_at: data.confirmed_at
      });
    } catch (error) {
      console.error('Confirmation error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Erreur lors de la confirmation"
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

const AvailabilityConfirmPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-blue-200 bg-blue-50 border-2">
          <CardContent className="p-8 text-center">
            <Clock className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-4 text-gray-800">
              Chargement...
            </h1>
          </CardContent>
        </Card>
      </div>
    }>
      <AvailabilityConfirmContent />
    </Suspense>
  );
};

export default AvailabilityConfirmPage;