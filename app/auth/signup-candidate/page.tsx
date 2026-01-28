"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import ModernSignupCandidate from "../../../components/auth/signup/ModernSignupCandidate";
import NextStepSignupCandidat from "../../../components/auth/signup/NextStepSignupCandidat";
import ModernAuthLayout from "../../../components/auth/ModernAuthLayout";

const SignupCandidatPage = () => {
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

    // If the userId already exists in session (means the user has created an account), skip to Step 2
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
        title="Complétez votre profil"
        subtitle="Ajoutez vos informations professionnelles pour maximiser vos chances"
        backgroundImage="/img4.jpg"
      >
        <NextStepSignupCandidat onSkip={handleSkip} />
      </ModernAuthLayout>
    );
  }

  return (
    <ModernAuthLayout
      title="Trouvez l'emploi de vos rêves"
      subtitle="Rejoignez des milliers de candidats qui ont trouvé leur opportunité sur FaceJob"
      backgroundImage="/img4.jpg"
    >
      <ModernSignupCandidate onNextStep={handleNextStep} />
    </ModernAuthLayout>
  );
};

export default SignupCandidatPage;
