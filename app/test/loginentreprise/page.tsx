"use client";
import ModernLoginForm from "../../../components/auth/login/ModernLoginForm";
import ModernAuthLayout from "../../../components/auth/ModernAuthLayout";

/**
 * Page de login entreprise secrète
 * Accessible uniquement via l'URL : /test/loginentreprise
 * 
 * Cette page permet aux entreprises de se connecter de manière discrète
 * sans passer par les liens publics de la page d'accueil.
 */
const SecretLoginEntreprisePage = () => {
  return (
    <ModernAuthLayout
      title="Espace Entreprise"
      subtitle="Connectez-vous pour accéder à votre espace entreprise et gérer vos recrutements"
      backgroundImage="/images/photo-login.jpg"
    >
      <ModernLoginForm loginFor="entreprise" />
    </ModernAuthLayout>
  );
};

export default SecretLoginEntreprisePage;
