"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { Mail, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { resendVerification } from '@/lib/api';

const ResendVerificationPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'candidat' | 'entreprise'>('candidat');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Veuillez entrer votre adresse email');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }

    setIsLoading(true);

    try {
      await resendVerification(email.trim(), userType);
      setEmailSent(true);
      toast.success('Email de vérification envoyé !');
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <NavBar />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <Mail className="h-16 w-16 text-green-500" />
                </div>
                
                <CardTitle className="text-2xl font-bold text-green-600">
                  Email envoyé !
                </CardTitle>
                
                <CardDescription className="text-gray-600 mt-2">
                  Un nouveau lien de vérification a été envoyé à votre adresse email.
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    <strong>Email envoyé à :</strong><br />
                    {email}
                  </p>
                </div>

                <div className="text-sm text-gray-600 space-y-2">
                  <p>Vérifiez votre boîte de réception et cliquez sur le lien de vérification.</p>
                  <p>N'oubliez pas de vérifier vos spams si vous ne recevez pas l'email.</p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Renvoyer à une autre adresse
                  </Button>
                  
                  <Button 
                    onClick={() => router.push('/')}
                    variant="ghost"
                    className="w-full"
                  >
                    Retour à l'accueil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <NavBar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                className="absolute top-4 left-4 p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="mx-auto mb-4">
                <Mail className="h-16 w-16 text-primary" />
              </div>
              
              <CardTitle className="text-2xl font-bold">
                Renvoyer l'email de vérification
              </CardTitle>
              
              <CardDescription className="text-gray-600 mt-2">
                Entrez votre adresse email pour recevoir un nouveau lien de vérification.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-2">
                    Type de compte
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setUserType('candidat')}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        userType === 'candidat'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold">Candidat</div>
                        <div className="text-xs text-gray-600">Chercheur d'emploi</div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setUserType('entreprise')}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        userType === 'entreprise'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold">Entreprise</div>
                        <div className="text-xs text-gray-600">Recruteur</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full"
                    required
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary-1"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Renvoyer l'email
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Vous vous souvenez de votre mot de passe ?{' '}
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="text-primary hover:text-primary-1 font-medium"
                  >
                    Se connecter
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResendVerificationPage;