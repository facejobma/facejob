"use client";
import ModernLoginForm from "../../../components/auth/login/ModernLoginForm";
import ModernAuthLayout from "../../../components/auth/ModernAuthLayout";

const LoginEntreprisePage = () => {
  // Note: No auth check here to avoid redirect loops
  // If user is already authenticated, ServerAuthGuard on protected routes will handle it
  
  return (
    <ModernAuthLayout
      title="Bienvenue sur FaceJob"
      subtitle="Connectez-vous pour accéder à votre espace entreprise et gérer vos recrutements"
      backgroundImage="/images/photo-login.jpg"
    >
      <ModernLoginForm loginFor="entreprise" />
    </ModernAuthLayout>
  );
};

export default LoginEntreprisePage;
