"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const VerifyEmailContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [userType, setUserType] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Lien de vérification invalide. Token ou email manquant.');
      return;
    }

    // Call the backend verification endpoint
    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email vérifié avec succès !');
          setUserType(data.user_type || '');
        } else {
          setStatus('error');
          setMessage(data.message || 'Erreur lors de la vérification de l\'email.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Erreur de connexion. Veuillez réessayer plus tard.');
      }
    };

    verifyEmail();
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

  const handleResendEmail = () => {
    router.push('/auth/resend-verification');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {status === 'loading' && (
                  <Loader2 className="h-16 w-16 text-primary animate-spin" />
                )}
                {status === 'success' && (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                )}
                {status === 'error' && (
                  <XCircle className="h-16 w-16 text-red-500" />
                )}
              </div>
              
              <CardTitle className="text-2xl font-bold">
                {status === 'loading' && 'Vérification en cours...'}
                {status === 'success' && 'Email vérifié !'}
                {status === 'error' && 'Erreur de vérification'}
              </CardTitle>
              
              <CardDescription className="text-gray-600 mt-2">
                {status === 'loading' && 'Nous vérifions votre adresse email...'}
                {status === 'success' && 'Votre adresse email a été confirmée avec succès.'}
                {status === 'error' && 'Une erreur s\'est produite lors de la vérification.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <p className="text-gray-700">
                {message}
              </p>

              {status === 'success' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Vous pouvez maintenant vous connecter à votre compte.
                  </p>
                  <Button 
                    onClick={handleContinue}
                    className="w-full bg-primary hover:bg-primary-1"
                  >
                    Se connecter
                  </Button>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-3">
                  <Button 
                    onClick={handleResendEmail}
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Renvoyer l'email de vérification
                  </Button>
                  <Button 
                    onClick={() => router.push('/')}
                    variant="ghost"
                    className="w-full"
                  >
                    Retour à l'accueil
                  </Button>
                </div>
              )}

              {status === 'loading' && (
                <div className="text-sm text-gray-500">
                  Veuillez patienter...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const VerifyEmailPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <NavBar />
      
      <Suspense fallback={
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Vérification en cours...</p>
          </div>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
};

export default VerifyEmailPage;