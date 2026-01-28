"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { XCircle, Mail, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const VerificationErrorPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const message = searchParams.get('message');
    setErrorMessage(message || 'Une erreur s\'est produite lors de la vérification de votre email.');
  }, [searchParams]);

  const handleResendEmail = () => {
    router.push('/auth/resend-verification');
  };

  const handleTryAgain = () => {
    // Refresh the current page
    window.location.reload();
  };

  const getErrorType = () => {
    if (errorMessage.toLowerCase().includes('expiré')) {
      return 'expired';
    } else if (errorMessage.toLowerCase().includes('invalide')) {
      return 'invalid';
    } else if (errorMessage.toLowerCase().includes('utilisateur non trouvé')) {
      return 'user_not_found';
    }
    return 'general';
  };

  const getErrorTitle = () => {
    const errorType = getErrorType();
    switch (errorType) {
      case 'expired':
        return 'Lien expiré';
      case 'invalid':
        return 'Lien invalide';
      case 'user_not_found':
        return 'Compte non trouvé';
      default:
        return 'Erreur de vérification';
    }
  };

  const getErrorDescription = () => {
    const errorType = getErrorType();
    switch (errorType) {
      case 'expired':
        return 'Le lien de vérification a expiré. Demandez un nouveau lien.';
      case 'invalid':
        return 'Le lien de vérification n\'est pas valide ou a déjà été utilisé.';
      case 'user_not_found':
        return 'Aucun compte n\'est associé à cette demande de vérification.';
      default:
        return 'Une erreur s\'est produite lors de la vérification de votre email.';
    }
  };

  const getSolutions = () => {
    const errorType = getErrorType();
    switch (errorType) {
      case 'expired':
        return [
          'Demander un nouveau lien de vérification',
          'Vérifier que vous utilisez le lien le plus récent',
          'Contacter le support si le problème persiste'
        ];
      case 'invalid':
        return [
          'Vérifier que vous avez copié le lien complet',
          'Demander un nouveau lien de vérification',
          'Essayer de vous connecter si votre email est déjà vérifié'
        ];
      case 'user_not_found':
        return [
          'Vérifier que vous utilisez la bonne adresse email',
          'Créer un nouveau compte si nécessaire',
          'Contacter le support pour assistance'
        ];
      default:
        return [
          'Réessayer dans quelques minutes',
          'Vérifier votre connexion internet',
          'Demander un nouveau lien de vérification'
        ];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <NavBar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
              <div className="mx-auto mb-4">
                <XCircle className="h-20 w-20 text-white" />
              </div>
              
              <CardTitle className="text-3xl font-bold mb-2">
                {getErrorTitle()}
              </CardTitle>
              
              <CardDescription className="text-red-100 text-lg">
                {getErrorDescription()}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
              <div className="mb-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-red-800 font-semibold mb-2">Détails de l'erreur :</h4>
                  <p className="text-red-700 text-sm">
                    {errorMessage}
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Solutions recommandées :
                </h4>
                <ul className="space-y-3">
                  {getSolutions().map((solution, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                        {index + 1}
                      </div>
                      {solution}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleResendEmail}
                  className="w-full bg-primary hover:bg-primary-1 text-white py-3 text-lg"
                  size="lg"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Renvoyer l'email de vérification
                </Button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={handleTryAgain}
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Réessayer
                  </Button>
                  
                  <Button 
                    onClick={() => router.push('/')}
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-100"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Retour à l'accueil
                  </Button>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 text-center">
                  <strong>Besoin d'aide ?</strong> Contactez notre support à 
                  <a href="mailto:support@facejob.ma" className="font-semibold underline ml-1">
                    support@facejob.ma
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VerificationErrorPage;