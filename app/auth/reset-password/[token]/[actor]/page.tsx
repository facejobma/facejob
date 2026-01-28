import ModernResetPassword from "@/components/auth/ModernResetPassword";
import ModernAuthLayout from "@/components/auth/ModernAuthLayout";

const ResetPasswordPage = () => {
  return (
    <ModernAuthLayout
      title="Sécurisez votre compte"
      subtitle="Créez un nouveau mot de passe fort pour protéger votre compte"
      backgroundImage="/images/photo-login.jpg"
    >
      <ModernResetPassword />
    </ModernAuthLayout>
  );
};

export default ResetPasswordPage;
