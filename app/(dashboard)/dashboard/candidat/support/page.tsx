"use client";

import React, { useState } from 'react';
import { 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiClock, 
  FiMessageCircle, 
  FiHelpCircle,
  FiSend,
  FiUser,
  FiFileText
} from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const SupportPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  const faqItems = [
    {
      question: "Comment puis-je mettre à jour mon profil ?",
      answer: "Vous pouvez mettre à jour votre profil en accédant à la section 'Paramètres' depuis le menu principal."
    },
    {
      question: "Comment postuler à une offre d'emploi ?",
      answer: "Parcourez les offres disponibles et cliquez sur 'Postuler' pour soumettre votre candidature."
    },
    {
      question: "Puis-je modifier ma vidéo CV après l'avoir téléchargée ?",
      answer: "Oui, vous pouvez remplacer votre vidéo CV à tout moment depuis votre tableau de bord."
    },
    {
      question: "Comment recevoir des notifications pour de nouvelles offres ?",
      answer: "Activez les notifications dans vos paramètres de compte pour être alerté des nouvelles opportunités."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <FiHelpCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Centre d'Aide</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Nous sommes là pour vous aider. Trouvez des réponses à vos questions ou contactez notre équipe de support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <FiPhone className="w-5 h-5" />
                  <span>Contactez-nous</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Phone */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FiPhone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Téléphone</h3>
                    <a 
                      href="tel:+212808588918" 
                      className="text-green-600 hover:text-green-700 font-medium hover:underline"
                    >
                      +212 8 08588918
                    </a>
                    <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200">Disponible 24/7</Badge>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiMail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <a 
                      href="mailto:contact@facejob.ma" 
                      className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                      contact@facejob.ma
                    </a>
                    <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200">Réponse sous 24h</Badge>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <FiClock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Heures d'ouverture</h3>
                    <p className="text-gray-600">Lun - Ven: 9h00 - 18h00</p>
                    <p className="text-gray-600">Sam: 9h00 - 13h00</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <FiMapPin className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Adresse</h3>
                    <p className="text-gray-600">Casablanca, Maroc</p>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Contact Form */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <FiSend className="w-5 h-5" />
                  <span>Envoyez-nous un Message</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Nom complet</label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Votre nom"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="votre@email.com"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sujet</label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Objet de votre message"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Message</label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Décrivez votre problème ou votre question en détail..."
                      rows={6}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    <FiSend className="w-4 h-4 mr-2" />
                    Envoyer le Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FiHelpCircle className="w-5 h-5 text-green-600" />
                  <span>Questions Fréquemment Posées</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-2">{item.question}</h3>
                      <Separator className="my-2" />
                      <p className="text-gray-600">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-green-600 to-green-700 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Besoin d'une Aide Immédiate ?</h2>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Notre équipe de support est disponible pour vous aider à résoudre vos problèmes rapidement et efficacement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+212808588918">
                <Button variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                  <FiPhone className="w-4 h-4 mr-2" />
                  Appeler Maintenant
                </Button>
              </a>
              <a href="mailto:contact@facejob.ma">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  <FiMail className="w-4 h-4 mr-2" />
                  Envoyer un Email
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SupportPage;
