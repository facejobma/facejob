"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import ModernSignupEntreprise from "../../../components/auth/signup/ModernSignupEntreprise";
import NextStepSignupEntreprise from "../../../components/auth/signup/NextStepSignupEntreprise";
import ModernAuthLayout from "../../../components/auth/ModernAuthLayout";

const SignupEntreprisePage = () => {
  const [step, setStep] = useState(1);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const authToken = Cookies.get("authToken");
    const userRole = typeof window !== "undefined" ? sessionStorage.getItem("userRole") : null;
    
    if (authToken && userRole) {
      // Redirect to appropriate dashboard based on user role
      if (userRole === "candidat") {
        router.push("/dashboard/candidat");
      } else if (userRole === "entreprise") {
        router.push("/dashboard/entreprise");
      }
      return;
    }

    const userId =
      typeof window !== "undefined"
        ? window.sessionStorage?.getItem("userId") || ""
        : "";

    // If the userId already exists in session storage, skip to Step 2
    if (userId) {
      setStep(2);
    }
  }, [router]);

  const handleNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handleSkip = () => {
    setStep((prevStep) => prevStep + 1);
  };

  if (step === 2) {
    return (
      <ModernAuthLayout
        title="Complétez votre profil entreprise"
        subtitle="Ajoutez les détails de votre entreprise pour attirer les meilleurs talents"
        backgroundImage="/img6.jpg"
      >
        <NextStepSignupEntreprise onSkip={handleSkip} />
      </ModernAuthLayout>
    );
  }

  return (
    <ModernAuthLayout
      title="Trouvez vos futurs talents"
      subtitle="Rejoignez des centaines d'entreprises qui recrutent efficacement sur FaceJob"
      backgroundImage="/img6.jpg"
    >
      <ModernSignupEntreprise onNextStep={handleNextStep} />
    </ModernAuthLayout>
  );
};

export default SignupEntreprisePage;
