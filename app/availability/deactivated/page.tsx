"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";

const DeactivatedContent: React.FC = () => {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  const isSuccess = success === "true";
  const isExpired = error === "expired";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md border-2 ${isSuccess ? "border-gray-200 bg-gray-50" : "border-red-200 bg-red-50"}`}>
        <CardContent className="p-8 text-center">
          <div className="mb-6 flex justify-center">
            {isSuccess ? (
              <XCircle className="w-16 h-16 text-gray-400" />
            ) : isExpired ? (
              <Clock className="w-16 h-16 text-orange-400" />
            ) : (
              <AlertCircle className="w-16 h-16 text-red-500" />
            )}
          </div>

          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            {isSuccess
              ? "Profil mis en mode inactif"
              : isExpired
              ? "Lien expiré"
              : "Lien invalide"}
          </h1>

          <p className="text-gray-600 mb-8">
            {isSuccess
              ? "Votre profil a été mis en mode inactif. Vous ne recevrez plus de propositions d'emploi. Vous pouvez réactiver votre compte à tout moment depuis votre espace candidat."
              : isExpired
              ? "Ce lien de confirmation a expiré. Connectez-vous à votre espace candidat pour gérer votre statut."
              : "Ce lien est invalide ou a déjà été utilisé."}
          </p>

          <div className="space-y-4">
            <Link href="/auth/login-candidate">
              <Button className="w-full text-white">
                Accéder à mon espace candidat
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const DeactivatedPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-gray-200 bg-gray-50 border-2">
            <CardContent className="p-8 text-center">
              <Clock className="w-16 h-16 text-gray-400 animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-4 text-gray-800">Chargement...</h1>
            </CardContent>
          </Card>
        </div>
      }
    >
      <DeactivatedContent />
    </Suspense>
  );
};

export default DeactivatedPage;
