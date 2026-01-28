"use client";
import { useParams } from "next/navigation";
import ModernForgetPassword from "../../../../components/auth/forgetPassword/ModernForgetPassword";
import ModernAuthLayout from "../../../../components/auth/ModernAuthLayout";

const ForgetPasswordForm = () => {
  const params = useParams();
  let { actor } = params;

  // si actor === "candidate", on le remplace par "candidat"
  if (actor === "candidate") {
    actor = "candidat";
  }
  
  // si actor === "enterprise", on le remplace par "entreprise"
  if (actor === "enterprise") {
    actor = "entreprise";
  }

  const actorString = Array.isArray(actor) ? actor[0] : actor || "candidat";

  return (
    <ModernAuthLayout
      title="Récupérez votre compte"
      subtitle="Nous vous aiderons à retrouver l'accès à votre compte en quelques étapes simples"
      backgroundImage="/images/photo-login.jpg"
    >
      <ModernForgetPassword actor={actorString} />
    </ModernAuthLayout>
  );
};

export default ForgetPasswordForm;