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
    if (userType === 'candidat') {
      return {
        gradient: 'from-indigo-600 via-purple-600 to-indigo-800',
        accent: 'indigo',
        buttonColor: 'bg-indigo-600 hover:bg-indigo-700',
        cardAccent: 'border-indigo-200 bg-indigo-50'
      };
    } else {
      return {
        gradient: 'from-green-600 via-emerald-600 to-green-800',
        accent: 'green',
        buttonColor: 'bg-green-600 hover:bg-green-700',
        cardAccent: 'border-green-200 bg-green-50'
      };
    }
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
    <div className="space-y-8">
      {/* Header with enhanced design */}
      <div className={`bg-gradient-to-r ${theme.gradient} rounded-2xl p-8 text-white shadow-xl`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <FiHeadphones className="text-2xl text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Support & Contact</h1>
                <p className={`text-${theme.accent}-100 mt-1`}>
                  {userType === 'candidat' 
                    ? "Nous sommes là pour vous accompagner dans votre recherche d'emploi"
                    : "Nous sommes là pour vous aider avec toutes vos questions de recrutement"
                  }
                </p>
              </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <FiPhone className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">24/7</p>
                    <p className={`text-xs text-${theme.accent}-100`}>Support</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                    <FiMail className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">Email</p>
                    <p className={`text-xs text-${theme.accent}-100`}>Rapide</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/30 flex items-center justify-center">
                    <FiUsers className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">1000+</p>
                    <p className={`text-xs text-${theme.accent}-100`}>Utilisateurs</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                    <FiCheckCircle className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">98%</p>
                    <p className={`text-xs text-${theme.accent}-100`}>Satisfaction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className={`${theme.cardAccent} rounded-t-lg`}>
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
                className={`w-full ${theme.buttonColor} text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2`}
              >
                <FiSend className="text-lg" />
                Envoyer le message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className={`${theme.cardAccent} rounded-t-lg`}>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <FiPhone className="text-xl" />
                Informations de contact
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={`h-12 w-12 rounded-lg bg-${theme.accent}-100 flex items-center justify-center`}>
                  <FiPhone className={`text-${theme.accent}-600 text-xl`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Téléphone</p>
                  <p className="text-gray-600">+212 8 08588918</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={`h-12 w-12 rounded-lg bg-${theme.accent}-100 flex items-center justify-center`}>
                  <FiMail className={`text-${theme.accent}-600 text-xl`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Email</p>
                  <p className="text-gray-600">contact@facejob.ma</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={`h-12 w-12 rounded-lg bg-${theme.accent}-100 flex items-center justify-center`}>
                  <FiClock className={`text-${theme.accent}-600 text-xl`} />
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
      </div>

      {/* FAQ Section */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className={`${theme.cardAccent} rounded-t-lg`}>
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
                  <FiFileText className={`text-${theme.accent}-600`} />
                  {item.question}
                </h3>
                <p className="text-gray-600 ml-6">{item.answer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className={`bg-gradient-to-r ${theme.gradient} rounded-2xl p-8 text-center text-white shadow-xl`}>
        <h2 className="text-2xl font-bold mb-4">
          {userType === 'candidat' 
            ? "Besoin d'aide pour votre recherche d'emploi ?"
            : "Besoin d'aide pour vos recrutements ?"
          }
        </h2>
        <p className={`text-${theme.accent}-100 mb-6 max-w-2xl mx-auto`}>
          {userType === 'candidat'
            ? "Notre équipe d'experts est là pour vous accompagner dans chaque étape de votre parcours professionnel."
            : "Notre équipe d'experts est là pour vous accompagner dans vos processus de recrutement et vous aider à trouver les meilleurs talents."
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="bg-white text-gray-800 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg transition-all duration-200"
            onClick={() => window.location.href = 'tel:+212808588918'}
          >
            <FiPhone className="mr-2" />
            Nous appeler
          </Button>
          <Button 
            className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 font-semibold px-8 py-3 rounded-lg transition-all duration-200 border border-white/30"
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