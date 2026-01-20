"use client";

import React, { useState } from "react";
import { 
  FullPageLoading, 
  InlineLoading, 
  ButtonLoading, 
  LoadingSpinner, 
  LoadingDots, 
  LoadingPulse, 
  TableLoading, 
  CardLoading, 
  VideoLoading, 
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
          Voici tous les composants de chargement unifiés disponibles dans l'application
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
            onClick={() => setShowFullPage(true)}
            className="mr-4"
          >
            Voir démo (3s)
          </Button>
          {showFullPage && (
            <Button 
              variant="outline"
              onClick={() => setShowFullPage(false)}
            >
              Fermer
            </Button>
          )}
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
              <LoadingSpinner size="sm" color="primary" />
              <p className="text-sm text-gray-600">Petit - Vert</p>
            </div>
            <div className="text-center space-y-2">
              <LoadingSpinner size="md" color="secondary" />
              <p className="text-sm text-gray-600">Moyen - Bleu</p>
            </div>
            <div className="text-center space-y-2">
              <LoadingSpinner size="lg" color="gray" />
              <p className="text-sm text-gray-600">Grand - Gris</p>
            </div>
            <div className="text-center space-y-2 bg-gray-800 p-4 rounded">
              <LoadingSpinner size="xl" color="white" />
              <p className="text-sm text-white">Très grand - Blanc</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading Dots */}
      <Card>
        <CardHeader>
          <CardTitle>Points de chargement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <LoadingDots size="sm" color="primary" />
              <p className="text-sm text-gray-600">Petit</p>
            </div>
            <div className="text-center space-y-2">
              <LoadingDots size="md" color="secondary" />
              <p className="text-sm text-gray-600">Moyen</p>
            </div>
            <div className="text-center space-y-2">
              <LoadingDots size="lg" color="gray" />
              <p className="text-sm text-gray-600">Grand</p>
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
              size="sm"
            >
              Petit bouton
            </ButtonLoading>
            
            <ButtonLoading
              loading={buttonLoading}
              loadingText="Traitement..."
              onClick={handleButtonClick}
              size="md"
            >
              Bouton moyen
            </ButtonLoading>
            
            <ButtonLoading
              loading={buttonLoading}
              loadingText="Envoi en cours..."
              onClick={handleButtonClick}
              size="lg"
            >
              Grand bouton
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

      {/* Skeleton Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Chargement squelette</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <LoadingPulse className="h-4 w-3/4" />
            <LoadingPulse className="h-4 w-full" />
            <LoadingPulse className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>

      {/* Table Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Chargement de tableau</CardTitle>
        </CardHeader>
        <CardContent>
          <TableLoading rows={3} columns={4} />
        </CardContent>
      </Card>

      {/* Card Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Chargement de carte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardLoading />
            <CardLoading />
          </div>
        </CardContent>
      </Card>

      {/* Video Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Chargement vidéo</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoLoading className="w-full h-48" />
        </CardContent>
      </Card>

      {/* Auto-hide demo */}
      <div className="text-center pt-8">
        <Button 
          variant="outline"
          onClick={() => {
            setShowFullPage(true);
            setTimeout(() => setShowFullPage(false), 3000);
          }}
        >
          Voir démo complète (3 secondes)
        </Button>
      </div>
    </div>
  );
};

export default LoadingDemoPage;