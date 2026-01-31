"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserIcon, PhoneIcon, EnvelopeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { checkContactAccess, consumeContactAccess } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface ContactAccessButtonProps {
  candidateId: string;
  candidateName: string;
  className?: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  name: string;
}

export default function ContactAccessButton({ 
  candidateId, 
  candidateName, 
  className = "" 
}: ContactAccessButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accessStatus, setAccessStatus] = useState<any>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [hasAccessed, setHasAccessed] = useState(false);

  const handleCheckAccess = async () => {
    setIsLoading(true);
    try {
      const result = await checkContactAccess(candidateId);
      setAccessStatus(result);
      
      if (!result.can_access) {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Erreur lors de la vérification de l\'accès');
      console.error('Error checking access:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsumeAccess = async () => {
    setIsLoading(true);
    try {
      const result = await consumeContactAccess(candidateId);
      setContactInfo(result.candidate_contact);
      setHasAccessed(true);
      toast.success('Accès aux coordonnées accordé');
      
      // Update access status
      setAccessStatus((prev: any) => ({
        ...prev,
        remaining_access: result.remaining_access
      }));
    } catch (error) {
      toast.error('Erreur lors de l\'accès aux coordonnées');
      console.error('Error consuming access:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
    if (!accessStatus && !hasAccessed) {
      handleCheckAccess();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`${className}`}
          onClick={handleOpenDialog}
        >
          <UserIcon className="h-4 w-4 mr-2" />
          Voir les coordonnées
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Coordonnées de {candidateName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Vérification en cours...</span>
            </div>
          )}
          
          {/* Access Status Display */}
          {accessStatus && !hasAccessed && !isLoading && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Statut de votre abonnement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Plan actuel:</span>
                  <Badge variant="secondary">{accessStatus.current_plan}</Badge>
                </div>
                
                {accessStatus.can_access ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Accès restants:</span>
                      <Badge variant="default">{accessStatus.remaining_access}</Badge>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800 mb-3">
                        ✅ Vous pouvez accéder aux coordonnées de ce candidat
                      </p>
                      <Button 
                        onClick={handleConsumeAccess}
                        disabled={isLoading}
                        className="w-full"
                      >
                        Accéder aux coordonnées
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-800 mb-2">
                          {accessStatus.message}
                        </p>
                        {accessStatus.requires_subscription && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setIsOpen(false);
                              // Redirect to services page
                              window.location.href = '/dashboard/entreprise/services';
                            }}
                          >
                            Voir les plans
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Contact Information Display */}
          {contactInfo && hasAccessed && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-700">
                  ✅ Coordonnées du candidat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <UserIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{contactInfo.name}</p>
                    <p className="text-xs text-gray-500">Nom complet</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{contactInfo.email}</p>
                    <p className="text-xs text-gray-500">Adresse email</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <PhoneIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{contactInfo.phone}</p>
                    <p className="text-xs text-gray-500">Numéro de téléphone</p>
                  </div>
                </div>
                
                {accessStatus && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      Accès restants: {accessStatus.remaining_access}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Information about the pricing model */}
          {!hasAccessed && !isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                💡 Comment ça marche ?
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Visualisation des CV vidéos: <strong>Illimitée</strong></li>
                <li>• Accès aux coordonnées: <strong>Selon votre pack</strong></li>
                <li>• Pack Pro: 10 contacts/mois</li>
                <li>• Pack Expert: 25 contacts/mois</li>
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}