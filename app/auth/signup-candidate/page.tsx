"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import SignupFormCandidate from "../../../components/auth/signup/SignupCandidat";
import NextStepSignupCandidat from "../../../components/auth/signup/NextStepSignupCandidat";
import Image from "next/image";
import NavBar from "../../../components/NavBar";

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

  return (
    <>
      <NavBar />
      <div className="flex flex-col md:flex-row items-center mt-8">
        {step === 1 && (
          <>
            <div className="w-full md:w-1/2 px-4">
              <SignupFormCandidate onNextStep={handleNextStep} />
            </div>
            <div className="w-full md:w-1/2 p-4">
              <Image
                src="/img4.jpg"
                className="rounded-3xl w-full md:w-2/5 md:-my-56 md:absolute"
                alt="image-signup"
                width={1000}
                height={1000}
              />
            </div>
          </>
        )}
        {step === 2 && (
          <div className="mx-auto w-full md:w-1/2 px-4">
            <NextStepSignupCandidat onSkip={handleSkip} />
          </div>
        )}
      </div>
    </>
  );
};

export default SignupCandidatPage;
