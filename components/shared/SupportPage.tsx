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
  FiFileText,
  FiHeadphones,
  FiUsers,
  FiCheckCircle
} from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SupportPageProps {
  userType: 'candidat' | 'entreprise';
}

const SupportPage: React.FC<SupportPageProps> = ({ userType }) => {
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
    // You can add API call here to submit the form
  };

  // Dynamic content based on user type
  const getThemeColors = () => {
    return {
      accent: 'green',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      cardAccent: 'border-green-200 bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    };
  };

  const theme = getThemeColors();

  const getFAQItems = () => {
    if (userType === 'candidat') {
      return [
        {
          question: "Comment puis-je mettre à jour mon profil ?",
          answer: "Vous pouvez mettre à jour votre profil en accédant à la section 'Profil' depuis le menu principal. Cliquez sur 'Modifier' pour changer vos informations personnelles, compétences et expériences."
        },
        {
          question: "Comment postuler à une offre d'emploi ?",
          answer: "Pour postuler à une offre, rendez-vous dans la section 'Offres d'emploi', sélectionnez l'offre qui vous intéresse et cliquez sur 'Postuler'. Vous pourrez ensuite créer votre CV vidéo personnalisé."
        },
        {
          question: "Comment créer un CV vidéo ?",
          answer: "Allez dans 'Créer mes CV vidéos', suivez les étapes guidées pour enregistrer votre présentation vidéo, ajoutez vos informations professionnelles et personnalisez votre profil."
        },
        {
          question: "Puis-je modifier mon CV vidéo après l'avoir créé ?",
          answer: "Oui, vous pouvez modifier votre CV vidéo à tout moment depuis votre tableau de bord. Cliquez sur 'Ma liste des vidéos' puis sur 'Modifier' pour la vidéo concernée."
        },
        {
          question: "Comment suivre mes candidatures ?",
          answer: "Toutes vos candidatures sont visibles dans votre tableau de bord principal. Vous recevrez également des notifications par email pour les mises à jour importantes."
        }
      ];
    } else {
      return [
        {
          question: "Comment publier une offre d'emploi ?",
          answer: "Cliquez sur 'Publier une offre' dans le menu principal, remplissez les détails du poste (titre, description, compétences requises, salaire) et publiez votre offre."
        },
        {
          question: "Comment consulter les candidatures reçues ?",
          answer: "Rendez-vous dans la section 'Candidats' pour voir tous les profils qui ont postulé à vos offres. Vous pouvez filtrer par offre et consulter les CV vidéos."
        },
        {
          question: "Comment gérer mes offres d'emploi ?",
          answer: "Dans 'Mes Offres d'emploi', vous pouvez voir toutes vos offres actives, les modifier, les désactiver ou voir les statistiques de candidatures."
        },
        {
          question: "Qu'est-ce que la consommation de CV ?",
          answer: "Chaque fois que vous consultez le profil complet d'un candidat, cela compte comme une consommation de CV. Vous pouvez voir votre historique dans 'CV Consultés'."
        },
        {
          question: "Comment mettre à niveau mon plan ?",
          answer: "Allez dans 'Services' pour voir les différents plans disponibles et choisir celui qui correspond le mieux à vos besoins de recrutement."
        }
      ];
    }
  };

  const faqItems = getFAQItems();

  return (
    <div className="space-y-6">
      {/* Simple Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`h-10 w-10 rounded-lg ${theme.iconBg} flex items-center justify-center`}>
            <FiHeadphones className={`${theme.iconColor} text-xl`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support & Contact</h1>
            <p className="text-gray-600">
              {userType === 'candidat' 
                ? "Nous sommes là pour vous accompagner dans votre recherche d'emploi"
                : "Nous sommes là pour vous aider avec toutes vos questions de recrutement"
              }
            </p>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`${theme.cardAccent} border-2 border-green-200 rounded-lg p-4`}>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${theme.iconBg} flex items-center justify-center`}>
                <FiPhone className={`${theme.iconColor}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">24/7</p>
                <p className="text-xs text-gray-600">Support</p>
              </div>
            </div>
          </div>
          
          <div className={`${theme.cardAccent} border-2 border-green-200 rounded-lg p-4`}>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${theme.iconBg} flex items-center justify-center`}>
                <FiMail className={`${theme.iconColor}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">Email</p>
                <p className="text-xs text-gray-600">Rapide</p>
              </div>
            </div>
          </div>
          
          <div className={`${theme.cardAccent} border-2 border-green-200 rounded-lg p-4`}>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${theme.iconBg} flex items-center justify-center`}>
                <FiUsers className={`${theme.iconColor}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">1000+</p>
                <p className="text-xs text-gray-600">Utilisateurs</p>
              </div>
            </div>
          </div>
          
          <div className={`${theme.cardAccent} border-2 border-green-200 rounded-lg p-4`}>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${theme.iconBg} flex items-center justify-center`}>
                <FiCheckCircle className={`${theme.iconColor}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">98%</p>
                <p className="text-xs text-gray-600">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Contact Form */}
        <Card className="border border-gray-200 bg-white rounded-lg h-full">
          <CardHeader className={`${theme.cardAccent} rounded-t-lg border-b border-gray-200`}>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <FiMessageCircle className="text-xl" />
              Contactez-nous
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Votre nom"
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="votre@email.com"
                    className="w-full"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet
                </label>
                <Input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Sujet de votre message"
                  className="w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre question ou problème..."
                  rows={5}
                  className="w-full"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className={`w-full ${theme.buttonColor} text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2`}
              >
                <FiSend className="text-lg" />
                Envoyer le message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border border-gray-200 bg-white rounded-lg h-full">
          <CardHeader className={`${theme.cardAccent} rounded-t-lg border-b border-gray-200`}>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <FiPhone className="text-xl" />
              Informations de contact
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className={`h-12 w-12 rounded-lg ${theme.iconBg} flex items-center justify-center`}>
                <FiPhone className={`${theme.iconColor} text-xl`} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Téléphone</p>
                <p className="text-gray-600">+212 8 08588918</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className={`h-12 w-12 rounded-lg ${theme.iconBg} flex items-center justify-center`}>
                <FiMail className={`${theme.iconColor} text-xl`} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Email</p>
                <p className="text-gray-600">contact@facejob.ma</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className={`h-12 w-12 rounded-lg ${theme.iconBg} flex items-center justify-center`}>
                <FiClock className={`${theme.iconColor} text-xl`} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Horaires</p>
                <p className="text-gray-600">Lun-Ven: 9h-18h</p>
                <p className="text-gray-600">Sam: 10h-16h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="border border-gray-200 bg-white rounded-lg">
        <CardHeader className={`${theme.cardAccent} rounded-t-lg border-b border-gray-200`}>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <FiHelpCircle className="text-xl" />
            Questions fréquemment posées
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <FiFileText className={`${theme.iconColor}`} />
                  {item.question}
                </h3>
                <p className="text-gray-600 ml-6">{item.answer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className={`${theme.cardAccent} border-2 border-green-200 rounded-lg p-6 text-center`}>
        <div className={`inline-flex h-12 w-12 rounded-lg ${theme.iconBg} items-center justify-center mb-4`}>
          <FiHeadphones className={`${theme.iconColor} text-xl`} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {userType === 'candidat' 
            ? "Besoin d'aide pour votre recherche d'emploi ?"
            : "Besoin d'aide pour vos recrutements ?"
          }
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          {userType === 'candidat'
            ? "Notre équipe d'experts est là pour vous accompagner dans chaque étape de votre parcours professionnel."
            : "Notre équipe d'experts est là pour vous accompagner dans vos processus de recrutement et vous aider à trouver les meilleurs talents."
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className={`${theme.buttonColor} text-white font-semibold px-8 py-3 rounded-lg transition-colors`}
            onClick={() => window.location.href = 'tel:+212808588918'}
          >
            <FiPhone className="mr-2" />
            Nous appeler
          </Button>
          <Button 
            className="bg-white text-gray-700 hover:bg-gray-50 font-semibold px-8 py-3 rounded-lg transition-colors border-2 border-gray-300"
            onClick={() => window.location.href = 'mailto:contact@facejob.ma'}
          >
            <FiMail className="mr-2" />
            Nous écrire
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;