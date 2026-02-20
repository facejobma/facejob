"use client";

import React, { useState } from "react";
import { 
  FullPageLoading, 
  InlineLoading, 
  ButtonLoading, 
  LoadingSpinner, 
  ProgressLoading 
} from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const LoadingDemoPage: React.FC = () => {
  const [showFullPage, setShowFullPage] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleButtonClick = () => {
    setButtonLoading(true);
    setTimeout(() => setButtonLoading(false), 3000);
  };

  const handleProgressDemo = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  if (showFullPage) {
    return (
      <FullPageLoading 
        message="Démonstration du chargement complet"
        submessage="Ceci est un exemple de chargement pleine page"
        showLogo={true}
      />
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Démonstration des composants de chargement
        </h1>
        <p className="text-gray-600">
          Voici tous les composants de chargement disponibles dans l'application
        </p>
      </div>

      <Separator />

      {/* Full Page Loading Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Chargement pleine page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Utilisé pour les chargements de pages principales
          </p>
          <Button 
            onClick={() => {
              setShowFullPage(true);
              setTimeout(() => setShowFullPage(false), 3000);
            }}
          >
            Voir démo (3s)
          </Button>
        </CardContent>
      </Card>

      {/* Spinners */}
      <Card>
        <CardHeader>
          <CardTitle>Spinners de chargement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <LoadingSpinner size="sm" />
              <p className="text-sm text-gray-600">Petit</p>
            </div>
            <div className="text-center space-y-2">
              <LoadingSpinner size="md" />
              <p className="text-sm text-gray-600">Moyen</p>
            </div>
            <div className="text-center space-y-2">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-600">Grand</p>
            </div>
            <div className="text-center space-y-2">
              <LoadingSpinner size="xl" />
              <p className="text-sm text-gray-600">Très grand</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inline Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Chargement en ligne</CardTitle>
        </CardHeader>
        <CardContent>
          <InlineLoading message="Chargement des données..." />
        </CardContent>
      </Card>

      {/* Button Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Boutons avec chargement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <ButtonLoading
              loading={buttonLoading}
              loadingText="Chargement..."
              onClick={handleButtonClick}
            >
              Cliquez pour tester
            </ButtonLoading>
          </div>
        </CardContent>
      </Card>

      {/* Progress Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Barre de progression</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProgressLoading 
            progress={progress}
            message="Téléchargement en cours..."
          />
          <Button onClick={handleProgressDemo}>
            Démarrer démo progression
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingDemoPage;