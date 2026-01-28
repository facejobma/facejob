"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const VerificationSuccessPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [userType, setUserType] = useState<string>('');

  useEffect(() => {
    const type = searchParams.get('user_type');
    setUserType(type || '');
  }, [searchParams]);

  const handleContinue = () => {
    if (userType === 'candidat') {
      router.push('/auth/login-candidate');
    } else if (userType === 'entreprise') {
      router.push('/auth/login-enterprise');
    } else {
      router.push('/auth/login');
    }
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'candidat':
        return 'candidat';
      case 'entreprise':
        return 'entreprise';
      default:
        return 'utilisateur';
    }
  };

  const getNextSteps = () => {
    if (userType === 'candidat') {
      return [
        'Créer votre profil professionnel complet',
        'Postuler aux offres d\'emploi',
        'Recevoir des notifications d\'opportunités',
        'Accéder à votre tableau de bord personnel'
      ];
    } else if (userType === 'entreprise') {
      return [
        'Publier vos offres d\'emploi',
        'Consulter les profils des candidats',
        'Gérer vos recrutements',
        'Accéder à votre tableau de bord entreprise'
      ];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <NavBar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
              <div className="mx-auto mb-4">
                <CheckCircle className="h-20 w-20 text-white" />
              </div>
              
              <CardTitle className="text-3xl font-bold mb-2">
                Email vérifié avec succès !
              </CardTitle>
              
              <CardDescription className="text-green-100 text-lg">
                Félicitations ! Votre compte {getUserTypeLabel()} est maintenant activé.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Bienvenue sur FaceJob !
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Votre adresse email a été confirmée avec succès. Vous pouvez maintenant 
                  profiter de toutes les fonctionnalités de notre plateforme.
                </p>
              </div>

              {getNextSteps().length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Prochaines étapes :
                  </h4>
                  <ul className="space-y-3">
                    {getNextSteps().map((step, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1}
                        </div>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-4">
                <Button 
                  onClick={handleContinue}
                  className="w-full bg-primary hover:bg-primary-1 text-white py-3 text-lg"
                  size="lg"
                >
                  Se connecter maintenant
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                
                <div className="text-center">
                  <Button 
                    onClick={() => router.push('/')}
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Retour à l'accueil
                  </Button>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 text-center">
                  <strong>Astuce :</strong> Ajoutez support@facejob.ma à vos contacts 
                  pour ne pas manquer nos notifications importantes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VerificationSuccessPage;