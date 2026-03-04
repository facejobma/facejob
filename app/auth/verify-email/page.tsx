"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { verifyEmail } from '@/lib/api';

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
    const verifyEmailAsync = async () => {
      try {
        const data = await verifyEmail(token, email);
        setStatus('success');
        setMessage(data.message || 'Email vérifié avec succès !');
        setUserType(data.user_type || '');
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Erreur lors de la vérification de l\'email.');
      }
    };

    verifyEmailAsync();
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl border-gray-200">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {status === 'loading' && (
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                )}
                {status === 'success' && (
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                )}
                {status === 'error' && (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                )}
              </div>
              
              <CardTitle className="text-2xl font-bold text-secondary">
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
                    className="w-full bg-primary hover:bg-primary-1 text-white"
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
                    className="w-full hover:bg-gray-100"
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
    <>
      <NavBar />
      
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 pt-24 pb-16">
            <div className="max-w-md mx-auto text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <p className="mt-4 text-gray-600">Vérification en cours...</p>
            </div>
          </div>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </>
  );
};

export default VerifyEmailPage;