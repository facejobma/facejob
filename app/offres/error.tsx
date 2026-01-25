'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Offers page error:', error);
  }, [error]);

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Oups ! Une erreur s'est produite
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600">
                Nous rencontrons des difficultés pour charger les offres d'emploi. 
                Cela peut être temporaire.
              </p>
              
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-sm text-gray-700 font-mono">
                  {error.message || 'Erreur inconnue'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={reset}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
                
                <Link href="/">
                  <Button variant="outline">
                    <Home className="h-4 w-4 mr-2" />
                    Retour à l'accueil
                  </Button>
                </Link>
              </div>

              <div className="text-sm text-gray-500">
                <p>Si le problème persiste, veuillez nous contacter :</p>
                <Link 
                  href="/contact" 
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Page de contact
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}