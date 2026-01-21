"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

interface MigrationItem {
  component: string;
  status: "completed" | "pending" | "in-progress";
  description: string;
  oldImplementation?: string;
  newImplementation?: string;
}

const migrationItems: MigrationItem[] = [
  {
    component: "Historique Page",
    status: "completed",
    description: "Page d'historique des candidatures",
    oldImplementation: "Circles spinner",
    newImplementation: "FullPageLoading"
  },
  {
    component: "Candidat Dashboard",
    status: "completed", 
    description: "Tableau de bord candidat principal",
    oldImplementation: "Circles with custom layout",
    newImplementation: "FullPageLoading with logo"
  },
  {
    component: "Offres Page",
    status: "completed",
    description: "Page de liste des offres d'emploi",
    oldImplementation: "Circles spinner",
    newImplementation: "FullPageLoading"
  },
  {
    component: "Google Auth",
    status: "completed",
    description: "Page d'authentification Google",
    oldImplementation: "Circles spinner",
    newImplementation: "FullPageLoading with logo"
  },
  {
    component: "LinkedIn Auth", 
    status: "completed",
    description: "Page d'authentification LinkedIn",
    oldImplementation: "Circles spinner",
    newImplementation: "FullPageLoading with logo"
  },
  {
    component: "CV Table",
    status: "completed",
    description: "Tableau des CV vidéos",
    oldImplementation: "Circles in div",
    newImplementation: "InlineLoading"
  },
  {
    component: "Job Table",
    status: "completed", 
    description: "Tableau des offres d'emploi",
    oldImplementation: "Circles in div",
    newImplementation: "InlineLoading"
  },
  {
    component: "User Auth Form",
    status: "completed",
    description: "Formulaire de connexion",
    oldImplementation: "Button with text change",
    newImplementation: "ButtonLoading"
  },
  {
    component: "Resume PDF Loader",
    status: "completed",
    description: "Générateur de CV PDF",
    oldImplementation: "Text change",
    newImplementation: "ButtonLoading"
  },
  {
    component: "Entreprise Pages",
    status: "pending",
    description: "Pages du tableau de bord entreprise",
    oldImplementation: "Various Circles implementations",
    newImplementation: "FullPageLoading + ButtonLoading"
  },
  {
    component: "Profile Forms",
    status: "pending", 
    description: "Formulaires de profil utilisateur",
    oldImplementation: "CSS spinners",
    newImplementation: "ButtonLoading + ProgressLoading"
  },
  {
    component: "File Upload Components",
    status: "pending",
    description: "Composants de téléchargement de fichiers",
    oldImplementation: "Custom progress bars",
    newImplementation: "ProgressLoading + useFileUpload"
  }
];

const LoadingMigrationStatus: React.FC = () => {
  const completed = migrationItems.filter(item => item.status === "completed").length;
  const total = migrationItems.length;
  const percentage = Math.round((completed / total) * 100);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-100 text-yellow-800">En cours</Badge>;
      default:
        return <Badge variant="outline">En attente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Migration du système de chargement</span>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {completed}/{total} ({percentage}%)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-gray-600">
            Migration des composants de chargement vers le système unifié
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {migrationItems.map((item, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.component}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                {getStatusBadge(item.status)}
              </div>
              
              {item.oldImplementation && item.newImplementation && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-red-600">Ancien:</span>
                      <span className="ml-2 text-gray-600">{item.oldImplementation}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-600">Nouveau:</span>
                      <span className="ml-2 text-gray-600">{item.newImplementation}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Prochaines étapes</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Migrer les pages entreprise restantes</li>
            <li>• Mettre à jour les formulaires de profil</li>
            <li>• Implémenter le système de progression pour les uploads</li>
            <li>• Supprimer la dépendance react-loader-spinner</li>
            <li>• Tester l'ensemble du système</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingMigrationStatus;